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

  it('handles timestamp 0 (genesis edge)', () => {
    const a = makeBid(0n, 0);
    const b = makeBid(0n, 1);
    expect(compareBids(a, b)).toBeGreaterThan(0);
  });

  it('handles very large timestamp (year 2200+)', () => {
    const a = makeBid(7_258_118_400n, 0); // ~2200-01-01
    const b = makeBid(7_258_118_401n, 0);
    expect(compareBids(a, b)).toBeGreaterThan(0);
  });

  it('large transactionIndex within block does not overflow timestamp bucket', () => {
    // multiplier 1_000_000、 transactionIndex 999_999 で boundary
    const a = makeBid(1000n, 999_999);
    const b = makeBid(1001n, 0);
    // a = 1000 * 1e6 + 999999 = 1_000_999_999
    // b = 1001 * 1e6 = 1_001_000_000
    expect(compareBids(a, b)).toBeGreaterThan(0);
  });

  it('sorts array using compareBids (descending chronologically)', () => {
    const bids: Bid[] = [makeBid(2000n, 0), makeBid(1000n, 0), makeBid(3000n, 0)];
    const sorted = [...bids].sort(compareBids);
    expect(sorted[0].timestamp).toBe(3000n);
    expect(sorted[1].timestamp).toBe(2000n);
    expect(sorted[2].timestamp).toBe(1000n);
  });

  it('transactionIndex 0 with different timestamps still correctly orders', () => {
    const a = makeBid(500n, 0);
    const b = makeBid(600n, 0);
    expect(compareBids(a, b)).toBeGreaterThan(0);
  });

  it('preserves order in stable scenarios (same timestamp/index = 0 return)', () => {
    const a = makeBid(1234n, 42);
    const b = makeBid(1234n, 42);
    const result = compareBids(a, b);
    expect(result).toBe(0);
    // 0 result は sort 安定性に依存 (Array.prototype.sort は ES2019 で stable)
    const arr = [a, b];
    const sorted = [...arr].sort(compareBids);
    expect(sorted[0]).toBe(a);
    expect(sorted[1]).toBe(b);
  });
});
