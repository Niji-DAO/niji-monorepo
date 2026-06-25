import { describe, expect, it } from 'vitest';

import { Proposal, ProposalState } from '@/wrappers/nijiDao';

import { useProposalStatus } from './useProposalStatus';

// useProposalStatus は pure function (Hook 風だが React hook なし)、 mock 不要
describe('useProposalStatus', () => {
  const baseProposal = (status: ProposalState): Proposal =>
    ({
      status,
    }) as Proposal;

  it('returns "success" for SUCCEEDED', () => {
    expect(useProposalStatus(baseProposal(ProposalState.SUCCEEDED))).toBe('success');
  });

  it('returns "success" for EXECUTED', () => {
    expect(useProposalStatus(baseProposal(ProposalState.EXECUTED))).toBe('success');
  });

  it('returns "success" for QUEUED', () => {
    expect(useProposalStatus(baseProposal(ProposalState.QUEUED))).toBe('success');
  });

  it('returns "failure" for DEFEATED', () => {
    expect(useProposalStatus(baseProposal(ProposalState.DEFEATED))).toBe('failure');
  });

  it('returns "failure" for VETOED', () => {
    expect(useProposalStatus(baseProposal(ProposalState.VETOED))).toBe('failure');
  });

  it('returns "pending" for ACTIVE', () => {
    expect(useProposalStatus(baseProposal(ProposalState.ACTIVE))).toBe('pending');
  });

  it('returns "pending" for PENDING', () => {
    expect(useProposalStatus(baseProposal(ProposalState.PENDING))).toBe('pending');
  });

  it('returns "pending" for CANCELED', () => {
    expect(useProposalStatus(baseProposal(ProposalState.CANCELED))).toBe('pending');
  });

  it('returns "pending" for EXPIRED', () => {
    expect(useProposalStatus(baseProposal(ProposalState.EXPIRED))).toBe('pending');
  });

  it('returns "pending" for UPDATABLE (default branch)', () => {
    expect(useProposalStatus(baseProposal(ProposalState.UPDATABLE))).toBe('pending');
  });

  it('returns "pending" for OBJECTION_PERIOD (default branch)', () => {
    expect(useProposalStatus(baseProposal(ProposalState.OBJECTION_PERIOD))).toBe('pending');
  });

  it('returns "pending" for UNDETERMINED (default branch)', () => {
    expect(useProposalStatus(baseProposal(ProposalState.UNDETERMINED))).toBe('pending');
  });

  it('3 success cases (SUCCEEDED / EXECUTED / QUEUED) return identical "success" string', () => {
    const a = useProposalStatus(baseProposal(ProposalState.SUCCEEDED));
    const b = useProposalStatus(baseProposal(ProposalState.EXECUTED));
    const c = useProposalStatus(baseProposal(ProposalState.QUEUED));
    expect(a).toBe(b);
    expect(b).toBe(c);
    expect(a).toBe('success');
  });

  it('2 failure cases (DEFEATED / VETOED) return identical "failure" string', () => {
    expect(useProposalStatus(baseProposal(ProposalState.DEFEATED))).toBe(
      useProposalStatus(baseProposal(ProposalState.VETOED)),
    );
  });

  /* eslint-disable react-hooks/rules-of-hooks */
  it('handles 50 cycles of SUCCEEDED state', () => {
    for (let i = 0; i < 50; i++) {
      expect(useProposalStatus(baseProposal(ProposalState.SUCCEEDED))).toBe('success');
    }
  });

  it('handles 50 cycles of EXECUTED state', () => {
    for (let i = 0; i < 50; i++) {
      expect(useProposalStatus(baseProposal(ProposalState.EXECUTED))).toBe('success');
    }
  });

  it('handles 50 cycles of ACTIVE state', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof useProposalStatus(baseProposal(ProposalState.ACTIVE))).toBe('string');
    }
  });

  it('handles 100 sequential evaluations', () => {
    const states = [ProposalState.ACTIVE, ProposalState.PENDING, ProposalState.SUCCEEDED];
    for (let i = 0; i < 100; i++) {
      expect(typeof useProposalStatus(baseProposal(states[i % 3]))).toBe('string');
    }
  });

  it('rapid 100 invocations with EXECUTED', () => {
    for (let i = 0; i < 100; i++) {
      expect(() => useProposalStatus(baseProposal(ProposalState.EXECUTED))).not.toThrow();
    }
  });
  /* eslint-enable react-hooks/rules-of-hooks */
});
