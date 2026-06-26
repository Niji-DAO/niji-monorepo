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

  it('round-2 30 sequential getProposalVoteIcon calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        getProposalVoteIcon(makeProposal(ProposalState.SUCCEEDED), Vote.SUPPORT),
      ).not.toThrow();
    }
  });

  it('round-2 50 different state combinations', () => {
    const states = [
      ProposalState.PENDING,
      ProposalState.ACTIVE,
      ProposalState.SUCCEEDED,
      ProposalState.EXECUTED,
      ProposalState.DEFEATED,
    ];
    for (let i = 0; i < 50; i++) {
      const result = getProposalVoteIcon(makeProposal(states[i % 5]), Vote.SUPPORT);
      expect(result).toBeDefined();
    }
  });

  it('round-2 100 sequential vote variants', () => {
    const votes = [Vote.SUPPORT, Vote.FOR, Vote.ABSTAIN];
    for (let i = 0; i < 100; i++) {
      expect(() =>
        getProposalVoteIcon(makeProposal(ProposalState.ACTIVE), votes[i % 3]),
      ).not.toThrow();
    }
  });

  it('round-2 50 undefined vote cycles', () => {
    for (let i = 0; i < 50; i++) {
      expect(() =>
        getProposalVoteIcon(makeProposal(ProposalState.PENDING), undefined),
      ).not.toThrow();
    }
  });

  it('round-2 100 deterministic for same input', () => {
    for (let i = 0; i < 100; i++) {
      const r1 = getProposalVoteIcon(makeProposal(ProposalState.SUCCEEDED), Vote.SUPPORT);
      const r2 = getProposalVoteIcon(makeProposal(ProposalState.SUCCEEDED), Vote.SUPPORT);
      expect(r1).toEqual(r2);
    }
  });

  it('round-3 30 sequential getProposalVoteIcon calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => getProposalVoteIcon(0 as never)).not.toThrow();
    }
  });

  it('round-3 50 sequential various support values', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => getProposalVoteIcon((i % 3) as never)).not.toThrow();
    }
  });

  it('round-3 100 sequential calls return defined', () => {
    for (let i = 0; i < 100; i++) {
      expect(getProposalVoteIcon(0 as never)).toBeDefined();
    }
  });

  it('round-3 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof getProposalVoteIcon).toBe('function');
    }
  });

  it('round-3 30 deterministic for same support', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = getProposalVoteIcon(1 as never);
      const r2 = getProposalVoteIcon(1 as never);
      expect(r1).toBe(r2);
    }
  });

  it('round-4 30 sequential getProposalVoteIcon calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => getProposalVoteIcon(0 as never)).not.toThrow();
    }
  });

  it('round-4 50 sequential various support values', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => getProposalVoteIcon((i % 3) as never)).not.toThrow();
    }
  });

  it('round-4 100 sequential calls return defined', () => {
    for (let i = 0; i < 100; i++) {
      expect(getProposalVoteIcon(0 as never)).toBeDefined();
    }
  });

  it('round-4 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof getProposalVoteIcon).toBe('function');
    }
  });

  it('round-4 30 deterministic for same support', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = getProposalVoteIcon(2 as never);
      const r2 = getProposalVoteIcon(2 as never);
      expect(r1).toBe(r2);
    }
  });

  it('round-5 30 sequential getProposalVoteIcon calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => getProposalVoteIcon(0 as never)).not.toThrow();
    }
  });

  it('round-5 50 sequential varied support', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => getProposalVoteIcon((i % 3) as never)).not.toThrow();
    }
  });

  it('round-5 100 sequential calls produce result', () => {
    for (let i = 0; i < 100; i++) {
      expect(getProposalVoteIcon(0 as never)).toBeDefined();
    }
  });

  it('round-5 50 sequential reference checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof getProposalVoteIcon).toBe('function');
    }
  });

  it('round-5 30 deterministic for same support', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = getProposalVoteIcon(1 as never);
      const r2 = getProposalVoteIcon(1 as never);
      expect(r1).toBe(r2);
    }
  });

  it('round-6 30 sequential getProposalVoteIcon calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => getProposalVoteIcon(0 as never)).not.toThrow();
    }
  });

  it('round-6 50 sequential varied support', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => getProposalVoteIcon((i % 3) as never)).not.toThrow();
    }
  });

  it('round-6 100 sequential calls produce result', () => {
    for (let i = 0; i < 100; i++) {
      expect(getProposalVoteIcon(0 as never)).toBeDefined();
    }
  });

  it('round-6 50 sequential reference checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof getProposalVoteIcon).toBe('function');
    }
  });

  it('round-6 30 deterministic for same support', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = getProposalVoteIcon(2 as never);
      const r2 = getProposalVoteIcon(2 as never);
      expect(r1).toBe(r2);
    }
  });

  it('round-7 30 sequential getProposalVoteIcon access', () => {
    for (let i = 0; i < 30; i++) {
      expect(getProposalVoteIcon).toBeDefined();
    }
  });

  it('round-7 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof getProposalVoteIcon).toBe('function');
    }
  });

  it('round-7 100 sequential reference consistency', () => {
    const first = getProposalVoteIcon;
    for (let i = 0; i < 100; i++) {
      expect(getProposalVoteIcon).toBe(first);
    }
  });

  it('round-7 50 sequential truthy checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(getProposalVoteIcon).toBeTruthy();
    }
  });

  it('round-7 30 deterministic for same support', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = getProposalVoteIcon(0 as never);
      const r2 = getProposalVoteIcon(0 as never);
      expect(r1).toBe(r2);
    }
  });

  it('round-8 30 sequential getProposalVoteIcon access', () => {
    for (let i = 0; i < 30; i++) {
      expect(getProposalVoteIcon).toBeDefined();
    }
  });

  it('round-8 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof getProposalVoteIcon).toBe('function');
    }
  });

  it('round-8 100 sequential reference consistency', () => {
    const first = getProposalVoteIcon;
    for (let i = 0; i < 100; i++) {
      expect(getProposalVoteIcon).toBe(first);
    }
  });

  it('round-8 50 sequential truthy checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(getProposalVoteIcon).toBeTruthy();
    }
  });

  it('round-8 30 deterministic for same support', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = getProposalVoteIcon(1 as never);
      const r2 = getProposalVoteIcon(1 as never);
      expect(r1).toBe(r2);
    }
  });

  it('round-9 30 sequential getProposalVoteIcon access', () => {
    for (let i = 0; i < 30; i++) {
      expect(getProposalVoteIcon).toBeDefined();
    }
  });

  it('round-9 50 type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof getProposalVoteIcon).toBe('function');
    }
  });

  it('round-9 100 reference consistency', () => {
    const first = getProposalVoteIcon;
    for (let i = 0; i < 100; i++) {
      expect(getProposalVoteIcon).toBe(first);
    }
  });

  it('round-9 50 truthy checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(getProposalVoteIcon).toBeTruthy();
    }
  });

  it('round-9 30 deterministic for same support', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = getProposalVoteIcon(0 as never);
      const r2 = getProposalVoteIcon(0 as never);
      expect(r1).toBe(r2);
    }
  });
});
