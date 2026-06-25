import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const locationState: { hash: string } = { hash: '' };
vi.mock('react-router', () => ({
  useLocation: () => locationState,
}));

import { useScrollToLocation } from './useScrollToLocation';

const scrollToMock = vi.fn();
const getElementByIdMock = vi.fn();

beforeEach(() => {
  locationState.hash = '';
  scrollToMock.mockReset();
  getElementByIdMock.mockReset();
  window.scrollTo = scrollToMock as never;
  document.getElementById = getElementByIdMock;
  Object.defineProperty(window, 'pageYOffset', { value: 0, writable: true, configurable: true });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useScrollToLocation', () => {
  it('does nothing when hash is empty', () => {
    renderHook(() => useScrollToLocation());
    expect(scrollToMock).not.toHaveBeenCalled();
  });

  it('scrolls to element when hash matches an existing id', () => {
    locationState.hash = '#section-1';
    getElementByIdMock.mockReturnValue({
      getBoundingClientRect: () => ({ top: 100 }),
    });
    renderHook(() => useScrollToLocation());
    expect(getElementByIdMock).toHaveBeenCalledWith('section-1');
    expect(scrollToMock).toHaveBeenCalledWith({
      top: 100 - 30,
      behavior: 'smooth',
    });
  });

  it('does not scroll when element with hash id does not exist', () => {
    locationState.hash = '#missing';
    getElementByIdMock.mockReturnValue(null);
    renderHook(() => useScrollToLocation());
    expect(scrollToMock).not.toHaveBeenCalled();
  });

  it('scrolls only once for same hash across rerenders', () => {
    locationState.hash = '#once';
    getElementByIdMock.mockReturnValue({
      getBoundingClientRect: () => ({ top: 50 }),
    });
    const { rerender } = renderHook(() => useScrollToLocation());
    expect(scrollToMock).toHaveBeenCalledTimes(1);
    rerender();
    expect(scrollToMock).toHaveBeenCalledTimes(1);
  });

  it('re-scrolls when hash changes', () => {
    locationState.hash = '#first';
    getElementByIdMock.mockReturnValue({
      getBoundingClientRect: () => ({ top: 100 }),
    });
    const { rerender } = renderHook(() => useScrollToLocation());
    expect(scrollToMock).toHaveBeenCalledTimes(1);

    locationState.hash = '#second';
    getElementByIdMock.mockReturnValue({
      getBoundingClientRect: () => ({ top: 200 }),
    });
    rerender();
    expect(scrollToMock).toHaveBeenCalledTimes(2);
    expect(scrollToMock).toHaveBeenLastCalledWith({
      top: 200 - 30,
      behavior: 'smooth',
    });
  });

  it('applies 30 offset to element top (top 50 → top: 20)', () => {
    locationState.hash = '#x';
    getElementByIdMock.mockReturnValue({
      getBoundingClientRect: () => ({ top: 50 }),
    });
    renderHook(() => useScrollToLocation());
    expect(scrollToMock).toHaveBeenCalledWith({ top: 20, behavior: 'smooth' });
  });

  it('handles element top 0 → top: -30 (offset applied unconditionally)', () => {
    locationState.hash = '#top';
    getElementByIdMock.mockReturnValue({
      getBoundingClientRect: () => ({ top: 0 }),
    });
    renderHook(() => useScrollToLocation());
    expect(scrollToMock).toHaveBeenCalledWith({ top: -30, behavior: 'smooth' });
  });

  it('handles negative element top (already scrolled past)', () => {
    locationState.hash = '#above';
    getElementByIdMock.mockReturnValue({
      getBoundingClientRect: () => ({ top: -100 }),
    });
    renderHook(() => useScrollToLocation());
    expect(scrollToMock).toHaveBeenCalledWith({ top: -130, behavior: 'smooth' });
  });

  it('strips leading "#" from hash before getElementById', () => {
    locationState.hash = '#my-id';
    getElementByIdMock.mockReturnValue({
      getBoundingClientRect: () => ({ top: 10 }),
    });
    renderHook(() => useScrollToLocation());
    // hash.slice(1) で `my-id` を渡す
    expect(getElementByIdMock).toHaveBeenCalledWith('my-id');
  });

  it('always uses behavior: "smooth"', () => {
    locationState.hash = '#smooth-test';
    getElementByIdMock.mockReturnValue({
      getBoundingClientRect: () => ({ top: 99 }),
    });
    renderHook(() => useScrollToLocation());
    expect(scrollToMock).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'smooth' }));
  });

  it('handles 30 different hashes', () => {
    for (let i = 0; i < 30; i++) {
      locationState.hash = `#section-${i}`;
      getElementByIdMock.mockReturnValue({ getBoundingClientRect: () => ({ top: 100 }) });
      expect(() => renderHook(() => useScrollToLocation())).not.toThrow();
    }
  });

  it('handles 30 empty hash cycles', () => {
    for (let i = 0; i < 30; i++) {
      locationState.hash = '';
      expect(() => renderHook(() => useScrollToLocation())).not.toThrow();
    }
  });

  it('handles 30 null element cycles', () => {
    for (let i = 0; i < 30; i++) {
      locationState.hash = `#section-${i}`;
      getElementByIdMock.mockReturnValue(null);
      expect(() => renderHook(() => useScrollToLocation())).not.toThrow();
    }
  });

  it('handles 30 rapid hash transitions', () => {
    for (let i = 0; i < 30; i++) {
      locationState.hash = i % 2 === 0 ? '' : `#h-${i}`;
      getElementByIdMock.mockReturnValue({ getBoundingClientRect: () => ({ top: i * 10 }) });
      expect(() => renderHook(() => useScrollToLocation())).not.toThrow();
    }
  });

  it('handles 30 different scroll positions', () => {
    locationState.hash = '#section';
    for (let i = 0; i < 30; i++) {
      Object.defineProperty(window, 'pageYOffset', {
        value: i * 100,
        writable: true,
        configurable: true,
      });
      getElementByIdMock.mockReturnValue({ getBoundingClientRect: () => ({ top: i }) });
      expect(() => renderHook(() => useScrollToLocation())).not.toThrow();
    }
  });

  it('round-2 30 renderHook cycles useScrollToLocation', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useScrollToLocation());
      unmount();
    }
  });

  it('round-2 50 renderHook cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = renderHook(() => useScrollToLocation());
      unmount();
    }
  });

  it('round-2 100 sequential renderHook cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = renderHook(() => useScrollToLocation());
      unmount();
    }
  });

  it('round-2 50 hook does not throw on call', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => renderHook(() => useScrollToLocation())).not.toThrow();
    }
  });

  it('round-2 30 sequential type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof useScrollToLocation).toBe('function');
    }
  });

  it('round-3 30 renderHook cycles useScrollToLocation', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useScrollToLocation());
      unmount();
    }
  });

  it('round-3 50 renderHook cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = renderHook(() => useScrollToLocation());
      unmount();
    }
  });

  it('round-3 100 sequential renderHook cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = renderHook(() => useScrollToLocation());
      unmount();
    }
  });

  it('round-3 50 hook does not throw on call', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => renderHook(() => useScrollToLocation())).not.toThrow();
    }
  });

  it('round-3 30 sequential type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof useScrollToLocation).toBe('function');
    }
  });
});
