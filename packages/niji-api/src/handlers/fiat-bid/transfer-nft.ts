/**
 * Fiat bid transfer-nft hono handler (Issue #3010 Phase E)
 *
 * POST /api/v1/fiat-bid/transfer
 * request body — { authId }
 * 応答 body    — { authId, status: "transferred" | "transfer-failed", txHash, message }
 *
 * 処理順 —
 * (1) request body 検証 (authId)
 * (2) fiat_bid record を authId で lookup、 status = "captured" verify
 * (3) TransferRelay.transferNft で 運営 EOA から bidderWallet に NijiToken.transferFrom を発火
 * (4) 成功時 fiat_bid.status = "transferred" UPDATE + transferredAt 記録
 * (5) fail 時 fiat_bid.status = "transfer-failed" は Phase 1 schema 未対応、
 *     Phase 1 は fiat_bid.status = "captured" 継続 + 運営 alert (Phase 4 で retry queue 化)
 *     Phase 1 mock 環境では "transfer-failed" を独自 marker として応答のみに載せ、 DB は captured 継続
 *
 * error 変換 —
 * - request validation fail       → 400 InvalidRequest
 * - fiat_bid not found            → 404 NotFound
 * - fiat_bid.status ≠ captured    → 409 Conflict (idempotency)
 * - transferFrom broadcast fail   → 200 OK で { status: "transfer-failed", txHash: null } + 運営 alert
 * - DB update fail                → 500 InternalError
 *
 * SSOT — tests/spec/gmo-fiat-bid/Phase1-01-master-spec.md § P6, P7 (A' 案 = settle 後 transferFrom)、
 *        Phase1-02-issue-breakdown.md § Issue 7 Phase E,
 *        rules/quality.md § test-passed marker 発行前提
 */

import { Hono } from 'hono';

import { TransferRelay, TransferRelayError } from '../../services/settlement/index.js';

/** request body shape */
export type TransferNftRequestBody = {
  authId: string;
};

/** 応答 body shape */
export type TransferNftResponseBody = {
  authId: string;
  status: 'transferred' | 'transfer-failed';
  txHash: string | null;
  message: string;
};

/** DB store 抽象 */
export type TransferNftStore = {
  /**
   * fiat_bid record を authId で lookup、 無ければ null
   * status / bidderWallet / auctionId を返す (transferFrom 実行 + verify 用)
   */
  findCaptured: (authId: string) => Promise<{
    authId: string;
    status: string;
    bidderWallet: `0x${string}`;
    auctionId: bigint;
  } | null>;
  /**
   * status を "transferred" に UPDATE + transferredAt 記録
   */
  updateTransferStatus: (input: {
    authId: string;
    status: 'transferred';
    transferredAt: Date;
    txHash: `0x${string}`;
  }) => Promise<void>;
};

/**
 * request body の shape 検証
 */
export const parseTransferNftBody = (
  raw: unknown,
): { ok: true; value: TransferNftRequestBody } | { ok: false; message: string } => {
  if (raw === null || typeof raw !== 'object') {
    return { ok: false, message: 'request body must be a JSON object' };
  }
  const body = raw as Record<string, unknown>;
  const authId = body['authId'];
  if (typeof authId !== 'string' || authId.trim() === '') {
    return { ok: false, message: 'authId must be a non-empty string' };
  }
  return { ok: true, value: { authId } };
};

export type CreateTransferNftAppOptions = {
  transferRelay: TransferRelay;
  store: TransferNftStore;
  /** transferFrom 失敗時の運営 alert 出力先 (Phase 1 = console.error) */
  onTransferFail?: (input: { authId: string; bidderWallet: `0x${string}`; reason: string }) => void;
  /** transferredAt 時刻の source (test で固定値 inject) */
  now?: () => Date;
};

/**
 * transfer-nft handler の Hono app を返す factory
 */
export const createTransferNftApp = (options: CreateTransferNftAppOptions): Hono => {
  const app = new Hono();
  const now = options.now ?? (() => new Date());
  const onTransferFail =
    options.onTransferFail ??
    (input => {
      console.error('[transfer-failed]', {
        authId: input.authId,
        bidderWallet: input.bidderWallet,
        reason: input.reason,
      });
    });

  app.post('/transfer', async c => {
    let rawBody: unknown;
    try {
      rawBody = await c.req.json();
    } catch {
      return c.json({ error: 'InvalidRequest', message: 'request body must be valid JSON' }, 400);
    }

    const parsed = parseTransferNftBody(rawBody);
    if (!parsed.ok) {
      return c.json({ error: 'InvalidRequest', message: parsed.message }, 400);
    }
    const body = parsed.value;

    let record: Awaited<ReturnType<TransferNftStore['findCaptured']>>;
    try {
      record = await options.store.findCaptured(body.authId);
    } catch (err) {
      return c.json(
        {
          error: 'InternalError',
          message: `fiat_bid lookup failed: ${err instanceof Error ? err.message : String(err)}`,
        },
        500,
      );
    }
    if (record === null) {
      return c.json(
        {
          error: 'NotFound',
          message: `fiat_bid record not found for authId=${body.authId}`,
        },
        404,
      );
    }

    if (record.status !== 'captured') {
      return c.json(
        {
          error: 'Conflict',
          message: `fiat_bid status must be "captured" (actual: "${record.status}")`,
          actualStatus: record.status,
        },
        409,
      );
    }

    // transferFrom 発火
    let txHash: `0x${string}`;
    try {
      const result = await options.transferRelay.transferNft({
        to: record.bidderWallet,
        nounId: record.auctionId,
      });
      txHash = result.txHash;
    } catch (err) {
      const reason = err instanceof TransferRelayError ? err.reason : 'Unknown';
      onTransferFail({
        authId: record.authId,
        bidderWallet: record.bidderWallet,
        reason,
      });
      const response: TransferNftResponseBody = {
        authId: record.authId,
        status: 'transfer-failed',
        txHash: null,
        message: 'NFT 転送に失敗しました。 運営から個別にご連絡します。',
      };
      return c.json<TransferNftResponseBody>(response, 200);
    }

    // 成功 — fiat_bid.status = "transferred" + transferredAt UPDATE
    try {
      await options.store.updateTransferStatus({
        authId: record.authId,
        status: 'transferred',
        transferredAt: now(),
        txHash,
      });
    } catch (err) {
      // tx broadcast 済で DB fail は operational alert (Phase 4 で監視 wire)
      return c.json(
        {
          error: 'InternalError',
          message: `fiat_bid status update failed after transfer tx broadcast: ${err instanceof Error ? err.message : String(err)}`,
          txHash,
        },
        500,
      );
    }

    const response: TransferNftResponseBody = {
      authId: record.authId,
      status: 'transferred',
      txHash,
      message: 'NFT を送付しました。',
    };
    return c.json<TransferNftResponseBody>(response, 200);
  });

  return app;
};
