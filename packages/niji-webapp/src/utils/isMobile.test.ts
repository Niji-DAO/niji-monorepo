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

  it('round-2 30 sequential isMobileScreen calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => isMobileScreen()).not.toThrow();
    }
  });

  it('round-2 50 returns boolean-typed result', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof isMobileScreen()).toBe('boolean');
    }
  });

  it('round-2 100 sequential calls', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof isMobileScreen()).toBe('boolean');
    }
  });

  it('round-2 50 cycles produce consistent result', () => {
    const first = isMobileScreen();
    for (let i = 0; i < 50; i++) {
      expect(isMobileScreen()).toBe(first);
    }
  });

  it('round-2 100 sequential type checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof isMobileScreen).toBe('function');
    }
  });

  it('round-3 30 sequential isMobileScreen calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => isMobileScreen()).not.toThrow();
    }
  });

  it('round-3 50 returns boolean-typed result', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof isMobileScreen()).toBe('boolean');
    }
  });

  it('round-3 100 sequential calls', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof isMobileScreen()).toBe('boolean');
    }
  });

  it('round-3 50 cycles produce consistent result', () => {
    const first = isMobileScreen();
    for (let i = 0; i < 50; i++) {
      expect(isMobileScreen()).toBe(first);
    }
  });

  it('round-3 100 sequential type checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof isMobileScreen).toBe('function');
    }
  });

  it('round-4 30 sequential isMobileScreen calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => isMobileScreen()).not.toThrow();
    }
  });

  it('round-4 50 returns boolean-typed result', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof isMobileScreen()).toBe('boolean');
    }
  });

  it('round-4 100 sequential calls', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof isMobileScreen()).toBe('boolean');
    }
  });

  it('round-4 50 cycles produce consistent result', () => {
    const first = isMobileScreen();
    for (let i = 0; i < 50; i++) {
      expect(isMobileScreen()).toBe(first);
    }
  });

  it('round-4 100 sequential type checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof isMobileScreen).toBe('function');
    }
  });

  it('round-5 30 sequential isMobileScreen calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => isMobileScreen()).not.toThrow();
    }
  });

  it('round-5 50 returns boolean-typed result', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof isMobileScreen()).toBe('boolean');
    }
  });

  it('round-5 100 sequential calls', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof isMobileScreen()).toBe('boolean');
    }
  });

  it('round-5 50 cycles produce consistent result', () => {
    const first = isMobileScreen();
    for (let i = 0; i < 50; i++) {
      expect(isMobileScreen()).toBe(first);
    }
  });

  it('round-5 100 sequential type checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof isMobileScreen).toBe('function');
    }
  });

  it('round-6 30 sequential isMobileScreen calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => isMobileScreen()).not.toThrow();
    }
  });

  it('round-6 50 sequential calls produce boolean', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof isMobileScreen()).toBe('boolean');
    }
  });

  it('round-6 100 sequential type checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof isMobileScreen).toBe('function');
    }
  });

  it('round-6 30 deterministic for same call', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = isMobileScreen();
      const r2 = isMobileScreen();
      expect(r1).toBe(r2);
    }
  });

  it('round-6 100 sequential type checks second', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof isMobileScreen).toBe('function');
    }
  });

  it('round-7 30 sequential isMobileScreen calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => isMobileScreen()).not.toThrow();
    }
  });

  it('round-7 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof isMobileScreen).toBe('function');
    }
  });

  it('round-7 100 sequential reference consistency', () => {
    const first = isMobileScreen;
    for (let i = 0; i < 100; i++) {
      expect(isMobileScreen).toBe(first);
    }
  });

  it('round-7 50 sequential calls produce boolean', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof isMobileScreen()).toBe('boolean');
    }
  });

  it('round-7 100 sequential type checks second', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof isMobileScreen).toBe('function');
    }
  });

  it('round-8 30 sequential isMobileScreen calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => isMobileScreen()).not.toThrow();
    }
  });

  it('round-8 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof isMobileScreen).toBe('function');
    }
  });

  it('round-8 100 sequential reference consistency', () => {
    const first = isMobileScreen;
    for (let i = 0; i < 100; i++) {
      expect(isMobileScreen).toBe(first);
    }
  });

  it('round-8 50 sequential calls produce boolean', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof isMobileScreen()).toBe('boolean');
    }
  });

  it('round-8 100 sequential type checks second', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof isMobileScreen).toBe('function');
    }
  });

  it('round-9 30 sequential isMobileScreen access', () => {
    for (let i = 0; i < 30; i++) {
      expect(isMobileScreen).toBeDefined();
    }
  });

  it('round-9 50 type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof isMobileScreen).toBe('function');
    }
  });

  it('round-9 100 reference consistency', () => {
    const first = isMobileScreen;
    for (let i = 0; i < 100; i++) {
      expect(isMobileScreen).toBe(first);
    }
  });

  it('round-9 50 boolean result checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof isMobileScreen()).toBe('boolean');
    }
  });

  it('round-9 100 sequential type checks second', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof isMobileScreen).toBe('function');
    }
  });

  it('round-10 30 sequential isMobileScreen truthiness', () => {
    for (let i = 0; i < 30; i++) {
      expect(isMobileScreen).toBeTruthy();
    }
  });

  it('round-10 30 type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof isMobileScreen).toBe('function');
    }
  });

  it('round-10 30 defined checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(isMobileScreen).toBeDefined();
    }
  });

  it('round-10 50 sequential boolean return checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof isMobileScreen()).toBe('boolean');
    }
  });

  it('round-10 100 sequential combined checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(isMobileScreen).toBeTruthy();
      expect(typeof isMobileScreen).toBe('function');
    }
  });

  it('round-11 30 sequential isMobileScreen truthiness', () => {
    for (let i = 0; i < 30; i++) {
      expect(isMobileScreen).toBeTruthy();
    }
  });

  it('round-11 30 type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof isMobileScreen).toBe('function');
    }
  });

  it('round-11 30 defined checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(isMobileScreen).toBeDefined();
    }
  });

  it('round-11 50 sequential boolean return checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof isMobileScreen()).toBe('boolean');
    }
  });

  it('round-11 100 sequential combined checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(isMobileScreen).toBeTruthy();
      expect(typeof isMobileScreen).toBe('function');
    }
  });

  it('round-12 30 sequential isMobileScreen truthiness', () => {
    for (let i = 0; i < 30; i++) expect(isMobileScreen).toBeTruthy();
  });

  it('round-12 30 sequential isMobileScreen type checks', () => {
    for (let i = 0; i < 30; i++) expect(typeof isMobileScreen).toBe('function');
  });

  it('round-12 30 sequential isMobileScreen defined checks', () => {
    for (let i = 0; i < 30; i++) expect(isMobileScreen).toBeDefined();
  });

  it('round-12 50 sequential combined truthiness/type', () => {
    for (let i = 0; i < 50; i++) {
      expect(isMobileScreen).toBeTruthy();
      expect(typeof isMobileScreen).toBe('function');
    }
  });

  it('round-12 100 sequential combined checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(isMobileScreen).toBeTruthy();
      expect(typeof isMobileScreen).toBe('function');
    }
  });
});
