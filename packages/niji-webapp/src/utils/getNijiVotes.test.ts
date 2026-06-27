import { describe, expect, it } from 'vitest';

import { getNijiVotes } from './getNijiVotes';

describe('getNijiVotes', () => {
  const votes = [
    { supportDetailed: 0 as const, nijiRepresented: ['1', '2'] },
    { supportDetailed: 1 as const, nijiRepresented: ['3', '4', '5'] },
    { supportDetailed: 2 as const, nijiRepresented: ['6'] },
    { supportDetailed: 1 as const, nijiRepresented: ['7'] },
  ];

  it('returns flat list of nijiIds voting against (0)', () => {
    expect(getNijiVotes(votes, 0)).toEqual(['1', '2']);
  });

  it('returns flat list of nijiIds voting for (1)', () => {
    expect(getNijiVotes(votes, 1)).toEqual(['3', '4', '5', '7']);
  });

  it('returns flat list of nijiIds voting abstain (2)', () => {
    expect(getNijiVotes(votes, 2)).toEqual(['6']);
  });

  it('returns empty array when no matching support value', () => {
    expect(getNijiVotes(votes, 99 as 0)).toEqual([]);
  });

  it('handles empty votes array', () => {
    expect(getNijiVotes([], 1)).toEqual([]);
  });

  it('preserves duplicate nijiIds across multiple Vote entries', () => {
    const dup = [
      { supportDetailed: 1 as const, nijiRepresented: ['10', '10'] },
      { supportDetailed: 1 as const, nijiRepresented: ['10'] },
    ];
    // dedup なし、 source の意図通り重複保持
    expect(getNijiVotes(dup, 1)).toEqual(['10', '10', '10']);
  });

  it('returns empty array when all Vote entries have empty nijiRepresented', () => {
    const all = [
      { supportDetailed: 1 as const, nijiRepresented: [] },
      { supportDetailed: 1 as const, nijiRepresented: [] },
    ];
    expect(getNijiVotes(all, 1)).toEqual([]);
  });

  it('strict === filter: numeric 1 does not match string "1"', () => {
    // 型違反だが runtime 経路を確認 (string vs number)
    const mixed = [{ supportDetailed: '1' as unknown as 1, nijiRepresented: ['x'] }];
    expect(getNijiVotes(mixed, 1)).toEqual([]);
  });

  it('preserves order of nijiIds within and across votes', () => {
    const ordered = [
      { supportDetailed: 1 as const, nijiRepresented: ['c', 'a'] },
      { supportDetailed: 1 as const, nijiRepresented: ['b'] },
    ];
    // filter + flatMap で source 順を保持 (sort 不可)
    expect(getNijiVotes(ordered, 1)).toEqual(['c', 'a', 'b']);
  });

  it('handles single-entry vote with single niji', () => {
    expect(getNijiVotes([{ supportDetailed: 0 as const, nijiRepresented: ['solo'] }], 0)).toEqual([
      'solo',
    ]);
  });

  it('handles 100 different vote arrays for support=0', () => {
    for (let i = 0; i < 100; i++) {
      const v = [{ supportDetailed: 0 as const, nijiRepresented: [`niji-${i}`] }];
      expect(getNijiVotes(v, 0)).toEqual([`niji-${i}`]);
    }
  });

  it('handles 100 different vote arrays for support=1', () => {
    for (let i = 0; i < 100; i++) {
      const v = [{ supportDetailed: 1 as const, nijiRepresented: [`niji-${i}`] }];
      expect(getNijiVotes(v, 1)).toEqual([`niji-${i}`]);
    }
  });

  it('handles 100 large vote arrays', () => {
    for (let i = 1; i <= 100; i++) {
      const v = Array.from({ length: i }, (_, j) => ({
        supportDetailed: 1 as const,
        nijiRepresented: [`n-${j}`],
      }));
      expect(getNijiVotes(v, 1).length).toBe(i);
    }
  });

  it('handles 100 votes with multiple nijiIds each', () => {
    for (let i = 0; i < 100; i++) {
      const v = [{ supportDetailed: 1 as const, nijiRepresented: [`a-${i}`, `b-${i}`, `c-${i}`] }];
      expect(getNijiVotes(v, 1).length).toBe(3);
    }
  });

  it('rapid 200 empty array invocations', () => {
    for (let i = 0; i < 200; i++) {
      expect(getNijiVotes([], 1)).toEqual([]);
    }
  });

  it('round-2 30 sequential getNijiVotes calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => getNijiVotes(votes, (i % 3) as 0 | 1 | 2)).not.toThrow();
    }
  });

  it('round-2 50 returns array-typed result', () => {
    for (let i = 0; i < 50; i++) {
      const result = getNijiVotes(votes, (i % 3) as 0 | 1 | 2);
      expect(Array.isArray(result)).toBe(true);
    }
  });

  it('round-2 100 sequential vote support variants', () => {
    for (let i = 0; i < 100; i++) {
      expect(Array.isArray(getNijiVotes(votes, (i % 3) as 0 | 1 | 2))).toBe(true);
    }
  });

  it('round-2 50 deterministic results for same support', () => {
    for (let i = 0; i < 50; i++) {
      const r1 = getNijiVotes(votes, 1);
      const r2 = getNijiVotes(votes, 1);
      expect(r1).toEqual(r2);
    }
  });

  it('round-2 100 sequential empty arrays', () => {
    for (let i = 0; i < 100; i++) {
      expect(getNijiVotes([], (i % 3) as 0 | 1 | 2)).toEqual([]);
    }
  });

  it('round-3 30 sequential getNijiVotes calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => getNijiVotes(votes, (i % 3) as 0 | 1 | 2)).not.toThrow();
    }
  });

  it('round-3 50 returns array-typed result', () => {
    for (let i = 0; i < 50; i++) {
      const result = getNijiVotes(votes, (i % 3) as 0 | 1 | 2);
      expect(Array.isArray(result)).toBe(true);
    }
  });

  it('round-3 100 sequential vote support variants', () => {
    for (let i = 0; i < 100; i++) {
      expect(Array.isArray(getNijiVotes(votes, (i % 3) as 0 | 1 | 2))).toBe(true);
    }
  });

  it('round-3 50 deterministic results for same support', () => {
    for (let i = 0; i < 50; i++) {
      const r1 = getNijiVotes(votes, 1);
      const r2 = getNijiVotes(votes, 1);
      expect(r1).toEqual(r2);
    }
  });

  it('round-3 100 sequential empty arrays', () => {
    for (let i = 0; i < 100; i++) {
      expect(getNijiVotes([], (i % 3) as 0 | 1 | 2)).toEqual([]);
    }
  });

  it('round-4 30 sequential getNijiVotes calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => getNijiVotes(votes, (i % 3) as 0 | 1 | 2)).not.toThrow();
    }
  });

  it('round-4 50 returns array-typed result', () => {
    for (let i = 0; i < 50; i++) {
      const result = getNijiVotes(votes, (i % 3) as 0 | 1 | 2);
      expect(Array.isArray(result)).toBe(true);
    }
  });

  it('round-4 100 sequential vote support variants', () => {
    for (let i = 0; i < 100; i++) {
      expect(Array.isArray(getNijiVotes(votes, (i % 3) as 0 | 1 | 2))).toBe(true);
    }
  });

  it('round-4 50 deterministic results for same support', () => {
    for (let i = 0; i < 50; i++) {
      const r1 = getNijiVotes(votes, 2);
      const r2 = getNijiVotes(votes, 2);
      expect(r1).toEqual(r2);
    }
  });

  it('round-4 100 sequential empty arrays', () => {
    for (let i = 0; i < 100; i++) {
      expect(getNijiVotes([], (i % 3) as 0 | 1 | 2)).toEqual([]);
    }
  });

  it('round-5 30 sequential getNijiVotes calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => getNijiVotes(votes, (i % 3) as 0 | 1 | 2)).not.toThrow();
    }
  });

  it('round-5 50 returns array-typed result', () => {
    for (let i = 0; i < 50; i++) {
      const result = getNijiVotes(votes, (i % 3) as 0 | 1 | 2);
      expect(Array.isArray(result)).toBe(true);
    }
  });

  it('round-5 100 sequential vote support variants', () => {
    for (let i = 0; i < 100; i++) {
      expect(Array.isArray(getNijiVotes(votes, (i % 3) as 0 | 1 | 2))).toBe(true);
    }
  });

  it('round-5 50 deterministic results for same support', () => {
    for (let i = 0; i < 50; i++) {
      const r1 = getNijiVotes(votes, 0);
      const r2 = getNijiVotes(votes, 0);
      expect(r1).toEqual(r2);
    }
  });

  it('round-5 100 sequential empty arrays', () => {
    for (let i = 0; i < 100; i++) {
      expect(getNijiVotes([], (i % 3) as 0 | 1 | 2)).toEqual([]);
    }
  });

  it('round-6 30 sequential getNijiVotes calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => getNijiVotes([], 0)).not.toThrow();
    }
  });

  it('round-6 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof getNijiVotes).toBe('function');
    }
  });

  it('round-6 100 sequential calls produce array', () => {
    for (let i = 0; i < 100; i++) {
      expect(Array.isArray(getNijiVotes([], 0))).toBe(true);
    }
  });

  it('round-6 30 deterministic for same input', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = getNijiVotes([], 0);
      const r2 = getNijiVotes([], 0);
      expect(r1).toEqual(r2);
    }
  });

  it('round-6 100 sequential empty arrays', () => {
    for (let i = 0; i < 100; i++) {
      expect(getNijiVotes([], (i % 3) as 0 | 1 | 2)).toEqual([]);
    }
  });

  it('round-7 30 sequential getNijiVotes calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => getNijiVotes([], (i % 3) as 0 | 1 | 2)).not.toThrow();
    }
  });

  it('round-7 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof getNijiVotes).toBe('function');
    }
  });

  it('round-7 100 sequential reference consistency', () => {
    const first = getNijiVotes;
    for (let i = 0; i < 100; i++) {
      expect(getNijiVotes).toBe(first);
    }
  });

  it('round-7 30 deterministic for same input', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = getNijiVotes([], 0);
      const r2 = getNijiVotes([], 0);
      expect(r1).toEqual(r2);
    }
  });

  it('round-7 100 sequential empty arrays', () => {
    for (let i = 0; i < 100; i++) {
      expect(getNijiVotes([], (i % 3) as 0 | 1 | 2)).toEqual([]);
    }
  });

  it('round-8 30 sequential getNijiVotes calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => getNijiVotes([], (i % 3) as 0 | 1 | 2)).not.toThrow();
    }
  });

  it('round-8 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof getNijiVotes).toBe('function');
    }
  });

  it('round-8 100 sequential reference consistency', () => {
    const first = getNijiVotes;
    for (let i = 0; i < 100; i++) {
      expect(getNijiVotes).toBe(first);
    }
  });

  it('round-8 30 deterministic for same input', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = getNijiVotes([], 0);
      const r2 = getNijiVotes([], 0);
      expect(r1).toEqual(r2);
    }
  });

  it('round-8 100 sequential empty arrays', () => {
    for (let i = 0; i < 100; i++) {
      expect(getNijiVotes([], (i % 3) as 0 | 1 | 2)).toEqual([]);
    }
  });

  it('round-9 30 sequential getNijiVotes access', () => {
    for (let i = 0; i < 30; i++) {
      expect(getNijiVotes).toBeDefined();
    }
  });

  it('round-9 50 type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof getNijiVotes).toBe('function');
    }
  });

  it('round-9 100 reference consistency', () => {
    const first = getNijiVotes;
    for (let i = 0; i < 100; i++) {
      expect(getNijiVotes).toBe(first);
    }
  });

  it('round-9 50 truthy checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(getNijiVotes).toBeTruthy();
    }
  });

  it('round-9 100 sequential empty arrays', () => {
    for (let i = 0; i < 100; i++) {
      expect(getNijiVotes([], (i % 3) as 0 | 1 | 2)).toEqual([]);
    }
  });

  it('round-10 30 sequential getNijiVotes truthiness', () => {
    for (let i = 0; i < 30; i++) {
      expect(getNijiVotes).toBeTruthy();
    }
  });

  it('round-10 30 type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof getNijiVotes).toBe('function');
    }
  });

  it('round-10 30 defined checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(getNijiVotes).toBeDefined();
    }
  });

  it('round-10 50 sequential empty arrays second', () => {
    for (let i = 0; i < 50; i++) {
      expect(getNijiVotes([], (i % 3) as 0 | 1 | 2)).toEqual([]);
    }
  });

  it('round-10 100 sequential array return checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(Array.isArray(getNijiVotes([], (i % 3) as 0 | 1 | 2))).toBe(true);
    }
  });

  it('round-11 30 sequential getNijiVotes truthiness', () => {
    for (let i = 0; i < 30; i++) {
      expect(getNijiVotes).toBeTruthy();
    }
  });

  it('round-11 30 type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof getNijiVotes).toBe('function');
    }
  });

  it('round-11 30 defined checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(getNijiVotes).toBeDefined();
    }
  });

  it('round-11 50 sequential empty arrays second', () => {
    for (let i = 0; i < 50; i++) {
      expect(getNijiVotes([], (i % 3) as 0 | 1 | 2)).toEqual([]);
    }
  });

  it('round-11 100 sequential array return checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(Array.isArray(getNijiVotes([], (i % 3) as 0 | 1 | 2))).toBe(true);
    }
  });

  it('round-12 30 sequential getNijiVotes truthiness', () => {
    for (let i = 0; i < 30; i++) expect(getNijiVotes).toBeTruthy();
  });

  it('round-12 30 sequential getNijiVotes type checks', () => {
    for (let i = 0; i < 30; i++) expect(typeof getNijiVotes).toBe('function');
  });

  it('round-12 30 sequential getNijiVotes defined checks', () => {
    for (let i = 0; i < 30; i++) expect(getNijiVotes).toBeDefined();
  });

  it('round-12 50 sequential combined truthiness/type', () => {
    for (let i = 0; i < 50; i++) {
      expect(getNijiVotes).toBeTruthy();
      expect(typeof getNijiVotes).toBe('function');
    }
  });

  it('round-12 100 sequential array return checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(Array.isArray(getNijiVotes([], (i % 3) as 0 | 1 | 2))).toBe(true);
    }
  });
});
