import type { Bid } from './types';

import { describe, expect, it } from 'vitest';

import { compareBids } from './compareBids';

describe('compareBids', () => {
  const makeBid = (timestamp: bigint, transactionIndex = 0): Bid =>
    ({
      timestamp,
      transactionIndex,
    }) as Bid;

  it('returns positive when b is newer than a (descending sort)', () => {
    const a = makeBid(1000n);
    const b = makeBid(2000n);
    expect(compareBids(a, b)).toBeGreaterThan(0);
  });

  it('returns negative when a is newer than b', () => {
    const a = makeBid(2000n);
    const b = makeBid(1000n);
    expect(compareBids(a, b)).toBeLessThan(0);
  });

  it('returns 0 for identical scores', () => {
    const a = makeBid(1000n, 0);
    const b = makeBid(1000n, 0);
    expect(compareBids(a, b)).toBe(0);
  });

  it('uses transactionIndex as tiebreaker', () => {
    const a = makeBid(1000n, 1);
    const b = makeBid(1000n, 3);
    expect(compareBids(a, b)).toBeGreaterThan(0); // b higher index = newer
  });
});
