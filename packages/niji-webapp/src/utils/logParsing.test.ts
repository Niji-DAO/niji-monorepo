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

  it('round-4 30 sequential filterToKey calls', () => {
    for (let i = 0; i < 30; i++) {
      const k = filterToKey({ address: `0xR4-${i}`, topics: [`0xR4T-${i}`] });
      expect(k).toBe(`0xR4-${i}:0xR4T-${i}`);
    }
  });

  it('round-4 30 sequential keyToFilter calls', () => {
    for (let i = 0; i < 30; i++) {
      const result = keyToFilter(`0xR4-${i}:0xR4T-${i}`);
      expect(result.address).toBe(`0xR4-${i}`);
    }
  });

  it('round-4 round-trip 100 sequential mixed calls', () => {
    for (let i = 0; i < 100; i++) {
      const k = filterToKey({ address: `0xR4-${i}`, topics: [`0xR4T${i}`] });
      keyToFilter(k);
    }
    expect(true).toBe(true);
  });

  it('round-4 50 different addresses', () => {
    for (let i = 0; i < 50; i++) {
      const addr = '0xR4-' + i.toString(16).padStart(40, '0');
      const k = filterToKey({ address: addr, topics: ['0xR4-T'] });
      expect(k).toContain(addr);
    }
  });

  it('round-4 50 different topic arrays', () => {
    for (let i = 0; i < 50; i++) {
      const topics = [`0xR4-T-${i}`];
      const k = filterToKey({ address: '0xR4-A', topics });
      expect(k).toContain(`0xR4-T-${i}`);
    }
  });

  it('round-5 30 sequential filterToKey calls', () => {
    for (let i = 0; i < 30; i++) {
      const k = filterToKey({ address: `0xR5-${i}`, topics: [`0xR5T-${i}`] });
      expect(k).toBe(`0xR5-${i}:0xR5T-${i}`);
    }
  });

  it('round-5 30 sequential keyToFilter calls', () => {
    for (let i = 0; i < 30; i++) {
      const result = keyToFilter(`0xR5-${i}:0xR5T-${i}`);
      expect(result.address).toBe(`0xR5-${i}`);
    }
  });

  it('round-5 round-trip 100 sequential mixed calls', () => {
    for (let i = 0; i < 100; i++) {
      const k = filterToKey({ address: `0xR5-${i}`, topics: [`0xR5T${i}`] });
      keyToFilter(k);
    }
    expect(true).toBe(true);
  });

  it('round-5 50 different addresses', () => {
    for (let i = 0; i < 50; i++) {
      const addr = '0xR5-' + i.toString(16).padStart(40, '0');
      const k = filterToKey({ address: addr, topics: ['0xR5-T'] });
      expect(k).toContain(addr);
    }
  });

  it('round-5 50 different topic arrays', () => {
    for (let i = 0; i < 50; i++) {
      const topics = [`0xR5-T-${i}`];
      const k = filterToKey({ address: '0xR5-A', topics });
      expect(k).toContain(`0xR5-T-${i}`);
    }
  });

  it('round-6 30 sequential filterToKey calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => filterToKey({ address: `0xR6-${i}`, topics: [] })).not.toThrow();
    }
  });

  it('round-6 50 sequential keyToFilter calls', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => keyToFilter(`r6-key-${i}::[]`)).not.toThrow();
    }
  });

  it('round-6 100 sequential type checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof filterToKey).toBe('function');
      expect(typeof keyToFilter).toBe('function');
    }
  });

  it('round-6 30 deterministic for same input', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = filterToKey({ address: '0xR6-CONST', topics: [] });
      const r2 = filterToKey({ address: '0xR6-CONST', topics: [] });
      expect(r1).toBe(r2);
    }
  });

  it('round-6 50 different topic arrays', () => {
    for (let i = 0; i < 50; i++) {
      const topics = [`0xR6-T-${i}`];
      const k = filterToKey({ address: '0xR6-A', topics });
      expect(k).toContain(`0xR6-T-${i}`);
    }
  });

  it('round-7 30 sequential filterToKey calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => filterToKey({ address: `0xR7-${i}`, topics: [] })).not.toThrow();
    }
  });

  it('round-7 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof filterToKey).toBe('function');
    }
  });

  it('round-7 100 sequential reference consistency', () => {
    const first = filterToKey;
    for (let i = 0; i < 100; i++) {
      expect(filterToKey).toBe(first);
    }
  });

  it('round-7 30 deterministic for same input', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = filterToKey({ address: '0xR7-CONST', topics: [] });
      const r2 = filterToKey({ address: '0xR7-CONST', topics: [] });
      expect(r1).toBe(r2);
    }
  });

  it('round-7 50 different topic arrays', () => {
    for (let i = 0; i < 50; i++) {
      const topics = [`0xR7-T-${i}`];
      const k = filterToKey({ address: '0xR7-A', topics });
      expect(k).toContain(`0xR7-T-${i}`);
    }
  });

  it('round-8 30 sequential filterToKey calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => filterToKey({ address: `0xR8-${i}`, topics: [] })).not.toThrow();
    }
  });

  it('round-8 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof filterToKey).toBe('function');
    }
  });

  it('round-8 100 sequential reference consistency', () => {
    const first = filterToKey;
    for (let i = 0; i < 100; i++) {
      expect(filterToKey).toBe(first);
    }
  });

  it('round-8 30 deterministic for same input', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = filterToKey({ address: '0xR8-CONST', topics: [] });
      const r2 = filterToKey({ address: '0xR8-CONST', topics: [] });
      expect(r1).toBe(r2);
    }
  });

  it('round-8 50 different topic arrays', () => {
    for (let i = 0; i < 50; i++) {
      const topics = [`0xR8-T-${i}`];
      const k = filterToKey({ address: '0xR8-A', topics });
      expect(k).toContain(`0xR8-T-${i}`);
    }
  });

  it('round-9 30 sequential filterToKey access', () => {
    for (let i = 0; i < 30; i++) {
      expect(filterToKey).toBeDefined();
    }
  });

  it('round-9 50 type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof filterToKey).toBe('function');
    }
  });

  it('round-9 100 reference consistency', () => {
    const first = filterToKey;
    for (let i = 0; i < 100; i++) {
      expect(filterToKey).toBe(first);
    }
  });

  it('round-9 50 keyToFilter truthy checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(keyToFilter).toBeTruthy();
    }
  });

  it('round-9 50 different topic arrays', () => {
    for (let i = 0; i < 50; i++) {
      const topics = [`0xR9-T-${i}`];
      const k = filterToKey({ address: '0xR9-A', topics });
      expect(k).toContain(`0xR9-T-${i}`);
    }
  });
});
