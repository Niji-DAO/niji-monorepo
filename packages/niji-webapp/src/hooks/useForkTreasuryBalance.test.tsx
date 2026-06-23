import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const useBalanceMock = vi.fn();
const useReadStEthBalanceOfMock = vi.fn();

vi.mock('wagmi', () => ({
  useBalance: (args: unknown) => useBalanceMock(args),
}));

vi.mock('@niji/sdk/react', () => ({
  useReadStEthBalanceOf: (args: unknown) => useReadStEthBalanceOfMock(args),
}));

import useForkTreasuryBalance from './useForkTreasuryBalance';

const TREASURY = '0x5FbDB2315678afecb367f032d93F642f64180aa3' as const;

describe('useForkTreasuryBalance', () => {
  it('returns ETH + stETH sum when both are present', () => {
    useBalanceMock.mockReturnValue({ data: { value: 1_000n } });
    useReadStEthBalanceOfMock.mockReturnValue({ data: 500n });
    const { result } = renderHook(() => useForkTreasuryBalance(TREASURY));
    expect(result.current).toBe(1_500n);
  });

  it('returns 0n when both are undefined', () => {
    useBalanceMock.mockReturnValue({ data: undefined });
    useReadStEthBalanceOfMock.mockReturnValue({ data: undefined });
    const { result } = renderHook(() => useForkTreasuryBalance(TREASURY));
    expect(result.current).toBe(0n);
  });

  it('falls back to 0n for missing ETH only', () => {
    useBalanceMock.mockReturnValue({ data: undefined });
    useReadStEthBalanceOfMock.mockReturnValue({ data: 300n });
    const { result } = renderHook(() => useForkTreasuryBalance(TREASURY));
    expect(result.current).toBe(300n);
  });

  it('falls back to 0n for missing stETH only', () => {
    useBalanceMock.mockReturnValue({ data: { value: 700n } });
    useReadStEthBalanceOfMock.mockReturnValue({ data: undefined });
    const { result } = renderHook(() => useForkTreasuryBalance(TREASURY));
    expect(result.current).toBe(700n);
  });

  it('handles undefined treasuryContractAddress', () => {
    useBalanceMock.mockReturnValue({ data: undefined });
    useReadStEthBalanceOfMock.mockReturnValue({ data: undefined });
    const { result } = renderHook(() => useForkTreasuryBalance(undefined));
    expect(result.current).toBe(0n);
  });

  it('passes args correctly when address is provided', () => {
    useBalanceMock.mockReturnValue({ data: { value: 0n } });
    useReadStEthBalanceOfMock.mockReturnValue({ data: 0n });
    renderHook(() => useForkTreasuryBalance(TREASURY));
    expect(useBalanceMock).toHaveBeenCalledWith({ address: TREASURY });
    expect(useReadStEthBalanceOfMock).toHaveBeenCalledWith({
      args: [TREASURY],
      query: { enabled: true },
    });
  });

  it('disables stETH query when no address', () => {
    useBalanceMock.mockReturnValue({ data: undefined });
    useReadStEthBalanceOfMock.mockReturnValue({ data: undefined });
    renderHook(() => useForkTreasuryBalance(undefined));
    expect(useReadStEthBalanceOfMock).toHaveBeenCalledWith({
      args: undefined,
      query: { enabled: false },
    });
  });
});
