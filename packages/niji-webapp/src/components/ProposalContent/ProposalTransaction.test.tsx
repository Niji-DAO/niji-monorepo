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
  linkIfAddress: (content: string) => <span data-testid="link-if-addr">{content}</span>,
}));

import ProposalTransaction from './ProposalTransaction';

const simpleTx = {
  target: '0xTARGET',
  functionSig: '',
  callData: 'plain-data',
  value: 0n,
} as never;

const sigTx = {
  target: '0xTARGET',
  functionSig: 'transfer(address,uint256)',
  callData: '0xRECIPIENT,1000',
  value: 100n,
} as never;

describe('ProposalTransaction', () => {
  it('renders target via linkIfAddress', () => {
    const { container } = render(<ProposalTransaction transaction={simpleTx} />);
    const links = container.querySelectorAll('[data-testid="link-if-addr"]');
    expect(links[0]?.textContent).toBe('0xTARGET');
  });

  it('renders functionSig when present', () => {
    const { container } = render(<ProposalTransaction transaction={sigTx} />);
    expect(container.textContent).toContain('transfer(address,uint256)');
  });

  it('renders raw callData when functionSig is empty', () => {
    const { container } = render(<ProposalTransaction transaction={simpleTx} />);
    expect(container.textContent).toContain('plain-data');
  });

  it('renders callData split as multiple linkIfAddress entries', () => {
    const { container } = render(<ProposalTransaction transaction={sigTx} />);
    const links = container.querySelectorAll('[data-testid="link-if-addr"]');
    // target + 2 callData parts = 3
    expect(links.length).toBe(3);
  });

  it('renders value when present (non-zero)', () => {
    const { container } = render(<ProposalTransaction transaction={sigTx} />);
    expect(container.textContent).toContain('100');
  });

  it('skips value when 0n (falsy)', () => {
    const { container } = render(<ProposalTransaction transaction={simpleTx} />);
    expect(container.textContent).not.toContain('0n');
  });

  it('uses <li> as root element', () => {
    const { container } = render(<ProposalTransaction transaction={simpleTx} />);
    expect(container.querySelector('li')).not.toBeNull();
  });
});
