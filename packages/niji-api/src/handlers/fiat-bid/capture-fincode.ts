/**
 * Fiat bid capture hono handler (fincode 経路、 Phase 4 backend 統合)
 *
 * POST /api/v1/fiat-bid/capture-fincode
 * request body — { authId }
 * 応答 body    — { authId, status: "captured" | "capture-failed", message, transactionId? }
 *
 * 処理順 —
 * (1) request body 検証 (authId)
 * (2) FincodeCaptureStore.findAuthorized で fincode 側 access_id + orderId 取得
 * (3) FincodeClient.capturePayment で PUT /v1/payments/{id} (job_code=CAPTURE) 発火
 * (4) 成功 = status "captured" 応答 + transactionId 返却 (webapp が chain 側 mint 呼出 trigger 用)
 * (5) 失敗 = FincodeAuthorizationError catch で 500 CaptureFailed 応答
 *
 * SSOT — packages/niji-api/src/handlers/fiat-bid/capture.ts (GMO 経路 mirror)、
 *        packages/niji-api/src/services/fincode/client.ts § capturePayment
 */

import { Hono } from 'hono';

import { FincodeAuthorizationError, FincodeClient } from '../../services/fincode/client.js';

/** request body */
export type CaptureFincodeRequestBody = {
  authId: string;
};

/** response body */
export type CaptureFincodeResponseBody = {
  authId: string;
  status: 'captured' | 'capture-failed';
  message: string;
  transactionId?: string;
};

/** DB store 抽象 (in-memory 差替可能) */
export type FincodeCaptureStore = {
  /**
   * authId で lookup、 fincode 側の access_id + orderId + jpyAmount を返す (capture PUT 用)、
   * 無ければ null
   */
  findAuthorized: (authId: string) => Promise<{
    authId: string;
    accessId: string;
    orderId: string;
    jpyAmount: number;
  } | null>;
  /** status を "captured" or "capture-failed" に UPDATE */
  updateCaptureStatus: (input: {
    authId: string;
    status: 'captured' | 'capture-failed';
    capturedAt?: Date;
    transactionId?: string;
  }) => Promise<void>;
};

/** request body parse */
export const parseCaptureFincodeBody = (
  raw: unknown,
): { ok: true; value: CaptureFincodeRequestBody } | { ok: false; message: string } => {
  if (raw === null || typeof raw !== 'object') {
    return { ok: false, message: 'request body must be a JSON object' };
  }
  const body = raw as Record<string, unknown>;
  const authId = body['authId'];
  if (typeof authId !== 'string' || authId.trim() === '') {
    return { ok: false, message: 'authId must be a non-empty string' };
  }
  return { ok: true, value: { authId: authId.trim() } };
};

export type CreateCaptureFincodeAppOptions = {
  fincodeClient: FincodeClient;
  store: FincodeCaptureStore;
  now?: () => Date;
};

/**
 * fincode capture handler の Hono app factory
 * options で FincodeClient / store を DI、 test 時に mock 差替
 */
export const createCaptureFincodeApp = (options: CreateCaptureFincodeAppOptions): Hono => {
  const app = new Hono();
  const now = options.now ?? (() => new Date());

  app.post('/capture-fincode', async c => {
    let rawBody: unknown;
    try {
      rawBody = await c.req.json();
    } catch {
      return c.json({ error: 'InvalidRequest', message: 'request body must be valid JSON' }, 400);
    }

    const parsed = parseCaptureFincodeBody(rawBody);
    if (!parsed.ok) {
      return c.json({ error: 'InvalidRequest', message: parsed.message }, 400);
    }

    const record = await options.store.findAuthorized(parsed.value.authId);
    if (record === null) {
      return c.json(
        { error: 'NotFound', message: `authId=${parsed.value.authId} not found in store` },
        404,
      );
    }

    try {
      const result = await options.fincodeClient.capturePayment(record.orderId, record.accessId);
      await options.store.updateCaptureStatus({
        authId: parsed.value.authId,
        status: 'captured',
        capturedAt: now(),
        transactionId: result.transaction_id,
      });
      const response: CaptureFincodeResponseBody = {
        authId: parsed.value.authId,
        status: 'captured',
        message: 'fincode capture succeeded',
        transactionId: result.transaction_id,
      };
      return c.json<CaptureFincodeResponseBody>(response, 200);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (err instanceof FincodeAuthorizationError) {
        console.error('[capture-fincode] FincodeAuthorizationError', message);
        return c.json(
          { error: 'CaptureFailed', message: `fincode capture failed: ${message}` },
          500,
        );
      }
      console.error('[capture-fincode] unexpected error', message);
      return c.json({ error: 'InternalError', message }, 500);
    }
  });

  return app;
};
