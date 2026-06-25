import { describe, expect, it } from 'vitest';

import { nounPath } from './history';

describe('nounPath', () => {
  it('returns /niji/{id} format', () => {
    expect(nounPath(0)).toBe('/niji/0');
    expect(nounPath(123)).toBe('/niji/123');
  });

  it('handles negative id (no validation)', () => {
    expect(nounPath(-1)).toBe('/niji/-1');
  });

  it('handles 0 id (boundary)', () => {
    expect(nounPath(0)).toBe('/niji/0');
  });

  it('handles MAX_SAFE_INTEGER id', () => {
    expect(nounPath(Number.MAX_SAFE_INTEGER)).toBe(`/niji/${Number.MAX_SAFE_INTEGER}`);
  });

  it('handles fractional id (no validation, template literal stringifies)', () => {
    expect(nounPath(0.5)).toBe('/niji/0.5');
  });

  it('handles NaN id → "/niji/NaN" (template literal converts NaN to "NaN")', () => {
    expect(nounPath(NaN)).toBe('/niji/NaN');
  });

  it('handles Infinity → "/niji/Infinity"', () => {
    expect(nounPath(Infinity)).toBe('/niji/Infinity');
  });

  it('uses fixed /niji/ prefix (contract pin)', () => {
    expect(nounPath(1).startsWith('/niji/')).toBe(true);
    expect(nounPath(999999).startsWith('/niji/')).toBe(true);
  });

  it('handles 200 different id values', () => {
    for (let i = 0; i < 200; i++) {
      expect(nounPath(i)).toBe(`/niji/${i}`);
    }
  });

  it('handles 100 large id values', () => {
    for (let i = 0; i < 100; i++) {
      const id = 1_000_000 + i;
      expect(nounPath(id)).toBe(`/niji/${id}`);
    }
  });

  it('handles 100 negative id values', () => {
    for (let i = 1; i <= 100; i++) {
      expect(nounPath(-i)).toBe(`/niji/-${i}`);
    }
  });

  it('all 100 paths start with /niji/', () => {
    for (let i = 0; i < 100; i++) {
      expect(nounPath(i).startsWith('/niji/')).toBe(true);
    }
  });

  it('handles 100 fractional id values (no rounding)', () => {
    for (let i = 0; i < 100; i++) {
      const id = i + 0.5;
      expect(nounPath(id)).toBe(`/niji/${id}`);
    }
  });
});
