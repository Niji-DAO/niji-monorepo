/**
 * Spot rate hono handler behavior test (Issue #3005 Phase B)
 *
 * 検証対象 —
 * (1) GET /eth-jpy が SpotRateFetcher 成功時に 200 + { rate, source, cachedAt, expiresAt } 返す
 * (2) SpotRateFetchError 発生時に 503 応答を返す (bid 発火不可 signal)
 * (3) 予期しない error は 500 応答を返す
 *
 * rules/quality.md § test-passed marker 発行前提 3 条件を満たす behavior test。
 * hono の app.request() 経由で actual handler を execute。
 */

import { describe, expect, it } from 'vitest';

import { SpotRateFetcher, SpotRateFetchError, type SpotRate } from '../services/spotRate/index.js';

import { createSpotRateApp } from './spot-rate.js';

/**
 * SpotRateFetcher の最小 stub、 test 用に振る舞いを差替
 * getEthJpyRate だけを制御、 clearCache は no-op
 */
class StubFetcher extends SpotRateFetcher {
  constructor(private readonly behavior: () => Promise<SpotRate>) {
    super({
      gmoCoinEndpoint: 'http://stub-primary',
      coingeckoEndpoint: 'http://stub-fallback',
    });
  }

  override async getEthJpyRate(): Promise<SpotRate> {
    return this.behavior();
  }
}

describe('createSpotRateApp GET /eth-jpy', () => {
  it('fetcher 成功時に 200 + spot rate JSON 応答を返す', async () => {
    const sampleRate: SpotRate = {
      rate: 500000,
      source: 'gmo-coin',
      cachedAt: 1000,
      expiresAt: 6000,
    };
    const fetcher = new StubFetcher(async () => sampleRate);
    const app = createSpotRateApp(fetcher);

    const res = await app.request('/eth-jpy');
    expect(res.status).toBe(200);

    const body = (await res.json()) as SpotRate;
    expect(body).toEqual(sampleRate);
  });

  it('SpotRateFetchError 時に 503 応答を返す (bid 発火不可)', async () => {
    const fetcher = new StubFetcher(async () => {
      throw new SpotRateFetchError('primary and fallback both failed');
    });
    const app = createSpotRateApp(fetcher);

    const res = await app.request('/eth-jpy');
    expect(res.status).toBe(503);

    const body = (await res.json()) as { error: string; message: string };
    expect(body.error).toBe('spot_rate_unavailable');
    expect(body.message).toContain('primary and fallback');
  });

  it('予期しない error は 500 応答を返す', async () => {
    const fetcher = new StubFetcher(async () => {
      throw new Error('unexpected boom');
    });
    const app = createSpotRateApp(fetcher);

    const res = await app.request('/eth-jpy');
    expect(res.status).toBe(500);

    const body = (await res.json()) as { error: string; message: string };
    expect(body.error).toBe('internal_error');
    expect(body.message).toBe('unexpected boom');
  });

  it('CoinGecko fallback 応答が source=coingecko で返る', async () => {
    const fetcher = new StubFetcher(async () => ({
      rate: 498000,
      source: 'coingecko',
      cachedAt: 2000,
      expiresAt: 7000,
    }));
    const app = createSpotRateApp(fetcher);

    const res = await app.request('/eth-jpy');
    expect(res.status).toBe(200);

    const body = (await res.json()) as SpotRate;
    expect(body.source).toBe('coingecko');
    expect(body.rate).toBe(498000);
  });
});
