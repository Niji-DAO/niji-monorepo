/**
 * GmoClient behavior test (Issue #3006 Phase A)
 *
 * 検証対象 —
 * (1) entryTran 成功時に AccessID/AccessPass を parse して返す
 * (2) execTran 成功時に ACS/ACSUrl/OrderID 等を parse して返す
 * (3) GMO error 応答 (ErrCode field 付) 時に GmoAuthorizationError を throw
 * (4) network error 時に GmoAuthorizationError (cause 付) を throw
 * (5) authorize (entryTran + execTran) が順次呼出し AuthorizationResult を返す
 * (6) authorize 中に entryTran fail → execTran 呼ばず即 throw
 *
 * mock server は import せず、 fetch 実装を DI で差替えて GMO 応答 shape を単体検証する。
 * rules/quality.md § test-passed marker 発行前提 3 条件準拠。
 */

import { describe, expect, it, vi } from 'vitest';

import { GmoAuthorizationError, GmoClient } from './client.js';

/**
 * fetch stub を作る helper
 * responses = URL path ごとに form-encoded body を返す map
 */
const resolveUrl = (input: string | URL | Request): string => {
  if (input instanceof URL) return input.toString();
  if (typeof input === 'string') return input;
  return input.url;
};

const makeFetchStub = (responses: Record<string, { status?: number; body: string }>) => {
  return vi.fn(async (input: string | URL | Request) => {
    const url = resolveUrl(input);
    const matched = Object.entries(responses).find(([path]) => url.endsWith(path));
    if (matched === undefined) {
      throw new Error(`fetch stub: unmatched URL ${url}`);
    }
    const [, res] = matched;
    return new Response(res.body, {
      status: res.status ?? 200,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  });
};

describe('GmoClient.entryTran', () => {
  it('成功応答から AccessID / AccessPass を parse して返す', async () => {
    const client = new GmoClient({
      endpoint: 'http://test-gmo',
      shopId: 'tshop00000001',
      shopPass: 'test_pass',
      fetch: makeFetchStub({
        '/entryTran': { body: 'AccessID=abc-123&AccessPass=pass-456' },
      }),
    });

    const result = await client.entryTran({
      shopId: 'tshop00000001',
      shopPass: 'test_pass',
      orderId: 'order-001',
      jobCd: 'AUTH',
      amount: 100000,
    });

    expect(result).toEqual({ accessId: 'abc-123', accessPass: 'pass-456' });
  });

  it('ErrCode 応答時に GmoAuthorizationError を throw', async () => {
    const client = new GmoClient({
      endpoint: 'http://test-gmo',
      fetch: makeFetchStub({
        '/entryTran': { body: 'ErrCode=E01&ErrInfo=E01190002' },
      }),
    });

    await expect(
      client.entryTran({
        shopId: 'tshop00000001',
        shopPass: 'test_pass',
        orderId: 'order-002',
        jobCd: 'AUTH',
        amount: 1_000_001,
      }),
    ).rejects.toMatchObject({
      name: 'GmoAuthorizationError',
      errCode: 'E01',
      errInfo: 'E01190002',
    });
  });

  it('AccessID 欠損時に error を throw', async () => {
    const client = new GmoClient({
      endpoint: 'http://test-gmo',
      fetch: makeFetchStub({
        '/entryTran': { body: 'AccessPass=only-pass' },
      }),
    });

    await expect(
      client.entryTran({
        shopId: 'tshop00000001',
        shopPass: 'test_pass',
        orderId: 'order-003',
        jobCd: 'AUTH',
        amount: 1000,
      }),
    ).rejects.toBeInstanceOf(GmoAuthorizationError);
  });
});

describe('GmoClient.execTran', () => {
  it('成功応答から ACS / ACSUrl / OrderID / TranID を parse して返す', async () => {
    const client = new GmoClient({
      endpoint: 'http://test-gmo',
      fetch: makeFetchStub({
        '/execTran': {
          body:
            'ACS=1&ACSUrl=http%3A%2F%2Fmock%2F3ds%3ForderId%3Dorder-001&OrderID=order-001' +
            '&AccessID=acc-1&Approve=apv-1&TranID=tran-1&TranDate=20260702093000',
        },
      }),
    });

    const result = await client.execTran({
      accessId: 'acc-1',
      accessPass: 'pass-1',
      orderId: 'order-001',
      cardToken: 'token-visa-4111',
    });

    expect(result.acs).toBe('1');
    expect(result.acsUrl).toContain('/3ds');
    expect(result.orderId).toBe('order-001');
    expect(result.tranId).toBe('tran-1');
    expect(result.tranDate).toBe('20260702093000');
  });

  it('ErrCode=G02 応答時 GmoAuthorizationError を throw (与信枠不足)', async () => {
    const client = new GmoClient({
      endpoint: 'http://test-gmo',
      fetch: makeFetchStub({
        '/execTran': { body: 'ErrCode=G02&ErrInfo=G02180001' },
      }),
    });

    await expect(
      client.execTran({
        accessId: 'acc-1',
        accessPass: 'pass-1',
        orderId: 'order-001',
        cardToken: 'token-fail-4000000000000002',
      }),
    ).rejects.toMatchObject({ errCode: 'G02' });
  });
});

describe('GmoClient network / HTTP failure', () => {
  it('network error 時に GmoAuthorizationError (cause 付) を throw', async () => {
    const client = new GmoClient({
      endpoint: 'http://test-gmo',
      fetch: vi.fn(async () => {
        throw new Error('network unreachable');
      }),
    });

    await expect(
      client.entryTran({
        shopId: 's',
        shopPass: 'p',
        orderId: 'o',
        jobCd: 'AUTH',
        amount: 1000,
      }),
    ).rejects.toBeInstanceOf(GmoAuthorizationError);
  });

  it('HTTP 500 応答時 GmoAuthorizationError を throw', async () => {
    const client = new GmoClient({
      endpoint: 'http://test-gmo',
      fetch: makeFetchStub({
        '/entryTran': { status: 500, body: 'internal server error' },
      }),
    });

    await expect(
      client.entryTran({
        shopId: 's',
        shopPass: 'p',
        orderId: 'o',
        jobCd: 'AUTH',
        amount: 1000,
      }),
    ).rejects.toBeInstanceOf(GmoAuthorizationError);
  });
});

describe('GmoClient.authorize (entryTran + execTran 統合)', () => {
  it('順次呼出し AuthorizationResult を返す', async () => {
    const fetchStub = makeFetchStub({
      '/entryTran': { body: 'AccessID=acc-2&AccessPass=pass-2' },
      '/execTran': {
        body:
          'ACS=1&ACSUrl=http%3A%2F%2Fmock%2F3ds%3ForderId%3Dorder-777&OrderID=order-777' +
          '&AccessID=acc-2&Approve=apv-2&TranID=tran-2&TranDate=20260702093100',
      },
    });
    const client = new GmoClient({ endpoint: 'http://test-gmo', fetch: fetchStub });

    const result = await client.authorize({
      orderId: 'order-777',
      amount: 500000,
      cardToken: 'token-visa-4111',
    });

    expect(result.authId).toBe('acc-2');
    expect(result.tds2Url).toContain('/3ds');
    expect(result.orderId).toBe('order-777');
    expect(fetchStub).toHaveBeenCalledTimes(2);
  });

  it('entryTran fail 時 execTran を呼ばず throw', async () => {
    const fetchStub = makeFetchStub({
      '/entryTran': { body: 'ErrCode=E01&ErrInfo=E01190002' },
    });
    const client = new GmoClient({ endpoint: 'http://test-gmo', fetch: fetchStub });

    await expect(
      client.authorize({
        orderId: 'order-777',
        amount: 1_000_001,
        cardToken: 'token',
      }),
    ).rejects.toMatchObject({ errCode: 'E01' });
    expect(fetchStub).toHaveBeenCalledTimes(1);
  });
});

describe('GmoClient.verifyTds2 (Issue #3007)', () => {
  it('成功応答から OrderID / AccessID / TranResult を parse して返す', async () => {
    const client = new GmoClient({
      endpoint: 'http://test-gmo',
      fetch: makeFetchStub({
        '/secureTran2': {
          body: 'OrderID=order-777&AccessID=acc-1&TranResult=0',
        },
      }),
    });

    const result = await client.verifyTds2({
      accessId: 'acc-1',
      accessPass: 'pass-1',
      transactionId: 'tds2-tran-1',
    });

    expect(result.orderId).toBe('order-777');
    expect(result.accessId).toBe('acc-1');
    expect(result.tranResult).toBe('0');
  });

  it('ErrCode=T01 応答時 GmoAuthorizationError を throw (3DS 認証 fail)', async () => {
    const client = new GmoClient({
      endpoint: 'http://test-gmo',
      fetch: makeFetchStub({
        '/secureTran2': { body: 'ErrCode=T01&ErrInfo=T01180001' },
      }),
    });

    await expect(
      client.verifyTds2({
        accessId: 'acc-1',
        accessPass: 'pass-1',
        transactionId: 'tds2-tran-1',
      }),
    ).rejects.toMatchObject({ errCode: 'T01' });
  });

  it('TranResult 欠損時 error を throw', async () => {
    const client = new GmoClient({
      endpoint: 'http://test-gmo',
      fetch: makeFetchStub({
        '/secureTran2': { body: 'OrderID=order-777&AccessID=acc-1' },
      }),
    });

    await expect(
      client.verifyTds2({
        accessId: 'acc-1',
        accessPass: 'pass-1',
        transactionId: 'tds2-tran-1',
      }),
    ).rejects.toBeInstanceOf(GmoAuthorizationError);
  });
});

describe('GmoClient.alterTran + cancelAuthorization (Issue #3007)', () => {
  it('alterTran(JobCd=VOID) 成功で Status="VOID" を返す', async () => {
    const client = new GmoClient({
      endpoint: 'http://test-gmo',
      fetch: makeFetchStub({
        '/alterTran': {
          body: 'AccessID=acc-1&AccessPass=pass-1&Status=VOID',
        },
      }),
    });

    const result = await client.alterTran({
      shopId: 'shop',
      shopPass: 'pass',
      accessId: 'acc-1',
      accessPass: 'pass-1',
      jobCd: 'VOID',
    });
    expect(result.status).toBe('VOID');
    expect(result.accessId).toBe('acc-1');
  });

  it('alterTran ErrCode=G05 で GmoAuthorizationError を throw', async () => {
    const client = new GmoClient({
      endpoint: 'http://test-gmo',
      fetch: makeFetchStub({
        '/alterTran': { body: 'ErrCode=G05&ErrInfo=G05180001' },
      }),
    });

    await expect(
      client.alterTran({
        shopId: 'shop',
        shopPass: 'pass',
        accessId: 'acc-1',
        accessPass: 'pass-1',
        jobCd: 'VOID',
      }),
    ).rejects.toMatchObject({ errCode: 'G05' });
  });

  it('cancelAuthorization は alterTran(JobCd=VOID) を暗黙呼出、 shopId/shopPass を config から注入', async () => {
    const fetchStub = vi.fn(
      async (...args: [input: string | URL | Request, init?: RequestInit]) => {
        const [input] = args;
        const url = resolveUrl(input);
        if (url.endsWith('/alterTran')) {
          return new Response('AccessID=acc-1&AccessPass=pass-1&Status=VOID', {
            status: 200,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          });
        }
        throw new Error(`unexpected URL ${url}`);
      },
    );
    const client = new GmoClient({
      endpoint: 'http://test-gmo',
      shopId: 'test-shop',
      shopPass: 'test-shop-pass',
      fetch: fetchStub,
    });

    const result = await client.cancelAuthorization({
      accessId: 'acc-1',
      accessPass: 'pass-1',
    });
    expect(result.status).toBe('VOID');

    // fetch call の body に ShopID / ShopPass / JobCd=VOID が含まれていることを verify
    const callArg = fetchStub.mock.calls[0]?.[1];
    expect(callArg).toBeDefined();
    const requestBody =
      callArg && typeof callArg === 'object' && 'body' in callArg
        ? String((callArg as { body: unknown }).body)
        : '';
    expect(requestBody).toContain('ShopID=test-shop');
    expect(requestBody).toContain('ShopPass=test-shop-pass');
    expect(requestBody).toContain('JobCd=VOID');
    expect(requestBody).toContain('AccessID=acc-1');
    expect(requestBody).toContain('AccessPass=pass-1');
  });
});
