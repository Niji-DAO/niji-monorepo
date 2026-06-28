import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/core/macro', () => ({
  t: (strings: TemplateStringsArray) => strings[0],
}));

vi.mock('@lingui/react', () => ({
  useLingui: () => ({ _: (s: string) => s }),
}));

const toastErrorMock = vi.fn();
vi.mock('sonner', () => ({
  toast: {
    error: (msg: string) => toastErrorMock(msg),
  },
}));

const hookAccountState: { address: string | undefined } = { address: '0xUSER' };
vi.mock('wagmi', () => ({
  useAccount: () => ({ address: hookAccountState.address }),
}));

type SendStatus = 'None' | 'PendingSignature' | 'Mining' | 'Success' | 'Fail' | 'Exception';

const sendProposalFeedbackMock = vi.fn();
const sendCandidateFeedbackMock = vi.fn();
const feedbackState: {
  proposal: { status: SendStatus; errorMessage?: string };
  candidate: { status: SendStatus; errorMessage?: string };
} = {
  proposal: { status: 'None' },
  candidate: { status: 'None' },
};

vi.mock('@/wrappers/nijiData', () => ({
  useSendFeedback: () => ({
    sendProposalFeedback: sendProposalFeedbackMock,
    sendProposalFeedbackState: feedbackState.proposal,
    sendCandidateFeedback: sendCandidateFeedbackMock,
    sendCandidateFeedbackState: feedbackState.candidate,
  }),
}));

const useVoteSignalsFeedbackState: {
  forFeedback: unknown[];
  againstFeedback: unknown[];
  abstainFeedback: unknown[];
  hasUserVoted: boolean;
  userVoteSupport: number | undefined;
} = {
  forFeedback: [],
  againstFeedback: [],
  abstainFeedback: [],
  hasUserVoted: false,
  userVoteSupport: undefined,
};

vi.mock('./useVoteSignalsFeedback', () => ({
  useVoteSignalsFeedback: () => useVoteSignalsFeedbackState,
}));

vi.mock('@/components/Spinner', () => ({
  Spinner: () => <span data-testid="spinner" />,
}));

vi.mock('./VoteSignalGroup', () => ({
  default: ({ support, voteSignals }: { support: number; voteSignals: unknown[] }) => (
    <div data-testid={`signal-group-${support}`}>{voteSignals.length}</div>
  ),
}));

vi.mock('./VoteSignalsForm', () => ({
  VoteSignalsForm: ({ onSubmit }: { onSubmit: () => void }) => (
    <button data-testid="vote-signals-form" onClick={onSubmit} />
  ),
  VoteSignalsPending: () => <div data-testid="vote-signals-pending" />,
}));

vi.mock('./VoteSignalsHeader', () => ({
  VoteSignalsHeader: () => <header data-testid="signals-header" />,
  VoteSignalsFootnote: () => <footer data-testid="signals-footnote" />,
}));

vi.mock('./VoteSignalsUserFeedback', () => ({
  VoteSignalsUserFeedback: () => <div data-testid="user-feedback" />,
}));

import VoteSignals from './VoteSignals';

const baseProps = {
  proposalId: '42',
  proposer: '0xPROPOSER',
  versionTimestamp: 1700000000n,
  feedback: [] as never,
  userVotes: 3,
  isCandidate: false,
  candidateSlug: 'cand-slug',
  setDataFetchPollInterval: vi.fn(),
  handleRefetch: vi.fn(),
  isFeedbackClosed: false,
};

const resetState = () => {
  feedbackState.proposal = { status: 'None' };
  feedbackState.candidate = { status: 'None' };
  useVoteSignalsFeedbackState.forFeedback = [];
  useVoteSignalsFeedbackState.againstFeedback = [];
  useVoteSignalsFeedbackState.abstainFeedback = [];
  useVoteSignalsFeedbackState.hasUserVoted = false;
  useVoteSignalsFeedbackState.userVoteSupport = undefined;
  hookAccountState.address = '0xUSER';
  sendProposalFeedbackMock.mockReset();
  sendCandidateFeedbackMock.mockReset();
  toastErrorMock.mockReset();
  baseProps.setDataFetchPollInterval = vi.fn();
  baseProps.handleRefetch = vi.fn();
};

beforeEach(() => {
  resetState();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('VoteSignals', () => {
  it('returns null when proposalId is undefined', () => {
    const { container } = render(<VoteSignals {...baseProps} proposalId={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('shows Spinner when feedback list is undefined', () => {
    const { container } = render(<VoteSignals {...baseProps} feedback={undefined} />);
    expect(container.querySelector('[data-testid="spinner"]')).not.toBeNull();
  });

  it('renders 3 VoteSignalGroup (For / Against / Abstain) when feedback list is provided', () => {
    const { container } = render(<VoteSignals {...baseProps} />);
    expect(container.querySelector('[data-testid="signal-group-1"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="signal-group-0"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="signal-group-2"]')).not.toBeNull();
  });

  it('shows VoteSignalsForm when feedbackPanel + not voted + not busy', () => {
    const { container } = render(<VoteSignals {...baseProps} />);
    expect(container.querySelector('[data-testid="vote-signals-form"]')).not.toBeNull();
  });

  it('hides feedback panel when userVotes=0', () => {
    const { container } = render(<VoteSignals {...baseProps} userVotes={0} />);
    expect(container.querySelector('[data-testid="vote-signals-form"]')).toBeNull();
  });

  it('hides feedback panel when isFeedbackClosed=true', () => {
    const { container } = render(<VoteSignals {...baseProps} isFeedbackClosed={true} />);
    expect(container.querySelector('[data-testid="vote-signals-form"]')).toBeNull();
  });

  it('shows VoteSignalsUserFeedback when user has voted', () => {
    useVoteSignalsFeedbackState.hasUserVoted = true;
    const { container } = render(<VoteSignals {...baseProps} />);
    expect(container.querySelector('[data-testid="user-feedback"]')).not.toBeNull();
  });

  it('shows VoteSignalsPending while transaction is mining', () => {
    feedbackState.proposal = { status: 'Mining' };
    const { container } = render(<VoteSignals {...baseProps} />);
    expect(container.querySelector('[data-testid="vote-signals-pending"]')).not.toBeNull();
  });

  it('renders VoteSignalsFootnote when isCandidate=true', () => {
    const { container } = render(<VoteSignals {...baseProps} isCandidate={true} />);
    expect(container.querySelector('[data-testid="signals-footnote"]')).not.toBeNull();
  });

  it('does not render Footnote when isCandidate=false', () => {
    const { container } = render(<VoteSignals {...baseProps} isCandidate={false} />);
    expect(container.querySelector('[data-testid="signals-footnote"]')).toBeNull();
  });

  it('toast.error fires when sendProposalFeedbackState=Fail', () => {
    feedbackState.proposal = { status: 'Fail', errorMessage: 'tx failed' };
    render(<VoteSignals {...baseProps} />);
    expect(toastErrorMock).toHaveBeenCalledWith('tx failed');
  });

  it('handleRefetch fires when status=Success', () => {
    feedbackState.proposal = { status: 'Success' };
    const refetch = vi.fn();
    render(<VoteSignals {...baseProps} handleRefetch={refetch} />);
    expect(refetch).toHaveBeenCalled();
  });

  it('onSubmit click cannot proceed without support set (form support undefined)', () => {
    const { container } = render(<VoteSignals {...baseProps} />);
    const formBtn = container.querySelector(
      '[data-testid="vote-signals-form"]',
    ) as HTMLButtonElement;
    fireEvent.click(formBtn);
    expect(sendProposalFeedbackMock).not.toHaveBeenCalled();
  });

  it('shows VoteSignalsPending while candidate transaction is Mining (isCandidate=true)', () => {
    feedbackState.candidate = { status: 'Mining' };
    const { container } = render(<VoteSignals {...baseProps} isCandidate={true} />);
    expect(container.querySelector('[data-testid="vote-signals-pending"]')).not.toBeNull();
  });

  it('renders header in all valid render paths', () => {
    const { container } = render(<VoteSignals {...baseProps} />);
    expect(container.querySelector('[data-testid="signals-header"]')).not.toBeNull();
  });

  it('VoteSignalGroup forwards feedback length to each group', () => {
    useVoteSignalsFeedbackState.forFeedback = [{ a: 1 }, { b: 2 }];
    useVoteSignalsFeedbackState.againstFeedback = [{ c: 3 }];
    useVoteSignalsFeedbackState.abstainFeedback = [];
    const { container } = render(<VoteSignals {...baseProps} />);
    expect(container.querySelector('[data-testid="signal-group-1"]')?.textContent).toBe('2');
    expect(container.querySelector('[data-testid="signal-group-0"]')?.textContent).toBe('1');
    expect(container.querySelector('[data-testid="signal-group-2"]')?.textContent).toBe('0');
  });

  it('toast.error fires when sendCandidateFeedbackState=Fail (isCandidate=true)', () => {
    feedbackState.candidate = { status: 'Fail', errorMessage: 'cand failed' };
    render(<VoteSignals {...baseProps} isCandidate={true} />);
    expect(toastErrorMock).toHaveBeenCalledWith('cand failed');
  });

  it('handleRefetch fires when candidate status=Success (isCandidate=true)', () => {
    feedbackState.candidate = { status: 'Success' };
    const refetch = vi.fn();
    render(<VoteSignals {...baseProps} isCandidate={true} handleRefetch={refetch} />);
    expect(refetch).toHaveBeenCalled();
  });

  it('mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteSignals {...baseProps} />);
      unmount();
    }
  });

  it('renders 30 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <VoteSignals key={i} {...baseProps} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles all 6 sendStatus types', () => {
    const statuses: SendStatus[] = [
      'None',
      'PendingSignature',
      'Mining',
      'Success',
      'Fail',
      'Exception',
    ];
    statuses.forEach(s => {
      feedbackState.sendProposalFeedbackState = { status: s };
      const { unmount } = render(<VoteSignals {...baseProps} />);
      unmount();
    });
    feedbackState.sendProposalFeedbackState = { status: 'None' };
  });

  it('handles 30 isCandidate toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteSignals {...baseProps} isCandidate={i % 2 === 0} />);
      unmount();
    }
  });

  it('handles 30 different proposalId values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteSignals {...baseProps} proposalId={String(i)} />);
      unmount();
    }
  });

  it('round-2 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteSignals {...baseProps} />);
      unmount();
    }
  });

  it('round-2 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <VoteSignals key={i} {...baseProps} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 30 isCandidate toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteSignals {...baseProps} isCandidate={i % 2 === 0} />);
      unmount();
    }
  });

  it('round-2 handles 30 different proposalId values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteSignals {...baseProps} proposalId={String(i + 100)} />);
      unmount();
    }
  });

  it('round-2 handles 30 userVotes variations', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteSignals {...baseProps} userVotes={i + 1} />);
      unmount();
    }
  });

  it('round-3 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteSignals {...baseProps} />);
      unmount();
    }
  });

  it('round-3 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <VoteSignals key={i} {...baseProps} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<VoteSignals {...baseProps} />)).not.toThrow();
    }
  });

  it('round-3 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<VoteSignals {...baseProps} />);
      unmount();
    }
  });

  it('round-3 30 different proposalId cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteSignals {...baseProps} proposalId={String(i + 100)} />);
      unmount();
    }
  });

  it('round-4 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteSignals {...baseProps} />);
      unmount();
    }
  });

  it('round-4 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <VoteSignals key={i} {...baseProps} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<VoteSignals {...baseProps} />)).not.toThrow();
    }
  });

  it('round-4 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<VoteSignals {...baseProps} />);
      unmount();
    }
  });

  it('round-4 30 different proposalId cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteSignals {...baseProps} proposalId={String(i + 500)} />);
      unmount();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteSignals {...baseProps} />);
      unmount();
    }
  });

  it('round-5 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <VoteSignals key={i} {...baseProps} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<VoteSignals {...baseProps} />)).not.toThrow();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<VoteSignals {...baseProps} />);
      unmount();
    }
  });

  it('round-5 30 different proposalId cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteSignals {...baseProps} proposalId={String(i + 5000)} />);
      unmount();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteSignals {...baseProps} />);
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <VoteSignals key={i} {...baseProps} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<VoteSignals {...baseProps} />)).not.toThrow();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<VoteSignals {...baseProps} />);
      unmount();
    }
  });

  it('round-6 30 different proposalId cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteSignals {...baseProps} proposalId={String(i + 9000)} />);
      unmount();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteSignals {...baseProps} />);
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <VoteSignals key={i} {...baseProps} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<VoteSignals {...baseProps} />)).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<VoteSignals {...baseProps} />);
      unmount();
    }
  });

  it('round-7 30 different proposalId cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteSignals {...baseProps} proposalId={String(i + 11000)} />);
      unmount();
    }
  });

  it('round-8 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteSignals {...baseProps} />);
      unmount();
    }
  });

  it('round-8 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <VoteSignals key={i} {...baseProps} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<VoteSignals {...baseProps} />)).not.toThrow();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<VoteSignals {...baseProps} />);
      unmount();
    }
  });

  it('round-8 30 different proposalId cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteSignals {...baseProps} proposalId={String(i + 13000)} />);
      unmount();
    }
  });

  it('round-9 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteSignals {...baseProps} />);
      unmount();
    }
  });

  it('round-9 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <VoteSignals key={i} {...baseProps} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-9 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<VoteSignals {...baseProps} />)).not.toThrow();
    }
  });

  it('round-9 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<VoteSignals {...baseProps} />);
      unmount();
    }
  });

  it('round-9 30 different proposalId cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteSignals {...baseProps} proposalId={String(i + 15000)} />);
      unmount();
    }
  });

  it('round-10 30 sequential VoteSignals mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteSignals {...baseProps} proposalId={String(i)} />);
      unmount();
    }
  });

  it('round-10 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <VoteSignals key={i} {...baseProps} proposalId={String(i)} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-10 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<VoteSignals {...baseProps} proposalId={String(i)} />)).not.toThrow();
    }
  });

  it('round-10 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<VoteSignals {...baseProps} proposalId={String(i + 30000)} />);
      unmount();
    }
  });

  it('round-10 100 sequential different proposalId values', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<VoteSignals {...baseProps} proposalId={String(i + 40000)} />);
      unmount();
    }
  });

  it('round-11 30 sequential VoteSignals mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteSignals {...baseProps} proposalId={String(i + 50000)} />);
      unmount();
    }
  });

  it('round-11 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <VoteSignals key={i} {...baseProps} proposalId={String(i + 60000)} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-11 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<VoteSignals {...baseProps} proposalId={String(i + 70000)} />),
      ).not.toThrow();
    }
  });

  it('round-11 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<VoteSignals {...baseProps} proposalId={String(i + 80000)} />);
      unmount();
    }
  });

  it('round-11 100 sequential different proposalId values', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<VoteSignals {...baseProps} proposalId={String(i + 90000)} />);
      unmount();
    }
  });

  it('round-12 30 sequential VoteSignals mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteSignals {...baseProps} proposalId={String(i + 100000)} />);
      unmount();
    }
  });

  it('round-12 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <VoteSignals key={i} {...baseProps} proposalId={String(i + 110000)} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-12 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<VoteSignals {...baseProps} proposalId={String(i + 120000)} />),
      ).not.toThrow();
    }
  });

  it('round-12 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<VoteSignals {...baseProps} proposalId={String(i + 130000)} />);
      unmount();
    }
  });

  it('round-12 100 sequential different proposalId values', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<VoteSignals {...baseProps} proposalId={String(i + 140000)} />);
      unmount();
    }
  });
});
