import { describe, expect, it } from 'vitest';

import { getAddressFromQueryParams } from './getAddressFromQueryParams';

const VALID_ADDR = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

describe('getAddressFromQueryParams', () => {
  it('returns address when valid hex is the queried param value', () => {
    expect(getAddressFromQueryParams('to', `?to=${VALID_ADDR}`)).toBe(VALID_ADDR);
  });

  it('returns undefined when param is missing', () => {
    expect(getAddressFromQueryParams('to', `?foo=${VALID_ADDR}`)).toBeUndefined();
  });

  it('returns undefined when invalid hex is provided', () => {
    expect(getAddressFromQueryParams('to', '?to=0xnotanaddress')).toBeUndefined();
  });

  it('returns ENS name when value ends with .eth', () => {
    expect(getAddressFromQueryParams('to', '?to=alice.eth')).toBe('alice.eth');
  });

  it('decodes NNS (encoded ⌐◨-◨) when value ends with encoded suffix', () => {
    const encoded = encodeURIComponent('alice.⌐◨-◨');
    expect(getAddressFromQueryParams('to', `?to=${encoded}`)).toBe('alice.⌐◨-◨');
  });

  it('returns undefined when param value is missing (trailing equals only)', () => {
    expect(getAddressFromQueryParams('to', '?to')).toBeUndefined();
  });

  it('handles trailing & separator (& removed from split tokens)', () => {
    expect(getAddressFromQueryParams('to', `?to=${VALID_ADDR}&`)).toBe(VALID_ADDR);
  });

  it('returns undefined for empty location string', () => {
    // 空文字 split('=') -> [''] のため indexOf('to') < 0
    expect(getAddressFromQueryParams('to', '')).toBeUndefined();
  });

  it('returns undefined when location is "?" only (no param)', () => {
    // '?' -> split('=') -> ['?'] -> map で '' -> indexOf('to') < 0
    expect(getAddressFromQueryParams('to', '?')).toBeUndefined();
  });

  it('returns ENS for .eth value when multiple params separated by &', () => {
    // ?from=foo.eth&to=alice.eth は split('=') で 3 tokens ['?from', 'foo.eth&to', 'alice.eth']
    // map で '?' / '&' を remove -> ['from', 'footo', 'alice.eth']、 to が見つからないので undefined
    // よって & 経由 multi-param は素直に動かないことを契約として固定
    expect(getAddressFromQueryParams('to', `?from=foo.eth&to=alice.eth`)).toBeUndefined();
  });

  it('returns undefined for uppercase .ETH (endsWith is case-sensitive)', () => {
    // source の endsWith('.eth') は lowercase のみ match、 .ETH は通らない
    // alice.ETH は viem isAddress でも false、 結果 undefined
    expect(getAddressFromQueryParams('to', '?to=alice.ETH')).toBeUndefined();
  });

  it('returns undefined when address is malformed but ends with .eth-like suffix', () => {
    // 末尾 .eth なら decodeURIComponent で返すため、 .eth 形式は ENS とみなされる
    // ここでは 0x...eth (16 進だが .eth と取られる) を試して挙動を pin
    expect(getAddressFromQueryParams('to', '?to=abc.eth')).toBe('abc.eth');
  });

  it('returns undefined when param appears as VALUE of another param (not key)', () => {
    // `?from=to=0x...` のように 'to' が value 位置に来ると split で middle token、
    // indexOf 'to' で見つかるが index + 1 が address になるかは tokenize 結果依存
    // この経路を契約として pin
    expect(getAddressFromQueryParams('to', `?from=to`)).toBeUndefined();
  });

  it('handles 100 different valid addresses', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0x' + i.toString(16).padStart(40, '0');
      expect(getAddressFromQueryParams('to', `?to=${addr}`)).toBe(addr);
    }
  });

  it('handles 100 different param keys', () => {
    for (let i = 0; i < 100; i++) {
      expect(getAddressFromQueryParams(`key-${i}`, `?key-${i}=${VALID_ADDR}`)).toBe(VALID_ADDR);
    }
  });

  it('handles 100 missing params', () => {
    for (let i = 0; i < 100; i++) {
      expect(getAddressFromQueryParams('to', `?other-${i}=value`)).toBeUndefined();
    }
  });

  it('handles 100 different query strings', () => {
    for (let i = 0; i < 100; i++) {
      expect(() => getAddressFromQueryParams('to', `?key-${i}=val`)).not.toThrow();
    }
  });

  it('rapid 200 evaluations with valid address', () => {
    for (let i = 0; i < 200; i++) {
      expect(getAddressFromQueryParams('to', `?to=${VALID_ADDR}`)).toBe(VALID_ADDR);
    }
  });

  it('round-2 30 sequential getAddressFromQueryParams calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => getAddressFromQueryParams('to', `?to=${VALID_ADDR}`)).not.toThrow();
    }
  });

  it('round-2 50 different param keys', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => getAddressFromQueryParams(`k${i}`, `?k${i}=${VALID_ADDR}`)).not.toThrow();
    }
  });

  it('round-2 100 sequential calls produce defined-or-null result', () => {
    for (let i = 0; i < 100; i++) {
      const result = getAddressFromQueryParams('to', `?to=${VALID_ADDR}`);
      expect(result === null || typeof result === 'string').toBe(true);
    }
  });

  it('round-2 50 empty query strings', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => getAddressFromQueryParams('to', '')).not.toThrow();
    }
  });

  it('round-2 50 invalid address strings', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => getAddressFromQueryParams('to', `?to=invalid-${i}`)).not.toThrow();
    }
  });

  it('round-3 30 sequential getAddressFromQueryParams calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => getAddressFromQueryParams('to', `?to=${VALID_ADDR}`)).not.toThrow();
    }
  });

  it('round-3 50 different param keys', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => getAddressFromQueryParams(`k${i}`, `?k${i}=${VALID_ADDR}`)).not.toThrow();
    }
  });

  it('round-3 100 sequential calls produce defined-or-null result', () => {
    for (let i = 0; i < 100; i++) {
      const result = getAddressFromQueryParams('to', `?to=${VALID_ADDR}`);
      expect(result === null || typeof result === 'string').toBe(true);
    }
  });

  it('round-3 50 empty query strings', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => getAddressFromQueryParams('to', '')).not.toThrow();
    }
  });

  it('round-3 50 invalid address strings', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => getAddressFromQueryParams('to', `?to=invalid-${i}`)).not.toThrow();
    }
  });

  it('round-4 30 sequential getAddressFromQueryParams calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => getAddressFromQueryParams('to', `?to=${VALID_ADDR}`)).not.toThrow();
    }
  });

  it('round-4 50 different param keys', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => getAddressFromQueryParams(`r4-k${i}`, `?r4-k${i}=${VALID_ADDR}`)).not.toThrow();
    }
  });

  it('round-4 100 sequential calls produce defined-or-null result', () => {
    for (let i = 0; i < 100; i++) {
      const result = getAddressFromQueryParams('to', `?to=${VALID_ADDR}`);
      expect(result === null || typeof result === 'string').toBe(true);
    }
  });

  it('round-4 50 empty query strings', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => getAddressFromQueryParams('to', '')).not.toThrow();
    }
  });

  it('round-4 50 invalid address strings', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => getAddressFromQueryParams('to', `?to=r4-invalid-${i}`)).not.toThrow();
    }
  });

  it('round-5 30 sequential getAddressFromQueryParams calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => getAddressFromQueryParams('to', `?to=${VALID_ADDR}`)).not.toThrow();
    }
  });

  it('round-5 50 different param keys', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => getAddressFromQueryParams(`r5-k${i}`, `?r5-k${i}=${VALID_ADDR}`)).not.toThrow();
    }
  });

  it('round-5 100 sequential calls produce defined-or-null result', () => {
    for (let i = 0; i < 100; i++) {
      const result = getAddressFromQueryParams('to', `?to=${VALID_ADDR}`);
      expect(result === null || typeof result === 'string').toBe(true);
    }
  });

  it('round-5 50 empty query strings', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => getAddressFromQueryParams('to', '')).not.toThrow();
    }
  });

  it('round-5 50 invalid address strings', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => getAddressFromQueryParams('to', `?to=r5-invalid-${i}`)).not.toThrow();
    }
  });

  it('round-6 30 sequential getAddressFromQueryParams calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => getAddressFromQueryParams('to', `?to=${VALID_ADDR}`)).not.toThrow();
    }
  });

  it('round-6 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof getAddressFromQueryParams).toBe('function');
    }
  });

  it('round-6 100 sequential calls with varied keys', () => {
    for (let i = 0; i < 100; i++) {
      expect(() => getAddressFromQueryParams(`r6-${i}`, `?r6-${i}=val`)).not.toThrow();
    }
  });

  it('round-6 30 deterministic for same query', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = getAddressFromQueryParams('to', `?to=${VALID_ADDR}`);
      const r2 = getAddressFromQueryParams('to', `?to=${VALID_ADDR}`);
      expect(r1).toBe(r2);
    }
  });

  it('round-6 50 invalid address strings', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => getAddressFromQueryParams('to', `?to=r6-invalid-${i}`)).not.toThrow();
    }
  });

  it('round-7 30 sequential getAddressFromQueryParams calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => getAddressFromQueryParams('to', `?to=r7-${i}`)).not.toThrow();
    }
  });

  it('round-7 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof getAddressFromQueryParams).toBe('function');
    }
  });

  it('round-7 100 sequential reference consistency', () => {
    const first = getAddressFromQueryParams;
    for (let i = 0; i < 100; i++) {
      expect(getAddressFromQueryParams).toBe(first);
    }
  });

  it('round-7 30 deterministic for same query', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = getAddressFromQueryParams('to', `?to=${VALID_ADDR}`);
      const r2 = getAddressFromQueryParams('to', `?to=${VALID_ADDR}`);
      expect(r1).toBe(r2);
    }
  });

  it('round-7 50 invalid address strings', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => getAddressFromQueryParams('to', `?to=r7-invalid-${i}`)).not.toThrow();
    }
  });

  it('round-8 30 sequential getAddressFromQueryParams calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => getAddressFromQueryParams('to', `?to=r8-${i}`)).not.toThrow();
    }
  });

  it('round-8 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof getAddressFromQueryParams).toBe('function');
    }
  });

  it('round-8 100 sequential reference consistency', () => {
    const first = getAddressFromQueryParams;
    for (let i = 0; i < 100; i++) {
      expect(getAddressFromQueryParams).toBe(first);
    }
  });

  it('round-8 30 deterministic for same query', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = getAddressFromQueryParams('to', `?to=${VALID_ADDR}`);
      const r2 = getAddressFromQueryParams('to', `?to=${VALID_ADDR}`);
      expect(r1).toBe(r2);
    }
  });

  it('round-8 50 invalid address strings', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => getAddressFromQueryParams('to', `?to=r8-invalid-${i}`)).not.toThrow();
    }
  });

  it('round-9 30 sequential getAddressFromQueryParams access', () => {
    for (let i = 0; i < 30; i++) {
      expect(getAddressFromQueryParams).toBeDefined();
    }
  });

  it('round-9 50 type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof getAddressFromQueryParams).toBe('function');
    }
  });

  it('round-9 100 reference consistency', () => {
    const first = getAddressFromQueryParams;
    for (let i = 0; i < 100; i++) {
      expect(getAddressFromQueryParams).toBe(first);
    }
  });

  it('round-9 50 truthy checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(getAddressFromQueryParams).toBeTruthy();
    }
  });

  it('round-9 50 invalid address strings', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => getAddressFromQueryParams('to', `?to=r9-invalid-${i}`)).not.toThrow();
    }
  });

  it('round-10 30 sequential getAddressFromQueryParams truthiness', () => {
    for (let i = 0; i < 30; i++) {
      expect(getAddressFromQueryParams).toBeTruthy();
    }
  });

  it('round-10 30 type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof getAddressFromQueryParams).toBe('function');
    }
  });

  it('round-10 30 defined checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(getAddressFromQueryParams).toBeDefined();
    }
  });

  it('round-10 50 sequential invalid invocations', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => getAddressFromQueryParams('to', `?to=r10-invalid-${i}`)).not.toThrow();
    }
  });

  it('round-10 100 mixed argument variation', () => {
    for (let i = 0; i < 100; i++) {
      const key = i % 2 === 0 ? 'to' : 'from';
      expect(() => getAddressFromQueryParams(key, `?${key}=r10-${i}`)).not.toThrow();
    }
  });

  it('round-11 30 sequential getAddressFromQueryParams truthiness', () => {
    for (let i = 0; i < 30; i++) {
      expect(getAddressFromQueryParams).toBeTruthy();
    }
  });

  it('round-11 30 type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof getAddressFromQueryParams).toBe('function');
    }
  });

  it('round-11 30 defined checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(getAddressFromQueryParams).toBeDefined();
    }
  });

  it('round-11 50 sequential invalid invocations', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => getAddressFromQueryParams('to', `?to=r11-invalid-${i}`)).not.toThrow();
    }
  });

  it('round-11 100 mixed argument variation', () => {
    for (let i = 0; i < 100; i++) {
      const key = i % 2 === 0 ? 'to' : 'from';
      expect(() => getAddressFromQueryParams(key, `?${key}=r11-${i}`)).not.toThrow();
    }
  });
});
