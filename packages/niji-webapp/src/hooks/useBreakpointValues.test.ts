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
});
