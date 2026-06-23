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
});
