/**
 * Fiat bid capture hono handler (Issue #3010 Phase D)
 *
 * POST /api/v1/fiat-bid/capture
 * request body — { authId, tds2Result? }
 * 応答 body    — { authId, status: "captured" | "capture-failed", message }
 *
 * 処理順 —
 * (1) request body 検証 (authId、 tds2Result optional で "0" 期待)
 * (2) fiat_bid record を authId で lookup、 status = "bid-placed" verify
 * (3) GmoClient.alterTran(JobCd=SALES, amount) で 実売上確定 (与信枠 → 売上変換)
 * (4) 成功時 fiat_bid.status = "captured" UPDATE + capturedAt 記録
 * (5) fail 時 fiat_bid.status = "cancelled" UPDATE + 運営 alert log + 200 応答 (顧客不利防止、
 *     capture-failed は運営が JPY 補填 policy で吸収する SSOT)
 *
 * error 変換 —
 * - request validation fail       → 400 InvalidRequest
 * - fiat_bid not found            → 404 NotFound
 * - fiat_bid.status ≠ bid-placed  → 409 Conflict (idempotency、 既に captured / cancelled 状態を弾く)
 * - GMO alterTran fail            → 200 OK で { status: "capture-failed" } + 運営 alert log
 * - DB update fail                → 500 InternalError
 *
 * SSOT — tests/spec/gmo-fiat-bid/Phase1-01-master-spec.md § P6 (異常系 A 案 = 事後 recovery)、
 *        Phase1-02-issue-breakdown.md § Issue 7 Phase D、
 *        rules/quality.md § test-passed marker 発行前提
 */

import { Hono } from 'hono';

import { GmoAuthorizationError, GmoClient } from '../../services/gmo/client.js';

/** request body shape (webapp が POST する) */
export type CaptureRequestBody = {
  authId: string;
  /** 3DS 認証結果 ("0" が成功、 mock env では省略可) */
  tds2Result?: string;
};

/** 応答 body shape (公開 API 契約) */
export type CaptureResponseBody = {
  authId: string;
  status: 'captured' | 'capture-failed';
  message: string;
};

/** DB store 抽象 (handler test で mock 差替え) */
export type CaptureStore = {
  /**
   * fiat_bid record を authId で lookup、 無ければ null
   * status / accessPass / jpyAmount を返す (capture 判定 + GMO 呼出用)
   */
  findBidPlaced: (authId: string) => Promise<{
    authId: string;
    status: string;
    accessPass: string;
    jpyAmount: number;
  } | null>;
  /**
   * status を "captured" or "cancelled" に UPDATE
   * captured 遷移時は capturedAt を server 側 Date で刻む
   */
  updateCaptureStatus: (input: {
    authId: string;
    status: 'captured' | 'cancelled';
    capturedAt?: Date;
  }) => Promise<void>;
};

/**
 * request body の shape 検証
 */
export const parseCaptureBody = (
  raw: unknown,
): { ok: true; value: CaptureRequestBody } | { ok: false; message: string } => {
  if (raw === null || typeof raw !== 'object') {
    return { ok: false, message: 'request body must be a JSON object' };
  }
  const body = raw as Record<string, unknown>;
  const authId = body['authId'];
  if (typeof authId !== 'string' || authId.trim() === '') {
    return { ok: false, message: 'authId must be a non-empty string' };
  }
  const tds2ResultRaw = body['tds2Result'];
  const tds2Result =
    typeof tds2ResultRaw === 'string' && tds2ResultRaw.trim() !== '' ? tds2ResultRaw : undefined;
  const value: CaptureRequestBody = tds2Result === undefined ? { authId } : { authId, tds2Result };
  return { ok: true, value };
};

export type CreateCaptureAppOptions = {
  gmoClient: GmoClient;
  store: CaptureStore;
  /** shop 認証 (env 依存の値、 test で default override) */
  shopId?: string;
  shopPass?: string;
  /**
   * capture 失敗時の運営 alert 出力先 (Phase 1 は console.error、 Phase 4 で PagerDuty 等に置換)
   */
  onCaptureFail?: (input: {
    authId: string;
    jpyAmount: number;
    errCode?: string;
    errInfo?: string;
  }) => void;
  /** capturedAt 時刻の source (test で固定値 inject) */
  now?: () => Date;
};

/**
 * capture handler の Hono app を返す factory
 */
export const createCaptureApp = (options: CreateCaptureAppOptions): Hono => {
  const app = new Hono();
  const shopId = options.shopId ?? process.env['GMO_SHOP_ID'] ?? 'tshop00000001';
  const shopPass = options.shopPass ?? process.env['GMO_SHOP_PASS'] ?? 'test_pass';
  const now = options.now ?? (() => new Date());
  const onCaptureFail =
    options.onCaptureFail ??
    (input => {
      // Phase 1 = console.error 経路のみ、 Phase 4 で監視 dashboard + PagerDuty alert 化
      console.error('[capture-failed]', {
        authId: input.authId,
        jpyAmount: input.jpyAmount,
        errCode: input.errCode,
        errInfo: input.errInfo,
      });
    });

  app.post('/capture', async c => {
    let rawBody: unknown;
    try {
      rawBody = await c.req.json();
    } catch {
      return c.json({ error: 'InvalidRequest', message: 'request body must be valid JSON' }, 400);
    }

    const parsed = parseCaptureBody(rawBody);
    if (!parsed.ok) {
      return c.json({ error: 'InvalidRequest', message: parsed.message }, 400);
    }
    const body = parsed.value;

    // fiat_bid record lookup、 無ければ 404
    let record: Awaited<ReturnType<CaptureStore['findBidPlaced']>>;
    try {
      record = await options.store.findBidPlaced(body.authId);
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

    // status = "bid-placed" 以外は 409 Conflict
    if (record.status !== 'bid-placed') {
      return c.json(
        {
          error: 'Conflict',
          message: `fiat_bid status must be "bid-placed" (actual: "${record.status}")`,
          actualStatus: record.status,
        },
        409,
      );
    }

    // GMO alterTran(JobCd=SALES, amount) で 実売上確定
    try {
      await options.gmoClient.alterTran({
        shopId,
        shopPass,
        accessId: record.authId,
        accessPass: record.accessPass,
        jobCd: 'SALES',
        amount: record.jpyAmount,
      });
    } catch (err) {
      // capture 失敗 = 顧客不利防止で 200 応答、 運営 alert 発行、 fiat_bid.status = cancelled 遷移
      const errCode = err instanceof GmoAuthorizationError ? err.errCode : undefined;
      const errInfo = err instanceof GmoAuthorizationError ? err.errInfo : undefined;
      onCaptureFail({
        authId: record.authId,
        jpyAmount: record.jpyAmount,
        ...(errCode !== undefined ? { errCode } : {}),
        ...(errInfo !== undefined ? { errInfo } : {}),
      });
      try {
        await options.store.updateCaptureStatus({
          authId: record.authId,
          status: 'cancelled',
        });
      } catch (dbErr) {
        return c.json(
          {
            error: 'InternalError',
            message: `fiat_bid status update failed after capture fail: ${dbErr instanceof Error ? dbErr.message : String(dbErr)}`,
          },
          500,
        );
      }
      const response: CaptureResponseBody = {
        authId: record.authId,
        status: 'capture-failed',
        message: 'クレジット決済の確定に失敗しました。 運営から個別にご連絡します。',
      };
      return c.json<CaptureResponseBody>(response, 200);
    }

    // capture 成功 — fiat_bid.status = "captured" + capturedAt UPDATE
    try {
      await options.store.updateCaptureStatus({
        authId: record.authId,
        status: 'captured',
        capturedAt: now(),
      });
    } catch (err) {
      return c.json(
        {
          error: 'InternalError',
          message: `fiat_bid status update failed after capture success: ${err instanceof Error ? err.message : String(err)}`,
        },
        500,
      );
    }

    const response: CaptureResponseBody = {
      authId: record.authId,
      status: 'captured',
      message: 'クレジット決済が確定しました。 NFT を転送します。',
    };
    return c.json<CaptureResponseBody>(response, 200);
  });

  return app;
};
