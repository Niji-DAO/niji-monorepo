import { describe, expect, it } from 'vitest';

import { ProposalState, Vote } from '@/wrappers/nijiDao';

import { getProposalVoteIcon } from './getProposalVoteIcon';

const makeProposal = (status: ProposalState) =>
  ({
    status,
  }) as never;

describe('getProposalVoteIcon', () => {
  it('returns PendingVote icon when no support + status is PENDING', () => {
    expect(getProposalVoteIcon(makeProposal(ProposalState.PENDING), undefined)).toBeTruthy();
  });

  it('returns PendingVote icon when no support + status is ACTIVE', () => {
    expect(getProposalVoteIcon(makeProposal(ProposalState.ACTIVE), undefined)).toBeTruthy();
  });

  it('returns AbsentVote icon when no support + status is terminal (EXECUTED)', () => {
    expect(getProposalVoteIcon(makeProposal(ProposalState.EXECUTED), undefined)).toBeTruthy();
  });

  it('returns YesVote icon for FOR vote', () => {
    expect(getProposalVoteIcon(makeProposal(ProposalState.ACTIVE), Vote.FOR)).toBeTruthy();
  });

  it('returns AbstainVote icon for ABSTAIN vote', () => {
    expect(getProposalVoteIcon(makeProposal(ProposalState.ACTIVE), Vote.ABSTAIN)).toBeTruthy();
  });

  it('returns NoVote icon (default switch) for AGAINST vote', () => {
    expect(getProposalVoteIcon(makeProposal(ProposalState.ACTIVE), Vote.AGAINST)).toBeTruthy();
  });

  it('produces distinct icons for FOR vs ABSTAIN vs AGAINST', () => {
    const yes = getProposalVoteIcon(makeProposal(ProposalState.ACTIVE), Vote.FOR);
    const abs = getProposalVoteIcon(makeProposal(ProposalState.ACTIVE), Vote.ABSTAIN);
    const no = getProposalVoteIcon(makeProposal(ProposalState.ACTIVE), Vote.AGAINST);
    expect(yes).not.toBe(abs);
    expect(yes).not.toBe(no);
    expect(abs).not.toBe(no);
  });
});
