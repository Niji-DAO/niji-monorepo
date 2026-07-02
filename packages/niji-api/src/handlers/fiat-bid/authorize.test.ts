/**
 * Fiat bid authorize handler behavior test (Issue #3006 Phase B/D)
 *
 * 検証対象 (完了条件 3 case + validation) —
 * (1) happy path — 200 OK で { authId, tds2Url, jpyAmount, ethAmount, spotRate, spotRateSource } 返し
 *     fiat_bid.pending record が INSERT される
 * (2) bid 上限 100 万円超過 — 400 BidLimitExceeded、 GMO client 呼ばない、 DB 書込なし
 * (3) GMO 障害 — 500 GmoAuthorizationFailed、 DB 書込なし
 * (4) request validation fail 各種 (欠損 / 型不正 / hex 形式不正) → 400 InvalidRequest
 * (5) spot rate fetch fail → 503 SpotRateUnavailable、 GMO client 呼ばない
 *
 * hono の app.request() 経由で actual handler を execute する。
 * SpotRateFetcher / GmoClient は class extend + override method で stub、
 * fiat_bid store は in-memory Map で受けて insertPending 呼出を観測する。
 *
 * rules/quality.md § test-passed marker 発行前提 3 条件 (behavior test / 変更箇所 execute / test runner PASS) 準拠。
 */

import type { AuthorizationResult } from '../../services/gmo/types.js';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GmoAuthorizationError, GmoClient } from '../../services/gmo/client.js';
import {
  SpotRateFetcher,
  SpotRateFetchError,
  type SpotRate,
} from '../../services/spotRate/index.js';

import {
  BID_LIMIT_JPY,
  convertJpyToEthWei,
  createAuthorizeApp,
  parseAuthorizeBody,
  type AuthorizeResponseBody,
  type FiatBidRecord,
  type FiatBidStore,
} from './authorize.js';

/** SpotRateFetcher stub (behavior 差替) */
class StubSpotRateFetcher extends SpotRateFetcher {
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

/** GmoClient stub (authorize method のみ差替、 entryTran/execTran は呼ばれない前提) */
class StubGmoClient extends GmoClient {
  constructor(private readonly behavior: () => Promise<AuthorizationResult>) {
    super({ endpoint: 'http://stub-gmo' });
  }

  override async authorize(): Promise<AuthorizationResult> {
    return this.behavior();
  }
}

/** in-memory FiatBidStore stub */
const makeStore = (): FiatBidStore & { records: FiatBidRecord[] } => {
  const records: FiatBidRecord[] = [];
  return {
    records,
    insertPending: async record => {
      records.push(record);
    },
  };
};

/** happy path 共通の payload */
const validBody = {
  jpyAmount: 100000,
  cardToken: 'token-visa-4111',
  bidderWallet: '0x1234567890abcdef1234567890abcdef12345678',
  auctionId: '42',
};

/** 決定的 orderId 生成 (test 用) */
const stableOrderId = (input: { auctionId: string; bidderWallet: string }): string =>
  `test-order-${input.auctionId}-${input.bidderWallet.slice(2, 8)}`;

describe('parseAuthorizeBody', () => {
  it('valid body を通す', () => {
    const result = parseAuthorizeBody(validBody);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.jpyAmount).toBe(100000);
      expect(result.value.bidderWallet).toBe('0x1234567890abcdef1234567890abcdef12345678');
    }
  });

  it('jpyAmount 欠損で reject', () => {
    const { cardToken, bidderWallet, auctionId } = validBody;
    expect(parseAuthorizeBody({ cardToken, bidderWallet, auctionId }).ok).toBe(false);
  });

  it('jpyAmount 非整数で reject', () => {
    expect(parseAuthorizeBody({ ...validBody, jpyAmount: 100.5 }).ok).toBe(false);
    expect(parseAuthorizeBody({ ...validBody, jpyAmount: -1 }).ok).toBe(false);
  });

  it('bidderWallet が hex 形式でないと reject', () => {
    expect(parseAuthorizeBody({ ...validBody, bidderWallet: '0x123' }).ok).toBe(false);
    expect(parseAuthorizeBody({ ...validBody, bidderWallet: 'not-hex' }).ok).toBe(false);
  });

  it('auctionId が decimal string 以外で reject', () => {
    expect(parseAuthorizeBody({ ...validBody, auctionId: 'abc' }).ok).toBe(false);
    expect(parseAuthorizeBody({ ...validBody, auctionId: '' }).ok).toBe(false);
  });

  it('bidderEmail は optional で undefined でも通る', () => {
    const result = parseAuthorizeBody(validBody);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.bidderEmail).toBeUndefined();
    }
  });
});

describe('convertJpyToEthWei', () => {
  it('1 万 JPY / rate=500000 = 0.02 ETH = 2e16 wei', () => {
    const wei = convertJpyToEthWei(10_000, 500_000);
    expect(wei).toBe(20_000_000_000_000_000n);
  });

  it('spot rate が 0 以下で throw', () => {
    expect(() => convertJpyToEthWei(1000, 0)).toThrow();
    expect(() => convertJpyToEthWei(1000, -100)).toThrow();
  });

  it('小数 rate も 4 桁精度で処理', () => {
    // rate = 500000.1234 で処理される
    const wei = convertJpyToEthWei(1000, 500000.1234);
    expect(wei).toBeGreaterThan(0n);
    expect(wei).toBeLessThan(3_000_000_000_000_000n); // 3e15 wei 未満 (妥当性 sanity check)
  });
});

describe('createAuthorizeApp POST /authorize', () => {
  const goodRate: SpotRate = {
    rate: 500_000,
    source: 'gmo-coin',
    cachedAt: 1000,
    expiresAt: 6000,
  };

  const goodAuth: AuthorizationResult = {
    authId: 'mock-access-00000001',
    accessPass: 'mock-pass-00000002',
    tds2Url: 'http://mock/3ds?orderId=test-order-42',
    orderId: 'test-order-42',
    approve: 'apv-1',
    tranId: 'tran-1',
  };

  let store: ReturnType<typeof makeStore>;

  beforeEach(() => {
    store = makeStore();
  });

  it('happy path — 200 OK で response body 返し fiat_bid.pending が INSERT される', async () => {
    const app = createAuthorizeApp({
      spotRateFetcher: new StubSpotRateFetcher(async () => goodRate),
      gmoClient: new StubGmoClient(async () => goodAuth),
      store,
      generateOrderId: stableOrderId,
      now: () => new Date('2026-07-02T09:00:00Z'),
    });

    const res = await app.request('/authorize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as AuthorizeResponseBody;
    expect(body.authId).toBe('mock-access-00000001');
    expect(body.tds2Url).toBe('http://mock/3ds?orderId=test-order-42');
    expect(body.jpyAmount).toBe(100000);
    expect(body.spotRate).toBe(500_000);
    expect(body.spotRateSource).toBe('gmo-coin');
    // 100000 JPY / 500000 JPY/ETH = 0.2 ETH = 2e17 wei
    expect(body.ethAmount).toBe('200000000000000000');

    // fiat_bid record が pending で 1 件 INSERT された
    expect(store.records).toHaveLength(1);
    const record = store.records[0]!;
    expect(record.authId).toBe('mock-access-00000001');
    expect(record.bidderWallet).toBe('0x1234567890abcdef1234567890abcdef12345678');
    expect(record.auctionId).toBe(42n);
    expect(record.jpyAmount).toBe(100000);
    expect(record.ethAmount).toBe(200000000000000000n);
    expect(record.spotRate).toBe(500_000);
    expect(record.spotRateSource).toBe('gmo-coin');
    expect(record.status).toBe('pending');
    expect(record.bidderEmail).toBeNull();
    expect(record.createdAt).toEqual(new Date('2026-07-02T09:00:00Z'));
  });

  it('bidderEmail 指定時は record に保存される', async () => {
    const app = createAuthorizeApp({
      spotRateFetcher: new StubSpotRateFetcher(async () => goodRate),
      gmoClient: new StubGmoClient(async () => goodAuth),
      store,
      generateOrderId: stableOrderId,
    });

    const res = await app.request('/authorize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...validBody, bidderEmail: 'winner@example.com' }),
    });
    expect(res.status).toBe(200);
    expect(store.records[0]!.bidderEmail).toBe('winner@example.com');
  });

  it('bid 上限 100 万円超過で 400 BidLimitExceeded、 GMO / DB 呼ばず', async () => {
    const gmoAuthorize = vi.fn(async () => goodAuth);
    const spotRate = vi.fn(async () => goodRate);
    const gmoClient = new StubGmoClient(gmoAuthorize);
    const spotRateFetcher = new StubSpotRateFetcher(spotRate);

    const app = createAuthorizeApp({
      spotRateFetcher,
      gmoClient,
      store,
      generateOrderId: stableOrderId,
    });

    const res = await app.request('/authorize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...validBody, jpyAmount: BID_LIMIT_JPY + 1 }),
    });

    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string; message: string };
    expect(body.error).toBe('BidLimitExceeded');
    expect(body.message).toContain(String(BID_LIMIT_JPY));

    // GMO / DB 呼ばれない
    expect(gmoAuthorize).not.toHaveBeenCalled();
    expect(spotRate).not.toHaveBeenCalled();
    expect(store.records).toHaveLength(0);
  });

  it('GMO 障害 (GmoAuthorizationError) で 500 GmoAuthorizationFailed、 DB 書込なし', async () => {
    const app = createAuthorizeApp({
      spotRateFetcher: new StubSpotRateFetcher(async () => goodRate),
      gmoClient: new StubGmoClient(async () => {
        throw new GmoAuthorizationError('GMO execTran failed (G02)', {
          errCode: 'G02',
          errInfo: 'G02180001',
        });
      }),
      store,
      generateOrderId: stableOrderId,
    });

    const res = await app.request('/authorize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });

    expect(res.status).toBe(500);
    const body = (await res.json()) as {
      error: string;
      message: string;
      errCode: string | null;
      errInfo: string | null;
    };
    expect(body.error).toBe('GmoAuthorizationFailed');
    expect(body.errCode).toBe('G02');
    expect(body.errInfo).toBe('G02180001');
    expect(store.records).toHaveLength(0);
  });

  it('spot rate 取得失敗で 503 SpotRateUnavailable、 GMO 呼ばず', async () => {
    const gmoAuthorize = vi.fn(async () => goodAuth);
    const gmoClient = new StubGmoClient(gmoAuthorize);
    const app = createAuthorizeApp({
      spotRateFetcher: new StubSpotRateFetcher(async () => {
        throw new SpotRateFetchError('primary and fallback both failed');
      }),
      gmoClient,
      store,
      generateOrderId: stableOrderId,
    });

    const res = await app.request('/authorize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });

    expect(res.status).toBe(503);
    const body = (await res.json()) as { error: string; message: string };
    expect(body.error).toBe('SpotRateUnavailable');
    expect(gmoAuthorize).not.toHaveBeenCalled();
    expect(store.records).toHaveLength(0);
  });

  it('request body が invalid JSON で 400 InvalidRequest', async () => {
    const app = createAuthorizeApp({
      spotRateFetcher: new StubSpotRateFetcher(async () => goodRate),
      gmoClient: new StubGmoClient(async () => goodAuth),
      store,
      generateOrderId: stableOrderId,
    });

    const res = await app.request('/authorize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json{',
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('InvalidRequest');
  });

  it('bidderWallet 形式不正で 400 InvalidRequest、 spot rate / GMO 呼ばず', async () => {
    const gmoAuthorize = vi.fn(async () => goodAuth);
    const spotRate = vi.fn(async () => goodRate);
    const app = createAuthorizeApp({
      spotRateFetcher: new StubSpotRateFetcher(spotRate),
      gmoClient: new StubGmoClient(gmoAuthorize),
      store,
      generateOrderId: stableOrderId,
    });

    const res = await app.request('/authorize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...validBody, bidderWallet: '0xNOT_VALID' }),
    });

    expect(res.status).toBe(400);
    expect(gmoAuthorize).not.toHaveBeenCalled();
    expect(spotRate).not.toHaveBeenCalled();
  });

  it('store.insertPending fail で 500 InternalError', async () => {
    const failingStore: FiatBidStore = {
      insertPending: async () => {
        throw new Error('DB unreachable');
      },
    };
    const app = createAuthorizeApp({
      spotRateFetcher: new StubSpotRateFetcher(async () => goodRate),
      gmoClient: new StubGmoClient(async () => goodAuth),
      store: failingStore,
      generateOrderId: stableOrderId,
    });

    const res = await app.request('/authorize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });
    expect(res.status).toBe(500);
    const body = (await res.json()) as { error: string; message: string };
    expect(body.error).toBe('InternalError');
    expect(body.message).toContain('fiat_bid store failed');
  });

  it('CoinGecko fallback 応答 (source=coingecko) も handler 経由で通る', async () => {
    const fallbackRate: SpotRate = {
      rate: 498_000,
      source: 'coingecko',
      cachedAt: 2000,
      expiresAt: 7000,
    };
    const app = createAuthorizeApp({
      spotRateFetcher: new StubSpotRateFetcher(async () => fallbackRate),
      gmoClient: new StubGmoClient(async () => goodAuth),
      store,
      generateOrderId: stableOrderId,
    });

    const res = await app.request('/authorize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as AuthorizeResponseBody;
    expect(body.spotRateSource).toBe('coingecko');
    expect(body.spotRate).toBe(498_000);
    expect(store.records[0]!.spotRateSource).toBe('coingecko');
  });
});
