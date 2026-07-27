/**
 * 3DS 2.0 callback handler (fincode 経路) の behavior test
 *
 * 検証する分岐 —
 * (1) 認証通過 (Y / A) → 認証後決済実行まで進んで 3ds-verified
 * (2) チャレンジ必要 (C) → challengeUrl を返し、 決済実行に進まない
 * (3) 認証失敗 (N / U / R / 未返却) → cancelled、 決済実行に進まない
 * (4) retry=true → GET 経路 (retrieve) で結果を取り直す
 * (5) request 検証 / record 不在 / fincode error の応答
 */

import { describe, expect, it, vi } from 'vitest';

import { FincodeAuthorizationError } from '../../services/fincode/client.js';

import {
  createThreeDsCallbackFincodeApp,
  parseThreeDsCallbackBody,
  type ThreeDsCallbackFincodeResponseBody,
  type ThreeDsFincodeStore,
} from './3ds-callback-fincode.js';

const AUTH_ID = 'access-1';
const ORDER_ID = 'fc-42-abcdef';

const buildStore = (found = true): ThreeDsFincodeStore & { updates: unknown[] } => {
  const updates: unknown[] = [];
  return {
    updates,
    async findAuthorized(authId: string) {
      if (!found) return null;
      return { authId, orderId: ORDER_ID, accessId: AUTH_ID };
    },
    async updateThreeDsStatus(input) {
      updates.push(input);
    },
  };
};

/** complete3DSecureAuth のみを差替えた最小 client stub */
const buildClient = (impl: () => Promise<unknown>) =>
  ({ complete3DSecureAuth: vi.fn(impl) }) as never;

const post = (app: ReturnType<typeof createThreeDsCallbackFincodeApp>, body: unknown) =>
  app.request('/3ds-callback-fincode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

describe('parseThreeDsCallbackBody', () => {
  it('authId 文字列で ok', () => {
    expect(parseThreeDsCallbackBody({ authId: 'a-1' })).toEqual({
      ok: true,
      authId: 'a-1',
      retry: false,
    });
  });

  it('前後空白は trim される', () => {
    const r = parseThreeDsCallbackBody({ authId: '  a-1  ' });
    expect(r.ok && r.authId).toBe('a-1');
  });

  it('retry=true を受理する', () => {
    const r = parseThreeDsCallbackBody({ authId: 'a-1', retry: true });
    expect(r.ok && r.retry).toBe(true);
  });

  it('authId 欠損 / 空文字 / 非文字列で ng', () => {
    expect(parseThreeDsCallbackBody({}).ok).toBe(false);
    expect(parseThreeDsCallbackBody({ authId: '' }).ok).toBe(false);
    expect(parseThreeDsCallbackBody({ authId: '   ' }).ok).toBe(false);
    expect(parseThreeDsCallbackBody({ authId: 1 }).ok).toBe(false);
  });

  it('object でない body で ng', () => {
    expect(parseThreeDsCallbackBody(null).ok).toBe(false);
    expect(parseThreeDsCallbackBody('a').ok).toBe(false);
  });

  it('retry が boolean でない場合 ng', () => {
    expect(parseThreeDsCallbackBody({ authId: 'a-1', retry: 'yes' }).ok).toBe(false);
  });
});

describe('POST /3ds-callback-fincode', () => {
  it('認証通過 + 与信確定で 3ds-verified を返す', async () => {
    const store = buildStore();
    const app = createThreeDsCallbackFincodeApp({
      fincodeClient: buildClient(async () => ({
        transResult: 'Y',
        reason: undefined,
        challengeUrl: undefined,
        authorized: true,
        status: 'AUTHORIZED',
      })),
      store,
    });

    const res = await post(app, { authId: AUTH_ID });
    expect(res.status).toBe(200);
    const body = (await res.json()) as ThreeDsCallbackFincodeResponseBody;
    expect(body.status).toBe('3ds-verified');
    expect(body.transResult).toBe('Y');
    expect(body.challengeUrl).toBeUndefined();
    expect(store.updates).toEqual([{ authId: AUTH_ID, status: '3ds-verified', transResult: 'Y' }]);
  });

  it('チャレンジ必要時は challenge-required と challengeUrl を返す', async () => {
    const store = buildStore();
    const app = createThreeDsCallbackFincodeApp({
      fincodeClient: buildClient(async () => ({
        transResult: 'C',
        reason: undefined,
        challengeUrl: 'https://acs.example/challenge?id=1',
        authorized: false,
        status: undefined,
      })),
      store,
    });

    const res = await post(app, { authId: AUTH_ID });
    expect(res.status).toBe(200);
    const body = (await res.json()) as ThreeDsCallbackFincodeResponseBody;
    expect(body.status).toBe('challenge-required');
    expect(body.challengeUrl).toBe('https://acs.example/challenge?id=1');
  });

  it('認証失敗 (N) は cancelled を返し challengeUrl を含まない', async () => {
    const store = buildStore();
    const app = createThreeDsCallbackFincodeApp({
      fincodeClient: buildClient(async () => ({
        transResult: 'N',
        reason: 'card issuer rejected',
        challengeUrl: undefined,
        authorized: false,
        status: undefined,
      })),
      store,
    });

    const res = await post(app, { authId: AUTH_ID });
    const body = (await res.json()) as ThreeDsCallbackFincodeResponseBody;
    expect(body.status).toBe('cancelled');
    expect(body.reason).toBe('card issuer rejected');
    expect(body.challengeUrl).toBeUndefined();
  });

  it('retry=true は viaRetrieve を立てて client を呼ぶ (challenge 復帰経路)', async () => {
    const store = buildStore();
    const spy = vi.fn(async () => ({
      transResult: 'Y',
      reason: undefined,
      challengeUrl: undefined,
      authorized: true,
      status: 'AUTHORIZED',
    }));
    const app = createThreeDsCallbackFincodeApp({
      fincodeClient: { complete3DSecureAuth: spy } as never,
      store,
    });

    await post(app, { authId: AUTH_ID, retry: true });

    expect(spy).toHaveBeenCalledWith(ORDER_ID, AUTH_ID, { viaRetrieve: true });
  });

  it('retry 未指定時は viaRetrieve=false (認証実行経路)', async () => {
    const store = buildStore();
    const spy = vi.fn(async () => ({
      transResult: 'Y',
      reason: undefined,
      challengeUrl: undefined,
      authorized: true,
      status: 'AUTHORIZED',
    }));
    const app = createThreeDsCallbackFincodeApp({
      fincodeClient: { complete3DSecureAuth: spy } as never,
      store,
    });

    await post(app, { authId: AUTH_ID });

    expect(spy).toHaveBeenCalledWith(ORDER_ID, AUTH_ID, { viaRetrieve: false });
  });

  it('record 不在の authId は 404 で fincode を呼ばない', async () => {
    const spy = vi.fn();
    const app = createThreeDsCallbackFincodeApp({
      fincodeClient: { complete3DSecureAuth: spy } as never,
      store: buildStore(false),
    });

    const res = await post(app, { authId: 'unknown' });
    expect(res.status).toBe(404);
    expect(spy).not.toHaveBeenCalled();
  });

  it('body が JSON でない場合 400', async () => {
    const app = createThreeDsCallbackFincodeApp({
      fincodeClient: buildClient(async () => ({})),
      store: buildStore(),
    });
    const res = await app.request('/3ds-callback-fincode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json',
    });
    expect(res.status).toBe(400);
  });

  it('fincode error は 502 に変換する (webapp が再試行可能と判別できるように)', async () => {
    const app = createThreeDsCallbackFincodeApp({
      fincodeClient: buildClient(async () => {
        throw new FincodeAuthorizationError('secure2 failed', { errorCode: 'E01' });
      }),
      store: buildStore(),
    });

    const res = await post(app, { authId: AUTH_ID });
    expect(res.status).toBe(502);
    const body = (await res.json()) as { error: string; errorCode: string | null };
    expect(body.error).toBe('ThreeDsAuthFailed');
    expect(body.errorCode).toBe('E01');
  });

  it('想定外 error は 500 に変換する', async () => {
    const app = createThreeDsCallbackFincodeApp({
      fincodeClient: buildClient(async () => {
        throw new Error('boom');
      }),
      store: buildStore(),
    });

    const res = await post(app, { authId: AUTH_ID });
    expect(res.status).toBe(500);
  });
});
