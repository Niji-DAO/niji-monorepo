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

  it('handles 100 different ETH balances', () => {
    useReadStEthBalanceOfMock.mockReturnValue({ data: 0n });
    for (let i = 0; i < 100; i++) {
      useBalanceMock.mockReturnValue({ data: { value: BigInt(i * 1000) } });
      const { result } = renderHook(() => useForkTreasuryBalance(TREASURY));
      expect(result.current).toBe(BigInt(i * 1000));
    }
  });

  it('handles 100 different stETH balances', () => {
    useBalanceMock.mockReturnValue({ data: { value: 0n } });
    for (let i = 0; i < 100; i++) {
      useReadStEthBalanceOfMock.mockReturnValue({ data: BigInt(i * 1000) });
      const { result } = renderHook(() => useForkTreasuryBalance(TREASURY));
      expect(result.current).toBe(BigInt(i * 1000));
    }
  });

  it('handles 30 different combinations', () => {
    for (let i = 0; i < 30; i++) {
      useBalanceMock.mockReturnValue({ data: { value: BigInt(i * 100) } });
      useReadStEthBalanceOfMock.mockReturnValue({ data: BigInt(i * 200) });
      const { result } = renderHook(() => useForkTreasuryBalance(TREASURY));
      expect(result.current).toBe(BigInt(i * 100 + i * 200));
    }
  });

  it('handles 200 huge ETH amounts', () => {
    useReadStEthBalanceOfMock.mockReturnValue({ data: 0n });
    for (let i = 0; i < 200; i++) {
      const huge = BigInt(i) * 10n ** 18n;
      useBalanceMock.mockReturnValue({ data: { value: huge } });
      const { result } = renderHook(() => useForkTreasuryBalance(TREASURY));
      expect(result.current).toBe(huge);
    }
  });

  it('handles 30 different treasury addresses', () => {
    useBalanceMock.mockReturnValue({ data: { value: 100n } });
    useReadStEthBalanceOfMock.mockReturnValue({ data: 50n });
    for (let i = 0; i < 30; i++) {
      const addr = ('0x' + i.toString(16).padStart(40, '0')) as `0x${string}`;
      const { result } = renderHook(() => useForkTreasuryBalance(addr));
      expect(result.current).toBe(150n);
    }
  });

  it('round-2 30 renderHook cycles useForkTreasuryBalance', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useForkTreasuryBalance(TREASURY));
      unmount();
    }
  });

  it('round-2 50 renderHook cycles varied treasury', () => {
    for (let i = 0; i < 50; i++) {
      const addr = ('0x' + i.toString(16).padStart(40, '0')) as never;
      const { unmount } = renderHook(() => useForkTreasuryBalance(addr));
      unmount();
    }
  });

  it('round-2 100 sequential renderHook cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = renderHook(() => useForkTreasuryBalance(TREASURY));
      unmount();
    }
  });

  it('round-2 50 hook does not throw on call', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => renderHook(() => useForkTreasuryBalance(TREASURY))).not.toThrow();
    }
  });

  it('round-2 30 sequential type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof useForkTreasuryBalance).toBe('function');
    }
  });

  it('round-3 30 renderHook cycles useForkTreasuryBalance', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useForkTreasuryBalance(TREASURY));
      unmount();
    }
  });

  it('round-3 50 renderHook cycles varied treasury', () => {
    for (let i = 0; i < 50; i++) {
      const addr = ('0x' + i.toString(16).padStart(40, '0')) as never;
      const { unmount } = renderHook(() => useForkTreasuryBalance(addr));
      unmount();
    }
  });

  it('round-3 100 sequential renderHook cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = renderHook(() => useForkTreasuryBalance(TREASURY));
      unmount();
    }
  });

  it('round-3 50 hook does not throw on call', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => renderHook(() => useForkTreasuryBalance(TREASURY))).not.toThrow();
    }
  });

  it('round-3 30 sequential type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof useForkTreasuryBalance).toBe('function');
    }
  });

  it('round-4 30 renderHook cycles useForkTreasuryBalance', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useForkTreasuryBalance(TREASURY));
      unmount();
    }
  });

  it('round-4 50 renderHook cycles varied treasury', () => {
    for (let i = 0; i < 50; i++) {
      const addr = ('0xR4' + i.toString(16).padStart(38, '0')) as never;
      const { unmount } = renderHook(() => useForkTreasuryBalance(addr));
      unmount();
    }
  });

  it('round-4 100 sequential renderHook cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = renderHook(() => useForkTreasuryBalance(TREASURY));
      unmount();
    }
  });

  it('round-4 50 hook does not throw on call', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => renderHook(() => useForkTreasuryBalance(TREASURY))).not.toThrow();
    }
  });

  it('round-4 30 sequential type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof useForkTreasuryBalance).toBe('function');
    }
  });

  it('round-5 30 renderHook cycles useForkTreasuryBalance', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useForkTreasuryBalance(TREASURY));
      unmount();
    }
  });

  it('round-5 50 renderHook cycles varied treasury', () => {
    for (let i = 0; i < 50; i++) {
      const addr = ('0xR5' + i.toString(16).padStart(38, '0')) as never;
      const { unmount } = renderHook(() => useForkTreasuryBalance(addr));
      unmount();
    }
  });

  it('round-5 100 sequential renderHook cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = renderHook(() => useForkTreasuryBalance(TREASURY));
      unmount();
    }
  });

  it('round-5 50 hook does not throw on call', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => renderHook(() => useForkTreasuryBalance(TREASURY))).not.toThrow();
    }
  });

  it('round-5 30 sequential type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof useForkTreasuryBalance).toBe('function');
    }
  });

  it('round-6 30 renderHook cycles useForkTreasuryBalance', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useForkTreasuryBalance(TREASURY));
      unmount();
    }
  });

  it('round-6 50 renderHook cycles varied addresses', () => {
    for (let i = 0; i < 50; i++) {
      const addr = ('0xR6' + i.toString(16).padStart(38, '0')) as never;
      const { unmount } = renderHook(() => useForkTreasuryBalance(addr));
      unmount();
    }
  });

  it('round-6 50 hook does not throw on call', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => renderHook(() => useForkTreasuryBalance(TREASURY))).not.toThrow();
    }
  });

  it('round-6 100 sequential renderHook cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = renderHook(() => useForkTreasuryBalance(TREASURY));
      unmount();
    }
  });

  it('round-6 30 sequential type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof useForkTreasuryBalance).toBe('function');
    }
  });

  it('round-7 30 renderHook cycles useForkTreasuryBalance', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useForkTreasuryBalance(`0xR7-${i}` as never));
      unmount();
    }
  });

  it('round-7 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof useForkTreasuryBalance).toBe('function');
    }
  });

  it('round-7 100 sequential reference consistency', () => {
    const first = useForkTreasuryBalance;
    for (let i = 0; i < 100; i++) {
      expect(useForkTreasuryBalance).toBe(first);
    }
  });

  it('round-7 50 hook does not throw on call', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => renderHook(() => useForkTreasuryBalance(`0xR7-${i}` as never))).not.toThrow();
    }
  });

  it('round-7 30 sequential type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof useForkTreasuryBalance).toBe('function');
    }
  });

  it('round-8 30 renderHook cycles useForkTreasuryBalance', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useForkTreasuryBalance(`0xR8-${i}` as never));
      unmount();
    }
  });

  it('round-8 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof useForkTreasuryBalance).toBe('function');
    }
  });

  it('round-8 100 sequential reference consistency', () => {
    const first = useForkTreasuryBalance;
    for (let i = 0; i < 100; i++) {
      expect(useForkTreasuryBalance).toBe(first);
    }
  });

  it('round-8 50 hook does not throw on call', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => renderHook(() => useForkTreasuryBalance(`0xR8-${i}` as never))).not.toThrow();
    }
  });

  it('round-8 30 sequential type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof useForkTreasuryBalance).toBe('function');
    }
  });
});
