import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const getBlockMock = vi.fn();
const usePublicClientMock = vi.fn(() => ({ getBlock: getBlockMock }));

vi.mock('wagmi', () => ({
  usePublicClient: () => usePublicClientMock(),
}));

import { useBlockTimestamp } from './useBlockTimestamp';

describe('useBlockTimestamp', () => {
  it('returns undefined initially before fetch resolves', () => {
    getBlockMock.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useBlockTimestamp(100n));
    expect(result.current).toBeUndefined();
  });

  it('returns timestamp after getBlock resolves', async () => {
    getBlockMock.mockResolvedValue({ timestamp: 1700000000n });
    const { result } = renderHook(() => useBlockTimestamp(100n));
    await waitFor(() => expect(result.current).toBe(1700000000));
  });

  it('returns undefined when blockNumber is not provided', () => {
    getBlockMock.mockReset();
    const { result } = renderHook(() => useBlockTimestamp(undefined));
    expect(result.current).toBeUndefined();
    expect(getBlockMock).not.toHaveBeenCalled();
  });

  it('returns undefined on getBlock error (console.error sink)', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    getBlockMock.mockRejectedValue(new Error('rpc down'));
    const { result } = renderHook(() => useBlockTimestamp(100n));
    await waitFor(() => expect(errSpy).toHaveBeenCalled());
    expect(result.current).toBeUndefined();
    errSpy.mockRestore();
  });

  it('handles timestamp=0 by returning undefined (falsy guard)', async () => {
    getBlockMock.mockResolvedValue({ timestamp: 0n });
    const { result } = renderHook(() => useBlockTimestamp(100n));
    // 短時間で resolve しないことを確認 (0 || undefined)
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(result.current).toBeUndefined();
  });
});
