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

  it('renders huge bid (1000 ETH) with Ξ prefix', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <CurrentBid currentBid={parseEther('1000')} auctionEnded={false} />,
    );
    expect(container.textContent).toContain('Ξ 1000.00');
  });

  it('renders 0 wei bid as "Ξ 0.00"', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(<CurrentBid currentBid={0n} auctionEnded={false} />);
    expect(container.textContent).toContain('Ξ 0.00');
  });

  it('renders exactly 1 h2 and 1 h4 element', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(<CurrentBid currentBid={parseEther('1')} auctionEnded={false} />);
    expect(container.querySelectorAll('h2').length).toBe(1);
    expect(container.querySelectorAll('h4').length).toBe(1);
  });

  it('parseEther 0.1 ETH renders as Ξ 0.10', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <CurrentBid currentBid={parseEther('0.1')} auctionEnded={false} />,
    );
    expect(container.textContent).toContain('Ξ 0.10');
  });

  it('auctionEnded=true with BID_N_A still renders "-" placeholder', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(<CurrentBid currentBid={BID_N_A} auctionEnded={true} />);
    expect(container.textContent).toContain('-');
    expect(container.textContent).toContain('Winning bid');
  });

  it('isCool=true + auctionEnded=true uses cool dark text', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(<CurrentBid currentBid={parseEther('1')} auctionEnded={true} />);
    expect(container.querySelector('h2')?.getAttribute('style')).toContain('brand-cool-dark-text');
  });

  it('renders smallest denomination (1 wei) without crash', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(<CurrentBid currentBid={1n} auctionEnded={false} />);
    expect(container.textContent).toContain('Ξ');
  });

  it('renders 0.5 ETH decimal correctly', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <CurrentBid currentBid={parseEther('0.5')} auctionEnded={false} />,
    );
    expect(container.textContent).toContain('Ξ 0.50');
  });

  it('BID_N_A is exported (defined constant)', () => {
    expect(BID_N_A).toBeDefined();
  });

  it('renders both h4 (label) and h2 (amount) regardless of state', () => {
    useAtomValueMock.mockReturnValue(false);
    const { container } = render(<CurrentBid currentBid={BID_N_A} auctionEnded={true} />);
    expect(container.querySelector('h4')).not.toBeNull();
    expect(container.querySelector('h2')).not.toBeNull();
  });

  it('rerender from auctionEnded=false to true switches label', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container, rerender } = render(
      <CurrentBid currentBid={parseEther('1')} auctionEnded={false} />,
    );
    expect(container.textContent).toContain('Current bid');
    rerender(<CurrentBid currentBid={parseEther('1')} auctionEnded={true} />);
    expect(container.textContent).toContain('Winning bid');
  });

  it('rerender from cool to warm switches text style', () => {
    useAtomValueMock.mockReturnValueOnce(true);
    const { container, rerender } = render(
      <CurrentBid currentBid={parseEther('1')} auctionEnded={false} />,
    );
    expect(container.querySelector('h2')?.getAttribute('style')).toContain('cool');
    useAtomValueMock.mockReturnValue(false);
    rerender(<CurrentBid currentBid={parseEther('1')} auctionEnded={false} />);
    expect(container.querySelector('h2')?.getAttribute('style')).toContain('warm');
  });

  it('multiple instances render independently', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <>
        <CurrentBid currentBid={parseEther('1')} auctionEnded={false} />
        <CurrentBid currentBid={parseEther('2')} auctionEnded={true} />
      </>,
    );
    expect(container.textContent).toContain('Current bid');
    expect(container.textContent).toContain('Winning bid');
  });

  it('rerender bid amount updates display', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container, rerender } = render(
      <CurrentBid currentBid={parseEther('1')} auctionEnded={false} />,
    );
    expect(container.textContent).toContain('Ξ 1.00');
    rerender(<CurrentBid currentBid={parseEther('5')} auctionEnded={false} />);
    expect(container.textContent).toContain('Ξ 5.00');
  });

  it('large bid 10000 ETH renders correctly', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <CurrentBid currentBid={parseEther('10000')} auctionEnded={false} />,
    );
    expect(container.textContent).toContain('Ξ 10000.00');
  });

  it('warm + auctionEnded=true uses warm dark text', () => {
    useAtomValueMock.mockReturnValue(false);
    const { container } = render(<CurrentBid currentBid={parseEther('1')} auctionEnded={true} />);
    expect(container.querySelector('h2')?.getAttribute('style')).toContain('brand-warm-dark-text');
  });
});
