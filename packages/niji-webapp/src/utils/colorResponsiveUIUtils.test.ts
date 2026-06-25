import { describe, expect, it } from 'vitest';

import { shouldUseStateBg } from './colorResponsiveUIUtils';

describe('shouldUseStateBg', () => {
  it('returns true for "/"', () => {
    expect(shouldUseStateBg({ pathname: '/' })).toBe(true);
  });

  it('returns true for paths containing "/noun"', () => {
    expect(shouldUseStateBg({ pathname: '/noun/1' })).toBe(true);
    expect(shouldUseStateBg({ pathname: '/noun' })).toBe(true);
  });

  it('returns true for paths containing "/auction"', () => {
    expect(shouldUseStateBg({ pathname: '/auction/5' })).toBe(true);
  });

  it('returns false for other paths', () => {
    expect(shouldUseStateBg({ pathname: '/vote' })).toBe(false);
    expect(shouldUseStateBg({ pathname: '/candidates' })).toBe(false);
    expect(shouldUseStateBg({ pathname: '/playground' })).toBe(false);
  });

  it('returns false for empty pathname', () => {
    expect(shouldUseStateBg({ pathname: '' })).toBe(false);
  });

  it('returns true for "/nounders" path (includes("/noun") substring match)', () => {
    // includes は substring 一致なので /nounders も /noun を含む
    expect(shouldUseStateBg({ pathname: '/nounders' })).toBe(true);
  });

  it('is case-sensitive: "/Noun" does NOT match', () => {
    expect(shouldUseStateBg({ pathname: '/Noun/1' })).toBe(false);
  });

  it('returns true for nested path "/noun/1/edit"', () => {
    expect(shouldUseStateBg({ pathname: '/noun/1/edit' })).toBe(true);
  });

  it('returns true for nested "/auction/5/bid"', () => {
    expect(shouldUseStateBg({ pathname: '/auction/5/bid' })).toBe(true);
  });

  it('returns true for substring match in "/forks/auction-x"', () => {
    expect(shouldUseStateBg({ pathname: '/forks/auction-x' })).toBe(true);
  });

  it('returns false for path that only resembles "noun" without slash', () => {
    expect(shouldUseStateBg({ pathname: '/nope' })).toBe(false);
  });

  it('handles 200 different / variant paths', () => {
    for (let i = 0; i < 200; i++) {
      expect(shouldUseStateBg({ pathname: `/path-${i}` })).toBe(false);
    }
  });

  it('handles 200 different /noun variant paths', () => {
    for (let i = 0; i < 200; i++) {
      expect(shouldUseStateBg({ pathname: `/noun/${i}` })).toBe(true);
    }
  });

  it('handles 200 different /auction variant paths', () => {
    for (let i = 0; i < 200; i++) {
      expect(shouldUseStateBg({ pathname: `/auction/${i}` })).toBe(true);
    }
  });

  it('handles 100 different /vote variant paths', () => {
    for (let i = 0; i < 100; i++) {
      expect(shouldUseStateBg({ pathname: `/vote/${i}` })).toBe(false);
    }
  });

  it('handles 100 different long paths', () => {
    for (let i = 0; i < 100; i++) {
      const longPath = '/' + 'a'.repeat(100 + i);
      expect(typeof shouldUseStateBg({ pathname: longPath })).toBe('boolean');
    }
  });
});
