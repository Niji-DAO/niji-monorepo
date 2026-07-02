/**
 * GMO PGマルチペイメント API client (Issue #3006 Phase A)
 *
 * GMO 公式仕様 —
 * - Content-Type = application/x-www-form-urlencoded (request / response 双方)
 * - error は HTTP 200 で ErrCode / ErrInfo を form-encoded body に載せて返す
 * - 成功時は AccessID / AccessPass 等を form-encoded body に載せて返す
 *
 * env 切替 —
 * - `USE_GMO_MOCK=true` (default) → GMO_ENDPOINT (mock server URL) を叩く
 * - `USE_GMO_MOCK=false` → GMO_PROD_ENDPOINT (実 GMO PG API URL) を叩く
 *
 * SSOT — tests/spec/gmo-fiat-bid/Phase1-01-master-spec.md § P2, P6、
 *        Phase1-02-issue-breakdown.md § Issue 3
 */

import type {
  AlterTranRequest,
  AlterTranSuccess,
  AuthorizationResult,
  EntryTranRequest,
  EntryTranSuccess,
  ExecTranRequest,
  ExecTranSuccess,
  GmoErrorResponse,
  SecureTran2Request,
  SecureTran2Success,
} from './types.js';

/** DI 用の fetch signature (test で mock 差替可能) */
export type FetchLike = typeof globalThis.fetch;

export type GmoClientOptions = {
  /**
   * GMO PG API base URL (default = env `GMO_ENDPOINT` or `http://127.0.0.1:2426`)
   * USE_GMO_MOCK=false 時は `GMO_PROD_ENDPOINT` を優先する
   */
  endpoint?: string;
  /** 加盟店 ID (default = env `GMO_SHOP_ID`) */
  shopId?: string;
  /** 加盟店 password (default = env `GMO_SHOP_PASS`) */
  shopPass?: string;
  /** request timeout (ms、 default = env `GMO_REQUEST_TIMEOUT_MS` or 30000) */
  timeoutMs?: number;
  /** fetch 実装差替 (test 用、 default = globalThis.fetch) */
  fetch?: FetchLike;
};

/**
 * GMO API 障害 (network fail / HTTP error / ErrCode 返却) を統合した error
 * authorize handler は本 error を catch して 5xx GmoAuthorizationFailed に変換する
 */
export class GmoAuthorizationError extends Error {
  public readonly errCode?: string;
  public readonly errInfo?: string;
  constructor(
    message: string,
    options: { errCode?: string; errInfo?: string; cause?: unknown } = {},
  ) {
    super(message);
    this.name = 'GmoAuthorizationError';
    if (options.errCode !== undefined) {
      this.errCode = options.errCode;
    }
    if (options.errInfo !== undefined) {
      this.errInfo = options.errInfo;
    }
    if (options.cause !== undefined) {
      (this as { cause?: unknown }).cause = options.cause;
    }
  }
}

/**
 * env / options から endpoint を決定
 * USE_GMO_MOCK truthy → GMO_ENDPOINT、 それ以外は GMO_PROD_ENDPOINT
 */
const resolveEndpoint = (option: string | undefined): string => {
  if (option !== undefined && option.trim() !== '') {
    return option;
  }
  const useMock = (process.env['USE_GMO_MOCK'] ?? 'true').trim().toLowerCase();
  const isMock = useMock === 'true' || useMock === '1' || useMock === 'yes';
  if (isMock) {
    return process.env['GMO_ENDPOINT'] ?? 'http://127.0.0.1:2426';
  }
  return process.env['GMO_PROD_ENDPOINT'] ?? 'https://p01.mul-pay.jp/payment';
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

/** form-encoded body を Record にパース */
const parseFormBody = (body: string): Record<string, string> => {
  const params = new URLSearchParams(body);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
};

/** GMO error 応答判定 (ErrCode field を持つ or AccessID/ACS 等の成功 field が欠損) */
const asGmoError = (parsed: Record<string, string>): GmoErrorResponse | undefined => {
  const errCode = parsed['ErrCode'];
  if (errCode !== undefined && errCode !== '') {
    return { errCode, errInfo: parsed['ErrInfo'] ?? '' };
  }
  return undefined;
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

export class GmoClient {
  private readonly endpoint: string;
  private readonly shopId: string;
  private readonly shopPass: string;
  private readonly timeoutMs: number;
  private readonly fetchImpl: FetchLike;

  constructor(options: GmoClientOptions = {}) {
    this.endpoint = resolveEndpoint(options.endpoint);
    this.shopId = readStringConfig(options.shopId, 'GMO_SHOP_ID', 'tshop00000001');
    this.shopPass = readStringConfig(options.shopPass, 'GMO_SHOP_PASS', 'test_pass');
    this.timeoutMs = readNumberConfig(options.timeoutMs, 'GMO_REQUEST_TIMEOUT_MS', 30000);
    this.fetchImpl = options.fetch ?? globalThis.fetch;
  }

  /**
   * POST /entryTran — 取引登録 (accessId / accessPass 発行)
   * amount 上限 100 万円 check は本 client では実施しない (handler 層で先行 check + GMO 側でも E01 応答)
   */
  async entryTran(req: EntryTranRequest): Promise<EntryTranSuccess> {
    const body = new URLSearchParams({
      ShopID: req.shopId,
      ShopPass: req.shopPass,
      OrderID: req.orderId,
      JobCd: req.jobCd,
      Amount: String(req.amount),
    }).toString();

    const parsed = await this.post('/entryTran', body);
    const err = asGmoError(parsed);
    if (err !== undefined) {
      throw new GmoAuthorizationError(`GMO entryTran failed (${err.errCode})`, {
        errCode: err.errCode,
        errInfo: err.errInfo,
      });
    }
    const accessId = parsed['AccessID'];
    const accessPass = parsed['AccessPass'];
    if (accessId === undefined || accessPass === undefined) {
      throw new GmoAuthorizationError('GMO entryTran missing AccessID/AccessPass');
    }
    return { accessId, accessPass };
  }

  /**
   * POST /execTran — 決済実行 (与信枠 authorization + 3DS 2.0 redirect URL 発行)
   * cardToken は GMO PG Token 方式で受渡す (webapp が GMO に直接 POST して受領した token)
   * mock 側 gmo-server.ts は CardNo param を見るため、 実 client は CardNo に token を載せる
   */
  async execTran(req: ExecTranRequest): Promise<ExecTranSuccess> {
    const params: Record<string, string> = {
      AccessID: req.accessId,
      AccessPass: req.accessPass,
      OrderID: req.orderId,
      // GMO PG Token 方式では Token param を送るのが正式、 mock との整合のため CardNo 併記
      Token: req.cardToken,
      CardNo: req.cardToken,
      Method: '1',
    };
    if (req.tds2RetUrl !== undefined) {
      params['Tds2RetUrl'] = req.tds2RetUrl;
    }
    const body = new URLSearchParams(params).toString();

    const parsed = await this.post('/execTran', body);
    const err = asGmoError(parsed);
    if (err !== undefined) {
      throw new GmoAuthorizationError(`GMO execTran failed (${err.errCode})`, {
        errCode: err.errCode,
        errInfo: err.errInfo,
      });
    }
    const acs = parsed['ACS'];
    const acsUrl = parsed['ACSUrl'];
    const orderId = parsed['OrderID'];
    const accessId = parsed['AccessID'];
    const approve = parsed['Approve'];
    const tranId = parsed['TranID'];
    const tranDate = parsed['TranDate'];
    if (
      acs === undefined ||
      acsUrl === undefined ||
      orderId === undefined ||
      accessId === undefined ||
      approve === undefined ||
      tranId === undefined ||
      tranDate === undefined
    ) {
      throw new GmoAuthorizationError('GMO execTran missing required fields');
    }
    return { acs, acsUrl, orderId, accessId, approve, tranId, tranDate };
  }

  /**
   * entryTran → execTran を順次呼出、 authorize handler が使う統合 method
   * どちらか fail 時に GmoAuthorizationError を throw (handler で 5xx 変換)
   */
  async authorize(input: {
    orderId: string;
    amount: number;
    cardToken: string;
    tds2RetUrl?: string;
  }): Promise<AuthorizationResult> {
    const entry = await this.entryTran({
      shopId: this.shopId,
      shopPass: this.shopPass,
      orderId: input.orderId,
      jobCd: 'AUTH',
      amount: input.amount,
    });

    const execReq: ExecTranRequest = {
      accessId: entry.accessId,
      accessPass: entry.accessPass,
      orderId: input.orderId,
      cardToken: input.cardToken,
    };
    if (input.tds2RetUrl !== undefined) {
      execReq.tds2RetUrl = input.tds2RetUrl;
    }
    const exec = await this.execTran(execReq);

    return {
      authId: entry.accessId,
      accessPass: entry.accessPass,
      tds2Url: exec.acsUrl,
      orderId: exec.orderId,
      approve: exec.approve,
      tranId: exec.tranId,
    };
  }

  /**
   * POST /secureTran2 — 3DS 2.0 認証結果 verify (Issue #3007)
   * 3DS 認証完了後の callback で GMO 側 authorization 状態を verify する。
   * TranResult=0 が返れば認証成功、 それ以外は fail (chargeback 対策 SSOT)。
   * mock server は callback endpoint 経由で state.transactions を verify する。
   */
  async verifyTds2(req: SecureTran2Request): Promise<SecureTran2Success> {
    const body = new URLSearchParams({
      AccessID: req.accessId,
      AccessPass: req.accessPass,
      TransactionId: req.transactionId,
    }).toString();

    const parsed = await this.post('/secureTran2', body);
    const err = asGmoError(parsed);
    if (err !== undefined) {
      throw new GmoAuthorizationError(`GMO secureTran2 failed (${err.errCode})`, {
        errCode: err.errCode,
        errInfo: err.errInfo,
      });
    }
    const orderId = parsed['OrderID'];
    const accessId = parsed['AccessID'];
    const tranResult = parsed['TranResult'];
    if (orderId === undefined || accessId === undefined || tranResult === undefined) {
      throw new GmoAuthorizationError('GMO secureTran2 missing required fields');
    }
    return { orderId, accessId, tranResult };
  }

  /**
   * POST /alterTran — 決済変更 (Issue #3007 = VOID cancel、 Issue #3010 = SALES capture で共用)
   * 3DS 認証 fail 時に与信枠 (authorization hold) を解除する必要がある (加盟店契約要件、 chargeback 予防)。
   * JobCd = VOID で amount 不要、 GMO 仕様上 amount 送信可能だが cancel は amount 依存しない。
   */
  async alterTran(req: AlterTranRequest): Promise<AlterTranSuccess> {
    const params: Record<string, string> = {
      ShopID: req.shopId,
      ShopPass: req.shopPass,
      AccessID: req.accessId,
      AccessPass: req.accessPass,
      JobCd: req.jobCd,
    };
    if (req.amount !== undefined) {
      params['Amount'] = String(req.amount);
    }
    const body = new URLSearchParams(params).toString();

    const parsed = await this.post('/alterTran', body);
    const err = asGmoError(parsed);
    if (err !== undefined) {
      throw new GmoAuthorizationError(`GMO alterTran failed (${err.errCode})`, {
        errCode: err.errCode,
        errInfo: err.errInfo,
      });
    }
    const accessId = parsed['AccessID'];
    const accessPass = parsed['AccessPass'];
    const status = parsed['Status'];
    if (accessId === undefined || accessPass === undefined || status === undefined) {
      throw new GmoAuthorizationError('GMO alterTran missing required fields');
    }
    return { accessId, accessPass, status };
  }

  /**
   * 与信枠 cancel の統合 method (3DS fail / timeout 時に呼出)
   * alterTran(JobCd=VOID) 呼出 + shopId/shopPass 自動注入
   * handler 層は本 method を呼ぶだけで cancel 完了、 amount 引数不要
   */
  async cancelAuthorization(input: {
    accessId: string;
    accessPass: string;
  }): Promise<AlterTranSuccess> {
    return this.alterTran({
      shopId: this.shopId,
      shopPass: this.shopPass,
      accessId: input.accessId,
      accessPass: input.accessPass,
      jobCd: 'VOID',
    });
  }

  /**
   * 与信枠 再 authorize (Issue #3024 = 45 日超 fallback で ReauthorizationWorker が発火)
   *
   * 処理順 —
   * (1) 旧 authorization を alterTran(JobCd=VOID) で cancel (60 日 hold 期限リセット + 二重 hold 防止)
   * (2) entryTran で新 accessId / accessPass 発行 (JobCd=AUTH、 jpyAmount 再指定)
   * (3) execTran で 3DS 2.0 認証 URL 発行 (cardToken は redirect 不要 = server side 再 authorize、
   *     mock server は CardNo 経由で state.transactions に record)
   *
   * 3DS 2.0 認証は 45 日超 fallback では skip し、 サーバ間 auth のみで再 hold を確立する。
   * 実 GMO では issuer によって Frictionless で通過 / Challenge 要求のケースがあり、
   * Challenge 要求時は本 flow では未対応 (Phase 4 で bidder 再認証経路検討、
   * 現状は Frictionless 前提 + fail 側で cancel + 通知経路にまわす)。
   *
   * SSOT — tests/spec/gmo-fiat-bid/Phase2-01-master-spec.md § 45 日超 fallback、
   *        Phase2-02-issue-breakdown.md § Issue P2-3
   */
  async reauthorize(input: {
    oldAccessId: string;
    oldAccessPass: string;
    newOrderId: string;
    jpyAmount: number;
    cardToken: string;
  }): Promise<AuthorizationResult> {
    // Step 1 = 旧 auth を VOID cancel、 fail 時はそのまま throw (worker が cancel + alert 処理)
    await this.cancelAuthorization({
      accessId: input.oldAccessId,
      accessPass: input.oldAccessPass,
    });

    // Step 2 = 新 entryTran で新 accessId / accessPass 発行
    const entry = await this.entryTran({
      shopId: this.shopId,
      shopPass: this.shopPass,
      orderId: input.newOrderId,
      jobCd: 'AUTH',
      amount: input.jpyAmount,
    });

    // Step 3 = 新 execTran で 3DS URL 発行 (Frictionless 想定で auth 確立、 tds2RetUrl 省略)
    const exec = await this.execTran({
      accessId: entry.accessId,
      accessPass: entry.accessPass,
      orderId: input.newOrderId,
      cardToken: input.cardToken,
    });

    return {
      authId: entry.accessId,
      accessPass: entry.accessPass,
      tds2Url: exec.acsUrl,
      orderId: exec.orderId,
      approve: exec.approve,
      tranId: exec.tranId,
    };
  }

  private async post(path: string, body: string): Promise<Record<string, string>> {
    const url = `${this.endpoint.replace(/\/$/, '')}${path}`;
    let response: Response;
    try {
      response = await fetchWithTimeout(
        this.fetchImpl,
        url,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body,
        },
        this.timeoutMs,
      );
    } catch (err) {
      throw new GmoAuthorizationError(`GMO POST ${path} network error`, { cause: err });
    }
    if (!response.ok) {
      throw new GmoAuthorizationError(`GMO POST ${path} HTTP ${response.status}`);
    }
    const text = await response.text();
    return parseFormBody(text);
  }
}
