/**
 * Fiat bid 3D セキュア 2.0 callback hono handler (Issue #3007 Phase B)
 *
 * POST /api/v1/fiat-bid/3ds-callback
 * request body — { authId, transactionId, result: "success" | "fail" }
 * 応答 body    — { authId, status: "3ds-verified" | "cancelled" }
 *
 * 処理順 —
 * (1) request body 検証 (欠損 / 型 / result enum)
 * (2) fiat_bid table から authId で pending record lookup (無ければ 404 NotFound)
 * (3) result === "success" の場合 —
 *     GmoClient.verifyTds2 で GMO 側 authorization 状態を verify
 *     GMO verify 成功で fiat_bid.status = "3ds-verified" に UPDATE
 * (4) result === "fail" の場合 —
 *     GmoClient.cancelAuthorization で与信枠 (authorization hold) を cancel
 *     fiat_bid.status = "cancelled" に UPDATE
 * (5) 応答 body 返却
 *
 * error 変換 —
 * - request validation fail    → 400 InvalidRequest
 * - authId 該当 record 無し    → 404 NotFound
 * - GMO verifyTds2 fail        → 500 GmoVerifyTds2Failed
 * - GMO cancel fail (fail 経路) → 500 GmoCancelFailed (但し fiat_bid.status は既に cancelled で UPDATE 済、
 *                                  GMO 側 authorization は残る可能性、 operational alert 対象)
 * - unexpected error            → 500 InternalError
 *
 * SSOT — tests/spec/gmo-fiat-bid/Phase1-01-master-spec.md § P5, P7、
 *        Phase1-02-issue-breakdown.md § Issue 4、
 *        rules/quality.md § test-passed marker 発行前提
 */

import { Hono } from 'hono';

import { GmoAuthorizationError, GmoClient } from '../../services/gmo/client.js';

/** request body shape (webapp return page が POST する) */
export type ThreeDsCallbackRequestBody = {
  authId: string;
  transactionId: string;
  /** mock 3DS 画面 / 実 GMO 3DS 認証の判定結果 */
  result: 'success' | 'fail';
};

/** 応答 body shape (公開 API 契約) */
export type ThreeDsCallbackResponseBody = {
  authId: string;
  status: '3ds-verified' | 'cancelled';
};

/**
 * DB store 抽象 (Ponder DB を直接触らずに handler test 可能に)
 * authorize handler の insertPending と別に、 本 handler は
 * status update + accessPass lookup (cancelAuthorization 呼出に必要) を担う
 */
export type ThreeDsCallbackStore = {
  /**
   * authId で pending record を lookup (無ければ null)
   * cancel 経路で accessPass が必要、 verify 経路でも同 field を verifyTds2 に渡す
   */
  findPending: (authId: string) => Promise<{
    authId: string;
    accessPass: string;
    status: string;
  } | null>;
  /**
   * status を新値に UPDATE (verify 成功で "3ds-verified"、 fail で "cancelled")
   * 冪等性 = 同 authId + status で 2 度呼ばれても状態遷移 valid (once-only 判定は Issue #3008 で追加)
   */
  updateStatus: (input: { authId: string; status: '3ds-verified' | 'cancelled' }) => Promise<void>;
};

/**
 * request body の shape 検証
 * unknown value を受取り ThreeDsCallbackRequestBody に絞込 (or error message 返す)
 */
export const parseCallbackBody = (
  raw: unknown,
): { ok: true; value: ThreeDsCallbackRequestBody } | { ok: false; message: string } => {
  if (raw === null || typeof raw !== 'object') {
    return { ok: false, message: 'request body must be a JSON object' };
  }
  const body = raw as Record<string, unknown>;

  const authId = body['authId'];
  if (typeof authId !== 'string' || authId.trim() === '') {
    return { ok: false, message: 'authId must be a non-empty string' };
  }

  const transactionId = body['transactionId'];
  if (typeof transactionId !== 'string' || transactionId.trim() === '') {
    return { ok: false, message: 'transactionId must be a non-empty string' };
  }

  const result = body['result'];
  if (result !== 'success' && result !== 'fail') {
    return { ok: false, message: 'result must be "success" or "fail"' };
  }

  return {
    ok: true,
    value: { authId, transactionId, result },
  };
};

export type CreateThreeDsCallbackAppOptions = {
  gmoClient: GmoClient;
  store: ThreeDsCallbackStore;
};

/**
 * 3ds-callback handler の Hono app を返す factory
 * options で GmoClient / DB store を DI、 test 時に mock 差替
 */
export const createThreeDsCallbackApp = (options: CreateThreeDsCallbackAppOptions): Hono => {
  const app = new Hono();

  app.post('/3ds-callback', async c => {
    let rawBody: unknown;
    try {
      rawBody = await c.req.json();
    } catch {
      return c.json({ error: 'InvalidRequest', message: 'request body must be valid JSON' }, 400);
    }

    const parsed = parseCallbackBody(rawBody);
    if (!parsed.ok) {
      return c.json({ error: 'InvalidRequest', message: parsed.message }, 400);
    }
    const body = parsed.value;

    // fiat_bid record を authId で lookup、 無ければ 404
    let record: Awaited<ReturnType<ThreeDsCallbackStore['findPending']>>;
    try {
      record = await options.store.findPending(body.authId);
    } catch (err) {
      return c.json(
        {
          error: 'InternalError',
          message: `fiat_bid lookup failed: ${err instanceof Error ? err.message : String(err)}`,
        },
        500,
      );
    }
    if (record === null) {
      return c.json(
        {
          error: 'NotFound',
          message: `fiat_bid record not found for authId=${body.authId}`,
        },
        404,
      );
    }

    if (body.result === 'success') {
      // GMO 側 authorization 状態を verify (chargeback 対策 SSOT、 認証成功のみ status 遷移)
      try {
        await options.gmoClient.verifyTds2({
          accessId: body.authId,
          accessPass: record.accessPass,
          transactionId: body.transactionId,
        });
      } catch (err) {
        if (err instanceof GmoAuthorizationError) {
          return c.json(
            {
              error: 'GmoVerifyTds2Failed',
              message: err.message,
              errCode: err.errCode ?? null,
              errInfo: err.errInfo ?? null,
            },
            500,
          );
        }
        return c.json(
          {
            error: 'InternalError',
            message: err instanceof Error ? err.message : String(err),
          },
          500,
        );
      }

      // fiat_bid.status = 3ds-verified に UPDATE
      try {
        await options.store.updateStatus({ authId: body.authId, status: '3ds-verified' });
      } catch (err) {
        return c.json(
          {
            error: 'InternalError',
            message: `fiat_bid status update failed: ${err instanceof Error ? err.message : String(err)}`,
          },
          500,
        );
      }
      const response: ThreeDsCallbackResponseBody = {
        authId: body.authId,
        status: '3ds-verified',
      };
      return c.json<ThreeDsCallbackResponseBody>(response, 200);
    }

    // result === "fail" — 与信枠 cancel + fiat_bid.status = cancelled
    // 順序 = 先に DB 更新して user 応答を確定、 GMO cancel は best effort (失敗時 operational alert)
    // 但し GMO cancel fail = 与信枠が残る = 顧客不利、 fail は 500 で明示応答 (webapp は retry 選択肢を提示)
    try {
      await options.store.updateStatus({ authId: body.authId, status: 'cancelled' });
    } catch (err) {
      return c.json(
        {
          error: 'InternalError',
          message: `fiat_bid status update failed: ${err instanceof Error ? err.message : String(err)}`,
        },
        500,
      );
    }

    try {
      await options.gmoClient.cancelAuthorization({
        accessId: body.authId,
        accessPass: record.accessPass,
      });
    } catch (err) {
      if (err instanceof GmoAuthorizationError) {
        return c.json(
          {
            error: 'GmoCancelFailed',
            message: err.message,
            errCode: err.errCode ?? null,
            errInfo: err.errInfo ?? null,
          },
          500,
        );
      }
      return c.json(
        {
          error: 'InternalError',
          message: err instanceof Error ? err.message : String(err),
        },
        500,
      );
    }

    const response: ThreeDsCallbackResponseBody = {
      authId: body.authId,
      status: 'cancelled',
    };
    return c.json<ThreeDsCallbackResponseBody>(response, 200);
  });

  return app;
};
