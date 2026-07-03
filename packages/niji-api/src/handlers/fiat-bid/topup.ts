/**
 * Fiat bid topup hono handler (Issue #3023 Phase 2 = Phase A-D 5 phase sequential、 Issue #3051 で ETH primary に反転)
 *
 * POST /api/v1/fiat-bid/topup
 * request body — { authId (既存 auth), newEthAmount, newSpotRate, newJpyAmount, cardToken }
 *                (Issue #3051 以降、 newEthAmount = wei 文字列 primary、 newSpotRate = 換算根拠、 newJpyAmount = 換算値)
 * 応答 body    — { authId: newAuthId, oldAuthId, txHash, status: "bid-placed" | "cancelled",
 *                  jpyAmount, ethAmount, spotRate, spotRateSource, message }
 *
 * 処理順 (grilling P3-b A 案 = 5 phase sequential + 非同期 cleanup) —
 * (Phase A) request body 検証 + fiat_bid record verify (status = "bid-placed" + 増額額 + 100 万円上限)
 * (Phase B) spot rate 取得 + JPY→ETH wei 換算 + GMO 新 authorize (entryTran + execTran) + 新 authId 取得
 * (Phase C) BidRelay.placeBid で chain bid tx broadcast (Issue #3008 の service 再利用)
 * (Phase D) 旧 authId を AuthCleanupQueue.enqueue (5 秒 delay + rate limit + retry、 Issue #3022 依存)
 * (Phase E) fiat_bid record を新 authId に UPDATE + jpyAmount / ethAmount / spotRate 更新
 *
 * error 変換 —
 * - request validation fail (欠損 / 型不正)             → 400 InvalidRequest
 * - fiat_bid not found                                    → 404 NotFound
 * - fiat_bid.status ≠ bid-placed                         → 409 Conflict (bid 済でないと増額不可)
 * - newJpyAmount ≤ oldJpyAmount                          → 400 InvalidRequest (増額のみ受付)
 * - newJpyAmount > 100 万円                              → 400 BidLimitExceeded
 * - spot rate fetch fail                                  → 503 SpotRateUnavailable
 * - GMO authorize fail                                    → 500 GmoAuthorizationFailed
 * - BidRelayError (revert / RPC)                         → 200 OK で { status: "cancelled" } (新 auth cancel + user 通知)
 * - unexpected error                                      → 500 InternalError
 *
 * 設計判断 (grilling P3-b A 案) —
 * (a) chain tx 発火の critical path から旧 auth cleanup を切り離す (increase user 待機短縮)
 * (b) 旧 auth は tx confirm 後 5 秒 delay で AuthCleanupQueue enqueue (途中 revert 時に旧 auth を保持)
 * (c) BidRelay.placeBid interface 拡張なし (Issue #3008 の設計を再利用、 重複 code 排除)
 * (d) 新 auth 取得後の bid revert 時は新 auth を GMO cancel、 旧 auth は保持 (増額前状態に戻す)
 *
 * SSOT — tests/spec/gmo-fiat-bid/Phase2-01-master-spec.md § 5 phase sequential、
 *        Phase2-02-issue-breakdown.md § Issue P2-2、
 *        rules/quality.md § test-passed marker 発行前提
 */

import { Hono } from 'hono';

import { BidRelay, BidRelayError } from '../../services/bidRelay/index.js';
import { GmoAuthorizationError, GmoClient } from '../../services/gmo/client.js';
import {
  SpotRateFetcher,
  SpotRateFetchError,
  type SpotRate,
} from '../../services/spotRate/index.js';

import { messageForRevertReason } from './place-bid.js';

/** bid 上限 100 万円 (Phase 1 の BID_LIMIT_JPY と一致、 grilling P2 確定) */
export const BID_LIMIT_JPY = 1_000_000;

/** request body shape (webapp が POST する、 Issue #3051 で ETH primary + spotRate + jpyAmount の 3 値受信) */
export type TopupRequestBody = {
  authId: string;
  /** 新 ETH 額 wei (bigint 文字列、 primary 契約軸、 Issue #3051 で追加) */
  newEthAmount: string;
  /** 新 spot rate (JPY/ETH、 換算根拠、 audit 用、 Issue #3051 で追加) */
  newSpotRate: number;
  /** 新 JPY 額 (webapp 側で newEthAmount × newSpotRate 丸め、 100 万円上限判定 + GMO 請求額) */
  newJpyAmount: number;
  cardToken: string;
};

/** 応答 body shape (公開 API 契約) */
export type TopupResponseBody = {
  /** 新 authId (増額後の GMO 与信枠 ID) */
  authId: string;
  /** 旧 authId (async cleanup queue に enqueue 済、 参照用) */
  oldAuthId: string;
  /** bid tx hash (成功時)、 revert 時 null */
  txHash: string | null;
  /** 遷移後 status */
  status: 'bid-placed' | 'cancelled';
  /** 新 JPY 額 (増額後) */
  jpyAmount: number;
  /** 新 ETH 額 wei (増額後、 文字列) */
  ethAmount: string;
  /** 新 spot rate */
  spotRate: number;
  /** spot rate 取得元 */
  spotRateSource: SpotRate['source'];
  /** user 通知 msg */
  message: string;
};

/**
 * DB store 抽象 (Ponder DB を直接触らずに handler test 可能に)
 *
 * findBidPlaced — 旧 authId で fiat_bid record を lookup、 status = "bid-placed" verify + amount 比較 + accessPass 取得
 * updateToNewAuth — 新 authId + 新 jpyAmount / ethAmount / spotRate に UPDATE (旧 record の primary key 変更 = 新 record insert + 旧 delete or authId column 更新)
 * cancelToOldState — 新 auth 発行後の revert 時に旧 record を復元 (現状は new record insert 経路のため rollback = 新 record delete)
 */
export type TopupStore = {
  /** 旧 authId で fiat_bid record を lookup、 無ければ null */
  findBidPlaced: (authId: string) => Promise<{
    authId: string;
    status: string;
    jpyAmount: number;
    ethAmount: bigint;
    bidderWallet: `0x${string}`;
    bidderEmail: string | null;
    auctionId: bigint;
    accessPass: string;
    createdAt: Date;
  } | null>;
  /**
   * 旧 authId を新 authId に置換 + jpyAmount / ethAmount / spotRate 更新
   * 実装 — 旧 record delete + 新 record insert (auth ID 変更のため PK 更新扱い、 auditing の観点で create 経路を使う)
   * or 新 record insert のみ (旧 record 保持で orphan だが AuthCleanupQueue が 5 秒後 GMO VOID で status 別管理)
   *
   * Phase 2 mvp = 旧 record を新 authId に UPDATE (PK 更新なので DB engine 側で pk 制約遵守、 実装は SQL 「UPDATE fiat_bid SET authId=$new, jpyAmount=$..., ... WHERE authId=$old」)
   */
  updateToNewAuth: (input: {
    oldAuthId: string;
    newAuthId: string;
    newJpyAmount: number;
    newEthAmount: bigint;
    spotRate: number;
    spotRateSource: SpotRate['source'];
  }) => Promise<void>;
};

/**
 * revert reason から user 通知 msg を生成 (webapp 表示用)
 *
 * topup 経路と place-bid 経路で完全に同じ user 通知 msg を返すため、
 * place-bid の messageForRevertReason を re-export する (SSOT を place-bid.ts に一本化、 code 重複排除)。
 */
export const messageForTopupRevertReason = messageForRevertReason;

/**
 * request body の shape 検証 (Issue #3051 で ETH primary + spotRate + jpyAmount の 3 値対応)
 * unknown value を受取り TopupRequestBody に絞込 (or error message 返す)
 */
export const parseTopupBody = (
  raw: unknown,
): { ok: true; value: TopupRequestBody } | { ok: false; message: string } => {
  if (raw === null || typeof raw !== 'object') {
    return { ok: false, message: 'request body must be a JSON object' };
  }
  const body = raw as Record<string, unknown>;

  const authId = body['authId'];
  if (typeof authId !== 'string' || authId.trim() === '') {
    return { ok: false, message: 'authId must be a non-empty string' };
  }

  const newEthAmountRaw = body['newEthAmount'];
  if (
    typeof newEthAmountRaw !== 'string' ||
    newEthAmountRaw.trim() === '' ||
    !/^\d+$/.test(newEthAmountRaw)
  ) {
    return { ok: false, message: 'newEthAmount must be a positive bigint string (wei)' };
  }
  const newEthAmountWei = BigInt(newEthAmountRaw);
  if (newEthAmountWei <= 0n) {
    return { ok: false, message: 'newEthAmount must be a positive bigint string (wei)' };
  }

  const newSpotRate = body['newSpotRate'];
  if (typeof newSpotRate !== 'number' || !Number.isFinite(newSpotRate) || newSpotRate <= 0) {
    return { ok: false, message: 'newSpotRate must be a positive number (JPY per ETH)' };
  }

  const newJpyAmount = body['newJpyAmount'];
  if (typeof newJpyAmount !== 'number' || !Number.isInteger(newJpyAmount) || newJpyAmount <= 0) {
    return { ok: false, message: 'newJpyAmount must be a positive integer' };
  }

  const cardToken = body['cardToken'];
  if (typeof cardToken !== 'string' || cardToken.trim() === '') {
    return { ok: false, message: 'cardToken must be a non-empty string' };
  }

  return {
    ok: true,
    value: { authId, newEthAmount: newEthAmountRaw, newSpotRate, newJpyAmount, cardToken },
  };
};

/** AuthCleanupQueue の enqueue 抽象 (handler が具象 class を知らずに Enqueue できる) */
export type CleanupQueue = {
  enqueue: (authId: string) => void;
};

export type CreateTopupAppOptions = {
  bidRelay: BidRelay;
  gmoClient: GmoClient;
  spotRateFetcher: SpotRateFetcher;
  cleanupQueue: CleanupQueue;
  store: TopupStore;
  /** orderId 生成 (test 用に決定的、 default = topup-{oldAuthId}-{ts}) */
  generateOrderId?: (input: { oldAuthId: string; newJpyAmount: number }) => string;
};

const defaultGenerateOrderId = (input: { oldAuthId: string; newJpyAmount: number }): string => {
  const ts = Date.now().toString(36);
  const rand = Math.floor(Math.random() * 1e6)
    .toString(36)
    .padStart(4, '0');
  // oldAuthId 先頭 12 文字 + timestamp + rand で衝突しにくく作る
  const shortOld = input.oldAuthId.slice(0, 12);
  return `topup-${shortOld}-${input.newJpyAmount}-${ts}-${rand}`;
};

/**
 * topup handler の Hono app を返す factory
 * options で BidRelay / GmoClient / SpotRateFetcher / AuthCleanupQueue / TopupStore を DI、 test 時 mock 差替
 */
export const createTopupApp = (options: CreateTopupAppOptions): Hono => {
  const app = new Hono();
  const generateOrderId = options.generateOrderId ?? defaultGenerateOrderId;

  app.post('/topup', async c => {
    // ---- Phase A: request body 検証 + fiat_bid record verify ----
    let rawBody: unknown;
    try {
      rawBody = await c.req.json();
    } catch {
      return c.json({ error: 'InvalidRequest', message: 'request body must be valid JSON' }, 400);
    }

    const parsed = parseTopupBody(rawBody);
    if (!parsed.ok) {
      return c.json({ error: 'InvalidRequest', message: parsed.message }, 400);
    }
    const body = parsed.value;

    // 新 JPY 額の 100 万円上限 check (合計額 = 旧 + 増額差分 = 新 JPY 額と同義)
    if (body.newJpyAmount > BID_LIMIT_JPY) {
      return c.json(
        {
          error: 'BidLimitExceeded',
          message: `newJpyAmount ${body.newJpyAmount} exceeds bid limit ${BID_LIMIT_JPY}`,
        },
        400,
      );
    }

    // fiat_bid record lookup、 無ければ 404
    let record: Awaited<ReturnType<TopupStore['findBidPlaced']>>;
    try {
      record = await options.store.findBidPlaced(body.authId);
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

    // status = "bid-placed" 以外は 409 Conflict (bid 済でないと増額不可)
    if (record.status !== 'bid-placed') {
      return c.json(
        {
          error: 'Conflict',
          message: `fiat_bid status must be "bid-placed" (actual: "${record.status}")`,
          actualStatus: record.status,
        },
        409,
      );
    }

    // 増額額 validation (増額のみ受付、 newJpyAmount > oldJpyAmount)
    if (body.newJpyAmount <= record.jpyAmount) {
      return c.json(
        {
          error: 'InvalidRequest',
          message: `newJpyAmount (${body.newJpyAmount}) must be greater than current jpyAmount (${record.jpyAmount})`,
        },
        400,
      );
    }

    // ---- Phase B: spot rate 取得 + JPY→ETH wei 換算 + GMO 新 authorize ----
    let spotRate: SpotRate;
    try {
      spotRate = await options.spotRateFetcher.getEthJpyRate();
    } catch (err) {
      if (err instanceof SpotRateFetchError) {
        return c.json({ error: 'SpotRateUnavailable', message: err.message }, 503);
      }
      return c.json(
        {
          error: 'InternalError',
          message: err instanceof Error ? err.message : String(err),
        },
        500,
      );
    }

    // 新 ETH wei = webapp 提示値を primary で採用 (Issue #3051、 入力軸 ETH 反転)
    // backend 側 spot rate 取得は GMO 与信枠請求額の JPY 換算根拠と record 保存の spotRate 値のため保持
    const newEthWei = BigInt(body.newEthAmount);

    // orderId 生成 (新 authId 発行用、 GMO 側で order 一意)
    const orderId = generateOrderId({
      oldAuthId: body.authId,
      newJpyAmount: body.newJpyAmount,
    });

    // GMO 新 authorize (entryTran + execTran)、 新 authId + accessPass 取得
    let newAuthResult;
    try {
      newAuthResult = await options.gmoClient.authorize({
        orderId,
        amount: body.newJpyAmount,
        cardToken: body.cardToken,
      });
    } catch (err) {
      if (err instanceof GmoAuthorizationError) {
        return c.json(
          {
            error: 'GmoAuthorizationFailed',
            message: err.message,
            errCode: err.errCode ?? null,
            errInfo: err.errInfo ?? null,
          },
          500,
        );
      }
      return c.json(
        {
          error: 'InternalError',
          message: err instanceof Error ? err.message : String(err),
        },
        500,
      );
    }

    // ---- Phase C: BidRelay.placeBid で chain bid tx broadcast ----
    let bidResult;
    try {
      bidResult = await options.bidRelay.placeBid({ ethAmount: newEthWei });
    } catch (err) {
      // bid tx broadcast fail — 新 auth を GMO cancel、 旧 auth は保持 (増額前状態に戻す)
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
      const userMessage = messageForTopupRevertReason(revertReason);

      // 新 auth を GMO alterTran(VOID) で cancel、 fail 時は 500 GmoCancelFailed
      try {
        await options.gmoClient.cancelAuthorization({
          accessId: newAuthResult.authId,
          accessPass: newAuthResult.accessPass,
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

      // 旧 auth は保持 (増額前状態のまま bid-placed で継続)、 record は変更しない
      const response: TopupResponseBody = {
        authId: body.authId,
        oldAuthId: body.authId,
        status: 'cancelled',
        txHash: null,
        jpyAmount: record.jpyAmount,
        ethAmount: record.ethAmount.toString(),
        spotRate: Math.round(spotRate.rate),
        spotRateSource: spotRate.source,
        message: userMessage,
      };
      return c.json<TopupResponseBody>(response, 200);
    }

    // ---- Phase D: 旧 authId を AuthCleanupQueue.enqueue ----
    // enqueue は同期返却 (setTimeout 登録のみ)、 実行完了を await しない fire-and-forget
    // 5 秒 delay + rate limit 1 req/sec + 3 回 retry で GMO alterTran VOID を実行
    options.cleanupQueue.enqueue(body.authId);

    // ---- Phase E: fiat_bid record を新 authId に UPDATE + jpyAmount / ethAmount / spotRate 更新 ----
    try {
      await options.store.updateToNewAuth({
        oldAuthId: body.authId,
        newAuthId: newAuthResult.authId,
        newJpyAmount: body.newJpyAmount,
        newEthAmount: newEthWei,
        spotRate: Math.round(spotRate.rate),
        spotRateSource: spotRate.source,
      });
    } catch (err) {
      // DB write fail は tx broadcast 済で operational alert 対象
      // Phase 2 mvp は 500 応答で webapp に retry を促す、 監視 wire は Phase 4
      return c.json(
        {
          error: 'InternalError',
          message: `fiat_bid update failed after bid tx broadcast: ${err instanceof Error ? err.message : String(err)}`,
          txHash: bidResult.txHash,
        },
        500,
      );
    }

    const response: TopupResponseBody = {
      authId: newAuthResult.authId,
      oldAuthId: body.authId,
      status: 'bid-placed',
      txHash: bidResult.txHash,
      jpyAmount: body.newJpyAmount,
      ethAmount: newEthWei.toString(),
      spotRate: Math.round(spotRate.rate),
      spotRateSource: spotRate.source,
      message: '増額 bid tx を broadcast しました。',
    };
    return c.json<TopupResponseBody>(response, 200);
  });

  return app;
};
