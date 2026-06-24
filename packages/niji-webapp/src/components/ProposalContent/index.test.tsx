import React from 'react';

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => <div data-testid="markdown">{children}</div>,
}));

vi.mock('remark-breaks', () => ({ default: () => null }));

vi.mock('./ProposalTransactions', () => ({
  default: ({ details }: { details: unknown[] }) => (
    <ol data-testid="proposal-tx">tx-count-{details.length}</ol>
  ),
}));

vi.mock('@/components/EnsOrLongAddress', () => ({
  default: ({ address }: { address: string }) => <span>{address}</span>,
}));

vi.mock('@/utils/processProposalDescriptionText', () => ({
  processProposalDescriptionText: (d: string, t: string) => `[${t}]${d}`,
}));

vi.mock('@/utils/etherscan', () => ({
  buildEtherscanAddressLink: (a: string) => `https://etherscan.io/address/${a}`,
  buildEtherscanHoldingsLink: (a: string) => `https://etherscan.io/tokenholdings?a=${a}`,
  buildEtherscanTxLink: (h: string) => `https://etherscan.io/tx/${h}`,
}));

vi.mock('@niji/sdk/react', () => ({
  nijiTokenAddress: { 1: '0xTOKEN' },
}));

vi.mock('@/wagmi', () => ({
  defaultChain: { id: 1 },
}));

import ProposalContent, { linkIfAddress, transactionLink, transactionIconLink } from './index';

const details = [{ target: '0xA' }, { target: '0xB' }] as never;

describe('ProposalContent', () => {
  it('renders Description heading + markdown when description provided', () => {
    const { container } = render(
      <ProposalContent description="# body" title="T1" details={details} />,
    );
    expect(container.textContent).toContain('Description');
    expect(container.querySelector('[data-testid="markdown"]')?.textContent).toBe('[T1]# body');
  });

  it('does NOT render markdown when description is empty', () => {
    const { container } = render(<ProposalContent description="" title="T" details={details} />);
    expect(container.querySelector('[data-testid="markdown"]')).toBeNull();
  });

  it('renders ProposalTransactions when details present', () => {
    const { container } = render(<ProposalContent description="d" title="t" details={details} />);
    expect(container.querySelector('[data-testid="proposal-tx"]')?.textContent).toBe('tx-count-2');
  });

  it('does NOT render Proposed Transactions when details is undefined', () => {
    const { container } = render(
      <ProposalContent description="d" title="t" details={undefined as never} />,
    );
    expect(container.textContent).not.toContain('Proposed Transactions');
  });

  it('shows original treasury banner when proposeOnV1=true', () => {
    const { container } = render(
      <ProposalContent description="d" title="t" details={details} proposeOnV1={true} />,
    );
    expect(container.textContent).toContain('original treasury');
  });

  it('does NOT show banner when proposeOnV1=false', () => {
    const { container } = render(<ProposalContent description="d" title="t" details={details} />);
    expect(container.textContent).not.toContain('original treasury');
  });
});

describe('linkIfAddress helper', () => {
  it('returns <a> when content is a valid address', () => {
    const result = linkIfAddress('0x5FbDB2315678afecb367f032d93F642f64180aa3');
    const { container } = render(<>{result}</>);
    expect(container.querySelector('a')?.getAttribute('href')).toContain('etherscan.io/address');
  });

  it('returns <span> when content is not an address', () => {
    const result = linkIfAddress('hello');
    const { container } = render(<>{result}</>);
    expect(container.querySelector('a')).toBeNull();
    expect(container.querySelector('span')?.textContent).toBe('hello');
  });
});

describe('transactionLink helper', () => {
  it('returns <a> with 7-char prefix text', () => {
    const result = transactionLink('0xdeadbeef1234');
    const { container } = render(<>{result}</>);
    expect(container.querySelector('a')?.textContent).toBe('0xdeadb');
    expect(container.querySelector('a')?.getAttribute('href')).toContain('etherscan.io/tx');
  });
});

describe('transactionIconLink helper', () => {
  it('returns <a> with link img', () => {
    const result = transactionIconLink('0xhash');
    const { container } = render(<>{result}</>);
    expect(container.querySelector('a img')).not.toBeNull();
  });

  it('transactionIconLink href uses transactionHash arg', () => {
    const result = transactionIconLink('0xspecific123');
    const { container } = render(<>{result}</>);
    expect(container.querySelector('a')?.getAttribute('href')).toContain('0xspecific123');
  });
});

describe('ProposalContent extra cases', () => {
  it('renders Proposed Transactions section when details non-empty', () => {
    const { container } = render(<ProposalContent description="" title="t" details={details} />);
    expect(container.textContent).toContain('Proposed Transactions');
  });

  it('renders empty details array (0 transactions) gracefully', () => {
    const { container } = render(
      <ProposalContent description="d" title="t" details={[] as never} />,
    );
    expect(container.querySelector('[data-testid="proposal-tx"]')?.textContent).toBe('tx-count-0');
  });

  it('renders 10 details (large details array)', () => {
    const tenDetails = Array.from({ length: 10 }, (_, i) => ({ target: `0x${i}` })) as never;
    const { container } = render(
      <ProposalContent description="d" title="t" details={tenDetails} />,
    );
    expect(container.querySelector('[data-testid="proposal-tx"]')?.textContent).toBe('tx-count-10');
  });

  it('Description heading appears before Proposed Transactions heading', () => {
    const { container } = render(<ProposalContent description="d" title="t" details={details} />);
    const html = container.innerHTML;
    const descIdx = html.indexOf('Description');
    const txIdx = html.indexOf('Proposed Transactions');
    expect(descIdx).toBeLessThan(txIdx);
  });

  it('rerender from with description to empty hides markdown', () => {
    const { container, rerender } = render(
      <ProposalContent description="hello" title="t" details={details} />,
    );
    expect(container.querySelector('[data-testid="markdown"]')).not.toBeNull();
    rerender(<ProposalContent description="" title="t" details={details} />);
    expect(container.querySelector('[data-testid="markdown"]')).toBeNull();
  });

  it('different title prepended via processProposalDescriptionText', () => {
    const { container } = render(
      <ProposalContent description="body" title="MYTITLE" details={details} />,
    );
    expect(container.querySelector('[data-testid="markdown"]')?.textContent).toBe('[MYTITLE]body');
  });

  it('rerender details count updates ProposalTransactions count', () => {
    const { container, rerender } = render(
      <ProposalContent description="d" title="t" details={details} />,
    );
    expect(container.querySelector('[data-testid="proposal-tx"]')?.textContent).toBe('tx-count-2');
    rerender(
      <ProposalContent
        description="d"
        title="t"
        details={[{ target: '0xA' }, { target: '0xB' }, { target: '0xC' }] as never}
      />,
    );
    expect(container.querySelector('[data-testid="proposal-tx"]')?.textContent).toBe('tx-count-3');
  });

  it('proposeOnV1=true with original banner contains "treasury"', () => {
    const { container } = render(
      <ProposalContent description="d" title="t" details={details} proposeOnV1={true} />,
    );
    expect(container.textContent).toContain('treasury');
  });

  it('rerender from proposeOnV1=true to false hides banner', () => {
    const { container, rerender } = render(
      <ProposalContent description="d" title="t" details={details} proposeOnV1={true} />,
    );
    expect(container.textContent).toContain('original treasury');
    rerender(<ProposalContent description="d" title="t" details={details} proposeOnV1={false} />);
    expect(container.textContent).not.toContain('original treasury');
  });

  it('renders unicode description through markdown mock', () => {
    const { container } = render(
      <ProposalContent description="こんにちは" title="t" details={details} />,
    );
    expect(container.querySelector('[data-testid="markdown"]')?.textContent).toBe('[t]こんにちは');
  });

  it('multi-line description renders verbatim', () => {
    const multi = 'line1\nline2\nline3';
    const { container } = render(
      <ProposalContent description={multi} title="t" details={details} />,
    );
    expect(container.querySelector('[data-testid="markdown"]')?.textContent).toBe(`[t]${multi}`);
  });

  it('proposeOnV1=false (default) does not show banner', () => {
    const { container } = render(<ProposalContent description="d" title="t" details={details} />);
    expect(container.textContent).not.toContain('original treasury');
  });

  it('renders proposal-tx exactly 1 time for non-empty details', () => {
    const { container } = render(<ProposalContent description="d" title="t" details={details} />);
    expect(container.querySelectorAll('[data-testid="proposal-tx"]').length).toBe(1);
  });

  it('Title prefix [t] verbatim with simple ASCII description', () => {
    const { container } = render(
      <ProposalContent description="hello" title="t" details={details} />,
    );
    expect(container.querySelector('[data-testid="markdown"]')?.textContent).toBe('[t]hello');
  });

  it('5 instances render 5 markdown wrappers', () => {
    const { container } = render(
      <>
        <ProposalContent description="d1" title="t1" details={details} />
        <ProposalContent description="d2" title="t2" details={details} />
        <ProposalContent description="d3" title="t3" details={details} />
        <ProposalContent description="d4" title="t4" details={details} />
        <ProposalContent description="d5" title="t5" details={details} />
      </>,
    );
    expect(container.querySelectorAll('[data-testid="markdown"]').length).toBe(5);
  });

  it('renders without crash with empty details array', () => {
    expect(() =>
      render(<ProposalContent description="# body" title="T1" details={[] as never} />),
    ).not.toThrow();
  });

  it('rerender from description "A" to "B" updates markdown', () => {
    const { container, rerender } = render(
      <ProposalContent description="A" title="T" details={details} />,
    );
    expect(container.querySelector('[data-testid="markdown"]')?.textContent).toBe('[T]A');
    rerender(<ProposalContent description="B" title="T" details={details} />);
    expect(container.querySelector('[data-testid="markdown"]')?.textContent).toBe('[T]B');
  });

  it('renders 200 char long description', () => {
    const longStr = 'x'.repeat(200);
    const { container } = render(
      <ProposalContent description={longStr} title="T" details={details} />,
    );
    expect(container.querySelector('[data-testid="markdown"]')?.textContent).toContain(longStr);
  });

  it('renders unicode description', () => {
    const { container } = render(
      <ProposalContent description="日本語提案" title="T" details={details} />,
    );
    expect(container.querySelector('[data-testid="markdown"]')?.textContent).toContain(
      '日本語提案',
    );
  });

  it('linkIfAddress + transactionLink + transactionIconLink utils are exported', () => {
    expect(typeof linkIfAddress).toBe('function');
    expect(typeof transactionLink).toBe('function');
    expect(typeof transactionIconLink).toBe('function');
  });
});
