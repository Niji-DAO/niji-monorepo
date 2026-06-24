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

  it('long title (300 chars) renders fully', () => {
    const long = 'a'.repeat(300);
    const candidate = {
      ...baseCandidate,
      version: { content: { title: long, contentSignatures: [] } },
    } as never;
    const { container } = wrap(<CandidateCard candidate={candidate} nounsRequired={3} />);
    expect(container.textContent).toContain(long);
  });

  it('href contains "candidates/" prefix', () => {
    const { container } = wrap(<CandidateCard candidate={baseCandidate} nounsRequired={3} />);
    expect(container.querySelector('a')?.getAttribute('href')).toContain('candidates/');
  });

  it('multiple CandidateCard instances render independently', () => {
    const c1 = { ...baseCandidate, id: 'c1' } as never;
    const c2 = { ...baseCandidate, id: 'c2' } as never;
    const { container } = wrap(
      <>
        <CandidateCard candidate={c1} nounsRequired={3} />
        <CandidateCard candidate={c2} nounsRequired={3} />
      </>,
    );
    const links = container.querySelectorAll('a');
    expect(links[0].getAttribute('href')).toBe('/candidates/c1');
    expect(links[1].getAttribute('href')).toBe('/candidates/c2');
  });

  it('candidate.requiredVotes 0 still renders sponsors req-0', () => {
    const candidate = { ...baseCandidate, requiredVotes: 0 } as never;
    const { container } = wrap(<CandidateCard candidate={candidate} nounsRequired={3} />);
    expect(container.querySelector('[data-testid="sponsors"]')?.textContent).toBe('req-0');
  });

  it('candidate.requiredVotes 100 renders sponsors req-100', () => {
    const candidate = { ...baseCandidate, requiredVotes: 100 } as never;
    const { container } = wrap(<CandidateCard candidate={candidate} nounsRequired={3} />);
    expect(container.querySelector('[data-testid="sponsors"]')?.textContent).toBe('req-100');
  });

  it('empty title still renders link', () => {
    const candidate = {
      ...baseCandidate,
      version: { content: { title: '', contentSignatures: [] } },
    } as never;
    const { container } = wrap(<CandidateCard candidate={candidate} nounsRequired={3} />);
    expect(container.querySelector('a')).not.toBeNull();
  });

  it('proposer prop with hex address renders unchanged', () => {
    const longAddr = '0x1234567890abcdef1234567890abcdef12345678';
    const candidate = { ...baseCandidate, proposer: longAddr } as never;
    const { container } = wrap(<CandidateCard candidate={candidate} nounsRequired={3} />);
    expect(container.querySelector('[data-testid="short"]')?.textContent).toBe(longAddr);
  });
});
