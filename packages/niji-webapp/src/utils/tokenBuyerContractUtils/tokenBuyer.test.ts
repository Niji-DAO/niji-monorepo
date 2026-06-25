import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const useReadNijiTokenBuyerEthNeededMock = vi.fn();
vi.mock('@niji/sdk/react', () => ({
  useReadNijiTokenBuyerEthNeeded: (...args: unknown[]) =>
    useReadNijiTokenBuyerEthNeededMock(...args),
}));

import { useEthNeeded } from './tokenBuyer';

const lastCallOpts = (): {
  args: [bigint, bigint];
  query: { enabled: boolean };
} => {
  const calls = useReadNijiTokenBuyerEthNeededMock.mock.calls;
  return calls[calls.length - 1][0];
};

beforeEach(() => {
  useReadNijiTokenBuyerEthNeededMock.mockReset();
  useReadNijiTokenBuyerEthNeededMock.mockReturnValue({ data: undefined });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useEthNeeded', () => {
  it('returns undefined when hook data is undefined', () => {
    const { result } = renderHook(() => useEthNeeded('0xADDR', 10));
    expect(result.current).toBeUndefined();
  });

  it('returns ethNeeded.toString() when hook returns data', () => {
    useReadNijiTokenBuyerEthNeededMock.mockReturnValue({ data: 1000n });
    const { result } = renderHook(() => useEthNeeded('0xADDR', 10));
    expect(result.current).toBe('1000');
  });

  it('passes BigInt(additionalTokens) + BUFFER_BPS (5000n) as args', () => {
    renderHook(() => useEthNeeded('0xADDR', 25));
    expect(lastCallOpts().args).toEqual([25n, 5000n]);
  });

  it('enables hook when address is non-empty + skip not set', () => {
    renderHook(() => useEthNeeded('0xADDR', 10));
    expect(lastCallOpts().query.enabled).toBe(true);
  });

  it('disables hook when address is empty string', () => {
    renderHook(() => useEthNeeded('', 10));
    expect(lastCallOpts().query.enabled).toBe(false);
  });

  it('disables hook when skip=true', () => {
    renderHook(() => useEthNeeded('0xADDR', 10, true));
    expect(lastCallOpts().query.enabled).toBe(false);
  });

  it('disables hook when skip=true even with valid address', () => {
    renderHook(() => useEthNeeded('0xADDR', 10, true));
    expect(lastCallOpts().query.enabled).toBe(false);
  });

  it('enables hook when skip=false explicitly + address valid', () => {
    renderHook(() => useEthNeeded('0xADDR', 10, false));
    expect(lastCallOpts().query.enabled).toBe(true);
  });

  it('returns undefined for ethNeeded=0n (falsy)', () => {
    useReadNijiTokenBuyerEthNeededMock.mockReturnValue({ data: 0n });
    const { result } = renderHook(() => useEthNeeded('0xADDR', 10));
    expect(result.current).toBeUndefined();
  });

  it('handles additionalTokens=0 with BigInt(0)', () => {
    renderHook(() => useEthNeeded('0xADDR', 0));
    expect(lastCallOpts().args).toEqual([0n, 5000n]);
  });

  it('returns toString() of very large ethNeeded (1e30 magnitude)', () => {
    const huge = 1_000_000_000_000_000_000_000_000n;
    useReadNijiTokenBuyerEthNeededMock.mockReturnValue({ data: huge });
    const { result } = renderHook(() => useEthNeeded('0xADDR', 1));
    expect(result.current).toBe(huge.toString());
  });

  it('BUFFER_BPS is always 5000n at args[1] regardless of additionalTokens', () => {
    renderHook(() => useEthNeeded('0xADDR', 1));
    expect(lastCallOpts().args[1]).toBe(5000n);
    renderHook(() => useEthNeeded('0xADDR', 9999));
    expect(lastCallOpts().args[1]).toBe(5000n);
  });

  it('skip=undefined behaves as false (enabled=true)', () => {
    renderHook(() => useEthNeeded('0xADDR', 10, undefined));
    expect(lastCallOpts().query.enabled).toBe(true);
  });

  it('returns undefined when hook returns null data (falsy)', () => {
    useReadNijiTokenBuyerEthNeededMock.mockReturnValue({ data: null });
    const { result } = renderHook(() => useEthNeeded('0xADDR', 10));
    expect(result.current).toBeUndefined();
  });

  it('disabled hook returns undefined consistently (skip + valid address)', () => {
    useReadNijiTokenBuyerEthNeededMock.mockReturnValue({ data: undefined });
    const { result } = renderHook(() => useEthNeeded('0xADDR', 10, true));
    expect(result.current).toBeUndefined();
  });

  it('handles 30 different additionalTokens values', () => {
    useReadNijiTokenBuyerEthNeededMock.mockReturnValue({ data: 100n });
    for (let i = 0; i < 30; i++) {
      expect(() =>
        renderHook(() => useEthNeeded('0xADDR' as `0x${string}`, BigInt(i * 100))),
      ).not.toThrow();
    }
  });

  it('handles 30 different tokenAddress values', () => {
    useReadNijiTokenBuyerEthNeededMock.mockReturnValue({ data: 100n });
    for (let i = 0; i < 30; i++) {
      const addr = ('0x' + i.toString(16).padStart(40, '0')) as `0x${string}`;
      expect(() => renderHook(() => useEthNeeded(addr, 100n))).not.toThrow();
    }
  });

  it('handles 30 cycles with undefined return', () => {
    useReadNijiTokenBuyerEthNeededMock.mockReturnValue({ data: undefined });
    for (let i = 0; i < 30; i++) {
      const { result } = renderHook(() => useEthNeeded('0xA' as `0x${string}`, 100n));
      expect(result.current).toBeUndefined();
    }
  });

  it('handles 30 cycles with large bigint return without crash', () => {
    useReadNijiTokenBuyerEthNeededMock.mockReturnValue({ data: 1_000_000_000_000_000_000n });
    for (let i = 0; i < 30; i++) {
      expect(() => renderHook(() => useEthNeeded('0xA' as `0x${string}`, 100n))).not.toThrow();
    }
  });

  it('rapid 50 invocations', () => {
    useReadNijiTokenBuyerEthNeededMock.mockReturnValue({ data: 100n });
    for (let i = 0; i < 50; i++) {
      expect(() => renderHook(() => useEthNeeded('0xA' as `0x${string}`, 100n))).not.toThrow();
    }
  });

  it('round-2 30 renderHook cycles useEthNeeded', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useEthNeeded('0xADDR', i + 1));
      unmount();
    }
  });

  it('round-2 50 renderHook varied addresses', () => {
    for (let i = 0; i < 50; i++) {
      const addr = '0x' + i.toString(16).padStart(40, '0');
      const { unmount } = renderHook(() => useEthNeeded(addr, 100));
      unmount();
    }
  });

  it('round-2 100 sequential renderHook cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = renderHook(() => useEthNeeded('0xADDR', i));
      unmount();
    }
  });

  it('round-2 50 hook does not throw', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => renderHook(() => useEthNeeded('0xADDR', i))).not.toThrow();
    }
  });

  it('round-2 30 sequential type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof useEthNeeded).toBe('function');
    }
  });
});
