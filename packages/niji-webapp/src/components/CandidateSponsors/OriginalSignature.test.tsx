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

  it('handles 1000 voteCount with plural', () => {
    const { container } = render(
      <OriginalSignature voteCount={1000} signer={SIGNER} isParentProposalUpdatable={true} />,
    );
    expect(container.textContent).toContain('1000 votes');
  });

  it('renders for different signer addresses', () => {
    const OTHER = '0x0000000000000000000000000000000000000001' as const;
    const { container } = render(
      <OriginalSignature voteCount={1} signer={OTHER} isParentProposalUpdatable={true} />,
    );
    expect(container.querySelector('a')?.getAttribute('href')).toBe(
      `https://etherscan.io/address/${OTHER}`,
    );
  });

  it('renders exactly 1 anchor element', () => {
    const { container } = render(
      <OriginalSignature voteCount={1} signer={SIGNER} isParentProposalUpdatable={true} />,
    );
    expect(container.querySelectorAll('a').length).toBe(1);
  });

  it('isParentProposalUpdatable=false → link still present', () => {
    const { container } = render(
      <OriginalSignature voteCount={1} signer={SIGNER} isParentProposalUpdatable={false} />,
    );
    expect(container.querySelector('a')).not.toBeNull();
  });

  it('renders ShortAddress mocked (first 6 chars of signer)', () => {
    const { container } = render(
      <OriginalSignature voteCount={1} signer={SIGNER} isParentProposalUpdatable={true} />,
    );
    // mock は signer.slice(0, 6)
    expect(container.textContent).toContain('0x5FbD');
  });

  it('isParentProposalUpdatable=true does NOT show "Did not re-sign"', () => {
    const { container } = render(
      <OriginalSignature voteCount={1} signer={SIGNER} isParentProposalUpdatable={true} />,
    );
    expect(container.textContent).not.toContain('Did not re-sign');
  });

  it('isParentProposalUpdatable=false does NOT show "Awaiting signature"', () => {
    const { container } = render(
      <OriginalSignature voteCount={1} signer={SIGNER} isParentProposalUpdatable={false} />,
    );
    expect(container.textContent).not.toContain('Awaiting signature');
  });

  it('voteCount=5 (medium plural) shows "5 votes"', () => {
    const { container } = render(
      <OriginalSignature voteCount={5} signer={SIGNER} isParentProposalUpdatable={true} />,
    );
    expect(container.textContent).toContain('5 votes');
  });

  it('renders external link with target=_blank', () => {
    const { container } = render(
      <OriginalSignature voteCount={1} signer={SIGNER} isParentProposalUpdatable={false} />,
    );
    expect(container.querySelector('a')?.getAttribute('target')).toBe('_blank');
  });

  it('renders rel=noreferrer regardless of updatable state', () => {
    const { container } = render(
      <OriginalSignature voteCount={1} signer={SIGNER} isParentProposalUpdatable={false} />,
    );
    expect(container.querySelector('a')?.getAttribute('rel')).toBe('noreferrer');
  });

  it('mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(
        <OriginalSignature voteCount={1} signer={SIGNER} isParentProposalUpdatable={true} />,
      );
      unmount();
    }
  });

  it('renders 500 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <OriginalSignature
              key={i}
              voteCount={i}
              signer={SIGNER}
              isParentProposalUpdatable={true}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 100 different voteCount values', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <OriginalSignature voteCount={i} signer={SIGNER} isParentProposalUpdatable={true} />,
      );
      unmount();
    }
  });

  it('handles 100 different signer addresses', () => {
    for (let i = 0; i < 100; i++) {
      const addr = ('0x' + i.toString(16).padStart(40, '0')) as `0x${string}`;
      const { unmount } = render(
        <OriginalSignature voteCount={1} signer={addr} isParentProposalUpdatable={true} />,
      );
      unmount();
    }
  });

  it('handles 30 different isParentProposalUpdatable combinations', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <OriginalSignature voteCount={1} signer={SIGNER} isParentProposalUpdatable={i % 2 === 0} />,
      );
      unmount();
    }
  });
});
