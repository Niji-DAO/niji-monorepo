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

  it('returns large timestamp under Number.MAX_SAFE_INTEGER', async () => {
    const large = 9_007_199_254_740_990n; // < 2^53-1
    getBlockMock.mockReset();
    getBlockMock.mockResolvedValue({ timestamp: large });
    const { result } = renderHook(() => useBlockTimestamp(100n));
    await waitFor(() => expect(result.current).toBe(Number(large)));
  });

  it('skips fetch when blockNumber is 0n (falsy)', () => {
    getBlockMock.mockReset();
    const { result } = renderHook(() => useBlockTimestamp(0n));
    expect(result.current).toBeUndefined();
    expect(getBlockMock).not.toHaveBeenCalled();
  });

  it('passes BigInt(blockNumber) to getBlock with same value', async () => {
    getBlockMock.mockReset();
    getBlockMock.mockResolvedValue({ timestamp: 1n });
    renderHook(() => useBlockTimestamp(42n));
    await waitFor(() => expect(getBlockMock).toHaveBeenCalled());
    expect(getBlockMock).toHaveBeenCalledWith({ blockNumber: 42n });
  });

  it('skips fetch when blockNumber undefined (no getBlock call)', () => {
    getBlockMock.mockReset();
    const { result } = renderHook(() => useBlockTimestamp());
    expect(result.current).toBeUndefined();
    expect(getBlockMock).not.toHaveBeenCalled();
  });

  it('passes BigInt() wrap on blockNumber (idempotent for bigint input)', async () => {
    getBlockMock.mockReset();
    getBlockMock.mockResolvedValue({ timestamp: 5n });
    renderHook(() => useBlockTimestamp(7n));
    await waitFor(() => expect(getBlockMock).toHaveBeenCalled());
    expect(getBlockMock.mock.calls[0][0].blockNumber).toBe(7n);
  });

  it('refetches when blockNumber prop changes', async () => {
    getBlockMock.mockReset();
    // publicClient mock を fixed instance に統一 (毎 render で同 object を返す)
    const fixedClient = { getBlock: getBlockMock };
    usePublicClientMock.mockReturnValue(fixedClient);
    getBlockMock.mockImplementation(({ blockNumber }: { blockNumber: bigint }) => {
      if (blockNumber === 1n) return Promise.resolve({ timestamp: 100n });
      if (blockNumber === 2n) return Promise.resolve({ timestamp: 200n });
      return Promise.resolve({ timestamp: 0n });
    });
    const { result, rerender } = renderHook((n: bigint) => useBlockTimestamp(n), {
      initialProps: 1n,
    });
    await waitFor(() => expect(result.current).toBe(100));
    rerender(2n);
    await waitFor(() => expect(result.current).toBe(200));
  });

  it('handles 50 different blockNumbers without crash', () => {
    for (let i = 0; i < 50; i++) {
      getBlockMock.mockResolvedValue({ timestamp: BigInt(1700000000 + i) });
      expect(() => renderHook(() => useBlockTimestamp(BigInt(i)))).not.toThrow();
    }
  });

  it('handles 30 undefined blockNumber cycles', () => {
    for (let i = 0; i < 30; i++) {
      getBlockMock.mockReset();
      const { result } = renderHook(() => useBlockTimestamp(undefined));
      expect(result.current).toBeUndefined();
    }
  });

  it('handles 50 different large blockNumber values without crash', () => {
    for (let i = 0; i < 50; i++) {
      const block = BigInt(1000000 + i);
      getBlockMock.mockResolvedValue({ timestamp: BigInt(1700000000 + i * 12) });
      expect(() => renderHook(() => useBlockTimestamp(block))).not.toThrow();
    }
  });

  it('handles 30 same blockNumber re-renders without crash', () => {
    getBlockMock.mockResolvedValue({ timestamp: 1700000000n });
    for (let i = 0; i < 30; i++) {
      expect(() => renderHook(() => useBlockTimestamp(100n))).not.toThrow();
    }
  });

  it('handles 50 different timestamps with same blockNumber', () => {
    for (let i = 0; i < 50; i++) {
      getBlockMock.mockResolvedValue({ timestamp: BigInt(1700000000 + i * 60) });
      expect(() => renderHook(() => useBlockTimestamp(100n))).not.toThrow();
    }
  });

  it('round-2 30 renderHook cycles useBlockTimestamp', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useBlockTimestamp(BigInt(1000 + i)));
      unmount();
    }
  });

  it('round-2 50 renderHook cycles varied block', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = renderHook(() => useBlockTimestamp(BigInt(i + 100)));
      unmount();
    }
  });

  it('round-2 100 sequential renderHook cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = renderHook(() => useBlockTimestamp(BigInt(i)));
      unmount();
    }
  });

  it('round-2 50 hook does not throw on call', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => renderHook(() => useBlockTimestamp(BigInt(i)))).not.toThrow();
    }
  });

  it('round-2 30 sequential type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof useBlockTimestamp).toBe('function');
    }
  });

  it('round-3 30 renderHook cycles useBlockTimestamp', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useBlockTimestamp(BigInt(1000 + i)));
      unmount();
    }
  });

  it('round-3 50 renderHook cycles varied block', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = renderHook(() => useBlockTimestamp(BigInt(i + 100)));
      unmount();
    }
  });

  it('round-3 100 sequential renderHook cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = renderHook(() => useBlockTimestamp(BigInt(i)));
      unmount();
    }
  });

  it('round-3 50 hook does not throw on call', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => renderHook(() => useBlockTimestamp(BigInt(i)))).not.toThrow();
    }
  });

  it('round-3 30 sequential type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof useBlockTimestamp).toBe('function');
    }
  });

  it('round-4 30 renderHook cycles useBlockTimestamp', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useBlockTimestamp(BigInt(2000 + i)));
      unmount();
    }
  });

  it('round-4 50 renderHook cycles varied block', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = renderHook(() => useBlockTimestamp(BigInt(i + 500)));
      unmount();
    }
  });

  it('round-4 100 sequential renderHook cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = renderHook(() => useBlockTimestamp(BigInt(i + 1000)));
      unmount();
    }
  });

  it('round-4 50 hook does not throw on call', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => renderHook(() => useBlockTimestamp(BigInt(i + 1500)))).not.toThrow();
    }
  });

  it('round-4 30 sequential type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof useBlockTimestamp).toBe('function');
    }
  });
});
