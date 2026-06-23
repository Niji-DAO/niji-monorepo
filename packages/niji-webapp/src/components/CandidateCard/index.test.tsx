import React from 'react';

import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/ShortAddress', () => ({
  default: ({ address }: { address: string }) => <span data-testid="short">{address}</span>,
}));

vi.mock('./CandidateSponsors', () => ({
  default: ({ nounsRequired }: { nounsRequired: number }) => (
    <span data-testid="sponsors">req-{nounsRequired}</span>
  ),
}));

vi.mock('@/utils/timeUtils', () => ({
  relativeTimestamp: () => '1 day ago',
}));

import CandidateCard from './index';

const baseCandidate = {
  id: 'cand-1',
  proposer: '0xPROPOSER',
  proposerVotes: 5,
  requiredVotes: 3,
  voteCount: 2,
  version: {
    content: {
      title: 'My Candidate',
      contentSignatures: [],
    },
  },
} as never;

const wrap = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('CandidateCard', () => {
  it('renders candidate title', () => {
    const { container } = wrap(<CandidateCard candidate={baseCandidate} nounsRequired={3} />);
    expect(container.textContent).toContain('My Candidate');
  });

  it('links to /candidates/{id}', () => {
    const { container } = wrap(<CandidateCard candidate={baseCandidate} nounsRequired={3} />);
    expect(container.querySelector('a')?.getAttribute('href')).toBe('/candidates/cand-1');
  });

  it('renders ShortAddress for proposer', () => {
    const { container } = wrap(<CandidateCard candidate={baseCandidate} nounsRequired={3} />);
    expect(container.querySelector('[data-testid="short"]')?.textContent).toBe('0xPROPOSER');
  });

  it('renders CandidateSponsors with requiredVotes', () => {
    const { container } = wrap(<CandidateCard candidate={baseCandidate} nounsRequired={3} />);
    expect(container.querySelector('[data-testid="sponsors"]')?.textContent).toBe('req-3');
  });

  it('handles empty proposer string', () => {
    const candidate = { ...baseCandidate, proposer: null } as never;
    const { container } = wrap(<CandidateCard candidate={candidate} nounsRequired={3} />);
    expect(container.querySelector('[data-testid="short"]')?.textContent).toBe('');
  });
});
