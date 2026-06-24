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

  it('handles very large bigint sum (10000 ETH equivalent)', () => {
    const tenThousandEth = 10_000_000_000_000_000_000_000n; // 10000 * 1e18
    useBalanceMock.mockReturnValue({ data: { value: tenThousandEth } });
    useReadStEthBalanceOfMock.mockReturnValue({ data: tenThousandEth });
    const { result } = renderHook(() => useForkTreasuryBalance(TREASURY));
    expect(result.current).toBe(tenThousandEth * 2n);
  });

  it('returns 0n when both data values are explicitly 0n', () => {
    useBalanceMock.mockReturnValue({ data: { value: 0n } });
    useReadStEthBalanceOfMock.mockReturnValue({ data: 0n });
    const { result } = renderHook(() => useForkTreasuryBalance(TREASURY));
    expect(result.current).toBe(0n);
  });

  it('handles multiple renderHook invocations independently', () => {
    useBalanceMock.mockReturnValue({ data: { value: 100n } });
    useReadStEthBalanceOfMock.mockReturnValue({ data: 50n });
    const { result: r1 } = renderHook(() => useForkTreasuryBalance(TREASURY));
    const { result: r2 } = renderHook(() => useForkTreasuryBalance(TREASURY));
    expect(r1.current).toBe(150n);
    expect(r2.current).toBe(150n);
  });

  it('returns stETH only when ETH data.value is undefined (data exists but no value)', () => {
    useBalanceMock.mockReturnValue({ data: { value: undefined } });
    useReadStEthBalanceOfMock.mockReturnValue({ data: 500n });
    const { result } = renderHook(() => useForkTreasuryBalance(TREASURY));
    // `ethBalanceData?.value ?? 0n` で undefined → 0n、 stETH 500 のみ
    expect(result.current).toBe(500n);
  });
});
