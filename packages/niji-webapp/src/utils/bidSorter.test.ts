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
});
