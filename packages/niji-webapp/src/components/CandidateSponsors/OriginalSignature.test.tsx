import React from 'react';

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/ShortAddress', () => ({
  default: ({ address }: { address: string }) => <span>{address.slice(0, 6)}</span>,
}));

vi.mock('@/utils/etherscan', () => ({
  buildEtherscanAddressLink: (addr: string) => `https://etherscan.io/address/${addr}`,
}));

import OriginalSignature from './OriginalSignature';

const SIGNER = '0x5FbDB2315678afecb367f032d93F642f64180aa3' as const;

describe('OriginalSignature', () => {
  it('shows "Awaiting signature" when isParentProposalUpdatable=true', () => {
    const { container } = render(
      <OriginalSignature voteCount={1} signer={SIGNER} isParentProposalUpdatable={true} />,
    );
    expect(container.textContent).toContain('Awaiting signature');
  });

  it('shows "Did not re-sign" when isParentProposalUpdatable=false', () => {
    const { container } = render(
      <OriginalSignature voteCount={1} signer={SIGNER} isParentProposalUpdatable={false} />,
    );
    expect(container.textContent).toContain('Did not re-sign');
  });

  it('singular vote (voteCount=1)', () => {
    const { container } = render(
      <OriginalSignature voteCount={1} signer={SIGNER} isParentProposalUpdatable={true} />,
    );
    expect(container.textContent).toContain('1 vote');
    expect(container.textContent).not.toContain('1 votes');
  });

  it('plural votes (voteCount=2)', () => {
    const { container } = render(
      <OriginalSignature voteCount={2} signer={SIGNER} isParentProposalUpdatable={true} />,
    );
    expect(container.textContent).toContain('2 votes');
  });

  it('plural votes (voteCount=0)', () => {
    const { container } = render(
      <OriginalSignature voteCount={0} signer={SIGNER} isParentProposalUpdatable={true} />,
    );
    expect(container.textContent).toContain('0 votes');
  });

  it('uses etherscan address link for signer', () => {
    const { container } = render(
      <OriginalSignature voteCount={1} signer={SIGNER} isParentProposalUpdatable={true} />,
    );
    const a = container.querySelector('a');
    expect(a?.getAttribute('href')).toBe(`https://etherscan.io/address/${SIGNER}`);
    expect(a?.getAttribute('target')).toBe('_blank');
    expect(a?.getAttribute('rel')).toBe('noreferrer');
  });
});
