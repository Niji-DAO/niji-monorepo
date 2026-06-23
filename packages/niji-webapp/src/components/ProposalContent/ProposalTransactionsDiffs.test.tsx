import React from 'react';

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-diff-viewer-continued', () => ({
  default: ({ oldValue, newValue }: { oldValue: string; newValue: string }) => (
    <div data-testid="diff">
      <span data-testid="old">{oldValue}</span>
      <span data-testid="new">{newValue}</span>
    </div>
  ),
}));

vi.mock('./ProposalTransaction', () => ({
  default: ({ transaction }: { transaction: { target: string } }) => (
    <span data-testid="tx">{transaction.target}</span>
  ),
}));

import ProposalTransactionsDiffs from './ProposalTransactionsDiffs';

const makeTx = (target: string, funcSig = 'transfer', value = 0n, callData = '0x') => ({
  target,
  functionSig: funcSig,
  value,
  callData,
});

describe('ProposalTransactionsDiffs', () => {
  it('renders empty when both arrays empty', () => {
    const { container } = render(
      <ProposalTransactionsDiffs
        oldTransactions={[]}
        newTransactions={[]}
        activeVersionNumber={1}
      />,
    );
    expect(container.querySelectorAll('[data-testid="diff"]').length).toBe(0);
  });

  it('renders diff entry for each tx in longer array', () => {
    const txs = [makeTx('0xA') as never, makeTx('0xB') as never];
    const { container } = render(
      <ProposalTransactionsDiffs
        oldTransactions={[txs[0]]}
        newTransactions={txs}
        activeVersionNumber={2}
      />,
    );
    // 2 entries (longerArray=newTransactions)
    expect(
      container.querySelectorAll('[data-testid="diff"]').length +
        container.querySelectorAll('[data-testid="tx"]').length,
    ).toBeGreaterThanOrEqual(2);
  });

  it('handles old longer than new', () => {
    const old = [makeTx('0xA') as never, makeTx('0xB') as never, makeTx('0xC') as never];
    const { container } = render(
      <ProposalTransactionsDiffs
        oldTransactions={old}
        newTransactions={[makeTx('0xA') as never]}
        activeVersionNumber={1}
      />,
    );
    expect(
      container.querySelectorAll('[data-testid="diff"]').length +
        container.querySelectorAll('[data-testid="tx"]').length,
    ).toBeGreaterThanOrEqual(3);
  });

  it('handles equal length arrays', () => {
    const old = [makeTx('0xA') as never];
    const ne = [makeTx('0xB') as never];
    const { container } = render(
      <ProposalTransactionsDiffs
        oldTransactions={old}
        newTransactions={ne}
        activeVersionNumber={1}
      />,
    );
    expect(
      container.querySelectorAll('[data-testid="diff"]').length +
        container.querySelectorAll('[data-testid="tx"]').length,
    ).toBeGreaterThanOrEqual(1);
  });
});
