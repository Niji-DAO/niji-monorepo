/**
 * Spot rate hono handler (Issue #3005 Phase B)
 *
 * GET /api/v1/spot-rate/eth-jpy
 * 応答 body — { rate, source, cachedAt, expiresAt }
 *
 * fetcher は module-level singleton (5 秒 cache を共有するため)、
 * test は SpotRateFetcher を直接 new して DI、 handler test は fetcher option 経由で差替。
 *
 * SSOT — tests/spec/gmo-fiat-bid/Phase1-01-master-spec.md § P4、
 *        Phase1-02-issue-breakdown.md § Issue 2 完了条件
 */

import { Hono } from 'hono';

import { SpotRateFetcher, SpotRateFetchError, type SpotRate } from '../services/spotRate/index.js';

/** 応答 body shape (公開 API 契約) */
export type SpotRateResponseBody = SpotRate;

/**
 * spot rate handler の Hono app を返す factory
 * fetcher option で test 時に mock 差替、 default は module singleton
 */
export const createSpotRateApp = (fetcher: SpotRateFetcher = defaultFetcher()): Hono => {
  const app = new Hono();

  app.get('/eth-jpy', async c => {
    try {
      const result = await fetcher.getEthJpyRate();
      return c.json<SpotRateResponseBody>(result, 200);
    } catch (err) {
      if (err instanceof SpotRateFetchError) {
        return c.json({ error: 'spot_rate_unavailable', message: err.message }, 503);
      }
      // 予期しない error は 500 で応答、 log は呼出側 middleware で捕捉
      return c.json(
        { error: 'internal_error', message: err instanceof Error ? err.message : String(err) },
        500,
      );
    }
  });

  return app;
};

/**
 * default fetcher singleton
 * 明示 clear が必要なら test は createSpotRateApp(new SpotRateFetcher({...})) で差替
 */
let cachedFetcher: SpotRateFetcher | undefined;
const defaultFetcher = (): SpotRateFetcher => {
  if (cachedFetcher === undefined) {
    cachedFetcher = new SpotRateFetcher();
  }
  return cachedFetcher;
};
