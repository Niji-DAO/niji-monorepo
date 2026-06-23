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
});
