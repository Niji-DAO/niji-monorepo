import { describe, expect, it } from 'vitest';

import { AVERAGE_BLOCK_TIME_IN_SECS } from './constants';

describe('constants', () => {
  it('exports AVERAGE_BLOCK_TIME_IN_SECS as 12', () => {
    expect(AVERAGE_BLOCK_TIME_IN_SECS).toBe(12);
  });

  it('AVERAGE_BLOCK_TIME_IN_SECS is a number type', () => {
    expect(typeof AVERAGE_BLOCK_TIME_IN_SECS).toBe('number');
  });

  it('AVERAGE_BLOCK_TIME_IN_SECS is integer (no decimals)', () => {
    expect(Math.floor(AVERAGE_BLOCK_TIME_IN_SECS)).toBe(AVERAGE_BLOCK_TIME_IN_SECS);
    expect(Number.isInteger(AVERAGE_BLOCK_TIME_IN_SECS)).toBe(true);
  });

  it('AVERAGE_BLOCK_TIME_IN_SECS is positive', () => {
    expect(AVERAGE_BLOCK_TIME_IN_SECS).toBeGreaterThan(0);
  });

  it('AVERAGE_BLOCK_TIME_IN_SECS reflects Ethereum post-merge ~12 sec slot time', () => {
    // Ethereum mainnet PoS slot は 12 秒、 history-consistent な仕様 pin
    expect(AVERAGE_BLOCK_TIME_IN_SECS).toBeGreaterThanOrEqual(12);
    expect(AVERAGE_BLOCK_TIME_IN_SECS).toBeLessThanOrEqual(15);
  });

  it('AVERAGE_BLOCK_TIME_IN_SECS is immutable (re-import returns same value)', async () => {
    const reimported = await import('./constants');
    expect(reimported.AVERAGE_BLOCK_TIME_IN_SECS).toBe(AVERAGE_BLOCK_TIME_IN_SECS);
  });
});
