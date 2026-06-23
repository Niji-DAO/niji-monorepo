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
});
