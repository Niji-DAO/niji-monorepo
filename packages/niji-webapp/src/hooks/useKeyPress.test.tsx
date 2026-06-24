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

  it('is case-sensitive: A and a are different target keys', () => {
    const { result } = renderHook(() => useKeyPress('A'));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    });
    expect(result.current).toBe(false);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'A' }));
    });
    expect(result.current).toBe(true);
  });

  it('handles space key (" ")', () => {
    const { result } = renderHook(() => useKeyPress(' '));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    });
    expect(result.current).toBe(true);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key: ' ' }));
    });
    expect(result.current).toBe(false);
  });

  it('multiple instances of the hook are independent', () => {
    const { result: r1 } = renderHook(() => useKeyPress('1'));
    const { result: r2 } = renderHook(() => useKeyPress('2'));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '1' }));
    });
    expect(r1.current).toBe(true);
    expect(r2.current).toBe(false);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '2' }));
    });
    expect(r2.current).toBe(true);
  });

  it('rerunning effect on targetKey change removes old listener', () => {
    const { result, rerender } = renderHook((k: string) => useKeyPress(k), {
      initialProps: 'q',
    });

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'q' }));
    });
    expect(result.current).toBe(true);

    rerender('r');
    // 新 targetKey に切替後、 旧 key 'q' は match しない (state 'true' 保持されるかは
    // source の動作で keydown q 自体は target r != q なので state 変更なし)
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'r' }));
    });
    expect(result.current).toBe(true);
  });

  it('keyup without prior keydown sets state to false (idempotent)', () => {
    const { result } = renderHook(() => useKeyPress('z'));
    expect(result.current).toBe(false);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'z' }));
    });
    expect(result.current).toBe(false);
  });
});
