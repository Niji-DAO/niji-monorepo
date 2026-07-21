/**
 * fincode byGMO API client (Phase 2 backend 統合、 Issue #3115)
 *
 * fincode 公式仕様 —
 * - Content-Type = application/json (request / response 双方)
 * - Authorization = Bearer <FINCODE_API_KEY_SECRET> (secret key、 backend 専用、 browser 露出禁止)
 * - Tenant-Shop-Id header = <FINCODE_TENANT_SHOP_ID> (テナント運用時のみ、 単一店舗契約時は空 OK)
 * - error は HTTP 4xx / 5xx で { errors: [{ error_code, error_message }] } を JSON body に返す
 *
 * env 切替 —
 * - `USE_FINCODE_MOCK=true` (dev / test) → `FINCODE_MOCK_ENDPOINT` (default `http://127.0.0.1:2427`) を叩く
 * - `USE_FINCODE_MOCK=false` (本番 / 実 test env verify) → `FINCODE_API_KEY_SECRET` prefix で prod (m_live_) / test (m_test_) 自動判別
 *   - live=true → https://api.fincode.jp
 *   - live=false → https://api.test.fincode.jp
 *
 * SSOT — packages/niji-api/src/services/gmo/client.ts (GMO 世代の対比 pattern)、
 *        packages/niji-api/src/services/fincode/types.ts
 */

import type {
  FincodeAuthorizationResult,
  FincodeErrorResponse,
  FincodePaymentCaptureRequest,
  FincodePaymentCaptureSuccess,
  FincodePaymentExecuteRequest,
  FincodePaymentExecuteSuccess,
  FincodePaymentRegisterRequest,
  FincodePaymentRegisterSuccess,
} from './types.js';

/** DI 用の fetch signature (test で mock 差替可能、 GMO と同 pattern) */
export type FetchLike = typeof globalThis.fetch;

export type FincodeClientOptions = {
  /**
   * fincode API base URL (default = env `FINCODE_ENDPOINT` 経由、 mock / live 自動切替)
   */
  endpoint?: string;
  /** API secret key (default = env `FINCODE_API_KEY_SECRET`) */
  apiKeySecret?: string;
  /** テナント shop ID (default = env `FINCODE_TENANT_SHOP_ID`、 空 OK) */
  tenantShopId?: string;
  /** request timeout (ms、 default = env `FINCODE_REQUEST_TIMEOUT_MS` or 30000) */
  timeoutMs?: number;
  /** fetch 実装差替 (test 用、 default = globalThis.fetch) */
  fetch?: FetchLike;
};

/**
 * fincode API 障害 (network fail / HTTP error / errors 返却) を統合した error
 * authorize handler は本 error を catch して 5xx FincodeAuthorizationFailed に変換する
 */
export class FincodeAuthorizationError extends Error {
  public readonly errorCode?: string;
  public readonly errorMessage?: string;
  constructor(
    message: string,
    options: { errorCode?: string; errorMessage?: string; cause?: unknown } = {},
  ) {
    super(message);
    this.name = 'FincodeAuthorizationError';
    if (options.errorCode !== undefined) {
      this.errorCode = options.errorCode;
    }
    if (options.errorMessage !== undefined) {
      this.errorMessage = options.errorMessage;
    }
    if (options.cause !== undefined) {
      (this as { cause?: unknown }).cause = options.cause;
    }
  }
}

/**
 * env / options から endpoint を決定
 * USE_FINCODE_MOCK truthy → FINCODE_MOCK_ENDPOINT
 * それ以外は FINCODE_API_KEY_SECRET の prefix で live / test 自動判別
 * (m_live_XXXX → live env、 m_test_XXXX → test env)
 */
const resolveEndpoint = (option: string | undefined): string => {
  if (option !== undefined && option.trim() !== '') {
    return option;
  }
  const useMock = (process.env['USE_FINCODE_MOCK'] ?? 'true').trim().toLowerCase();
  const isMock = useMock === 'true' || useMock === '1' || useMock === 'yes';
  if (isMock) {
    return process.env['FINCODE_MOCK_ENDPOINT'] ?? 'http://127.0.0.1:2427';
  }
  const apiKey = process.env['FINCODE_API_KEY_SECRET'] ?? '';
  const isLive = apiKey.startsWith('m_live_');
  if (isLive) {
    return process.env['FINCODE_LIVE_ENDPOINT'] ?? 'https://api.fincode.jp';
  }
  return process.env['FINCODE_TEST_ENDPOINT'] ?? 'https://api.test.fincode.jp';
};

const readStringConfig = (option: string | undefined, envKey: string, fallback: string): string => {
  if (option !== undefined && option.trim() !== '') {
    return option;
  }
  const raw = process.env[envKey];
  if (raw !== undefined && raw.trim() !== '') {
    return raw;
  }
  return fallback;
};

const readNumberConfig = (
  optionValue: number | undefined,
  envKey: string,
  defaultValue: number,
): number => {
  if (typeof optionValue === 'number' && Number.isFinite(optionValue) && optionValue > 0) {
    return optionValue;
  }
  const raw = process.env[envKey];
  if (raw !== undefined && raw.trim() !== '') {
    const parsed = Number.parseFloat(raw);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return defaultValue;
};

/** timeout 付き fetch (AbortController で abort 時 signal) */
const fetchWithTimeout = async (
  fetchImpl: FetchLike,
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetchImpl(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

/** fincode error response 判定 (HTTP status 4xx/5xx or body.errors 存在) */
const extractFincodeError = (
  status: number,
  body: unknown,
): { code: string; message: string } | undefined => {
  if (status >= 200 && status < 300) {
    return undefined;
  }
  if (body === null || typeof body !== 'object') {
    return { code: `HTTP_${status}`, message: `HTTP ${status} with non-JSON body` };
  }
  const errors = (body as FincodeErrorResponse).errors;
  if (Array.isArray(errors) && errors.length > 0 && errors[0] !== undefined) {
    return {
      code: errors[0].error_code ?? `HTTP_${status}`,
      message: errors[0].error_message ?? `HTTP ${status}`,
    };
  }
  return { code: `HTTP_${status}`, message: `HTTP ${status}` };
};

export class FincodeClient {
  private readonly endpoint: string;
  private readonly apiKeySecret: string;
  private readonly tenantShopId: string;
  private readonly timeoutMs: number;
  private readonly fetchImpl: FetchLike;

  constructor(options: FincodeClientOptions = {}) {
    this.endpoint = resolveEndpoint(options.endpoint);
    this.apiKeySecret = readStringConfig(options.apiKeySecret, 'FINCODE_API_KEY_SECRET', '');
    this.tenantShopId = readStringConfig(options.tenantShopId, 'FINCODE_TENANT_SHOP_ID', '');
    this.timeoutMs = readNumberConfig(options.timeoutMs, 'FINCODE_REQUEST_TIMEOUT_MS', 30000);
    this.fetchImpl = options.fetch ?? globalThis.fetch;
  }

  /**
   * POST /v1/payments — 決済登録 (access_id 発行、 status = CHECKED)
   * amount は fincode 仕様上 string で送信 (JSON body でも文字列型)
   */
  async registerPayment(
    req: FincodePaymentRegisterRequest,
  ): Promise<FincodePaymentRegisterSuccess> {
    const body = await this.post<FincodePaymentRegisterSuccess>('/v1/payments', req);
    if (body.access_id === undefined || body.access_id === '') {
      throw new FincodeAuthorizationError('fincode registerPayment missing access_id');
    }
    return body;
  }

  /**
   * PUT /v1/payments/{id} — 決済実行 (与信 authorization + 3DS 2.0 判定)
   * token = webapp が fincode.js iframe tokenize で受領した card_id
   */
  async executePayment(
    orderId: string,
    req: FincodePaymentExecuteRequest,
  ): Promise<FincodePaymentExecuteSuccess> {
    const path = `/v1/payments/${encodeURIComponent(orderId)}`;
    const body = await this.put<FincodePaymentExecuteSuccess>(path, req);
    if (body.status === undefined) {
      throw new FincodeAuthorizationError('fincode executePayment missing status');
    }
    return body;
  }

  /**
   * register + execute を順次呼出、 authorize handler が使う統合 method
   * どちらか fail 時に FincodeAuthorizationError を throw (handler で 5xx 変換)
   */
  async authorize(input: {
    orderId: string;
    amount: number;
    cardToken: string;
    tds2RetUrl?: string;
  }): Promise<FincodeAuthorizationResult> {
    const registered = await this.registerPayment({
      pay_type: 'Card',
      job_code: 'AUTH',
      amount: String(input.amount),
      id: input.orderId,
    });

    const executeReq: FincodePaymentExecuteRequest = {
      pay_type: 'Card',
      access_id: registered.access_id,
      method: '1',
      token: input.cardToken,
    };
    if (input.tds2RetUrl !== undefined) {
      executeReq.tds2_ret_url = input.tds2RetUrl;
      executeReq.tds2_type = '2';
    }
    const executed = await this.executePayment(input.orderId, executeReq);

    return {
      authId: executed.access_id,
      accessId: executed.access_id,
      tds2Url: executed.acs_url,
      orderId: executed.id,
      status: executed.status,
      approve: executed.approve,
      transactionId: executed.transaction_id,
    };
  }

  /**
   * PUT /v1/payments/{id}/capture — 与信 (AUTHORIZED) から売上確定 (CAPTURED) への遷移
   * capture handler が使う、 authorize.ts で発行済 access_id を使って capture 実行。
   * SSOT — https://github.com/fincode-byGMO/fincode-sdk-node src/api/v1/payment.ts § capture()
   */
  async capturePayment(orderId: string, accessId: string): Promise<FincodePaymentCaptureSuccess> {
    const path = `/v1/payments/${encodeURIComponent(orderId)}/capture`;
    const req: FincodePaymentCaptureRequest = {
      pay_type: 'Card',
      access_id: accessId,
      method: '1',
    };
    const body = await this.put<FincodePaymentCaptureSuccess>(path, req);
    if (body.status !== 'CAPTURED') {
      throw new FincodeAuthorizationError(
        `fincode capturePayment expected status=CAPTURED, got status=${body.status}`,
      );
    }
    return body;
  }

  /**
   * PUT /v1/payments/{id}/cancel — 与信 (AUTHORIZED) の取消 (auth 解放、 実カード請求発生させず)
   * fiat bid で「auction 敗北」 時に呼出、 user の card 与信枠を返却する。
   * SSOT — https://docs.fincode.jp/api § payment.cancel
   */
  async cancelPayment(
    orderId: string,
    accessId: string,
  ): Promise<{ id: string; access_id: string; status: string }> {
    const path = `/v1/payments/${encodeURIComponent(orderId)}/cancel`;
    const req = {
      pay_type: 'Card' as const,
      access_id: accessId,
    };
    return this.put<{ id: string; access_id: string; status: string }>(path, req);
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>('POST', path, body);
  }

  private async put<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>('PUT', path, body);
  }

  private async request<T>(method: 'POST' | 'PUT', path: string, body: unknown): Promise<T> {
    const url = `${this.endpoint.replace(/\/$/, '')}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKeySecret}`,
    };
    if (this.tenantShopId !== '') {
      headers['Tenant-Shop-Id'] = this.tenantShopId;
    }
    let response: Response;
    try {
      response = await fetchWithTimeout(
        this.fetchImpl,
        url,
        {
          method,
          headers,
          body: JSON.stringify(body),
        },
        this.timeoutMs,
      );
    } catch (err) {
      // debug 用 verbose log = handler 側の catch で cause が捨てられるため client 層で stderr 出力。
      const causeMessage = err instanceof Error ? err.message : String(err);
      const causeName = err instanceof Error ? err.name : 'unknown';
      console.error(
        `[fincode.request] fetch error: ${method} ${url} | ${causeName}: ${causeMessage}`,
      );
      throw new FincodeAuthorizationError(`fincode ${method} ${path} network error`, {
        cause: err,
      });
    }
    let parsed: unknown;
    try {
      parsed = await response.json();
    } catch (err) {
      throw new FincodeAuthorizationError(`fincode ${method} ${path} invalid JSON body`, {
        cause: err,
      });
    }
    const err = extractFincodeError(response.status, parsed);
    if (err !== undefined) {
      // debug 用 verbose log = fincode 側 error message (日本語 説明) を stderr に出力、
      // + request body / response body の一部を dump して root cause 特定を助ける。
      const bodyPreview = JSON.stringify(body ?? {}).slice(0, 500);
      const respPreview = JSON.stringify(parsed ?? {}).slice(0, 500);
      console.error(
        `[fincode.request] fincode error: ${method} ${url} status=${response.status} code=${err.code} message="${err.message ?? ''}"\n  request.body: ${bodyPreview}\n  response.body: ${respPreview}`,
      );
      throw new FincodeAuthorizationError(`fincode ${method} ${path} failed (${err.code})`, {
        errorCode: err.code,
        errorMessage: err.message,
      });
    }
    return parsed as T;
  }
}
