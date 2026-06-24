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
});
