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
});
