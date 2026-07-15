/**
 * Fiat bid authorize-fincode handler behavior test (Phase 2 backend 統合、 Issue #3115)
 *
 * 検証対象 —
 * (1) happy path — 200 OK で { authId, tds2Url, jpyAmount, ethAmount, spotRate, spotRateSource, status } 返し
 *     fiat_bid.pending record が INSERT される
 * (2) 3DS 必要 pattern — status = AUTHENTICATED + acs_url 応答
 * (3) bid 上限 100 万円超過 — 400 BidLimitExceeded、 FincodeClient 呼ばない、 DB 書込なし
 * (4) fincode 障害 — 500 FincodeAuthorizationFailed、 DB 書込なし
 * (5) request validation fail — 400 InvalidRequest
 * (6) spot rate fetch fail → 503 SpotRateUnavailable、 FincodeClient 呼ばない
 *
 * hono の app.request() 経由で actual handler を execute する。
 * SpotRateFetcher / FincodeClient は class extend + override method で stub、
 * fiat_bid store は in-memory Map で受けて insertPending 呼出を観測する。
 *
 * SSOT — packages/niji-api/src/handlers/fiat-bid/authorize.test.ts (GMO 経路と対比 mirror pattern)、
 *        rules/quality.md § test-passed marker 発行前提 4 条件準拠。
 */

import type { FiatBidRecord, FiatBidStore } from './authorize.js';
import type { FincodeAuthorizationResult } from '../../services/fincode/types.js';

import { describe, expect, it } from 'vitest';

import { FincodeAuthorizationError, FincodeClient } from '../../services/fincode/client.js';
import {
  SpotRateFetcher,
  SpotRateFetchError,
  type SpotRate,
} from '../../services/spotRate/index.js';

import { createAuthorizeFincodeApp } from './authorize-fincode.js';

/** SpotRateFetcher stub */
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

/** FincodeClient stub */
class StubFincodeClient extends FincodeClient {
  constructor(private readonly behavior: () => Promise<FincodeAuthorizationResult>) {
    super({ endpoint: 'http://stub-fincode', apiKeySecret: 'm_test_stub' });
  }

  override async authorize(): Promise<FincodeAuthorizationResult> {
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

/** happy path 共通の payload (authorize.ts と同 shape) */
const validBody = {
  ethAmount: '200000000000000000',
  spotRate: 500_000,
  jpyAmount: 100_000,
  cardToken: 'card_token_visa_4111',
  bidderWallet: '0x1234567890abcdef1234567890abcdef12345678',
  auctionId: '42',
};

const stableOrderId = (input: { auctionId: string; bidderWallet: string }): string =>
  `test-fincode-order-${input.auctionId}-${input.bidderWallet.slice(2, 8)}`;

const stableNow = () => new Date('2026-07-15T12:00:00Z');

describe('POST /authorize-fincode — happy path (AUTHORIZED)', () => {
  it('200 OK で auth 結果を返し fiat_bid.pending を INSERT する', async () => {
    const spotRateFetcher = new StubSpotRateFetcher(async () => ({
      rate: 500_000,
      source: 'gmo-coin',
      cachedAt: Date.parse('2026-07-15T12:00:00Z'),
      expiresAt: Date.parse('2026-07-15T12:00:05Z'),
    }));
    const fincodeClient = new StubFincodeClient(async () => ({
      authId: 'acc-happy-001',
      accessId: 'acc-happy-001',
      tds2Url: undefined,
      orderId: 'test-fincode-order-42-123456',
      status: 'AUTHORIZED',
      approve: '9876543',
      transactionId: 'tx-happy-001',
    }));
    const store = makeStore();
    const app = createAuthorizeFincodeApp({
      fincodeClient,
      spotRateFetcher,
      store,
      generateOrderId: stableOrderId,
      now: stableNow,
    });

    const res = await app.request('/authorize-fincode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      authId: string;
      status: string;
      jpyAmount: number;
      ethAmount: string;
      spotRate: number;
      spotRateSource: string;
    };
    expect(body.authId).toBe('acc-happy-001');
    expect(body.status).toBe('AUTHORIZED');
    expect(body.jpyAmount).toBe(100_000);
    expect(body.ethAmount).toBe('200000000000000000');
    expect(body.spotRate).toBe(500_000);
    expect(body.spotRateSource).toBe('gmo-coin');

    expect(store.records).toHaveLength(1);
    const record = store.records[0];
    if (record === undefined) throw new Error('record missing');
    expect(record.authId).toBe('acc-happy-001');
    expect(record.status).toBe('pending');
    expect(record.jpyAmount).toBe(100_000);
    expect(record.ethAmount).toBe(200000000000000000n);
    expect(record.spotRateSource).toBe('gmo-coin');
  });
});

describe('POST /authorize-fincode — 3DS 必要 (AUTHENTICATED)', () => {
  it('200 OK + status=AUTHENTICATED + tds2Url を返す', async () => {
    const spotRateFetcher = new StubSpotRateFetcher(async () => ({
      rate: 500_000,
      source: 'gmo-coin',
      cachedAt: Date.parse('2026-07-15T12:00:00Z'),
      expiresAt: Date.parse('2026-07-15T12:00:05Z'),
    }));
    const fincodeClient = new StubFincodeClient(async () => ({
      authId: 'acc-3ds-001',
      accessId: 'acc-3ds-001',
      tds2Url: 'https://acs.example/3ds?token=xyz',
      orderId: 'test-fincode-order-42-123456',
      status: 'AUTHENTICATED',
      approve: undefined,
      transactionId: 'tx-3ds-001',
    }));
    const store = makeStore();
    const app = createAuthorizeFincodeApp({
      fincodeClient,
      spotRateFetcher,
      store,
      generateOrderId: stableOrderId,
      now: stableNow,
    });

    const res = await app.request('/authorize-fincode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string; tds2Url: string };
    expect(body.status).toBe('AUTHENTICATED');
    expect(body.tds2Url).toBe('https://acs.example/3ds?token=xyz');
  });
});

describe('POST /authorize-fincode — 400 BidLimitExceeded', () => {
  it('jpyAmount > 100 万円 の request を 400 で reject、 fincode 呼ばない', async () => {
    let fincodeCalled = false;
    const spotRateFetcher = new StubSpotRateFetcher(async () => ({
      rate: 500_000,
      source: 'gmo-coin',
      cachedAt: Date.parse('2026-07-15T12:00:00Z'),
      expiresAt: Date.parse('2026-07-15T12:00:05Z'),
    }));
    const fincodeClient = new StubFincodeClient(async () => {
      fincodeCalled = true;
      throw new Error('fincode should not be called');
    });
    const store = makeStore();
    const app = createAuthorizeFincodeApp({
      fincodeClient,
      spotRateFetcher,
      store,
      generateOrderId: stableOrderId,
      now: stableNow,
    });

    const res = await app.request('/authorize-fincode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...validBody, jpyAmount: 1_000_001 }),
    });

    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('BidLimitExceeded');
    expect(fincodeCalled).toBe(false);
    expect(store.records).toHaveLength(0);
  });
});

describe('POST /authorize-fincode — 500 FincodeAuthorizationFailed', () => {
  it('fincode error 時に 500 FincodeAuthorizationFailed を返し DB 書込しない', async () => {
    const spotRateFetcher = new StubSpotRateFetcher(async () => ({
      rate: 500_000,
      source: 'gmo-coin',
      cachedAt: Date.parse('2026-07-15T12:00:00Z'),
      expiresAt: Date.parse('2026-07-15T12:00:05Z'),
    }));
    const fincodeClient = new StubFincodeClient(async () => {
      throw new FincodeAuthorizationError('fincode declined', {
        errorCode: 'CARD_DECLINED',
        errorMessage: 'card declined by issuer',
      });
    });
    const store = makeStore();
    const app = createAuthorizeFincodeApp({
      fincodeClient,
      spotRateFetcher,
      store,
      generateOrderId: stableOrderId,
      now: stableNow,
    });

    const res = await app.request('/authorize-fincode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });

    expect(res.status).toBe(500);
    const body = (await res.json()) as { error: string; errorCode: string };
    expect(body.error).toBe('FincodeAuthorizationFailed');
    expect(body.errorCode).toBe('CARD_DECLINED');
    expect(store.records).toHaveLength(0);
  });
});

describe('POST /authorize-fincode — 400 InvalidRequest', () => {
  it('invalid JSON body で 400 を返す', async () => {
    const spotRateFetcher = new StubSpotRateFetcher(async () => ({
      rate: 500_000,
      source: 'gmo-coin',
      cachedAt: Date.parse('2026-07-15T12:00:00Z'),
      expiresAt: Date.parse('2026-07-15T12:00:05Z'),
    }));
    const fincodeClient = new StubFincodeClient(async () => {
      throw new Error('should not be called');
    });
    const store = makeStore();
    const app = createAuthorizeFincodeApp({
      fincodeClient,
      spotRateFetcher,
      store,
    });

    const res = await app.request('/authorize-fincode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    });

    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('InvalidRequest');
  });

  it('cardToken 欠損で 400 InvalidRequest', async () => {
    const spotRateFetcher = new StubSpotRateFetcher(async () => ({
      rate: 500_000,
      source: 'gmo-coin',
      cachedAt: Date.parse('2026-07-15T12:00:00Z'),
      expiresAt: Date.parse('2026-07-15T12:00:05Z'),
    }));
    const fincodeClient = new StubFincodeClient(async () => {
      throw new Error('should not be called');
    });
    const store = makeStore();
    const app = createAuthorizeFincodeApp({
      fincodeClient,
      spotRateFetcher,
      store,
    });

    const { cardToken: _unused, ...rest } = validBody;
    void _unused;
    const res = await app.request('/authorize-fincode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rest),
    });

    expect(res.status).toBe(400);
  });
});

describe('POST /authorize-fincode — 503 SpotRateUnavailable', () => {
  it('spot rate fetch fail 時に 503 を返し fincode 呼ばない', async () => {
    let fincodeCalled = false;
    const spotRateFetcher = new StubSpotRateFetcher(async () => {
      throw new SpotRateFetchError('all sources failed');
    });
    const fincodeClient = new StubFincodeClient(async () => {
      fincodeCalled = true;
      throw new Error('should not be called');
    });
    const store = makeStore();
    const app = createAuthorizeFincodeApp({
      fincodeClient,
      spotRateFetcher,
      store,
      generateOrderId: stableOrderId,
      now: stableNow,
    });

    const res = await app.request('/authorize-fincode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });

    expect(res.status).toBe(503);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('SpotRateUnavailable');
    expect(fincodeCalled).toBe(false);
    expect(store.records).toHaveLength(0);
  });
});
