/**
 * Cloudflare Workers entry の behavior test
 *
 * 対象は 3 つ。
 *
 * (1) route 配線 — 2026-07-21 に GET /api/v1/spot-rate/eth-jpy が worker 側に未配線で 404 を返し、
 *     webapp の spot rate と ETH 換算が空のままになる不具合が発生した。
 *     handler 単体 (handlers/spot-rate.test.ts) と独立 server (spot-rate-server.test.ts) は
 *     両方 pass していたため、 worker への配線漏れだけが検知されずに残っていた。
 * (2) place-bid の入札額決定 — 与信時に確定した ethAmount をそのまま使い、 rate を引き直さないこと。
 * (3) scheduled 経路 (AuctionKeeper + SettlementDaemon) — 落札 / 落選 / fiat 無関係 の 3 分岐。
 *
 * 外部 I/O は viem と fincode client を module mock で差替え、 実 RPC / 実 API を叩かない。
 * spot rate は USE_SPOT_RATE_MOCK=true で固定して test を決定的にする。
 */

import { privateKeyToAccount } from 'viem/accounts';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * chain 経路の検証用に viem を差替える。
 * mock の応答は test 側から chainState / chainLogs を書換えて制御する。
 */
const writeContractCalls: Array<Record<string, unknown>> = [];

/** readContract (auction()) が返す状態。 test ごとに上書きする */
let chainState = {
  nounId: 42n,
  amount: 0n,
  startTime: 0,
  endTime: 0,
  settled: false,
};

/** getLogs (AuctionSettled) が返す log 列。 test ごとに上書きする */
let chainLogs: Array<{ args: { nounId: bigint; winner: string; amount: bigint } }> = [];

/** writeContract を失敗させたい test 用 (transferFrom 失敗分岐の検証) */
let writeContractError: Error | null = null;

/** getBlockNumber が返す latest block。 cursor 書込条件 (窓幅) の検証で上書きする */
let chainLatestBlock = 100n;

/** getLogs に渡された引数を記録する (窓 cap の検証用) */
let getLogsCalls: Array<{ fromBlock?: bigint; toBlock?: bigint }> = [];

vi.mock('viem', async () => {
  const actual = await vi.importActual<typeof import('viem')>('viem');
  return {
    ...actual,
    createPublicClient: () => ({
      readContract: async () => chainState,
      getBlockNumber: async () => chainLatestBlock,
      getLogs: async (args: { fromBlock?: bigint; toBlock?: bigint }) => {
        getLogsCalls.push({ fromBlock: args?.fromBlock, toBlock: args?.toBlock });
        return chainLogs;
      },
      waitForTransactionReceipt: async () => ({ status: 'success' }),
    }),
    createWalletClient: () => ({
      writeContract: async (args: Record<string, unknown>) => {
        writeContractCalls.push(args);
        if (writeContractError !== null) throw writeContractError;
        return '0xdeadbeef';
      },
    }),
  };
});

/**
 * fincode 実 API を叩かせないための差替。
 * worker の KVAwareFincodeClient は本 class を extend するため、 super.authorize が本 mock を経由する。
 * capture / cancel は SettlementDaemon の 3 分岐検証で呼出を記録する。
 */
const fincodeCalls: Array<{ method: string; orderId: string; accessId: string }> = [];
let capturePaymentError: Error | null = null;
/** authorize に渡された input を記録する (tds2RetUrl が伝わっているかの検証用) */
const authorizeInputs: Array<Record<string, unknown>> = [];
/** authorize が返す status / tds2Url を test 側で切替える */
let authorizeResponse: { status: 'AUTHORIZED' | 'AUTHENTICATED'; tds2Url?: string } = {
  status: 'AUTHORIZED',
};
/** complete3DSecureAuth の応答を test 側で切替える */
let threeDsResult: Record<string, unknown> = {
  transResult: 'Y',
  reason: undefined,
  challengeUrl: undefined,
  authorized: true,
  status: 'AUTHORIZED',
};

vi.mock('../services/fincode/client.js', async () => {
  const actual = await vi.importActual<typeof import('../services/fincode/client.js')>(
    '../services/fincode/client.js',
  );
  class FincodeClientMock {
    async authorize(input: Record<string, unknown>) {
      authorizeInputs.push(input);
      return {
        authId: 'auth-from-fincode',
        orderId: 'fc-42-abcdef',
        accessId: 'access-from-fincode',
        status: authorizeResponse.status,
        tds2Url: authorizeResponse.tds2Url,
      };
    }
    async complete3DSecureAuth(orderId: string, accessId: string, opts: unknown) {
      fincodeCalls.push({ method: '3ds', orderId, accessId });
      void opts;
      return threeDsResult;
    }
    async capturePayment(orderId: string, accessId: string) {
      fincodeCalls.push({ method: 'capture', orderId, accessId });
      if (capturePaymentError !== null) throw capturePaymentError;
      return { transaction_id: 'txn-captured' };
    }
    async cancelPayment(orderId: string, accessId: string) {
      fincodeCalls.push({ method: 'cancel', orderId, accessId });
      return { transaction_id: 'txn-cancelled' };
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
    writeContractError = null;
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

  it('createBid が失敗しても fiat_bid record は先に書かれている (settle 時に record 無しで skip されない)', async () => {
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
    // createBid (writeContract) を revert させる = chain 入札が失敗するケース
    writeContractError = new Error('createBid revert');
    const env = createEnv({ FINCODE_STATE: kv } as Partial<Env>);

    const response = await placeBid(env);

    // createBid 失敗時は place-bid の設計上 200 + status=cancelled を返す (与信は settle 時に cancel)
    expect(response.status).toBe(200);
    const body = (await response.json()) as { status: string };
    expect(body.status).toBe('cancelled');
    // record は createBid の前に書かれているため KV に残る (先書きの証明)。 これにより
    // 「chain 入札は通ったのに直後の書込が飛ぶ」 経路が消え、 settle 時の skip を防ぐ。
    const record = JSON.parse(kv._store.get(`fiat_bid:${AUTH_ID}`) ?? '{}') as {
      bidderWallet?: string;
      orderId?: string;
      accessId?: string;
    };
    expect(record.bidderWallet).toBe(BIDDER);
    expect(record.orderId).toBe('fc-42-abcdef');
    expect(record.accessId).toBe('access-1');
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

describe('3DS 経路の配線', () => {
  const BIDDER = `0x${'4'.repeat(40)}`;

  const authorize = async (env: Env) =>
    worker.fetch(
      new Request('https://niji-api.example/api/v1/fiat-bid/authorize-fincode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ethAmount: '95238095238095238',
          spotRate: 315000,
          jpyAmount: 30000,
          cardToken: 'card-token-1',
          bidderWallet: BIDDER,
          auctionId: '42',
        }),
      }),
      env,
    );

  const callback = async (env: Env, body: unknown) =>
    worker.fetch(
      new Request('https://niji-api.example/api/v1/fiat-bid/3ds-callback-fincode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
      env,
    );

  beforeEach(() => {
    authorizeInputs.length = 0;
    fincodeCalls.length = 0;
    authorizeResponse = { status: 'AUTHORIZED' };
    threeDsResult = {
      transResult: 'Y',
      reason: undefined,
      challengeUrl: undefined,
      authorized: true,
      status: 'AUTHORIZED',
    };
  });

  it('TDS2_RET_URL 設定時は authorize が fincode に tds2RetUrl を渡す', async () => {
    await authorize(createEnv({ TDS2_RET_URL: 'https://app.example/fiat-bid/3ds-return' }));

    expect(authorizeInputs[0]?.['tds2RetUrl']).toBe('https://app.example/fiat-bid/3ds-return');
  });

  it('TDS2_RET_URL 未設定時は tds2RetUrl を渡さない (3DS を要求しない従来挙動)', async () => {
    await authorize(createEnv());

    expect(authorizeInputs[0]).not.toHaveProperty('tds2RetUrl');
  });

  it('TDS2_RET_URL が空白のみなら未設定扱い', async () => {
    await authorize(createEnv({ TDS2_RET_URL: '   ' }));

    expect(authorizeInputs[0]).not.toHaveProperty('tds2RetUrl');
  });

  it('3DS 必要時は authorize が tds2Url を webapp に返す', async () => {
    authorizeResponse = { status: 'AUTHENTICATED', tds2Url: 'https://acs.example/3ds' };

    const res = await authorize(createEnv({ TDS2_RET_URL: 'https://app.example/r' }));
    const body = (await res.json()) as { status: string; tds2Url?: string };

    expect(body.status).toBe('AUTHENTICATED');
    expect(body.tds2Url).toBe('https://acs.example/3ds');
  });

  it('POST /3ds-callback-fincode が 200 と 3ds-verified を返す', async () => {
    const kv = createKvStub();
    const env = createEnv({
      FINCODE_STATE: kv,
      TDS2_RET_URL: 'https://app.example/r',
    } as Partial<Env>);
    await authorize(env);

    const res = await callback(env, { authId: 'auth-from-fincode' });

    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string; transResult?: string };
    expect(body.status).toBe('3ds-verified');
    expect(body.transResult).toBe('Y');
    // capture record に 3DS 結果が追記される
    const record = JSON.parse(kv._store.get('capture:auth-from-fincode') ?? '{}') as {
      threeDsStatus?: string;
      threeDsTransResult?: string;
    };
    expect(record.threeDsStatus).toBe('3ds-verified');
    expect(record.threeDsTransResult).toBe('Y');
  });

  it('チャレンジ必要時は challenge-required と challengeUrl を返す', async () => {
    const kv = createKvStub();
    const env = createEnv({
      FINCODE_STATE: kv,
      TDS2_RET_URL: 'https://app.example/r',
    } as Partial<Env>);
    await authorize(env);
    threeDsResult = {
      transResult: 'C',
      reason: undefined,
      challengeUrl: 'https://acs.example/challenge',
      authorized: false,
      status: undefined,
    };

    const res = await callback(env, { authId: 'auth-from-fincode' });
    const body = (await res.json()) as { status: string; challengeUrl?: string };

    expect(body.status).toBe('challenge-required');
    expect(body.challengeUrl).toBe('https://acs.example/challenge');
  });

  it('3DS 未認証の authId でも place-bid は与信時 ethAmount で入札する (経路の独立性)', async () => {
    const kv = createKvStub();
    const env = createEnv({
      FINCODE_STATE: kv,
      TDS2_RET_URL: 'https://app.example/r',
    } as Partial<Env>);
    await authorize(env);
    await callback(env, { authId: 'auth-from-fincode' });

    writeContractCalls.length = 0;
    const res = await worker.fetch(
      new Request('https://niji-api.example/api/v1/fiat-bid/place-bid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authId: 'auth-from-fincode', bidderWallet: BIDDER }),
      }),
      env,
    );

    expect(res.status).toBe(200);
    expect(writeContractCalls[0]?.['value']).toBe(95238095238095238n);
  });

  it('capture record が無い authId の callback は 404', async () => {
    const env = createEnv({ FINCODE_STATE: createKvStub() } as Partial<Env>);

    const res = await callback(env, { authId: 'no-such-auth' });

    expect(res.status).toBe(404);
  });
});

describe('scheduled 経路 (AuctionKeeper + SettlementDaemon)', () => {
  // OPERATOR_PK (0x11...11) から決まる operator address。
  // AuctionSettled の winner がこの address なら fiat 入札が落札した判定になる。
  const OPERATOR = privateKeyToAccount(`0x${'1'.repeat(64)}`).address;
  const AUTH_ID = 'auth-settle';
  const BIDDER = `0x${'5'.repeat(40)}`;

  /** ctx.waitUntil は非同期処理を裏に逃がすため、 test では await して完了を待つ */
  const runScheduled = async (env: Env) => {
    const pending: Array<Promise<unknown>> = [];
    await worker.scheduled({ scheduledTime: 0, cron: '* * * * *' }, env, {
      waitUntil: (p: Promise<unknown>) => pending.push(p),
      passThroughOnException: () => {},
    });
    await Promise.all(pending);
  };

  /** 入札済 auction の fiat_bid record を seed 済の KV を返す */
  const seededKv = () =>
    createKvStub({
      [`fiat_bid:${AUTH_ID}`]: JSON.stringify({
        chainAuctionId: '7',
        bidderWallet: BIDDER,
        orderId: 'fc-7-abcdef',
        accessId: 'access-7',
        jpyAmount: 4000,
        ethAmount: '12713345834790070',
        lifecycle: 'bid-placed',
        createdAt: 0,
      }),
      [`fiat_bid_by_auction:7`]: AUTH_ID,
      'cron_cursor:from_block': '90',
    });

  beforeEach(() => {
    writeContractCalls.length = 0;
    fincodeCalls.length = 0;
    getLogsCalls = [];
    writeContractError = null;
    capturePaymentError = null;
    chainLogs = [];
    chainLatestBlock = 100n;
    // settle 済 + 未終了 = AuctionKeeper が tx を送らない状態 (SettlementDaemon 側の検証に集中する)
    chainState = { nounId: 7n, amount: 0n, startTime: 1, endTime: 9_999_999_999, settled: false };
  });

  it('fiat 入札が落札した場合は capture のみ発火する (transferFrom は contract settle 経路が担当、 2026-07-23 以降)', async () => {
    const kv = seededKv();
    chainLogs = [{ args: { nounId: 7n, winner: OPERATOR, amount: 12713345834790070n } }];

    await runScheduled(createEnv({ FINCODE_STATE: kv } as Partial<Env>));

    // 2026-07-23 contract upgrade (createBidFor + BidPlacedFor) 以降、 auctionStorage.bidder = recipient
    // に set されているので settleAuction 発火時に nouns.transferFrom(auctionHouse, recipient, tokenId)
    // が contract 側で自動発火。 backend cron からの transferFrom 呼出は撤去、 capture のみ実行。
    expect(fincodeCalls).toEqual([
      { method: 'capture', orderId: 'fc-7-abcdef', accessId: 'access-7' },
    ]);
    // backend からの transferFrom 発火は無し (contract 側で完結)
    expect(writeContractCalls.find(c => c['functionName'] === 'transferFrom')).toBeUndefined();

    const record = JSON.parse(kv._store.get(`fiat_bid:${AUTH_ID}`) ?? '{}') as {
      lifecycle?: string;
      captureTxId?: string;
      transferTxHash?: string;
    };
    // lifecycle は capture 発火まで進む (transferred は撤去された経路のため到達しない、
    // NFT 到達は chain 側 event で確認する運用に切替)
    expect(record.lifecycle).toBe('captured');
    expect(record.captureTxId).toBe('txn-captured');
    expect(record.transferTxHash).toBeUndefined();
  });

  it('fiat 入札が落選した場合は cancel のみ発火し NFT を動かさない', async () => {
    const kv = seededKv();
    const otherWinner = `0x${'9'.repeat(40)}`;
    chainLogs = [{ args: { nounId: 7n, winner: otherWinner, amount: 99n } }];

    await runScheduled(createEnv({ FINCODE_STATE: kv } as Partial<Env>));

    expect(fincodeCalls).toEqual([
      { method: 'cancel', orderId: 'fc-7-abcdef', accessId: 'access-7' },
    ]);
    expect(writeContractCalls.find(c => c['functionName'] === 'transferFrom')).toBeUndefined();

    const record = JSON.parse(kv._store.get(`fiat_bid:${AUTH_ID}`) ?? '{}') as {
      lifecycle?: string;
    };
    expect(record.lifecycle).toBe('lost');
  });

  it('winner=operator なのに fiat_bid record が無い場合は ALERT を出し transferFrom しない (record 欠落検知)', async () => {
    const kv = createKvStub({ 'cron_cursor:from_block': '90' });
    // winner=operator は fiat 代理入札のはず。 record 欠落は Niji 1 で NFT が operator に留まった症状。
    chainLogs = [{ args: { nounId: 999n, winner: OPERATOR, amount: 1n } }];
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await runScheduled(createEnv({ FINCODE_STATE: kv } as Partial<Env>));

    // record 無しで転送先不明のため capture / transferFrom はしない
    expect(fincodeCalls).toHaveLength(0);
    expect(writeContractCalls.find(c => c['functionName'] === 'transferFrom')).toBeUndefined();
    // silent skip せず ALERT で検知する (運営が手動転送に気づけるように)
    expect(
      errorSpy.mock.calls.some(
        c => String(c[0]).includes('ALERT') && String(c[0]).includes('winner=operator'),
      ),
    ).toBe(true);
    errorSpy.mockRestore();
  });

  it('winner が operator 以外で record が無い場合は crypto 入札として silent skip (ALERT を出さない)', async () => {
    const kv = createKvStub({ 'cron_cursor:from_block': '90' });
    const cryptoWinner = `0x${'9'.repeat(40)}`;
    chainLogs = [{ args: { nounId: 999n, winner: cryptoWinner, amount: 1n } }];
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await runScheduled(createEnv({ FINCODE_STATE: kv } as Partial<Env>));

    expect(fincodeCalls).toHaveLength(0);
    expect(writeContractCalls.find(c => c['functionName'] === 'transferFrom')).toBeUndefined();
    // 本当の crypto 入札は正常経路なので ALERT を出さない
    expect(errorSpy.mock.calls.some(c => String(c[0]).includes('ALERT'))).toBe(false);
    errorSpy.mockRestore();
  });

  it('capture 失敗時は transferFrom に進まない (与信できていない NFT を渡さない)', async () => {
    const kv = seededKv();
    capturePaymentError = new Error('fincode capture 拒否');
    chainLogs = [{ args: { nounId: 7n, winner: OPERATOR, amount: 12713345834790070n } }];

    await runScheduled(createEnv({ FINCODE_STATE: kv } as Partial<Env>));

    expect(fincodeCalls).toEqual([
      { method: 'capture', orderId: 'fc-7-abcdef', accessId: 'access-7' },
    ]);
    expect(writeContractCalls.find(c => c['functionName'] === 'transferFrom')).toBeUndefined();

    const record = JSON.parse(kv._store.get(`fiat_bid:${AUTH_ID}`) ?? '{}') as {
      lifecycle?: string;
    };
    // capture 前に won まで進み、 capture 失敗で transferred には到達しない
    expect(record.lifecycle).toBe('won');
  });

  it('event 処理時は cron cursor を toBlock+1 へ進める (取りこぼし防止)', async () => {
    const kv = seededKv();
    // 落選 event でも「logs あり」 なので cursor は書かれる
    chainLogs = [{ args: { nounId: 7n, winner: `0x${'9'.repeat(40)}`, amount: 1n } }];

    await runScheduled(createEnv({ FINCODE_STATE: kv } as Partial<Env>));

    // getBlockNumber mock = 100n のため次回は 101 から
    expect(kv._store.get('cron_cursor:from_block')).toBe('101');
  });

  it('event 無し + 窓が小さいときは cursor を書かない (KV write 無料枠 1000/日 の節約)', async () => {
    // seededKv の cursor = 90、 latest = 100 → 窓 10 block < 300 で書込 skip
    const kv = seededKv();
    chainLogs = [];

    await runScheduled(createEnv({ FINCODE_STATE: kv } as Partial<Env>));

    // 毎分書込を止めたのが本 fix の主眼。 cursor は 90 のまま据え置き
    expect(kv._store.get('cron_cursor:from_block')).toBe('90');
  });

  it('event 無しでも窓が SETTLEMENT_CURSOR_ADVANCE 以上なら cursor を進める (窓の暴走防止)', async () => {
    // cursor = 90、 latest = 500 → 窓 410 block >= 300 で書込
    const kv = seededKv();
    chainLogs = [];
    chainLatestBlock = 500n;

    await runScheduled(createEnv({ FINCODE_STATE: kv } as Partial<Env>));

    expect(kv._store.get('cron_cursor:from_block')).toBe('501');
  });

  it('cursor が古すぎるときは getLogs の fromBlock を MAX_SCAN_WINDOW で cap する (RPC 2000 block 制限回避)', async () => {
    // cursor = 90、 latest = 5000 → 窓 4910 は 1500 超なので fromBlock = 5000 - 1500 = 3500
    const kv = seededKv();
    chainLogs = [];
    chainLatestBlock = 5000n;

    await runScheduled(createEnv({ FINCODE_STATE: kv } as Partial<Env>));

    const settlementCall = getLogsCalls.at(-1);
    expect(settlementCall?.fromBlock).toBe(3500n);
    expect(settlementCall?.toBlock).toBe(5000n);
    // 窓が広いので cursor も書かれる (5000 + 1)
    expect(kv._store.get('cron_cursor:from_block')).toBe('5001');
  });

  it('endTime 未到達の auction は settle tx を送らない (空振り gas を出さない)', async () => {
    const kv = seededKv();
    chainState = { nounId: 7n, amount: 0n, startTime: 1, endTime: 9_999_999_999, settled: false };

    await runScheduled(createEnv({ FINCODE_STATE: kv } as Partial<Env>));

    expect(
      writeContractCalls.find(c => c['functionName'] === 'settleCurrentAndCreateNewAuction'),
    ).toBeUndefined();
  });

  it('endTime 経過 + 未 settle の auction は settleCurrentAndCreateNewAuction を送る', async () => {
    const kv = seededKv();
    chainState = { nounId: 7n, amount: 0n, startTime: 1, endTime: 1, settled: false };

    await runScheduled(createEnv({ FINCODE_STATE: kv } as Partial<Env>));

    expect(
      writeContractCalls.find(c => c['functionName'] === 'settleCurrentAndCreateNewAuction'),
    ).toBeDefined();
  });
});
