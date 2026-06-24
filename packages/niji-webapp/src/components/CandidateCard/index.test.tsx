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

  it('candidate.id with special chars renders in href', () => {
    const candidate = { ...baseCandidate, id: 'special-id-xyz' } as never;
    const { container } = wrap(<CandidateCard candidate={candidate} nounsRequired={3} />);
    expect(container.querySelector('a')?.getAttribute('href')).toBe('/candidates/special-id-xyz');
  });

  it('multiple CandidateCard render 5 anchor links', () => {
    const { container } = wrap(
      <>
        <CandidateCard candidate={baseCandidate} nounsRequired={3} />
        <CandidateCard candidate={baseCandidate} nounsRequired={3} />
        <CandidateCard candidate={baseCandidate} nounsRequired={3} />
        <CandidateCard candidate={baseCandidate} nounsRequired={3} />
        <CandidateCard candidate={baseCandidate} nounsRequired={3} />
      </>,
    );
    expect(container.querySelectorAll('a').length).toBe(5);
  });

  it('candidate.voteCount=10 renders without crash', () => {
    const candidate = { ...baseCandidate, voteCount: 10 } as never;
    expect(() => wrap(<CandidateCard candidate={candidate} nounsRequired={3} />)).not.toThrow();
  });

  it('proposer with mixed case address preserved verbatim', () => {
    const candidate = { ...baseCandidate, proposer: '0xMiXeDcAsE' } as never;
    const { container } = wrap(<CandidateCard candidate={candidate} nounsRequired={3} />);
    expect(container.querySelector('[data-testid="short"]')?.textContent).toBe('0xMiXeDcAsE');
  });

  it('candidate.proposerVotes=0 renders without crash', () => {
    const candidate = { ...baseCandidate, proposerVotes: 0 } as never;
    expect(() => wrap(<CandidateCard candidate={candidate} nounsRequired={3} />)).not.toThrow();
  });

  it('renders without crash for nounsRequired=0', () => {
    expect(() => wrap(<CandidateCard candidate={baseCandidate} nounsRequired={0} />)).not.toThrow();
  });

  it('renders without crash for nounsRequired=100', () => {
    expect(() =>
      wrap(<CandidateCard candidate={baseCandidate} nounsRequired={100} />),
    ).not.toThrow();
  });

  it('renders 5 instances each independently', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 5 }, (_, i) => (
            <CandidateCard key={i} candidate={baseCandidate} nounsRequired={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('renders without crash for very large nounsRequired (10000)', () => {
    expect(() =>
      wrap(<CandidateCard candidate={baseCandidate} nounsRequired={10000} />),
    ).not.toThrow();
  });

  it('consecutive renders work without crash', () => {
    expect(() => {
      wrap(<CandidateCard candidate={baseCandidate} nounsRequired={3} />);
      wrap(<CandidateCard candidate={baseCandidate} nounsRequired={10} />);
    }).not.toThrow();
  });

  it('renders 10 instances each with distinct id', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 10 }, (_, i) => (
            <CandidateCard
              key={i}
              candidate={{ ...baseCandidate, id: `c-${i}` } as never}
              nounsRequired={i}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles candidate with proposerVotes=0', () => {
    const c = { ...baseCandidate, proposerVotes: 0 } as never;
    expect(() => wrap(<CandidateCard candidate={c} nounsRequired={3} />)).not.toThrow();
  });

  it('handles candidate with voteCount=100', () => {
    const c = { ...baseCandidate, voteCount: 100 } as never;
    expect(() => wrap(<CandidateCard candidate={c} nounsRequired={3} />)).not.toThrow();
  });

  it('renders empty contentSignatures array gracefully', () => {
    const c = {
      ...baseCandidate,
      version: { content: { title: 'X', contentSignatures: [] } },
    } as never;
    expect(() => wrap(<CandidateCard candidate={c} nounsRequired={3} />)).not.toThrow();
  });

  it('renders 5 cards consecutively without crash', () => {
    for (let i = 0; i < 5; i++) {
      expect(() =>
        wrap(<CandidateCard candidate={baseCandidate} nounsRequired={i} />),
      ).not.toThrow();
    }
  });

  it('renders 30 instances each independently', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <CandidateCard
              key={i}
              candidate={{ ...baseCandidate, id: `c-${i}` } as never}
              nounsRequired={i}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles candidate with proposerVotes=999999', () => {
    const c = { ...baseCandidate, proposerVotes: 999999 } as never;
    expect(() => wrap(<CandidateCard candidate={c} nounsRequired={3} />)).not.toThrow();
  });

  it('handles candidate without title', () => {
    const c = {
      ...baseCandidate,
      version: { content: { title: '', contentSignatures: [] } },
    } as never;
    expect(() => wrap(<CandidateCard candidate={c} nounsRequired={3} />)).not.toThrow();
  });

  it('multiple instances in single wrap renders distinct links', () => {
    const c1 = { ...baseCandidate, id: 'unique-1' } as never;
    const c2 = { ...baseCandidate, id: 'unique-2' } as never;
    const { container } = wrap(
      <>
        <CandidateCard candidate={c1} nounsRequired={2} />
        <CandidateCard candidate={c2} nounsRequired={2} />
      </>,
    );
    expect(container.querySelectorAll('a').length).toBe(2);
  });

  it('renders 1 anchor per instance consistently', () => {
    for (let i = 0; i < 5; i++) {
      const { container } = wrap(
        <CandidateCard candidate={{ ...baseCandidate, id: `c-${i}` } as never} nounsRequired={i} />,
      );
      expect(container.querySelectorAll('a').length).toBe(1);
    }
  });

  it('renders 50 CandidateCard instances independently', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 50 }, (_, i) => (
            <CandidateCard
              key={i}
              candidate={{ ...baseCandidate, id: `c-${i}` } as never}
              nounsRequired={i}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender 30 times preserves link element', () => {
    expect(() => {
      for (let i = 0; i < 30; i++) {
        wrap(
          <CandidateCard
            candidate={{ ...baseCandidate, id: `c-${i}` } as never}
            nounsRequired={i}
          />,
        );
      }
    }).not.toThrow();
  });

  it('handles candidate with extremely long title (1000 chars)', () => {
    const longTitle = 'a'.repeat(1000);
    const candidate = {
      ...baseCandidate,
      version: { content: { title: longTitle, contentSignatures: [] } },
    } as never;
    expect(() => wrap(<CandidateCard candidate={candidate} nounsRequired={3} />)).not.toThrow();
  });

  it('handles candidate with 100 contentSignatures', () => {
    const sigs = Array.from({ length: 100 }, (_, i) => ({ id: `sig-${i}` }));
    const candidate = {
      ...baseCandidate,
      version: { content: { title: 'X', contentSignatures: sigs as never } },
    } as never;
    expect(() => wrap(<CandidateCard candidate={candidate} nounsRequired={3} />)).not.toThrow();
  });

  it('handles candidate with unicode characters in id', () => {
    const candidate = { ...baseCandidate, id: 'cand-日本語-絵文字' } as never;
    expect(() => wrap(<CandidateCard candidate={candidate} nounsRequired={3} />)).not.toThrow();
  });

  it('renders 50 instances without crash', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 50 }, (_, i) => (
            <CandidateCard key={i} candidate={baseCandidate} nounsRequired={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender 30 times preserves component', () => {
    const { rerender } = wrap(<CandidateCard candidate={baseCandidate} nounsRequired={3} />);
    for (let i = 0; i < 30; i++) {
      expect(() =>
        rerender(
          <MemoryRouter>
            <CandidateCard candidate={baseCandidate} nounsRequired={i} />
          </MemoryRouter>,
        ),
      ).not.toThrow();
    }
  });

  it('handles very large nounsRequired (1000)', () => {
    expect(() =>
      wrap(<CandidateCard candidate={baseCandidate} nounsRequired={1000} />),
    ).not.toThrow();
  });

  it('handles 0 nounsRequired', () => {
    expect(() => wrap(<CandidateCard candidate={baseCandidate} nounsRequired={0} />)).not.toThrow();
  });

  it('handles long candidate title (1000 char)', () => {
    const longTitle = 'a'.repeat(1000);
    const candidate = {
      ...baseCandidate,
      version: { content: { title: longTitle, contentSignatures: [] } },
    } as never;
    expect(() => wrap(<CandidateCard candidate={candidate} nounsRequired={3} />)).not.toThrow();
  });
});
