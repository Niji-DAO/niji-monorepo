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

import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * chain 経路 (place-bid) の検証用に viem を差替える。
 * readContract は現在 auction を、 writeContract は送信引数の記録だけを行い、 実 RPC を叩かない。
 */
const writeContractCalls: Array<Record<string, unknown>> = [];

vi.mock('viem', async () => {
  const actual = await vi.importActual<typeof import('viem')>('viem');
  return {
    ...actual,
    createPublicClient: () => ({
      readContract: async () => ({
        nounId: 42n,
        amount: 0n,
        startTime: 0,
        endTime: 0,
        settled: false,
      }),
      getBlockNumber: async () => 100n,
      getLogs: async () => [],
      waitForTransactionReceipt: async () => ({ status: 'success' }),
    }),
    createWalletClient: () => ({
      writeContract: async (args: Record<string, unknown>) => {
        writeContractCalls.push(args);
        return '0xdeadbeef';
      },
    }),
  };
});

/**
 * fincode 実 API を叩かせないための差替。
 * worker の KVAwareFincodeClient は本 class を extend するため、 super.authorize が本 mock を経由する。
 */
vi.mock('../services/fincode/client.js', async () => {
  const actual = await vi.importActual<typeof import('../services/fincode/client.js')>(
    '../services/fincode/client.js',
  );
  class FincodeClientMock {
    async authorize() {
      return {
        authId: 'auth-from-fincode',
        orderId: 'fc-42-abcdef',
        accessId: 'access-from-fincode',
        status: 'AUTHORIZED' as const,
        tds2Url: undefined,
      };
    }
  }
  return { ...actual, FincodeClient: FincodeClientMock };
});

import worker, { type Env } from './authorize-fincode-worker.js';

/** KV stub = in-memory Map、 seed 済 entry を渡して authorize 済状態を再現できる */
const createKvStub = (seed: Record<string, string> = {}) => {
  const store = new Map<string, string>(Object.entries(seed));
  return {
    async get(key: string): Promise<string | null> {
      return store.get(key) ?? null;
    },
    async put(key: string, value: string): Promise<void> {
      store.set(key, value);
    },
    _store: store,
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

describe('place-bid の入札額決定', () => {
  const AUTH_ID = 'auth-abc';
  const BIDDER = `0x${'4'.repeat(40)}`;

  const placeBid = async (env: Env) =>
    worker.fetch(
      new Request('https://niji-api.example/api/v1/fiat-bid/place-bid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authId: AUTH_ID, bidderWallet: BIDDER }),
      }),
      env,
    );

  beforeEach(() => {
    writeContractCalls.length = 0;
  });

  it('与信時の ethAmount をそのまま入札額に使い、 spot rate で再換算しない', async () => {
    // 与信時 rate 315000 円で 30000 円 = 0.095238... ETH を確定したとする。
    // env の mock rate は 500000 円なので、 再換算されていれば 0.06 ETH (6e16) になる。
    const authorizedWei = '95238095238095238';
    const env = createEnv({
      FINCODE_STATE: createKvStub({
        [`capture:${AUTH_ID}`]: JSON.stringify({
          orderId: 'fc-42-abcdef',
          accessId: 'access-1',
          jpyAmount: 30000,
          ethAmount: authorizedWei,
          spotRate: 315000,
        }),
      }),
    } as Partial<Env>);

    const response = await placeBid(env);
    const body = (await response.json()) as { status: string; txHash: string | null };

    expect(body.status).toBe('bid-placed');
    expect(writeContractCalls).toHaveLength(1);
    expect(writeContractCalls[0]?.['value']).toBe(BigInt(authorizedWei));
    // mock rate 500000 での再換算値と一致しないこと = rate を引き直していない証明
    expect(writeContractCalls[0]?.['value']).not.toBe(60_000_000_000_000_000n);
  });

  it('ethAmount 未保存の record は spot rate 換算に fallback する (移行期の in-flight 救済)', async () => {
    const env = createEnv({
      FINCODE_STATE: createKvStub({
        [`capture:${AUTH_ID}`]: JSON.stringify({
          orderId: 'fc-42-abcdef',
          accessId: 'access-1',
          jpyAmount: 30000,
        }),
      }),
    } as Partial<Env>);

    const response = await placeBid(env);
    const body = (await response.json()) as { status: string };

    expect(body.status).toBe('bid-placed');
    // mock rate 500000 円 → 30000 / 500000 = 0.06 ETH
    expect(writeContractCalls[0]?.['value']).toBe(60_000_000_000_000_000n);
  });

  it('入札後の fiat_bid record に実入札額 ethAmount が残る (settle 後の金額突合用)', async () => {
    const authorizedWei = '95238095238095238';
    const kv = createKvStub({
      [`capture:${AUTH_ID}`]: JSON.stringify({
        orderId: 'fc-42-abcdef',
        accessId: 'access-1',
        jpyAmount: 30000,
        ethAmount: authorizedWei,
        spotRate: 315000,
      }),
    });
    const env = createEnv({ FINCODE_STATE: kv } as Partial<Env>);

    await placeBid(env);

    const record = JSON.parse(kv._store.get(`fiat_bid:${AUTH_ID}`) ?? '{}') as {
      ethAmount?: string;
      jpyAmount?: number;
      lifecycle?: string;
    };
    expect(record.ethAmount).toBe(authorizedWei);
    expect(record.jpyAmount).toBe(30000);
    expect(record.lifecycle).toBe('bid-placed');
    // 逆引き map も張られている (SettlementDaemon が nounId から authId を引く経路)
    expect(kv._store.get('fiat_bid_by_auction:42')).toBe(AUTH_ID);
  });

  it('authorize が ethAmount を KV に保存し、 place-bid がその値で入札する (経路全体の接続)', async () => {
    const kv = createKvStub();
    const env = createEnv({ FINCODE_STATE: kv } as Partial<Env>);
    const ethWei = '95238095238095238';

    const authorizeResponse = await worker.fetch(
      new Request('https://niji-api.example/api/v1/fiat-bid/authorize-fincode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ethAmount: ethWei,
          spotRate: 315000,
          jpyAmount: 30000,
          cardToken: 'card-token-1',
          bidderWallet: BIDDER,
          auctionId: '42',
        }),
      }),
      env,
    );
    expect(authorizeResponse.status).toBe(200);

    const capture = JSON.parse(kv._store.get('capture:auth-from-fincode') ?? '{}') as {
      ethAmount?: string;
      orderId?: string;
      accessId?: string;
      jpyAmount?: number;
    };
    // KVAwareFincodeClient が書いた orderId / accessId が、 store の merge で消えていないこと
    expect(capture.orderId).toBe('fc-42-abcdef');
    expect(capture.accessId).toBe('access-from-fincode');
    expect(capture.jpyAmount).toBe(30000);
    expect(capture.ethAmount).toBe(ethWei);

    const bidResponse = await worker.fetch(
      new Request('https://niji-api.example/api/v1/fiat-bid/place-bid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authId: 'auth-from-fincode', bidderWallet: BIDDER }),
      }),
      env,
    );
    expect(bidResponse.status).toBe(200);
    expect(writeContractCalls[0]?.['value']).toBe(BigInt(ethWei));
  });

  it('capture record が無い authId は 404 を返し chain に触らない', async () => {
    const env = createEnv({ FINCODE_STATE: createKvStub() } as Partial<Env>);

    const response = await placeBid(env);

    expect(response.status).toBe(404);
    expect(writeContractCalls).toHaveLength(0);
  });
});
