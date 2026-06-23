import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/utils/etherscan', () => ({
  buildEtherscanAddressLink: (addr: string) => `https://etherscan.io/address/${addr}`,
}));

import ProposalTransactions from './index';

const makeTx = (signature: string, calldata: string, decoded?: string) => ({
  address: '0xADDR',
  signature,
  calldata,
  decodedCalldata: decoded,
  value: 0n,
  usdcValue: 0,
});

describe('ProposalTransactions', () => {
  it('renders empty root div (no transaction entries) for empty array', () => {
    const { container } = render(
      <ProposalTransactions proposalTransactions={[]} onRemoveProposalTransaction={() => {}} />,
    );
    expect(container.firstChild).not.toBeNull();
    expect(container.querySelectorAll('button').length).toBe(0);
  });

  it('renders 1 transaction entry per tx', () => {
    const txs = [makeTx('transfer()', '0x'), makeTx('mint()', '0xabc')];
    const { container } = render(
      <ProposalTransactions proposalTransactions={txs} onRemoveProposalTransaction={() => {}} />,
    );
    expect(container.querySelectorAll('button').length).toBe(2);
  });

  it('shows signature in label', () => {
    const txs = [makeTx('transfer()', '0x')];
    const { container } = render(
      <ProposalTransactions proposalTransactions={txs} onRemoveProposalTransaction={() => {}} />,
    );
    expect(container.textContent).toContain('transfer()');
    expect(container.textContent).toContain('Transaction #1');
  });

  it('falls back to "transfer()" when signature empty', () => {
    const txs = [makeTx('', '0x')];
    const { container } = render(
      <ProposalTransactions proposalTransactions={txs} onRemoveProposalTransaction={() => {}} />,
    );
    expect(container.textContent).toContain('transfer()');
  });

  it('fires onRemoveProposalTransaction with index on button click', () => {
    const onRemove = vi.fn();
    const txs = [makeTx('foo()', '0x'), makeTx('bar()', '0x'), makeTx('baz()', '0x')];
    const { container } = render(
      <ProposalTransactions proposalTransactions={txs} onRemoveProposalTransaction={onRemove} />,
    );
    fireEvent.click(container.querySelectorAll('button')[1]);
    expect(onRemove).toHaveBeenCalledWith(1);
  });

  it('renders x-icon remove img for each tx', () => {
    const txs = [makeTx('foo()', '0x')];
    const { container } = render(
      <ProposalTransactions proposalTransactions={txs} onRemoveProposalTransaction={() => {}} />,
    );
    expect(container.querySelector('img[alt="Remove Transaction"]')).not.toBeNull();
  });

  it('applies custom className to root', () => {
    const { container } = render(
      <ProposalTransactions
        proposalTransactions={[]}
        onRemoveProposalTransaction={() => {}}
        className="my-tx-list"
      />,
    );
    expect(container.firstChild?.className).toContain('my-tx-list');
  });
});
