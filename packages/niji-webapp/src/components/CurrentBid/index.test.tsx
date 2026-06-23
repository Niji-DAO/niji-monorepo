import React from 'react';

import { render } from '@testing-library/react';
import { parseEther } from 'viem';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const useAtomValueMock = vi.fn();
vi.mock('jotai/react', () => ({
  useAtomValue: () => useAtomValueMock(),
}));

import CurrentBid, { BID_N_A } from './index';

describe('CurrentBid', () => {
  it('renders "Current bid" when auctionEnded=false', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(<CurrentBid currentBid={parseEther('1')} auctionEnded={false} />);
    expect(container.textContent).toContain('Current bid');
  });

  it('renders "Winning bid" when auctionEnded=true', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(<CurrentBid currentBid={parseEther('1')} auctionEnded={true} />);
    expect(container.textContent).toContain('Winning bid');
  });

  it('renders truncated amount when currentBid is bigint', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <CurrentBid currentBid={parseEther('2.5')} auctionEnded={false} />,
    );
    expect(container.textContent).toContain('Ξ 2.50');
  });

  it('renders "-" placeholder when currentBid === BID_N_A', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(<CurrentBid currentBid={BID_N_A} auctionEnded={false} />);
    expect(container.textContent).toContain('-');
    expect(container.textContent).not.toContain('Ξ');
  });

  it('uses cool color text when isCool=true', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(<CurrentBid currentBid={parseEther('1')} auctionEnded={false} />);
    expect(container.querySelector('h4')?.getAttribute('style')).toContain('brand-cool-light-text');
    expect(container.querySelector('h2')?.getAttribute('style')).toContain('brand-cool-dark-text');
  });

  it('uses warm color text when isCool=false', () => {
    useAtomValueMock.mockReturnValue(false);
    const { container } = render(<CurrentBid currentBid={parseEther('1')} auctionEnded={false} />);
    expect(container.querySelector('h4')?.getAttribute('style')).toContain('brand-warm-light-text');
    expect(container.querySelector('h2')?.getAttribute('style')).toContain('brand-warm-dark-text');
  });
});
