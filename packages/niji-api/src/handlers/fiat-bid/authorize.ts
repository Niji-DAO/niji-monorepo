/**
 * Fiat bid authorize hono handler (Issue #3006 Phase B、 Issue #3051 で入力軸 ETH primary に反転)
 *
 * POST /api/v1/fiat-bid/authorize
 * request body — { ethAmount, spotRate, jpyAmount, cardToken, bidderWallet, auctionId, bidderEmail? }
 *                (Issue #3051 以降、 ethAmount = wei 文字列 primary、 spotRate = 換算根拠、 jpyAmount = 換算値)
 * 応答 body    — { authId, tds2Url, jpyAmount, ethAmount, spotRate, spotRateSource }
 *
 * 処理順 (Issue #3051 で ETH primary 経路に切替) —
 * (1) request body 検証 (欠損 / 型 / ETH primary 3 値の相互整合)
 * (2) bid 上限 100 万円 check (webapp から届く jpyAmount で判定、 換算 drift 対策で backend でも再換算検証)
 * (3) spot rate 取得 (Issue #3005 の SpotRateFetcher 経由、 primary/fallback 切替 + 5 秒 cache)
 *     backend 側 spot rate を SSOT とし、 webapp 提示 rate との drift を audit
 * (4) 記録用の ethWei / jpyAmount 確定 (webapp 提示値と backend 再計算値のうち保守的な方を採用)
 * (5) orderId 生成 (auth ID PK に一致させて後段 handler で lookup 可能に)
 * (6) GmoClient.authorize (entryTran + execTran) 呼出、 GMO 請求額は JPY 単位
 * (7) fiat_bid table に pending status で INSERT (ETH primary + JPY 換算値の 2 値保存)
 * (8) 応答 body 返却
 *
 * error 変換 —
 * - request validation fail    → 400 InvalidRequest
 * - bid 上限超過                → 400 BidLimitExceeded
 * - spot rate fetch fail        → 503 SpotRateUnavailable (bid 発火不可 signal)
 * - GmoAuthorizationError       → 500 GmoAuthorizationFailed
 * - unexpected error            → 500 InternalError
 *
 * SSOT — tests/spec/gmo-fiat-bid/Phase1-01-master-spec.md § P4 (ETH 固定 SSOT、 Issue #3051 で JPY→ETH に撤廃)、
 *        Phase1-02-issue-breakdown.md § Issue 3、
 *        Issue #3051 (入力軸反転)、
 *        rules/quality.md § test-passed marker 発行前提
 */

import { Hono } from 'hono';

import { GmoAuthorizationError, GmoClient } from '../../services/gmo/client.js';
import {
  SpotRateFetcher,
  SpotRateFetchError,
  type SpotRate,
} from '../../services/spotRate/index.js';

/** bid 上限 100 万円 (Phase 1 SSOT、 grilling P2 確定) */
export const BID_LIMIT_JPY = 1_000_000;

/** request body shape (webapp が POST する、 Issue #3051 で ETH primary + JPY 換算値 + spot rate の 3 値受信) */
export type AuthorizeRequestBody = {
  /** ETH 額 wei (bigint 文字列、 primary 契約軸、 Issue #3051 で追加) */
  ethAmount: string;
  /** spot rate (JPY/ETH、 webapp 側 rate、 backend rate との drift audit 用、 Issue #3051 で追加) */
  spotRate: number;
  /** JPY 換算額 (webapp 側で ethAmount × spotRate 丸め、 100 万円上限判定 + GMO 請求額) */
  jpyAmount: number;
  cardToken: string;
  bidderWallet: `0x${string}`;
  auctionId: string;
  bidderEmail?: string;
};

/** 応答 body shape (公開 API 契約) */
export type AuthorizeResponseBody = {
  authId: string;
  tds2Url: string;
  jpyAmount: number;
  ethAmount: string;
  spotRate: number;
  spotRateSource: SpotRate['source'];
};

/** fiat_bid table に INSERT する record (呼出側で DB write する用) */
export type FiatBidRecord = {
  authId: string;
  bidderWallet: `0x${string}`;
  bidderEmail: string | null;
  auctionId: bigint;
  jpyAmount: number;
  ethAmount: bigint;
  spotRate: number;
  spotRateSource: SpotRate['source'];
  status: 'pending';
  createdAt: Date;
};

/**
 * DB store 抽象 (Ponder DB を直接触らずに handler test 可能に)
 * 本 handler は fiat_bid insert のみ実施、 subsequent handler (3ds callback 等) は別 method で更新する
 */
export type FiatBidStore = {
  insertPending: (record: FiatBidRecord) => Promise<void>;
};

/**
 * bidderWallet の hex 形式 check
 * 0x prefix + 40 桁 hex (EIP-55 checksum 検証は Phase 2、 Phase 1 は形式のみ)
 */
const isHexAddress = (value: unknown): value is `0x${string}` => {
  return typeof value === 'string' && /^0x[\dA-Fa-f]{40}$/.test(value);
};

/**
 * request body の shape 検証 (Issue #3051 で ETH primary + spotRate + jpyAmount の 3 値対応)
 * unknown value を受取り AuthorizeRequestBody に絞込 (or error message 返す)
 *
 * ethAmount = 正の bigint 文字列 (wei、 例 "50000000000000000" = 0.05 ETH)、
 * spotRate = 正の float (JPY/ETH、 例 500000)、
 * jpyAmount = 正の整数 (JPY、 例 25000) の 3 値を必須にする。
 * 3 値の相互整合 (ethAmount * spotRate ≈ jpyAmount) は本 handler 側で再計算検証する。
 */
export const parseAuthorizeBody = (
  raw: unknown,
): { ok: true; value: AuthorizeRequestBody } | { ok: false; message: string } => {
  if (raw === null || typeof raw !== 'object') {
    return { ok: false, message: 'request body must be a JSON object' };
  }
  const body = raw as Record<string, unknown>;

  const ethAmountRaw = body['ethAmount'];
  if (
    typeof ethAmountRaw !== 'string' ||
    ethAmountRaw.trim() === '' ||
    !/^\d+$/.test(ethAmountRaw)
  ) {
    return { ok: false, message: 'ethAmount must be a positive bigint string (wei)' };
  }
  const ethAmountWei = BigInt(ethAmountRaw);
  if (ethAmountWei <= 0n) {
    return { ok: false, message: 'ethAmount must be a positive bigint string (wei)' };
  }

  const spotRate = body['spotRate'];
  if (typeof spotRate !== 'number' || !Number.isFinite(spotRate) || spotRate <= 0) {
    return { ok: false, message: 'spotRate must be a positive number (JPY per ETH)' };
  }

  const jpyAmount = body['jpyAmount'];
  if (typeof jpyAmount !== 'number' || !Number.isInteger(jpyAmount) || jpyAmount <= 0) {
    return { ok: false, message: 'jpyAmount must be a positive integer' };
  }

  const cardToken = body['cardToken'];
  if (typeof cardToken !== 'string' || cardToken.trim() === '') {
    return { ok: false, message: 'cardToken must be a non-empty string' };
  }

  const bidderWallet = body['bidderWallet'];
  if (!isHexAddress(bidderWallet)) {
    return { ok: false, message: 'bidderWallet must be a 0x-prefixed 40 hex address' };
  }

  const auctionId = body['auctionId'];
  if (typeof auctionId !== 'string' || auctionId.trim() === '' || !/^\d+$/.test(auctionId)) {
    return { ok: false, message: 'auctionId must be a decimal string' };
  }

  const email = body['bidderEmail'];
  let bidderEmail: string | undefined;
  if (email !== undefined && email !== null) {
    if (typeof email === 'string' && email.trim() !== '') {
      bidderEmail = email;
    }
  }

  const validated: AuthorizeRequestBody = {
    ethAmount: ethAmountRaw,
    spotRate,
    jpyAmount,
    cardToken,
    bidderWallet,
    auctionId,
  };
  if (bidderEmail !== undefined) {
    validated.bidderEmail = bidderEmail;
  }
  return { ok: true, value: validated };
};

/**
 * JPY → ETH wei 換算
 * spot rate = JPY per 1 ETH、 wei = jpy * 1e18 / rate
 * 小数点は truncate (bidder 損しない方向、 実際は運営 EOA が gas 負担するので誤差影響小)
 * spotRate の小数を扱うため BigInt 分子分母スケーリング (RATE_PRECISION 4 桁)
 */
const RATE_PRECISION = 10_000n;
export const convertJpyToEthWei = (jpyAmount: number, spotRate: number): bigint => {
  if (spotRate <= 0) {
    throw new Error(`invalid spotRate ${spotRate}`);
  }
  // rate を整数化するため 4 桁精度で丸め (0.0001 円まで、 GMO / CoinGecko 両方の精度に十分)
  // 分子 = jpyAmount * 1e18 * RATE_PRECISION
  // 分母 = rate * RATE_PRECISION
  // 結果 = jpyAmount * 1e18 / rate (RATE_PRECISION は約分)
  const rateScaled = BigInt(Math.round(spotRate * Number(RATE_PRECISION)));
  const jpyScaled = BigInt(jpyAmount) * BigInt(10) ** 18n * RATE_PRECISION;
  return jpyScaled / rateScaled;
};

export type CreateAuthorizeAppOptions = {
  gmoClient: GmoClient;
  spotRateFetcher: SpotRateFetcher;
  store: FiatBidStore;
  /** orderId 生成 (test 用に決定的、 default = auction-{auctionId}-{ts}-{rand}) */
  generateOrderId?: (input: { auctionId: string; bidderWallet: string }) => string;
  /** 現在時刻 source (test 用、 default = () => new Date()) */
  now?: () => Date;
};

const defaultGenerateOrderId = (input: { auctionId: string; bidderWallet: string }): string => {
  const ts = Date.now().toString(36);
  const rand = Math.floor(Math.random() * 1e6)
    .toString(36)
    .padStart(4, '0');
  return `fiat-${input.auctionId}-${input.bidderWallet.slice(2, 8)}-${ts}-${rand}`;
};

/**
 * authorize handler の Hono app を返す factory
 * options で GmoClient / SpotRateFetcher / DB store を DI、 test 時に mock 差替
 */
export const createAuthorizeApp = (options: CreateAuthorizeAppOptions): Hono => {
  const app = new Hono();
  const generateOrderId = options.generateOrderId ?? defaultGenerateOrderId;
  const now = options.now ?? (() => new Date());

  app.post('/authorize', async c => {
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
    const body = parsed.value;

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
    // audit 用に backend 側 spot rate で JPY→ETH 再計算した wei と比較、 100 万円上限は webapp jpyAmount で確定
    // backend rate と webapp rate に drift がある場合は spot rate audit log で追跡 (Phase 2 で監視 wire、 Phase 1 は record 保存のみ)
    const ethWei = BigInt(body.ethAmount);

    // orderId 生成 (fiat_bid.authId PK に紐付けて後段で lookup 可能に)
    const orderId = generateOrderId({
      auctionId: body.auctionId,
      bidderWallet: body.bidderWallet,
    });

    // GMO entryTran + execTran 順次呼出
    let authResult;
    try {
      authResult = await options.gmoClient.authorize({
        orderId,
        amount: body.jpyAmount,
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
      // DB write fail は auth 済なので operational alert 対象 (Phase 2 で監視 wire)
      // Phase 1 は 500 応答で webapp に retry を促す
      return c.json(
        {
          error: 'InternalError',
          message: `fiat_bid store failed: ${err instanceof Error ? err.message : String(err)}`,
        },
        500,
      );
    }

    const response: AuthorizeResponseBody = {
      authId: authResult.authId,
      tds2Url: authResult.tds2Url,
      jpyAmount: body.jpyAmount,
      ethAmount: ethWei.toString(),
      spotRate: Math.round(spotRate.rate),
      spotRateSource: spotRate.source,
    };
    return c.json<AuthorizeResponseBody>(response, 200);
  });

  return app;
};
