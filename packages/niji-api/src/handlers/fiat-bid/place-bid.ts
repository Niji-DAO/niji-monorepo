/**
 * Fiat bid place-bid hono handler (Issue #3008 Phase B)
 *
 * POST /api/v1/fiat-bid/place-bid
 * request body — { authId }
 * 応答 body    — { authId, txHash, status: "bid-placed" | "cancelled", message }
 *
 * 処理順 —
 * (1) request body 検証 (authId)
 * (2) fiat_bid record を authId で lookup、 status = "3ds-verified" verify
 * (3) BidRelay.placeBid で bid tx broadcast (chain 上 auction ID 取得 + createBid 発火)
 * (4) 成功時 fiat_bid.status = "bid-placed" UPDATE + txHash 返却
 * (5) tx broadcast fail (BidRelayError) 時 GMO alterTran cancel + fiat_bid.status = "cancelled" UPDATE + user 通知 msg 返却
 *
 * error 変換 —
 * - request validation fail    → 400 InvalidRequest
 * - fiat_bid not found         → 404 NotFound
 * - fiat_bid.status ≠ 3ds-verified → 409 Conflict (idempotency 保護、 already bid-placed / cancelled 状態を弾く)
 * - BidRelayError (revert / RPC) → 200 OK で { status: "cancelled", message } (顧客不利防止で 200 応答 + GMO cancel 済)
 * - GMO cancel fail            → 500 GmoCancelFailed (与信枠残る、 operational alert 対象)
 * - unexpected error            → 500 InternalError
 *
 * SSOT — tests/spec/gmo-fiat-bid/Phase1-01-master-spec.md § P3-c, P6、
 *        Phase1-02-issue-breakdown.md § Issue 5、
 *        rules/quality.md § test-passed marker 発行前提
 */

import { Hono } from 'hono';

import { BidRelay, BidRelayError, type BidRevertReason } from '../../services/bidRelay/index.js';
import { GmoAuthorizationError, GmoClient } from '../../services/gmo/client.js';

/** request body shape (webapp が POST する) */
export type PlaceBidRequestBody = {
  authId: string;
};

/** 応答 body shape (公開 API 契約) */
export type PlaceBidResponseBody = {
  authId: string;
  status: 'bid-placed' | 'cancelled';
  txHash: string | null;
  message: string;
};

/** DB store 抽象 (Ponder DB を直接触らずに handler test 可能に) */
export type PlaceBidStore = {
  /**
   * fiat_bid record を authId で lookup、 無ければ null
   * status / ethAmount / accessPass を返す (bid 発火判定 + GMO cancel 用)
   */
  findVerified: (authId: string) => Promise<{
    authId: string;
    status: string;
    ethAmount: bigint;
    accessPass: string;
  } | null>;
  /**
   * status を "bid-placed" or "cancelled" に UPDATE
   * 冪等性 = 同 authId + 同 status で 2 度呼ばれても状態遷移 valid
   */
  updateStatus: (input: {
    authId: string;
    status: 'bid-placed' | 'cancelled';
    txHash?: string;
  }) => Promise<void>;
};

/** revert reason から user 通知 msg を生成 (webapp 表示用) */
export const messageForRevertReason = (reason: BidRevertReason): string => {
  switch (reason) {
    case 'BidTooLow':
      return '他の入札者に上乗せされました。 再入札は個別に行ってください。';
    case 'AuctionEnded':
      return 'auction は既に終了しています。';
    case 'GasPriceHigh':
      return 'network が混雑しています。 しばらく待って再試行してください。';
    case 'RpcError':
      return 'network 障害が発生しました。 しばらく待って再試行してください。';
    case 'Unknown':
    default:
      return 'bid tx の broadcast に失敗しました。 与信枠は自動的に cancel されました。';
  }
};

/**
 * request body の shape 検証
 * unknown value を受取り PlaceBidRequestBody に絞込 (or error message 返す)
 */
export const parsePlaceBidBody = (
  raw: unknown,
): { ok: true; value: PlaceBidRequestBody } | { ok: false; message: string } => {
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

export type CreatePlaceBidAppOptions = {
  bidRelay: BidRelay;
  gmoClient: GmoClient;
  store: PlaceBidStore;
};

/**
 * place-bid handler の Hono app を返す factory
 * options で BidRelay / GmoClient / DB store を DI、 test 時に mock 差替
 */
export const createPlaceBidApp = (options: CreatePlaceBidAppOptions): Hono => {
  const app = new Hono();

  app.post('/place-bid', async c => {
    let rawBody: unknown;
    try {
      rawBody = await c.req.json();
    } catch {
      return c.json({ error: 'InvalidRequest', message: 'request body must be valid JSON' }, 400);
    }

    const parsed = parsePlaceBidBody(rawBody);
    if (!parsed.ok) {
      return c.json({ error: 'InvalidRequest', message: parsed.message }, 400);
    }
    const body = parsed.value;

    // fiat_bid record lookup、 無ければ 404
    let record: Awaited<ReturnType<PlaceBidStore['findVerified']>>;
    try {
      record = await options.store.findVerified(body.authId);
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

    // status = "3ds-verified" 以外は 409 Conflict (idempotency 保護)
    if (record.status !== '3ds-verified') {
      return c.json(
        {
          error: 'Conflict',
          message: `fiat_bid status must be "3ds-verified" (actual: "${record.status}")`,
          actualStatus: record.status,
        },
        409,
      );
    }

    // bid tx broadcast 試行
    try {
      const result = await options.bidRelay.placeBid({ ethAmount: record.ethAmount });

      // 成功 — fiat_bid.status = "bid-placed" に UPDATE
      try {
        await options.store.updateStatus({
          authId: body.authId,
          status: 'bid-placed',
          txHash: result.txHash,
        });
      } catch (err) {
        // tx broadcast 済で DB write fail は operational alert 対象 (Phase 2 で監視 wire)
        return c.json(
          {
            error: 'InternalError',
            message: `fiat_bid status update failed after bid tx broadcast: ${err instanceof Error ? err.message : String(err)}`,
            txHash: result.txHash,
          },
          500,
        );
      }

      const response: PlaceBidResponseBody = {
        authId: body.authId,
        status: 'bid-placed',
        txHash: result.txHash,
        message: 'bid tx を broadcast しました。',
      };
      return c.json<PlaceBidResponseBody>(response, 200);
    } catch (err) {
      // bid tx broadcast fail — GMO cancel + fiat_bid.status = "cancelled" 遷移
      if (!(err instanceof BidRelayError)) {
        return c.json(
          {
            error: 'InternalError',
            message: err instanceof Error ? err.message : String(err),
          },
          500,
        );
      }

      const revertReason = err.reason;
      const userMessage = messageForRevertReason(revertReason);

      // 順序 — 先に DB 更新 (顧客保護、 fiat_bid は cancel 済で二度課金 / 二度 bid 発火防止)
      try {
        await options.store.updateStatus({ authId: body.authId, status: 'cancelled' });
      } catch (dbErr) {
        return c.json(
          {
            error: 'InternalError',
            message: `fiat_bid status update failed: ${dbErr instanceof Error ? dbErr.message : String(dbErr)}`,
          },
          500,
        );
      }

      // GMO alterTran cancel (与信枠解除)、 fail 時は 500 GmoCancelFailed で明示
      try {
        await options.gmoClient.cancelAuthorization({
          accessId: body.authId,
          accessPass: record.accessPass,
        });
      } catch (gmoErr) {
        if (gmoErr instanceof GmoAuthorizationError) {
          return c.json(
            {
              error: 'GmoCancelFailed',
              message: gmoErr.message,
              errCode: gmoErr.errCode ?? null,
              errInfo: gmoErr.errInfo ?? null,
              revertReason,
            },
            500,
          );
        }
        return c.json(
          {
            error: 'InternalError',
            message: gmoErr instanceof Error ? gmoErr.message : String(gmoErr),
          },
          500,
        );
      }

      // cancelled 遷移完了、 200 OK で user 通知 msg を返却 (webapp が modal 表示)
      const response: PlaceBidResponseBody = {
        authId: body.authId,
        status: 'cancelled',
        txHash: null,
        message: userMessage,
      };
      return c.json<PlaceBidResponseBody>(response, 200);
    }
  });

  return app;
};
