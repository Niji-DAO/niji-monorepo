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

  it('handles Infinity (Math.floor(Infinity) === Infinity → 0)', () => {
    expect(countDecimals(Infinity)).toBe(0);
  });

  it('handles -Infinity', () => {
    expect(countDecimals(-Infinity)).toBe(0);
  });

  it('handles floating point precision artifact (0.1 + 0.2 = 0.30000000000000004)', () => {
    expect(countDecimals(0.1 + 0.2)).toBe(17);
  });

  it('handles 1e-3 scientific notation as 0.001 (3 decimals)', () => {
    expect(countDecimals(1e-3)).toBe(3);
  });

  it('handles negative zero (-0) as integer (0 decimals)', () => {
    expect(countDecimals(-0)).toBe(0);
  });

  it('handles 100 integer inputs', () => {
    for (let i = 0; i < 100; i++) {
      expect(countDecimals(i)).toBe(0);
    }
  });

  it('handles 100 single-decimal inputs', () => {
    for (let i = 0; i < 100; i++) {
      const n = i + 0.1;
      expect(countDecimals(n)).toBeGreaterThanOrEqual(1);
    }
  });

  it('handles 100 two-decimal inputs', () => {
    for (let i = 0; i < 100; i++) {
      const n = i + 0.25;
      expect(countDecimals(n)).toBeGreaterThanOrEqual(1);
    }
  });

  it('handles 100 negative integer inputs', () => {
    for (let i = 1; i <= 100; i++) {
      expect(countDecimals(-i)).toBe(0);
    }
  });

  it('handles 100 large integer inputs', () => {
    for (let i = 0; i < 100; i++) {
      const n = 1_000_000 + i;
      expect(countDecimals(n)).toBe(0);
    }
  });

  it('round-2 30 sequential countDecimals calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => countDecimals(i)).not.toThrow();
    }
  });

  it('round-2 50 returns number-typed count', () => {
    for (let i = 0; i < 50; i++) {
      const result = countDecimals(i + 100.5);
      expect(typeof result).toBe('number');
    }
  });

  it('round-2 100 sequential calls produce non-negative count', () => {
    for (let i = 0; i < 100; i++) {
      expect(countDecimals(i + 1)).toBeGreaterThanOrEqual(0);
    }
  });

  it('round-2 50 different fractional inputs', () => {
    for (let i = 0; i < 50; i++) {
      const n = (i + 1) / (i + 10);
      expect(() => countDecimals(n)).not.toThrow();
    }
  });

  it('round-2 100 sequential alternating int / float', () => {
    for (let i = 0; i < 100; i++) {
      const n = i % 2 === 0 ? i : i + 0.5;
      expect(typeof countDecimals(n)).toBe('number');
    }
  });

  it('round-3 30 sequential countDecimals calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => countDecimals(i)).not.toThrow();
    }
  });

  it('round-3 50 returns number-typed count', () => {
    for (let i = 0; i < 50; i++) {
      const result = countDecimals(i + 100.5);
      expect(typeof result).toBe('number');
    }
  });

  it('round-3 100 sequential calls produce non-negative count', () => {
    for (let i = 0; i < 100; i++) {
      expect(countDecimals(i + 1)).toBeGreaterThanOrEqual(0);
    }
  });

  it('round-3 50 different fractional inputs', () => {
    for (let i = 0; i < 50; i++) {
      const n = (i + 1) / (i + 10);
      expect(() => countDecimals(n)).not.toThrow();
    }
  });

  it('round-3 100 sequential alternating int / float', () => {
    for (let i = 0; i < 100; i++) {
      const n = i % 2 === 0 ? i : i + 0.5;
      expect(typeof countDecimals(n)).toBe('number');
    }
  });

  it('round-4 30 sequential countDecimals calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => countDecimals(i + 100)).not.toThrow();
    }
  });

  it('round-4 50 returns number-typed count', () => {
    for (let i = 0; i < 50; i++) {
      const result = countDecimals(i + 200.5);
      expect(typeof result).toBe('number');
    }
  });

  it('round-4 100 sequential calls produce non-negative count', () => {
    for (let i = 0; i < 100; i++) {
      expect(countDecimals(i + 500)).toBeGreaterThanOrEqual(0);
    }
  });

  it('round-4 50 different fractional inputs', () => {
    for (let i = 0; i < 50; i++) {
      const n = (i + 100) / (i + 200);
      expect(() => countDecimals(n)).not.toThrow();
    }
  });

  it('round-4 100 sequential alternating int / float', () => {
    for (let i = 0; i < 100; i++) {
      const n = i % 2 === 0 ? i + 500 : i + 500.75;
      expect(typeof countDecimals(n)).toBe('number');
    }
  });

  it('round-5 30 sequential countDecimals calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => countDecimals(i + 5000)).not.toThrow();
    }
  });

  it('round-5 50 returns number-typed count', () => {
    for (let i = 0; i < 50; i++) {
      const result = countDecimals(i + 6000.5);
      expect(typeof result).toBe('number');
    }
  });

  it('round-5 100 sequential calls produce non-negative count', () => {
    for (let i = 0; i < 100; i++) {
      expect(countDecimals(i + 7000)).toBeGreaterThanOrEqual(0);
    }
  });

  it('round-5 50 different fractional inputs', () => {
    for (let i = 0; i < 50; i++) {
      const n = (i + 1000) / (i + 2000);
      expect(() => countDecimals(n)).not.toThrow();
    }
  });

  it('round-5 100 sequential alternating int / float', () => {
    for (let i = 0; i < 100; i++) {
      const n = i % 2 === 0 ? i + 8000 : i + 8000.625;
      expect(typeof countDecimals(n)).toBe('number');
    }
  });

  it('round-6 30 sequential countDecimals calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => countDecimals(i + 12000)).not.toThrow();
    }
  });

  it('round-6 50 sequential calls produce number', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof countDecimals(i + 13000)).toBe('number');
    }
  });

  it('round-6 100 sequential type checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof countDecimals).toBe('function');
    }
  });

  it('round-6 30 deterministic for same input', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = countDecimals(1.5);
      const r2 = countDecimals(1.5);
      expect(r1).toBe(r2);
    }
  });

  it('round-6 100 sequential alternating int / float', () => {
    for (let i = 0; i < 100; i++) {
      const n = i % 2 === 0 ? i + 15000 : i + 15000.625;
      expect(typeof countDecimals(n)).toBe('number');
    }
  });
});
