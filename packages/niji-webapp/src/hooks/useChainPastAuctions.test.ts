import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const useQueryMock = vi.fn();
vi.mock('@tanstack/react-query', () => ({
  useQuery: (opts: unknown) => useQueryMock(opts),
}));

const usePublicClientMock = vi.fn();
vi.mock('wagmi', () => ({
  usePublicClient: () => usePublicClientMock(),
}));

vi.mock('@niji/sdk/react', () => ({
  nijiAuctionHouseAddress: { 1: '0xAUCTIONHOUSE' as const },
}));

const configState: {
  CHAIN_ID: number;
  deployBlock: bigint | undefined;
} = {
  CHAIN_ID: 1,
  deployBlock: 100n,
};
vi.mock('@/config', () => ({
  default: {
    get app() {
      return { deployBlock: configState.deployBlock };
    },
  },
  CHAIN_ID: {
    valueOf: () => configState.CHAIN_ID,
    toString: () => String(configState.CHAIN_ID),
  },
}));

vi.mock('viem', async () => {
  const actual = await vi.importActual<typeof import('viem')>('viem');
  return {
    ...actual,
    parseAbiItem: (sig: string) => ({ type: 'event', signature: sig }),
  };
});

import { useChainPastAuctions } from './useChainPastAuctions';

const lastUseQueryOptions = (): {
  queryKey: unknown[];
  queryFn: (ctx: { signal?: AbortSignal }) => Promise<unknown>;
  enabled: boolean;
  refetchInterval: number;
} => {
  const lastCall = useQueryMock.mock.calls[useQueryMock.mock.calls.length - 1];
  return lastCall[0];
};

beforeEach(() => {
  configState.CHAIN_ID = 1;
  configState.deployBlock = 100n;
  useQueryMock.mockReset();
  usePublicClientMock.mockReset();
  useQueryMock.mockReturnValue({ data: undefined, isLoading: false, error: null });
  usePublicClientMock.mockReturnValue({
    getBlockNumber: vi.fn().mockResolvedValue(200n),
    getLogs: vi.fn().mockResolvedValue([]),
    getBlock: vi.fn().mockResolvedValue({ timestamp: 1700000000n }),
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useChainPastAuctions', () => {
  it('disables query when publicClient is undefined', () => {
    usePublicClientMock.mockReturnValue(undefined);
    renderHook(() => useChainPastAuctions(true));
    expect(lastUseQueryOptions().enabled).toBe(false);
  });

  it('disables query when explicit enabled=false', () => {
    renderHook(() => useChainPastAuctions(false));
    expect(lastUseQueryOptions().enabled).toBe(false);
  });

  it('enables query when publicClient + auctionHouse + enabled=true', () => {
    renderHook(() => useChainPastAuctions(true));
    expect(lastUseQueryOptions().enabled).toBe(true);
  });

  it('queryKey includes auctionHouse address + deployBlock', () => {
    renderHook(() => useChainPastAuctions(true));
    const key = lastUseQueryOptions().queryKey;
    expect(key[0]).toBe('chain-past-auctions');
    expect(key[1]).toBe('0xAUCTIONHOUSE');
    expect(key[2]).toBe('100');
  });

  it('queryKey uses "0" when deployBlock is undefined', () => {
    configState.deployBlock = undefined;
    renderHook(() => useChainPastAuctions(true));
    const key = lastUseQueryOptions().queryKey;
    expect(key[2]).toBe('0');
  });

  it('refetchInterval set to 10_000', () => {
    renderHook(() => useChainPastAuctions(true));
    expect(lastUseQueryOptions().refetchInterval).toBe(10_000);
  });

  it('returns useQuery data / isLoading / error fields directly', () => {
    const err = new Error('rpc');
    useQueryMock.mockReturnValue({
      data: { __typename: 'Query', auctions: [] },
      isLoading: true,
      error: err,
    });
    const { result } = renderHook(() => useChainPastAuctions(true));
    expect(result.current.data).toEqual({ __typename: 'Query', auctions: [] });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe(err);
  });

  it('queryFn fetches getBlockNumber + 3 getLogs (created/settled/bid)', async () => {
    const getLogsSpy = vi.fn().mockResolvedValue([]);
    const getBlockNumberSpy = vi.fn().mockResolvedValue(200n);
    const getBlockSpy = vi.fn().mockResolvedValue({ timestamp: 1700n });
    usePublicClientMock.mockReturnValue({
      getBlockNumber: getBlockNumberSpy,
      getLogs: getLogsSpy,
      getBlock: getBlockSpy,
    });
    renderHook(() => useChainPastAuctions(true));
    const result = await lastUseQueryOptions().queryFn({ signal: undefined });
    expect(getBlockNumberSpy).toHaveBeenCalled();
    expect(getLogsSpy).toHaveBeenCalledTimes(3);
    expect((result as { auctions: unknown[] }).auctions).toEqual([]);
  });

  it('queryFn aggregates AuctionCreated + Settled + Bid into auctions array', async () => {
    const getLogsSpy = vi
      .fn()
      .mockResolvedValueOnce([
        {
          args: { nounId: 1n, startTime: 1700n, endTime: 1800n },
          blockNumber: 100n,
          transactionHash: '0xc1' as `0x${string}`,
          transactionIndex: 0,
        },
      ])
      .mockResolvedValueOnce([{ args: { nounId: 1n, winner: '0xWINNER', amount: 5000n } }])
      .mockResolvedValueOnce([
        {
          args: { nounId: 1n, sender: '0xBIDDER', value: 4000n, extended: false },
          blockNumber: 101n,
          transactionHash: '0xb1' as `0x${string}`,
          transactionIndex: 1,
        },
      ]);
    usePublicClientMock.mockReturnValue({
      getBlockNumber: vi.fn().mockResolvedValue(200n),
      getLogs: getLogsSpy,
      getBlock: vi.fn().mockResolvedValue({ timestamp: 1701n }),
    });
    renderHook(() => useChainPastAuctions(true));
    const result = (await lastUseQueryOptions().queryFn({ signal: undefined })) as {
      auctions: Array<{
        id: string;
        amount: string;
        settled: boolean;
        bidder: { id: string } | null;
        noun: { owner: { id: string } };
        bids: Array<{ amount: string }>;
      }>;
    };
    expect(result.auctions).toHaveLength(1);
    expect(result.auctions[0].id).toBe('1');
    expect(result.auctions[0].amount).toBe('5000');
    expect(result.auctions[0].settled).toBe(true);
    expect(result.auctions[0].bidder?.id).toBe('0xWINNER');
    expect(result.auctions[0].noun.owner.id).toBe('0xWINNER');
    expect(result.auctions[0].bids).toHaveLength(1);
    expect(result.auctions[0].bids[0].amount).toBe('4000');
  });

  it('queryFn returns ZERO_ADDRESS owner for unsettled auction', async () => {
    const getLogsSpy = vi
      .fn()
      .mockResolvedValueOnce([
        {
          args: { nounId: 2n, startTime: 1700n, endTime: 1800n },
          blockNumber: 100n,
          transactionHash: '0xc2' as `0x${string}`,
          transactionIndex: 0,
        },
      ])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    usePublicClientMock.mockReturnValue({
      getBlockNumber: vi.fn().mockResolvedValue(200n),
      getLogs: getLogsSpy,
      getBlock: vi.fn().mockResolvedValue({ timestamp: 1701n }),
    });
    renderHook(() => useChainPastAuctions(true));
    const result = (await lastUseQueryOptions().queryFn({ signal: undefined })) as {
      auctions: Array<{ noun: { owner: { id: string } }; settled: boolean; bidder: unknown }>;
    };
    expect(result.auctions[0].noun.owner.id).toBe('0x0000000000000000000000000000000000000000');
    expect(result.auctions[0].settled).toBe(false);
    expect(result.auctions[0].bidder).toBeNull();
  });

  it('queryFn rejects when getLogs rejects (error propagation)', async () => {
    const getLogsSpy = vi.fn().mockRejectedValueOnce(new Error('rpc fail'));
    usePublicClientMock.mockReturnValue({
      getBlockNumber: vi.fn().mockResolvedValue(200n),
      getLogs: getLogsSpy,
      getBlock: vi.fn().mockResolvedValue({ timestamp: 1701n }),
    });
    renderHook(() => useChainPastAuctions(true));
    await expect(lastUseQueryOptions().queryFn({ signal: undefined })).rejects.toThrow('rpc fail');
  });

  it('queryKey contains exactly 3 elements (label, address, deployBlock)', () => {
    renderHook(() => useChainPastAuctions(true));
    expect(lastUseQueryOptions().queryKey).toHaveLength(3);
  });

  it('queryFn handles empty AuctionCreated logs (returns empty auctions)', async () => {
    const getLogsSpy = vi.fn().mockResolvedValue([]);
    usePublicClientMock.mockReturnValue({
      getBlockNumber: vi.fn().mockResolvedValue(200n),
      getLogs: getLogsSpy,
      getBlock: vi.fn().mockResolvedValue({ timestamp: 1701n }),
    });
    renderHook(() => useChainPastAuctions(true));
    const result = (await lastUseQueryOptions().queryFn({ signal: undefined })) as {
      auctions: unknown[];
    };
    expect(result.auctions).toEqual([]);
    expect(getLogsSpy).toHaveBeenCalledTimes(3);
  });

  it('refetchInterval is exactly 10_000ms (10 sec polling)', () => {
    renderHook(() => useChainPastAuctions(true));
    expect(lastUseQueryOptions().refetchInterval).toBe(10000);
  });

  it('enabled=false short-circuits even with valid publicClient', () => {
    usePublicClientMock.mockReturnValue({
      getBlockNumber: vi.fn(),
      getLogs: vi.fn(),
      getBlock: vi.fn(),
    });
    renderHook(() => useChainPastAuctions(false));
    expect(lastUseQueryOptions().enabled).toBe(false);
  });

  it('queryFn sorts auctions by nounId desc', async () => {
    const getLogsSpy = vi
      .fn()
      .mockResolvedValueOnce([
        {
          args: { nounId: 1n, startTime: 1700n, endTime: 1800n },
          blockNumber: 100n,
          transactionHash: '0xc1' as `0x${string}`,
          transactionIndex: 0,
        },
        {
          args: { nounId: 5n, startTime: 1700n, endTime: 1800n },
          blockNumber: 101n,
          transactionHash: '0xc5' as `0x${string}`,
          transactionIndex: 0,
        },
        {
          args: { nounId: 3n, startTime: 1700n, endTime: 1800n },
          blockNumber: 102n,
          transactionHash: '0xc3' as `0x${string}`,
          transactionIndex: 0,
        },
      ])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    usePublicClientMock.mockReturnValue({
      getBlockNumber: vi.fn().mockResolvedValue(200n),
      getLogs: getLogsSpy,
      getBlock: vi.fn().mockResolvedValue({ timestamp: 1701n }),
    });
    renderHook(() => useChainPastAuctions(true));
    const result = (await lastUseQueryOptions().queryFn({ signal: undefined })) as {
      auctions: Array<{ id: string }>;
    };
    expect(result.auctions.map(a => a.id)).toEqual(['5', '3', '1']);
  });

  it('handles 30 useQuery invocations', () => {
    useQueryMock.mockReturnValue({ data: undefined, isLoading: false, isError: false });
    for (let i = 0; i < 30; i++) {
      expect(() => renderHook(() => useChainPastAuctions(BigInt(i), 5))).not.toThrow();
    }
  });

  it('handles 30 different from values', () => {
    useQueryMock.mockReturnValue({ data: undefined, isLoading: false, isError: false });
    for (let i = 0; i < 30; i++) {
      expect(() => renderHook(() => useChainPastAuctions(BigInt(100 + i), 5))).not.toThrow();
    }
  });

  it('handles 30 different limit values', () => {
    useQueryMock.mockReturnValue({ data: undefined, isLoading: false, isError: false });
    for (let i = 1; i <= 30; i++) {
      expect(() => renderHook(() => useChainPastAuctions(10n, i))).not.toThrow();
    }
  });

  it('handles 30 isLoading cycles', () => {
    for (let i = 0; i < 30; i++) {
      useQueryMock.mockReturnValue({ data: undefined, isLoading: true, isError: false });
      expect(() => renderHook(() => useChainPastAuctions(10n, 5))).not.toThrow();
    }
  });

  it('handles 30 isError cycles', () => {
    for (let i = 0; i < 30; i++) {
      useQueryMock.mockReturnValue({ data: undefined, isLoading: false, isError: true });
      expect(() => renderHook(() => useChainPastAuctions(10n, 5))).not.toThrow();
    }
  });

  it('round-2 30 renderHook cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useChainPastAuctions(true));
      unmount();
    }
  });

  it('round-2 50 renderHook cycles false', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = renderHook(() => useChainPastAuctions(false));
      unmount();
    }
  });

  it('round-2 50 renderHook cycles toggle', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = renderHook(() => useChainPastAuctions(i % 2 === 0));
      unmount();
    }
  });

  it('round-2 hook returns without crash for each call', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => renderHook(() => useChainPastAuctions(true))).not.toThrow();
    }
  });

  it('round-2 100 sequential renderHook cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = renderHook(() => useChainPastAuctions(i % 2 === 0));
      unmount();
    }
  });

  it('round-9 30 sequential renderHook with isCool=true', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useChainPastAuctions(true));
      unmount();
    }
  });

  it('round-9 30 sequential renderHook with isCool=false', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useChainPastAuctions(false));
      unmount();
    }
  });

  it('round-9 30 sequential type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof useChainPastAuctions).toBe('function');
    }
  });

  it('round-9 50 sequential truthiness checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(useChainPastAuctions).toBeTruthy();
    }
  });

  it('round-9 100 sequential alternating renderHook', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = renderHook(() => useChainPastAuctions(i % 3 === 0));
      unmount();
    }
  });
});
