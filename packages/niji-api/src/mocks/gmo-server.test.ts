/**
 * GMO mock server behavior test
 *
 * 目的 —
 * (1) mock server が GMO PG endpoint 3 本 (/entryTran / /execTran / /alterTran) で 200 応答を返す (完了条件 1)
 * (2) form-encoded response 形式が GMO 公式仕様に準拠する
 * (3) fail 経路 mock (bid 上限超 / 与信枠不足) が期待通り ErrCode 応答を返す
 *
 * 本 test は fetch (Node v24 built-in、 内部 undici) 経由で mock server を実 execute する。
 * rules/quality.md § test-passed marker 発行前提 3 条件を満たす behavior test。
 */

import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import {
  buildGmoFormResponse,
  buildMock3dsHtml,
  gmoMockBaseUrl,
  gmoMockServer,
  resetGmoMockState,
  seedGmoMockTds2Result,
} from './gmo-server.js';

/** GMO 応答の form-encoded 文字列を Record にパースする helper */
const parseGmoFormResponse = (body: string): Record<string, string> => {
  const params = new URLSearchParams(body);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
};

beforeAll(() => {
  gmoMockServer.listen({ onUnhandledRequest: 'error' });
});

afterAll(() => {
  gmoMockServer.close();
});

beforeEach(() => {
  resetGmoMockState();
});

afterEach(() => {
  gmoMockServer.resetHandlers();
});

describe('buildGmoFormResponse', () => {
  it('key=value を & で連結した form-encoded 文字列を返す', () => {
    const result = buildGmoFormResponse({ AccessID: 'abc', AccessPass: 'xyz' });
    expect(result).toBe('AccessID=abc&AccessPass=xyz');
  });

  it('空 object の場合は空文字列を返す', () => {
    expect(buildGmoFormResponse({})).toBe('');
  });
});

describe('gmoMockBaseUrl', () => {
  it('env GMO_ENDPOINT 未設定時は default http://127.0.0.1:2426 を返す', () => {
    const original = process.env['GMO_ENDPOINT'];
    delete process.env['GMO_ENDPOINT'];
    expect(gmoMockBaseUrl()).toBe('http://127.0.0.1:2426');
    if (original !== undefined) {
      process.env['GMO_ENDPOINT'] = original;
    }
  });

  it('env GMO_ENDPOINT 設定時はその値を返す', () => {
    const original = process.env['GMO_ENDPOINT'];
    process.env['GMO_ENDPOINT'] = 'https://p01.mul-pay.jp';
    expect(gmoMockBaseUrl()).toBe('https://p01.mul-pay.jp');
    if (original === undefined) {
      delete process.env['GMO_ENDPOINT'];
    } else {
      process.env['GMO_ENDPOINT'] = original;
    }
  });
});

describe('POST /entryTran (取引登録) mock', () => {
  it('200 応答で AccessID / AccessPass を返す', async () => {
    const response = await fetch(`${gmoMockBaseUrl()}/entryTran`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        ShopID: 'tshop00000001',
        ShopPass: 'test_pass',
        OrderID: 'order-001',
        JobCd: 'AUTH',
        Amount: '100000', // 10 万円 (bid 上限 100 万円未満)
      }).toString(),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('application/x-www-form-urlencoded');

    const parsed = parseGmoFormResponse(await response.text());
    expect(parsed['AccessID']).toMatch(/^mock-access-\d{8}$/);
    expect(parsed['AccessPass']).toMatch(/^mock-pass-\d{8}$/);
  });

  it('bid 上限 100 万円超で ErrCode=E01 応答を返す (backend 側 2 層強制)', async () => {
    const response = await fetch(`${gmoMockBaseUrl()}/entryTran`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        ShopID: 'tshop00000001',
        ShopPass: 'test_pass',
        OrderID: 'order-002',
        JobCd: 'AUTH',
        Amount: '1000001', // 100 万円 + 1
      }).toString(),
    });

    expect(response.status).toBe(200); // GMO は HTTP は 200 で ErrCode で異常伝達
    const parsed = parseGmoFormResponse(await response.text());
    expect(parsed['ErrCode']).toBe('E01');
    expect(parsed['ErrInfo']).toBe('E01190002');
    expect(parsed['AccessID']).toBeUndefined();
  });

  it('決定的 mock ID = 呼出順で counter incremental になる', async () => {
    const first = await fetch(`${gmoMockBaseUrl()}/entryTran`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ OrderID: 'a', Amount: '1000' }).toString(),
    });
    const firstParsed = parseGmoFormResponse(await first.text());

    const second = await fetch(`${gmoMockBaseUrl()}/entryTran`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ OrderID: 'b', Amount: '1000' }).toString(),
    });
    const secondParsed = parseGmoFormResponse(await second.text());

    expect(firstParsed['AccessID']).toBe('mock-access-00000001');
    // Issue #3007 = entryTran は access + pass + tds2-tran の 3 counter を消費、
    // 次の呼出の AccessID = 4 番目 (旧 test は 2 counter 前提だった、 3DS state pre-populate 分の差)
    expect(secondParsed['AccessID']).toBe('mock-access-00000004');
  });
});

describe('POST /execTran (決済実行) mock', () => {
  it('200 応答で ACS=1 (3DS 必要) + ACSUrl を返す', async () => {
    const response = await fetch(`${gmoMockBaseUrl()}/execTran`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        AccessID: 'mock-access-00000001',
        AccessPass: 'mock-pass-00000002',
        OrderID: 'order-001',
        CardNo: '4111111111111111', // 正常 card (Visa test)
        Expire: '2812',
        SecurityCode: '123',
      }).toString(),
    });

    expect(response.status).toBe(200);
    const parsed = parseGmoFormResponse(await response.text());
    expect(parsed['ACS']).toBe('1');
    // Issue #3007 = 3DS full redirect URL は /mock-3ds に変更、 orderId / accessId / transactionId / returnUrl を含む
    expect(parsed['ACSUrl']).toContain('/mock-3ds');
    expect(parsed['ACSUrl']).toContain('orderId=order-001');
    // accessId は request の AccessID (mock-access-00000001) が query 側に付く
    expect(parsed['ACSUrl']).toContain('accessId=mock-access-00000001');
    expect(parsed['ACSUrl']).toContain('transactionId=');
    expect(parsed['ACSUrl']).toContain('returnUrl=');
    expect(parsed['OrderID']).toBe('order-001');
    expect(parsed['Approve']).toMatch(/^mock-approve-\d{8}$/);
    expect(parsed['TranID']).toMatch(/^mock-tran-\d{8}$/);
    // TranDate = yyyyMMddHHmmss 14 桁 (GMO 仕様)
    expect(parsed['TranDate']).toMatch(/^\d{14}$/);
  });

  it('CardNo=4000000000000002 で与信枠不足 ErrCode=G02 応答を返す (fail 経路 mock)', async () => {
    const response = await fetch(`${gmoMockBaseUrl()}/execTran`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        AccessID: 'mock-access-00000001',
        AccessPass: 'mock-pass-00000002',
        OrderID: 'order-001',
        CardNo: '4000000000000002', // fail card
        Expire: '2812',
        SecurityCode: '123',
      }).toString(),
    });

    expect(response.status).toBe(200);
    const parsed = parseGmoFormResponse(await response.text());
    expect(parsed['ErrCode']).toBe('G02');
    expect(parsed['ErrInfo']).toBe('G02180001');
    expect(parsed['ACS']).toBeUndefined();
  });
});

describe('POST /alterTran (決済変更) mock', () => {
  it('JobCd=SALES で capture 成功応答 Status=SALES を返す', async () => {
    const response = await fetch(`${gmoMockBaseUrl()}/alterTran`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        ShopID: 'tshop00000001',
        ShopPass: 'test_pass',
        AccessID: 'mock-access-00000001',
        AccessPass: 'mock-pass-00000002',
        JobCd: 'SALES',
        Amount: '100000',
      }).toString(),
    });

    expect(response.status).toBe(200);
    const parsed = parseGmoFormResponse(await response.text());
    expect(parsed['Status']).toBe('SALES');
    expect(parsed['Amount']).toBe('100000');
    expect(parsed['AccessID']).toBe('mock-access-00000001');
  });

  it('JobCd=VOID で取消応答 Status=VOID を返す', async () => {
    const response = await fetch(`${gmoMockBaseUrl()}/alterTran`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        ShopID: 'tshop00000001',
        ShopPass: 'test_pass',
        AccessID: 'mock-access-00000001',
        AccessPass: 'mock-pass-00000002',
        JobCd: 'VOID',
        Amount: '100000',
      }).toString(),
    });

    expect(response.status).toBe(200);
    const parsed = parseGmoFormResponse(await response.text());
    expect(parsed['Status']).toBe('VOID');
  });
});

describe('buildMock3dsHtml (Issue #3007)', () => {
  it('orderId / accessId / transactionId を含む HTML と success/fail link を返す', () => {
    const html = buildMock3dsHtml({
      orderId: 'order-9',
      accessId: 'acc-9',
      transactionId: 'tds2-tran-9',
      returnUrl: 'http://127.0.0.1:2424/fiat-bid/3ds-return',
    });
    expect(html).toContain('order-9');
    expect(html).toContain('tds2-tran-9');
    expect(html).toContain('id="mock-3ds-success"');
    expect(html).toContain('id="mock-3ds-fail"');
    expect(html).toContain('result=success');
    expect(html).toContain('result=fail');
    expect(html).toContain('/fiat-bid/3ds-return');
  });
});

describe('GET /mock-3ds (Issue #3007)', () => {
  it('query 経由で orderId / accessId / transactionId を受け text/html 応答を返す', async () => {
    const url = new URL(`${gmoMockBaseUrl()}/mock-3ds`);
    url.searchParams.set('orderId', 'order-42');
    url.searchParams.set('accessId', 'acc-42');
    url.searchParams.set('transactionId', 'tds2-tran-42');
    url.searchParams.set('returnUrl', 'http://127.0.0.1:2424/fiat-bid/3ds-return');
    const response = await fetch(url.toString());
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('text/html');
    const html = await response.text();
    expect(html).toContain('order-42');
    expect(html).toContain('tds2-tran-42');
    expect(html).toContain('id="mock-3ds-success"');
    expect(html).toContain('id="mock-3ds-fail"');
  });
});

describe('POST /secureTran2 (Issue #3007)', () => {
  it('tds2Result=success で seed した state を verify、 TranResult=0 応答を返す', async () => {
    seedGmoMockTds2Result({
      orderId: 'order-99',
      accessId: 'acc-99',
      accessPass: 'pass-99',
      transactionId: 'tds2-tran-99',
      tds2Result: 'success',
    });
    const response = await fetch(`${gmoMockBaseUrl()}/secureTran2`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        AccessID: 'acc-99',
        AccessPass: 'pass-99',
        TransactionId: 'tds2-tran-99',
      }).toString(),
    });
    expect(response.status).toBe(200);
    const parsed = parseGmoFormResponse(await response.text());
    expect(parsed['TranResult']).toBe('0');
    expect(parsed['OrderID']).toBe('order-99');
    expect(parsed['AccessID']).toBe('acc-99');
  });

  it('tds2Result=fail で seed した state を verify、 ErrCode=T01 応答を返す', async () => {
    seedGmoMockTds2Result({
      orderId: 'order-100',
      accessId: 'acc-100',
      accessPass: 'pass-100',
      transactionId: 'tds2-tran-100',
      tds2Result: 'fail',
    });
    const response = await fetch(`${gmoMockBaseUrl()}/secureTran2`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        AccessID: 'acc-100',
        AccessPass: 'pass-100',
        TransactionId: 'tds2-tran-100',
      }).toString(),
    });
    expect(response.status).toBe(200);
    const parsed = parseGmoFormResponse(await response.text());
    expect(parsed['ErrCode']).toBe('T01');
  });

  it('該当 record 無しで ErrCode=G03 応答を返す', async () => {
    const response = await fetch(`${gmoMockBaseUrl()}/secureTran2`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        AccessID: 'nonexistent',
        AccessPass: 'nonexistent',
        TransactionId: 'nonexistent',
      }).toString(),
    });
    expect(response.status).toBe(200);
    const parsed = parseGmoFormResponse(await response.text());
    expect(parsed['ErrCode']).toBe('G03');
  });
});

describe('resetGmoMockState', () => {
  it('counter reset で次の /entryTran 呼出が mock-access-00000001 から始まる', async () => {
    await fetch(`${gmoMockBaseUrl()}/entryTran`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ OrderID: 'x', Amount: '1000' }).toString(),
    });

    resetGmoMockState();

    const response = await fetch(`${gmoMockBaseUrl()}/entryTran`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ OrderID: 'y', Amount: '1000' }).toString(),
    });
    const parsed = parseGmoFormResponse(await response.text());
    expect(parsed['AccessID']).toBe('mock-access-00000001');
  });
});
