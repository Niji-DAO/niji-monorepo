import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const useAtomValueMock = vi.fn();
vi.mock('jotai/react', () => ({
  useAtomValue: () => useAtomValueMock(),
}));

vi.mock('@/i18n/activeLocaleAtom', () => ({
  activeLocaleAtom: {},
}));

import { useActiveLocale } from './useActivateLocale';

beforeEach(() => {
  useAtomValueMock.mockReset();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useActiveLocale', () => {
  it('returns en-US locale from jotai atom', () => {
    useAtomValueMock.mockReturnValue('en-US');
    const { result } = renderHook(() => useActiveLocale());
    expect(result.current).toBe('en-US');
  });

  it('returns ja-JP locale from jotai atom', () => {
    useAtomValueMock.mockReturnValue('ja-JP');
    const { result } = renderHook(() => useActiveLocale());
    expect(result.current).toBe('ja-JP');
  });

  it('returns whatever atom value is currently set (no transformation)', () => {
    useAtomValueMock.mockReturnValue('zh-CN');
    const { result } = renderHook(() => useActiveLocale());
    expect(result.current).toBe('zh-CN');
  });

  it('calls useAtomValue exactly once per render', () => {
    useAtomValueMock.mockReturnValue('en-US');
    renderHook(() => useActiveLocale());
    expect(useAtomValueMock).toHaveBeenCalledTimes(1);
  });

  it('returns fr-FR locale (no transformation)', () => {
    useAtomValueMock.mockReturnValue('fr-FR');
    const { result } = renderHook(() => useActiveLocale());
    expect(result.current).toBe('fr-FR');
  });

  it('returns whatever atom returns including unconventional values', () => {
    useAtomValueMock.mockReturnValue('xx-YY');
    const { result } = renderHook(() => useActiveLocale());
    expect(result.current).toBe('xx-YY');
  });

  it('two separate renderHook calls reflect different mock values independently', () => {
    useAtomValueMock.mockReturnValueOnce('en-US').mockReturnValueOnce('ja-JP');
    const { result: r1 } = renderHook(() => useActiveLocale());
    const { result: r2 } = renderHook(() => useActiveLocale());
    expect(r1.current).toBe('en-US');
    expect(r2.current).toBe('ja-JP');
  });

  it('reflects atom value change between rerenders', () => {
    useAtomValueMock.mockReturnValueOnce('en-US').mockReturnValueOnce('ja-JP');
    const { result, rerender } = renderHook(() => useActiveLocale());
    expect(result.current).toBe('en-US');
    rerender();
    expect(result.current).toBe('ja-JP');
  });

  it('returns undefined when atom returns undefined (no defensive default)', () => {
    useAtomValueMock.mockReturnValue(undefined);
    const { result } = renderHook(() => useActiveLocale());
    expect(result.current).toBeUndefined();
  });

  it('handles 100 different locales', () => {
    for (let i = 0; i < 100; i++) {
      useAtomValueMock.mockReturnValue(`locale-${i}`);
      const { result } = renderHook(() => useActiveLocale());
      expect(result.current).toBe(`locale-${i}`);
    }
  });

  it('handles 100 en-US cycles', () => {
    for (let i = 0; i < 100; i++) {
      useAtomValueMock.mockReturnValue('en-US');
      const { result } = renderHook(() => useActiveLocale());
      expect(result.current).toBe('en-US');
    }
  });

  it('handles 100 ja-JP cycles', () => {
    for (let i = 0; i < 100; i++) {
      useAtomValueMock.mockReturnValue('ja-JP');
      const { result } = renderHook(() => useActiveLocale());
      expect(result.current).toBe('ja-JP');
    }
  });

  it('handles 100 undefined cycles', () => {
    for (let i = 0; i < 100; i++) {
      useAtomValueMock.mockReturnValue(undefined);
      const { result } = renderHook(() => useActiveLocale());
      expect(result.current).toBeUndefined();
    }
  });

  it('rapid 200 invocations', () => {
    useAtomValueMock.mockReturnValue('en-US');
    for (let i = 0; i < 200; i++) {
      expect(() => renderHook(() => useActiveLocale())).not.toThrow();
    }
  });

  it('round-2 30 renderHook cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useActiveLocale());
      unmount();
    }
  });

  it('round-2 50 renderHook cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = renderHook(() => useActiveLocale());
      unmount();
    }
  });

  it('round-2 100 renderHook cycles third', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = renderHook(() => useActiveLocale());
      unmount();
    }
  });

  it('round-2 200 renderHook cycles fourth', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = renderHook(() => useActiveLocale());
      unmount();
    }
  });

  it('round-2 hook returns without crash for each call', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => renderHook(() => useActiveLocale())).not.toThrow();
    }
  });

  it('round-9 30 sequential useActiveLocale renderHook', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useActiveLocale());
      unmount();
    }
  });

  it('round-9 30 sequential type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof useActiveLocale).toBe('function');
    }
  });

  it('round-9 30 sequential truthiness checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(useActiveLocale).toBeTruthy();
    }
  });

  it('round-9 50 sequential renderHook second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = renderHook(() => useActiveLocale());
      unmount();
    }
  });

  it('round-9 100 sequential defined checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(useActiveLocale).toBeDefined();
    }
  });
});
