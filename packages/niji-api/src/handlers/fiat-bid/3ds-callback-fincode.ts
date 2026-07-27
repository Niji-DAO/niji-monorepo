/**
 * 3DS 2.0 callback handler (fincode 経路)
 *
 * POST /api/v1/fiat-bid/3ds-callback-fincode
 * request body — { authId }
 * 応答 body    — { authId, status, challengeUrl?, transResult?, reason? }
 *
 * 位置付け —
 * authorize 時に `tds2_ret_url` を渡すと fincode は status = AUTHENTICATED と acs_url を返す。
 * webapp は acs_url に遷移してカード会社の認証画面を表示し、 認証後 tds2_ret_url に戻ってくる。
 * その時点ではまだ与信は確定していないため、 本 handler が 3DS 認証実行と認証後決済実行を行う。
 *
 * status の 3 分岐 —
 * - `3ds-verified`     = 認証通過 + 与信確定。 webapp は続けて place-bid を呼ぶ
 * - `challenge-required` = チャレンジ認証が必要。 webapp は challengeUrl に遷移し、 戻ったら
 *                          `viaRetrieve: true` 相当の再呼出 (retry=true) で結果を取り直す
 * - `cancelled`        = 認証失敗 or 拒否。 与信は確定しておらずカードに請求は発生しない
 *
 * GMO 経路の 3ds-callback.ts とは別 handler。 決済事業者ごとに認証 API の形が違うため統合しない。
 *
 * SSOT — packages/niji-api/src/services/fincode/client.ts § complete3DSecureAuth
 */

import type { FincodeThreeDSecureAuthResult } from '../../services/fincode/types.js';

import { Hono } from 'hono';

import { FincodeAuthorizationError, FincodeClient } from '../../services/fincode/client.js';

/** 応答 body shape (公開 API 契約) */
export type ThreeDsCallbackFincodeResponseBody = {
  authId: string;
  status: '3ds-verified' | 'challenge-required' | 'cancelled';
  /** status = 'challenge-required' のときのみ返る */
  challengeUrl?: string;
  /** fincode の認証結果コード (audit / debug 用) */
  transResult?: FincodeThreeDSecureAuthResult;
  /** 認証結果の理由 (audit / debug 用) */
  reason?: string;
};

/**
 * authId から fincode の orderId / accessId を引く store 抽象。
 * authorize 時に保存した record を参照する (Workers では KV、 local では in-memory)。
 */
export type ThreeDsFincodeStore = {
  findAuthorized: (
    authId: string,
  ) => Promise<{ authId: string; orderId: string; accessId: string } | null>;
  /** 認証結果を record に反映する (任意実装、 未実装なら no-op で良い) */
  updateThreeDsStatus?: (input: {
    authId: string;
    status: ThreeDsCallbackFincodeResponseBody['status'];
    transResult?: FincodeThreeDSecureAuthResult;
  }) => Promise<void>;
};

export type CreateThreeDsCallbackFincodeAppOptions = {
  fincodeClient: FincodeClient;
  store: ThreeDsFincodeStore;
};

/** request body の検証。 authId 必須、 retry は任意 boolean */
export const parseThreeDsCallbackBody = (
  raw: unknown,
): { ok: true; authId: string; retry: boolean } | { ok: false; message: string } => {
  if (typeof raw !== 'object' || raw === null) {
    return { ok: false, message: 'request body must be a JSON object' };
  }
  const authId = (raw as { authId?: unknown }).authId;
  if (typeof authId !== 'string' || authId.trim() === '') {
    return { ok: false, message: 'authId must be a non-empty string' };
  }
  const retryRaw = (raw as { retry?: unknown }).retry;
  if (retryRaw !== undefined && typeof retryRaw !== 'boolean') {
    return { ok: false, message: 'retry must be a boolean when present' };
  }
  return { ok: true, authId: authId.trim(), retry: retryRaw === true };
};

/**
 * fincode 3DS callback handler の Hono app を返す factory。
 * fincodeClient / store は DI し、 test では mock を差替える。
 */
export const createThreeDsCallbackFincodeApp = (
  options: CreateThreeDsCallbackFincodeAppOptions,
): Hono => {
  const app = new Hono();

  app.post('/3ds-callback-fincode', async c => {
    let rawBody: unknown;
    try {
      rawBody = await c.req.json();
    } catch {
      return c.json({ error: 'InvalidRequest', message: 'request body must be valid JSON' }, 400);
    }

    const parsed = parseThreeDsCallbackBody(rawBody);
    if (!parsed.ok) {
      return c.json({ error: 'InvalidRequest', message: parsed.message }, 400);
    }
    const { authId, retry } = parsed;

    const record = await options.store.findAuthorized(authId);
    if (record === null) {
      return c.json(
        { error: 'NotFound', message: `authId=${authId} の与信情報が見つかりません` },
        404,
      );
    }

    let result;
    try {
      result = await options.fincodeClient.complete3DSecureAuth(record.orderId, record.accessId, {
        viaRetrieve: retry,
      });
    } catch (err) {
      if (err instanceof FincodeAuthorizationError) {
        return c.json(
          {
            error: 'ThreeDsAuthFailed',
            message: err.message,
            errorCode: err.errorCode ?? null,
            errorMessage: err.errorMessage ?? null,
          },
          502,
        );
      }
      return c.json(
        { error: 'InternalError', message: err instanceof Error ? err.message : String(err) },
        500,
      );
    }

    // 与信確定が最優先の判定。 authorized でないときだけチャレンジ要否を見る。
    let status: ThreeDsCallbackFincodeResponseBody['status'] = 'cancelled';
    if (result.authorized) {
      status = '3ds-verified';
    } else if (result.transResult === 'C') {
      status = 'challenge-required';
    }

    if (options.store.updateThreeDsStatus !== undefined) {
      const update: Parameters<NonNullable<ThreeDsFincodeStore['updateThreeDsStatus']>>[0] = {
        authId,
        status,
      };
      if (result.transResult !== undefined) update.transResult = result.transResult;
      await options.store.updateThreeDsStatus(update);
    }

    const body: ThreeDsCallbackFincodeResponseBody = { authId, status };
    if (result.challengeUrl !== undefined) body.challengeUrl = result.challengeUrl;
    if (result.transResult !== undefined) body.transResult = result.transResult;
    if (result.reason !== undefined) body.reason = result.reason;

    return c.json<ThreeDsCallbackFincodeResponseBody>(body, 200);
  });

  return app;
};
