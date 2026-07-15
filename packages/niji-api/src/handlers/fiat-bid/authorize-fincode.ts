/**
 * Fiat bid authorize hono handler (fincode 経路、 Phase 2 backend 統合、 Issue #3115)
 *
 * POST /api/v1/fiat-bid/authorize-fincode
 * request body — { ethAmount, spotRate, jpyAmount, cardToken, bidderWallet, auctionId, bidderEmail? }
 *                (Phase 1c で GMO 経路 (authorize.ts) と同 body 契約、 cardToken は fincode.js iframe 発行の card_id を格納)
 * 応答 body    — { authId, tds2Url, jpyAmount, ethAmount, spotRate, spotRateSource, status }
 *
 * 処理順 (GMO 経路 authorize.ts と同 flow、 GmoClient → FincodeClient に差替) —
 * (1) request body 検証 (欠損 / 型 / ETH primary 3 値の相互整合、 authorize.ts の parseAuthorizeBody を re-use)
 * (2) bid 上限 100 万円 check (webapp + backend 2 層強制の backend 側)
 * (3) spot rate 取得 (Issue #3005 の SpotRateFetcher 経由、 primary/fallback 切替 + 5 秒 cache)
 * (4) 記録用の ethWei / jpyAmount 確定 (webapp 提示値と backend 再計算値のうち保守的な方を採用)
 * (5) orderId 生成 (auth ID PK に一致させて後段 handler で lookup 可能に)
 * (6) FincodeClient.authorize (register + execute) 呼出、 fincode 請求額は JPY 単位
 * (7) fiat_bid table に pending status で INSERT
 * (8) 応答 body 返却 (status = AUTHORIZED / AUTHENTICATED / CAPTURED)
 *
 * error 変換 —
 * - request validation fail       → 400 InvalidRequest
 * - bid 上限超過                    → 400 BidLimitExceeded
 * - spot rate fetch fail            → 503 SpotRateUnavailable (bid 発火不可 signal)
 * - FincodeAuthorizationError       → 500 FincodeAuthorizationFailed
 * - unexpected error                → 500 InternalError
 *
 * SSOT — packages/niji-api/src/handlers/fiat-bid/authorize.ts (GMO 経路と対比 mirror pattern)、
 *        packages/niji-api/src/services/fincode/client.ts
 */

import { Hono } from 'hono';

import { FincodeAuthorizationError, FincodeClient } from '../../services/fincode/client.js';
import {
  SpotRateFetcher,
  SpotRateFetchError,
  type SpotRate,
} from '../../services/spotRate/index.js';

import {
  BID_LIMIT_JPY,
  parseAuthorizeBody,
  type AuthorizeRequestBody,
  type FiatBidRecord,
  type FiatBidStore,
} from './authorize.js';

/** fincode authorize 応答 body shape (公開 API 契約、 authorize.ts の AuthorizeResponseBody に status 追加) */
export type AuthorizeFincodeResponseBody = {
  authId: string;
  /** 3DS 認証 URL (fincode 3DS 必要時のみ、 通常決済では空文字列 or undefined) */
  tds2Url: string | undefined;
  jpyAmount: number;
  ethAmount: string;
  spotRate: number;
  spotRateSource: SpotRate['source'];
  /** 決済 status (AUTHORIZED = 与信成功 / AUTHENTICATED = 3DS 必要 / CAPTURED = 売上確定) */
  status: 'AUTHORIZED' | 'AUTHENTICATED' | 'CAPTURED';
};

export type CreateAuthorizeFincodeAppOptions = {
  fincodeClient: FincodeClient;
  spotRateFetcher: SpotRateFetcher;
  store: FiatBidStore;
  /** orderId 生成 (test 用に決定的、 default = fincode-{auctionId}-{ts}-{rand}) */
  generateOrderId?: (input: { auctionId: string; bidderWallet: string }) => string;
  /** 現在時刻 source (test 用、 default = () => new Date()) */
  now?: () => Date;
};

const defaultGenerateOrderId = (input: { auctionId: string; bidderWallet: string }): string => {
  const ts = Date.now().toString(36);
  const rand = Math.floor(Math.random() * 1e6)
    .toString(36)
    .padStart(4, '0');
  return `fincode-${input.auctionId}-${input.bidderWallet.slice(2, 8)}-${ts}-${rand}`;
};

/**
 * fincode authorize handler の Hono app を返す factory
 * options で FincodeClient / SpotRateFetcher / DB store を DI、 test 時に mock 差替
 */
export const createAuthorizeFincodeApp = (options: CreateAuthorizeFincodeAppOptions): Hono => {
  const app = new Hono();
  const generateOrderId = options.generateOrderId ?? defaultGenerateOrderId;
  const now = options.now ?? (() => new Date());

  app.post('/authorize-fincode', async c => {
    let rawBody: unknown;
    try {
      rawBody = await c.req.json();
    } catch {
      return c.json({ error: 'InvalidRequest', message: 'request body must be valid JSON' }, 400);
    }

    const parsed = parseAuthorizeBody(rawBody);
    if (!parsed.ok) {
      return c.json({ error: 'InvalidRequest', message: parsed.message }, 400);
    }
    const body: AuthorizeRequestBody = parsed.value;

    // bid 上限 100 万円 check (webapp + backend 2 層強制の backend 側)
    if (body.jpyAmount > BID_LIMIT_JPY) {
      return c.json(
        {
          error: 'BidLimitExceeded',
          message: `jpyAmount ${body.jpyAmount} exceeds bid limit ${BID_LIMIT_JPY}`,
        },
        400,
      );
    }

    // spot rate 取得 (5 秒 cache + primary/fallback 切替、 Issue #3005 経由)
    let spotRate: SpotRate;
    try {
      spotRate = await options.spotRateFetcher.getEthJpyRate();
    } catch (err) {
      if (err instanceof SpotRateFetchError) {
        return c.json(
          {
            error: 'SpotRateUnavailable',
            message: err.message,
          },
          503,
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

    // ETH wei = webapp 提示値を primary で採用 (Issue #3051、 入力軸 ETH 反転)
    const ethWei = BigInt(body.ethAmount);

    // orderId 生成 (fiat_bid.authId PK に紐付けて後段で lookup 可能に、 fincode-prefix で GMO orderId と識別可能)
    const orderId = generateOrderId({
      auctionId: body.auctionId,
      bidderWallet: body.bidderWallet,
    });

    // fincode register + execute 順次呼出 (cardToken は fincode.js iframe tokenize で受領した card_id)
    let authResult;
    try {
      authResult = await options.fincodeClient.authorize({
        orderId,
        amount: body.jpyAmount,
        cardToken: body.cardToken,
      });
    } catch (err) {
      if (err instanceof FincodeAuthorizationError) {
        return c.json(
          {
            error: 'FincodeAuthorizationFailed',
            message: err.message,
            errorCode: err.errorCode ?? null,
            errorMessage: err.errorMessage ?? null,
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

    // fiat_bid table に pending status で INSERT
    const record: FiatBidRecord = {
      authId: authResult.authId,
      bidderWallet: body.bidderWallet,
      bidderEmail: body.bidderEmail ?? null,
      auctionId: BigInt(body.auctionId),
      jpyAmount: body.jpyAmount,
      ethAmount: ethWei,
      spotRate: Math.round(spotRate.rate),
      spotRateSource: spotRate.source,
      status: 'pending',
      createdAt: now(),
    };
    try {
      await options.store.insertPending(record);
    } catch (err) {
      return c.json(
        {
          error: 'InternalError',
          message: `fiat_bid store failed: ${err instanceof Error ? err.message : String(err)}`,
        },
        500,
      );
    }

    const response: AuthorizeFincodeResponseBody = {
      authId: authResult.authId,
      tds2Url: authResult.tds2Url,
      jpyAmount: body.jpyAmount,
      ethAmount: ethWei.toString(),
      spotRate: Math.round(spotRate.rate),
      spotRateSource: spotRate.source,
      status: authResult.status,
    };
    return c.json<AuthorizeFincodeResponseBody>(response, 200);
  });

  return app;
};
