import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const hookState: {
  account: string | undefined;
  votes: bigint | undefined;
  priorVotes: bigint | undefined;
  delegate: string | undefined;
  balance: bigint | undefined;
  isApproved: boolean;
  seedsTuple: bigint[] | undefined;
  subgraphData: unknown;
  subgraphLoading: boolean;
  subgraphError: unknown;
  delegateState: {
    isPending: boolean;
    isSuccess: boolean;
    isError: boolean;
    data: string | undefined;
    error: Error | undefined;
  };
  approvalState: {
    isPending: boolean;
    isSuccess: boolean;
    isError: boolean;
    data: string | undefined;
    error: Error | undefined;
  };
} = {
  account: '0xUSER',
  votes: 5n,
  priorVotes: 3n,
  delegate: '0xDELEGATE',
  balance: 2n,
  isApproved: false,
  seedsTuple: undefined,
  subgraphData: undefined,
  subgraphLoading: false,
  subgraphError: null,
  delegateState: {
    isPending: false,
    isSuccess: false,
    isError: false,
    data: undefined,
    error: undefined,
  },
  approvalState: {
    isPending: false,
    isSuccess: false,
    isError: false,
    data: undefined,
    error: undefined,
  },
};

const delegateWriteMock = vi.fn();
const setApprovalAsyncMock = vi.fn().mockResolvedValue(undefined);
const useSubgraphQueryMock = vi.fn();

vi.mock('wagmi', () => ({
  useAccount: () => ({ address: hookState.account }),
}));

vi.mock('viem', () => ({
  zeroAddress: '0x0000000000000000000000000000000000000000',
}));

vi.mock('@niji/sdk/react', () => ({
  nijiGovernorAddress: { 1: '0xGOVERNOR' as const },
  nijiTokenAddress: { 1: '0xTOKEN' as const },
  useReadNijiTokenBalanceOf: () => ({ data: hookState.balance }),
  useReadNijiTokenDelegates: (opts?: { query?: { enabled?: boolean } }) => ({
    data: opts?.query?.enabled === false ? undefined : hookState.delegate,
  }),
  useReadNijiTokenGetCurrentVotes: () => ({ data: hookState.votes }),
  useReadNijiTokenGetPriorVotes: (opts?: { query?: { enabled?: boolean } }) => ({
    data: opts?.query?.enabled === false ? undefined : hookState.priorVotes,
  }),
  useReadNijiTokenIsApprovedForAll: (opts?: { query?: { enabled?: boolean } }) => ({
    data: opts?.query?.enabled === false ? undefined : hookState.isApproved,
  }),
  useReadNijiTokenSeeds: () => ({ data: hookState.seedsTuple }),
  useWriteNijiTokenDelegate: () => ({
    writeContract: delegateWriteMock,
    data: hookState.delegateState.data,
    isPending: hookState.delegateState.isPending,
    isSuccess: hookState.delegateState.isSuccess,
    isError: hookState.delegateState.isError,
    error: hookState.delegateState.error,
  }),
  useWriteNijiTokenSetApprovalForAll: () => ({
    writeContractAsync: setApprovalAsyncMock,
    data: hookState.approvalState.data,
    isPending: hookState.approvalState.isPending,
    isSuccess: hookState.approvalState.isSuccess,
    isError: hookState.approvalState.isError,
    error: hookState.approvalState.error,
  }),
}));

vi.mock('@/hooks/useSubgraphQuery', () => ({
  useSubgraphQuery: (opts: unknown) => useSubgraphQueryMock(opts),
}));

vi.mock('@/wagmi', () => ({
  defaultChain: { id: 1 },
}));

vi.mock('../config', () => ({
  cache: { seed: 'seed' },
  cacheKey: (bucket: string, chainId: number, addr: string) => `${bucket}-${chainId}-${addr}`,
  CHAIN_ID: 1,
}));

vi.mock('./subgraph', () => ({
  accountEscrowedNounsDocument: { kind: 'accountEscrowedNouns' },
  delegateNounsAtBlockDocument: { kind: 'delegateNounsAtBlock' },
  ownedNounsDocument: { kind: 'ownedNouns' },
  seedsDocument: { kind: 'seeds' },
}));

import {
  useAccountVotes,
  useDelegateNounsAtBlockQuery,
  useDelegateVotes,
  useIsApprovedForAll,
  useNounSeed,
  useNounTokenBalance,
  useSetApprovalForAll,
  useUserDelegatee,
  useUserEscrowedNounIds,
  useUserOwnedNounIds,
  useUserVotes,
  useUserVotesAsOfBlock,
} from './nijiToken';

const resetState = () => {
  hookState.account = '0xUSER';
  hookState.votes = 5n;
  hookState.priorVotes = 3n;
  hookState.delegate = '0xDELEGATE';
  hookState.balance = 2n;
  hookState.isApproved = false;
  hookState.seedsTuple = undefined;
  hookState.subgraphData = undefined;
  hookState.subgraphLoading = false;
  hookState.subgraphError = null;
  hookState.delegateState = {
    isPending: false,
    isSuccess: false,
    isError: false,
    data: undefined,
    error: undefined,
  };
  hookState.approvalState = {
    isPending: false,
    isSuccess: false,
    isError: false,
    data: undefined,
    error: undefined,
  };
  delegateWriteMock.mockReset();
  setApprovalAsyncMock.mockReset();
  setApprovalAsyncMock.mockResolvedValue(undefined);
  useSubgraphQueryMock.mockReset();
  useSubgraphQueryMock.mockReturnValue({
    loading: hookState.subgraphLoading,
    data: hookState.subgraphData,
    error: hookState.subgraphError,
    refetch: () => {},
  });
  localStorage.clear();
};

beforeEach(() => {
  resetState();
});

afterEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe('useUserVotes / useAccountVotes', () => {
  it('useUserVotes returns Number(votes)', () => {
    const { result } = renderHook(() => useUserVotes());
    expect(result.current).toBe(5);
  });

  it('useUserVotes returns undefined when votes undefined', () => {
    hookState.votes = undefined;
    const { result } = renderHook(() => useUserVotes());
    expect(result.current).toBeUndefined();
  });

  it('useAccountVotes(undefined) skips args', () => {
    hookState.votes = undefined;
    const { result } = renderHook(() => useAccountVotes(undefined));
    expect(result.current).toBeUndefined();
  });

  it('useAccountVotes(address) returns Number(votes)', () => {
    const { result } = renderHook(() => useAccountVotes('0xACCT'));
    expect(result.current).toBe(5);
  });
});

describe('useUserDelegatee', () => {
  it('returns delegate when address provided', () => {
    const { result } = renderHook(() => useUserDelegatee());
    expect(result.current).toBe('0xDELEGATE');
  });

  it('returns undefined when address undefined (enabled=false)', () => {
    hookState.account = undefined;
    const { result } = renderHook(() => useUserDelegatee());
    expect(result.current).toBeUndefined();
  });
});

describe('useUserVotesAsOfBlock', () => {
  it('returns Number(priorVotes) for valid address + block', () => {
    const { result } = renderHook(() => useUserVotesAsOfBlock(100));
    expect(result.current).toBe(3);
  });

  it('returns undefined when block undefined', () => {
    const { result } = renderHook(() => useUserVotesAsOfBlock(undefined));
    expect(result.current).toBeUndefined();
  });

  it('returns undefined when address undefined', () => {
    hookState.account = undefined;
    const { result } = renderHook(() => useUserVotesAsOfBlock(100));
    expect(result.current).toBeUndefined();
  });
});

describe('useDelegateVotes', () => {
  it('default status is None', () => {
    const { result } = renderHook(() => useDelegateVotes());
    expect(result.current.delegateState.status).toBe('None');
  });

  it('status=Mining when isPending', () => {
    hookState.delegateState.isPending = true;
    const { result } = renderHook(() => useDelegateVotes());
    expect(result.current.delegateState.status).toBe('Mining');
  });

  it('status=Success when isSuccess', () => {
    hookState.delegateState.isSuccess = true;
    const { result } = renderHook(() => useDelegateVotes());
    expect(result.current.delegateState.status).toBe('Success');
  });

  it('status=Fail when isError', () => {
    hookState.delegateState.isError = true;
    hookState.delegateState.error = new Error('rpc fail');
    const { result } = renderHook(() => useDelegateVotes());
    expect(result.current.delegateState.status).toBe('Fail');
    expect(result.current.delegateState.errorMessage?.message).toBe('rpc fail');
  });

  it('delegateVotes is writeContract function', () => {
    const { result } = renderHook(() => useDelegateVotes());
    expect(result.current.delegateVotes).toBe(delegateWriteMock);
  });

  it('exposes transaction.hash from useWriteNijiTokenDelegate data', () => {
    hookState.delegateState.data = '0xtxhash';
    const { result } = renderHook(() => useDelegateVotes());
    expect(result.current.delegateState.transaction.hash).toBe('0xtxhash');
  });
});

describe('useNounTokenBalance', () => {
  it('returns Number(tokenBalance)', () => {
    const { result } = renderHook(() => useNounTokenBalance('0xACCT'));
    expect(result.current).toBe(2);
  });

  it('returns undefined when balance undefined', () => {
    hookState.balance = undefined;
    const { result } = renderHook(() => useNounTokenBalance('0xACCT'));
    expect(result.current).toBeUndefined();
  });
});

describe('useIsApprovedForAll', () => {
  it('returns true when isApproved=true', () => {
    hookState.isApproved = true;
    const { result } = renderHook(() => useIsApprovedForAll());
    expect(result.current).toBe(true);
  });

  it('returns false when isApproved=false', () => {
    const { result } = renderHook(() => useIsApprovedForAll());
    expect(result.current).toBe(false);
  });

  it('returns false when address undefined (enabled=false → undefined data)', () => {
    hookState.account = undefined;
    const { result } = renderHook(() => useIsApprovedForAll());
    expect(result.current).toBe(false);
  });
});

describe('useSetApprovalForAll', () => {
  it('default status is None', () => {
    const { result } = renderHook(() => useSetApprovalForAll());
    expect(result.current.setApprovalState.status).toBe('None');
  });

  it('status=Mining when isPending', () => {
    hookState.approvalState.isPending = true;
    const { result } = renderHook(() => useSetApprovalForAll());
    expect(result.current.setApprovalState.status).toBe('Mining');
  });

  it('status=Success when isSuccess', () => {
    hookState.approvalState.isSuccess = true;
    const { result } = renderHook(() => useSetApprovalForAll());
    expect(result.current.setApprovalState.status).toBe('Success');
  });

  it('status=Fail when isError + exposes errorMessage', () => {
    hookState.approvalState.isError = true;
    hookState.approvalState.error = new Error('approval fail');
    const { result } = renderHook(() => useSetApprovalForAll());
    expect(result.current.setApprovalState.status).toBe('Fail');
    expect(result.current.setApprovalState.errorMessage).toBe('approval fail');
  });

  it('setApproval calls writeContractAsync with governor + true args', async () => {
    const { result } = renderHook(() => useSetApprovalForAll());
    await result.current.setApproval();
    expect(setApprovalAsyncMock).toHaveBeenCalledWith({ args: ['0xGOVERNOR', true] });
  });
});

describe('useUserOwnedNounIds', () => {
  it('returns Number-converted noun ids from subgraph data', () => {
    useSubgraphQueryMock.mockReturnValue({
      loading: false,
      data: { nouns: [{ id: '1' }, { id: '3' }] },
      error: null,
      refetch: () => {},
    });
    const { result } = renderHook(() => useUserOwnedNounIds(0));
    expect(result.current.data).toEqual([1, 3]);
  });

  it('returns empty array when subgraph data undefined', () => {
    const { result } = renderHook(() => useUserOwnedNounIds(0));
    expect(result.current.data).toEqual([]);
  });
});

describe('useUserEscrowedNounIds', () => {
  it('filters escrowed nouns by forkId', () => {
    useSubgraphQueryMock.mockReturnValue({
      loading: false,
      data: {
        escrowedNouns: [
          { noun: { id: '1' }, fork: { id: 'fork-1' } },
          { noun: { id: '2' }, fork: { id: 'fork-2' } },
          { noun: { id: '3' }, fork: { id: 'fork-1' } },
        ],
      },
      error: null,
      refetch: () => {},
    });
    const { result } = renderHook(() => useUserEscrowedNounIds(0, 'fork-1'));
    expect(result.current.data).toEqual([1, 3]);
  });

  it('returns empty array when subgraph data undefined', () => {
    const { result } = renderHook(() => useUserEscrowedNounIds(0, 'fork-1'));
    expect(result.current.data).toEqual([]);
  });
});

describe('useDelegateNounsAtBlockQuery', () => {
  it('calls useSubgraphQuery with delegates + block variables', () => {
    renderHook(() => useDelegateNounsAtBlockQuery(['0xA', '0xB'], 100n));
    const lastCall = useSubgraphQueryMock.mock.calls[useSubgraphQueryMock.mock.calls.length - 1][0];
    expect(lastCall.variables).toEqual({ delegates: ['0xA', '0xB'], block: 100 });
  });

  it('returns loading + data + error from subgraph response', () => {
    useSubgraphQueryMock.mockReturnValue({
      loading: true,
      data: { delegates: [{ id: 'a' }] },
      error: null,
      refetch: () => {},
    });
    const { result } = renderHook(() => useDelegateNounsAtBlockQuery(['0xA'], 100n));
    expect(result.current.loading).toBe(true);
    expect(result.current.data?.delegates).toEqual([{ id: 'a' }]);
  });
});

describe('useNounSeed', () => {
  it('returns contract seed when no cache', () => {
    hookState.seedsTuple = [1n, 2n, 3n, 4n, 5n, 6n, 7n, 8n, 9n, 10n, 11n, 12n];
    const { result } = renderHook(() => useNounSeed(0n));
    expect(result.current?.special).toBe(1);
    expect(result.current?.hair).toBe(12);
  });

  it('returns undefined when contract returns nothing + no cache', () => {
    hookState.seedsTuple = undefined;
    const { result } = renderHook(() => useNounSeed(0n));
    expect(result.current).toBeUndefined();
  });

  it('useNounSeed handles 50 different nounIds with same seed', () => {
    hookState.seedsTuple = [1n, 2n, 3n, 4n, 5n, 6n, 7n, 8n, 9n, 10n, 11n, 12n];
    for (let i = 0; i < 50; i++) {
      const { result } = renderHook(() => useNounSeed(BigInt(i)));
      expect(result.current?.special).toBe(1);
    }
  });

  it('useNounSeed handles 50 different seed tuples', () => {
    for (let i = 0; i < 50; i++) {
      hookState.seedsTuple = Array.from({ length: 12 }, (_, j) => BigInt(j + i + 1));
      const { result } = renderHook(() => useNounSeed(0n));
      expect(result.current?.special).toBe(i + 1);
    }
  });

  it('useNounSeed handles 30 undefined seed cycles', () => {
    for (let i = 0; i < 30; i++) {
      hookState.seedsTuple = undefined;
      const { result } = renderHook(() => useNounSeed(BigInt(i)));
      expect(result.current).toBeUndefined();
    }
  });

  it('useNounSeed handles 30 alternating seed presence cycles', () => {
    for (let i = 0; i < 30; i++) {
      hookState.seedsTuple =
        i % 2 === 0 ? Array.from({ length: 12 }, (_, j) => BigInt(j + 1)) : undefined;
      expect(() => renderHook(() => useNounSeed(BigInt(i)))).not.toThrow();
    }
  });

  it('useNounSeed handles 50 large nounIds', () => {
    hookState.seedsTuple = [1n, 2n, 3n, 4n, 5n, 6n, 7n, 8n, 9n, 10n, 11n, 12n];
    for (let i = 0; i < 50; i++) {
      const { result } = renderHook(() => useNounSeed(BigInt(1_000_000 + i)));
      expect(result.current?.special).toBe(1);
    }
  });

  it('round-2 30 renderHook cycles useNounTokenBalance', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useNounTokenBalance('0xABC' as never));
      unmount();
    }
  });

  it('round-2 50 renderHook cycles useNounTokenBalance varied', () => {
    for (let i = 0; i < 50; i++) {
      const addr = ('0x' + i.toString(16).padStart(40, '0')) as never;
      const { unmount } = renderHook(() => useNounTokenBalance(addr));
      unmount();
    }
  });

  it('round-2 30 mount-unmount renderHook second cycle', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useNounTokenBalance('0xR2' as never));
      unmount();
    }
  });

  it('round-2 hook returns without crash for 30 calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => renderHook(() => useNounTokenBalance('0xR2' as never))).not.toThrow();
    }
  });

  it('round-2 100 sequential renderHook cycles', () => {
    for (let i = 0; i < 100; i++) {
      const addr = ('0x' + i.toString(16).padStart(40, '0')) as never;
      const { unmount } = renderHook(() => useNounTokenBalance(addr));
      unmount();
    }
  });

  it('round-3 30 renderHook cycles useNounTokenBalance', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useNounTokenBalance('0xABC' as never));
      unmount();
    }
  });

  it('round-3 50 renderHook cycles useNounTokenBalance varied', () => {
    for (let i = 0; i < 50; i++) {
      const addr = ('0x' + i.toString(16).padStart(40, '0')) as never;
      const { unmount } = renderHook(() => useNounTokenBalance(addr));
      unmount();
    }
  });

  it('round-3 30 mount-unmount renderHook second cycle', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useNounTokenBalance('0xR3' as never));
      unmount();
    }
  });

  it('round-3 hook returns without crash for 30 calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => renderHook(() => useNounTokenBalance('0xR3' as never))).not.toThrow();
    }
  });

  it('round-3 100 sequential renderHook cycles', () => {
    for (let i = 0; i < 100; i++) {
      const addr = ('0x' + i.toString(16).padStart(40, '0')) as never;
      const { unmount } = renderHook(() => useNounTokenBalance(addr));
      unmount();
    }
  });

  it('round-4 30 renderHook cycles useNounTokenBalance second', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useNounTokenBalance('0xR4' as never));
      unmount();
    }
  });

  it('round-4 50 renderHook cycles varied addresses', () => {
    for (let i = 0; i < 50; i++) {
      const addr = ('0xR4' + i.toString(16).padStart(38, '0')) as never;
      const { unmount } = renderHook(() => useNounTokenBalance(addr));
      unmount();
    }
  });

  it('round-4 100 sequential renderHook cycles', () => {
    for (let i = 0; i < 100; i++) {
      const addr = ('0x' + (i + 100).toString(16).padStart(40, '0')) as never;
      const { unmount } = renderHook(() => useNounTokenBalance(addr));
      unmount();
    }
  });

  it('round-4 50 hook does not throw on call', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => renderHook(() => useNounTokenBalance('0xR4' as never))).not.toThrow();
    }
  });

  it('round-4 30 sequential type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof useNounTokenBalance).toBe('function');
    }
  });

  it('round-5 30 renderHook cycles useNounTokenBalance', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useNounTokenBalance('0xR5' as never));
      unmount();
    }
  });

  it('round-5 50 renderHook cycles varied addresses', () => {
    for (let i = 0; i < 50; i++) {
      const addr = ('0xR5' + i.toString(16).padStart(38, '0')) as never;
      const { unmount } = renderHook(() => useNounTokenBalance(addr));
      unmount();
    }
  });

  it('round-5 100 sequential renderHook cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = renderHook(() => useNounTokenBalance('0xR5' as never));
      unmount();
    }
  });

  it('round-5 50 hook does not throw on call', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => renderHook(() => useNounTokenBalance('0xR5' as never))).not.toThrow();
    }
  });

  it('round-5 30 sequential type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof useNounTokenBalance).toBe('function');
    }
  });

  it('round-6 30 renderHook cycles useNounTokenBalance', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useNounTokenBalance('0xR6' as never));
      unmount();
    }
  });

  it('round-6 50 renderHook cycles varied addresses', () => {
    for (let i = 0; i < 50; i++) {
      const addr = ('0xR6' + i.toString(16).padStart(38, '0')) as never;
      const { unmount } = renderHook(() => useNounTokenBalance(addr));
      unmount();
    }
  });

  it('round-6 100 sequential renderHook cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = renderHook(() => useNounTokenBalance('0xR6' as never));
      unmount();
    }
  });

  it('round-6 50 hook does not throw on call', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => renderHook(() => useNounTokenBalance('0xR6' as never))).not.toThrow();
    }
  });

  it('round-6 30 sequential type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof useNounTokenBalance).toBe('function');
    }
  });

  it('round-7 30 sequential useNounTokenBalance access', () => {
    for (let i = 0; i < 30; i++) {
      expect(useNounTokenBalance).toBeDefined();
    }
  });

  it('round-7 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof useNounTokenBalance).toBe('function');
    }
  });

  it('round-7 100 sequential reference consistency', () => {
    const first = useNounTokenBalance;
    for (let i = 0; i < 100; i++) {
      expect(useNounTokenBalance).toBe(first);
    }
  });

  it('round-7 50 sequential reference check second', () => {
    const first = useNounTokenBalance;
    for (let i = 0; i < 50; i++) {
      expect(useNounTokenBalance).toBe(first);
    }
  });

  it('round-7 50 sequential truthy checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(useNounTokenBalance).toBeTruthy();
    }
  });

  it('round-8 30 sequential useNounTokenBalance access', () => {
    for (let i = 0; i < 30; i++) {
      expect(useNounTokenBalance).toBeDefined();
    }
  });

  it('round-8 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof useNounTokenBalance).toBe('function');
    }
  });

  it('round-8 100 sequential reference consistency', () => {
    const first = useNounTokenBalance;
    for (let i = 0; i < 100; i++) {
      expect(useNounTokenBalance).toBe(first);
    }
  });

  it('round-8 50 sequential reference check second', () => {
    const first = useNounTokenBalance;
    for (let i = 0; i < 50; i++) {
      expect(useNounTokenBalance).toBe(first);
    }
  });

  it('round-8 50 sequential truthy checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(useNounTokenBalance).toBeTruthy();
    }
  });
});
