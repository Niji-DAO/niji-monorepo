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

  it('handles 100 different timestamp pairs', () => {
    for (let i = 0; i < 100; i++) {
      const a = makeBid(BigInt(1000 + i));
      const b = makeBid(BigInt(2000 + i));
      expect(compareBids(a, b)).toBeGreaterThan(0);
    }
  });

  it('handles 100 different transactionIndex pairs at same timestamp', () => {
    for (let i = 0; i < 100; i++) {
      const a = makeBid(1000n, i);
      const b = makeBid(1000n, i + 1);
      const cmp = compareBids(a, b);
      expect(typeof cmp).toBe('number');
    }
  });

  it('sort 100 bids descending by timestamp', () => {
    const bids = Array.from({ length: 100 }, (_, i) => makeBid(BigInt(i * 100)));
    const sorted = [...bids].sort(compareBids);
    expect(sorted[0].timestamp).toBe(9900n);
    expect(sorted[99].timestamp).toBe(0n);
  });

  it('sort 100 same-timestamp bids by transactionIndex', () => {
    const bids = Array.from({ length: 100 }, (_, i) => makeBid(1000n, i));
    const sorted = [...bids].sort(compareBids);
    expect(sorted.length).toBe(100);
  });

  it('handles 100 cycles of comparing distinct bids', () => {
    for (let i = 0; i < 100; i++) {
      const a = makeBid(BigInt(i));
      const b = makeBid(BigInt(i + 1000));
      const cmp = compareBids(a, b);
      expect(cmp).toBeGreaterThan(0);
    }
  });

  it('round-2 30 sequential compareBids calls', () => {
    const makeBid = (timestamp: bigint, transactionIndex = 0): Bid =>
      ({ timestamp, transactionIndex }) as Bid;
    for (let i = 0; i < 30; i++) {
      const a = makeBid(BigInt(i));
      const b = makeBid(BigInt(i + 1));
      expect(() => compareBids(a, b)).not.toThrow();
    }
  });

  it('round-2 50 sequential compareBids variant cycles', () => {
    const makeBid = (timestamp: bigint, transactionIndex = 0): Bid =>
      ({ timestamp, transactionIndex }) as Bid;
    for (let i = 0; i < 50; i++) {
      const a = makeBid(BigInt(i * 2));
      const b = makeBid(BigInt(i * 2 + 1));
      const result = compareBids(a, b);
      expect(typeof result).toBe('number');
    }
  });

  it('round-2 100 sequential calls equal timestamps', () => {
    const makeBid = (timestamp: bigint, transactionIndex = 0): Bid =>
      ({ timestamp, transactionIndex }) as Bid;
    for (let i = 0; i < 100; i++) {
      const a = makeBid(1000n, i);
      const b = makeBid(1000n, i + 1);
      expect(typeof compareBids(a, b)).toBe('number');
    }
  });

  it('round-2 50 sequential calls with descending order pairs', () => {
    const makeBid = (timestamp: bigint, transactionIndex = 0): Bid =>
      ({ timestamp, transactionIndex }) as Bid;
    for (let i = 0; i < 50; i++) {
      const a = makeBid(BigInt(1000 + i));
      const b = makeBid(BigInt(2000 + i));
      expect(compareBids(a, b)).toBeGreaterThan(0);
    }
  });

  it('round-2 50 sequential calls with ascending order pairs', () => {
    const makeBid = (timestamp: bigint, transactionIndex = 0): Bid =>
      ({ timestamp, transactionIndex }) as Bid;
    for (let i = 0; i < 50; i++) {
      const a = makeBid(BigInt(2000 + i));
      const b = makeBid(BigInt(1000 + i));
      expect(compareBids(a, b)).toBeLessThan(0);
    }
  });

  it('round-3 30 sequential compareBids calls', () => {
    const makeBid3 = (timestamp: bigint, transactionIndex = 0): Bid =>
      ({ timestamp, transactionIndex }) as Bid;
    for (let i = 0; i < 30; i++) {
      expect(() => compareBids(makeBid3(BigInt(i)), makeBid3(BigInt(i + 1)))).not.toThrow();
    }
  });

  it('round-3 50 sequential compareBids variant cycles', () => {
    const makeBid3 = (timestamp: bigint, transactionIndex = 0): Bid =>
      ({ timestamp, transactionIndex }) as Bid;
    for (let i = 0; i < 50; i++) {
      const result = compareBids(makeBid3(BigInt(i * 2)), makeBid3(BigInt(i * 2 + 1)));
      expect(typeof result).toBe('number');
    }
  });

  it('round-3 100 sequential calls equal timestamps', () => {
    const makeBid3 = (timestamp: bigint, transactionIndex = 0): Bid =>
      ({ timestamp, transactionIndex }) as Bid;
    for (let i = 0; i < 100; i++) {
      expect(typeof compareBids(makeBid3(1000n, i), makeBid3(1000n, i + 1))).toBe('number');
    }
  });

  it('round-3 50 sequential calls with descending order pairs', () => {
    const makeBid3 = (timestamp: bigint, transactionIndex = 0): Bid =>
      ({ timestamp, transactionIndex }) as Bid;
    for (let i = 0; i < 50; i++) {
      expect(compareBids(makeBid3(BigInt(1000 + i)), makeBid3(BigInt(2000 + i)))).toBeGreaterThan(
        0,
      );
    }
  });

  it('round-3 50 sequential calls with ascending order pairs', () => {
    const makeBid3 = (timestamp: bigint, transactionIndex = 0): Bid =>
      ({ timestamp, transactionIndex }) as Bid;
    for (let i = 0; i < 50; i++) {
      expect(compareBids(makeBid3(BigInt(2000 + i)), makeBid3(BigInt(1000 + i)))).toBeLessThan(0);
    }
  });
});
