/**
 * Fiat bid topup handler behavior test (Issue #3023 Phase 2)
 *
 * 検証対象 (完了条件 5 case + validation + error 分岐) —
 * (1) happy path — 200 OK で { status: "bid-placed", newAuthId, oldAuthId, txHash }、
 *     GMO 新 authorize + BidRelay.placeBid + AuthCleanupQueue.enqueue(oldAuthId) + store.updateToNewAuth
 * (2) validation — newJpyAmount ≤ oldJpyAmount で 400 InvalidRequest、 GMO / BidRelay / cleanup 呼ばず
 * (3) 100 万円上限超過 — newJpyAmount > 1_000_000 で 400 BidLimitExceeded、 全部呼ばず
 * (4) status ≠ bid-placed で 409 Conflict、 GMO / BidRelay / cleanup 呼ばず
 * (5) authId not found で 404 NotFound、 全部呼ばず
 * (6) parseTopupBody 単体 validation
 * (7) messageForTopupRevertReason 単体 mapping
 * (8) revert (BidTooLow) — 新 auth GMO cancel + 旧 auth 保持 + AuthCleanupQueue.enqueue 呼ばず
 * (9) request body invalid JSON — 400 InvalidRequest
 * (10) spot rate fetch fail — 503 SpotRateUnavailable
 * (11) GMO authorize fail — 500 GmoAuthorizationFailed
 *
 * hono の app.request() 経由で actual handler を execute する。
 * BidRelay / GmoClient / SpotRateFetcher は class stub、 AuthCleanupQueue は enqueue spy で観測。
 *
 * rules/quality.md § test-passed marker 発行前提 3 条件準拠 (behavior test / 変更箇所 execute / test runner PASS)。
 */

import type {
  AlterTranSuccess,
  AuthorizationResult,
  SecureTran2Success,
} from '../../services/gmo/types.js';
import type { Hash } from 'viem';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BidRelay, BidRelayError, type SignerProvider } from '../../services/bidRelay/index.js';
import { GmoAuthorizationError, GmoClient } from '../../services/gmo/client.js';
import { SpotRateFetcher, SpotRateFetchError } from '../../services/spotRate/index.js';

import {
  createTopupApp,
  messageForTopupRevertReason,
  parseTopupBody,
  type CleanupQueue,
  type TopupResponseBody,
  type TopupStore,
} from './topup.js';

/** GmoClient stub (authorize / cancelAuthorization method のみ差替) */
class StubGmoClient extends GmoClient {
  constructor(
    private readonly behavior: {
      authorize?: () => Promise<AuthorizationResult>;
      cancelAuthorization?: () => Promise<AlterTranSuccess>;
      verifyTds2?: () => Promise<SecureTran2Success>;
    } = {},
  ) {
    super({ endpoint: 'http://stub-gmo' });
  }
  override async authorize(): Promise<AuthorizationResult> {
    if (this.behavior.authorize === undefined) {
      throw new Error('StubGmoClient.authorize behavior not set');
    }
    return this.behavior.authorize();
  }
  override async cancelAuthorization(): Promise<AlterTranSuccess> {
    if (this.behavior.cancelAuthorization === undefined) {
      throw new Error('StubGmoClient.cancelAuthorization behavior not set');
    }
    return this.behavior.cancelAuthorization();
  }
  override async verifyTds2(): Promise<SecureTran2Success> {
    if (this.behavior.verifyTds2 === undefined) {
      throw new Error('StubGmoClient.verifyTds2 behavior not set');
    }
    return this.behavior.verifyTds2();
  }
}

/** BidRelay stub (placeBid のみ差替、 constructor は minimal signer / publicClient で満たす) */
class StubBidRelay extends BidRelay {
  constructor(
    private readonly placeBidBehavior:
      | { kind: 'success'; txHash: Hash; auctionId: bigint }
      | { kind: 'error'; error: BidRelayError },
  ) {
    const dummySigner: SignerProvider = {
      address: '0x0000000000000000000000000000000000000000',
      getWalletClient: () => {
        throw new Error('StubBidRelay: getWalletClient should not be called');
      },
    };
    super({
      signer: dummySigner,
      publicClient: {
        readContract: async () => ({}),
      } as unknown as import('viem').PublicClient,
      auctionHouseAddress: '0x0000000000000000000000000000000000000000',
    });
  }

  override async placeBid(input: { ethAmount: bigint }) {
    if (this.placeBidBehavior.kind === 'error') {
      throw this.placeBidBehavior.error;
    }
    return {
      txHash: this.placeBidBehavior.txHash,
      auctionId: this.placeBidBehavior.auctionId,
      ethAmount: input.ethAmount,
    };
  }
}

/** SpotRateFetcher stub (getEthJpyRate のみ差替) */
class StubSpotRateFetcher extends SpotRateFetcher {
  constructor(
    private readonly behavior:
      | { kind: 'success'; rate: number; source: 'gmo-coin' | 'coingecko' }
      | { kind: 'error'; error: Error },
  ) {
    super();
  }
  override async getEthJpyRate() {
    if (this.behavior.kind === 'error') {
      throw this.behavior.error;
    }
    return {
      rate: this.behavior.rate,
      source: this.behavior.source,
      cachedAt: Date.now(),
      expiresAt: Date.now() + 5000,
    };
  }
}

/** CleanupQueue spy (enqueue 呼出を record) */
const makeCleanupQueueSpy = (): CleanupQueue & { enqueued: string[] } => {
  const enqueued: string[] = [];
  return {
    enqueued,
    enqueue: (authId: string) => {
      enqueued.push(authId);
    },
  };
};

/** in-memory TopupStore stub */
type StubRecord = {
  authId: string;
  status: string;
  jpyAmount: number;
  ethAmount: bigint;
  bidderWallet: `0x${string}`;
  bidderEmail: string | null;
  auctionId: bigint;
  accessPass: string;
  createdAt: Date;
};

const makeStore = (
  seed: StubRecord | null = null,
): TopupStore & {
  updates: Array<{
    oldAuthId: string;
    newAuthId: string;
    newJpyAmount: number;
    newEthAmount: bigint;
    spotRate: number;
    spotRateSource: 'gmo-coin' | 'coingecko';
  }>;
  lookups: string[];
} => {
  const updates: Array<{
    oldAuthId: string;
    newAuthId: string;
    newJpyAmount: number;
    newEthAmount: bigint;
    spotRate: number;
    spotRateSource: 'gmo-coin' | 'coingecko';
  }> = [];
  const lookups: string[] = [];
  const records = new Map<string, StubRecord>();
  if (seed) records.set(seed.authId, seed);
  return {
    updates,
    lookups,
    findBidPlaced: async authId => {
      lookups.push(authId);
      return records.get(authId) ?? null;
    },
    updateToNewAuth: async input => {
      updates.push(input);
      const existing = records.get(input.oldAuthId);
      if (existing) {
        records.delete(input.oldAuthId);
        records.set(input.newAuthId, {
          ...existing,
          authId: input.newAuthId,
          jpyAmount: input.newJpyAmount,
          ethAmount: input.newEthAmount,
        });
      }
    },
  };
};

const seededBidPlacedRecord: StubRecord = {
  authId: 'mock-access-00000001',
  status: 'bid-placed',
  jpyAmount: 500_000,
  ethAmount: 100_000_000_000_000_000n, // 0.1 ETH wei
  bidderWallet: '0x1111111111111111111111111111111111111111',
  bidderEmail: 'bidder@example.com',
  auctionId: 42n,
  accessPass: 'mock-pass-00000002',
  createdAt: new Date('2026-07-01T00:00:00Z'),
};

const validBody = {
  authId: 'mock-access-00000001',
  newJpyAmount: 700_000,
  cardToken: 'card-token-abcdef',
};

const stubTxHash = '0xdeadbeef000000000000000000000000000000000000000000000000000000ff' as Hash;

const newAuthResult: AuthorizationResult = {
  authId: 'mock-access-00000003',
  accessPass: 'mock-pass-00000004',
  tds2Url: 'https://gmo-stub.example.com/tds2/verify?tran=00000003',
  orderId: 'topup-mock-access--700000-abc-def',
  approve: '3399',
  tranId: 'txn-mock-access-00000003',
};

const goodCancel: AlterTranSuccess = {
  accessId: 'mock-access-00000003',
  accessPass: 'mock-pass-00000004',
  status: 'VOID',
};

describe('parseTopupBody', () => {
  it('valid body を通す', () => {
    const result = parseTopupBody(validBody);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.authId).toBe('mock-access-00000001');
      expect(result.value.newJpyAmount).toBe(700_000);
      expect(result.value.cardToken).toBe('card-token-abcdef');
    }
  });

  it('authId 欠損で reject', () => {
    expect(parseTopupBody({ newJpyAmount: 700_000, cardToken: 't' }).ok).toBe(false);
    expect(parseTopupBody({ authId: '', newJpyAmount: 700_000, cardToken: 't' }).ok).toBe(false);
    expect(parseTopupBody({ authId: '   ', newJpyAmount: 700_000, cardToken: 't' }).ok).toBe(false);
  });

  it('newJpyAmount 欠損 / 型不正 / 非正整数で reject', () => {
    expect(parseTopupBody({ authId: 'a', cardToken: 't' }).ok).toBe(false);
    expect(parseTopupBody({ authId: 'a', newJpyAmount: 'x', cardToken: 't' }).ok).toBe(false);
    expect(parseTopupBody({ authId: 'a', newJpyAmount: 100.5, cardToken: 't' }).ok).toBe(false);
    expect(parseTopupBody({ authId: 'a', newJpyAmount: 0, cardToken: 't' }).ok).toBe(false);
    expect(parseTopupBody({ authId: 'a', newJpyAmount: -1, cardToken: 't' }).ok).toBe(false);
  });

  it('cardToken 欠損で reject', () => {
    expect(parseTopupBody({ authId: 'a', newJpyAmount: 700_000 }).ok).toBe(false);
    expect(parseTopupBody({ authId: 'a', newJpyAmount: 700_000, cardToken: '' }).ok).toBe(false);
  });

  it('null / 非 object で reject', () => {
    expect(parseTopupBody(null).ok).toBe(false);
    expect(parseTopupBody('string').ok).toBe(false);
    expect(parseTopupBody(42).ok).toBe(false);
  });
});

describe('messageForTopupRevertReason', () => {
  it('各 reason に対して user 通知 msg を返す', () => {
    expect(messageForTopupRevertReason('BidTooLow')).toContain('上乗せ');
    expect(messageForTopupRevertReason('AuctionEnded')).toContain('終了');
    expect(messageForTopupRevertReason('GasPriceHigh')).toContain('混雑');
    expect(messageForTopupRevertReason('RpcError')).toContain('network');
    expect(messageForTopupRevertReason('Unknown')).toContain('broadcast');
  });
});

describe('createTopupApp POST /topup', () => {
  let store: ReturnType<typeof makeStore>;
  let cleanupQueue: ReturnType<typeof makeCleanupQueueSpy>;

  beforeEach(() => {
    store = makeStore(seededBidPlacedRecord);
    cleanupQueue = makeCleanupQueueSpy();
  });

  it('happy path — 5 phase sequential 完走で 200 OK + status=bid-placed', async () => {
    const cancelStub = vi.fn(async () => goodCancel);
    const authorizeStub = vi.fn(async () => newAuthResult);
    const bidRelay = new StubBidRelay({
      kind: 'success',
      txHash: stubTxHash,
      auctionId: 42n,
    });
    const app = createTopupApp({
      bidRelay,
      gmoClient: new StubGmoClient({
        authorize: authorizeStub,
        cancelAuthorization: cancelStub,
      }),
      spotRateFetcher: new StubSpotRateFetcher({
        kind: 'success',
        rate: 500_000, // 1 ETH = 500,000 JPY
        source: 'gmo-coin',
      }),
      cleanupQueue,
      store,
      generateOrderId: () => 'topup-stub-orderid',
    });

    const res = await app.request('/topup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as TopupResponseBody;

    // 新 authId が発行されて top level に返る
    expect(body.authId).toBe(newAuthResult.authId);
    expect(body.oldAuthId).toBe('mock-access-00000001');
    expect(body.status).toBe('bid-placed');
    expect(body.txHash).toBe(stubTxHash);
    expect(body.jpyAmount).toBe(700_000);
    expect(body.spotRate).toBe(500_000);
    expect(body.spotRateSource).toBe('gmo-coin');
    // ETH wei = 700,000 * 1e18 / 500,000 = 1.4e18
    expect(body.ethAmount).toBe('1400000000000000000');

    // 副作用検証 —
    // GMO authorize 1 回 (新 auth 発行) + cancel は呼ばれない
    expect(authorizeStub).toHaveBeenCalledTimes(1);
    expect(cancelStub).not.toHaveBeenCalled();
    // AuthCleanupQueue に旧 authId が enqueue された
    expect(cleanupQueue.enqueued).toEqual(['mock-access-00000001']);
    // store.updateToNewAuth が新 authId で呼ばれた
    expect(store.updates).toHaveLength(1);
    expect(store.updates[0]).toEqual({
      oldAuthId: 'mock-access-00000001',
      newAuthId: newAuthResult.authId,
      newJpyAmount: 700_000,
      newEthAmount: 1_400_000_000_000_000_000n,
      spotRate: 500_000,
      spotRateSource: 'gmo-coin',
    });
  });

  it('newJpyAmount ≤ oldJpyAmount で 400 InvalidRequest、 GMO / BidRelay / cleanup 呼ばず', async () => {
    const authorizeStub = vi.fn();
    const placeBidStub = vi.fn();
    const bidRelay = new StubBidRelay({
      kind: 'success',
      txHash: stubTxHash,
      auctionId: 42n,
    });
    bidRelay.placeBid = placeBidStub;

    const app = createTopupApp({
      bidRelay,
      gmoClient: new StubGmoClient({ authorize: authorizeStub }),
      spotRateFetcher: new StubSpotRateFetcher({
        kind: 'success',
        rate: 500_000,
        source: 'gmo-coin',
      }),
      cleanupQueue,
      store,
    });

    // seededBidPlacedRecord.jpyAmount = 500_000、 同額でも reject
    const res = await app.request('/topup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...validBody, newJpyAmount: 500_000 }),
    });

    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string; message: string };
    expect(body.error).toBe('InvalidRequest');
    expect(body.message).toContain('must be greater than current jpyAmount');

    expect(authorizeStub).not.toHaveBeenCalled();
    expect(placeBidStub).not.toHaveBeenCalled();
    expect(cleanupQueue.enqueued).toEqual([]);
    expect(store.updates).toHaveLength(0);
  });

  it('newJpyAmount > 100 万円で 400 BidLimitExceeded、 全部呼ばず', async () => {
    const authorizeStub = vi.fn();
    const placeBidStub = vi.fn();
    const bidRelay = new StubBidRelay({
      kind: 'success',
      txHash: stubTxHash,
      auctionId: 42n,
    });
    bidRelay.placeBid = placeBidStub;

    const app = createTopupApp({
      bidRelay,
      gmoClient: new StubGmoClient({ authorize: authorizeStub }),
      spotRateFetcher: new StubSpotRateFetcher({
        kind: 'success',
        rate: 500_000,
        source: 'gmo-coin',
      }),
      cleanupQueue,
      store,
    });

    const res = await app.request('/topup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...validBody, newJpyAmount: 1_500_000 }),
    });

    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string; message: string };
    expect(body.error).toBe('BidLimitExceeded');

    expect(authorizeStub).not.toHaveBeenCalled();
    expect(placeBidStub).not.toHaveBeenCalled();
    expect(cleanupQueue.enqueued).toEqual([]);
    expect(store.updates).toHaveLength(0);
    // findBidPlaced は BidLimit check 後の lookup なので呼ばれない (100 万円 check が先)
    expect(store.lookups).toEqual([]);
  });

  it('status ≠ bid-placed で 409 Conflict、 GMO / BidRelay / cleanup 呼ばず', async () => {
    const authorizeStub = vi.fn();
    const placeBidStub = vi.fn();
    const bidRelay = new StubBidRelay({
      kind: 'success',
      txHash: stubTxHash,
      auctionId: 42n,
    });
    bidRelay.placeBid = placeBidStub;

    const pendingStore = makeStore({ ...seededBidPlacedRecord, status: '3ds-verified' });

    const app = createTopupApp({
      bidRelay,
      gmoClient: new StubGmoClient({ authorize: authorizeStub }),
      spotRateFetcher: new StubSpotRateFetcher({
        kind: 'success',
        rate: 500_000,
        source: 'gmo-coin',
      }),
      cleanupQueue,
      store: pendingStore,
    });

    const res = await app.request('/topup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });

    expect(res.status).toBe(409);
    const body = (await res.json()) as { error: string; actualStatus: string };
    expect(body.error).toBe('Conflict');
    expect(body.actualStatus).toBe('3ds-verified');

    expect(authorizeStub).not.toHaveBeenCalled();
    expect(placeBidStub).not.toHaveBeenCalled();
    expect(cleanupQueue.enqueued).toEqual([]);
    expect(pendingStore.updates).toHaveLength(0);
  });

  it('authId not found で 404 NotFound、 全部呼ばず', async () => {
    const authorizeStub = vi.fn();
    const placeBidStub = vi.fn();
    const bidRelay = new StubBidRelay({
      kind: 'success',
      txHash: stubTxHash,
      auctionId: 42n,
    });
    bidRelay.placeBid = placeBidStub;

    const emptyStore = makeStore(null);

    const app = createTopupApp({
      bidRelay,
      gmoClient: new StubGmoClient({ authorize: authorizeStub }),
      spotRateFetcher: new StubSpotRateFetcher({
        kind: 'success',
        rate: 500_000,
        source: 'gmo-coin',
      }),
      cleanupQueue,
      store: emptyStore,
    });

    const res = await app.request('/topup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });

    expect(res.status).toBe(404);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('NotFound');

    expect(authorizeStub).not.toHaveBeenCalled();
    expect(placeBidStub).not.toHaveBeenCalled();
    expect(cleanupQueue.enqueued).toEqual([]);
    expect(emptyStore.updates).toHaveLength(0);
    expect(emptyStore.lookups).toContain('mock-access-00000001');
  });

  it('BidRelay revert (BidTooLow) — 新 auth を GMO cancel + 旧 auth は保持 (cleanup enqueue しない)', async () => {
    const cancelStub = vi.fn(async () => goodCancel);
    const authorizeStub = vi.fn(async () => newAuthResult);
    const bidRelay = new StubBidRelay({
      kind: 'error',
      error: new BidRelayError('execution reverted: BidTooLow()', { reason: 'BidTooLow' }),
    });
    const app = createTopupApp({
      bidRelay,
      gmoClient: new StubGmoClient({
        authorize: authorizeStub,
        cancelAuthorization: cancelStub,
      }),
      spotRateFetcher: new StubSpotRateFetcher({
        kind: 'success',
        rate: 500_000,
        source: 'gmo-coin',
      }),
      cleanupQueue,
      store,
    });

    const res = await app.request('/topup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as TopupResponseBody;
    expect(body.status).toBe('cancelled');
    // revert 時は旧 authId をそのまま authId として返却 (増額前状態のまま)
    expect(body.authId).toBe('mock-access-00000001');
    expect(body.oldAuthId).toBe('mock-access-00000001');
    expect(body.txHash).toBe(null);
    expect(body.message).toContain('上乗せ');
    // 旧 record の jpyAmount がそのまま返る (増額されない)
    expect(body.jpyAmount).toBe(500_000);

    // 新 auth 発行 → cancel まで呼ばれる、 旧 auth の cleanup は enqueue しない (増額前状態保持)
    expect(authorizeStub).toHaveBeenCalledTimes(1);
    expect(cancelStub).toHaveBeenCalledTimes(1);
    expect(cleanupQueue.enqueued).toEqual([]);
    // store update も呼ばれない (旧 record 保持)
    expect(store.updates).toHaveLength(0);
  });

  it('request body が invalid JSON で 400 InvalidRequest', async () => {
    const bidRelay = new StubBidRelay({
      kind: 'success',
      txHash: stubTxHash,
      auctionId: 42n,
    });
    const app = createTopupApp({
      bidRelay,
      gmoClient: new StubGmoClient(),
      spotRateFetcher: new StubSpotRateFetcher({
        kind: 'success',
        rate: 500_000,
        source: 'gmo-coin',
      }),
      cleanupQueue,
      store,
    });

    const res = await app.request('/topup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json{',
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('InvalidRequest');
  });

  it('spot rate fetch fail で 503 SpotRateUnavailable、 GMO / BidRelay / cleanup 呼ばず', async () => {
    const authorizeStub = vi.fn();
    const placeBidStub = vi.fn();
    const bidRelay = new StubBidRelay({
      kind: 'success',
      txHash: stubTxHash,
      auctionId: 42n,
    });
    bidRelay.placeBid = placeBidStub;

    const app = createTopupApp({
      bidRelay,
      gmoClient: new StubGmoClient({ authorize: authorizeStub }),
      spotRateFetcher: new StubSpotRateFetcher({
        kind: 'error',
        error: new SpotRateFetchError('primary + fallback both failed'),
      }),
      cleanupQueue,
      store,
    });

    const res = await app.request('/topup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });

    expect(res.status).toBe(503);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('SpotRateUnavailable');

    expect(authorizeStub).not.toHaveBeenCalled();
    expect(placeBidStub).not.toHaveBeenCalled();
    expect(cleanupQueue.enqueued).toEqual([]);
  });

  it('GMO authorize fail で 500 GmoAuthorizationFailed、 BidRelay / cleanup 呼ばず', async () => {
    const placeBidStub = vi.fn();
    const bidRelay = new StubBidRelay({
      kind: 'success',
      txHash: stubTxHash,
      auctionId: 42n,
    });
    bidRelay.placeBid = placeBidStub;

    const app = createTopupApp({
      bidRelay,
      gmoClient: new StubGmoClient({
        authorize: async () => {
          throw new GmoAuthorizationError('GMO execTran failed (G02)', {
            errCode: 'G02',
            errInfo: 'G02180001',
          });
        },
      }),
      spotRateFetcher: new StubSpotRateFetcher({
        kind: 'success',
        rate: 500_000,
        source: 'gmo-coin',
      }),
      cleanupQueue,
      store,
    });

    const res = await app.request('/topup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });

    expect(res.status).toBe(500);
    const body = (await res.json()) as { error: string; errCode: string };
    expect(body.error).toBe('GmoAuthorizationFailed');
    expect(body.errCode).toBe('G02');

    expect(placeBidStub).not.toHaveBeenCalled();
    expect(cleanupQueue.enqueued).toEqual([]);
    expect(store.updates).toHaveLength(0);
  });

  it('revert 後 GMO cancel 失敗 → 500 GmoCancelFailed', async () => {
    const bidRelay = new StubBidRelay({
      kind: 'error',
      error: new BidRelayError('AuctionEnded()', { reason: 'AuctionEnded' }),
    });
    const app = createTopupApp({
      bidRelay,
      gmoClient: new StubGmoClient({
        authorize: async () => newAuthResult,
        cancelAuthorization: async () => {
          throw new GmoAuthorizationError('GMO alterTran failed (G05)', {
            errCode: 'G05',
            errInfo: 'G05180001',
          });
        },
      }),
      spotRateFetcher: new StubSpotRateFetcher({
        kind: 'success',
        rate: 500_000,
        source: 'gmo-coin',
      }),
      cleanupQueue,
      store,
    });

    const res = await app.request('/topup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });

    expect(res.status).toBe(500);
    const body = (await res.json()) as {
      error: string;
      errCode: string;
      revertReason: string;
    };
    expect(body.error).toBe('GmoCancelFailed');
    expect(body.errCode).toBe('G05');
    expect(body.revertReason).toBe('AuctionEnded');

    // cleanup enqueue も store update も呼ばれない (revert 経路)
    expect(cleanupQueue.enqueued).toEqual([]);
    expect(store.updates).toHaveLength(0);
  });

  it('store.updateToNewAuth fail で 500 InternalError (txHash 保持)', async () => {
    const bidRelay = new StubBidRelay({
      kind: 'success',
      txHash: stubTxHash,
      auctionId: 42n,
    });
    const failingStore: TopupStore = {
      findBidPlaced: async () => ({
        authId: 'mock-access-00000001',
        status: 'bid-placed',
        jpyAmount: 500_000,
        ethAmount: 100_000_000_000_000_000n,
        bidderWallet: '0x1111111111111111111111111111111111111111',
        bidderEmail: null,
        auctionId: 42n,
        accessPass: 'mock-pass-00000002',
        createdAt: new Date(),
      }),
      updateToNewAuth: async () => {
        throw new Error('DB unreachable during update');
      },
    };
    const app = createTopupApp({
      bidRelay,
      gmoClient: new StubGmoClient({
        authorize: async () => newAuthResult,
        cancelAuthorization: async () => goodCancel,
      }),
      spotRateFetcher: new StubSpotRateFetcher({
        kind: 'success',
        rate: 500_000,
        source: 'gmo-coin',
      }),
      cleanupQueue,
      store: failingStore,
    });

    const res = await app.request('/topup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });

    expect(res.status).toBe(500);
    const body = (await res.json()) as { error: string; txHash: string };
    expect(body.error).toBe('InternalError');
    expect(body.txHash).toBe(stubTxHash);

    // cleanup enqueue は先に呼ばれる (順序 = enqueue → update)
    expect(cleanupQueue.enqueued).toEqual(['mock-access-00000001']);
  });

  it('store.findBidPlaced fail で 500 InternalError', async () => {
    const bidRelay = new StubBidRelay({
      kind: 'success',
      txHash: stubTxHash,
      auctionId: 42n,
    });
    const failingStore: TopupStore = {
      findBidPlaced: async () => {
        throw new Error('DB unreachable');
      },
      updateToNewAuth: async () => {
        // no-op
      },
    };
    const app = createTopupApp({
      bidRelay,
      gmoClient: new StubGmoClient(),
      spotRateFetcher: new StubSpotRateFetcher({
        kind: 'success',
        rate: 500_000,
        source: 'gmo-coin',
      }),
      cleanupQueue,
      store: failingStore,
    });

    const res = await app.request('/topup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });

    expect(res.status).toBe(500);
    const body = (await res.json()) as { error: string; message: string };
    expect(body.error).toBe('InternalError');
    expect(body.message).toContain('fiat_bid lookup failed');
  });
});
