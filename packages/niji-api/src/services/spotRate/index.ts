/**
 * Spot rate fetcher (Issue #3005 Phase A + B)
 *
 * ETH/JPY spot rate を取得する service。
 * primary = GMO コイン Public API (`/v1/ticker?symbol=ETH_JPY`) の bid/ask mid、 rate limit 1 req/sec
 * fallback = CoinGecko simple/price (`/simple/price?ids=ethereum&vs_currencies=jpy`)、 free tier
 *
 * 切替判定 —
 * (1) primary 200 OK (timeout 以内) → primary rate 採用
 * (2) primary 4xx/5xx → 即座に fallback fetch
 * (3) primary timeout (30 秒超) → fallback fetch
 * (4) fallback も timeout / エラー → SpotRateFetchError throw (bid 発火不可、 呼出側で 5xx 応答)
 *
 * cache —
 * 5 秒 in-memory Map (TTL 管理、 Redis 等外部依存なし)、
 * GMO コイン API rate limit 1 req/sec を尊重しつつ bid tx 発火直前 fetch で rate 乖離最小化。
 * cache key = 'ETH_JPY' 固定 (単一 pair、 Phase 1)。
 *
 * SSOT — tests/spec/gmo-fiat-bid/Phase1-01-master-spec.md § P4、 Phase1-02-issue-breakdown.md § Issue 2
 */

export type SpotRateSource = 'gmo-coin' | 'coingecko';

export type SpotRate = {
  /** JPY per 1 ETH の rate、 単位 = 円 */
  rate: number;
  /** rate の取得元 */
  source: SpotRateSource;
  /** cache 格納時刻 (ms epoch) */
  cachedAt: number;
  /** cache 失効時刻 (ms epoch) */
  expiresAt: number;
};

/**
 * primary / fallback 双方失敗時に throw する error
 * 呼出側 (hono handler) はこれを 5xx 応答に変換する
 */
export class SpotRateFetchError extends Error {
  public readonly cause?: unknown;
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'SpotRateFetchError';
    if (cause !== undefined) {
      this.cause = cause;
    }
  }
}

/** DI 用の fetcher signature、 test で mock 差替可能に */
export type FetchLike = typeof globalThis.fetch;

export type SpotRateFetcherOptions = {
  /** GMO コイン API base URL (default = env `GMO_COIN_API_ENDPOINT` or `https://api.coin.z.com/public`) */
  gmoCoinEndpoint?: string;
  /** CoinGecko API base URL (default = env `COINGECKO_API_ENDPOINT` or `https://api.coingecko.com/api/v3`) */
  coingeckoEndpoint?: string;
  /** primary fetch timeout (ms、 default = env `SPOT_RATE_PRIMARY_TIMEOUT_MS` or 30000) */
  primaryTimeoutMs?: number;
  /** fallback fetch timeout (ms、 default = env `SPOT_RATE_FALLBACK_TIMEOUT_MS` or 30000) */
  fallbackTimeoutMs?: number;
  /** cache TTL (ms、 default = env `SPOT_RATE_CACHE_TTL_MS` or 5000) */
  cacheTtlMs?: number;
  /** fetch 実装差替 (test 用) */
  fetch?: FetchLike;
  /** 時刻 source (test で決定的 cache 検証、 default = Date.now) */
  now?: () => number;
};

/**
 * env / options から数値 config を読取
 * options 明示 > env > default の優先順
 */
const readNumberConfig = (
  optionValue: number | undefined,
  envKey: string,
  defaultValue: number,
): number => {
  if (typeof optionValue === 'number' && Number.isFinite(optionValue) && optionValue > 0) {
    return optionValue;
  }
  const raw = process.env[envKey];
  if (raw !== undefined && raw.trim() !== '') {
    const parsed = Number.parseFloat(raw);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return defaultValue;
};

/**
 * primary / fallback 各 fetch を AbortController + timeout で race
 * timeout 到達で AbortError throw、 caller が catch して fallback へ回す
 */
const fetchWithTimeout = async (
  fetchImpl: FetchLike,
  url: string,
  timeoutMs: number,
): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetchImpl(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

/**
 * GMO コイン Public API の /v1/ticker?symbol=ETH_JPY 応答 shape
 * 参考 — https://api.coin.z.com/docs/#ticker
 * 応答例 —
 *   {
 *     "status": 0,
 *     "data": [
 *       {
 *         "ask": "500000",
 *         "bid": "499500",
 *         "high": "510000",
 *         ...
 *       }
 *     ],
 *     "responsetime": "2024-01-01T00:00:00.000Z"
 *   }
 */
type GmoCoinTickerResponse = {
  status: number;
  data?: Array<{
    ask?: string;
    bid?: string;
    symbol?: string;
  }>;
};

/**
 * CoinGecko simple/price 応答 shape
 * 参考 — https://docs.coingecko.com/reference/simple-price
 * 応答例 —
 *   { "ethereum": { "jpy": 500000 } }
 */
type CoinGeckoSimplePriceResponse = {
  ethereum?: {
    jpy?: number;
  };
};

/**
 * primary 経路 — GMO コイン Public API から ETH/JPY ticker を fetch、 bid/ask mid を返す
 * status !== 0 or bid/ask 欠損は throw で fallback へ
 */
const fetchGmoCoinRate = async (
  fetchImpl: FetchLike,
  endpoint: string,
  timeoutMs: number,
): Promise<number> => {
  const url = `${endpoint.replace(/\/$/, '')}/v1/ticker?symbol=ETH_JPY`;
  const response = await fetchWithTimeout(fetchImpl, url, timeoutMs);
  if (!response.ok) {
    throw new Error(`GMO coin ticker HTTP ${response.status}`);
  }
  const body = (await response.json()) as GmoCoinTickerResponse;
  if (body.status !== 0 || !Array.isArray(body.data) || body.data.length === 0) {
    throw new Error(`GMO coin ticker returned status=${body.status}`);
  }
  const first = body.data[0];
  const askStr = first?.ask;
  const bidStr = first?.bid;
  if (askStr === undefined || bidStr === undefined) {
    throw new Error('GMO coin ticker missing ask/bid');
  }
  const ask = Number.parseFloat(askStr);
  const bid = Number.parseFloat(bidStr);
  if (!Number.isFinite(ask) || !Number.isFinite(bid) || ask <= 0 || bid <= 0) {
    throw new Error(`GMO coin ticker invalid ask/bid ask=${askStr} bid=${bidStr}`);
  }
  return (ask + bid) / 2;
};

/**
 * fallback 経路 — CoinGecko simple/price から ETH の JPY 建て価格を fetch
 */
const fetchCoinGeckoRate = async (
  fetchImpl: FetchLike,
  endpoint: string,
  timeoutMs: number,
): Promise<number> => {
  const url = `${endpoint.replace(/\/$/, '')}/simple/price?ids=ethereum&vs_currencies=jpy`;
  const response = await fetchWithTimeout(fetchImpl, url, timeoutMs);
  if (!response.ok) {
    throw new Error(`CoinGecko simple/price HTTP ${response.status}`);
  }
  const body = (await response.json()) as CoinGeckoSimplePriceResponse;
  const rate = body.ethereum?.jpy;
  if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) {
    throw new Error(`CoinGecko simple/price missing/invalid ethereum.jpy`);
  }
  return rate;
};

/**
 * SpotRateFetcher — primary / fallback 切替 + 5 秒 cache を担う service
 *
 * 使用例 —
 *   const fetcher = new SpotRateFetcher();
 *   const rate = await fetcher.getEthJpyRate();
 *
 * 呼出側 (hono handler、 Phase B) は本 class を singleton 化して DI する。
 */
export class SpotRateFetcher {
  private readonly gmoCoinEndpoint: string;
  private readonly coingeckoEndpoint: string;
  private readonly primaryTimeoutMs: number;
  private readonly fallbackTimeoutMs: number;
  private readonly cacheTtlMs: number;
  private readonly fetchImpl: FetchLike;
  private readonly now: () => number;

  private cache: SpotRate | undefined;

  constructor(options: SpotRateFetcherOptions = {}) {
    this.gmoCoinEndpoint =
      options.gmoCoinEndpoint ??
      process.env['GMO_COIN_API_ENDPOINT'] ??
      'https://api.coin.z.com/public';
    this.coingeckoEndpoint =
      options.coingeckoEndpoint ??
      process.env['COINGECKO_API_ENDPOINT'] ??
      'https://api.coingecko.com/api/v3';
    this.primaryTimeoutMs = readNumberConfig(
      options.primaryTimeoutMs,
      'SPOT_RATE_PRIMARY_TIMEOUT_MS',
      30000,
    );
    this.fallbackTimeoutMs = readNumberConfig(
      options.fallbackTimeoutMs,
      'SPOT_RATE_FALLBACK_TIMEOUT_MS',
      30000,
    );
    this.cacheTtlMs = readNumberConfig(options.cacheTtlMs, 'SPOT_RATE_CACHE_TTL_MS', 5000);
    this.fetchImpl = options.fetch ?? globalThis.fetch;
    this.now = options.now ?? Date.now;
  }

  /**
   * ETH/JPY spot rate を返す
   * cache 有効なら cache を返す、 失効時は primary → fallback の順で fetch
   * primary / fallback 双方失敗時は SpotRateFetchError throw
   */
  async getEthJpyRate(): Promise<SpotRate> {
    const now = this.now();
    if (this.cache !== undefined && this.cache.expiresAt > now) {
      return this.cache;
    }

    let primaryError: unknown;
    try {
      const rate = await fetchGmoCoinRate(
        this.fetchImpl,
        this.gmoCoinEndpoint,
        this.primaryTimeoutMs,
      );
      return this.saveCache(rate, 'gmo-coin');
    } catch (err) {
      primaryError = err;
    }

    try {
      const rate = await fetchCoinGeckoRate(
        this.fetchImpl,
        this.coingeckoEndpoint,
        this.fallbackTimeoutMs,
      );
      return this.saveCache(rate, 'coingecko');
    } catch (fallbackError) {
      throw new SpotRateFetchError('spot rate primary and fallback both failed', {
        primaryError,
        fallbackError,
      });
    }
  }

  /** cache 全消去 (test tearDown / 手動 refresh 用) */
  clearCache(): void {
    this.cache = undefined;
  }

  private saveCache(rate: number, source: SpotRateSource): SpotRate {
    const cachedAt = this.now();
    const record: SpotRate = {
      rate,
      source,
      cachedAt,
      expiresAt: cachedAt + this.cacheTtlMs,
    };
    this.cache = record;
    return record;
  }
}
