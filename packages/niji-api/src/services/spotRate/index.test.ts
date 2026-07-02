/**
 * Spot rate fetcher behavior test (Issue #3005 完了条件対応)
 *
 * 検証対象 (完了条件 SSOT) —
 * (1) primary 応答時に GMO コイン API 経由の rate を返す
 * (2) primary 障害 mock 時に CoinGecko 経由 rate が返る
 * (3) 5 秒 cache が動作し 2 度目の call で cachedAt が変わらない
 * (4) compareRateDeviation が 2% 超で withinTolerance=false、 2% 以内で true を返す
 *
 * MSW mock server で GMO コイン + CoinGecko endpoint を intercept、
 * primary healthy / primary fail / timeout の 3 経路を再現する。
 * rules/quality.md § test-passed marker 発行前提 3 条件を満たす behavior test。
 */

import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { compareRateDeviation } from './check.js';

import { SpotRateFetcher, SpotRateFetchError } from './index.js';

const GMO_COIN_ENDPOINT = 'https://api.coin.z.com/public';
const COINGECKO_ENDPOINT = 'https://api.coingecko.com/api/v3';

/** GMO コイン ticker 正常応答 (bid=499500, ask=500500 → mid=500000) */
const gmoCoinOkHandler = http.get(`${GMO_COIN_ENDPOINT}/v1/ticker`, () => {
  return HttpResponse.json({
    status: 0,
    data: [
      {
        ask: '500500',
        bid: '499500',
        high: '510000',
        low: '490000',
        last: '500000',
        symbol: 'ETH_JPY',
        timestamp: '2026-01-01T00:00:00.000Z',
        volume: '100',
      },
    ],
    responsetime: '2026-01-01T00:00:00.000Z',
  });
});

/** GMO コイン 5xx 応答 (primary 失敗経路) */
const gmoCoin5xxHandler = http.get(`${GMO_COIN_ENDPOINT}/v1/ticker`, () => {
  return new HttpResponse('Internal Server Error', { status: 503 });
});

/** CoinGecko 正常応答 (rate=498000) */
const coinGeckoOkHandler = http.get(`${COINGECKO_ENDPOINT}/simple/price`, () => {
  return HttpResponse.json({ ethereum: { jpy: 498000 } });
});

/** CoinGecko 5xx 応答 (fallback も失敗経路) */
const coinGecko5xxHandler = http.get(`${COINGECKO_ENDPOINT}/simple/price`, () => {
  return new HttpResponse('Bad Gateway', { status: 502 });
});

const server = setupServer();

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterAll(() => {
  server.close();
});

afterEach(() => {
  server.resetHandlers();
});

describe('SpotRateFetcher.getEthJpyRate', () => {
  it('完了条件 1 — primary 応答時に GMO コイン API 経由の rate を返す', async () => {
    server.use(gmoCoinOkHandler);
    const fetcher = new SpotRateFetcher({
      gmoCoinEndpoint: GMO_COIN_ENDPOINT,
      coingeckoEndpoint: COINGECKO_ENDPOINT,
      now: () => 1000,
    });

    const result = await fetcher.getEthJpyRate();

    expect(result.source).toBe('gmo-coin');
    // (ask 500500 + bid 499500) / 2 = 500000
    expect(result.rate).toBe(500000);
    expect(result.cachedAt).toBe(1000);
    expect(result.expiresAt).toBe(6000); // cachedAt + default TTL 5000
  });

  it('完了条件 2 — primary 障害 mock 時に CoinGecko 経由 rate が返る', async () => {
    server.use(gmoCoin5xxHandler, coinGeckoOkHandler);
    const fetcher = new SpotRateFetcher({
      gmoCoinEndpoint: GMO_COIN_ENDPOINT,
      coingeckoEndpoint: COINGECKO_ENDPOINT,
    });

    const result = await fetcher.getEthJpyRate();

    expect(result.source).toBe('coingecko');
    expect(result.rate).toBe(498000);
  });

  it('完了条件 3 — 5 秒 cache が動作し 2 度目の call で cachedAt が変わらない', async () => {
    let callCount = 0;
    server.use(
      http.get(`${GMO_COIN_ENDPOINT}/v1/ticker`, () => {
        callCount += 1;
        return HttpResponse.json({
          status: 0,
          data: [
            {
              ask: '500500',
              bid: '499500',
              symbol: 'ETH_JPY',
            },
          ],
        });
      }),
    );

    let currentTime = 10_000;
    const fetcher = new SpotRateFetcher({
      gmoCoinEndpoint: GMO_COIN_ENDPOINT,
      coingeckoEndpoint: COINGECKO_ENDPOINT,
      cacheTtlMs: 5000,
      now: () => currentTime,
    });

    const first = await fetcher.getEthJpyRate();
    expect(first.cachedAt).toBe(10_000);
    expect(callCount).toBe(1);

    // 4 秒後 (cache TTL 内)、 再 fetch されず同じ cachedAt を返す
    currentTime = 14_000;
    const second = await fetcher.getEthJpyRate();
    expect(second.cachedAt).toBe(10_000); // 変わらない
    expect(callCount).toBe(1); // API call は増えない

    // 6 秒後 (cache 失効)、 再 fetch されて cachedAt 更新
    currentTime = 16_000;
    const third = await fetcher.getEthJpyRate();
    expect(third.cachedAt).toBe(16_000);
    expect(callCount).toBe(2);
  });

  it('primary + fallback 双方失敗時は SpotRateFetchError throw', async () => {
    server.use(gmoCoin5xxHandler, coinGecko5xxHandler);
    const fetcher = new SpotRateFetcher({
      gmoCoinEndpoint: GMO_COIN_ENDPOINT,
      coingeckoEndpoint: COINGECKO_ENDPOINT,
    });

    await expect(fetcher.getEthJpyRate()).rejects.toBeInstanceOf(SpotRateFetchError);
  });

  it('primary が status !== 0 を返した時も fallback へ回る', async () => {
    server.use(
      http.get(`${GMO_COIN_ENDPOINT}/v1/ticker`, () => {
        return HttpResponse.json({ status: 1, messages: [{ message_code: 'ERR' }] });
      }),
      coinGeckoOkHandler,
    );
    const fetcher = new SpotRateFetcher({
      gmoCoinEndpoint: GMO_COIN_ENDPOINT,
      coingeckoEndpoint: COINGECKO_ENDPOINT,
    });

    const result = await fetcher.getEthJpyRate();
    expect(result.source).toBe('coingecko');
    expect(result.rate).toBe(498000);
  });

  it('clearCache で cache が消去され次回 API call が発生する', async () => {
    let callCount = 0;
    server.use(
      http.get(`${GMO_COIN_ENDPOINT}/v1/ticker`, () => {
        callCount += 1;
        return HttpResponse.json({
          status: 0,
          data: [{ ask: '500500', bid: '499500', symbol: 'ETH_JPY' }],
        });
      }),
    );
    const fetcher = new SpotRateFetcher({
      gmoCoinEndpoint: GMO_COIN_ENDPOINT,
      coingeckoEndpoint: COINGECKO_ENDPOINT,
      now: () => 20_000,
    });

    await fetcher.getEthJpyRate();
    expect(callCount).toBe(1);

    fetcher.clearCache();
    await fetcher.getEthJpyRate();
    expect(callCount).toBe(2);
  });
});

describe('compareRateDeviation (完了条件 4)', () => {
  let originalTolerance: string | undefined;

  beforeEach(() => {
    originalTolerance = process.env['SPOT_RATE_TOLERANCE_PERCENT'];
  });

  afterEach(() => {
    if (originalTolerance === undefined) {
      delete process.env['SPOT_RATE_TOLERANCE_PERCENT'];
    } else {
      process.env['SPOT_RATE_TOLERANCE_PERCENT'] = originalTolerance;
    }
  });

  it('2% 超乖離で withinTolerance=false を返す (上方向)', () => {
    process.env['SPOT_RATE_TOLERANCE_PERCENT'] = '2';
    const result = compareRateDeviation({
      previousRate: 500000,
      currentRate: 511000, // +2.2%
      userJpyAmount: 100000,
    });

    expect(result.withinTolerance).toBe(false);
    expect(result.deviationPercent).toBeCloseTo(2.2, 5);
    expect(result.tolerancePercent).toBe(2);
  });

  it('2% 超乖離で withinTolerance=false を返す (下方向、 絶対値判定)', () => {
    process.env['SPOT_RATE_TOLERANCE_PERCENT'] = '2';
    const result = compareRateDeviation({
      previousRate: 500000,
      currentRate: 489000, // -2.2%
      userJpyAmount: 100000,
    });

    expect(result.withinTolerance).toBe(false);
    expect(result.deviationPercent).toBeCloseTo(2.2, 5);
  });

  it('2% 以内で withinTolerance=true を返す', () => {
    process.env['SPOT_RATE_TOLERANCE_PERCENT'] = '2';
    const result = compareRateDeviation({
      previousRate: 500000,
      currentRate: 505000, // +1.0%
      userJpyAmount: 100000,
    });

    expect(result.withinTolerance).toBe(true);
    expect(result.deviationPercent).toBeCloseTo(1.0, 5);
  });

  it('境界値 = ちょうど 2% の乖離は withinTolerance=true (以内判定)', () => {
    process.env['SPOT_RATE_TOLERANCE_PERCENT'] = '2';
    const result = compareRateDeviation({
      previousRate: 500000,
      currentRate: 510000, // +2.0% ちょうど
      userJpyAmount: 100000,
    });

    expect(result.withinTolerance).toBe(true);
    expect(result.deviationPercent).toBeCloseTo(2.0, 5);
  });

  it('previousRate=0 は判定不能で withinTolerance=false + Infinity を返す', () => {
    process.env['SPOT_RATE_TOLERANCE_PERCENT'] = '2';
    const result = compareRateDeviation({
      previousRate: 0,
      currentRate: 500000,
      userJpyAmount: 100000,
    });

    expect(result.withinTolerance).toBe(false);
    expect(result.deviationPercent).toBe(Number.POSITIVE_INFINITY);
  });

  it('env SPOT_RATE_TOLERANCE_PERCENT 未設定時は default 2 を使う', () => {
    delete process.env['SPOT_RATE_TOLERANCE_PERCENT'];
    const result = compareRateDeviation({
      previousRate: 500000,
      currentRate: 505000, // 1.0%
      userJpyAmount: 100000,
    });

    expect(result.tolerancePercent).toBe(2);
    expect(result.withinTolerance).toBe(true);
  });

  it('env で閾値変更 (5% 設定時に 3% 乖離は within=true)', () => {
    process.env['SPOT_RATE_TOLERANCE_PERCENT'] = '5';
    const result = compareRateDeviation({
      previousRate: 500000,
      currentRate: 515000, // +3.0%
      userJpyAmount: 100000,
    });

    expect(result.tolerancePercent).toBe(5);
    expect(result.withinTolerance).toBe(true);
    expect(result.deviationPercent).toBeCloseTo(3.0, 5);
  });
});
