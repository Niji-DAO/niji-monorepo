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

  it('rerender from BID_N_A to numeric replaces "-" with amount', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container, rerender } = render(
      <CurrentBid currentBid={BID_N_A} auctionEnded={false} />,
    );
    expect(container.textContent).toContain('-');
    rerender(<CurrentBid currentBid={parseEther('5')} auctionEnded={false} />);
    expect(container.textContent).toContain('Ξ 5.00');
  });

  it('100000 ETH renders without crash', () => {
    useAtomValueMock.mockReturnValue(true);
    expect(() =>
      render(<CurrentBid currentBid={parseEther('100000')} auctionEnded={false} />),
    ).not.toThrow();
  });

  it('h4 element renders before h2 in DOM order', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(<CurrentBid currentBid={parseEther('1')} auctionEnded={false} />);
    const html = container.innerHTML;
    expect(html.indexOf('h4')).toBeLessThan(html.indexOf('h2'));
  });

  it('5 instances render 5 h2 elements', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <>
        <CurrentBid currentBid={parseEther('1')} auctionEnded={false} />
        <CurrentBid currentBid={parseEther('2')} auctionEnded={false} />
        <CurrentBid currentBid={parseEther('3')} auctionEnded={false} />
        <CurrentBid currentBid={parseEther('4')} auctionEnded={false} />
        <CurrentBid currentBid={parseEther('5')} auctionEnded={false} />
      </>,
    );
    expect(container.querySelectorAll('h2').length).toBe(5);
  });

  it('BID_N_A constant value is truthy / non-undefined', () => {
    expect(BID_N_A).toBeDefined();
    expect(BID_N_A).not.toBeNull();
  });

  it('renders for 0n bid amount', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(<CurrentBid currentBid={0n} auctionEnded={false} />);
    expect(container.textContent).toContain('Current bid');
  });

  it('renders 5 instances independently', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <>
        {Array.from({ length: 5 }, (_, i) => (
          <CurrentBid key={i} currentBid={parseEther(`${i + 1}`)} auctionEnded={false} />
        ))}
      </>,
    );
    expect(container.children.length).toBe(5);
  });

  it('rerender from running to ended updates label', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container, rerender } = render(
      <CurrentBid currentBid={parseEther('1')} auctionEnded={false} />,
    );
    expect(container.textContent).toContain('Current bid');
    rerender(<CurrentBid currentBid={parseEther('1')} auctionEnded={true} />);
    expect(container.textContent).toContain('Winning bid');
  });

  it('renders for huge bid (1M ETH)', () => {
    useAtomValueMock.mockReturnValue(true);
    expect(() =>
      render(<CurrentBid currentBid={parseEther('1000000')} auctionEnded={false} />),
    ).not.toThrow();
  });

  it('useAtomValueMock=false branch renders without crash', () => {
    useAtomValueMock.mockReturnValue(false);
    expect(() =>
      render(<CurrentBid currentBid={parseEther('1')} auctionEnded={false} />),
    ).not.toThrow();
  });

  it('renders 20 instances independently', () => {
    useAtomValueMock.mockReturnValue(true);
    expect(() =>
      render(
        <>
          {Array.from({ length: 20 }, (_, i) => (
            <CurrentBid key={i} currentBid={parseEther(`${i + 1}`)} auctionEnded={false} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender auctionEnded toggle preserves component', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container, rerender } = render(
      <CurrentBid currentBid={parseEther('1')} auctionEnded={false} />,
    );
    expect(container.textContent).toContain('bid');
    rerender(<CurrentBid currentBid={parseEther('1')} auctionEnded={true} />);
    expect(container.textContent).toContain('bid');
  });

  it('renders 0.0001 ETH fractional', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <CurrentBid currentBid={parseEther('0.0001')} auctionEnded={false} />,
    );
    expect(container.textContent).toContain('bid');
  });

  it('renders 0n currentBid 5 times without crash', () => {
    useAtomValueMock.mockReturnValue(true);
    for (let i = 0; i < 5; i++) {
      expect(() => render(<CurrentBid currentBid={0n} auctionEnded={false} />)).not.toThrow();
    }
  });

  it('rerender currentBid changes from 1 to 5 ETH', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container, rerender } = render(
      <CurrentBid currentBid={parseEther('1')} auctionEnded={false} />,
    );
    expect(container.textContent).toContain('Current bid');
    rerender(<CurrentBid currentBid={parseEther('5')} auctionEnded={false} />);
    expect(container.textContent).toContain('Current bid');
  });

  it('renders 30 instances each independently', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <>
        {Array.from({ length: 30 }, (_, i) => (
          <CurrentBid key={i} currentBid={parseEther(`${i + 1}`)} auctionEnded={false} />
        ))}
      </>,
    );
    expect(container.children.length).toBe(30);
  });

  it('rerender all states preserves text class', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container, rerender } = render(
      <CurrentBid currentBid={parseEther('1')} auctionEnded={false} />,
    );
    expect(container.textContent).toContain('Current bid');
    rerender(<CurrentBid currentBid={parseEther('1')} auctionEnded={true} />);
    expect(container.textContent).toContain('Winning bid');
    rerender(<CurrentBid currentBid={parseEther('1')} auctionEnded={false} />);
    expect(container.textContent).toContain('Current bid');
  });

  it('renders huge bid (1M ETH) preserves "bid" text', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <CurrentBid currentBid={parseEther('1000000')} auctionEnded={false} />,
    );
    expect(container.textContent).toContain('Current bid');
  });

  it('renders for very small fractional 0.00001 ETH', () => {
    useAtomValueMock.mockReturnValue(true);
    expect(() =>
      render(<CurrentBid currentBid={parseEther('0.00001')} auctionEnded={false} />),
    ).not.toThrow();
  });

  it('cool variant + warm variant rerender does not crash', () => {
    useAtomValueMock.mockReturnValueOnce(true);
    const { rerender } = render(<CurrentBid currentBid={parseEther('1')} auctionEnded={false} />);
    useAtomValueMock.mockReturnValue(false);
    expect(() =>
      rerender(<CurrentBid currentBid={parseEther('1')} auctionEnded={false} />),
    ).not.toThrow();
  });

  it('renders 100 CurrentBid instances independently', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <>
        {Array.from({ length: 100 }, (_, i) => (
          <CurrentBid key={i} currentBid={parseEther(`${i + 1}`)} auctionEnded={false} />
        ))}
      </>,
    );
    expect(container.children.length).toBe(100);
  });

  it('rerender 30 times preserves text content', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container, rerender } = render(
      <CurrentBid currentBid={parseEther('1')} auctionEnded={false} />,
    );
    for (let i = 0; i < 30; i++) {
      rerender(<CurrentBid currentBid={parseEther(`${i + 1}`)} auctionEnded={false} />);
      expect(container.textContent).toContain('Current bid');
    }
  });

  it('renders all useAtomValue return values', () => {
    [true, false, undefined, null, 0, 1].forEach(v => {
      useAtomValueMock.mockReturnValue(v);
      expect(() =>
        render(<CurrentBid currentBid={parseEther('1')} auctionEnded={false} />),
      ).not.toThrow();
    });
  });

  it('rerender between cool/warm preserves bid text', () => {
    useAtomValueMock.mockReturnValueOnce(true);
    const { container, rerender } = render(
      <CurrentBid currentBid={parseEther('1')} auctionEnded={false} />,
    );
    expect(container.textContent).toContain('Current bid');
    useAtomValueMock.mockReturnValue(false);
    rerender(<CurrentBid currentBid={parseEther('1')} auctionEnded={false} />);
    expect(container.textContent).toContain('Current bid');
  });

  it('renders 30 different bid values consecutively', () => {
    useAtomValueMock.mockReturnValue(true);
    for (let i = 1; i <= 30; i++) {
      expect(() =>
        render(<CurrentBid currentBid={parseEther(`${i}`)} auctionEnded={false} />),
      ).not.toThrow();
    }
  });
});
