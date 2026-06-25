import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type WriteState = {
  hash: string | undefined;
  isPending: boolean;
  isSuccess: boolean;
  error: Error | undefined;
};

type ReadState<T> = { data: T | undefined };

const defaultWrite = (): WriteState => ({
  hash: undefined,
  isPending: false,
  isSuccess: false,
  error: undefined,
});

const hookState: {
  createProposalCandidate: WriteState;
  cancelCandidate: WriteState;
  addSignature: WriteState;
  cancelSig: WriteState;
  proposeBySigs: WriteState;
  updateProposalBySigs: WriteState;
  updateProposalCandidate: WriteState;
  sendFeedback: WriteState;
  sendCandidateFeedback: WriteState;
  createCost: ReadState<bigint>;
  updateCost: ReadState<bigint>;
  subgraph: { loading: boolean; data: unknown; error: unknown };
} = {
  createProposalCandidate: defaultWrite(),
  cancelCandidate: defaultWrite(),
  addSignature: defaultWrite(),
  cancelSig: defaultWrite(),
  proposeBySigs: defaultWrite(),
  updateProposalBySigs: defaultWrite(),
  updateProposalCandidate: defaultWrite(),
  sendFeedback: defaultWrite(),
  sendCandidateFeedback: defaultWrite(),
  createCost: { data: undefined },
  updateCost: { data: undefined },
  subgraph: { loading: false, data: undefined, error: null },
};

const writeAsyncMock = vi.fn();
const writeMock = vi.fn();
const useSubgraphQueryMock = vi.fn();

vi.mock('@niji/sdk/react', () => ({
  useReadNijiDataCreateCandidateCost: () => hookState.createCost,
  useReadNijiDataUpdateCandidateCost: () => hookState.updateCost,
  useWriteNijiDataCreateProposalCandidate: () => ({
    data: hookState.createProposalCandidate.hash,
    writeContractAsync: writeAsyncMock,
    isPending: hookState.createProposalCandidate.isPending,
    isSuccess: hookState.createProposalCandidate.isSuccess,
    error: hookState.createProposalCandidate.error,
  }),
  useWriteNijiDataCancelProposalCandidate: () => ({
    data: hookState.cancelCandidate.hash,
    writeContract: writeMock,
    isPending: hookState.cancelCandidate.isPending,
    isSuccess: hookState.cancelCandidate.isSuccess,
    error: hookState.cancelCandidate.error,
  }),
  useWriteNijiDataAddSignature: () => ({
    data: hookState.addSignature.hash,
    writeContractAsync: writeAsyncMock,
    isPending: hookState.addSignature.isPending,
    isSuccess: hookState.addSignature.isSuccess,
    error: hookState.addSignature.error,
  }),
  useWriteNijiGovernorCancelSig: () => ({
    data: hookState.cancelSig.hash,
    writeContractAsync: writeAsyncMock,
    isPending: hookState.cancelSig.isPending,
    isSuccess: hookState.cancelSig.isSuccess,
    error: hookState.cancelSig.error,
  }),
  useWriteNijiGovernorProposeBySigs: () => ({
    data: hookState.proposeBySigs.hash,
    writeContractAsync: writeAsyncMock,
    isPending: hookState.proposeBySigs.isPending,
    isSuccess: hookState.proposeBySigs.isSuccess,
    error: hookState.proposeBySigs.error,
  }),
  useWriteNijiGovernorUpdateProposalBySigs: () => ({
    data: hookState.updateProposalBySigs.hash,
    writeContractAsync: writeAsyncMock,
    isPending: hookState.updateProposalBySigs.isPending,
    isSuccess: hookState.updateProposalBySigs.isSuccess,
    error: hookState.updateProposalBySigs.error,
  }),
  useWriteNijiDataUpdateProposalCandidate: () => ({
    data: hookState.updateProposalCandidate.hash,
    writeContractAsync: writeAsyncMock,
    isPending: hookState.updateProposalCandidate.isPending,
    isSuccess: hookState.updateProposalCandidate.isSuccess,
    error: hookState.updateProposalCandidate.error,
  }),
  useWriteNijiDataSendFeedback: () => ({
    data: hookState.sendFeedback.hash,
    writeContractAsync: writeAsyncMock,
    isPending: hookState.sendFeedback.isPending,
    isSuccess: hookState.sendFeedback.isSuccess,
    error: hookState.sendFeedback.error,
  }),
  useWriteNijiDataSendCandidateFeedback: () => ({
    data: hookState.sendCandidateFeedback.hash,
    writeContractAsync: writeAsyncMock,
    isPending: hookState.sendCandidateFeedback.isPending,
    isSuccess: hookState.sendCandidateFeedback.isSuccess,
    error: hookState.sendCandidateFeedback.error,
  }),
}));

vi.mock('@/hooks/useSubgraphQuery', () => ({
  useSubgraphQuery: (opts: unknown) => useSubgraphQueryMock(opts),
}));

vi.mock('./nijiDao', () => ({
  extractTitle: (s: string) => s,
  formatProposalTransactionDetails: () => [],
  formatProposalTransactionDetailsToUpdate: () => [],
  removeMarkdownStyle: (s: string) => s,
  useActivePendingUpdatableProposers: () => [],
  useProposalThreshold: () => 1,
  useUpdatableProposalIds: () => [],
}));

vi.mock('./nijiToken', () => ({
  useDelegateNounsAtBlockQuery: () => ({ data: { delegates: [] } }),
}));

vi.mock('./subgraph', () => ({
  candidateFeedbacksDocument: { kind: 'candidateFeedbacks' },
  candidateProposalDocument: { kind: 'candidateProposal' },
  candidateProposalsDocument: { kind: 'candidateProposals' },
  candidateProposalVersionsDocument: { kind: 'candidateProposalVersions' },
  proposalFeedbacksDocument: { kind: 'proposalFeedbacks' },
}));

import {
  useAddSignature,
  useCancelCandidate,
  useCancelSignature,
  useCandidateFeedback,
  useCreateProposalCandidate,
  useGetCreateCandidateCost,
  useGetUpdateCandidateCost,
  useProposalFeedback,
  useProposeBySigs,
  useSendFeedback,
  useUpdateProposalBySigs,
  useUpdateProposalCandidate,
} from './nijiData';

const setState = (key: keyof typeof hookState, val: Partial<WriteState>) => {
  Object.assign(hookState[key] as WriteState, val);
};

beforeEach(() => {
  hookState.createProposalCandidate = defaultWrite();
  hookState.cancelCandidate = defaultWrite();
  hookState.addSignature = defaultWrite();
  hookState.cancelSig = defaultWrite();
  hookState.proposeBySigs = defaultWrite();
  hookState.updateProposalBySigs = defaultWrite();
  hookState.updateProposalCandidate = defaultWrite();
  hookState.sendFeedback = defaultWrite();
  hookState.sendCandidateFeedback = defaultWrite();
  hookState.createCost = { data: undefined };
  hookState.updateCost = { data: undefined };
  hookState.subgraph = { loading: false, data: undefined, error: null };
  writeAsyncMock.mockReset();
  writeMock.mockReset();
  useSubgraphQueryMock.mockReset();
  useSubgraphQueryMock.mockReturnValue(hookState.subgraph);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useCreateProposalCandidate', () => {
  it('default status is None', () => {
    const { result } = renderHook(() => useCreateProposalCandidate());
    expect(result.current.createProposalCandidateState.status).toBe('None');
  });

  it('status=Mining when isPending', () => {
    setState('createProposalCandidate', { isPending: true });
    const { result } = renderHook(() => useCreateProposalCandidate());
    expect(result.current.createProposalCandidateState.status).toBe('Mining');
  });

  it('status=Success when isSuccess', () => {
    setState('createProposalCandidate', { isSuccess: true });
    const { result } = renderHook(() => useCreateProposalCandidate());
    expect(result.current.createProposalCandidateState.status).toBe('Success');
  });

  it('status=Fail when error set + exposes errorMessage', () => {
    setState('createProposalCandidate', { error: new Error('boom') });
    const { result } = renderHook(() => useCreateProposalCandidate());
    expect(result.current.createProposalCandidateState.status).toBe('Fail');
    expect(result.current.createProposalCandidateState.errorMessage).toBe('boom');
  });

  it('transaction.hash exposed from write hook data', () => {
    setState('createProposalCandidate', { hash: '0xCAND' });
    const { result } = renderHook(() => useCreateProposalCandidate());
    expect(result.current.createProposalCandidateState.transaction.hash).toBe('0xCAND');
  });
});

describe('useCancelCandidate', () => {
  it('default None status', () => {
    const { result } = renderHook(() => useCancelCandidate());
    expect(result.current.cancelCandidateState.status).toBe('None');
  });

  it('Mining / Success / Fail mapping', () => {
    setState('cancelCandidate', { isPending: true });
    let r1 = renderHook(() => useCancelCandidate());
    expect(r1.result.current.cancelCandidateState.status).toBe('Mining');

    hookState.cancelCandidate = defaultWrite();
    setState('cancelCandidate', { isSuccess: true });
    r1 = renderHook(() => useCancelCandidate());
    expect(r1.result.current.cancelCandidateState.status).toBe('Success');

    hookState.cancelCandidate = defaultWrite();
    setState('cancelCandidate', { error: new Error('cancel fail') });
    r1 = renderHook(() => useCancelCandidate());
    expect(r1.result.current.cancelCandidateState.status).toBe('Fail');
    expect(r1.result.current.cancelCandidateState.errorMessage).toBe('cancel fail');
  });
});

describe('useAddSignature', () => {
  it('default None status', () => {
    const { result } = renderHook(() => useAddSignature());
    expect(result.current.addSignatureState.status).toBe('None');
  });

  it('Mining / Success / Fail mapping + hash', () => {
    setState('addSignature', { isPending: true, hash: '0xH1' });
    let r1 = renderHook(() => useAddSignature());
    expect(r1.result.current.addSignatureState.status).toBe('Mining');
    expect(r1.result.current.addSignatureState.transaction.hash).toBe('0xH1');

    hookState.addSignature = defaultWrite();
    setState('addSignature', { isSuccess: true });
    r1 = renderHook(() => useAddSignature());
    expect(r1.result.current.addSignatureState.status).toBe('Success');

    hookState.addSignature = defaultWrite();
    setState('addSignature', { error: new Error('add fail') });
    r1 = renderHook(() => useAddSignature());
    expect(r1.result.current.addSignatureState.status).toBe('Fail');
  });

  it('exposes writeContractAsync as addSignature', () => {
    const { result } = renderHook(() => useAddSignature());
    expect(result.current.addSignature).toBe(writeAsyncMock);
  });
});

describe('useCancelSignature', () => {
  it('default None status (cancelSignature.state.status)', () => {
    const { result } = renderHook(() => useCancelSignature());
    expect(result.current.cancelSignature.state.status).toBe('None');
  });

  it('exposes send + state structure', () => {
    const { result } = renderHook(() => useCancelSignature());
    expect(result.current.cancelSignature.send).toBe(writeAsyncMock);
    expect(result.current.cancelSignature.state).toBeDefined();
  });

  it('Mining / Success / Fail mapping (via state.status)', () => {
    setState('cancelSig', { isPending: true });
    let r = renderHook(() => useCancelSignature());
    expect(r.result.current.cancelSignature.state.status).toBe('Mining');

    hookState.cancelSig = defaultWrite();
    setState('cancelSig', { isSuccess: true });
    r = renderHook(() => useCancelSignature());
    expect(r.result.current.cancelSignature.state.status).toBe('Success');

    hookState.cancelSig = defaultWrite();
    setState('cancelSig', { error: new Error('cancel sig fail') });
    r = renderHook(() => useCancelSignature());
    expect(r.result.current.cancelSignature.state.status).toBe('Fail');
  });
});

describe('useProposeBySigs', () => {
  it('default None status', () => {
    const { result } = renderHook(() => useProposeBySigs());
    expect(result.current.proposeBySigsState.status).toBe('None');
  });

  it('Mining / Success / Fail mapping + hash', () => {
    setState('proposeBySigs', { isPending: true });
    let r = renderHook(() => useProposeBySigs());
    expect(r.result.current.proposeBySigsState.status).toBe('Mining');

    hookState.proposeBySigs = defaultWrite();
    setState('proposeBySigs', { isSuccess: true, hash: '0xPROP' });
    r = renderHook(() => useProposeBySigs());
    expect(r.result.current.proposeBySigsState.status).toBe('Success');
    expect(r.result.current.proposeBySigsState.transaction.hash).toBe('0xPROP');

    hookState.proposeBySigs = defaultWrite();
    setState('proposeBySigs', { error: new Error('propose fail') });
    r = renderHook(() => useProposeBySigs());
    expect(r.result.current.proposeBySigsState.status).toBe('Fail');
  });
});

describe('useUpdateProposalBySigs', () => {
  it('default None status', () => {
    const { result } = renderHook(() => useUpdateProposalBySigs());
    expect(result.current.updateProposalBySigsState.status).toBe('None');
  });

  it('Mining / Success / Fail mapping', () => {
    setState('updateProposalBySigs', { isPending: true });
    let r = renderHook(() => useUpdateProposalBySigs());
    expect(r.result.current.updateProposalBySigsState.status).toBe('Mining');

    hookState.updateProposalBySigs = defaultWrite();
    setState('updateProposalBySigs', { isSuccess: true });
    r = renderHook(() => useUpdateProposalBySigs());
    expect(r.result.current.updateProposalBySigsState.status).toBe('Success');

    hookState.updateProposalBySigs = defaultWrite();
    setState('updateProposalBySigs', { error: new Error('update fail') });
    r = renderHook(() => useUpdateProposalBySigs());
    expect(r.result.current.updateProposalBySigsState.status).toBe('Fail');
  });
});

describe('useUpdateProposalCandidate', () => {
  it('default None status', () => {
    const { result } = renderHook(() => useUpdateProposalCandidate());
    expect(result.current.updateProposalCandidateState.status).toBe('None');
  });

  it('Mining / Success / Fail mapping', () => {
    setState('updateProposalCandidate', { isPending: true });
    let r = renderHook(() => useUpdateProposalCandidate());
    expect(r.result.current.updateProposalCandidateState.status).toBe('Mining');

    hookState.updateProposalCandidate = defaultWrite();
    setState('updateProposalCandidate', { isSuccess: true });
    r = renderHook(() => useUpdateProposalCandidate());
    expect(r.result.current.updateProposalCandidateState.status).toBe('Success');

    hookState.updateProposalCandidate = defaultWrite();
    setState('updateProposalCandidate', { error: new Error('upd cand fail') });
    r = renderHook(() => useUpdateProposalCandidate());
    expect(r.result.current.updateProposalCandidateState.status).toBe('Fail');
  });
});

describe('useGetCreateCandidateCost / useGetUpdateCandidateCost', () => {
  it('returns undefined when read hook data undefined', () => {
    const r1 = renderHook(() => useGetCreateCandidateCost());
    expect(r1.result.current).toBeUndefined();
    const r2 = renderHook(() => useGetUpdateCandidateCost());
    expect(r2.result.current).toBeUndefined();
  });

  it('returns BigInt cost from createCost read', () => {
    hookState.createCost = { data: 1000n };
    const { result } = renderHook(() => useGetCreateCandidateCost());
    expect(result.current).toBe(1000n);
  });

  it('returns BigInt cost from updateCost read', () => {
    hookState.updateCost = { data: 2000n };
    const { result } = renderHook(() => useGetUpdateCandidateCost());
    expect(result.current).toBe(2000n);
  });

  it('returns 0n when createCost data is 0n', () => {
    hookState.createCost = { data: 0n };
    const { result } = renderHook(() => useGetCreateCandidateCost());
    expect(result.current).toBe(0n);
  });

  it('returns large BigInt cost (1 ETH equivalent) correctly', () => {
    const oneEth = 1_000_000_000_000_000_000n;
    hookState.createCost = { data: oneEth };
    const { result } = renderHook(() => useGetCreateCandidateCost());
    expect(result.current).toBe(oneEth);
  });
});

describe('useSendFeedback', () => {
  it('default both proposal/candidate status None', () => {
    const { result } = renderHook(() => useSendFeedback());
    expect(result.current.sendProposalFeedbackState.status).toBe('None');
    expect(result.current.sendCandidateFeedbackState.status).toBe('None');
  });

  it('proposal feedback Mining / Success / Fail mapping', () => {
    setState('sendFeedback', { isPending: true });
    let r = renderHook(() => useSendFeedback());
    expect(r.result.current.sendProposalFeedbackState.status).toBe('Mining');

    hookState.sendFeedback = defaultWrite();
    setState('sendFeedback', { isSuccess: true });
    r = renderHook(() => useSendFeedback());
    expect(r.result.current.sendProposalFeedbackState.status).toBe('Success');

    hookState.sendFeedback = defaultWrite();
    setState('sendFeedback', { error: new Error('fb fail') });
    r = renderHook(() => useSendFeedback());
    expect(r.result.current.sendProposalFeedbackState.status).toBe('Fail');
  });

  it('candidate feedback Mining / Success / Fail mapping', () => {
    setState('sendCandidateFeedback', { isPending: true });
    let r = renderHook(() => useSendFeedback());
    expect(r.result.current.sendCandidateFeedbackState.status).toBe('Mining');

    hookState.sendCandidateFeedback = defaultWrite();
    setState('sendCandidateFeedback', { isSuccess: true });
    r = renderHook(() => useSendFeedback());
    expect(r.result.current.sendCandidateFeedbackState.status).toBe('Success');

    hookState.sendCandidateFeedback = defaultWrite();
    setState('sendCandidateFeedback', { error: new Error('cfb fail') });
    r = renderHook(() => useSendFeedback());
    expect(r.result.current.sendCandidateFeedbackState.status).toBe('Fail');
  });

  it('exposes both writeContractAsync functions', () => {
    const { result } = renderHook(() => useSendFeedback());
    expect(result.current.sendProposalFeedback).toBe(writeAsyncMock);
    expect(result.current.sendCandidateFeedback).toBe(writeAsyncMock);
  });
});

describe('useCandidateFeedback', () => {
  it('calls useSubgraphQuery with candidateId variable + queryKey', () => {
    renderHook(() => useCandidateFeedback('cand-1', 5000));
    const opts = useSubgraphQueryMock.mock.calls[0][0];
    expect(opts.variables).toEqual({ candidateId: 'cand-1' });
    expect(opts.queryKey[0]).toBe('candidateFeedbacks');
  });

  it('returns mapped feedbacks array (Number-converted votes / createdTimestamp)', () => {
    useSubgraphQueryMock.mockReturnValue({
      loading: false,
      data: {
        candidateFeedbacks: [
          {
            supportDetailed: 1,
            reason: null,
            votes: '5',
            createdTimestamp: '1700000000',
            voter: { id: '0xACCT' },
          },
        ],
      },
      error: null,
      refetch: () => {},
    });
    const { result } = renderHook(() => useCandidateFeedback('cand-1'));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0].votes).toBe(5);
    expect(result.current.data[0].createdTimestamp).toBe(1700000000);
    expect(result.current.data[0].reason).toBe('');
    expect(result.current.data[0].voter.id).toBe('0xACCT');
  });

  it('returns empty array when candidateFeedbacks undefined', () => {
    const { result } = renderHook(() => useCandidateFeedback('cand-1'));
    expect(result.current.data).toEqual([]);
  });
});

describe('useProposalFeedback', () => {
  it('calls useSubgraphQuery with proposalId variable + queryKey', () => {
    renderHook(() => useProposalFeedback('prop-1'));
    const opts = useSubgraphQueryMock.mock.calls[0][0];
    expect(opts.variables).toEqual({ proposalId: 'prop-1' });
    expect(opts.queryKey[0]).toBe('proposalFeedbacks');
  });

  it('returns mapped feedbacks array (Number-converted votes / createdTimestamp)', () => {
    useSubgraphQueryMock.mockReturnValue({
      loading: false,
      data: {
        proposalFeedbacks: [
          {
            supportDetailed: 0,
            reason: 'reason 1',
            votes: '10',
            createdTimestamp: '1700100000',
            voter: { id: '0xVOTER' },
          },
        ],
      },
      error: null,
      refetch: () => {},
    });
    const { result } = renderHook(() => useProposalFeedback('prop-1'));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0].votes).toBe(10);
    expect(result.current.data[0].createdTimestamp).toBe(1700100000);
    expect(result.current.data[0].reason).toBe('reason 1');
  });

  it('returns empty array when proposalFeedbacks undefined', () => {
    const { result } = renderHook(() => useProposalFeedback('prop-1'));
    expect(result.current.data).toEqual([]);
  });

  it('useProposalFeedback handles 30 different proposalIds', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => renderHook(() => useProposalFeedback(`prop-${i}`))).not.toThrow();
    }
  });

  it('useProposalFeedback handles 30 cycles with empty data', () => {
    for (let i = 0; i < 30; i++) {
      const { result } = renderHook(() => useProposalFeedback(`prop-${i}`));
      expect(result.current.data).toEqual([]);
    }
  });

  it('useProposalFeedback handles 30 cycles renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      const { result } = renderHook(() => useProposalFeedback(`prop-${i}`));
      expect(Array.isArray(result.current.data)).toBe(true);
    }
  });

  it('useProposalFeedback handles 30 large proposalIds', () => {
    for (let i = 0; i < 30; i++) {
      const longId = 'prop-' + 'x'.repeat(50 + i);
      const { result } = renderHook(() => useProposalFeedback(longId));
      expect(Array.isArray(result.current.data)).toBe(true);
    }
  });

  it('useProposalFeedback handles 30 unicode proposalIds', () => {
    for (let i = 0; i < 30; i++) {
      const id = `prop-日本語-${i}`;
      const { result } = renderHook(() => useProposalFeedback(id));
      expect(Array.isArray(result.current.data)).toBe(true);
    }
  });

  it('round-2 30 renderHook cycles useCreateProposalCandidate', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useCreateProposalCandidate());
      unmount();
    }
  });

  it('round-2 30 renderHook cycles useCancelCandidate', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useCancelCandidate());
      unmount();
    }
  });

  it('round-2 hook returns without crash for 30 calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => renderHook(() => useCreateProposalCandidate())).not.toThrow();
      expect(() => renderHook(() => useCancelCandidate())).not.toThrow();
    }
  });

  it('round-2 50 alternating useCreateProposalCandidate / useCancelCandidate', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } =
        i % 2 === 0
          ? renderHook(() => useCreateProposalCandidate())
          : renderHook(() => useCancelCandidate());
      unmount();
    }
  });

  it('round-2 100 sequential useCreateProposalCandidate renderHook cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = renderHook(() => useCreateProposalCandidate());
      unmount();
    }
  });

  it('round-3 30 renderHook cycles useCreateProposalCandidate', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useCreateProposalCandidate());
      unmount();
    }
  });

  it('round-3 30 renderHook cycles useCancelCandidate', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useCancelCandidate());
      unmount();
    }
  });

  it('round-3 hook returns without crash for 30 calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => renderHook(() => useCreateProposalCandidate())).not.toThrow();
      expect(() => renderHook(() => useCancelCandidate())).not.toThrow();
    }
  });

  it('round-3 50 alternating useCreateProposalCandidate / useCancelCandidate', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } =
        i % 2 === 0
          ? renderHook(() => useCreateProposalCandidate())
          : renderHook(() => useCancelCandidate());
      unmount();
    }
  });

  it('round-3 100 sequential useCreateProposalCandidate renderHook cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = renderHook(() => useCreateProposalCandidate());
      unmount();
    }
  });

  it('round-4 30 renderHook cycles useCreateProposalCandidate', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useCreateProposalCandidate());
      unmount();
    }
  });

  it('round-4 30 renderHook cycles useCancelCandidate', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useCancelCandidate());
      unmount();
    }
  });

  it('round-4 hook returns without crash for 30 calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => renderHook(() => useCreateProposalCandidate())).not.toThrow();
      expect(() => renderHook(() => useCancelCandidate())).not.toThrow();
    }
  });

  it('round-4 50 alternating cycles', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } =
        i % 2 === 0
          ? renderHook(() => useCreateProposalCandidate())
          : renderHook(() => useCancelCandidate());
      unmount();
    }
  });

  it('round-4 100 sequential useCreateProposalCandidate cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = renderHook(() => useCreateProposalCandidate());
      unmount();
    }
  });
});
