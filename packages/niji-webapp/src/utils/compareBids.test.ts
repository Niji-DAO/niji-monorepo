import { describe, expect, it } from 'vitest';

import { compareBids } from './compareBids';
import { Bid } from './types';

const makeBid = (timestamp: number, transactionIndex: number): Bid =>
  ({
    timestamp,
    transactionIndex,
  }) as unknown as Bid;

describe('compareBids', () => {
  it('places newer timestamps first', () => {
    const older = makeBid(100, 0);
    const newer = makeBid(200, 0);
    expect(compareBids(newer, older)).toBeLessThan(0);
    expect(compareBids(older, newer)).toBeGreaterThan(0);
  });

  it('orders by transactionIndex when timestamp matches (later first)', () => {
    const earlyTx = makeBid(100, 1);
    const lateTx = makeBid(100, 5);
    expect(compareBids(lateTx, earlyTx)).toBeLessThan(0);
    expect(compareBids(earlyTx, lateTx)).toBeGreaterThan(0);
  });

  it('returns 0 when timestamp and transactionIndex both match', () => {
    const a = makeBid(100, 3);
    const b = makeBid(100, 3);
    expect(compareBids(a, b)).toBe(0);
  });

  it('handles large timestamps without losing precision', () => {
    const a = makeBid(1_700_000_000, 0);
    const b = makeBid(1_700_000_001, 0);
    expect(compareBids(b, a)).toBeLessThan(0);
    expect(compareBids(a, b)).toBeGreaterThan(0);
  });
});
