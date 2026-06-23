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
});
