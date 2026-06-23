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
});
