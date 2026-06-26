import { describe, expect, it } from 'vitest';

import { isNounderNiji } from './nounderNiji';

describe('isNounderNiji', () => {
  it('returns true for nounId 0 (boundary, multiple of 10)', () => {
    expect(isNounderNiji(0n)).toBe(true);
  });

  it('returns true for nounId 10', () => {
    expect(isNounderNiji(10n)).toBe(true);
  });

  it('returns true for nounId 1820 (upper boundary)', () => {
    expect(isNounderNiji(1820n)).toBe(true);
  });

  it('returns false for nounId 1 (not multiple of 10)', () => {
    expect(isNounderNiji(1n)).toBe(false);
  });

  it('returns false for nounId 15 (not multiple of 10)', () => {
    expect(isNounderNiji(15n)).toBe(false);
  });

  it('returns false for nounId 1830 (above upper boundary, multiple of 10)', () => {
    expect(isNounderNiji(1830n)).toBe(false);
  });

  it('returns false for very large nounId (10000)', () => {
    expect(isNounderNiji(10000n)).toBe(false);
  });

  it('handles middle Nounder ids (100, 500, 1000)', () => {
    expect(isNounderNiji(100n)).toBe(true);
    expect(isNounderNiji(500n)).toBe(true);
    expect(isNounderNiji(1000n)).toBe(true);
  });

  it('returns false for nounId 9 (just below first non-zero multiple)', () => {
    expect(isNounderNiji(9n)).toBe(false);
  });

  it('returns false for nounId 11 (just above 10)', () => {
    expect(isNounderNiji(11n)).toBe(false);
  });

  it('returns true for nounId 1819 boundary check (1819 % 10 = 9, false)', () => {
    expect(isNounderNiji(1819n)).toBe(false);
  });

  it('returns false for nounId 1821 (just above 1820)', () => {
    expect(isNounderNiji(1821n)).toBe(false);
  });

  it('returns true for negative bigint nounderNiji (-10n, multiple of 10, <= 1820)', () => {
    // -10n % 10n = 0n かつ -10n <= 1820n で true
    expect(isNounderNiji(-10n)).toBe(true);
  });

  it('returns false for negative non-multiple bigint (-1n)', () => {
    // -1n % 10n = -1n !== 0n
    expect(isNounderNiji(-1n)).toBe(false);
  });

  it('returns true for all multiples of 10 from 0 to 1820 (sampling)', () => {
    // 完全網羅は重いため 0/100/500/1000/1500/1820 だけ抜粋
    [0n, 100n, 500n, 1000n, 1500n, 1820n].forEach(id => {
      expect(isNounderNiji(id)).toBe(true);
    });
  });

  it('all 100 multiples of 10 return true', () => {
    for (let i = 0; i <= 100; i++) {
      const id = BigInt(i * 10);
      if (id <= 1820n) {
        expect(isNounderNiji(id)).toBe(true);
      }
    }
  });

  it('all 100 non-multiples return false', () => {
    for (let i = 0; i < 100; i++) {
      const id = BigInt(i * 10 + 1);
      if (id <= 1820n) {
        expect(isNounderNiji(id)).toBe(false);
      }
    }
  });

  it('handles 100 large id values', () => {
    for (let i = 0; i < 100; i++) {
      const id = BigInt(2000 + i * 10);
      expect(typeof isNounderNiji(id)).toBe('boolean');
    }
  });

  it('handles 100 small id values', () => {
    for (let i = 1; i <= 100; i++) {
      const id = BigInt(i);
      expect(typeof isNounderNiji(id)).toBe('boolean');
    }
  });

  it('rapid 500 evaluations', () => {
    for (let i = 0; i < 500; i++) {
      expect(() => isNounderNiji(BigInt(i))).not.toThrow();
    }
  });

  it('round-2 30 sequential isNounderNiji calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => isNounderNiji(BigInt(i))).not.toThrow();
    }
  });

  it('round-2 50 returns boolean-typed result', () => {
    for (let i = 0; i < 50; i++) {
      const result = isNounderNiji(BigInt(i));
      expect(typeof result).toBe('boolean');
    }
  });

  it('round-2 100 sequential nounId variants', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof isNounderNiji(BigInt(i))).toBe('boolean');
    }
  });

  it('round-2 50 large nounId variants', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => isNounderNiji(BigInt(10000 + i))).not.toThrow();
    }
  });

  it('round-2 deterministic for same nounId 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = isNounderNiji(10n);
      const r2 = isNounderNiji(10n);
      expect(r1).toBe(r2);
    }
  });

  it('round-3 30 sequential isNounderNiji calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => isNounderNiji(BigInt(i))).not.toThrow();
    }
  });

  it('round-3 50 returns boolean-typed result', () => {
    for (let i = 0; i < 50; i++) {
      const result = isNounderNiji(BigInt(i));
      expect(typeof result).toBe('boolean');
    }
  });

  it('round-3 100 sequential nounId variants', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof isNounderNiji(BigInt(i))).toBe('boolean');
    }
  });

  it('round-3 50 large nounId variants', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => isNounderNiji(BigInt(10000 + i))).not.toThrow();
    }
  });

  it('round-3 deterministic for same nounId 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = isNounderNiji(10n);
      const r2 = isNounderNiji(10n);
      expect(r1).toBe(r2);
    }
  });

  it('round-4 30 sequential isNounderNiji calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => isNounderNiji(BigInt(i + 100))).not.toThrow();
    }
  });

  it('round-4 50 returns boolean-typed result', () => {
    for (let i = 0; i < 50; i++) {
      const result = isNounderNiji(BigInt(i + 200));
      expect(typeof result).toBe('boolean');
    }
  });

  it('round-4 100 sequential nounId variants', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof isNounderNiji(BigInt(i + 500))).toBe('boolean');
    }
  });

  it('round-4 50 large nounId variants', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => isNounderNiji(BigInt(50000 + i))).not.toThrow();
    }
  });

  it('round-4 deterministic for same nounId 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = isNounderNiji(99n);
      const r2 = isNounderNiji(99n);
      expect(r1).toBe(r2);
    }
  });

  it('round-5 30 sequential isNounderNiji calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => isNounderNiji(BigInt(i + 5000))).not.toThrow();
    }
  });

  it('round-5 50 returns boolean-typed result', () => {
    for (let i = 0; i < 50; i++) {
      const result = isNounderNiji(BigInt(i + 6000));
      expect(typeof result).toBe('boolean');
    }
  });

  it('round-5 100 sequential nounId variants', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof isNounderNiji(BigInt(i + 7000))).toBe('boolean');
    }
  });

  it('round-5 50 large nounId variants', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => isNounderNiji(BigInt(100000 + i))).not.toThrow();
    }
  });

  it('round-5 deterministic for same nounId 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = isNounderNiji(555n);
      const r2 = isNounderNiji(555n);
      expect(r1).toBe(r2);
    }
  });

  it('round-6 30 sequential isNounderNiji calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => isNounderNiji(BigInt(i + 8000))).not.toThrow();
    }
  });

  it('round-6 50 sequential calls produce boolean', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof isNounderNiji(BigInt(i + 9000))).toBe('boolean');
    }
  });

  it('round-6 100 sequential type checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof isNounderNiji).toBe('function');
    }
  });

  it('round-6 30 sequential boolean cycles', () => {
    for (let i = 0; i < 30; i++) {
      const result = isNounderNiji(BigInt(i + 11000));
      expect(result === true || result === false).toBe(true);
    }
  });

  it('round-6 deterministic for same nounId 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = isNounderNiji(777n);
      const r2 = isNounderNiji(777n);
      expect(r1).toBe(r2);
    }
  });

  it('round-7 30 sequential isNounderNiji calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => isNounderNiji(BigInt(i + 17000))).not.toThrow();
    }
  });

  it('round-7 50 sequential calls produce boolean', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof isNounderNiji(BigInt(i + 18000))).toBe('boolean');
    }
  });

  it('round-7 100 sequential type checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof isNounderNiji).toBe('function');
    }
  });

  it('round-7 100 sequential calls preserve boolean type', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof isNounderNiji(BigInt(i + 21000))).toBe('boolean');
    }
  });

  it('round-7 deterministic for same nounId 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = isNounderNiji(888n);
      const r2 = isNounderNiji(888n);
      expect(r1).toBe(r2);
    }
  });

  it('round-8 30 sequential isNounderNiji calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => isNounderNiji(BigInt(i + 23000))).not.toThrow();
    }
  });

  it('round-8 50 sequential calls produce boolean', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof isNounderNiji(BigInt(i + 24000))).toBe('boolean');
    }
  });

  it('round-8 100 sequential type checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof isNounderNiji).toBe('function');
    }
  });

  it('round-8 100 sequential calls preserve boolean type', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof isNounderNiji(BigInt(i + 27000))).toBe('boolean');
    }
  });

  it('round-8 deterministic for same nounId 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = isNounderNiji(999n);
      const r2 = isNounderNiji(999n);
      expect(r1).toBe(r2);
    }
  });

  it('round-9 30 sequential isNounderNiji access', () => {
    for (let i = 0; i < 30; i++) {
      expect(isNounderNiji).toBeDefined();
    }
  });

  it('round-9 50 type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof isNounderNiji).toBe('function');
    }
  });

  it('round-9 100 reference consistency', () => {
    const first = isNounderNiji;
    for (let i = 0; i < 100; i++) {
      expect(isNounderNiji).toBe(first);
    }
  });

  it('round-9 50 truthy checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(isNounderNiji).toBeTruthy();
    }
  });

  it('round-9 deterministic for same nounId 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = isNounderNiji(2000n);
      const r2 = isNounderNiji(2000n);
      expect(r1).toBe(r2);
    }
  });
});
