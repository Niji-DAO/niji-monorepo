import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { isMobileScreen } from './isMobile';

describe('isMobileScreen', () => {
  let originalInnerWidth: number;

  beforeEach(() => {
    originalInnerWidth = window.innerWidth;
  });

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  const setWidth = (width: number) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
  };

  it('returns true when window width is below 992', () => {
    setWidth(800);
    expect(isMobileScreen()).toBe(true);
  });

  it('returns true at boundary - 1 (991)', () => {
    setWidth(991);
    expect(isMobileScreen()).toBe(true);
  });

  it('returns false at boundary 992', () => {
    setWidth(992);
    expect(isMobileScreen()).toBe(false);
  });

  it('returns false when window width is above 992', () => {
    setWidth(1200);
    expect(isMobileScreen()).toBe(false);
  });

  it('handles very small width (mobile portrait)', () => {
    setWidth(320);
    expect(isMobileScreen()).toBe(true);
  });

  it('handles very large width (4K)', () => {
    setWidth(3840);
    expect(isMobileScreen()).toBe(false);
  });

  it('returns true for width 0 (edge: maximal mobile)', () => {
    setWidth(0);
    expect(isMobileScreen()).toBe(true);
  });

  it('returns true for negative width (defensive: still < 992)', () => {
    setWidth(-100);
    expect(isMobileScreen()).toBe(true);
  });

  it('returns true for fractional width 991.5 (< 992)', () => {
    setWidth(991.5);
    expect(isMobileScreen()).toBe(true);
  });

  it('returns false for fractional width 992.5 (>= 992)', () => {
    setWidth(992.5);
    expect(isMobileScreen()).toBe(false);
  });

  it('returns false when innerWidth is NaN (NaN < 992 is always false)', () => {
    setWidth(NaN);
    expect(isMobileScreen()).toBe(false);
  });
});
