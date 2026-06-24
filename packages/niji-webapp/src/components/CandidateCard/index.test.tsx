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

  it('passes candidate.requiredVotes (3) to sponsors regardless of nounsRequired prop', () => {
    // candidate.requiredVotes=3 を component 内で優先、 nounsRequired prop は ignore される経路
    const { container } = wrap(<CandidateCard candidate={baseCandidate} nounsRequired={99} />);
    expect(container.querySelector('[data-testid="sponsors"]')?.textContent).toBe('req-3');
  });

  it('handles unicode title (Japanese)', () => {
    const candidate = {
      ...baseCandidate,
      version: { content: { title: '日本語タイトル', contentSignatures: [] } },
    } as never;
    const { container } = wrap(<CandidateCard candidate={candidate} nounsRequired={3} />);
    expect(container.textContent).toContain('日本語タイトル');
  });

  it('handles different candidate.id in link path', () => {
    const candidate = { ...baseCandidate, id: 'cand-xyz-99' } as never;
    const { container } = wrap(<CandidateCard candidate={candidate} nounsRequired={3} />);
    expect(container.querySelector('a')?.getAttribute('href')).toBe('/candidates/cand-xyz-99');
  });

  it('renders exactly 1 anchor (internal link)', () => {
    const { container } = wrap(<CandidateCard candidate={baseCandidate} nounsRequired={3} />);
    expect(container.querySelectorAll('a').length).toBe(1);
  });

  it('renders relativeTimestamp string (mocked "1 day ago")', () => {
    const { container } = wrap(<CandidateCard candidate={baseCandidate} nounsRequired={3} />);
    expect(container.textContent).toContain('1 day ago');
  });

  it('renders empty contentSignatures array gracefully', () => {
    const candidate = {
      ...baseCandidate,
      version: { content: { title: 'T', contentSignatures: [] } },
    } as never;
    const { container } = wrap(<CandidateCard candidate={candidate} nounsRequired={3} />);
    expect(container.textContent).toContain('T');
  });

  it('renders different requiredVotes (5) to sponsors', () => {
    const candidate = { ...baseCandidate, requiredVotes: 5 } as never;
    const { container } = wrap(<CandidateCard candidate={candidate} nounsRequired={3} />);
    expect(container.querySelector('[data-testid="sponsors"]')?.textContent).toBe('req-5');
  });

  it('renders link href without query string (clean)', () => {
    const { container } = wrap(<CandidateCard candidate={baseCandidate} nounsRequired={3} />);
    const href = container.querySelector('a')?.getAttribute('href') ?? '';
    expect(href).not.toContain('?');
  });

  it('proposer address renders within ShortAddress', () => {
    const candidate = { ...baseCandidate, proposer: '0xBOB' } as never;
    const { container } = wrap(<CandidateCard candidate={candidate} nounsRequired={3} />);
    expect(container.querySelector('[data-testid="short"]')?.textContent).toBe('0xBOB');
  });

  it('renders 1 sponsors element exactly', () => {
    const { container } = wrap(<CandidateCard candidate={baseCandidate} nounsRequired={3} />);
    expect(container.querySelectorAll('[data-testid="sponsors"]').length).toBe(1);
  });
});
