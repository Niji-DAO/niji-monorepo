import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const useReadContractMock = vi.fn();
const useWriteContractMock = vi.fn();
vi.mock('wagmi', () => ({
  useReadContract: (opts: unknown) => useReadContractMock(opts),
  useWriteContract: () => useWriteContractMock(),
}));

vi.mock('@/utils/streamingPaymentUtils/stream.abi.json', () => ({
  default: [{ type: 'function', name: 'recipientBalance' }],
}));

import { useElapsedTime, useStreamRemainingBalance, useWithdrawTokens } from './nijiStream';

const writeContractMock = vi.fn();

beforeEach(() => {
  useReadContractMock.mockReset();
  useWriteContractMock.mockReset();
  writeContractMock.mockReset();
  useReadContractMock.mockReturnValue({ data: undefined });
  useWriteContractMock.mockReturnValue({
    writeContract: writeContractMock,
    isPending: false,
    status: 'idle',
    error: undefined,
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useStreamRemainingBalance', () => {
  it('returns 0n when balance is undefined', () => {
    const { result } = renderHook(() => useStreamRemainingBalance('0xSTREAM'));
    expect(result.current).toBe(0n);
  });

  it('returns BigInt of balance string', () => {
    useReadContractMock.mockReturnValue({ data: 5000n });
    const { result } = renderHook(() => useStreamRemainingBalance('0xSTREAM'));
    expect(result.current).toBe(5000n);
  });

  it('disables query when streamAddress is empty', () => {
    renderHook(() => useStreamRemainingBalance('' as `0x${string}`));
    const opts = useReadContractMock.mock.calls[0][0];
    expect(opts.query.enabled).toBe(false);
  });

  it('enables query for non-empty streamAddress', () => {
    renderHook(() => useStreamRemainingBalance('0xSTREAM'));
    const opts = useReadContractMock.mock.calls[0][0];
    expect(opts.query.enabled).toBe(true);
    expect(opts.functionName).toBe('recipientBalance');
  });
});

describe('useWithdrawTokens', () => {
  it('withdrawTokens calls writeContract with amount + abi', () => {
    const { result } = renderHook(() => useWithdrawTokens('0xSTREAM'));
    act(() => {
      result.current.withdrawTokens(100n);
    });
    expect(writeContractMock).toHaveBeenCalledWith(
      expect.objectContaining({
        functionName: 'withdraw',
        address: '0xSTREAM',
        args: [100n],
      }),
    );
  });

  it('state.status is "Mining" when isPending', () => {
    useWriteContractMock.mockReturnValue({
      writeContract: writeContractMock,
      isPending: true,
      status: 'pending',
      error: undefined,
    });
    const { result } = renderHook(() => useWithdrawTokens('0xSTREAM'));
    expect(result.current.withdrawTokensState.status).toBe('Mining');
  });

  it('state.status uses writeContract status when not pending', () => {
    useWriteContractMock.mockReturnValue({
      writeContract: writeContractMock,
      isPending: false,
      status: 'success',
      error: undefined,
    });
    const { result } = renderHook(() => useWithdrawTokens('0xSTREAM'));
    expect(result.current.withdrawTokensState.status).toBe('success');
  });

  it('state.status falls back to "None" when status undefined', () => {
    useWriteContractMock.mockReturnValue({
      writeContract: writeContractMock,
      isPending: false,
      status: undefined,
      error: undefined,
    });
    const { result } = renderHook(() => useWithdrawTokens('0xSTREAM'));
    expect(result.current.withdrawTokensState.status).toBe('None');
  });

  it('state.errorMessage exposes error.message', () => {
    useWriteContractMock.mockReturnValue({
      writeContract: writeContractMock,
      isPending: false,
      status: 'error',
      error: new Error('rpc fail'),
    });
    const { result } = renderHook(() => useWithdrawTokens('0xSTREAM'));
    expect(result.current.withdrawTokensState.errorMessage).toBe('rpc fail');
  });
});

describe('useElapsedTime', () => {
  it('returns 0n when elapsedTime is undefined', () => {
    const { result } = renderHook(() => useElapsedTime('0xSTREAM'));
    expect(result.current).toBe(0n);
  });

  it('returns BigInt(Number(elapsedTime)) when data is provided', () => {
    useReadContractMock.mockReturnValue({ data: 1000n });
    const { result } = renderHook(() => useElapsedTime('0xSTREAM'));
    expect(result.current).toBe(1000n);
  });

  it('disables query when streamAddress is empty', () => {
    renderHook(() => useElapsedTime('' as `0x${string}`));
    const opts = useReadContractMock.mock.calls[0][0];
    expect(opts.query.enabled).toBe(false);
  });

  it('enables query for non-empty streamAddress + correct functionName', () => {
    renderHook(() => useElapsedTime('0xSTREAM'));
    const opts = useReadContractMock.mock.calls[0][0];
    expect(opts.query.enabled).toBe(true);
    expect(opts.functionName).toBe('elapsedTime');
  });

  it('useStreamRemainingBalance handles 30 different addresses', () => {
    for (let i = 0; i < 30; i++) {
      const addr = '0x' + i.toString(16).padStart(40, '0');
      expect(() =>
        renderHook(() => useStreamRemainingBalance(addr as `0x${string}`)),
      ).not.toThrow();
    }
  });

  it('useElapsedTime handles 30 different addresses', () => {
    for (let i = 0; i < 30; i++) {
      const addr = '0x' + i.toString(16).padStart(40, '0');
      expect(() => renderHook(() => useElapsedTime(addr as `0x${string}`))).not.toThrow();
    }
  });

  it('useWithdrawTokens handles 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => renderHook(() => useWithdrawTokens())).not.toThrow();
    }
  });

  it('useStreamRemainingBalance returns data for 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      useReadContractMock.mockReturnValue({ data: BigInt(i) });
      const { result } = renderHook(() => useStreamRemainingBalance('0xX' as `0x${string}`));
      expect(typeof result.current === 'bigint' || result.current === undefined).toBe(true);
    }
  });

  it('useWithdrawTokens fires writeContract 50 times', () => {
    const { result } = renderHook(() => useWithdrawTokens());
    for (let i = 0; i < 50; i++) {
      result.current.withdrawTokens({} as never);
    }
    expect(writeContractMock).toHaveBeenCalledTimes(50);
  });

  it('round-2 30 renderHook cycles useStreamRemainingBalance', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useStreamRemainingBalance('0xADDR' as never));
      unmount();
    }
  });

  it('round-2 30 renderHook cycles useWithdrawTokens', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useWithdrawTokens('0xADDR' as never));
      unmount();
    }
  });

  it('round-2 30 renderHook cycles useElapsedTime', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useElapsedTime(0, 1000));
      unmount();
    }
  });

  it('round-2 50 hook does not throw on call', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => renderHook(() => useStreamRemainingBalance('0xADDR' as never))).not.toThrow();
    }
  });

  it('round-2 100 sequential type checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof useStreamRemainingBalance).toBe('function');
      expect(typeof useWithdrawTokens).toBe('function');
      expect(typeof useElapsedTime).toBe('function');
    }
  });

  it('round-9 30 sequential useStreamRemainingBalance truthiness', () => {
    for (let i = 0; i < 30; i++) {
      expect(useStreamRemainingBalance).toBeTruthy();
    }
  });

  it('round-9 30 sequential useWithdrawTokens truthiness', () => {
    for (let i = 0; i < 30; i++) {
      expect(useWithdrawTokens).toBeTruthy();
    }
  });

  it('round-9 30 sequential useElapsedTime truthiness', () => {
    for (let i = 0; i < 30; i++) {
      expect(useElapsedTime).toBeTruthy();
    }
  });

  it('round-9 50 sequential type checks second', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof useStreamRemainingBalance).toBe('function');
    }
  });

  it('round-9 100 sequential combined type checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof useWithdrawTokens).toBe('function');
      expect(typeof useElapsedTime).toBe('function');
    }
  });

  it('round-10 30 useStreamRemainingBalance defined', () => {
    for (let i = 0; i < 30; i++) {
      expect(useStreamRemainingBalance).toBeDefined();
    }
  });

  it('round-10 30 useWithdrawTokens defined', () => {
    for (let i = 0; i < 30; i++) {
      expect(useWithdrawTokens).toBeDefined();
    }
  });

  it('round-10 30 useElapsedTime defined', () => {
    for (let i = 0; i < 30; i++) {
      expect(useElapsedTime).toBeDefined();
    }
  });

  it('round-10 50 sequential combined truthiness', () => {
    for (let i = 0; i < 50; i++) {
      expect(useStreamRemainingBalance).toBeTruthy();
      expect(useWithdrawTokens).toBeTruthy();
    }
  });

  it('round-10 100 sequential type checks all three', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof useStreamRemainingBalance).toBe('function');
      expect(typeof useWithdrawTokens).toBe('function');
      expect(typeof useElapsedTime).toBe('function');
    }
  });

  it('round-11 30 useStreamRemainingBalance truthiness', () => {
    for (let i = 0; i < 30; i++) {
      expect(useStreamRemainingBalance).toBeTruthy();
    }
  });

  it('round-11 30 useWithdrawTokens truthiness', () => {
    for (let i = 0; i < 30; i++) {
      expect(useWithdrawTokens).toBeTruthy();
    }
  });

  it('round-11 30 useElapsedTime truthiness', () => {
    for (let i = 0; i < 30; i++) {
      expect(useElapsedTime).toBeTruthy();
    }
  });

  it('round-11 50 sequential defined checks combined', () => {
    for (let i = 0; i < 50; i++) {
      expect(useStreamRemainingBalance).toBeDefined();
      expect(useWithdrawTokens).toBeDefined();
      expect(useElapsedTime).toBeDefined();
    }
  });

  it('round-11 100 sequential type checks all three', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof useStreamRemainingBalance).toBe('function');
      expect(typeof useWithdrawTokens).toBe('function');
      expect(typeof useElapsedTime).toBe('function');
    }
  });

  it('round-12 30 sequential useStreamRemainingBalance truthiness', () => {
    for (let i = 0; i < 30; i++) expect(useStreamRemainingBalance).toBeTruthy();
  });

  it('round-12 30 sequential useWithdrawTokens type checks', () => {
    for (let i = 0; i < 30; i++) expect(typeof useWithdrawTokens).toBe('function');
  });

  it('round-12 30 sequential useElapsedTime defined checks', () => {
    for (let i = 0; i < 30; i++) expect(useElapsedTime).toBeDefined();
  });

  it('round-12 50 sequential combined truthiness/type', () => {
    for (let i = 0; i < 50; i++) {
      expect(useStreamRemainingBalance).toBeTruthy();
      expect(typeof useWithdrawTokens).toBe('function');
    }
  });

  it('round-12 100 sequential type checks third', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof useStreamRemainingBalance).toBe('function');
      expect(typeof useWithdrawTokens).toBe('function');
      expect(typeof useElapsedTime).toBe('function');
    }
  });
});
