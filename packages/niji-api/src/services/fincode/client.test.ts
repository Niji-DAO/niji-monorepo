/**
 * FincodeClient behavior test (Phase 2 backend 統合、 Issue #3115)
 *
 * 検証対象 —
 * (1) registerPayment 成功時に access_id を parse して返す
 * (2) executePayment 成功時に status / acs_url / approve を parse して返す
 * (3) fincode error 応答 (HTTP 4xx + { errors: [{ error_code }] }) 時に FincodeAuthorizationError を throw
 * (4) network error 時に FincodeAuthorizationError (cause 付) を throw
 * (5) authorize (register + execute) が順次呼出し FincodeAuthorizationResult を返す
 * (6) authorize 中に register fail → execute 呼ばず即 throw
 * (7) endpoint 解決 (USE_FINCODE_MOCK=true → mock endpoint、 false + live=false → test endpoint)
 *
 * mock server は import せず、 fetch 実装を DI で差替えて fincode 応答 shape を単体検証する。
 * rules/quality.md § test-passed marker 発行前提 4 条件準拠 (behavior test + 実行 pass + 層 0 指示項目)。
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { FincodeClient, type FetchLike } from './client.js';

/**
 * fetch stub を作る helper
 * responses = URL path ごとに JSON body + status を返す map
 * method 別 dispatch は URL match で十分 (POST /v1/payments と PUT /v1/payments/{id} は path 別)
 */
const resolveUrl = (input: string | URL | Request): string => {
  if (input instanceof URL) return input.toString();
  if (typeof input === 'string') return input;
  return input.url;
};

const makeFetchStub = (responses: Record<string, { status?: number; body: unknown }>) => {
  return vi.fn(async (input: string | URL | Request) => {
    const url = resolveUrl(input);
    // longest match で URL 判定 (PUT /v1/payments/{id} が POST /v1/payments より優先)
    const matched = Object.entries(responses)
      .sort((a, b) => b[0].length - a[0].length)
      .find(([path]) => url.endsWith(path) || url.includes(path));
    if (matched === undefined) {
      throw new Error(`fetch stub: unmatched URL ${url}`);
    }
    const [, res] = matched;
    return new Response(JSON.stringify(res.body), {
      status: res.status ?? 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });
};

/** env override helper (test 前後で env をきれいに保つ) */
const withEnv = (overrides: Record<string, string | undefined>) => {
  const original: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(overrides)) {
    original[key] = process.env[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
  return () => {
    for (const [key, value] of Object.entries(original)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  };
};

describe('FincodeClient.registerPayment', () => {
  it('成功応答から access_id を parse して返す', async () => {
    const client = new FincodeClient({
      endpoint: 'http://test-fincode',
      apiKeySecret: 'm_test_dummy',
      fetch: makeFetchStub({
        '/v1/payments': {
          body: {
            id: 'order-001',
            access_id: 'acc-001',
            status: 'CHECKED',
            job_code: 'AUTH',
            amount: '25000',
          },
        },
      }),
    });

    const result = await client.registerPayment({
      pay_type: 'Card',
      job_code: 'AUTH',
      amount: '25000',
      id: 'order-001',
    });

    expect(result).toMatchObject({
      id: 'order-001',
      access_id: 'acc-001',
      status: 'CHECKED',
    });
  });

  it('HTTP 400 + errors 応答時に FincodeAuthorizationError を throw', async () => {
    const client = new FincodeClient({
      endpoint: 'http://test-fincode',
      apiKeySecret: 'm_test_dummy',
      fetch: makeFetchStub({
        '/v1/payments': {
          status: 400,
          body: {
            errors: [
              {
                error_code: 'E10000',
                error_message: 'amount must be positive integer',
              },
            ],
          },
        },
      }),
    });

    await expect(
      client.registerPayment({
        pay_type: 'Card',
        job_code: 'AUTH',
        amount: '0',
        id: 'order-002',
      }),
    ).rejects.toMatchObject({
      name: 'FincodeAuthorizationError',
      errorCode: 'E10000',
      errorMessage: 'amount must be positive integer',
    });
  });

  it('access_id 欠損時に error を throw', async () => {
    const client = new FincodeClient({
      endpoint: 'http://test-fincode',
      apiKeySecret: 'm_test_dummy',
      fetch: makeFetchStub({
        '/v1/payments': {
          body: {
            id: 'order-003',
            status: 'CHECKED',
            job_code: 'AUTH',
            amount: '25000',
          },
        },
      }),
    });

    await expect(
      client.registerPayment({
        pay_type: 'Card',
        job_code: 'AUTH',
        amount: '25000',
        id: 'order-003',
      }),
    ).rejects.toThrow(/access_id/);
  });

  it('network error 時に FincodeAuthorizationError を throw (cause 付)', async () => {
    const networkErr = new Error('fetch aborted');
    const client = new FincodeClient({
      endpoint: 'http://test-fincode',
      apiKeySecret: 'm_test_dummy',
      fetch: vi.fn(async () => {
        throw networkErr;
      }),
    });

    await expect(
      client.registerPayment({
        pay_type: 'Card',
        job_code: 'AUTH',
        amount: '25000',
        id: 'order-004',
      }),
    ).rejects.toMatchObject({
      name: 'FincodeAuthorizationError',
    });
  });

  it('Authorization header に Bearer + secret を送信', async () => {
    const fetchStub: FetchLike = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          id: 'order-005',
          access_id: 'acc-005',
          status: 'CHECKED',
          job_code: 'AUTH',
          amount: '25000',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    });

    const client = new FincodeClient({
      endpoint: 'http://test-fincode',
      apiKeySecret: 'm_test_secret_xxx',
      fetch: fetchStub,
    });

    await client.registerPayment({
      pay_type: 'Card',
      job_code: 'AUTH',
      amount: '25000',
      id: 'order-005',
    });

    expect(fetchStub).toHaveBeenCalledTimes(1);
    const call = fetchStub.mock.calls[0];
    if (call === undefined) throw new Error('fetch not called');
    const init = call[1] as RequestInit;
    const headers = init.headers as Record<string, string>;
    expect(headers['Authorization']).toBe('Bearer m_test_secret_xxx');
    expect(headers['Content-Type']).toBe('application/json');
  });

  it('Tenant-Shop-Id を設定時のみ header に付与', async () => {
    const fetchStub: FetchLike = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          id: 'order-006',
          access_id: 'acc-006',
          status: 'CHECKED',
          job_code: 'AUTH',
          amount: '25000',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    });

    const client = new FincodeClient({
      endpoint: 'http://test-fincode',
      apiKeySecret: 'm_test_dummy',
      tenantShopId: 's_test_tenant',
      fetch: fetchStub,
    });

    await client.registerPayment({
      pay_type: 'Card',
      job_code: 'AUTH',
      amount: '25000',
      id: 'order-006',
    });

    const call = fetchStub.mock.calls[0];
    if (call === undefined) throw new Error('fetch not called');
    const init = call[1] as RequestInit;
    const headers = init.headers as Record<string, string>;
    expect(headers['Tenant-Shop-Id']).toBe('s_test_tenant');
  });
});

describe('FincodeClient.executePayment', () => {
  it('AUTHORIZED 応答から status を parse して返す', async () => {
    const client = new FincodeClient({
      endpoint: 'http://test-fincode',
      apiKeySecret: 'm_test_dummy',
      fetch: makeFetchStub({
        '/v1/payments/order-101': {
          body: {
            id: 'order-101',
            access_id: 'acc-101',
            status: 'AUTHORIZED',
            job_code: 'AUTH',
            amount: '25000',
            approve: '1234567',
            transaction_id: 'tx-101',
          },
        },
      }),
    });

    const result = await client.executePayment('order-101', {
      pay_type: 'Card',
      access_id: 'acc-101',
      method: '1',
      token: 'card_token_xxx',
    });

    expect(result).toMatchObject({
      id: 'order-101',
      status: 'AUTHORIZED',
      approve: '1234567',
    });
  });

  it('AUTHENTICATED (3DS 必要) 応答から acs_url を parse', async () => {
    const client = new FincodeClient({
      endpoint: 'http://test-fincode',
      apiKeySecret: 'm_test_dummy',
      fetch: makeFetchStub({
        '/v1/payments/order-102': {
          body: {
            id: 'order-102',
            access_id: 'acc-102',
            status: 'AUTHENTICATED',
            job_code: 'AUTH',
            amount: '25000',
            acs_url: 'https://acs.example/3ds?token=xyz',
          },
        },
      }),
    });

    const result = await client.executePayment('order-102', {
      pay_type: 'Card',
      access_id: 'acc-102',
      method: '1',
      token: 'card_token_xxx',
      tds2_ret_url: 'http://webapp/3ds-callback',
      tds2_type: '2',
    });

    expect(result.status).toBe('AUTHENTICATED');
    expect(result.acs_url).toBe('https://acs.example/3ds?token=xyz');
  });

  it('HTTP 402 + errors 応答時に FincodeAuthorizationError を throw', async () => {
    const client = new FincodeClient({
      endpoint: 'http://test-fincode',
      apiKeySecret: 'm_test_dummy',
      fetch: makeFetchStub({
        '/v1/payments/order-103': {
          status: 402,
          body: {
            errors: [
              {
                error_code: 'CARD_DECLINED',
                error_message: 'card declined by issuer',
              },
            ],
          },
        },
      }),
    });

    await expect(
      client.executePayment('order-103', {
        pay_type: 'Card',
        access_id: 'acc-103',
        method: '1',
        token: 'card_token_declined',
      }),
    ).rejects.toMatchObject({
      name: 'FincodeAuthorizationError',
      errorCode: 'CARD_DECLINED',
    });
  });
});

describe('FincodeClient.authorize (register + execute 統合)', () => {
  it('register + execute 順次呼出し AuthorizationResult を返す', async () => {
    const client = new FincodeClient({
      endpoint: 'http://test-fincode',
      apiKeySecret: 'm_test_dummy',
      fetch: makeFetchStub({
        '/v1/payments/order-201': {
          body: {
            id: 'order-201',
            access_id: 'acc-201',
            status: 'AUTHORIZED',
            job_code: 'AUTH',
            amount: '25000',
            approve: '9876543',
            transaction_id: 'tx-201',
          },
        },
        '/v1/payments': {
          body: {
            id: 'order-201',
            access_id: 'acc-201',
            status: 'CHECKED',
            job_code: 'AUTH',
            amount: '25000',
          },
        },
      }),
    });

    const result = await client.authorize({
      orderId: 'order-201',
      amount: 25000,
      cardToken: 'card_token_xxx',
    });

    expect(result).toMatchObject({
      authId: 'acc-201',
      accessId: 'acc-201',
      orderId: 'order-201',
      status: 'AUTHORIZED',
      approve: '9876543',
      transactionId: 'tx-201',
    });
  });

  it('register fail 時に execute 呼ばず即 throw', async () => {
    const executeStub = vi.fn();
    const fetchStub = vi.fn(async (input: string | URL | Request) => {
      const url = resolveUrl(input);
      if (url.endsWith('/v1/payments')) {
        return new Response(
          JSON.stringify({
            errors: [{ error_code: 'E10001', error_message: 'amount over limit' }],
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
      }
      executeStub();
      return new Response('{}', { status: 200 });
    });

    const client = new FincodeClient({
      endpoint: 'http://test-fincode',
      apiKeySecret: 'm_test_dummy',
      fetch: fetchStub,
    });

    await expect(
      client.authorize({
        orderId: 'order-202',
        amount: 10_000_000,
        cardToken: 'card_token_xxx',
      }),
    ).rejects.toMatchObject({
      name: 'FincodeAuthorizationError',
      errorCode: 'E10001',
    });
    expect(executeStub).not.toHaveBeenCalled();
  });
});

describe('FincodeClient endpoint 解決', () => {
  let restoreEnv: () => void = () => {};
  afterEach(() => {
    restoreEnv();
  });

  it('USE_FINCODE_MOCK=true 時に FINCODE_MOCK_ENDPOINT を使う', async () => {
    restoreEnv = withEnv({
      USE_FINCODE_MOCK: 'true',
      FINCODE_MOCK_ENDPOINT: 'http://mock-server:2427',
    });
    const fetchStub: FetchLike = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          id: 'order-301',
          access_id: 'acc-301',
          status: 'CHECKED',
          job_code: 'AUTH',
          amount: '25000',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    });
    const client = new FincodeClient({ apiKeySecret: 'm_test_dummy', fetch: fetchStub });

    await client.registerPayment({
      pay_type: 'Card',
      job_code: 'AUTH',
      amount: '25000',
      id: 'order-301',
    });

    const call = fetchStub.mock.calls[0];
    if (call === undefined) throw new Error('fetch not called');
    expect(resolveUrl(call[0] as string | URL | Request)).toContain('mock-server:2427');
  });

  it('USE_FINCODE_MOCK=false + live=false 時に test endpoint を使う', async () => {
    restoreEnv = withEnv({
      USE_FINCODE_MOCK: 'false',
      FINCODE_IS_LIVE_MODE: 'false',
    });
    const fetchStub: FetchLike = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          id: 'order-302',
          access_id: 'acc-302',
          status: 'CHECKED',
          job_code: 'AUTH',
          amount: '25000',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    });
    const client = new FincodeClient({ apiKeySecret: 'm_test_dummy', fetch: fetchStub });

    await client.registerPayment({
      pay_type: 'Card',
      job_code: 'AUTH',
      amount: '25000',
      id: 'order-302',
    });

    const call = fetchStub.mock.calls[0];
    if (call === undefined) throw new Error('fetch not called');
    expect(resolveUrl(call[0] as string | URL | Request)).toContain('api.test.fincode.jp');
  });

  it('USE_FINCODE_MOCK=false + live=true 時に production endpoint を使う', async () => {
    restoreEnv = withEnv({
      USE_FINCODE_MOCK: 'false',
      FINCODE_IS_LIVE_MODE: 'true',
    });
    const fetchStub: FetchLike = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          id: 'order-303',
          access_id: 'acc-303',
          status: 'CHECKED',
          job_code: 'AUTH',
          amount: '25000',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    });
    const client = new FincodeClient({ apiKeySecret: 'm_test_dummy', fetch: fetchStub });

    await client.registerPayment({
      pay_type: 'Card',
      job_code: 'AUTH',
      amount: '25000',
      id: 'order-303',
    });

    const call = fetchStub.mock.calls[0];
    if (call === undefined) throw new Error('fetch not called');
    expect(resolveUrl(call[0] as string | URL | Request)).toContain('api.fincode.jp');
  });
});
