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
});
