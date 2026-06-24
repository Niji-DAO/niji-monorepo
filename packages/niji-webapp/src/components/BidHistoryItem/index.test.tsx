import type { Address } from '@/utils/types';

import { screen } from '@testing-library/dom';
import { render } from '@testing-library/react';
import dayjs from 'dayjs';
import { describe, expect, it, vi } from 'vitest';

import { BidHistoryItem } from './index';

// Mock the dependencies
vi.mock('@/assets/icons/Link.svg?react', () => ({
  default: () => <div data-testid="link-icon">Link Icon</div>,
}));

vi.mock('@/components/ShortAddress', () => ({
  default: ({ address, avatar }: { address: string; avatar?: boolean }) => (
    <div data-testid="short-address">
      Short: {address} {avatar ? '(with avatar)' : ''}
    </div>
  ),
}));

vi.mock('@/components/TruncatedAmount', () => ({
  default: ({ amount }: { amount: bigint }) => (
    <div data-testid="truncated-amount">Amount: {amount.toString()}</div>
  ),
}));

vi.mock('@/utils/etherscan', () => ({
  buildEtherscanTxLink: (hash: never) => `https://etherscan.io/tx/${hash}`,
}));

describe('BidHistoryItem Component', () => {
  const mockClasses = {
    bidRowCool: 'bidRowCool',
    bidRowWarm: 'bidRowWarm',
    bidItem: 'bidItem',
    leftSectionWrapper: 'leftSectionWrapper',
    bidder: 'bidder',
    bidDate: 'bidDate',
    rightSectionWrapper: 'rightSectionWrapper',
    bidAmount: 'bidAmount',
    linkSymbol: 'linkSymbol',
  };

  const mockBid = {
    nounId: 1n,
    sender: '0x123456789abcdef123456789abcdef123456789a' as Address,
    value: 1000000000000000000n,
    extended: false,
    transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    transactionIndex: 1,
    timestamp: BigInt(Math.floor(Date.now() / 1000)),
  };

  // Mock window.innerWidth
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 1200, // Desktop by default
  });

  it('renders the bid information correctly', () => {
    render(<BidHistoryItem bid={mockBid} classes={mockClasses} />);

    // Check address is rendered
    expect(screen.getByTestId('short-address')).toBeInTheDocument();
    expect(screen.getByTestId('short-address')).toHaveTextContent(mockBid.sender);

    // Check amount is rendered
    expect(screen.getByTestId('truncated-amount')).toBeInTheDocument();
    expect(screen.getByTestId('truncated-amount')).toHaveTextContent(mockBid.value.toString());

    // Check the timestamp is formatted correctly
    const date = `${dayjs(Number(mockBid.timestamp) * 1000).format('MMM DD')} at ${dayjs(
      Number(mockBid.timestamp) * 1000,
    ).format('hh:mm a')}`;
    expect(screen.getByText(date)).toBeInTheDocument();

    // Check a transaction link
    expect(screen.getByTestId('link-icon')).toBeInTheDocument();
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', `https://etherscan.io/tx/${mockBid.transactionHash}`);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer');
  });

  it('applies warm style when isCool is false', () => {
    render(<BidHistoryItem bid={mockBid} classes={mockClasses} isCool={false} />);

    const bidRow = screen.getByRole('listitem');
    expect(bidRow).toHaveClass(mockClasses.bidRowWarm);
    expect(bidRow).not.toHaveClass(mockClasses.bidRowCool);
  });

  it('applies cool style when isCool is true', () => {
    render(<BidHistoryItem bid={mockBid} classes={mockClasses} isCool={true} />);

    const bidRow = screen.getByRole('listitem');
    expect(bidRow).toHaveClass(mockClasses.bidRowCool);
    expect(bidRow).not.toHaveClass(mockClasses.bidRowWarm);
  });

  it('defaults to warm style when isCool is not provided', () => {
    render(<BidHistoryItem bid={mockBid} classes={mockClasses} />);

    const bidRow = screen.getByRole('listitem');
    expect(bidRow).toHaveClass(mockClasses.bidRowWarm);
    expect(bidRow).not.toHaveClass(mockClasses.bidRowCool);
  });

  it('handles mobile view correctly', () => {
    // Set window width to mobile size
    window.innerWidth = 800;

    render(<BidHistoryItem bid={mockBid} classes={mockClasses} />);

    // Check ShortAddress is rendered without an avatar
    expect(screen.getByTestId('short-address')).not.toHaveTextContent('(with avatar)');

    // Reset window width
    window.innerWidth = 1200;
  });

  it('renders large amount (1e24 wei) via TruncatedAmount', () => {
    const huge = { ...mockBid, value: 1_000_000_000_000_000_000_000_000n };
    render(<BidHistoryItem bid={huge} classes={mockClasses} />);
    expect(screen.getByTestId('truncated-amount')).toHaveTextContent('1000000000000000000000000');
  });

  it('renders extended=true bid normally (no visual difference at item level)', () => {
    const ext = { ...mockBid, extended: true };
    render(<BidHistoryItem bid={ext} classes={mockClasses} />);
    expect(screen.getByTestId('short-address')).toBeInTheDocument();
    expect(screen.getByTestId('truncated-amount')).toBeInTheDocument();
  });

  it('link has rel="noreferrer" for external safety', () => {
    render(<BidHistoryItem bid={mockBid} classes={mockClasses} />);
    expect(screen.getByRole('link').getAttribute('rel')).toBe('noreferrer');
  });

  it('link target is "_blank" for new tab', () => {
    render(<BidHistoryItem bid={mockBid} classes={mockClasses} />);
    expect(screen.getByRole('link').getAttribute('target')).toBe('_blank');
  });

  it('handles short transaction hash format (no normalization)', () => {
    const shortHash = { ...mockBid, transactionHash: '0xshort' };
    render(<BidHistoryItem bid={shortHash} classes={mockClasses} />);
    expect(screen.getByRole('link').getAttribute('href')).toBe('https://etherscan.io/tx/0xshort');
  });

  it('desktop view (innerWidth=1200) keeps full ShortAddress', () => {
    window.innerWidth = 1200;
    render(<BidHistoryItem bid={mockBid} classes={mockClasses} />);
    expect(screen.getByTestId('short-address')).toHaveTextContent(mockBid.sender);
  });

  it('renders 0n value via TruncatedAmount', () => {
    const zeroBid = { ...mockBid, value: 0n };
    render(<BidHistoryItem bid={zeroBid} classes={mockClasses} />);
    expect(screen.getByTestId('truncated-amount')).toHaveTextContent('Amount: 0');
  });

  it('renders exactly 1 link element per bid item', () => {
    const { container } = render(<BidHistoryItem bid={mockBid} classes={mockClasses} />);
    expect(container.querySelectorAll('a').length).toBe(1);
  });

  it('renders link-icon inside link wrapper', () => {
    const { container } = render(<BidHistoryItem bid={mockBid} classes={mockClasses} />);
    const link = container.querySelector('a');
    expect(link?.querySelector('[data-testid="link-icon"]')).not.toBeNull();
  });

  it('renders different sender address correctly', () => {
    const diffSender = { ...mockBid, sender: '0xBBB' as Address };
    render(<BidHistoryItem bid={diffSender} classes={mockClasses} />);
    expect(screen.getByTestId('short-address')).toHaveTextContent('0xBBB');
  });

  it('item has role=listitem', () => {
    render(<BidHistoryItem bid={mockBid} classes={mockClasses} />);
    expect(screen.getByRole('listitem')).toBeInTheDocument();
  });

  it('href starts with etherscan URL pattern', () => {
    render(<BidHistoryItem bid={mockBid} classes={mockClasses} />);
    expect(screen.getByRole('link').getAttribute('href')).toContain('etherscan.io/tx/');
  });

  it('truncated-amount component renders exactly 1 time', () => {
    const { container } = render(<BidHistoryItem bid={mockBid} classes={mockClasses} />);
    expect(container.querySelectorAll('[data-testid="truncated-amount"]').length).toBe(1);
  });

  it('short-address component renders exactly 1 time', () => {
    const { container } = render(<BidHistoryItem bid={mockBid} classes={mockClasses} />);
    expect(container.querySelectorAll('[data-testid="short-address"]').length).toBe(1);
  });

  it('link-icon component renders exactly 1 time', () => {
    const { container } = render(<BidHistoryItem bid={mockBid} classes={mockClasses} />);
    expect(container.querySelectorAll('[data-testid="link-icon"]').length).toBe(1);
  });

  it('isCool=true sets cool class only (not warm)', () => {
    render(<BidHistoryItem bid={mockBid} classes={mockClasses} isCool={true} />);
    const item = screen.getByRole('listitem');
    expect(item.className).toContain('bidRowCool');
    expect(item.className).not.toContain('bidRowWarm');
  });

  it('different transaction hash updates href', () => {
    const newHash = { ...mockBid, transactionHash: '0xNEWHASH' };
    render(<BidHistoryItem bid={newHash} classes={mockClasses} />);
    expect(screen.getByRole('link').getAttribute('href')).toBe('https://etherscan.io/tx/0xNEWHASH');
  });

  it('isCool=false sets warm class only (not cool)', () => {
    render(<BidHistoryItem bid={mockBid} classes={mockClasses} isCool={false} />);
    const item = screen.getByRole('listitem');
    expect(item.className).toContain('bidRowWarm');
    expect(item.className).not.toContain('bidRowCool');
  });

  it('mobile view (innerWidth=800) renders ShortAddress without avatar', () => {
    window.innerWidth = 800;
    render(<BidHistoryItem bid={mockBid} classes={mockClasses} />);
    expect(screen.getByTestId('short-address')).not.toHaveTextContent('(with avatar)');
    window.innerWidth = 1200;
  });

  it('zero bid value (0n) renders Amount: 0', () => {
    const zero = { ...mockBid, value: 0n };
    render(<BidHistoryItem bid={zero} classes={mockClasses} />);
    expect(screen.getByTestId('truncated-amount')).toHaveTextContent('Amount: 0');
  });

  it('rerender preserves listitem role', () => {
    const { rerender } = render(<BidHistoryItem bid={mockBid} classes={mockClasses} />);
    expect(screen.getByRole('listitem')).toBeInTheDocument();
    rerender(<BidHistoryItem bid={{ ...mockBid, value: 999n }} classes={mockClasses} />);
    expect(screen.getByRole('listitem')).toBeInTheDocument();
  });

  it('multiple BidHistoryItem render distinct items', () => {
    const { container } = render(
      <>
        <BidHistoryItem bid={mockBid} classes={mockClasses} />
        <BidHistoryItem bid={{ ...mockBid, transactionHash: '0x999' }} classes={mockClasses} />
      </>,
    );
    expect(container.querySelectorAll('a').length).toBe(2);
  });

  it('renders truncated-amount for huge bid value', () => {
    const hugeBid = { ...mockBid, value: 1_000_000_000_000_000_000_000_000n };
    render(<BidHistoryItem bid={hugeBid} classes={mockClasses} />);
    expect(screen.getByTestId('truncated-amount')).toHaveTextContent('1000000000000000000000000');
  });

  it('renders for 0n bid value', () => {
    const zeroBid = { ...mockBid, value: 0n };
    render(<BidHistoryItem bid={zeroBid} classes={mockClasses} />);
    expect(screen.getByTestId('truncated-amount')).toHaveTextContent('Amount: 0');
  });

  it('renders 5 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 5 }, (_, i) => (
          <BidHistoryItem
            key={i}
            bid={{ ...mockBid, value: BigInt(i + 1) * 1000000000000000000n }}
            classes={mockClasses}
          />
        ))}
      </>,
    );
    expect(container.querySelectorAll('[data-testid="truncated-amount"]').length).toBe(5);
  });

  it('rerender with new bid updates amount', () => {
    const { rerender } = render(<BidHistoryItem bid={mockBid} classes={mockClasses} />);
    const newBid = { ...mockBid, value: 5_000_000_000_000_000_000n };
    rerender(<BidHistoryItem bid={newBid} classes={mockClasses} />);
    expect(screen.getByTestId('truncated-amount')).toHaveTextContent('Amount: 5000000000000000000');
  });

  it('renders extended bid flag (true) without crash', () => {
    const extBid = { ...mockBid, extended: true };
    expect(() => render(<BidHistoryItem bid={extBid} classes={mockClasses} />)).not.toThrow();
  });

  it('renders 10 instances each with distinct values', () => {
    const { container } = render(
      <>
        {Array.from({ length: 10 }, (_, i) => (
          <BidHistoryItem
            key={i}
            bid={{ ...mockBid, value: BigInt(i + 1) * 1_000_000_000_000_000_000n }}
            classes={mockClasses}
          />
        ))}
      </>,
    );
    expect(container.querySelectorAll('[data-testid="truncated-amount"]').length).toBe(10);
  });

  it('renders without crash for fractional value (1 wei)', () => {
    const wei = { ...mockBid, value: 1n };
    expect(() => render(<BidHistoryItem bid={wei} classes={mockClasses} />)).not.toThrow();
  });

  it('rerender different value updates amount', () => {
    const { rerender } = render(<BidHistoryItem bid={mockBid} classes={mockClasses} />);
    const updated = { ...mockBid, value: 10n * 1_000_000_000_000_000_000n };
    rerender(<BidHistoryItem bid={updated} classes={mockClasses} />);
    expect(screen.getByTestId('truncated-amount')).toHaveTextContent(
      'Amount: 10000000000000000000',
    );
  });

  it('renders without crash for empty classes object', () => {
    expect(() => render(<BidHistoryItem bid={mockBid} classes={{}} />)).not.toThrow();
  });

  it('renders consistently across 5 sequential renders', () => {
    for (let i = 0; i < 5; i++) {
      expect(() => render(<BidHistoryItem bid={mockBid} classes={mockClasses} />)).not.toThrow();
    }
  });
});
