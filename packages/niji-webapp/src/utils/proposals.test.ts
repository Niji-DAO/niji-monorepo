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
});
