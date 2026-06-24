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

  it('accepts activeVersionNumber 0 without crashing', () => {
    expect(() =>
      render(
        <ProposalTransactionsDiffs
          oldTransactions={[]}
          newTransactions={[]}
          activeVersionNumber={0}
        />,
      ),
    ).not.toThrow();
  });

  it('renders many transactions in array (10 entries)', () => {
    const old = Array.from({ length: 10 }, (_, i) => makeTx(`0x${i}`) as never);
    const ne = Array.from({ length: 10 }, (_, i) => makeTx(`0x${i}`) as never);
    const { container } = render(
      <ProposalTransactionsDiffs
        oldTransactions={old}
        newTransactions={ne}
        activeVersionNumber={3}
      />,
    );
    expect(
      container.querySelectorAll('[data-testid="diff"]').length +
        container.querySelectorAll('[data-testid="tx"]').length,
    ).toBeGreaterThanOrEqual(10);
  });

  it('handles empty old + non-empty new (creation scenario)', () => {
    const ne = [makeTx('0xA') as never, makeTx('0xB') as never, makeTx('0xC') as never];
    const { container } = render(
      <ProposalTransactionsDiffs
        oldTransactions={[]}
        newTransactions={ne}
        activeVersionNumber={1}
      />,
    );
    expect(
      container.querySelectorAll('[data-testid="diff"]').length +
        container.querySelectorAll('[data-testid="tx"]').length,
    ).toBeGreaterThanOrEqual(3);
  });

  it('handles non-empty old + empty new (deletion scenario)', () => {
    const old = [makeTx('0xA') as never, makeTx('0xB') as never];
    const { container } = render(
      <ProposalTransactionsDiffs
        oldTransactions={old}
        newTransactions={[]}
        activeVersionNumber={1}
      />,
    );
    expect(
      container.querySelectorAll('[data-testid="diff"]').length +
        container.querySelectorAll('[data-testid="tx"]').length,
    ).toBeGreaterThanOrEqual(2);
  });

  it('renders different funcSig transactions without crashing', () => {
    const old = [makeTx('0xA', 'transfer') as never];
    const ne = [makeTx('0xA', 'approve(address,uint256)') as never];
    expect(() =>
      render(
        <ProposalTransactionsDiffs
          oldTransactions={old}
          newTransactions={ne}
          activeVersionNumber={1}
        />,
      ),
    ).not.toThrow();
  });

  it('renders without crash for bigint values', () => {
    const old = [makeTx('0xA', 'transfer', 1000000n) as never];
    const ne = [makeTx('0xA', 'transfer', 2000000n) as never];
    expect(() =>
      render(
        <ProposalTransactionsDiffs
          oldTransactions={old}
          newTransactions={ne}
          activeVersionNumber={2}
        />,
      ),
    ).not.toThrow();
  });

  it('handles activeVersionNumber large (999)', () => {
    expect(() =>
      render(
        <ProposalTransactionsDiffs
          oldTransactions={[makeTx('0xA') as never]}
          newTransactions={[makeTx('0xB') as never]}
          activeVersionNumber={999}
        />,
      ),
    ).not.toThrow();
  });

  it('handles non-empty callData differences without crash', () => {
    const old = [makeTx('0xA', 'transfer', 0n, '0x00') as never];
    const ne = [makeTx('0xA', 'transfer', 0n, '0xDEADBEEF') as never];
    expect(() =>
      render(
        <ProposalTransactionsDiffs
          oldTransactions={old}
          newTransactions={ne}
          activeVersionNumber={1}
        />,
      ),
    ).not.toThrow();
  });

  it('identical arrays produce same length output (1 entry)', () => {
    const same = [makeTx('0xA') as never];
    const { container } = render(
      <ProposalTransactionsDiffs
        oldTransactions={same}
        newTransactions={same}
        activeVersionNumber={1}
      />,
    );
    const totalElements =
      container.querySelectorAll('[data-testid="diff"]').length +
      container.querySelectorAll('[data-testid="tx"]').length;
    expect(totalElements).toBeGreaterThanOrEqual(1);
  });

  it('handles old > new where excess old transactions become diff entries', () => {
    const old = [
      makeTx('0xA') as never,
      makeTx('0xB') as never,
      makeTx('0xC') as never,
      makeTx('0xD') as never,
    ];
    const ne = [makeTx('0xA') as never];
    const { container } = render(
      <ProposalTransactionsDiffs
        oldTransactions={old}
        newTransactions={ne}
        activeVersionNumber={1}
      />,
    );
    const totalElements =
      container.querySelectorAll('[data-testid="diff"]').length +
      container.querySelectorAll('[data-testid="tx"]').length;
    // 4 (longer = old)
    expect(totalElements).toBeGreaterThanOrEqual(4);
  });
});
