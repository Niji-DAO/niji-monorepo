/**
 * Fiat bid transfer-nft handler behavior test (Issue #3010 Phase E)
 *
 * 検証対象 —
 * (1) happy path — 200 OK で { status: "transferred", txHash }、
 *     TransferRelay.transferNft 呼出 + store.updateTransferStatus 呼出
 * (2) transfer fail — 200 OK で { status: "transfer-failed", txHash: null } + alert 発火
 * (3) status ≠ captured で 409 Conflict
 * (4) authId 該当なしで 404 NotFound
 * (5) authId 欠損で 400 InvalidRequest
 */

import type { Address, Hash, PublicClient } from 'viem';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  TransferRelay,
  TransferRelayError,
  type SignerProvider,
} from '../../services/settlement/index.js';

import {
  createTransferNftApp,
  parseTransferNftBody,
  type TransferNftResponseBody,
  type TransferNftStore,
} from './transfer-nft.js';

const operatorEoa = '0x00000000000000000000000000000000000000AA' as Address;
const userWallet = '0x00000000000000000000000000000000000000BB' as Address;
const nijiTokenAddress = '0x00000000000000000000000000000000000000EE' as Address;

type StubRecord = {
  authId: string;
  status: string;
  bidderWallet: Address;
  auctionId: bigint;
};

const seededCapturedRecord: StubRecord = {
  authId: 'mock-access-00000001',
  status: 'captured',
  bidderWallet: userWallet,
  auctionId: 42n,
};

const makeStore = (
  seed: StubRecord | null = null,
): TransferNftStore & {
  updates: Array<{ authId: string; status: string; transferredAt: Date; txHash: string }>;
  lookups: string[];
} => {
  const updates: Array<{
    authId: string;
    status: string;
    transferredAt: Date;
    txHash: string;
  }> = [];
  const lookups: string[] = [];
  const records = new Map<string, StubRecord>();
  if (seed) records.set(seed.authId, seed);
  return {
    updates,
    lookups,
    findCaptured: async authId => {
      lookups.push(authId);
      return records.get(authId) ?? null;
    },
    updateTransferStatus: async input => {
      updates.push(input);
      const existing = records.get(input.authId);
      if (existing) records.set(input.authId, { ...existing, status: input.status });
    },
  };
};

/** TransferRelay stub、 transferNft のみ差替 */
class StubTransferRelay extends TransferRelay {
  constructor(
    private readonly behavior:
      | { kind: 'success'; txHash: Hash }
      | { kind: 'error'; error: TransferRelayError },
  ) {
    const dummySigner: SignerProvider = {
      address: operatorEoa,
      getWalletClient: () => {
        throw new Error('StubTransferRelay: getWalletClient should not be called');
      },
    };
    super({
      signer: dummySigner,
      publicClient: {} as unknown as PublicClient,
      nijiTokenAddress,
    });
  }

  override async transferNft(input: { to: Address; nounId: bigint }) {
    if (this.behavior.kind === 'error') {
      throw this.behavior.error;
    }
    return {
      txHash: this.behavior.txHash,
      to: input.to,
      nounId: input.nounId,
    };
  }
}

const validBody = { authId: 'mock-access-00000001' };

describe('parseTransferNftBody', () => {
  it('valid body を通す', () => {
    const result = parseTransferNftBody(validBody);
    expect(result.ok).toBe(true);
  });

  it('authId 欠損で reject', () => {
    expect(parseTransferNftBody({}).ok).toBe(false);
    expect(parseTransferNftBody({ authId: '' }).ok).toBe(false);
  });

  it('null / 非 object で reject', () => {
    expect(parseTransferNftBody(null).ok).toBe(false);
    expect(parseTransferNftBody('foo').ok).toBe(false);
  });
});

describe('createTransferNftApp POST /transfer', () => {
  let store: ReturnType<typeof makeStore>;
  const fixedNow = new Date('2026-07-01T13:00:00Z');
  const stubTxHash = '0xdeadbeef000000000000000000000000000000000000000000000000000000ff' as Hash;

  beforeEach(() => {
    store = makeStore(seededCapturedRecord);
  });

  it('happy path — 200 OK で transferred 遷移 + transferNft 呼出', async () => {
    const relay = new StubTransferRelay({ kind: 'success', txHash: stubTxHash });
    const transferSpy = vi.spyOn(relay, 'transferNft');
    const app = createTransferNftApp({
      transferRelay: relay,
      store,
      now: () => fixedNow,
    });

    const res = await app.request('/transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as TransferNftResponseBody;
    expect(body.status).toBe('transferred');
    expect(body.txHash).toBe(stubTxHash);
    expect(transferSpy).toHaveBeenCalledWith({ to: userWallet, nounId: 42n });
    expect(store.updates).toEqual([
      {
        authId: validBody.authId,
        status: 'transferred',
        transferredAt: fixedNow,
        txHash: stubTxHash,
      },
    ]);
  });

  it('transfer fail — 200 { transfer-failed, txHash: null } + alert 発火 + DB 変更なし', async () => {
    const relay = new StubTransferRelay({
      kind: 'error',
      error: new TransferRelayError('caller is not owner', { reason: 'NotOwner' }),
    });
    const alertSpy = vi.fn();
    const app = createTransferNftApp({
      transferRelay: relay,
      store,
      onTransferFail: alertSpy,
    });

    const res = await app.request('/transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as TransferNftResponseBody;
    expect(body.status).toBe('transfer-failed');
    expect(body.txHash).toBeNull();
    expect(alertSpy).toHaveBeenCalledWith({
      authId: validBody.authId,
      bidderWallet: userWallet,
      reason: 'NotOwner',
    });
    // status = captured のまま (Phase 4 で retry queue に載せる、 Phase 1 は手動 retry)
    expect(store.updates).toEqual([]);
  });

  it('status ≠ captured で 409 Conflict、 transferRelay 呼ばず', async () => {
    const wrongStatusStore = makeStore({ ...seededCapturedRecord, status: 'transferred' });
    const relay = new StubTransferRelay({ kind: 'success', txHash: stubTxHash });
    const spy = vi.spyOn(relay, 'transferNft');
    const app = createTransferNftApp({
      transferRelay: relay,
      store: wrongStatusStore,
    });

    const res = await app.request('/transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });

    expect(res.status).toBe(409);
    expect(spy).not.toHaveBeenCalled();
  });

  it('authId 該当なしで 404 NotFound', async () => {
    const emptyStore = makeStore(null);
    const relay = new StubTransferRelay({ kind: 'success', txHash: stubTxHash });
    const app = createTransferNftApp({
      transferRelay: relay,
      store: emptyStore,
    });

    const res = await app.request('/transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });

    expect(res.status).toBe(404);
  });

  it('authId 欠損で 400 InvalidRequest', async () => {
    const relay = new StubTransferRelay({ kind: 'success', txHash: stubTxHash });
    const app = createTransferNftApp({
      transferRelay: relay,
      store,
    });

    const res = await app.request('/transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
  });
});
