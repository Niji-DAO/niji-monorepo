import { describe, expect, it } from 'vitest';

import { IBid } from '@/wrappers/subgraph';

import { compareBidsChronologically } from './bidSorter';

const makeBid = (blockTimestamp: number, txIndex: number | undefined = 0): IBid =>
  ({
    blockTimestamp,
    txIndex,
  }) as unknown as IBid;

describe('compareBidsChronologically', () => {
  it('orders later block timestamps first (descending)', () => {
    const older = makeBid(1_000);
    const newer = makeBid(2_000);
    expect(compareBidsChronologically(newer, older)).toBeLessThan(0);
    expect(compareBidsChronologically(older, newer)).toBeGreaterThan(0);
  });

  it('breaks ties using txIndex (later txIndex first)', () => {
    const earlyTx = makeBid(1_000, 1);
    const lateTx = makeBid(1_000, 5);
    expect(compareBidsChronologically(lateTx, earlyTx)).toBeLessThan(0);
    expect(compareBidsChronologically(earlyTx, lateTx)).toBeGreaterThan(0);
  });

  it('returns 0 for identical timestamp and txIndex', () => {
    const a = makeBid(1_000, 3);
    const b = makeBid(1_000, 3);
    expect(compareBidsChronologically(a, b)).toBe(0);
  });

  it('treats missing txIndex as 0', () => {
    const withIndex = makeBid(1_000, 1);
    const withoutIndex = makeBid(1_000, undefined);
    expect(compareBidsChronologically(withIndex, withoutIndex)).toBeLessThan(0);
  });
});
