import { describe, expect, it } from 'vitest';

import { countDecimals } from './numberUtils';

describe('countDecimals', () => {
  it('returns 0 for integer', () => {
    expect(countDecimals(5)).toBe(0);
    expect(countDecimals(0)).toBe(0);
    expect(countDecimals(-42)).toBe(0);
  });

  it('returns 0 for whole number with decimal point (.0)', () => {
    expect(countDecimals(5.0)).toBe(0);
  });

  it('returns 1 for single decimal', () => {
    expect(countDecimals(5.5)).toBe(1);
    expect(countDecimals(0.1)).toBe(1);
  });

  it('returns 2 for two decimals', () => {
    expect(countDecimals(5.55)).toBe(2);
    expect(countDecimals(0.01)).toBe(2);
  });

  it('returns multiple decimals correctly', () => {
    expect(countDecimals(3.14159)).toBe(5);
    expect(countDecimals(0.123456)).toBe(6);
  });

  it('handles negative decimals', () => {
    expect(countDecimals(-5.5)).toBe(1);
    expect(countDecimals(-3.14)).toBe(2);
  });
});
