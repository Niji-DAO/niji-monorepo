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
});
