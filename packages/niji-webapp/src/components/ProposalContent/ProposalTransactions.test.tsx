import React from 'react';

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/ShortAddress', () => ({
  default: ({ address }: { address: string }) => <span>{address}</span>,
}));

vi.mock('@niji/sdk/react', () => ({
  nijiPayerAddress: { 1: '0xPAYER' },
  nijiTokenBuyerAddress: { 1: '0xTOKENBUYER' },
}));

vi.mock('@/wagmi', () => ({
  defaultChain: { id: 1 },
}));

vi.mock('.', () => ({
  linkIfAddress: (content: string) => <span data-testid="link">{content}</span>,
}));

import ProposalTransactions from './ProposalTransactions';

const simpleTx = {
  target: '0xTARGET1',
  functionSig: '',
  callData: 'raw-data',
  value: 0n,
} as never;

const sigTx = {
  target: '0xTARGET2',
  functionSig: 'transfer',
  callData: '0xRECIPIENT,1000',
  value: 50n,
} as never;

const tokenBuyerTx = {
  target: '0xTOKENBUYER',
  functionSig: 'transfer',
  callData: '0xRECIPIENT,500',
  value: 10n,
} as never;

describe('ProposalTransactions', () => {
  it('renders ol with li per detail', () => {
    const { container } = render(<ProposalTransactions details={[simpleTx, sigTx]} />);
    expect(container.querySelectorAll('ol li').length).toBe(2);
  });

  it('shows raw callData when functionSig empty', () => {
    const { container } = render(<ProposalTransactions details={[simpleTx]} />);
    expect(container.textContent).toContain('raw-data');
  });

  it('renders callData split when functionSig non-empty', () => {
    const { container } = render(<ProposalTransactions details={[sigTx]} />);
    expect(container.textContent).toContain('transfer');
    const links = container.querySelectorAll('[data-testid="link"]');
    // target + 2 callData parts = 3
    expect(links.length).toBe(3);
  });

  it('skips value when 0n', () => {
    const { container } = render(<ProposalTransactions details={[simpleTx]} />);
    expect(container.textContent).not.toContain('0n');
  });

  it('renders TokenBuyer info banner when target is TokenBuyer + transfer', () => {
    const { container } = render(<ProposalTransactions details={[tokenBuyerTx]} />);
    expect(container.textContent).toContain('automatically added to refill the TokenBuyer');
  });

  it('does NOT show TokenBuyer banner for non-TokenBuyer target', () => {
    const { container } = render(<ProposalTransactions details={[sigTx]} />);
    expect(container.textContent).not.toContain('automatically added');
  });

  it('renders empty ol when details is empty', () => {
    const { container } = render(<ProposalTransactions details={[]} />);
    expect(container.querySelectorAll('ol li').length).toBe(0);
  });
});
