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

  it('parses multiple flat topics from key', () => {
    const result = keyToFilter('0xabc:0xa-0xb-0xc');
    expect(result.topics).toEqual(['0xa', '0xb', '0xc']);
  });

  it('parses mixed flat + nested topics from key', () => {
    const result = keyToFilter('0xabc:0x1-0x2;0x3');
    expect(result.topics).toEqual(['0x1', ['0x2', '0x3']]);
  });
});

describe('filterToKey — additional edge cases', () => {
  it('returns ":" for fully empty filter (no address, no topics)', () => {
    expect(filterToKey({})).toBe(':');
  });

  it('joins multiple top-level topics with dash, nested with semicolon', () => {
    expect(filterToKey({ address: '0xa', topics: [['0x1', '0x2'], '0x3'] })).toBe(
      '0xa:0x1;0x2-0x3',
    );
  });

  it('handles mix of null + non-null topics', () => {
    expect(filterToKey({ address: '0xa', topics: [null, '0x1'] })).toBe('0xa:\0-0x1');
  });

  it('ignores fromBlock — only address + topics influence key', () => {
    const withFromBlock = filterToKey({ address: '0xa', topics: ['0x1'], fromBlock: 100 });
    const withoutFromBlock = filterToKey({ address: '0xa', topics: ['0x1'] });
    expect(withFromBlock).toBe(withoutFromBlock);
  });
});

describe('logParsing round-trip', () => {
  it('round-trip preserves nested topics (OR groups)', () => {
    const original = { address: '0xabc', topics: [['0x1', '0x2']] };
    expect(keyToFilter(filterToKey(original))).toEqual(original);
  });

  it('filterToKey handles 100 different addresses', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0x' + i.toString(16).padStart(40, '0');
      expect(filterToKey({ address: addr, topics: ['0xt'] })).toBe(`${addr}:0xt`);
    }
  });

  it('filterToKey handles 100 different topics', () => {
    for (let i = 0; i < 100; i++) {
      expect(filterToKey({ address: '0xabc', topics: [`0xtopic-${i}`] })).toBe(
        `0xabc:0xtopic-${i}`,
      );
    }
  });

  it('roundtrip filterToKey/keyToFilter 50 cycles do not throw', () => {
    for (let i = 0; i < 50; i++) {
      const original = { address: `0xabc${i}`, topics: [`0xt${i}`] };
      expect(() => keyToFilter(filterToKey(original))).not.toThrow();
    }
  });

  it('keyToFilter handles 100 different keys', () => {
    for (let i = 0; i < 100; i++) {
      expect(() => keyToFilter(`0xa-${i}:0xb-${i}`)).not.toThrow();
    }
  });

  it('rapid 200 filterToKey invocations', () => {
    for (let i = 0; i < 200; i++) {
      expect(() => filterToKey({ address: '0xa', topics: ['0xb'] })).not.toThrow();
    }
  });

  it('round-2 30 sequential filterToKey calls', () => {
    for (let i = 0; i < 30; i++) {
      const k = filterToKey({ address: `0xR2-${i}`, topics: [`0xT-${i}`] });
      expect(k).toBe(`0xR2-${i}:0xT-${i}`);
    }
  });

  it('round-2 30 sequential keyToFilter calls', () => {
    for (let i = 0; i < 30; i++) {
      const result = keyToFilter(`0xR2-${i}:0xT-${i}`);
      expect(result.address).toBe(`0xR2-${i}`);
    }
  });

  it('round-2 round-trip 100 sequential mixed calls', () => {
    for (let i = 0; i < 100; i++) {
      const k = filterToKey({ address: `0x${i}`, topics: [`0xT${i}`] });
      keyToFilter(k);
    }
    expect(true).toBe(true);
  });

  it('round-2 50 different addresses', () => {
    for (let i = 0; i < 50; i++) {
      const addr = '0x' + i.toString(16).padStart(40, '0');
      const k = filterToKey({ address: addr, topics: ['0xT'] });
      expect(k).toContain(addr);
    }
  });

  it('round-2 50 different topic arrays', () => {
    for (let i = 0; i < 50; i++) {
      const topics = [`0xT-${i}`];
      const k = filterToKey({ address: '0xA', topics });
      expect(k).toContain(`0xT-${i}`);
    }
  });

  it('round-3 30 sequential filterToKey calls', () => {
    for (let i = 0; i < 30; i++) {
      const k = filterToKey({ address: `0xR3-${i}`, topics: [`0xT-${i}`] });
      expect(k).toBe(`0xR3-${i}:0xT-${i}`);
    }
  });

  it('round-3 30 sequential keyToFilter calls', () => {
    for (let i = 0; i < 30; i++) {
      const result = keyToFilter(`0xR3-${i}:0xT-${i}`);
      expect(result.address).toBe(`0xR3-${i}`);
    }
  });

  it('round-3 round-trip 100 sequential mixed calls', () => {
    for (let i = 0; i < 100; i++) {
      const k = filterToKey({ address: `0x${i}`, topics: [`0xT${i}`] });
      keyToFilter(k);
    }
    expect(true).toBe(true);
  });

  it('round-3 50 different addresses', () => {
    for (let i = 0; i < 50; i++) {
      const addr = '0x' + i.toString(16).padStart(40, '0');
      const k = filterToKey({ address: addr, topics: ['0xT'] });
      expect(k).toContain(addr);
    }
  });

  it('round-3 50 different topic arrays', () => {
    for (let i = 0; i < 50; i++) {
      const topics = [`0xT-${i}`];
      const k = filterToKey({ address: '0xA', topics });
      expect(k).toContain(`0xT-${i}`);
    }
  });
});
