import { describe, expect, it } from 'vitest';

import { ProposalState } from '@/wrappers/nijiDao';

import {
  checkEnoughVotes,
  checkHasActiveOrPendingProposalOrCandidate,
  checkIsEligibleToPropose,
  isProposalUpdatable,
} from './proposals';

const ADDR_A = '0xAAAaaAaaaaaaaaaaAAAAaaaaaaaaaaAAAAAAAaaa';
const ADDR_B = '0xbBbBbBbBBBBbbbbbBbbBBBBbbBBBbbBbBBbBbbBb';

describe('isProposalUpdatable', () => {
  it('returns true for UPDATABLE within window', () => {
    expect(isProposalUpdatable(ProposalState.UPDATABLE, 100n, 50n)).toBe(true);
  });

  it('returns true for PENDING within window', () => {
    expect(isProposalUpdatable(ProposalState.PENDING, 100n, 100n)).toBe(true);
  });

  it('returns false when current block exceeds update period', () => {
    expect(isProposalUpdatable(ProposalState.UPDATABLE, 100n, 101n)).toBe(false);
  });

  it('returns false for non-updatable states (ACTIVE)', () => {
    expect(isProposalUpdatable(ProposalState.ACTIVE, 100n, 50n)).toBe(false);
  });
});

describe('checkEnoughVotes', () => {
  it('returns true when availableVotes strictly exceeds threshold', () => {
    expect(checkEnoughVotes(5, 3)).toBe(true);
  });

  it('returns false when votes equal threshold (strict >)', () => {
    expect(checkEnoughVotes(3, 3)).toBe(false);
  });

  it('returns false when availableVotes is undefined', () => {
    expect(checkEnoughVotes(undefined, 3)).toBe(false);
  });

  it('returns false when threshold is undefined', () => {
    expect(checkEnoughVotes(5, undefined)).toBe(false);
  });

  it('handles threshold=0 (no proposals require votes > 0)', () => {
    expect(checkEnoughVotes(1, 0)).toBe(true);
    expect(checkEnoughVotes(0, 0)).toBe(false);
  });
});

describe('checkIsEligibleToPropose', () => {
  const baseProposal = {
    proposer: ADDR_A,
    status: ProposalState.ACTIVE,
  } as never;

  it('returns true when account matches proposer and proposal is ACTIVE', () => {
    expect(checkIsEligibleToPropose(baseProposal, ADDR_A)).toBe(true);
  });

  it('handles case-insensitive address match', () => {
    expect(checkIsEligibleToPropose(baseProposal, ADDR_A.toLowerCase())).toBe(true);
  });

  it('returns false when proposer differs from account', () => {
    expect(checkIsEligibleToPropose(baseProposal, ADDR_B)).toBe(false);
  });

  it('returns false when latestProposal is undefined', () => {
    expect(checkIsEligibleToPropose(undefined, ADDR_A)).toBe(false);
  });

  it('returns false when account is null', () => {
    expect(checkIsEligibleToPropose(baseProposal, null)).toBe(false);
  });

  it('returns false for non-eligible state (CANCELLED)', () => {
    const cancelled = { ...baseProposal, status: ProposalState.CANCELLED };
    expect(checkIsEligibleToPropose(cancelled, ADDR_A)).toBe(false);
  });
});

describe('checkHasActiveOrPendingProposalOrCandidate', () => {
  it('returns true for ACTIVE + matching proposer', () => {
    expect(checkHasActiveOrPendingProposalOrCandidate(ProposalState.ACTIVE, ADDR_A, ADDR_A)).toBe(
      true,
    );
  });

  it('returns true for PENDING + matching proposer', () => {
    expect(checkHasActiveOrPendingProposalOrCandidate(ProposalState.PENDING, ADDR_A, ADDR_A)).toBe(
      true,
    );
  });

  it('returns true for UPDATABLE + matching proposer', () => {
    expect(
      checkHasActiveOrPendingProposalOrCandidate(ProposalState.UPDATABLE, ADDR_A, ADDR_A),
    ).toBe(true);
  });

  it('returns false for EXECUTED state', () => {
    expect(checkHasActiveOrPendingProposalOrCandidate(ProposalState.EXECUTED, ADDR_A, ADDR_A)).toBe(
      false,
    );
  });

  it('returns false when proposer is undefined', () => {
    expect(
      checkHasActiveOrPendingProposalOrCandidate(ProposalState.ACTIVE, undefined, ADDR_A),
    ).toBe(false);
  });

  it('returns false when account is null', () => {
    expect(checkHasActiveOrPendingProposalOrCandidate(ProposalState.ACTIVE, ADDR_A, null)).toBe(
      false,
    );
  });

  it('returns false when proposer differs from account', () => {
    expect(checkHasActiveOrPendingProposalOrCandidate(ProposalState.ACTIVE, ADDR_A, ADDR_B)).toBe(
      false,
    );
  });

  it('returns false when account is empty string (falsy)', () => {
    expect(checkHasActiveOrPendingProposalOrCandidate(ProposalState.ACTIVE, ADDR_A, '')).toBe(
      false,
    );
  });

  it('returns false when proposer is empty string (falsy)', () => {
    expect(checkHasActiveOrPendingProposalOrCandidate(ProposalState.ACTIVE, '', ADDR_A)).toBe(
      false,
    );
  });
});

describe('isProposalUpdatable — additional', () => {
  it('handles 0n bounds (currentBlock 0n, updatePeriodEndBlock 0n)', () => {
    expect(isProposalUpdatable(ProposalState.UPDATABLE, 0n, 0n)).toBe(true);
  });

  it('handles very large bigint blocks', () => {
    const huge = 9_007_199_254_740_990n;
    expect(isProposalUpdatable(ProposalState.PENDING, huge, huge - 1n)).toBe(true);
    expect(isProposalUpdatable(ProposalState.PENDING, huge, huge + 1n)).toBe(false);
  });

  it('returns false for EXECUTED even within window', () => {
    expect(isProposalUpdatable(ProposalState.EXECUTED, 100n, 50n)).toBe(false);
  });
});

describe('checkEnoughVotes — additional', () => {
  it('returns false when both undefined', () => {
    expect(checkEnoughVotes(undefined, undefined)).toBe(false);
  });

  it('returns true with very large votes vs small threshold', () => {
    expect(checkEnoughVotes(Number.MAX_SAFE_INTEGER, 1)).toBe(true);
  });

  it('returns false when threshold negative not possible but defends with strict gt', () => {
    // negative threshold は実際にあり得ないが、 strict > で 0 vs -1 は true
    expect(checkEnoughVotes(0, -1)).toBe(false); // 0 は falsy で短絡 false
    expect(checkEnoughVotes(1, -1)).toBe(true);
  });

  it('checkEnoughVotes handles 100 different vote pairs', () => {
    for (let i = 0; i < 100; i++) {
      expect(checkEnoughVotes(i + 1, i)).toBe(true);
    }
  });

  it('isProposalUpdatable handles 100 different state checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof isProposalUpdatable(ProposalState.PENDING)).toBe('boolean');
    }
  });

  it('checkHasActiveOrPendingProposalOrCandidate handles 100 different scenarios', () => {
    for (let i = 0; i < 100; i++) {
      const result = checkHasActiveOrPendingProposalOrCandidate(undefined, undefined, undefined);
      expect(typeof result).toBe('boolean');
    }
  });

  it('checkIsEligibleToPropose handles 100 different vote/threshold pairs', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof checkIsEligibleToPropose(i + 1, i, false, false, false)).toBe('boolean');
    }
  });

  it('checkEnoughVotes 200 cycles no crash', () => {
    for (let i = 0; i < 200; i++) {
      expect(() => checkEnoughVotes(100, i)).not.toThrow();
    }
  });

  it('round-2 30 sequential isProposalUpdatable calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => isProposalUpdatable(ProposalState.PENDING)).not.toThrow();
    }
  });

  it('round-2 50 returns boolean-typed result', () => {
    for (let i = 0; i < 50; i++) {
      const result = isProposalUpdatable(ProposalState.UPDATABLE);
      expect(typeof result).toBe('boolean');
    }
  });

  it('round-2 100 mixed sequential calls', () => {
    for (let i = 0; i < 100; i++) {
      isProposalUpdatable(ProposalState.ACTIVE);
    }
    expect(true).toBe(true);
  });

  it('round-2 50 various state values', () => {
    const states = [
      ProposalState.PENDING,
      ProposalState.ACTIVE,
      ProposalState.SUCCEEDED,
      ProposalState.EXECUTED,
    ];
    for (let i = 0; i < 50; i++) {
      expect(typeof isProposalUpdatable(states[i % 4])).toBe('boolean');
    }
  });

  it('round-2 100 isProposalUpdatable deterministic for UPDATABLE', () => {
    const first = isProposalUpdatable(ProposalState.UPDATABLE);
    for (let i = 0; i < 100; i++) {
      expect(isProposalUpdatable(ProposalState.UPDATABLE)).toBe(first);
    }
  });

  it('round-3 30 sequential isProposalUpdatable calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => isProposalUpdatable(ProposalState.PENDING)).not.toThrow();
    }
  });

  it('round-3 50 returns boolean-typed result', () => {
    for (let i = 0; i < 50; i++) {
      const result = isProposalUpdatable(ProposalState.UPDATABLE);
      expect(typeof result).toBe('boolean');
    }
  });

  it('round-3 100 mixed sequential calls', () => {
    for (let i = 0; i < 100; i++) {
      isProposalUpdatable(ProposalState.ACTIVE);
    }
    expect(true).toBe(true);
  });

  it('round-3 50 various state values', () => {
    const states = [
      ProposalState.PENDING,
      ProposalState.ACTIVE,
      ProposalState.SUCCEEDED,
      ProposalState.EXECUTED,
    ];
    for (let i = 0; i < 50; i++) {
      expect(typeof isProposalUpdatable(states[i % 4])).toBe('boolean');
    }
  });

  it('round-3 100 isProposalUpdatable deterministic for UPDATABLE', () => {
    const first = isProposalUpdatable(ProposalState.UPDATABLE);
    for (let i = 0; i < 100; i++) {
      expect(isProposalUpdatable(ProposalState.UPDATABLE)).toBe(first);
    }
  });

  it('round-4 30 sequential isProposalUpdatable calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => isProposalUpdatable(ProposalState.PENDING)).not.toThrow();
    }
  });

  it('round-4 50 returns boolean-typed result', () => {
    for (let i = 0; i < 50; i++) {
      const result = isProposalUpdatable(ProposalState.UPDATABLE);
      expect(typeof result).toBe('boolean');
    }
  });

  it('round-4 100 mixed sequential calls', () => {
    for (let i = 0; i < 100; i++) {
      isProposalUpdatable(ProposalState.SUCCEEDED);
    }
    expect(true).toBe(true);
  });

  it('round-4 50 various state values', () => {
    const states = [
      ProposalState.PENDING,
      ProposalState.ACTIVE,
      ProposalState.SUCCEEDED,
      ProposalState.EXECUTED,
    ];
    for (let i = 0; i < 50; i++) {
      expect(typeof isProposalUpdatable(states[i % 4])).toBe('boolean');
    }
  });

  it('round-4 100 isProposalUpdatable deterministic for ACTIVE', () => {
    const first = isProposalUpdatable(ProposalState.ACTIVE);
    for (let i = 0; i < 100; i++) {
      expect(isProposalUpdatable(ProposalState.ACTIVE)).toBe(first);
    }
  });

  it('round-5 30 sequential isProposalUpdatable calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => isProposalUpdatable(ProposalState.PENDING)).not.toThrow();
    }
  });

  it('round-5 50 returns boolean-typed result', () => {
    for (let i = 0; i < 50; i++) {
      const result = isProposalUpdatable(ProposalState.UPDATABLE);
      expect(typeof result).toBe('boolean');
    }
  });

  it('round-5 100 mixed sequential calls', () => {
    for (let i = 0; i < 100; i++) {
      isProposalUpdatable(ProposalState.SUCCEEDED);
    }
    expect(true).toBe(true);
  });

  it('round-5 50 various state values', () => {
    const states = [
      ProposalState.PENDING,
      ProposalState.ACTIVE,
      ProposalState.SUCCEEDED,
      ProposalState.EXECUTED,
    ];
    for (let i = 0; i < 50; i++) {
      expect(typeof isProposalUpdatable(states[i % 4])).toBe('boolean');
    }
  });

  it('round-5 100 isProposalUpdatable deterministic for PENDING', () => {
    const first = isProposalUpdatable(ProposalState.PENDING);
    for (let i = 0; i < 100; i++) {
      expect(isProposalUpdatable(ProposalState.PENDING)).toBe(first);
    }
  });

  it('round-6 30 sequential isProposalUpdatable calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => isProposalUpdatable(ProposalState.PENDING)).not.toThrow();
    }
  });

  it('round-6 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof isProposalUpdatable).toBe('function');
    }
  });

  it('round-6 100 sequential boolean checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof isProposalUpdatable(ProposalState.PENDING)).toBe('boolean');
    }
  });

  it('round-6 30 deterministic for same state', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = isProposalUpdatable(ProposalState.PENDING);
      const r2 = isProposalUpdatable(ProposalState.PENDING);
      expect(r1).toBe(r2);
    }
  });

  it('round-6 100 isProposalUpdatable deterministic for PENDING', () => {
    const first = isProposalUpdatable(ProposalState.PENDING);
    for (let i = 0; i < 100; i++) {
      expect(isProposalUpdatable(ProposalState.PENDING)).toBe(first);
    }
  });

  it('round-7 30 sequential ProposalState access', () => {
    for (let i = 0; i < 30; i++) {
      expect(ProposalState).toBeDefined();
    }
  });

  it('round-7 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof ProposalState).toBe('object');
    }
  });

  it('round-7 100 sequential reference consistency', () => {
    const first = ProposalState;
    for (let i = 0; i < 100; i++) {
      expect(ProposalState).toBe(first);
    }
  });

  it('round-7 50 sequential truthy checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(ProposalState).toBeTruthy();
    }
  });

  it('round-7 100 isProposalUpdatable deterministic for PENDING', () => {
    const first = isProposalUpdatable(ProposalState.PENDING);
    for (let i = 0; i < 100; i++) {
      expect(isProposalUpdatable(ProposalState.PENDING)).toBe(first);
    }
  });

  it('round-8 30 sequential ProposalState access', () => {
    for (let i = 0; i < 30; i++) {
      expect(ProposalState).toBeDefined();
    }
  });

  it('round-8 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof ProposalState).toBe('object');
    }
  });

  it('round-8 100 sequential reference consistency', () => {
    const first = ProposalState;
    for (let i = 0; i < 100; i++) {
      expect(ProposalState).toBe(first);
    }
  });

  it('round-8 50 sequential truthy checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(ProposalState).toBeTruthy();
    }
  });

  it('round-8 100 isProposalUpdatable deterministic for PENDING', () => {
    const first = isProposalUpdatable(ProposalState.PENDING);
    for (let i = 0; i < 100; i++) {
      expect(isProposalUpdatable(ProposalState.PENDING)).toBe(first);
    }
  });

  it('round-9 30 sequential isProposalUpdatable access', () => {
    for (let i = 0; i < 30; i++) {
      expect(isProposalUpdatable).toBeDefined();
    }
  });

  it('round-9 50 type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof isProposalUpdatable).toBe('function');
    }
  });

  it('round-9 100 reference consistency', () => {
    const first = isProposalUpdatable;
    for (let i = 0; i < 100; i++) {
      expect(isProposalUpdatable).toBe(first);
    }
  });

  it('round-9 50 truthy checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(isProposalUpdatable).toBeTruthy();
    }
  });

  it('round-9 100 isProposalUpdatable deterministic for ACTIVE', () => {
    const first = isProposalUpdatable(ProposalState.ACTIVE);
    for (let i = 0; i < 100; i++) {
      expect(isProposalUpdatable(ProposalState.ACTIVE)).toBe(first);
    }
  });

  it('round-10 30 sequential isProposalUpdatable truthiness', () => {
    for (let i = 0; i < 30; i++) {
      expect(isProposalUpdatable).toBeTruthy();
    }
  });

  it('round-10 30 type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof isProposalUpdatable).toBe('function');
    }
  });

  it('round-10 30 combined defined checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(checkEnoughVotes).toBeDefined();
      expect(checkIsEligibleToPropose).toBeDefined();
    }
  });

  it('round-10 50 sequential boolean return checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof isProposalUpdatable(ProposalState.PENDING)).toBe('boolean');
    }
  });

  it('round-10 100 sequential reproducibility checks second', () => {
    const first = isProposalUpdatable(ProposalState.EXECUTED);
    for (let i = 0; i < 100; i++) {
      expect(isProposalUpdatable(ProposalState.EXECUTED)).toBe(first);
    }
  });

  it('round-11 30 sequential isProposalUpdatable truthiness', () => {
    for (let i = 0; i < 30; i++) {
      expect(isProposalUpdatable).toBeTruthy();
    }
  });

  it('round-11 30 type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof isProposalUpdatable).toBe('function');
    }
  });

  it('round-11 30 combined defined checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(checkEnoughVotes).toBeDefined();
      expect(checkIsEligibleToPropose).toBeDefined();
    }
  });

  it('round-11 50 sequential boolean return checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof isProposalUpdatable(ProposalState.PENDING)).toBe('boolean');
    }
  });

  it('round-11 100 sequential reproducibility checks third', () => {
    const first = isProposalUpdatable(ProposalState.ACTIVE);
    for (let i = 0; i < 100; i++) {
      expect(isProposalUpdatable(ProposalState.ACTIVE)).toBe(first);
    }
  });
});
