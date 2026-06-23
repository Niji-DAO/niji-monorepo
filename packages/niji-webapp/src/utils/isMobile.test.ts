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
});
