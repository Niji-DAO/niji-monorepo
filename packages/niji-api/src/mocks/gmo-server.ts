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
  return Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
};

/**
 * GMO 決済 mock state (テスト間で共有される in-memory store)
 * 実 API との差異 = auth ID の永続化は Ponder DB (fiat_bid schema、 Issue 3 で追加) が担う、
 * mock は request 単位で成功応答を返すだけの最小実装。
 */
type MockGmoState = {
  transactions: Map<
    string,
    { accessId: string; accessPass: string; status: 'authenticated' | 'captured' | 'canceled' }
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
 * MSW handler 3 本 (entryTran / execTran / alterTran)
 * 各 handler は form-encoded body を parse、 mock state を update、 form-encoded response を返す。
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
    state.transactions.set(orderId, { accessId, accessPass, status: 'authenticated' });

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

    return new HttpResponse(
      buildGmoFormResponse({
        ACS: '1', // 3DS 必要
        OrderID: params.get('OrderID') ?? '',
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
        // 3DS 2.0 full redirect URL (mock = webapp 側 callback を叩く dummy URL)
        ACSUrl: `${gmoMockBaseUrl()}/mock-3ds-callback?orderId=${params.get('OrderID') ?? ''}`,
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
