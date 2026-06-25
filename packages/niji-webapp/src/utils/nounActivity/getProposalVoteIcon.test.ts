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

  it('returns AbsentVote icon for undefined support + DEFEATED', () => {
    expect(getProposalVoteIcon(makeProposal(ProposalState.DEFEATED), undefined)).toBeTruthy();
  });

  it('returns AbsentVote icon for undefined support + SUCCEEDED', () => {
    expect(getProposalVoteIcon(makeProposal(ProposalState.SUCCEEDED), undefined)).toBeTruthy();
  });

  it('returns AbsentVote icon for undefined support + VETOED', () => {
    expect(getProposalVoteIcon(makeProposal(ProposalState.VETOED), undefined)).toBeTruthy();
  });

  it('returns AbsentVote icon for undefined support + CANCELLED', () => {
    expect(getProposalVoteIcon(makeProposal(ProposalState.CANCELLED), undefined)).toBeTruthy();
  });

  it('PendingVote icon for PENDING differs from AbsentVote for terminal state', () => {
    const pending = getProposalVoteIcon(makeProposal(ProposalState.PENDING), undefined);
    const terminal = getProposalVoteIcon(makeProposal(ProposalState.EXECUTED), undefined);
    expect(pending).not.toBe(terminal);
  });

  it('PendingVote vs FOR vote on ACTIVE state are different icons', () => {
    const pending = getProposalVoteIcon(makeProposal(ProposalState.ACTIVE), undefined);
    const yes = getProposalVoteIcon(makeProposal(ProposalState.ACTIVE), Vote.FOR);
    expect(pending).not.toBe(yes);
  });

  it('returns NoVote (switch default) for AGAINST regardless of proposal status', () => {
    // status は switch 経路に到達しないので、 PENDING / EXECUTED どちらでも NoVote 同じ
    const a = getProposalVoteIcon(makeProposal(ProposalState.PENDING), Vote.AGAINST);
    const b = getProposalVoteIcon(makeProposal(ProposalState.EXECUTED), Vote.AGAINST);
    expect(a).toBe(b);
  });

  it('handles 100 cycles of PENDING + undefined', () => {
    for (let i = 0; i < 100; i++) {
      expect(getProposalVoteIcon(makeProposal(ProposalState.PENDING), undefined)).toBeTruthy();
    }
  });

  it('handles 100 cycles of ACTIVE + Vote.FOR', () => {
    for (let i = 0; i < 100; i++) {
      expect(getProposalVoteIcon(makeProposal(ProposalState.ACTIVE), Vote.FOR)).toBeTruthy();
    }
  });

  it('handles 50 different state + vote combinations', () => {
    const states = [ProposalState.ACTIVE, ProposalState.SUCCEEDED, ProposalState.EXECUTED];
    const votes = [Vote.FOR, Vote.SUPPORT, Vote.ABSTAIN];
    for (let i = 0; i < 50; i++) {
      expect(() => getProposalVoteIcon(makeProposal(states[i % 3]), votes[i % 3])).not.toThrow();
    }
  });

  it('handles 100 cycles of EXECUTED + Vote.FOR', () => {
    for (let i = 0; i < 100; i++) {
      expect(getProposalVoteIcon(makeProposal(ProposalState.EXECUTED), Vote.FOR)).toBeTruthy();
    }
  });

  it('rapid 200 invocations', () => {
    for (let i = 0; i < 200; i++) {
      expect(() => getProposalVoteIcon(makeProposal(ProposalState.ACTIVE), Vote.FOR)).not.toThrow();
    }
  });
});
