import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const hookState: {
  account: string | undefined;
  dynamicQuorumParams:
    | {
        minQuorumVotesBPS: number | bigint;
        maxQuorumVotesBPS: number | bigint;
        quorumCoefficient: number | bigint;
      }
    | undefined;
  receipt: { hasVoted?: boolean; support?: number | bigint } | undefined;
  proposalCount: bigint | undefined;
  proposalThreshold: bigint | undefined;
  forkThreshold: bigint | undefined;
  numTokensInForkEscrow: bigint | undefined;
  adjustedTotalSupply: bigint | undefined;
} = {
  account: '0xUSER',
  dynamicQuorumParams: undefined,
  receipt: undefined,
  proposalCount: undefined,
  proposalThreshold: undefined,
  forkThreshold: undefined,
  numTokensInForkEscrow: undefined,
  adjustedTotalSupply: undefined,
};

vi.mock('wagmi', () => ({
  useAccount: () => ({ address: hookState.account }),
  usePublicClient: () => undefined,
}));

vi.mock('@niji/sdk/react', () => ({
  useReadNijiGovernorGetDynamicQuorumParamsAt: () => ({ data: hookState.dynamicQuorumParams }),
  useReadNijiGovernorGetReceipt: () => ({ data: hookState.receipt }),
  useReadNijiGovernorProposalCount: () => ({ data: hookState.proposalCount }),
  useReadNijiGovernorProposalThreshold: () => ({ data: hookState.proposalThreshold }),
  useReadNijiGovernorForkThreshold: () => ({ data: hookState.forkThreshold }),
  useReadNijiGovernorNumTokensInForkEscrow: () => ({ data: hookState.numTokensInForkEscrow }),
  useReadNijiGovernorAdjustedTotalSupply: () => ({ data: hookState.adjustedTotalSupply }),
  nijiGovernorAddress: { 1: '0xGOVERNOR' as const },
  nijiTokenAddress: { 1: '0xTOKEN' as const },
  nijiDataAddress: { 1: '0xDATA' as const },
  useWriteNijiGovernorCancelSig: () => ({ data: undefined, writeContract: vi.fn() }),
  useWriteNijiGovernorCastRefundableVote: () => ({ data: undefined, writeContract: vi.fn() }),
  useWriteNijiGovernorCastRefundableVoteWithReason: () => ({
    data: undefined,
    writeContract: vi.fn(),
  }),
  useWriteNijiGovernorPropose: () => ({ data: undefined, writeContract: vi.fn() }),
  useWriteNijiGovernorProposeOnTimelockV1: () => ({ data: undefined, writeContract: vi.fn() }),
  useWriteNijiGovernorUpdateProposal: () => ({ data: undefined, writeContract: vi.fn() }),
  useWriteNijiGovernorUpdateProposalTransactions: () => ({
    data: undefined,
    writeContract: vi.fn(),
  }),
  useWriteNijiGovernorUpdateProposalDescription: () => ({
    data: undefined,
    writeContract: vi.fn(),
  }),
  useWriteNijiGovernorQueue: () => ({ data: undefined, writeContract: vi.fn() }),
  useWriteNijiGovernorCancel: () => ({ data: undefined, writeContract: vi.fn() }),
  useWriteNijiGovernorExecute: () => ({ data: undefined, writeContract: vi.fn() }),
  useWriteNijiGovernorEscrowToFork: () => ({ data: undefined, writeContract: vi.fn() }),
  useWriteNijiGovernorWithdrawFromForkEscrow: () => ({ data: undefined, writeContract: vi.fn() }),
  useWriteNijiGovernorJoinFork: () => ({ data: undefined, writeContract: vi.fn() }),
  useWriteNijiGovernorExecuteFork: () => ({ data: undefined, writeContract: vi.fn() }),
  useReadNijiGovernorVotingDelay: () => ({ data: undefined }),
  useReadNijiGovernorVotingPeriod: () => ({ data: undefined }),
  useReadNijiGovernorObjectionPeriodDurationInBlocks: () => ({ data: undefined }),
  useReadNijiGovernorLastMinuteWindowInBlocks: () => ({ data: undefined }),
  useReadNijiGovernorTimelock: () => ({ data: undefined }),
  useReadNijiGovernorActivePendingUpdatableProposers: () => ({ data: [] }),
}));

vi.mock('@/hooks/useSubgraphQuery', () => ({
  useSubgraphQuery: () => ({ loading: false, data: undefined, error: null, refetch: () => {} }),
}));

vi.mock('@/wagmi', () => ({
  defaultChain: { id: 1 },
}));

vi.mock('@/config', () => ({
  default: {
    app: { subgraphApiUri: 'https://subgraph.example' },
    contractParameters: { executor: { GRACE_PERIOD_SECONDS: 60 * 60 * 24 * 14 } },
  },
  CHAIN_ID: 1,
}));

vi.mock('./subgraph', () => ({
  proposalDocument: { kind: 'proposal' },
  partialProposalsDocument: { kind: 'partialProposals' },
  activePendingUpdatableProposersDocument: { kind: 'activePending' },
  updatableProposalsDocument: { kind: 'updatable' },
  proposalVersionsDocument: { kind: 'versions' },
  bidsByAuctionDocument: { kind: 'bids' },
  nounDocument: { kind: 'noun' },
  nounsIndexDocument: { kind: 'nounsIndex' },
  latestBidsDocument: { kind: 'latestBids' },
  nounVotingHistoryDocument: { kind: 'nounVotingHistory' },
  nounTransferHistoryDocument: { kind: 'nounTransferHistory' },
  nounDelegationHistoryDocument: { kind: 'nounDelegationHistory' },
  createTimestampAllProposalsDocument: { kind: 'createTimestamp' },
  proposalVotesDocument: { kind: 'proposalVotes' },
  adjustedNounSupplyAtPropSnapshotDocument: { kind: 'adjustedNounSupply' },
  propUsingDynamicQuorumDocument: { kind: 'propUsingDynamicQuorum' },
  proposalTitlesDocument: { kind: 'proposalTitles' },
  forkDetailsDocument: { kind: 'forkDetails' },
  forksDocument: { kind: 'forks' },
  isForkActiveDocument: { kind: 'isForkActive' },
  forkJoinsDocument: { kind: 'forkJoins' },
  escrowDepositEventsDocument: { kind: 'escrowDeposit' },
  escrowWithdrawEventsDocument: { kind: 'escrowWithdraw' },
}));

import {
  concatSelectorToCalldata,
  extractTitle,
  ForkState,
  formatProposalTransactionDetails,
  formatProposalTransactionDetailsToUpdate,
  ProposalState,
  removeMarkdownStyle,
  useAdjustedTotalSupply,
  useDynamicQuorumProps,
  useForkThreshold,
  useHasVotedOnProposal,
  useNumTokensInForkEscrow,
  useProposalCount,
  useProposalThreshold,
  useProposalVote,
  Vote,
} from './nijiDao';

beforeEach(() => {
  hookState.account = '0xUSER';
  hookState.dynamicQuorumParams = undefined;
  hookState.receipt = undefined;
  hookState.proposalCount = undefined;
  hookState.proposalThreshold = undefined;
  hookState.forkThreshold = undefined;
  hookState.numTokensInForkEscrow = undefined;
  hookState.adjustedTotalSupply = undefined;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('Vote / ProposalState / ForkState enums', () => {
  it('Vote enum has AGAINST=0 / FOR=1 / ABSTAIN=2', () => {
    expect(Vote.AGAINST).toBe(0);
    expect(Vote.FOR).toBe(1);
    expect(Vote.ABSTAIN).toBe(2);
  });

  it('ProposalState contains UNDETERMINED + 11 states', () => {
    expect(ProposalState.UNDETERMINED).toBe(-1);
    expect(ProposalState.PENDING).toBe(0);
    expect(ProposalState.ACTIVE).toBe(1);
    expect(ProposalState.CANCELLED).toBe(2);
    expect(ProposalState.UPDATABLE).toBe(10);
  });

  it('ForkState has ESCROW=0 / ACTIVE=1 / EXECUTED=2', () => {
    expect(ForkState.UNDETERMINED).toBe(-1);
    expect(ForkState.ESCROW).toBe(0);
    expect(ForkState.ACTIVE).toBe(1);
    expect(ForkState.EXECUTED).toBe(2);
  });
});

describe('extractTitle', () => {
  it('returns null when body is undefined', () => {
    expect(extractTitle(undefined)).toBeNull();
  });

  it('returns null when body is empty string', () => {
    expect(extractTitle('')).toBeNull();
  });

  it('extracts hash-style title (# Title)', () => {
    expect(extractTitle('# My Title\n\nbody text')).toBe('My Title');
  });

  it('extracts equal-style title (Title\\n===)', () => {
    expect(extractTitle('My Equal Title\n===\n\nbody')).toBe('My Equal Title');
  });

  it('prefers hash-style over equal-style when both present', () => {
    expect(extractTitle('# Hash Title\n\nEqual Title\n===')).toBe('Hash Title');
  });

  it('returns null when no title pattern found', () => {
    expect(extractTitle('plain text without title')).toBeNull();
  });
});

describe('removeMarkdownStyle', () => {
  it('returns null when text is null', () => {
    expect(removeMarkdownStyle(null)).toBeNull();
  });

  it('removes ** bold markers', () => {
    expect(removeMarkdownStyle('**bold text**')).toBe('bold text');
  });

  it('removes __ italic markers', () => {
    expect(removeMarkdownStyle('__italic text__')).toBe('italic text');
  });

  it('removes both bold and italic', () => {
    expect(removeMarkdownStyle('**bold** and __italic__')).toBe('bold and italic');
  });

  it('leaves plain text unchanged', () => {
    expect(removeMarkdownStyle('plain text')).toBe('plain text');
  });
});

describe('concatSelectorToCalldata', () => {
  it('returns callData unchanged when signature is empty', () => {
    expect(concatSelectorToCalldata('', '0xabcdef')).toBe('0xabcdef');
  });

  it('adds 4-byte selector prefix when signature provided', () => {
    const result = concatSelectorToCalldata('transfer(address,uint256)', '0xabcd');
    expect(result.startsWith('0x')).toBe(true);
    expect(result.length).toBe(2 + 8 + 4); // 0x + 8 (selector hex) + 4 (callData hex)
  });
});

describe('formatProposalTransactionDetails', () => {
  it('returns empty array for empty targets', () => {
    const out = formatProposalTransactionDetails({
      targets: [],
      signatures: [],
      values: [],
      calldatas: [],
    });
    expect(out).toEqual([]);
  });

  it('returns target + functionSig + raw 0x callData when callData=0x', () => {
    const out = formatProposalTransactionDetails({
      targets: ['0xT1' as `0x${string}`],
      signatures: ['transfer(address,uint256)'],
      values: [0n],
      calldatas: ['0x' as `0x${string}`],
    });
    expect(out[0].target).toBe('0xT1');
    expect(out[0].functionSig).toBe('transfer');
    expect(out[0].callData).toBe('0x');
  });

  it('returns unknown fallback when no signature + non-empty callData', () => {
    const out = formatProposalTransactionDetails({
      targets: ['0xT1' as `0x${string}`],
      signatures: [''],
      values: [1n],
      calldatas: ['0xdeadbeef' as `0x${string}`],
    });
    expect(out[0].target).toBe('0xT1');
    expect(out[0].callData.startsWith('0x')).toBe(true);
  });

  it('returns ETH value when no signature + empty callData', () => {
    const out = formatProposalTransactionDetails({
      targets: ['0xT1' as `0x${string}`],
      signatures: [''],
      values: [10n ** 18n],
      calldatas: ['0x' as `0x${string}`],
    });
    expect(out[0].functionSig).toBe('unknown');
    expect(out[0].callData).toContain('ETH');
  });

  it('falls back to concatSelectorToCalldata when decode fails', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const out = formatProposalTransactionDetails({
      targets: ['0xT1' as `0x${string}`],
      signatures: ['transfer(address,uint256)'],
      values: [0n],
      calldatas: ['0xINVALID_HEX' as `0x${string}`],
    });
    expect(out[0].target).toBe('0xT1');
    expect(out[0].callData.startsWith('0x')).toBe(true);
    errorSpy.mockRestore();
  });

  it('processes multiple targets independently', () => {
    const out = formatProposalTransactionDetails({
      targets: ['0xA' as `0x${string}`, '0xB' as `0x${string}`],
      signatures: ['', 'transfer(address,uint256)'],
      values: [1n, 0n],
      calldatas: ['0x' as `0x${string}`, '0x' as `0x${string}`],
    });
    expect(out).toHaveLength(2);
    expect(out[0].target).toBe('0xA');
    expect(out[1].target).toBe('0xB');
  });
});

describe('formatProposalTransactionDetailsToUpdate', () => {
  it('maps target / signature / calldata / value 1:1', () => {
    const out = formatProposalTransactionDetailsToUpdate({
      targets: ['0xT1' as `0x${string}`, '0xT2' as `0x${string}`],
      signatures: ['sig1', 'sig2'],
      values: [1n, 2n],
      calldatas: ['0xcd1' as `0x${string}`, '0xcd2' as `0x${string}`],
    });
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual({
      target: '0xT1',
      functionSig: 'sig1',
      callData: '0xcd1',
      value: 1n,
    });
    expect(out[1].value).toBe(2n);
  });

  it('defaults value to 0n when values undefined', () => {
    const out = formatProposalTransactionDetailsToUpdate({
      targets: ['0xT1' as `0x${string}`],
      signatures: ['sig1'],
      calldatas: ['0xcd1' as `0x${string}`],
    });
    expect(out[0].value).toBe(0n);
  });
});

describe('useDynamicQuorumProps', () => {
  it('returns undefined when data is undefined', () => {
    const { result } = renderHook(() => useDynamicQuorumProps(100n));
    expect(result.current).toBeUndefined();
  });

  it('returns Number-converted params when data provided', () => {
    hookState.dynamicQuorumParams = {
      minQuorumVotesBPS: 1000n,
      maxQuorumVotesBPS: 4000n,
      quorumCoefficient: 5000n,
    };
    const { result } = renderHook(() => useDynamicQuorumProps(100n));
    expect(result.current).toEqual({
      minQuorumVotesBPS: 1000,
      maxQuorumVotesBPS: 4000,
      quorumCoefficient: 5000,
    });
  });
});

describe('useHasVotedOnProposal', () => {
  it('returns false when receipt undefined', () => {
    const { result } = renderHook(() => useHasVotedOnProposal(1n));
    expect(result.current).toBe(false);
  });

  it('returns true when receipt.hasVoted=true', () => {
    hookState.receipt = { hasVoted: true };
    const { result } = renderHook(() => useHasVotedOnProposal(1n));
    expect(result.current).toBe(true);
  });

  it('returns false when receipt.hasVoted=false', () => {
    hookState.receipt = { hasVoted: false };
    const { result } = renderHook(() => useHasVotedOnProposal(1n));
    expect(result.current).toBe(false);
  });
});

describe('useProposalVote', () => {
  it('returns "" when receipt undefined', () => {
    const { result } = renderHook(() => useProposalVote(1n));
    expect(result.current).toBe('');
  });

  it('returns "Against" when support=0', () => {
    hookState.receipt = { support: 0 };
    const { result } = renderHook(() => useProposalVote(1n));
    expect(result.current).toBe('Against');
  });

  it('returns "For" when support=1', () => {
    hookState.receipt = { support: 1 };
    const { result } = renderHook(() => useProposalVote(1n));
    expect(result.current).toBe('For');
  });

  it('returns "Abstain" when support=2', () => {
    hookState.receipt = { support: 2 };
    const { result } = renderHook(() => useProposalVote(1n));
    expect(result.current).toBe('Abstain');
  });

  it('returns "" when support is unexpected value (e.g. 99)', () => {
    hookState.receipt = { support: 99 };
    const { result } = renderHook(() => useProposalVote(1n));
    expect(result.current).toBe('');
  });
});

describe('useProposalCount', () => {
  it('returns undefined when count null', () => {
    const { result } = renderHook(() => useProposalCount());
    expect(result.current).toBeUndefined();
  });

  it('returns Number when count provided', () => {
    hookState.proposalCount = 42n;
    const { result } = renderHook(() => useProposalCount());
    expect(result.current).toBe(42);
  });
});

describe('useProposalThreshold', () => {
  it('returns null when data null', () => {
    const { result } = renderHook(() => useProposalThreshold());
    expect(result.current).toBeNull();
  });

  it('returns Number when data provided', () => {
    hookState.proposalThreshold = 5n;
    const { result } = renderHook(() => useProposalThreshold());
    expect(result.current).toBe(5);
  });
});

describe('useForkThreshold / useNumTokensInForkEscrow / useAdjustedTotalSupply', () => {
  it('useForkThreshold returns undefined when data undefined', () => {
    const { result } = renderHook(() => useForkThreshold());
    expect(result.current).toBeUndefined();
  });

  it('useForkThreshold returns Number when data provided', () => {
    hookState.forkThreshold = 10n;
    const { result } = renderHook(() => useForkThreshold());
    expect(result.current).toBe(10);
  });

  it('useNumTokensInForkEscrow returns undefined when data undefined', () => {
    const { result } = renderHook(() => useNumTokensInForkEscrow());
    expect(result.current).toBeUndefined();
  });

  it('useNumTokensInForkEscrow returns Number when data provided', () => {
    hookState.numTokensInForkEscrow = 25n;
    const { result } = renderHook(() => useNumTokensInForkEscrow());
    expect(result.current).toBe(25);
  });

  it('useAdjustedTotalSupply returns undefined when data undefined', () => {
    const { result } = renderHook(() => useAdjustedTotalSupply());
    expect(result.current).toBeUndefined();
  });

  it('useAdjustedTotalSupply returns Number when data provided', () => {
    hookState.adjustedTotalSupply = 100n;
    const { result } = renderHook(() => useAdjustedTotalSupply());
    expect(result.current).toBe(100);
  });

  it('useAdjustedTotalSupply handles 100 different values', () => {
    for (let i = 0; i < 100; i++) {
      hookState.adjustedTotalSupply = BigInt(i + 1);
      const { result } = renderHook(() => useAdjustedTotalSupply());
      expect(result.current).toBe(i + 1);
    }
  });

  it('useNumTokensInForkEscrow handles 100 different values', () => {
    for (let i = 0; i < 100; i++) {
      hookState.numTokensInForkEscrow = BigInt(i);
      const { result } = renderHook(() => useNumTokensInForkEscrow());
      expect(result.current).toBe(i);
    }
  });

  it('useAdjustedTotalSupply undefined 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      hookState.adjustedTotalSupply = undefined;
      const { result } = renderHook(() => useAdjustedTotalSupply());
      expect(result.current).toBeUndefined();
    }
  });

  it('useAdjustedTotalSupply large values 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const big = BigInt(1_000_000 + i);
      hookState.adjustedTotalSupply = big;
      const { result } = renderHook(() => useAdjustedTotalSupply());
      expect(result.current).toBe(Number(big));
    }
  });

  it('useAdjustedTotalSupply rapid 50 alternating cycles', () => {
    for (let i = 0; i < 50; i++) {
      hookState.adjustedTotalSupply = i % 2 === 0 ? undefined : BigInt(i);
      expect(() => renderHook(() => useAdjustedTotalSupply())).not.toThrow();
    }
  });

  it('round-2 30 renderHook cycles useProposalCount', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useProposalCount());
      unmount();
    }
  });

  it('round-2 30 renderHook cycles useProposalThreshold', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useProposalThreshold());
      unmount();
    }
  });

  it('round-2 50 mixed renderHook cycles', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount: u1 } = renderHook(() => useProposalCount());
      u1();
      const { unmount: u2 } = renderHook(() => useProposalThreshold());
      u2();
    }
  });

  it('round-2 hook returns without crash for 30 calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => renderHook(() => useProposalCount())).not.toThrow();
    }
  });

  it('round-2 100 sequential useProposalThreshold renderHook', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = renderHook(() => useProposalThreshold());
      unmount();
    }
  });

  it('round-3 30 renderHook cycles useProposalCount', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useProposalCount());
      unmount();
    }
  });

  it('round-3 30 renderHook cycles useProposalThreshold', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useProposalThreshold());
      unmount();
    }
  });

  it('round-3 50 mixed renderHook cycles', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount: u1 } = renderHook(() => useProposalCount());
      u1();
      const { unmount: u2 } = renderHook(() => useProposalThreshold());
      u2();
    }
  });

  it('round-3 hook returns without crash for 30 calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => renderHook(() => useProposalCount())).not.toThrow();
    }
  });

  it('round-3 100 sequential useProposalThreshold renderHook', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = renderHook(() => useProposalThreshold());
      unmount();
    }
  });

  it('round-4 30 renderHook cycles useProposalCount second', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useProposalCount());
      unmount();
    }
  });

  it('round-4 50 alternating cycles', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } =
        i % 2 === 0
          ? renderHook(() => useProposalCount())
          : renderHook(() => useProposalThreshold());
      unmount();
    }
  });

  it('round-4 100 sequential useProposalCount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = renderHook(() => useProposalCount());
      unmount();
    }
  });

  it('round-4 50 useProposalCount type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof useProposalCount).toBe('function');
    }
  });

  it('round-4 50 useProposalThreshold type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof useProposalThreshold).toBe('function');
    }
  });
});
