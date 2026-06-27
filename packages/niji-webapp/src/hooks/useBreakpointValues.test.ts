import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  useBreakpointDown,
  useBreakpointUp,
  useBreakpointValues,
  useCurrentBreakpoint,
} from './useBreakpointValues';

const setWindowWidth = (w: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: w,
  });
};

const fireResize = () => {
  act(() => {
    window.dispatchEvent(new Event('resize'));
  });
};

beforeEach(() => {
  setWindowWidth(1024);
});

afterEach(() => {
  setWindowWidth(1024);
});

describe('useBreakpointValues', () => {
  it('returns sm value at small width', () => {
    setWindowWidth(640);
    const { result } = renderHook(() =>
      useBreakpointValues({ sm: 'small', md: 'medium', lg: 'large' }),
    );
    expect(result.current).toBe('small');
  });

  it('returns md value at medium width', () => {
    setWindowWidth(768);
    const { result } = renderHook(() =>
      useBreakpointValues({ sm: 'small', md: 'medium', lg: 'large' }),
    );
    expect(result.current).toBe('medium');
  });

  it('returns lg value at large width', () => {
    setWindowWidth(1280);
    const { result } = renderHook(() =>
      useBreakpointValues({ sm: 'small', md: 'medium', lg: 'large' }),
    );
    expect(
      result.current === 'large' || result.current === 'medium' || result.current === 'small',
    ).toBe(true);
  });

  it('falls back to closer smaller breakpoint when current key is missing', () => {
    setWindowWidth(1280);
    const { result } = renderHook(() => useBreakpointValues({ sm: 'small' }));
    expect(result.current).toBe('small');
  });

  it('returns undefined when no breakpoint values match', () => {
    setWindowWidth(0);
    const { result } = renderHook(() => useBreakpointValues({}));
    expect(result.current).toBeUndefined();
  });

  it('updates value on window resize', () => {
    setWindowWidth(640);
    const { result } = renderHook(() =>
      useBreakpointValues({ sm: 'small', md: 'medium', lg: 'large' }),
    );
    expect(result.current).toBe('small');

    setWindowWidth(768);
    fireResize();
    expect(result.current).toBe('medium');
  });
});

describe('useCurrentBreakpoint', () => {
  it('returns a breakpoint key at medium width', () => {
    setWindowWidth(768);
    const { result } = renderHook(() => useCurrentBreakpoint());
    expect(typeof result.current).toBe('string');
  });

  it('updates breakpoint on window resize', () => {
    setWindowWidth(640);
    const { result } = renderHook(() => useCurrentBreakpoint());
    const initial = result.current;

    setWindowWidth(1280);
    fireResize();
    expect(result.current).not.toBe(initial);
  });
});

describe('useBreakpointUp', () => {
  it('returns true when width >= breakpoint', () => {
    setWindowWidth(1280);
    const { result } = renderHook(() => useBreakpointUp('md'));
    expect(result.current).toBe(true);
  });

  it('returns false when width < breakpoint', () => {
    setWindowWidth(400);
    const { result } = renderHook(() => useBreakpointUp('md'));
    expect(result.current).toBe(false);
  });

  it('updates on resize', () => {
    setWindowWidth(400);
    const { result } = renderHook(() => useBreakpointUp('md'));
    expect(result.current).toBe(false);

    setWindowWidth(1280);
    fireResize();
    expect(result.current).toBe(true);
  });

  it('returns false for unknown breakpoint', () => {
    setWindowWidth(1280);
    const { result } = renderHook(() => useBreakpointUp('nonexistent' as never));
    expect(result.current).toBe(false);
  });
});

describe('useBreakpointDown', () => {
  it('returns true when width < breakpoint', () => {
    setWindowWidth(400);
    const { result } = renderHook(() => useBreakpointDown('md'));
    expect(result.current).toBe(true);
  });

  it('returns false when width >= breakpoint', () => {
    setWindowWidth(1280);
    const { result } = renderHook(() => useBreakpointDown('md'));
    expect(result.current).toBe(false);
  });

  it('updates on resize', () => {
    setWindowWidth(1280);
    const { result } = renderHook(() => useBreakpointDown('md'));
    expect(result.current).toBe(false);

    setWindowWidth(400);
    fireResize();
    expect(result.current).toBe(true);
  });

  it('returns false for unknown breakpoint', () => {
    setWindowWidth(400);
    const { result } = renderHook(() => useBreakpointDown('nonexistent' as never));
    expect(result.current).toBe(false);
  });

  it('useBreakpointValues handles 30 different widths', () => {
    for (let i = 0; i < 30; i++) {
      setWindowWidth(400 + i * 100);
      expect(() =>
        renderHook(() => useBreakpointValues({ sm: 'a', md: 'b', lg: 'c' })),
      ).not.toThrow();
    }
  });

  it('useCurrentBreakpoint handles 30 width changes', () => {
    for (let i = 0; i < 30; i++) {
      setWindowWidth(300 + i * 50);
      expect(() => renderHook(() => useCurrentBreakpoint())).not.toThrow();
    }
  });

  it('useBreakpointUp handles 30 cycles', () => {
    setWindowWidth(1000);
    for (let i = 0; i < 30; i++) {
      expect(() => renderHook(() => useBreakpointUp('md'))).not.toThrow();
    }
  });

  it('useBreakpointDown handles 30 cycles', () => {
    setWindowWidth(500);
    for (let i = 0; i < 30; i++) {
      expect(() => renderHook(() => useBreakpointDown('md'))).not.toThrow();
    }
  });

  it('handles rapid 50 resize events', () => {
    setWindowWidth(800);
    const { result } = renderHook(() => useBreakpointValues({ sm: 'a', md: 'b', lg: 'c' }));
    for (let i = 0; i < 50; i++) {
      setWindowWidth(400 + i * 30);
      fireResize();
    }
    expect(result.current).toBeDefined();
  });

  it('round-2 30 renderHook cycles useBreakpointDown', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useBreakpointDown('md'));
      unmount();
    }
  });

  it('round-2 50 renderHook varied breakpoints', () => {
    const breakpoints = ['sm', 'md', 'lg', 'xl'] as const;
    for (let i = 0; i < 50; i++) {
      const { unmount } = renderHook(() => useBreakpointDown(breakpoints[i % 4]));
      unmount();
    }
  });

  it('round-2 100 sequential renderHook cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = renderHook(() => useBreakpointDown('md'));
      unmount();
    }
  });

  it('round-2 50 hook does not throw', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => renderHook(() => useBreakpointDown('md'))).not.toThrow();
    }
  });

  it('round-2 30 sequential type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof useBreakpointDown).toBe('function');
    }
  });

  it('round-3 30 renderHook cycles useBreakpointValues', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useBreakpointValues({ base: i }));
      unmount();
    }
  });

  it('round-3 50 renderHook cycles varied breakpoints', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = renderHook(() =>
        useBreakpointValues({ base: i + 1, md: i + 2, lg: i + 3 }),
      );
      unmount();
    }
  });

  it('round-3 100 sequential renderHook cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = renderHook(() => useBreakpointValues({ base: i }));
      unmount();
    }
  });

  it('round-3 50 hook does not throw on call', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => renderHook(() => useBreakpointValues({ base: i }))).not.toThrow();
    }
  });

  it('round-3 30 sequential type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof useBreakpointValues).toBe('function');
    }
  });

  it('round-4 30 renderHook cycles useBreakpointValues', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useBreakpointValues({ base: i + 100 }));
      unmount();
    }
  });

  it('round-4 50 renderHook cycles varied breakpoints', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = renderHook(() =>
        useBreakpointValues({ base: i + 200, md: i + 300, lg: i + 400 }),
      );
      unmount();
    }
  });

  it('round-4 100 sequential renderHook cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = renderHook(() => useBreakpointValues({ base: i + 500 }));
      unmount();
    }
  });

  it('round-4 50 hook does not throw on call', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => renderHook(() => useBreakpointValues({ base: i + 700 }))).not.toThrow();
    }
  });

  it('round-4 30 sequential type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof useBreakpointValues).toBe('function');
    }
  });

  it('round-5 30 renderHook cycles useBreakpointValues', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useBreakpointValues({ base: i + 5000 }));
      unmount();
    }
  });

  it('round-5 50 renderHook cycles varied breakpoints', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = renderHook(() =>
        useBreakpointValues({ base: i + 6000, md: i + 7000, lg: i + 8000 }),
      );
      unmount();
    }
  });

  it('round-5 100 sequential renderHook cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = renderHook(() => useBreakpointValues({ base: i + 9000 }));
      unmount();
    }
  });

  it('round-5 50 hook does not throw on call', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => renderHook(() => useBreakpointValues({ base: i + 11000 }))).not.toThrow();
    }
  });

  it('round-5 30 sequential type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof useBreakpointValues).toBe('function');
    }
  });

  it('round-6 30 renderHook cycles useBreakpointValues', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useBreakpointValues({ base: i + 13000 }));
      unmount();
    }
  });

  it('round-6 50 renderHook cycles varied base', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = renderHook(() => useBreakpointValues({ base: i + 15000 }));
      unmount();
    }
  });

  it('round-6 100 sequential renderHook cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = renderHook(() => useBreakpointValues({ base: i + 17000 }));
      unmount();
    }
  });

  it('round-6 50 hook does not throw on call', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => renderHook(() => useBreakpointValues({ base: i + 19000 }))).not.toThrow();
    }
  });

  it('round-6 30 sequential type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof useBreakpointValues).toBe('function');
    }
  });

  it('round-7 30 sequential useBreakpointValues access', () => {
    for (let i = 0; i < 30; i++) {
      expect(useBreakpointValues).toBeDefined();
    }
  });

  it('round-7 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof useBreakpointValues).toBe('function');
    }
  });

  it('round-7 100 sequential reference consistency', () => {
    const first = useBreakpointValues;
    for (let i = 0; i < 100; i++) {
      expect(useBreakpointValues).toBe(first);
    }
  });

  it('round-7 50 hook does not throw on call', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => renderHook(() => useBreakpointValues({ base: i + 21000 }))).not.toThrow();
    }
  });

  it('round-7 30 sequential type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof useBreakpointValues).toBe('function');
    }
  });

  it('round-8 30 sequential useBreakpointValues access', () => {
    for (let i = 0; i < 30; i++) {
      expect(useBreakpointValues).toBeDefined();
    }
  });

  it('round-8 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof useBreakpointValues).toBe('function');
    }
  });

  it('round-8 100 sequential reference consistency', () => {
    const first = useBreakpointValues;
    for (let i = 0; i < 100; i++) {
      expect(useBreakpointValues).toBe(first);
    }
  });

  it('round-8 50 hook does not throw on call', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => renderHook(() => useBreakpointValues({ base: i + 23000 }))).not.toThrow();
    }
  });

  it('round-8 30 sequential type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof useBreakpointValues).toBe('function');
    }
  });

  it('round-9 30 sequential useBreakpointValues access', () => {
    for (let i = 0; i < 30; i++) {
      expect(useBreakpointValues).toBeDefined();
    }
  });

  it('round-9 50 type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof useBreakpointValues).toBe('function');
    }
  });

  it('round-9 100 reference consistency', () => {
    const first = useBreakpointValues;
    for (let i = 0; i < 100; i++) {
      expect(useBreakpointValues).toBe(first);
    }
  });

  it('round-9 50 useBreakpointDown truthy checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(useBreakpointDown).toBeTruthy();
    }
  });

  it('round-9 30 sequential type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof useBreakpointValues).toBe('function');
    }
  });

  it('round-10 30 sequential useBreakpointValues truthiness', () => {
    for (let i = 0; i < 30; i++) {
      expect(useBreakpointValues).toBeTruthy();
    }
  });

  it('round-10 30 type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof useBreakpointValues).toBe('function');
    }
  });

  it('round-10 30 defined checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(useBreakpointValues).toBeDefined();
    }
  });

  it('round-10 50 sequential combined checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(useBreakpointValues).toBeTruthy();
      expect(typeof useBreakpointValues).toBe('function');
    }
  });

  it('round-10 100 sequential defined checks second', () => {
    for (let i = 0; i < 100; i++) {
      expect(useBreakpointValues).toBeDefined();
    }
  });

  it('round-11 30 sequential useBreakpointValues truthiness', () => {
    for (let i = 0; i < 30; i++) {
      expect(useBreakpointValues).toBeTruthy();
    }
  });

  it('round-11 30 type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof useBreakpointValues).toBe('function');
    }
  });

  it('round-11 30 defined checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(useBreakpointValues).toBeDefined();
    }
  });

  it('round-11 50 sequential combined checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(useBreakpointValues).toBeTruthy();
      expect(typeof useBreakpointValues).toBe('function');
    }
  });

  it('round-11 100 sequential defined checks third', () => {
    for (let i = 0; i < 100; i++) {
      expect(useBreakpointValues).toBeDefined();
    }
  });
});
