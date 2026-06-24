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
});
