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

  it('handles 100 different width values below threshold', () => {
    for (let i = 0; i < 100; i++) {
      Object.defineProperty(window, 'innerWidth', {
        value: 100 + i,
        writable: true,
        configurable: true,
      });
      expect(isMobileScreen()).toBe(true);
    }
  });

  it('handles 100 different width values above threshold', () => {
    for (let i = 0; i < 100; i++) {
      Object.defineProperty(window, 'innerWidth', {
        value: 1000 + i,
        writable: true,
        configurable: true,
      });
      expect(isMobileScreen()).toBe(false);
    }
  });

  it('handles 100 evaluations at exact same width', () => {
    Object.defineProperty(window, 'innerWidth', { value: 500, writable: true, configurable: true });
    for (let i = 0; i < 100; i++) {
      expect(typeof isMobileScreen()).toBe('boolean');
    }
  });

  it('handles rapid 100 width changes', () => {
    for (let i = 0; i < 100; i++) {
      Object.defineProperty(window, 'innerWidth', {
        value: 100 + i * 10,
        writable: true,
        configurable: true,
      });
      expect(() => isMobileScreen()).not.toThrow();
    }
  });

  it('handles 100 rapid invocations with same width', () => {
    Object.defineProperty(window, 'innerWidth', { value: 800, writable: true, configurable: true });
    for (let i = 0; i < 100; i++) {
      expect(() => isMobileScreen()).not.toThrow();
    }
  });
});
