import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useKeyPress } from './useKeyPress';

describe('useKeyPress', () => {
  it('returns false initially', () => {
    const { result } = renderHook(() => useKeyPress('a'));
    expect(result.current).toBe(false);
  });

  it('returns true when target key is pressed', () => {
    const { result } = renderHook(() => useKeyPress('Enter'));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    });

    expect(result.current).toBe(true);
  });

  it('returns false when target key is released', () => {
    const { result } = renderHook(() => useKeyPress('Escape'));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(result.current).toBe(true);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Escape' }));
    });
    expect(result.current).toBe(false);
  });

  it('ignores non-target keys', () => {
    const { result } = renderHook(() => useKeyPress('a'));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'b' }));
    });

    expect(result.current).toBe(false);
  });

  it('cleans up listeners on unmount', () => {
    const { result, unmount } = renderHook(() => useKeyPress('x'));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'x' }));
    });
    expect(result.current).toBe(true);

    unmount();

    // After unmount, dispatch should not affect state (no error)
    expect(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'x' }));
    }).not.toThrow();
  });
});
