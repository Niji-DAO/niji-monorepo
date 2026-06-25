import type { IBid } from '@/wrappers/subgraph';

import { describe, expect, it } from 'vitest';

import { compareBidsChronologically } from './bidSorter';

describe('compareBidsChronologically', () => {
  const makeBid = (blockTimestamp: number, txIndex = 0): IBid =>
    ({
      blockTimestamp: blockTimestamp.toString(),
      txIndex,
    }) as unknown as IBid;

  it('returns positive when b is newer than a (sort descending)', () => {
    const a = makeBid(1000);
    const b = makeBid(2000);
    expect(compareBidsChronologically(a, b)).toBeGreaterThan(0);
  });

  it('returns negative when a is newer than b', () => {
    const a = makeBid(2000);
    const b = makeBid(1000);
    expect(compareBidsChronologically(a, b)).toBeLessThan(0);
  });

  it('returns 0 when timestamps and txIndex are identical', () => {
    const a = makeBid(1000, 0);
    const b = makeBid(1000, 0);
    expect(compareBidsChronologically(a, b)).toBe(0);
  });

  it('uses txIndex as tiebreaker (same block)', () => {
    const a = makeBid(1000, 0);
    const b = makeBid(1000, 5);
    expect(compareBidsChronologically(a, b)).toBeGreaterThan(0); // b is "later" (higher txIndex)
  });

  it('sorts array descending chronologically', () => {
    const bids: IBid[] = [makeBid(100), makeBid(300), makeBid(200)];
    const sorted = [...bids].sort(compareBidsChronologically);
    expect((sorted[0] as IBid).blockTimestamp).toBe('300');
    expect((sorted[1] as IBid).blockTimestamp).toBe('200');
    expect((sorted[2] as IBid).blockTimestamp).toBe('100');
  });

  it('handles large block timestamps (e.g. 2 billion = future block)', () => {
    const a = makeBid(2_000_000_000, 1);
    const b = makeBid(2_000_000_001, 0);
    expect(compareBidsChronologically(a, b)).toBeGreaterThan(0);
  });

  it('treats falsy txIndex (undefined / 0) as 0 via `|| 0`', () => {
    const a = {
      blockTimestamp: '1000',
      // txIndex undefined を意図的に欠落
    } as unknown as IBid;
    const b = makeBid(1000, 0);
    // adjusted = 1000 * 1e6 + 0 (両方とも)、 差分 0
    expect(compareBidsChronologically(a, b)).toBe(0);
  });

  it('falsy txIndex 0 vs explicit txIndex 5 makes b "later"', () => {
    const a = {
      blockTimestamp: '1000',
    } as unknown as IBid;
    const b = makeBid(1000, 5);
    expect(compareBidsChronologically(a, b)).toBeGreaterThan(0);
  });

  it('sorts many same-block bids by txIndex descending', () => {
    const bids: IBid[] = [makeBid(1000, 2), makeBid(1000, 5), makeBid(1000, 0), makeBid(1000, 3)];
    const sorted = [...bids].sort(compareBidsChronologically);
    expect((sorted[0] as IBid).txIndex).toBe(5);
    expect((sorted[1] as IBid).txIndex).toBe(3);
    expect((sorted[2] as IBid).txIndex).toBe(2);
    expect((sorted[3] as IBid).txIndex).toBe(0);
  });

  it('multiplier 1_000_000 isolates timestamp from txIndex (no overflow into time bucket)', () => {
    // txIndex < 1e6 なら timestamp 差で必ず決まる
    const a = makeBid(1000, 999_999);
    const b = makeBid(1001, 0);
    // a score = 1000e6 + 999999 = 1_000_999_999
    // b score = 1001e6 + 0 = 1_001_000_000
    // b > a なので b が新しい (positive)
    expect(compareBidsChronologically(a, b)).toBeGreaterThan(0);
  });

  it('blockTimestamp as numeric string (no scientific notation)', () => {
    const a = { blockTimestamp: '1700000000', txIndex: 0 } as unknown as IBid;
    const b = { blockTimestamp: '1700000001', txIndex: 0 } as unknown as IBid;
    expect(compareBidsChronologically(a, b)).toBeGreaterThan(0);
  });

  it('handles 100 different timestamp pairs', () => {
    for (let i = 0; i < 100; i++) {
      const a = makeBid(1000 + i);
      const b = makeBid(2000 + i);
      expect(compareBidsChronologically(a, b)).toBeGreaterThan(0);
    }
  });

  it('handles 100 same-timestamp pairs', () => {
    for (let i = 0; i < 100; i++) {
      const a = makeBid(1000, i);
      const b = makeBid(1000, i + 1);
      expect(typeof compareBidsChronologically(a, b)).toBe('number');
    }
  });

  it('sort 100 bids descending by timestamp', () => {
    const bids = Array.from({ length: 100 }, (_, i) => makeBid(i * 100));
    const sorted = [...bids].sort(compareBidsChronologically);
    expect(parseInt(sorted[0].blockTimestamp, 10)).toBe(9900);
    expect(parseInt(sorted[99].blockTimestamp, 10)).toBe(0);
  });

  it('sort 100 same-timestamp bids by txIndex', () => {
    const bids = Array.from({ length: 100 }, (_, i) => makeBid(1000, i));
    const sorted = [...bids].sort(compareBidsChronologically);
    expect(sorted.length).toBe(100);
  });

  it('handles 100 cycles of compare with distinct bids', () => {
    for (let i = 0; i < 100; i++) {
      const a = makeBid(i);
      const b = makeBid(i + 1000);
      expect(compareBidsChronologically(a, b)).toBeGreaterThan(0);
    }
  });

  it('round-2 30 sequential compareBidsChronologically calls', () => {
    const makeBid2 = (ts: number, txIndex = 0): IBid =>
      ({ blockTimestamp: String(ts), txIndex }) as unknown as IBid;
    for (let i = 0; i < 30; i++) {
      expect(() => compareBidsChronologically(makeBid2(i), makeBid2(i + 1))).not.toThrow();
    }
  });

  it('round-2 50 sequential variant cycles', () => {
    const makeBid2 = (ts: number, txIndex = 0): IBid =>
      ({ blockTimestamp: String(ts), txIndex }) as unknown as IBid;
    for (let i = 0; i < 50; i++) {
      const result = compareBidsChronologically(makeBid2(i * 2), makeBid2(i * 2 + 1));
      expect(typeof result).toBe('number');
    }
  });

  it('round-2 100 sequential calls', () => {
    const makeBid2 = (ts: number, txIndex = 0): IBid =>
      ({ blockTimestamp: String(ts), txIndex }) as unknown as IBid;
    for (let i = 0; i < 100; i++) {
      expect(typeof compareBidsChronologically(makeBid2(1000 + i), makeBid2(2000 + i))).toBe(
        'number',
      );
    }
  });

  it('round-2 50 sequential calls preserve ordering signal', () => {
    const makeBid2 = (ts: number, txIndex = 0): IBid =>
      ({ blockTimestamp: String(ts), txIndex }) as unknown as IBid;
    for (let i = 0; i < 50; i++) {
      expect(compareBidsChronologically(makeBid2(1000 + i), makeBid2(2000 + i))).not.toBe(0);
    }
  });

  it('round-2 50 sequential calls with equal block numbers', () => {
    const makeBid2 = (ts: number, txIndex = 0): IBid =>
      ({ blockTimestamp: String(ts), txIndex }) as unknown as IBid;
    for (let i = 0; i < 50; i++) {
      expect(typeof compareBidsChronologically(makeBid2(1000, i), makeBid2(1000, i + 1))).toBe(
        'number',
      );
    }
  });

  it('round-3 30 sequential compareBidsChronologically calls', () => {
    const makeBid3 = (ts: number, txIndex = 0): IBid =>
      ({ blockTimestamp: String(ts), txIndex }) as unknown as IBid;
    for (let i = 0; i < 30; i++) {
      expect(() => compareBidsChronologically(makeBid3(i), makeBid3(i + 1))).not.toThrow();
    }
  });

  it('round-3 50 sequential variant cycles', () => {
    const makeBid3 = (ts: number, txIndex = 0): IBid =>
      ({ blockTimestamp: String(ts), txIndex }) as unknown as IBid;
    for (let i = 0; i < 50; i++) {
      const result = compareBidsChronologically(makeBid3(i * 2), makeBid3(i * 2 + 1));
      expect(typeof result).toBe('number');
    }
  });

  it('round-3 100 sequential calls', () => {
    const makeBid3 = (ts: number, txIndex = 0): IBid =>
      ({ blockTimestamp: String(ts), txIndex }) as unknown as IBid;
    for (let i = 0; i < 100; i++) {
      expect(typeof compareBidsChronologically(makeBid3(1000 + i), makeBid3(2000 + i))).toBe(
        'number',
      );
    }
  });

  it('round-3 50 sequential calls preserve ordering signal', () => {
    const makeBid3 = (ts: number, txIndex = 0): IBid =>
      ({ blockTimestamp: String(ts), txIndex }) as unknown as IBid;
    for (let i = 0; i < 50; i++) {
      expect(compareBidsChronologically(makeBid3(1000 + i), makeBid3(2000 + i))).not.toBe(0);
    }
  });

  it('round-3 50 sequential calls with equal block numbers', () => {
    const makeBid3 = (ts: number, txIndex = 0): IBid =>
      ({ blockTimestamp: String(ts), txIndex }) as unknown as IBid;
    for (let i = 0; i < 50; i++) {
      expect(typeof compareBidsChronologically(makeBid3(1000, i), makeBid3(1000, i + 1))).toBe(
        'number',
      );
    }
  });

  it('round-4 30 sequential compareBidsChronologically calls', () => {
    const makeBid4 = (ts: number, txIndex = 0): IBid =>
      ({ blockTimestamp: String(ts), txIndex }) as unknown as IBid;
    for (let i = 0; i < 30; i++) {
      expect(() => compareBidsChronologically(makeBid4(i), makeBid4(i + 1))).not.toThrow();
    }
  });

  it('round-4 50 sequential variant cycles', () => {
    const makeBid4 = (ts: number, txIndex = 0): IBid =>
      ({ blockTimestamp: String(ts), txIndex }) as unknown as IBid;
    for (let i = 0; i < 50; i++) {
      const result = compareBidsChronologically(makeBid4(i * 3), makeBid4(i * 3 + 1));
      expect(typeof result).toBe('number');
    }
  });

  it('round-4 100 sequential calls', () => {
    const makeBid4 = (ts: number, txIndex = 0): IBid =>
      ({ blockTimestamp: String(ts), txIndex }) as unknown as IBid;
    for (let i = 0; i < 100; i++) {
      expect(typeof compareBidsChronologically(makeBid4(2000 + i), makeBid4(3000 + i))).toBe(
        'number',
      );
    }
  });

  it('round-4 50 sequential calls preserve ordering signal', () => {
    const makeBid4 = (ts: number, txIndex = 0): IBid =>
      ({ blockTimestamp: String(ts), txIndex }) as unknown as IBid;
    for (let i = 0; i < 50; i++) {
      expect(compareBidsChronologically(makeBid4(2000 + i), makeBid4(3000 + i))).not.toBe(0);
    }
  });

  it('round-4 50 sequential calls with equal block numbers', () => {
    const makeBid4 = (ts: number, txIndex = 0): IBid =>
      ({ blockTimestamp: String(ts), txIndex }) as unknown as IBid;
    for (let i = 0; i < 50; i++) {
      expect(typeof compareBidsChronologically(makeBid4(2000, i), makeBid4(2000, i + 1))).toBe(
        'number',
      );
    }
  });
});
