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

  it('handles 3 decimals (1.001)', () => {
    expect(countDecimals(1.001)).toBe(3);
  });

  it('handles 4 decimals (0.0001)', () => {
    expect(countDecimals(0.0001)).toBe(4);
  });

  it('handles very small decimal value', () => {
    expect(countDecimals(0.000001)).toBe(6);
  });

  it('treats 5.10 as 1 decimal (trailing 0 dropped by Number)', () => {
    expect(countDecimals(5.1)).toBe(1);
  });

  it('handles scientific notation as integer when result is whole', () => {
    expect(countDecimals(1e2)).toBe(0);
  });

  it('handles MAX_SAFE_INTEGER as 0 decimals', () => {
    expect(countDecimals(Number.MAX_SAFE_INTEGER)).toBe(0);
  });
});
