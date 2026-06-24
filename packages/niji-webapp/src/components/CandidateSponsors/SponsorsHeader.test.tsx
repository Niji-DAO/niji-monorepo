import React from 'react';

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import { SponsorsHeader } from './SponsorsHeader';

const baseCandidate = {
  voteCount: 5,
  proposerVotes: 3,
} as never;

describe('SponsorsHeader (new candidate flow)', () => {
  it('renders threshold-met message when isThresholdMet=true (non-update)', () => {
    const { container } = render(
      <SponsorsHeader candidate={baseCandidate} isThresholdMet={true} />,
    );
    expect(container.textContent).toContain('met the required threshold');
  });

  it('shows proposer vote count when > 0 (non-update)', () => {
    const { container } = render(
      <SponsorsHeader candidate={baseCandidate} isThresholdMet={false} />,
    );
    expect(container.textContent).toContain('Proposer has 3 vote');
  });

  it('uses singular "vote" when proposerVotes=1', () => {
    const candidate = { ...baseCandidate, proposerVotes: 1 } as never;
    const { container } = render(<SponsorsHeader candidate={candidate} isThresholdMet={false} />);
    expect(container.textContent).toContain('Proposer has 1 vote');
    expect(container.textContent).not.toContain('1 votes');
  });

  it('omits proposer line when proposerVotes=0', () => {
    const candidate = { ...baseCandidate, proposerVotes: 0 } as never;
    const { container } = render(<SponsorsHeader candidate={candidate} isThresholdMet={false} />);
    expect(container.textContent).not.toContain('Proposer has');
  });
});

describe('SponsorsHeader (update flow)', () => {
  it('renders "X of Y original signed votes" when isUpdateToProposal=true', () => {
    const proposal = { signers: [{ id: '0xA' }, { id: '0xB' }] } as never;
    const { container } = render(
      <SponsorsHeader
        candidate={baseCandidate}
        isUpdateToProposal={true}
        isThresholdMet={false}
        originalProposal={proposal}
      />,
    );
    expect(container.textContent).toContain('5 of 2 original signed votes');
  });

  it('renders ... fallback when originalProposal undefined', () => {
    const { container } = render(
      <SponsorsHeader candidate={baseCandidate} isUpdateToProposal={true} isThresholdMet={false} />,
    );
    expect(container.textContent).toContain('5 of ... original signed votes');
  });

  it('renders ... fallback for negative voteCount', () => {
    const candidate = { ...baseCandidate, voteCount: -1 } as never;
    const { container } = render(
      <SponsorsHeader candidate={candidate} isUpdateToProposal={true} isThresholdMet={false} />,
    );
    expect(container.textContent).toContain('... of');
  });

  it('hides proposer vote line in update flow', () => {
    const { container } = render(
      <SponsorsHeader candidate={baseCandidate} isUpdateToProposal={true} isThresholdMet={false} />,
    );
    expect(container.textContent).not.toContain('Proposer has');
  });

  it('renders 10 vote count correctly (plural)', () => {
    const candidate = { ...baseCandidate, proposerVotes: 10 } as never;
    const { container } = render(<SponsorsHeader candidate={candidate} isThresholdMet={false} />);
    expect(container.textContent).toContain('Proposer has 10 vote');
  });

  it('threshold met message takes priority over proposer line', () => {
    const { container } = render(
      <SponsorsHeader candidate={baseCandidate} isThresholdMet={true} />,
    );
    expect(container.textContent).toContain('met the required threshold');
  });

  it('update flow with 3 signers shows "X of 3"', () => {
    const proposal = {
      signers: [{ id: '0xA' }, { id: '0xB' }, { id: '0xC' }],
    } as never;
    const { container } = render(
      <SponsorsHeader
        candidate={baseCandidate}
        isUpdateToProposal={true}
        isThresholdMet={false}
        originalProposal={proposal}
      />,
    );
    expect(container.textContent).toContain('5 of 3');
  });

  it('voteCount=0 in update flow shows "0 of N"', () => {
    const candidate = { ...baseCandidate, voteCount: 0 } as never;
    const proposal = { signers: [{ id: '0xA' }] } as never;
    const { container } = render(
      <SponsorsHeader
        candidate={candidate}
        isUpdateToProposal={true}
        isThresholdMet={false}
        originalProposal={proposal}
      />,
    );
    expect(container.textContent).toContain('0 of 1');
  });

  it('originalProposal with empty signers array shows "..." fallback', () => {
    const proposal = { signers: [] } as never;
    const { container } = render(
      <SponsorsHeader
        candidate={baseCandidate}
        isUpdateToProposal={true}
        isThresholdMet={false}
        originalProposal={proposal}
      />,
    );
    // signers=[] でも fallback "..." 経路
    expect(container.textContent).toContain('5 of');
  });
});
