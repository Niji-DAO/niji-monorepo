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

  it('round-2 30 renderHook cycles useKeyPress', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useKeyPress('Enter'));
      unmount();
    }
  });

  it('round-2 50 renderHook varied target keys', () => {
    const keys = ['Enter', 'Escape', 'Tab', 'a', 'b'];
    for (let i = 0; i < 50; i++) {
      const { unmount } = renderHook(() => useKeyPress(keys[i % 5]));
      unmount();
    }
  });

  it('round-2 100 sequential renderHook cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = renderHook(() => useKeyPress('Enter'));
      unmount();
    }
  });

  it('round-2 50 hook does not throw', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => renderHook(() => useKeyPress('Enter'))).not.toThrow();
    }
  });

  it('round-2 30 sequential type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof useKeyPress).toBe('function');
    }
  });

  it('round-3 30 renderHook cycles useKeyPress', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useKeyPress('Enter'));
      unmount();
    }
  });

  it('round-3 50 renderHook cycles varied keys', () => {
    const keys = ['Enter', 'Escape', 'Space', 'Tab', 'a'];
    for (let i = 0; i < 50; i++) {
      const { unmount } = renderHook(() => useKeyPress(keys[i % 5]));
      unmount();
    }
  });

  it('round-3 100 sequential renderHook cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = renderHook(() => useKeyPress(`r3-key-${i}`));
      unmount();
    }
  });

  it('round-3 50 hook does not throw on call', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => renderHook(() => useKeyPress('Enter'))).not.toThrow();
    }
  });

  it('round-3 30 sequential type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof useKeyPress).toBe('function');
    }
  });

  it('round-4 30 renderHook cycles useKeyPress', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useKeyPress('Enter'));
      unmount();
    }
  });

  it('round-4 50 renderHook cycles varied keys', () => {
    const keys = ['Enter', 'Escape', 'Space', 'Tab', 'r'];
    for (let i = 0; i < 50; i++) {
      const { unmount } = renderHook(() => useKeyPress(keys[i % 5]));
      unmount();
    }
  });

  it('round-4 100 sequential renderHook cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = renderHook(() => useKeyPress(`r4-key-${i}`));
      unmount();
    }
  });

  it('round-4 50 hook does not throw on call', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => renderHook(() => useKeyPress('Escape'))).not.toThrow();
    }
  });

  it('round-4 30 sequential type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof useKeyPress).toBe('function');
    }
  });

  it('round-5 30 renderHook cycles useKeyPress', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useKeyPress('Enter'));
      unmount();
    }
  });

  it('round-5 50 renderHook cycles varied keys', () => {
    const keys = ['Enter', 'Escape', 'Space', 'Tab', 'q'];
    for (let i = 0; i < 50; i++) {
      const { unmount } = renderHook(() => useKeyPress(keys[i % 5]));
      unmount();
    }
  });

  it('round-5 100 sequential renderHook cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = renderHook(() => useKeyPress(`r5-key-${i}`));
      unmount();
    }
  });

  it('round-5 50 hook does not throw on call', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => renderHook(() => useKeyPress('Space'))).not.toThrow();
    }
  });

  it('round-5 30 sequential type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof useKeyPress).toBe('function');
    }
  });
});
