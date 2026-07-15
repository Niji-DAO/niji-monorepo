/**
 * fincode byGMO mock server (Phase 2 backend 統合、 Issue #3115)
 *
 * MSW の setupServer で fincode API endpoint 2 本を intercept する。
 * `USE_FINCODE_MOCK=true` (default) の場合に `pnpm dev` 起動時 conditional に start される。
 *
 * 実装対象 endpoint (fincode 公式 API リファレンス準拠) —
 *  - POST /v1/payments        ... 決済登録 (access_id 発行、 status = CHECKED)
 *  - PUT  /v1/payments/{id}   ... 決済実行 (与信 authorization、 status = AUTHORIZED / AUTHENTICATED)
 *
 * response 仕様 (application/json) は fincode 公式仕様に準拠、 実 API 応答を再現する。
 * GMO 世代 mock (gmo-server.ts) と対比 pattern で maintenance 容易性確保。
 */

import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

/**
 * fincode 決済 mock state (テスト間で共有される in-memory store)
 * 実 API との差異 = access_id の永続化は Ponder DB (fiat_bid schema) が担う、
 * mock は request 単位で成功応答を返すだけの最小実装。
 */
type MockFincodeState = {
  payments: Map<
    string,
    {
      accessId: string;
      status: 'CHECKED' | 'AUTHORIZED' | 'CAPTURED' | 'AUTHENTICATED';
      amount: string;
      jobCode: string;
    }
  >;
};

const createMockState = (): MockFincodeState => ({
  payments: new Map(),
});

const state = createMockState();

/**
 * mock state reset (test 用 export、 test 間の payment state 干渉排除)
 */
export const resetFincodeMockState = (): void => {
  state.payments.clear();
  idCounter = 0;
};

/**
 * 決定的 mock ID 生成器 (テスト再現性のため counter ベース)
 * 実 fincode は 26 桁 ULID を返す、 mock は "mock-fincode-" prefix + counter で十分。
 */
let idCounter = 0;
const nextMockId = (prefix: string): string => {
  idCounter += 1;
  return `${prefix}${String(idCounter).padStart(8, '0')}`;
};

/**
 * fincode mock server の base URL 前提 = env `FINCODE_MOCK_ENDPOINT` (default `http://127.0.0.1:2427`)
 * MSW は wildcard host にも match するが、 明示的に env から取ることで prod 切替時の port 衝突回避。
 */
export const fincodeMockBaseUrl = (): string => {
  return process.env['FINCODE_MOCK_ENDPOINT'] ?? 'http://127.0.0.1:2427';
};

/** fincode error 応答 build helper */
const buildFincodeErrorResponse = (
  status: number,
  errorCode: string,
  errorMessage: string,
): HttpResponse<string> => {
  return new HttpResponse(
    JSON.stringify({
      errors: [{ error_code: errorCode, error_message: errorMessage }],
    }),
    {
      status,
      headers: { 'Content-Type': 'application/json' },
    },
  );
};

/**
 * MSW handler 2 本 (POST /v1/payments / PUT /v1/payments/{id})
 * 各 handler は JSON body を parse、 mock state を update、 JSON response を返す。
 * fincode API secret verify は mock ではしない (test 環境完結のため)、 実 API は Authorization header 必須。
 */
export const fincodeHandlers = [
  /**
   * POST /v1/payments — 決済登録
   * 必須 param = pay_type / job_code / amount / id
   * 応答 = id / access_id / status = CHECKED
   */
  http.post(`${fincodeMockBaseUrl()}/v1/payments`, async ({ request }) => {
    let body: {
      pay_type?: string;
      job_code?: string;
      amount?: string;
      id?: string;
    };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return buildFincodeErrorResponse(400, 'E10000', 'invalid JSON body');
    }

    if (body.id === undefined || body.id === '') {
      return buildFincodeErrorResponse(400, 'E10001', 'id is required');
    }
    if (body.amount === undefined || body.amount === '') {
      return buildFincodeErrorResponse(400, 'E10002', 'amount is required');
    }

    const amountNum = Number.parseInt(body.amount, 10);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      return buildFincodeErrorResponse(400, 'E10003', 'amount must be positive integer');
    }

    // bid 上限 100 万円 check (webapp + backend 2 層強制の backend 側、 Phase 1 SSOT)
    if (amountNum > 1_000_000) {
      return buildFincodeErrorResponse(400, 'E10010', 'amount exceeds bid limit 1,000,000 JPY');
    }

    const accessId = nextMockId('mock-fincode-acc-');
    state.payments.set(body.id, {
      accessId,
      status: 'CHECKED',
      amount: body.amount,
      jobCode: body.job_code ?? 'AUTH',
    });

    return HttpResponse.json({
      id: body.id,
      access_id: accessId,
      status: 'CHECKED',
      job_code: body.job_code ?? 'AUTH',
      amount: body.amount,
      pay_type: body.pay_type ?? 'Card',
    });
  }),

  /**
   * PUT /v1/payments/{id} — 決済実行 (与信 authorization + 3DS 判定)
   * 必須 param = pay_type / access_id / method / token
   * 応答 = status = AUTHORIZED (通常) / AUTHENTICATED (3DS 必要、 acs_url 併記)
   */
  http.put(`${fincodeMockBaseUrl()}/v1/payments/:id`, async ({ request, params }) => {
    const orderId = params['id'] as string;
    let body: {
      pay_type?: string;
      access_id?: string;
      method?: string;
      token?: string;
      tds2_ret_url?: string;
      tds2_type?: string;
    };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return buildFincodeErrorResponse(400, 'E10000', 'invalid JSON body');
    }

    const existing = state.payments.get(orderId);
    if (existing === undefined) {
      return buildFincodeErrorResponse(404, 'E10100', `payment ${orderId} not found`);
    }

    if (body.access_id !== existing.accessId) {
      return buildFincodeErrorResponse(400, 'E10101', 'access_id mismatch');
    }
    if (body.token === undefined || body.token === '') {
      return buildFincodeErrorResponse(400, 'E10102', 'token is required');
    }

    // fail 経路 mock = テスト用に特定 token で fail 応答
    if (body.token === 'card_token_declined') {
      return buildFincodeErrorResponse(402, 'CARD_DECLINED', 'card declined by issuer');
    }

    // 3DS 必要 mock = tds2_ret_url 送信時に AUTHENTICATED + acs_url 返却
    if (body.tds2_ret_url !== undefined) {
      state.payments.set(orderId, {
        ...existing,
        status: 'AUTHENTICATED',
      });
      return HttpResponse.json({
        id: orderId,
        access_id: existing.accessId,
        status: 'AUTHENTICATED',
        job_code: existing.jobCode,
        amount: existing.amount,
        pay_type: 'Card',
        acs_url: `${fincodeMockBaseUrl()}/mock-3ds?orderId=${encodeURIComponent(orderId)}&accessId=${encodeURIComponent(existing.accessId)}&returnUrl=${encodeURIComponent(body.tds2_ret_url)}`,
        transaction_id: nextMockId('mock-fincode-tx-'),
      });
    }

    // 通常経路 = AUTHORIZED 応答 (3DS 不要 pattern)
    state.payments.set(orderId, {
      ...existing,
      status: 'AUTHORIZED',
    });
    return HttpResponse.json({
      id: orderId,
      access_id: existing.accessId,
      status: 'AUTHORIZED',
      job_code: existing.jobCode,
      amount: existing.amount,
      pay_type: 'Card',
      approve: nextMockId('9'),
      transaction_id: nextMockId('mock-fincode-tx-'),
    });
  }),
];

/**
 * fincode mock server (Ponder dev server 起動時に conditional listen)
 * export された server 変数 = test 側で beforeAll に listen / afterAll に close
 */
export const fincodeMockServer = setupServer(...fincodeHandlers);
