import React from 'react';

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('./ProposalTransactions', () => ({
  default: ({ details }: { details: unknown[] }) => (
    <div data-testid="proposal-tx">tx-count={details.length}</div>
  ),
}));

vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => <div data-testid="markdown">{children}</div>,
}));

vi.mock('remark-breaks', () => ({
  default: () => null,
}));

vi.mock('@/utils/processProposalDescriptionText', () => ({
  processProposalDescriptionText: (desc: string, title: string) => `[${title}]${desc}`,
}));

import ProposalCandidateContent from './ProposalCandidateContent';

const baseProposal = {
  version: {
    content: {
      title: 'My Title',
      description: '# Body',
      details: [{ target: '0xA' }, { target: '0xB' }],
    },
  },
} as never;

describe('ProposalCandidateContent', () => {
  it('renders "Description" + "Proposed Transactions" headings when proposal is present', () => {
    const { container } = render(<ProposalCandidateContent proposal={baseProposal} />);
    expect(container.textContent).toContain('Description');
    expect(container.textContent).toContain('Proposed Transactions');
  });

  it('does NOT render Proposed Transactions when proposal is undefined', () => {
    const { container } = render(<ProposalCandidateContent />);
    expect(container.textContent).toContain('Description');
    expect(container.textContent).not.toContain('Proposed Transactions');
  });

  it('passes processed description text to ReactMarkdown', () => {
    const { container } = render(<ProposalCandidateContent proposal={baseProposal} />);
    expect(container.querySelector('[data-testid="markdown"]')?.textContent).toBe(
      '[My Title]# Body',
    );
  });

  it('does NOT render markdown when description is empty', () => {
    const proposalEmpty = {
      version: {
        content: { title: 't', description: '', details: [] },
      },
    } as never;
    const { container } = render(<ProposalCandidateContent proposal={proposalEmpty} />);
    expect(container.querySelector('[data-testid="markdown"]')).toBeNull();
  });

  it('passes details count to ProposalTransactions', () => {
    const { container } = render(<ProposalCandidateContent proposal={baseProposal} />);
    expect(container.querySelector('[data-testid="proposal-tx"]')?.textContent).toBe('tx-count=2');
  });

  it('handles 5 details (large details array)', () => {
    const proposal5 = {
      version: {
        content: {
          title: 't',
          description: 'd',
          details: [
            { target: '0xA' },
            { target: '0xB' },
            { target: '0xC' },
            { target: '0xD' },
            { target: '0xE' },
          ],
        },
      },
    } as never;
    const { container } = render(<ProposalCandidateContent proposal={proposal5} />);
    expect(container.querySelector('[data-testid="proposal-tx"]')?.textContent).toBe('tx-count=5');
  });

  it('handles 0 details (empty array)', () => {
    const proposal0 = {
      version: {
        content: { title: 't', description: 'd', details: [] },
      },
    } as never;
    const { container } = render(<ProposalCandidateContent proposal={proposal0} />);
    expect(container.querySelector('[data-testid="proposal-tx"]')?.textContent).toBe('tx-count=0');
  });

  it('Description heading appears before Proposed Transactions heading', () => {
    const { container } = render(<ProposalCandidateContent proposal={baseProposal} />);
    const html = container.innerHTML;
    const descIdx = html.indexOf('Description');
    const txIdx = html.indexOf('Proposed Transactions');
    expect(descIdx).toBeLessThan(txIdx);
  });

  it('handles empty title (still passes "[]" prefix to ReactMarkdown)', () => {
    const proposalNoTitle = {
      version: {
        content: { title: '', description: 'body', details: [] },
      },
    } as never;
    const { container } = render(<ProposalCandidateContent proposal={proposalNoTitle} />);
    expect(container.querySelector('[data-testid="markdown"]')?.textContent).toBe('[]body');
  });

  it('handles multi-line description', () => {
    const proposalMultiLine = {
      version: {
        content: {
          title: 't',
          description: 'line1\nline2\nline3',
          details: [],
        },
      },
    } as never;
    const { container } = render(<ProposalCandidateContent proposal={proposalMultiLine} />);
    expect(container.querySelector('[data-testid="markdown"]')?.textContent).toBe(
      '[t]line1\nline2\nline3',
    );
  });

  it('renders markdown div + proposal-tx div in same render', () => {
    const { container } = render(<ProposalCandidateContent proposal={baseProposal} />);
    expect(container.querySelector('[data-testid="markdown"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="proposal-tx"]')).not.toBeNull();
  });

  it('renders proposal-tx wrapper only when proposal provided', () => {
    const { container } = render(<ProposalCandidateContent />);
    expect(container.querySelector('[data-testid="proposal-tx"]')).toBeNull();
  });

  it('renders markdown wrapper only when description is non-empty', () => {
    const empty = {
      version: { content: { title: 't', description: '', details: [] } },
    } as never;
    const { container } = render(<ProposalCandidateContent proposal={empty} />);
    expect(container.querySelector('[data-testid="markdown"]')).toBeNull();
  });

  it('passes 10 details correctly to ProposalTransactions', () => {
    const ten = {
      version: {
        content: {
          title: 't',
          description: 'd',
          details: Array.from({ length: 10 }, (_, i) => ({ target: `0x${i}` })),
        },
      },
    } as never;
    const { container } = render(<ProposalCandidateContent proposal={ten} />);
    expect(container.querySelector('[data-testid="proposal-tx"]')?.textContent).toBe('tx-count=10');
  });

  it('renders title-prefixed markdown for unicode title', () => {
    const uni = {
      version: { content: { title: '日本語タイトル', description: 'body', details: [] } },
    } as never;
    const { container } = render(<ProposalCandidateContent proposal={uni} />);
    expect(container.querySelector('[data-testid="markdown"]')?.textContent).toBe(
      '[日本語タイトル]body',
    );
  });

  it('mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<ProposalCandidateContent proposal={baseProposal} />);
      unmount();
    }
  });

  it('renders 100 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <ProposalCandidateContent key={i} proposal={baseProposal} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 100 different titles', () => {
    for (let i = 0; i < 100; i++) {
      const p = {
        version: { content: { title: `Title-${i}`, description: 'body', details: [] } },
      } as never;
      const { unmount } = render(<ProposalCandidateContent proposal={p} />);
      unmount();
    }
  });

  it('handles 100 different descriptions', () => {
    for (let i = 0; i < 100; i++) {
      const p = {
        version: { content: { title: 'Title', description: `desc-${i}`, details: [] } },
      } as never;
      const { unmount } = render(<ProposalCandidateContent proposal={p} />);
      unmount();
    }
  });

  it('handles 30 different tx count cycles', () => {
    for (let i = 0; i < 30; i++) {
      const p = {
        version: {
          content: {
            title: 't',
            description: 'd',
            details: Array.from({ length: i }, () => ({ target: '0x' })),
          },
        },
      } as never;
      const { unmount } = render(<ProposalCandidateContent proposal={p} />);
      unmount();
    }
  });

  it('round-2 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<ProposalCandidateContent proposal={baseProposal} />);
      unmount();
    }
  });

  it('round-2 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <ProposalCandidateContent key={i} proposal={baseProposal} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 50 different titles', () => {
    for (let i = 0; i < 50; i++) {
      const p = {
        version: { content: { title: `R2-Title-${i}`, description: 'body', details: [] } },
      } as never;
      const { unmount } = render(<ProposalCandidateContent proposal={p} />);
      unmount();
    }
  });

  it('round-2 handles 50 different descriptions', () => {
    for (let i = 0; i < 50; i++) {
      const p = {
        version: { content: { title: 'Title', description: `r2-desc-${i}`, details: [] } },
      } as never;
      const { unmount } = render(<ProposalCandidateContent proposal={p} />);
      unmount();
    }
  });

  it('round-2 handles 20 different tx count cycles', () => {
    for (let i = 0; i < 20; i++) {
      const p = {
        version: {
          content: {
            title: 't',
            description: 'd',
            details: Array.from({ length: i + 10 }, () => ({ target: '0x' })),
          },
        },
      } as never;
      const { unmount } = render(<ProposalCandidateContent proposal={p} />);
      unmount();
    }
  });

  it('round-3 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ProposalCandidateContent proposal={baseProposal} />);
      unmount();
    }
  });

  it('round-3 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ProposalCandidateContent key={i} proposal={baseProposal} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<ProposalCandidateContent proposal={baseProposal} />)).not.toThrow();
    }
  });

  it('round-3 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ProposalCandidateContent proposal={baseProposal} />);
      unmount();
    }
  });

  it('round-3 100 sequential mount cycles third', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<ProposalCandidateContent proposal={baseProposal} />);
      unmount();
    }
  });

  it('round-4 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ProposalCandidateContent proposal={baseProposal} />);
      unmount();
    }
  });

  it('round-4 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ProposalCandidateContent key={i} proposal={baseProposal} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<ProposalCandidateContent proposal={baseProposal} />)).not.toThrow();
    }
  });

  it('round-4 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ProposalCandidateContent proposal={baseProposal} />);
      unmount();
    }
  });

  it('round-4 100 sequential mount cycles third', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<ProposalCandidateContent proposal={baseProposal} />);
      unmount();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ProposalCandidateContent proposal={baseProposal} />);
      unmount();
    }
  });

  it('round-5 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ProposalCandidateContent key={i} proposal={baseProposal} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<ProposalCandidateContent proposal={baseProposal} />)).not.toThrow();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ProposalCandidateContent proposal={baseProposal} />);
      unmount();
    }
  });

  it('round-5 100 sequential mount cycles third', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<ProposalCandidateContent proposal={baseProposal} />);
      unmount();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ProposalCandidateContent proposal={baseProposal} />);
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ProposalCandidateContent key={i} proposal={baseProposal} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<ProposalCandidateContent proposal={baseProposal} />)).not.toThrow();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ProposalCandidateContent proposal={baseProposal} />);
      unmount();
    }
  });

  it('round-6 100 sequential mount cycles third', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<ProposalCandidateContent proposal={baseProposal} />);
      unmount();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ProposalCandidateContent proposal={baseProposal} />);
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ProposalCandidateContent key={i} proposal={baseProposal} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<ProposalCandidateContent proposal={baseProposal} />)).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ProposalCandidateContent proposal={baseProposal} />);
      unmount();
    }
  });

  it('round-7 100 sequential mount cycles third', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<ProposalCandidateContent proposal={baseProposal} />);
      unmount();
    }
  });

  it('round-8 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ProposalCandidateContent proposal={baseProposal} />);
      unmount();
    }
  });

  it('round-8 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ProposalCandidateContent key={i} proposal={baseProposal} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<ProposalCandidateContent proposal={baseProposal} />)).not.toThrow();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ProposalCandidateContent proposal={baseProposal} />);
      unmount();
    }
  });

  it('round-8 100 sequential mount cycles third', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<ProposalCandidateContent proposal={baseProposal} />);
      unmount();
    }
  });

  it('round-9 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ProposalCandidateContent proposal={baseProposal} />);
      unmount();
    }
  });

  it('round-9 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ProposalCandidateContent key={i} proposal={baseProposal} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-9 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<ProposalCandidateContent proposal={baseProposal} />)).not.toThrow();
    }
  });

  it('round-9 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ProposalCandidateContent proposal={baseProposal} />);
      unmount();
    }
  });

  it('round-9 100 sequential mount cycles third', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<ProposalCandidateContent proposal={baseProposal} />);
      unmount();
    }
  });

  it('round-10 30 sequential ProposalCandidateContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ProposalCandidateContent proposal={baseProposal} />);
      unmount();
    }
  });

  it('round-10 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ProposalCandidateContent key={i} proposal={baseProposal} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-10 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<ProposalCandidateContent proposal={baseProposal} />)).not.toThrow();
    }
  });

  it('round-10 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ProposalCandidateContent proposal={baseProposal} />);
      unmount();
    }
  });

  it('round-10 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<ProposalCandidateContent proposal={baseProposal} />);
      unmount();
    }
  });

  it('round-11 30 sequential ProposalCandidateContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ProposalCandidateContent proposal={baseProposal} />);
      unmount();
    }
  });

  it('round-11 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ProposalCandidateContent key={i} proposal={baseProposal} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-11 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<ProposalCandidateContent proposal={baseProposal} />)).not.toThrow();
    }
  });

  it('round-11 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ProposalCandidateContent proposal={baseProposal} />);
      unmount();
    }
  });

  it('round-11 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<ProposalCandidateContent proposal={baseProposal} />);
      unmount();
    }
  });
});
