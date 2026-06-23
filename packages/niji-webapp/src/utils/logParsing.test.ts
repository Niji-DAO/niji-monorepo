import { describe, expect, it } from 'vitest';

import { filterToKey, keyToFilter } from './logParsing';

describe('filterToKey', () => {
  it('converts simple filter to colon-separated key', () => {
    expect(filterToKey({ address: '0xabc', topics: ['0xdef'] })).toBe('0xabc:0xdef');
  });

  it('handles empty address', () => {
    expect(filterToKey({ topics: ['0xdef'] })).toBe(':0xdef');
  });

  it('handles empty topics', () => {
    expect(filterToKey({ address: '0xabc' })).toBe('0xabc:');
  });

  it('handles array of topics joined with -', () => {
    expect(filterToKey({ address: '0xabc', topics: ['0x1', '0x2'] })).toBe('0xabc:0x1-0x2');
  });

  it('handles nested array (OR topics) joined with ;', () => {
    expect(filterToKey({ address: '0xabc', topics: [['0x1', '0x2']] })).toBe('0xabc:0x1;0x2');
  });

  it('handles null topic as \\0', () => {
    expect(filterToKey({ address: '0xabc', topics: [null] })).toBe('0xabc:\0');
  });
});

describe('keyToFilter', () => {
  it('parses simple key back to filter', () => {
    const result = keyToFilter('0xabc:0xdef');
    expect(result.address).toBe('0xabc');
    expect(result.topics).toEqual(['0xdef']);
  });

  it('parses empty address to undefined', () => {
    const result = keyToFilter(':0xdef');
    expect(result.address).toBeUndefined();
  });

  it('parses nested topics (semicolon-separated)', () => {
    const result = keyToFilter('0xabc:0x1;0x2');
    expect(result.topics).toEqual([['0x1', '0x2']]);
  });

  it('round-trip: filterToKey then keyToFilter preserves data', () => {
    const original = { address: '0xabc', topics: ['0x1', '0x2'] };
    expect(keyToFilter(filterToKey(original))).toEqual({
      address: '0xabc',
      topics: ['0x1', '0x2'],
    });
  });
});
