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
});
