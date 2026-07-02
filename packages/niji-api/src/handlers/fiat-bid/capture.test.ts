/**
 * Fiat bid capture handler behavior test (Issue #3010 Phase D)
 *
 * 検証対象 —
 * (1) happy path — 200 OK で { status: "captured" }、
 *     GmoClient.alterTran(SALES) 呼出 + store.updateCaptureStatus("captured", capturedAt) 呼出
 * (2) capture fail — 200 OK で { status: "capture-failed" }、
 *     store.updateCaptureStatus("cancelled") 呼出 + onCaptureFail alert 発火
 * (3) status ≠ bid-placed で 409 Conflict、 GMO 呼ばず
 * (4) authId 該当なしで 404 NotFound
 * (5) request validation fail (authId 欠損) → 400 InvalidRequest
 *
 * hono の app.request() 経由で actual handler を execute する。
 *
 * rules/quality.md § test-passed marker 発行前提 3 条件準拠。
 */

import type { AlterTranSuccess } from '../../services/gmo/types.js';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GmoAuthorizationError, GmoClient } from '../../services/gmo/client.js';

import {
  createCaptureApp,
  parseCaptureBody,
  type CaptureResponseBody,
  type CaptureStore,
} from './capture.js';

class StubGmoClient extends GmoClient {
  constructor(
    private readonly behavior: {
      alterTran?: () => Promise<AlterTranSuccess>;
    } = {},
  ) {
    super({ endpoint: 'http://stub-gmo' });
  }
  override async alterTran(): Promise<AlterTranSuccess> {
    if (this.behavior.alterTran === undefined) {
      throw new Error('StubGmoClient.alterTran behavior not set');
    }
    return this.behavior.alterTran();
  }
}

type StubRecord = {
  authId: string;
  status: string;
  accessPass: string;
  jpyAmount: number;
};

const makeStore = (
  seed: StubRecord | null = null,
): CaptureStore & {
  updates: Array<{ authId: string; status: string; capturedAt?: Date }>;
  lookups: string[];
} => {
  const updates: Array<{ authId: string; status: string; capturedAt?: Date }> = [];
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
    updateCaptureStatus: async input => {
      updates.push(input);
      const existing = records.get(input.authId);
      if (existing) records.set(input.authId, { ...existing, status: input.status });
    },
  };
};

const validBody = { authId: 'mock-access-00000001' };

const seededBidPlacedRecord: StubRecord = {
  authId: 'mock-access-00000001',
  status: 'bid-placed',
  accessPass: 'mock-pass-00000002',
  jpyAmount: 50000,
};

const goodSalesResult: AlterTranSuccess = {
  accessId: 'mock-access-00000001',
  accessPass: 'mock-pass-00000002',
  status: 'SALES',
};

describe('parseCaptureBody', () => {
  it('valid body を通す (tds2Result なし)', () => {
    const result = parseCaptureBody(validBody);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.authId).toBe('mock-access-00000001');
  });

  it('valid body を通す (tds2Result あり)', () => {
    const result = parseCaptureBody({ authId: 'x', tds2Result: '0' });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.tds2Result).toBe('0');
  });

  it('authId 欠損で reject', () => {
    expect(parseCaptureBody({}).ok).toBe(false);
    expect(parseCaptureBody({ authId: '' }).ok).toBe(false);
  });

  it('null / 非 object で reject', () => {
    expect(parseCaptureBody(null).ok).toBe(false);
    expect(parseCaptureBody(42).ok).toBe(false);
  });
});

describe('createCaptureApp POST /capture', () => {
  let store: ReturnType<typeof makeStore>;
  const fixedNow = new Date('2026-07-01T12:00:00Z');

  beforeEach(() => {
    store = makeStore(seededBidPlacedRecord);
  });

  it('happy path — 200 OK で captured 遷移 + alterTran(SALES) 呼出', async () => {
    const alterTranSpy = vi.fn(async () => goodSalesResult);
    const gmoClient = new StubGmoClient({ alterTran: alterTranSpy });
    const app = createCaptureApp({
      gmoClient,
      store,
      now: () => fixedNow,
    });

    const res = await app.request('/capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as CaptureResponseBody;
    expect(body.status).toBe('captured');
    expect(body.authId).toBe(validBody.authId);
    expect(alterTranSpy).toHaveBeenCalledTimes(1);
    expect(store.updates).toEqual([
      { authId: validBody.authId, status: 'captured', capturedAt: fixedNow },
    ]);
  });

  it('capture fail — GMO alterTran throw で 200 { capture-failed } + cancelled 遷移 + alert', async () => {
    const alterTranSpy = vi.fn(async () => {
      throw new GmoAuthorizationError('GMO alterTran failed (E01)', {
        errCode: 'E01',
        errInfo: 'card expired',
      });
    });
    const gmoClient = new StubGmoClient({ alterTran: alterTranSpy });
    const alertSpy = vi.fn();
    const app = createCaptureApp({
      gmoClient,
      store,
      onCaptureFail: alertSpy,
    });

    const res = await app.request('/capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as CaptureResponseBody;
    expect(body.status).toBe('capture-failed');
    expect(alertSpy).toHaveBeenCalledTimes(1);
    expect(alertSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        authId: validBody.authId,
        jpyAmount: seededBidPlacedRecord.jpyAmount,
        errCode: 'E01',
      }),
    );
    expect(store.updates).toEqual([{ authId: validBody.authId, status: 'cancelled' }]);
  });

  it('status ≠ bid-placed で 409 Conflict、 GMO 呼ばず', async () => {
    const wrongStatusStore = makeStore({ ...seededBidPlacedRecord, status: 'captured' });
    const alterTranSpy = vi.fn();
    const gmoClient = new StubGmoClient({ alterTran: alterTranSpy });
    const app = createCaptureApp({
      gmoClient,
      store: wrongStatusStore,
    });

    const res = await app.request('/capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });

    expect(res.status).toBe(409);
    expect(alterTranSpy).not.toHaveBeenCalled();
    expect(wrongStatusStore.updates).toEqual([]);
  });

  it('authId 該当なしで 404 NotFound', async () => {
    const emptyStore = makeStore(null);
    const alterTranSpy = vi.fn();
    const gmoClient = new StubGmoClient({ alterTran: alterTranSpy });
    const app = createCaptureApp({
      gmoClient,
      store: emptyStore,
    });

    const res = await app.request('/capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });

    expect(res.status).toBe(404);
    expect(alterTranSpy).not.toHaveBeenCalled();
  });

  it('authId 欠損で 400 InvalidRequest', async () => {
    const alterTranSpy = vi.fn();
    const gmoClient = new StubGmoClient({ alterTran: alterTranSpy });
    const app = createCaptureApp({
      gmoClient,
      store,
    });

    const res = await app.request('/capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
    expect(alterTranSpy).not.toHaveBeenCalled();
  });
});
