/**
 * spot-rate independent server integration test (Issue #3065、 Plan A)
 *
 * 検証対象 —
 * (1) createSpotRateServerApp() が /api/v1/spot-rate/eth-jpy route を expose する (Ponder 非依存)
 * (2) route が spot-rate handler と同じ shape で応答する (200 = SpotRate JSON)
 * (3) route が Ponder graphql context に依存しない (import.meta.env 影響なし)
 *
 * rules/quality.md § test-passed marker 発行前提 3 条件を満たす behavior test。
 * hono `app.request()` 経路で actual handler を execute する = server listen 不要。
 * spot-rate handler 内の SpotRateFetcher は module singleton だが、 test は fetch mock で
 * 副作用を制御する (実 GMO / CoinGecko API を叩かない)。
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createSpotRateServerApp } from './spot-rate-server.js';

describe('createSpotRateServerApp — /api/v1/spot-rate/eth-jpy', () => {
  const originalEnv = { ...process.env };
  let fetchSpy: ReturnType<typeof vi.spyOn> | undefined;

  beforeEach(() => {
    // mock mode を有効化して外部 API 通信を skip、 固定 rate 500000 JPY / ETH を返す
    process.env['USE_SPOT_RATE_MOCK'] = 'true';
    process.env['MOCK_SPOT_RATE_JPY_PER_ETH'] = '500000';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    fetchSpy?.mockRestore();
    fetchSpy = undefined;
  });

  it('GET /api/v1/spot-rate/eth-jpy が 200 で SpotRate 応答を返す', async () => {
    const app = createSpotRateServerApp();
    const res = await app.request('/api/v1/spot-rate/eth-jpy');
    expect(res.status).toBe(200);

    const body = (await res.json()) as {
      rate: number;
      source: string;
      cachedAt: number;
      expiresAt: number;
    };
    // mock mode 時は rate = 500000、 source = 'mock' 固定
    expect(body.rate).toBe(500_000);
    expect(body.source).toBe('mock');
    expect(typeof body.cachedAt).toBe('number');
    expect(typeof body.expiresAt).toBe('number');
  });

  it('未知 route (/api/v1/fiat-bid/*) は 404 を返す (spot-rate 単独 server)', async () => {
    // Plan A では fiat-bid endpoint は Ponder 側 (42069) に維持、 spot-rate server は spot-rate のみ
    const app = createSpotRateServerApp();
    const res = await app.request('/api/v1/fiat-bid/authorize', { method: 'POST' });
    expect(res.status).toBe(404);
  });

  it('root path (/) は 404 (graphql route を持たない、 Ponder 非依存 SSOT)', async () => {
    const app = createSpotRateServerApp();
    const res = await app.request('/');
    expect(res.status).toBe(404);
  });
});
