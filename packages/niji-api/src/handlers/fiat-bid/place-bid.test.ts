/**
 * Fiat bid place-bid handler behavior test (Issue #3008 Phase B/D)
 *
 * 検証対象 (完了条件 5 case + validation + error 分岐) —
 * (1) happy path — 200 OK で { status: "bid-placed", txHash }、
 *     BidRelay.placeBid 呼出 + store.updateStatus("bid-placed") 呼出
 * (2) revert 分岐 (BidTooLow) — 200 OK で { status: "cancelled", txHash: null, message }、
 *     store.updateStatus("cancelled") + GmoClient.cancelAuthorization 呼出
 * (3) status ≠ 3ds-verified で 409 Conflict、 BidRelay 呼ばず
 * (4) authId 該当なしで 404 NotFound、 BidRelay / GMO 呼ばず
 * (5) GMO cancel 失敗 (revert 経路後) → 500 GmoCancelFailed、 fiat_bid.status は cancelled UPDATE 済
 * (6) request validation fail (authId 欠損 / 型不正) → 400 InvalidRequest
 * (7) request body invalid JSON → 400 InvalidRequest
 *
 * hono の app.request() 経由で actual handler を execute する。
 * BidRelay / GmoClient は class stub、 PlaceBidStore は in-memory Map で受けて呼出を観測する。
 *
 * rules/quality.md § test-passed marker 発行前提 3 条件準拠 (behavior test / 変更箇所 execute / test runner PASS)。
 */

import type { AlterTranSuccess, SecureTran2Success } from '../../services/gmo/types.js';
import type { Hash } from 'viem';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BidRelay, BidRelayError, type SignerProvider } from '../../services/bidRelay/index.js';
import { GmoAuthorizationError, GmoClient } from '../../services/gmo/client.js';

import {
  createPlaceBidApp,
  messageForRevertReason,
  parsePlaceBidBody,
  type PlaceBidResponseBody,
  type PlaceBidStore,
} from './place-bid.js';

/** GmoClient stub (verifyTds2 / cancelAuthorization method のみ差替) */
class StubGmoClient extends GmoClient {
  constructor(
    private readonly behavior: {
      verifyTds2?: () => Promise<SecureTran2Success>;
      cancelAuthorization?: () => Promise<AlterTranSuccess>;
    } = {},
  ) {
    super({ endpoint: 'http://stub-gmo' });
  }
  override async verifyTds2(): Promise<SecureTran2Success> {
    if (this.behavior.verifyTds2 === undefined) {
      throw new Error('StubGmoClient.verifyTds2 behavior not set');
    }
    return this.behavior.verifyTds2();
  }
  override async cancelAuthorization(): Promise<AlterTranSuccess> {
    if (this.behavior.cancelAuthorization === undefined) {
      throw new Error('StubGmoClient.cancelAuthorization behavior not set');
    }
    return this.behavior.cancelAuthorization();
  }
}

/** BidRelay stub (placeBid のみ差替、 constructor は minimal signer / publicClient で満たす) */
class StubBidRelay extends BidRelay {
  constructor(
    private readonly placeBidBehavior:
      | { kind: 'success'; txHash: Hash; auctionId: bigint; ethAmount: bigint }
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

/** in-memory PlaceBidStore stub */
type StubRecord = {
  authId: string;
  status: string;
  ethAmount: bigint;
  accessPass: string;
};

const makeStore = (
  seed: StubRecord | null = null,
): PlaceBidStore & {
  updates: Array<{ authId: string; status: string; txHash?: string }>;
  lookups: string[];
} => {
  const updates: Array<{ authId: string; status: string; txHash?: string }> = [];
  const lookups: string[] = [];
  const records = new Map<string, StubRecord>();
  if (seed) records.set(seed.authId, seed);
  return {
    updates,
    lookups,
    findVerified: async authId => {
      lookups.push(authId);
      return records.get(authId) ?? null;
    },
    updateStatus: async input => {
      updates.push(input);
      const existing = records.get(input.authId);
      if (existing) records.set(input.authId, { ...existing, status: input.status });
    },
  };
};

const validBody = { authId: 'mock-access-00000001' };

const seededVerifiedRecord: StubRecord = {
  authId: 'mock-access-00000001',
  status: '3ds-verified',
  ethAmount: 250_000_000_000_000_000n, // 0.25 ETH wei
  accessPass: 'mock-pass-00000002',
};

const stubTxHash = '0xdeadbeef000000000000000000000000000000000000000000000000000000ff' as Hash;
const goodCancel: AlterTranSuccess = {
  accessId: 'mock-access-00000001',
  accessPass: 'mock-pass-00000002',
  status: 'VOID',
};

describe('parsePlaceBidBody', () => {
  it('valid body を通す', () => {
    const result = parsePlaceBidBody(validBody);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.authId).toBe('mock-access-00000001');
  });

  it('authId 欠損で reject', () => {
    expect(parsePlaceBidBody({}).ok).toBe(false);
  });

  it('authId が空文字で reject', () => {
    expect(parsePlaceBidBody({ authId: '' }).ok).toBe(false);
    expect(parsePlaceBidBody({ authId: '   ' }).ok).toBe(false);
  });

  it('null / 非 object で reject', () => {
    expect(parsePlaceBidBody(null).ok).toBe(false);
    expect(parsePlaceBidBody('string').ok).toBe(false);
    expect(parsePlaceBidBody(42).ok).toBe(false);
  });
});

describe('messageForRevertReason', () => {
  it('各 reason に対して user 通知 msg を返す', () => {
    expect(messageForRevertReason('BidTooLow')).toContain('上乗せ');
    expect(messageForRevertReason('AuctionEnded')).toContain('終了');
    expect(messageForRevertReason('GasPriceHigh')).toContain('混雑');
    expect(messageForRevertReason('RpcError')).toContain('network');
    expect(messageForRevertReason('Unknown')).toContain('broadcast');
  });
});

describe('createPlaceBidApp POST /place-bid', () => {
  let store: ReturnType<typeof makeStore>;

  beforeEach(() => {
    store = makeStore(seededVerifiedRecord);
  });

  it('happy path — bid tx broadcast → status="bid-placed" UPDATE で 200 OK', async () => {
    const cancelStub = vi.fn(async () => goodCancel);
    const bidRelay = new StubBidRelay({
      kind: 'success',
      txHash: stubTxHash,
      auctionId: 42n,
      ethAmount: seededVerifiedRecord.ethAmount,
    });
    const app = createPlaceBidApp({
      bidRelay,
      gmoClient: new StubGmoClient({ cancelAuthorization: cancelStub }),
      store,
    });

    const res = await app.request('/place-bid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as PlaceBidResponseBody;
    expect(body.authId).toBe('mock-access-00000001');
    expect(body.status).toBe('bid-placed');
    expect(body.txHash).toBe(stubTxHash);

    // status update は bid-placed で 1 回、 txHash 含む
    expect(store.updates).toHaveLength(1);
    expect(store.updates[0]).toEqual({
      authId: 'mock-access-00000001',
      status: 'bid-placed',
      txHash: stubTxHash,
    });

    // GMO cancel は呼ばれない
    expect(cancelStub).not.toHaveBeenCalled();
  });

  it('revert (BidTooLow) — GMO cancel + status="cancelled" UPDATE で 200 OK', async () => {
    const cancelStub = vi.fn(async () => goodCancel);
    const bidRelay = new StubBidRelay({
      kind: 'error',
      error: new BidRelayError('execution reverted: BidTooLow()', { reason: 'BidTooLow' }),
    });
    const app = createPlaceBidApp({
      bidRelay,
      gmoClient: new StubGmoClient({ cancelAuthorization: cancelStub }),
      store,
    });

    const res = await app.request('/place-bid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as PlaceBidResponseBody;
    expect(body.authId).toBe('mock-access-00000001');
    expect(body.status).toBe('cancelled');
    expect(body.txHash).toBe(null);
    expect(body.message).toContain('上乗せ');

    // status update は cancelled で 1 回、 GMO cancel が呼ばれる
    expect(store.updates).toHaveLength(1);
    expect(store.updates[0]).toEqual({
      authId: 'mock-access-00000001',
      status: 'cancelled',
    });
    expect(cancelStub).toHaveBeenCalledTimes(1);
  });

  it('revert (AuctionEnded) — user 通知 msg に「終了」 が含まれる', async () => {
    const cancelStub = vi.fn(async () => goodCancel);
    const bidRelay = new StubBidRelay({
      kind: 'error',
      error: new BidRelayError('AuctionEnded()', { reason: 'AuctionEnded' }),
    });
    const app = createPlaceBidApp({
      bidRelay,
      gmoClient: new StubGmoClient({ cancelAuthorization: cancelStub }),
      store,
    });

    const res = await app.request('/place-bid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as PlaceBidResponseBody;
    expect(body.status).toBe('cancelled');
    expect(body.message).toContain('終了');
  });

  it('status ≠ 3ds-verified — 409 Conflict、 BidRelay / GMO 呼ばず', async () => {
    const cancelStub = vi.fn(async () => goodCancel);
    const placeBidStub = vi.fn();
    const bidRelay = new StubBidRelay({
      kind: 'success',
      txHash: stubTxHash,
      auctionId: 42n,
      ethAmount: seededVerifiedRecord.ethAmount,
    });
    // 上書きで spy
    bidRelay.placeBid = placeBidStub;

    const pendingStore = makeStore({
      ...seededVerifiedRecord,
      status: 'pending',
    });

    const app = createPlaceBidApp({
      bidRelay,
      gmoClient: new StubGmoClient({ cancelAuthorization: cancelStub }),
      store: pendingStore,
    });

    const res = await app.request('/place-bid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });

    expect(res.status).toBe(409);
    const body = (await res.json()) as { error: string; actualStatus: string };
    expect(body.error).toBe('Conflict');
    expect(body.actualStatus).toBe('pending');

    // BidRelay / GMO cancel / status update は呼ばれない
    expect(placeBidStub).not.toHaveBeenCalled();
    expect(cancelStub).not.toHaveBeenCalled();
    expect(pendingStore.updates).toHaveLength(0);
  });

  it('authId 該当なし — 404 NotFound、 BidRelay / GMO 呼ばず', async () => {
    const cancelStub = vi.fn(async () => goodCancel);
    const placeBidStub = vi.fn();
    const bidRelay = new StubBidRelay({
      kind: 'success',
      txHash: stubTxHash,
      auctionId: 42n,
      ethAmount: seededVerifiedRecord.ethAmount,
    });
    bidRelay.placeBid = placeBidStub;

    const emptyStore = makeStore(null);
    const app = createPlaceBidApp({
      bidRelay,
      gmoClient: new StubGmoClient({ cancelAuthorization: cancelStub }),
      store: emptyStore,
    });

    const res = await app.request('/place-bid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });

    expect(res.status).toBe(404);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('NotFound');

    expect(placeBidStub).not.toHaveBeenCalled();
    expect(cancelStub).not.toHaveBeenCalled();
    expect(emptyStore.updates).toHaveLength(0);
    expect(emptyStore.lookups).toContain('mock-access-00000001');
  });

  it('revert 後 GMO cancel 失敗 → 500 GmoCancelFailed、 status=cancelled は UPDATE 済', async () => {
    const bidRelay = new StubBidRelay({
      kind: 'error',
      error: new BidRelayError('AuctionEnded()', { reason: 'AuctionEnded' }),
    });
    const app = createPlaceBidApp({
      bidRelay,
      gmoClient: new StubGmoClient({
        cancelAuthorization: async () => {
          throw new GmoAuthorizationError('GMO alterTran failed (G05)', {
            errCode: 'G05',
            errInfo: 'G05180001',
          });
        },
      }),
      store,
    });

    const res = await app.request('/place-bid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });

    expect(res.status).toBe(500);
    const body = (await res.json()) as { error: string; errCode: string; revertReason: string };
    expect(body.error).toBe('GmoCancelFailed');
    expect(body.errCode).toBe('G05');
    expect(body.revertReason).toBe('AuctionEnded');

    // status update は先行 UPDATE 済 (cancelled)
    expect(store.updates).toHaveLength(1);
    expect(store.updates[0]).toEqual({
      authId: 'mock-access-00000001',
      status: 'cancelled',
    });
  });

  it('request body が invalid JSON で 400 InvalidRequest', async () => {
    const bidRelay = new StubBidRelay({
      kind: 'success',
      txHash: stubTxHash,
      auctionId: 42n,
      ethAmount: seededVerifiedRecord.ethAmount,
    });
    const app = createPlaceBidApp({
      bidRelay,
      gmoClient: new StubGmoClient(),
      store,
    });

    const res = await app.request('/place-bid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json{',
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('InvalidRequest');
  });

  it('authId 欠損で 400 InvalidRequest、 BidRelay 呼ばず', async () => {
    const placeBidStub = vi.fn();
    const bidRelay = new StubBidRelay({
      kind: 'success',
      txHash: stubTxHash,
      auctionId: 42n,
      ethAmount: seededVerifiedRecord.ethAmount,
    });
    bidRelay.placeBid = placeBidStub;

    const app = createPlaceBidApp({
      bidRelay,
      gmoClient: new StubGmoClient(),
      store,
    });

    const res = await app.request('/place-bid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
    expect(placeBidStub).not.toHaveBeenCalled();
    expect(store.updates).toHaveLength(0);
  });

  it('store.findVerified fail で 500 InternalError', async () => {
    const bidRelay = new StubBidRelay({
      kind: 'success',
      txHash: stubTxHash,
      auctionId: 42n,
      ethAmount: seededVerifiedRecord.ethAmount,
    });
    const failingStore: PlaceBidStore = {
      findVerified: async () => {
        throw new Error('DB unreachable');
      },
      updateStatus: async () => {
        // no-op
      },
    };
    const app = createPlaceBidApp({
      bidRelay,
      gmoClient: new StubGmoClient(),
      store: failingStore,
    });

    const res = await app.request('/place-bid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });
    expect(res.status).toBe(500);
    const body = (await res.json()) as { error: string; message: string };
    expect(body.error).toBe('InternalError');
    expect(body.message).toContain('fiat_bid lookup failed');
  });

  it('success 後 status update fail で 500 InternalError (txHash は保持)', async () => {
    const bidRelay = new StubBidRelay({
      kind: 'success',
      txHash: stubTxHash,
      auctionId: 42n,
      ethAmount: seededVerifiedRecord.ethAmount,
    });
    const failingStore: PlaceBidStore = {
      findVerified: async () => ({
        authId: 'mock-access-00000001',
        status: '3ds-verified',
        ethAmount: seededVerifiedRecord.ethAmount,
        accessPass: seededVerifiedRecord.accessPass,
      }),
      updateStatus: async () => {
        throw new Error('DB unreachable during update');
      },
    };
    const app = createPlaceBidApp({
      bidRelay,
      gmoClient: new StubGmoClient(),
      store: failingStore,
    });

    const res = await app.request('/place-bid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });
    expect(res.status).toBe(500);
    const body = (await res.json()) as { error: string; txHash: string };
    expect(body.error).toBe('InternalError');
    expect(body.txHash).toBe(stubTxHash);
  });
});
