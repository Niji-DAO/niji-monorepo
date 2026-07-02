/**
 * Fiat bid 3ds-callback handler behavior test (Issue #3007 Phase B/D)
 *
 * 検証対象 (完了条件 3 case + validation + error 分岐) —
 * (1) success 分岐 — 200 OK で { authId, status: "3ds-verified" }、
 *     GMO verifyTds2 呼出 + store.updateStatus("3ds-verified") 呼出
 * (2) fail 分岐 — 200 OK で { authId, status: "cancelled" }、
 *     store.updateStatus("cancelled") 呼出 + GMO cancelAuthorization 呼出
 * (3) authId 該当なし — 404 NotFound、 GMO / status update 呼ばず
 * (4) GMO verifyTds2 失敗 (GmoAuthorizationError) → 500 GmoVerifyTds2Failed、 status update 呼ばず
 * (5) GMO cancelAuthorization 失敗 → 500 GmoCancelFailed (status は既に cancelled で UPDATE 済)
 * (6) request validation fail 各種 (欠損 / 型不正 / result enum 外) → 400 InvalidRequest
 *
 * hono の app.request() 経由で actual handler を execute する。
 * GmoClient は class extend + override method で stub、
 * ThreeDsCallbackStore は in-memory Map で受けて呼出を観測する。
 *
 * rules/quality.md § test-passed marker 発行前提 3 条件 (behavior test / 変更箇所 execute / test runner PASS) 準拠。
 */

import type { SecureTran2Success, AlterTranSuccess } from '../../services/gmo/types.js';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GmoAuthorizationError, GmoClient } from '../../services/gmo/client.js';

import {
  createThreeDsCallbackApp,
  parseCallbackBody,
  type ThreeDsCallbackResponseBody,
  type ThreeDsCallbackStore,
} from './3ds-callback.js';

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

/** in-memory ThreeDsCallbackStore stub */
type StubRecord = { authId: string; accessPass: string; status: string };
const makeStore = (
  seed: StubRecord | null = null,
): ThreeDsCallbackStore & {
  updates: Array<{ authId: string; status: string }>;
  lookups: string[];
} => {
  const updates: Array<{ authId: string; status: string }> = [];
  const lookups: string[] = [];
  const records = new Map<string, StubRecord>();
  if (seed) records.set(seed.authId, seed);
  return {
    updates,
    lookups,
    findPending: async authId => {
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

/** valid body common */
const validSuccessBody = {
  authId: 'mock-access-00000001',
  transactionId: 'mock-tds2-tran-00000003',
  result: 'success' as const,
};
const validFailBody = {
  ...validSuccessBody,
  result: 'fail' as const,
};

/** seeded pending record */
const seededRecord: StubRecord = {
  authId: 'mock-access-00000001',
  accessPass: 'mock-pass-00000002',
  status: 'pending',
};

describe('parseCallbackBody', () => {
  it('valid success body を通す', () => {
    const result = parseCallbackBody(validSuccessBody);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.result).toBe('success');
    }
  });

  it('valid fail body を通す', () => {
    const result = parseCallbackBody(validFailBody);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.result).toBe('fail');
    }
  });

  it('authId 欠損で reject', () => {
    const { transactionId, result } = validSuccessBody;
    expect(parseCallbackBody({ transactionId, result }).ok).toBe(false);
  });

  it('transactionId 欠損で reject', () => {
    const { authId, result } = validSuccessBody;
    expect(parseCallbackBody({ authId, result }).ok).toBe(false);
  });

  it('result が enum 外で reject', () => {
    expect(parseCallbackBody({ ...validSuccessBody, result: 'timeout' }).ok).toBe(false);
    expect(parseCallbackBody({ ...validSuccessBody, result: '' }).ok).toBe(false);
    expect(parseCallbackBody({ ...validSuccessBody, result: null }).ok).toBe(false);
  });

  it('null / 非 object で reject', () => {
    expect(parseCallbackBody(null).ok).toBe(false);
    expect(parseCallbackBody('string').ok).toBe(false);
    expect(parseCallbackBody(42).ok).toBe(false);
  });
});

describe('createThreeDsCallbackApp POST /3ds-callback', () => {
  const goodVerify: SecureTran2Success = {
    orderId: 'test-order-42',
    accessId: 'mock-access-00000001',
    tranResult: '0',
  };
  const goodCancel: AlterTranSuccess = {
    accessId: 'mock-access-00000001',
    accessPass: 'mock-pass-00000002',
    status: 'VOID',
  };

  let store: ReturnType<typeof makeStore>;

  beforeEach(() => {
    store = makeStore(seededRecord);
  });

  it('success 分岐 — verifyTds2 呼出 + status="3ds-verified" UPDATE で 200 OK', async () => {
    const verifyStub = vi.fn(async () => goodVerify);
    const cancelStub = vi.fn(async () => goodCancel);
    const app = createThreeDsCallbackApp({
      gmoClient: new StubGmoClient({ verifyTds2: verifyStub, cancelAuthorization: cancelStub }),
      store,
    });

    const res = await app.request('/3ds-callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validSuccessBody),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as ThreeDsCallbackResponseBody;
    expect(body.authId).toBe('mock-access-00000001');
    expect(body.status).toBe('3ds-verified');

    // verifyTds2 は呼ばれ、 cancel は呼ばれない
    expect(verifyStub).toHaveBeenCalledTimes(1);
    expect(cancelStub).not.toHaveBeenCalled();

    // status update は 3ds-verified で 1 回
    expect(store.updates).toHaveLength(1);
    expect(store.updates[0]).toEqual({
      authId: 'mock-access-00000001',
      status: '3ds-verified',
    });
  });

  it('fail 分岐 — status="cancelled" UPDATE + cancelAuthorization 呼出で 200 OK', async () => {
    const verifyStub = vi.fn(async () => goodVerify);
    const cancelStub = vi.fn(async () => goodCancel);
    const app = createThreeDsCallbackApp({
      gmoClient: new StubGmoClient({ verifyTds2: verifyStub, cancelAuthorization: cancelStub }),
      store,
    });

    const res = await app.request('/3ds-callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validFailBody),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as ThreeDsCallbackResponseBody;
    expect(body.authId).toBe('mock-access-00000001');
    expect(body.status).toBe('cancelled');

    // fail 経路では verify は呼ばれず、 cancel が呼ばれる
    expect(verifyStub).not.toHaveBeenCalled();
    expect(cancelStub).toHaveBeenCalledTimes(1);

    // status update は cancelled
    expect(store.updates).toHaveLength(1);
    expect(store.updates[0]).toEqual({
      authId: 'mock-access-00000001',
      status: 'cancelled',
    });
  });

  it('authId 該当なし — 404 NotFound、 GMO / status update 呼ばず', async () => {
    const verifyStub = vi.fn(async () => goodVerify);
    const cancelStub = vi.fn(async () => goodCancel);
    const emptyStore = makeStore(null);
    const app = createThreeDsCallbackApp({
      gmoClient: new StubGmoClient({ verifyTds2: verifyStub, cancelAuthorization: cancelStub }),
      store: emptyStore,
    });

    const res = await app.request('/3ds-callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validSuccessBody),
    });

    expect(res.status).toBe(404);
    const body = (await res.json()) as { error: string; message: string };
    expect(body.error).toBe('NotFound');
    expect(body.message).toContain('mock-access-00000001');

    expect(verifyStub).not.toHaveBeenCalled();
    expect(cancelStub).not.toHaveBeenCalled();
    expect(emptyStore.updates).toHaveLength(0);
    expect(emptyStore.lookups).toContain('mock-access-00000001');
  });

  it('GMO verifyTds2 失敗 → 500 GmoVerifyTds2Failed、 status update 呼ばず', async () => {
    const cancelStub = vi.fn(async () => goodCancel);
    const app = createThreeDsCallbackApp({
      gmoClient: new StubGmoClient({
        verifyTds2: async () => {
          throw new GmoAuthorizationError('GMO secureTran2 failed (T01)', {
            errCode: 'T01',
            errInfo: 'T01180001',
          });
        },
        cancelAuthorization: cancelStub,
      }),
      store,
    });

    const res = await app.request('/3ds-callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validSuccessBody),
    });

    expect(res.status).toBe(500);
    const body = (await res.json()) as {
      error: string;
      errCode: string | null;
      errInfo: string | null;
    };
    expect(body.error).toBe('GmoVerifyTds2Failed');
    expect(body.errCode).toBe('T01');
    expect(body.errInfo).toBe('T01180001');

    // status update は呼ばれない (verify 失敗で遷移抑止)
    expect(store.updates).toHaveLength(0);
    expect(cancelStub).not.toHaveBeenCalled();
  });

  it('fail 経路で cancelAuthorization 失敗 → 500 GmoCancelFailed (status は既に cancelled UPDATE 済)', async () => {
    const app = createThreeDsCallbackApp({
      gmoClient: new StubGmoClient({
        verifyTds2: async () => goodVerify,
        cancelAuthorization: async () => {
          throw new GmoAuthorizationError('GMO alterTran failed (G05)', {
            errCode: 'G05',
            errInfo: 'G05180001',
          });
        },
      }),
      store,
    });

    const res = await app.request('/3ds-callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validFailBody),
    });

    expect(res.status).toBe(500);
    const body = (await res.json()) as { error: string; errCode: string | null };
    expect(body.error).toBe('GmoCancelFailed');
    expect(body.errCode).toBe('G05');

    // status update は cancelled で先行 UPDATE 済 (顧客保護、 fiat_bid record は cancel 済 = 二度課金防止)
    expect(store.updates).toHaveLength(1);
    expect(store.updates[0]).toEqual({
      authId: 'mock-access-00000001',
      status: 'cancelled',
    });
  });

  it('request body が invalid JSON で 400 InvalidRequest', async () => {
    const app = createThreeDsCallbackApp({
      gmoClient: new StubGmoClient(),
      store,
    });

    const res = await app.request('/3ds-callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json{',
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('InvalidRequest');
  });

  it('result enum 外で 400 InvalidRequest、 GMO / store 呼ばず', async () => {
    const verifyStub = vi.fn(async () => goodVerify);
    const cancelStub = vi.fn(async () => goodCancel);
    const app = createThreeDsCallbackApp({
      gmoClient: new StubGmoClient({ verifyTds2: verifyStub, cancelAuthorization: cancelStub }),
      store,
    });

    const res = await app.request('/3ds-callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...validSuccessBody, result: 'timeout' }),
    });

    expect(res.status).toBe(400);
    expect(verifyStub).not.toHaveBeenCalled();
    expect(cancelStub).not.toHaveBeenCalled();
    expect(store.updates).toHaveLength(0);
  });

  it('store.findPending fail で 500 InternalError', async () => {
    const failingStore: ThreeDsCallbackStore = {
      findPending: async () => {
        throw new Error('DB unreachable');
      },
      updateStatus: async () => {
        // no-op
      },
    };
    const app = createThreeDsCallbackApp({
      gmoClient: new StubGmoClient({ verifyTds2: async () => goodVerify }),
      store: failingStore,
    });

    const res = await app.request('/3ds-callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validSuccessBody),
    });
    expect(res.status).toBe(500);
    const body = (await res.json()) as { error: string; message: string };
    expect(body.error).toBe('InternalError');
    expect(body.message).toContain('fiat_bid lookup failed');
  });
});
