/**
 * GMO PGマルチペイメント mock server (Phase 1 MVP)
 *
 * MSW の setupServer で GMO PG API endpoint 3 本を intercept する。
 * `USE_GMO_MOCK=true` (default) の場合に `pnpm dev` 起動時 conditional に start される。
 *
 * 実装対象 endpoint (GMO PGマルチペイメント公式 SDK ドキュメント準拠) —
 *  - POST /entryTran  ... 取引登録 (取引 ID + アクセス ID + パス発行)
 *  - POST /execTran   ... 決済実行 (与信枠 authorization、 3DS redirect URL 返却)
 *  - POST /alterTran  ... 決済取消 / 売上確定 / 返金 (capture / cancel / refund)
 *
 * response 仕様 (application/x-www-form-urlencoded + KEY=VALUE&KEY=VALUE 形式) は
 * GMO PG 公式仕様に準拠、 実 API 応答を再現する。 詳細は docs/operations/gmo-fiat-bid.md 参照。
 */

import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

/**
 * GMO 応答形式 = form-encoded (Content-Type: application/x-www-form-urlencoded)
 * key=value を & で連結、 空値は key= の形式
 */
export const buildGmoFormResponse = (params: Record<string, string>): string => {
  // GMO 応答は URL-encode 済 value を返す (form-encoded 標準)、 value 内の &/=/? は client 側 URLSearchParams で parse 可能に
  return Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
};

/**
 * mock 3DS 認証結果 flag (Issue #3007)
 * mock 3DS 画面での success / fail button 押下を state.transactions.tds2Result に記録。
 * secureTran2 handler が本 flag を verify して TranResult を組立てる。
 */
type Tds2Result = 'success' | 'fail' | 'pending';

/**
 * GMO 決済 mock state (テスト間で共有される in-memory store)
 * 実 API との差異 = auth ID の永続化は Ponder DB (fiat_bid schema、 Issue 3 で追加) が担う、
 * mock は request 単位で成功応答を返すだけの最小実装。
 */
type MockGmoState = {
  transactions: Map<
    string,
    {
      accessId: string;
      accessPass: string;
      status: 'authenticated' | 'captured' | 'canceled';
      /** Issue #3007 = 3DS mock 画面 button 選択結果、 secureTran2 handler で verify */
      tds2Result: Tds2Result;
      /** Issue #3007 = mock 3DS flow で採用する transactionId */
      transactionId: string;
    }
  >;
};

const createMockState = (): MockGmoState => ({
  transactions: new Map(),
});

const state = createMockState();

/**
 * 決定的 mock ID 生成器 (テスト再現性のため counter ベース、 crypto.randomUUID の非決定性を避ける)
 * 実 GMO は 32 桁 hex を返す、 mock は "mock-" prefix + counter で十分。
 */
let idCounter = 0;
const nextMockId = (prefix: string): string => {
  idCounter += 1;
  return `${prefix}${String(idCounter).padStart(8, '0')}`;
};

/**
 * GMO mock server の URL 前提 = env `GMO_ENDPOINT` (default `http://127.0.0.1:2426`)
 * MSW は wildcard host にも match するので wildcard path (asterisk-slash entryTran) 等でも intercept 可能だが、
 * 明示的に base URL を config から取ることで prod 切替時の port 衝突を回避する。
 */
export const gmoMockBaseUrl = (): string => {
  return process.env['GMO_ENDPOINT'] ?? 'http://127.0.0.1:2426';
};

/**
 * mock 3DS 画面 HTML template (Issue #3007)
 * 実 GMO は card issuer 提供 iframe / redirect ページを返すが、
 * mock では success / fail button (link) を持つ static HTML を返す。
 * link click で webapp の return page (/fiat-bid/3ds-return) に URL query 付き遷移し、
 * return page が backend の /api/v1/fiat-bid/3ds-callback を叩いて完了する。
 */
export const buildMock3dsHtml = (params: {
  orderId: string;
  accessId: string;
  returnUrl: string;
  transactionId: string;
}): string => {
  const { orderId, accessId, returnUrl, transactionId } = params;
  const successHref = `${returnUrl}?transactionId=${encodeURIComponent(transactionId)}&result=success&accessId=${encodeURIComponent(accessId)}&orderId=${encodeURIComponent(orderId)}`;
  const failHref = `${returnUrl}?transactionId=${encodeURIComponent(transactionId)}&result=fail&accessId=${encodeURIComponent(accessId)}&orderId=${encodeURIComponent(orderId)}`;
  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8" />
<title>Mock 3DS 2.0 Challenge</title>
</head>
<body>
<h1>Mock 3D セキュア 2.0 認証</h1>
<p>orderId ${orderId}</p>
<p>transactionId ${transactionId}</p>
<p><a id="mock-3ds-success" href="${successHref}">認証成功 (mock)</a></p>
<p><a id="mock-3ds-fail" href="${failHref}">認証失敗 (mock)</a></p>
</body>
</html>`;
};

/**
 * MSW handler 5 本 (entryTran / execTran / secureTran2 / alterTran / mock-3ds 画面 GET)
 * 各 handler は form-encoded body を parse、 mock state を update、 form-encoded response を返す。
 * mock-3ds 画面のみ HTML 応答 (webapp からの full redirect 先)。
 */
export const gmoHandlers = [
  /**
   * POST /entryTran — 取引登録
   * 必須 param = ShopID / ShopPass / OrderID / JobCd / Amount
   * 応答 = AccessID / AccessPass (32 桁 hex mock)
   */
  http.post(`${gmoMockBaseUrl()}/entryTran`, async ({ request }) => {
    const body = await request.text();
    const params = new URLSearchParams(body);
    const orderId = params.get('OrderID') ?? 'unknown';
    const amount = params.get('Amount') ?? '0';

    // bid 上限 100 万円 check (webapp + backend 2 層強制の backend 側、 Phase 1 SSOT)
    // 単位 = 円 (Amount param は円単位、 GMO 仕様)
    if (Number.parseInt(amount, 10) > 1_000_000) {
      return new HttpResponse(
        buildGmoFormResponse({
          ErrCode: 'E01',
          ErrInfo: 'E01190002', // 取引金額の上限を超過
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );
    }

    const accessId = nextMockId('mock-access-');
    const accessPass = nextMockId('mock-pass-');
    // Issue #3007 = tds2Result:pending + transactionId を pre-populate、
    // secureTran2 handler が本 record を lookup して verify する
    const transactionId = nextMockId('mock-tds2-tran-');
    state.transactions.set(orderId, {
      accessId,
      accessPass,
      status: 'authenticated',
      tds2Result: 'pending',
      transactionId,
    });

    return new HttpResponse(
      buildGmoFormResponse({
        AccessID: accessId,
        AccessPass: accessPass,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
    );
  }),

  /**
   * POST /execTran — 決済実行 (与信枠 authorization + 3DS redirect URL)
   * 必須 param = AccessID / AccessPass / OrderID / CardNo / Expire / SecurityCode 等
   * 応答 = ACS (3DS redirect flag) / ACSUrl (3DS 認証 URL、 mock 用の dummy URL)
   */
  http.post(`${gmoMockBaseUrl()}/execTran`, async ({ request }) => {
    const body = await request.text();
    const params = new URLSearchParams(body);
    const accessId = params.get('AccessID') ?? '';
    const cardNo = params.get('CardNo') ?? '';

    // fail 経路 mock = テスト用に特定 CardNo で fail 応答 (AC 3 対応、 Issue 3 で活用)
    if (cardNo === '4000000000000002') {
      return new HttpResponse(
        buildGmoFormResponse({
          ErrCode: 'G02',
          ErrInfo: 'G02180001', // 与信枠不足
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );
    }

    // Issue #3007 = mock 3DS 画面に webapp return URL を含めた query 付き URL を提供、
    // full redirect した webapp が mock 画面 → success/fail link → webapp return page で受け取る flow
    const orderId = params.get('OrderID') ?? '';
    const accessPass = params.get('AccessPass') ?? '';
    // execTran が entryTran 経由で state entry を持たない test 場合、 accessId で lookup + fall back で新規 entry
    const existing = state.transactions.get(orderId);
    const transactionId = existing?.transactionId ?? nextMockId('mock-tds2-tran-');
    // 3DS state を record、 secureTran2 が accessId + transactionId で lookup 可能に
    state.transactions.set(orderId, {
      accessId,
      accessPass,
      status: existing?.status ?? 'authenticated',
      tds2Result: existing?.tds2Result ?? 'pending',
      transactionId,
    });
    // webapp 側 return URL (webapp が config で持つ base URL からの相対、 default は request Origin 使う想定)
    // mock では default localhost webapp を assume、 実 GMO 場合は execTran の Tds2RetUrl param 経由
    const tds2RetUrl = params.get('Tds2RetUrl') ?? 'http://127.0.0.1:2424/fiat-bid/3ds-return';
    const acsUrl = `${gmoMockBaseUrl()}/mock-3ds?orderId=${encodeURIComponent(orderId)}&accessId=${encodeURIComponent(accessId)}&transactionId=${encodeURIComponent(transactionId)}&returnUrl=${encodeURIComponent(tds2RetUrl)}`;
    return new HttpResponse(
      buildGmoFormResponse({
        ACS: '1', // 3DS 必要
        OrderID: orderId,
        AccessID: accessId,
        Forward: 'mock-forward-code',
        Method: '1',
        PayTimes: '',
        Approve: nextMockId('mock-approve-'),
        TranID: nextMockId('mock-tran-'),
        TranDate: new Date()
          .toISOString()
          .replace(/[.:TZ-]/g, '')
          .slice(0, 14),
        CheckString: 'mock-check-string',
        ClientField1: '',
        ClientField2: '',
        ClientField3: '',
        // 3DS 2.0 full redirect URL (mock 3DS 画面 URL、 success/fail button を含む HTML を返す)
        ACSUrl: acsUrl,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
    );
  }),

  /**
   * GET /mock-3ds — mock 3DS 認証画面 (Issue #3007)
   * webapp から full redirect 先として叩かれる、 success/fail link を持つ HTML を返す。
   * query param = orderId / accessId / transactionId / returnUrl (webapp 側 return page URL)
   * link click で webapp return page (/fiat-bid/3ds-return) に遷移、
   * return page が backend の 3ds-callback endpoint を叩いて完了する。
   */
  http.get(`${gmoMockBaseUrl()}/mock-3ds`, ({ request }) => {
    const url = new URL(request.url);
    const orderId = url.searchParams.get('orderId') ?? '';
    const accessId = url.searchParams.get('accessId') ?? '';
    const transactionId = url.searchParams.get('transactionId') ?? '';
    const returnUrl =
      url.searchParams.get('returnUrl') ?? 'http://127.0.0.1:2424/fiat-bid/3ds-return';
    const html = buildMock3dsHtml({ orderId, accessId, returnUrl, transactionId });
    return new HttpResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }),

  /**
   * POST /secureTran2 — 3DS 2.0 認証結果 verify (Issue #3007)
   * backend の 3ds-callback handler が webapp からの callback を受けて呼出す。
   * 実 GMO は 3DS 認証結果 (成功 / fail) を TranResult field で返す (成功 = "0")。
   * mock 実装 = state.transactions[orderId].tds2Result を verify、
   * tds2Result === 'success' で TranResult=0、 それ以外は TranResult ErrCode。
   *
   * webapp mock flow で state.tds2Result は URL query の result=success で更新される必要があるが、
   * 本 mock は callback handler が直接 result を param に含めるので state 経由 verify なしで
   * 応答を組立てる (test では state.tds2Result を直接 seed する経路も提供)。
   *
   * request body = AccessID / AccessPass / TransactionId
   * 応答 body    = OrderID / AccessID / TranResult ("0" = success)、 fail 時は ErrCode/ErrInfo
   */
  http.post(`${gmoMockBaseUrl()}/secureTran2`, async ({ request }) => {
    const body = await request.text();
    const params = new URLSearchParams(body);
    const accessId = params.get('AccessID') ?? '';
    const transactionId = params.get('TransactionId') ?? '';

    // state から accessId で record を lookup (transactionId 一致まで verify)
    const record = Array.from(state.transactions.entries()).find(
      ([, r]) => r.accessId === accessId && r.transactionId === transactionId,
    );
    if (record === undefined) {
      return new HttpResponse(
        buildGmoFormResponse({
          ErrCode: 'G03',
          ErrInfo: 'G03180001', // 該当 auth ID 無し
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );
    }
    const [orderId, tx] = record;
    if (tx.tds2Result === 'fail') {
      return new HttpResponse(
        buildGmoFormResponse({
          ErrCode: 'T01',
          ErrInfo: 'T01180001', // 3DS 認証 fail
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );
    }
    return new HttpResponse(
      buildGmoFormResponse({
        OrderID: orderId,
        AccessID: accessId,
        TranResult: '0', // 認証成功
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
    );
  }),

  /**
   * POST /alterTran — 決済変更 (capture / cancel / refund)
   * 必須 param = ShopID / ShopPass / AccessID / AccessPass / JobCd / Amount
   * JobCd = SALES (売上確定 / capture) / VOID (取消) / RETURN (返金)
   * 応答 = AccessID / AccessPass / Status (SALES / VOID / RETURN)
   */
  http.post(`${gmoMockBaseUrl()}/alterTran`, async ({ request }) => {
    const body = await request.text();
    const params = new URLSearchParams(body);
    const accessId = params.get('AccessID') ?? '';
    const accessPass = params.get('AccessPass') ?? '';
    const jobCd = params.get('JobCd') ?? '';

    // 状態遷移 mock = SALES → captured / VOID → canceled / それ以外 = auth
    const nextStatus = ((): 'captured' | 'canceled' | 'authenticated' => {
      if (jobCd === 'SALES') return 'captured';
      if (jobCd === 'VOID') return 'canceled';
      return 'authenticated';
    })();

    const statusResponse = ((): 'SALES' | 'VOID' | 'AUTH' => {
      if (jobCd === 'SALES') return 'SALES';
      if (jobCd === 'VOID') return 'VOID';
      return 'AUTH';
    })();

    return new HttpResponse(
      buildGmoFormResponse({
        AccessID: accessId,
        AccessPass: accessPass,
        Status: statusResponse,
        Amount: params.get('Amount') ?? '0',
        Tax: '0',
        Forward: 'mock-forward-code',
        Approve: nextMockId('mock-approve-'),
        TranID: nextMockId('mock-tran-'),
        TranDate: new Date()
          .toISOString()
          .replace(/[.:TZ-]/g, '')
          .slice(0, 14),
        CheckString: 'mock-check-string',
        ClientField1: '',
        ClientField2: '',
        ClientField3: '',
        _nextStatusForTest: nextStatus,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
    );
  }),
];

/**
 * MSW node server instance (Ponder dev server から `server.listen()` で start)
 * 呼出経路 = `USE_GMO_MOCK=true` 時のみ、 `packages/niji-api/src/mocks/index.ts` (Issue 2 以降) で起動
 */
export const gmoMockServer = setupServer(...gmoHandlers);

/**
 * 決定的 mock state を test 間で reset するための helper
 * 用途 = vitest beforeEach、 Issue 2 以降の unit test で使用
 */
export const resetGmoMockState = (): void => {
  state.transactions.clear();
  idCounter = 0;
};

/**
 * test 用に mock state に 3DS 結果を seed する helper (Issue #3007)
 * secureTran2 handler の tds2Result 分岐を verify したい場合に
 * beforeEach で success / fail を明示的に seed する。
 */
export const seedGmoMockTds2Result = (params: {
  orderId: string;
  accessId: string;
  accessPass: string;
  transactionId: string;
  tds2Result: 'success' | 'fail' | 'pending';
}): void => {
  state.transactions.set(params.orderId, {
    accessId: params.accessId,
    accessPass: params.accessPass,
    status: 'authenticated',
    tds2Result: params.tds2Result,
    transactionId: params.transactionId,
  });
};
