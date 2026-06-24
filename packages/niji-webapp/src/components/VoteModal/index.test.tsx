import React from 'react';

import { act, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@lingui/core', () => ({
  i18n: { number: (n: number) => String(n), locale: 'en' },
}));

type VoteStatus = 'None' | 'Mining' | 'Success' | 'Fail' | 'Exception';

const castRefundableVoteMock = vi.fn();
const castRefundableVoteWithReasonMock = vi.fn();

const hookState: {
  castRefundableVoteState: { status: VoteStatus; errorMessage?: string };
  castRefundableVoteWithReasonState: { status: VoteStatus; errorMessage?: string };
} = {
  castRefundableVoteState: { status: 'None' },
  castRefundableVoteWithReasonState: { status: 'None' },
};

vi.mock('@/wrappers/nijiDao', () => ({
  useCastRefundableVote: () => ({
    castRefundableVote: castRefundableVoteMock,
    castRefundableVoteState: hookState.castRefundableVoteState,
  }),
  useCastRefundableVoteWithReason: () => ({
    castRefundableVoteWithReason: castRefundableVoteWithReasonMock,
    castRefundableVoteWithReasonState: hookState.castRefundableVoteWithReasonState,
  }),
  Vote: { AGAINST: 0, FOR: 1, ABSTAIN: 2 },
}));

vi.mock('@/components/NavBarButton', () => ({
  default: ({ buttonText }: { buttonText: React.ReactNode }) => (
    <button data-testid="nav-btn">{buttonText}</button>
  ),
  NavBarButtonStyle: {
    FOR_VOTE_SUBMIT: 'for',
    AGAINST_VOTE_SUBMIT: 'against',
    ABSTAIN_VOTE_SUBMIT: 'abstain',
  },
}));

vi.mock('@/components/SolidColorBackgroundModal', () => ({
  default: ({ show, content }: { show: boolean; content: React.ReactNode }) =>
    show ? <div data-testid="solid-modal">{content}</div> : null,
}));

vi.mock('@/lib/utils', () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(' '),
}));

import VoteModal from './index';

const onHideMock = vi.fn();

const baseProps = {
  show: true,
  onHide: onHideMock,
  proposalId: '42',
  availableVotes: 3,
  isObjectionPeriod: false,
};

const resetState = () => {
  hookState.castRefundableVoteState = { status: 'None' };
  hookState.castRefundableVoteWithReasonState = { status: 'None' };
  castRefundableVoteMock.mockReset();
  castRefundableVoteWithReasonMock.mockReset();
  onHideMock.mockReset();
};

beforeEach(() => {
  resetState();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe('VoteModal', () => {
  it('renders modal content with proposal id title when show=true', () => {
    const { container } = render(<VoteModal {...baseProps} />);
    expect(container.textContent).toContain('Vote on Prop 42');
  });

  it('renders "Nijis" plural label when availableVotes > 1', () => {
    const { container } = render(<VoteModal {...baseProps} availableVotes={5} />);
    expect(container.textContent).toContain('Voting with');
    expect(container.textContent).toContain('Nijis');
  });

  it('renders "Niji" singular label when availableVotes = 1', () => {
    const { container } = render(<VoteModal {...baseProps} availableVotes={1} />);
    const text = container.textContent ?? '';
    expect(text).toContain('Niji');
  });

  it('renders For/Against/Abstain buttons by default', () => {
    const { container } = render(<VoteModal {...baseProps} />);
    expect(container.textContent).toContain('For');
    expect(container.textContent).toContain('Against');
    expect(container.textContent).toContain('Abstain');
  });

  it('hides For/Abstain when isObjectionPeriod=true', () => {
    const { container } = render(<VoteModal {...baseProps} isObjectionPeriod={true} />);
    expect(container.textContent).not.toContain('For');
    expect(container.textContent).not.toContain('Abstain');
    expect(container.textContent).toContain('Against');
  });

  it('updates voteReason on textarea change', () => {
    const { container } = render(<VoteModal {...baseProps} />);
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'because' } });
    expect(textarea.value).toBe('because');
  });

  it('Submit button does nothing when vote not selected', () => {
    const { container } = render(<VoteModal {...baseProps} />);
    const submitBtn = Array.from(container.querySelectorAll('button')).find(b =>
      b.textContent?.includes('Submit Vote'),
    );
    fireEvent.click(submitBtn!);
    expect(castRefundableVoteMock).not.toHaveBeenCalled();
  });

  it('calls castRefundableVote when vote selected without reason', () => {
    const { container } = render(<VoteModal {...baseProps} />);
    const againstWrappers = Array.from(container.querySelectorAll('div')).filter(
      d => d.textContent === 'Against' || d.querySelector('button')?.textContent === 'Against',
    );
    const againstDiv = againstWrappers.find(d => d.children.length === 1);
    fireEvent.click(againstDiv!);
    const submitBtn = Array.from(container.querySelectorAll('button')).find(b =>
      b.textContent?.includes('Submit Vote'),
    );
    fireEvent.click(submitBtn!);
    expect(castRefundableVoteMock).toHaveBeenCalledWith({ args: [BigInt(42), 0] });
  });

  it('calls castRefundableVoteWithReason when vote + reason provided', () => {
    const { container } = render(<VoteModal {...baseProps} />);
    const againstWrappers = Array.from(container.querySelectorAll('div')).filter(
      d => d.textContent === 'Against' || d.querySelector('button')?.textContent === 'Against',
    );
    const againstDiv = againstWrappers.find(d => d.children.length === 1);
    fireEvent.click(againstDiv!);
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'reasoned' } });
    const submitBtn = Array.from(container.querySelectorAll('button')).find(b =>
      b.textContent?.includes('Submit Vote'),
    );
    fireEvent.click(submitBtn!);
    expect(castRefundableVoteWithReasonMock).toHaveBeenCalledWith({
      args: [BigInt(42), 0, 'reasoned'],
    });
  });

  it('shows success copy when castRefundableVoteState=Success', () => {
    hookState.castRefundableVoteState = { status: 'Success' };
    const { container } = render(<VoteModal {...baseProps} />);
    expect(container.textContent).toContain('successfully voted');
  });

  it('shows failure copy when castRefundableVoteState=Fail', () => {
    hookState.castRefundableVoteState = { status: 'Fail', errorMessage: 'boom' };
    const { container } = render(<VoteModal {...baseProps} />);
    expect(container.textContent).toContain('There was an error voting');
    expect(container.textContent).toContain('boom');
  });

  it('auto-closes modal after 3s on success', () => {
    hookState.castRefundableVoteState = { status: 'Success' };
    render(<VoteModal {...baseProps} />);
    expect(onHideMock).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(onHideMock).toHaveBeenCalled();
  });

  it('does not render modal content when show=false', () => {
    const { container } = render(<VoteModal {...baseProps} show={false} />);
    expect(container.querySelector('[data-testid="solid-modal"]')).toBeNull();
  });

  it('auto-closes after success of castRefundableVoteWithReason', () => {
    hookState.castRefundableVoteWithReasonState = { status: 'Success' };
    render(<VoteModal {...baseProps} />);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(onHideMock).toHaveBeenCalled();
  });

  it('shows failure copy when castRefundableVoteWithReasonState=Fail', () => {
    hookState.castRefundableVoteWithReasonState = {
      status: 'Fail',
      errorMessage: 'reason boom',
    };
    const { container } = render(<VoteModal {...baseProps} />);
    expect(container.textContent).toContain('There was an error voting');
    expect(container.textContent).toContain('reason boom');
  });

  it('renders for prop without crash for very large proposalId', () => {
    const { container } = render(<VoteModal {...baseProps} proposalId="999999" />);
    expect(container.textContent).toContain('Vote on Prop 999999');
  });

  it('handles Exception status same as Fail (error copy)', () => {
    hookState.castRefundableVoteState = { status: 'Exception', errorMessage: 'rpc dead' };
    const { container } = render(<VoteModal {...baseProps} />);
    expect(container.textContent).toContain('There was an error voting');
    expect(container.textContent).toContain('rpc dead');
  });
});
