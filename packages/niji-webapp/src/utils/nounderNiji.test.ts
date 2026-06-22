import { describe, expect, it } from 'vitest';

import { isNounderNiji } from './nounderNiji';

describe('isNounderNiji', () => {
  it('returns true for nounId 0', () => {
    expect(isNounderNiji(0n)).toBe(true);
  });

  it('returns true for multiples of 10 up to 1820', () => {
    expect(isNounderNiji(10n)).toBe(true);
    expect(isNounderNiji(100n)).toBe(true);
    expect(isNounderNiji(1820n)).toBe(true);
  });

  it('returns false for non-multiples of 10', () => {
    expect(isNounderNiji(1n)).toBe(false);
    expect(isNounderNiji(11n)).toBe(false);
    expect(isNounderNiji(999n)).toBe(false);
  });

  it('returns false for multiples of 10 beyond the 1820 cap', () => {
    expect(isNounderNiji(1830n)).toBe(false);
    expect(isNounderNiji(2000n)).toBe(false);
  });

  it('handles the boundary at 1820 (inclusive)', () => {
    expect(isNounderNiji(1820n)).toBe(true);
    expect(isNounderNiji(1821n)).toBe(false);
  });
});
