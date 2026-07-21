/**
 * Cloudflare Workers entry の route 配線 test
 *
 * 対象は「worker が expose する route が揃っているか」 の 1 点。
 * 2026-07-21 に GET /api/v1/spot-rate/eth-jpy が worker 側に未配線で 404 を返し、
 * webapp の spot rate と ETH 換算が空のままになる不具合が発生した。
 * handler 単体 (handlers/spot-rate.test.ts) と独立 server (spot-rate-server.test.ts) は
 * 両方 pass していたため、 worker への配線漏れだけが検知されずに残っていた。
 *
 * ここでは worker.fetch を直接叩き、 route が実在して 200 を返すことを確認する。
 * USE_SPOT_RATE_MOCK=true で起動して外部 API 通信を避け、 test を決定的にする。
 */

import { describe, expect, it } from 'vitest';

import worker, { type Env } from './authorize-fincode-worker.js';

/** KV stub = in-memory Map、 worker が touch しても副作用が出ない最小実装 */
const createKvStub = () => {
  const store = new Map<string, string>();
  return {
    async get(key: string): Promise<string | null> {
      return store.get(key) ?? null;
    },
    async put(key: string, value: string): Promise<void> {
      store.set(key, value);
    },
  };
};

/**
 * wrangler.toml [vars] 相当の env stub。
 * spot-rate route は chain / fincode に触れないため、 chain 系は形式だけ満たす dummy で足りる。
 */
const createEnv = (overrides: Partial<Env> = {}): Env =>
  ({
    FINCODE_STATE: createKvStub(),
    FINCODE_API_KEY_SECRET: 'm_test_dummy',
    OPERATOR_PK: `0x${'1'.repeat(64)}`,
    RPC_URL: 'https://sepolia.base.org',
    AUCTION_HOUSE_ADDRESS: `0x${'2'.repeat(40)}`,
    NIJI_TOKEN_ADDRESS: `0x${'3'.repeat(40)}`,
    CHAIN_ID: '84532',
    USE_FINCODE_MOCK: 'false',
    USE_SPOT_RATE_MOCK: 'true',
    MOCK_SPOT_RATE_JPY_PER_ETH: '500000',
    ...overrides,
  }) as Env;

describe('authorize-fincode-worker の route 配線', () => {
  it('GET /api/v1/spot-rate/eth-jpy が 200 と rate を返す (webapp useSpotRate の polling 先)', async () => {
    const response = await worker.fetch(
      new Request('https://niji-api.example/api/v1/spot-rate/eth-jpy'),
      createEnv(),
    );

    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      rate: number;
      source: string;
      cachedAt: number;
      expiresAt: number;
    };
    expect(body.rate).toBe(500000);
    expect(body.source).toBe('mock');
    expect(typeof body.cachedAt).toBe('number');
    expect(body.expiresAt).toBeGreaterThan(body.cachedAt);
  });

  it('MOCK_SPOT_RATE_JPY_PER_ETH の値が spot-rate 応答に反映される (env が fetcher に届いている証明)', async () => {
    const response = await worker.fetch(
      new Request('https://niji-api.example/api/v1/spot-rate/eth-jpy'),
      createEnv({ MOCK_SPOT_RATE_JPY_PER_ETH: '314000' }),
    );

    expect(response.status).toBe(200);
    const body = (await response.json()) as { rate: number };
    expect(body.rate).toBe(314000);
  });

  it('別 origin の webapp から読めるよう CORS header を返す', async () => {
    const response = await worker.fetch(
      new Request('https://niji-api.example/api/v1/spot-rate/eth-jpy', {
        headers: { Origin: 'https://niji-webapp.pages.dev' },
      }),
      createEnv(),
    );

    expect(response.headers.get('access-control-allow-origin')).toBe('*');
  });

  it('GET の preflight で allowMethods に GET が含まれる', async () => {
    const response = await worker.fetch(
      new Request('https://niji-api.example/api/v1/spot-rate/eth-jpy', {
        method: 'OPTIONS',
        headers: {
          Origin: 'https://niji-webapp.pages.dev',
          'Access-Control-Request-Method': 'GET',
        },
      }),
      createEnv(),
    );

    expect(response.headers.get('access-control-allow-methods')).toContain('GET');
  });

  it('未定義 path は 404 のまま (route 追加が他 path を巻き込んでいない)', async () => {
    const response = await worker.fetch(
      new Request('https://niji-api.example/api/v1/does-not-exist'),
      createEnv(),
    );

    expect(response.status).toBe(404);
  });
});
