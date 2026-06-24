import type { Address } from '@/utils/types';

import { screen } from '@testing-library/dom';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useAuctionBids } from '@/wrappers/onDisplayAuction';

import BidHistory from './index';

// Mock dependencies (isCoolBackgroundAtom 経由の Jotai を mock)
vi.mock('jotai/react', () => ({
  useAtomValue: () => true, // Mock isCool to be true
}));

vi.mock('@/wrappers/onDisplayAuction', () => ({
  useAuctionBids: vi.fn(),
}));

vi.mock('@/components/BidHistoryItem', () => ({
  BidHistoryItem: ({
    bid,
    isCool,
  }: {
    bid: {
      value: bigint;
      sender: string;
    };
    classes?: Record<string, string>;
    isCool: boolean;
  }) => (
    <div data-testid="bid-history-item">
      Bid: {bid.value.toString()} | Sender: {bid.sender} | Cool: {isCool ? 'yes' : 'no'}
    </div>
  ),
}));

describe('BidHistory Component', () => {
  const mockClasses = {
    bidCollection: 'bidCollection',
    otherClass: 'otherClass',
  };

  const mockBids: {
    extended: boolean;
    nounId: bigint;
    sender: Address;
    timestamp: bigint;
    transactionHash: string;
    transactionIndex: number;
    value: bigint;
  }[] = [
    {
      nounId: BigInt('1'),
      sender: '0x123456789abcdef123456789abcdef123456789a',
      value: BigInt('3000000000000000000'),
      extended: false,
      transactionHash: '0xabc1',
      transactionIndex: 1,
      timestamp: BigInt(1654000003),
    },
    {
      nounId: BigInt('1'),
      sender: '0x123456789abcdef123456789abcdef123456788b',
      value: BigInt('2000000000000000000'),
      extended: false,
      transactionHash: '0xabc2',
      transactionIndex: 2,
      timestamp: BigInt(1654000002),
    },
    {
      nounId: BigInt('1'),
      sender: '0x123456789abcdef123456789abcdef123456787c',
      value: BigInt('1000000000000000000'),
      extended: false,
      transactionHash: '0xabc3',
      transactionIndex: 3,
      timestamp: BigInt(1654000001),
    },
  ];

  it('renders nothing when no bids are available', () => {
    vi.mocked(useAuctionBids).mockReturnValue(undefined);

    render(<BidHistory auctionId="1" max={10} classes={mockClasses} />);

    const bidCollection = screen.getByRole('list');
    expect(bidCollection).toBeEmptyDOMElement();
    expect(bidCollection).toHaveClass(mockClasses.bidCollection);
  });

  it('renders bids sorted by timestamp in descending order', () => {
    vi.mocked(useAuctionBids).mockReturnValue(mockBids);

    render(<BidHistory auctionId="1" max={10} classes={mockClasses} />);

    const bidItems = screen.getAllByTestId('bid-history-item');
    expect(bidItems).toHaveLength(3);

    // First item should be the most recent bid
    expect(bidItems[0]).toHaveTextContent('3000000000000000000');
    expect(bidItems[1]).toHaveTextContent('2000000000000000000');
    expect(bidItems[2]).toHaveTextContent('1000000000000000000');
  });

  it('limits the number of displayed bids to the max prop', () => {
    vi.mocked(useAuctionBids).mockReturnValue(mockBids);

    render(<BidHistory auctionId="1" max={2} classes={mockClasses} />);

    const bidItems = screen.getAllByTestId('bid-history-item');
    expect(bidItems).toHaveLength(2);

    // Should only show the two most recent bids
    expect(bidItems[0]).toHaveTextContent('3000000000000000000');
    expect(bidItems[1]).toHaveTextContent('2000000000000000000');
  });

  it('passes the correct props to BidHistoryItem', () => {
    vi.mocked(useAuctionBids).mockReturnValue([mockBids[0]]);

    render(<BidHistory auctionId="1" max={10} classes={mockClasses} />);

    const bidItem = screen.getByTestId('bid-history-item');
    expect(bidItem).toHaveTextContent(`Bid: ${mockBids[0].value.toString()}`);
    expect(bidItem).toHaveTextContent(`Sender: ${mockBids[0].sender}`);
    expect(bidItem).toHaveTextContent('Cool: yes'); // We mocked isCool to be true
  });

  it('converts auctionId from string to BigInt when calling useAuctionBids', () => {
    vi.mocked(useAuctionBids).mockReturnValue([]);

    render(<BidHistory auctionId="42" max={10} classes={mockClasses} />);

    expect(useAuctionBids).toHaveBeenCalledWith(BigInt(42));
  });

  it('renders single bid when only 1 bid is available', () => {
    vi.mocked(useAuctionBids).mockReturnValue([mockBids[0]]);
    render(<BidHistory auctionId="1" max={10} classes={mockClasses} />);
    const items = screen.getAllByTestId('bid-history-item');
    expect(items).toHaveLength(1);
  });

  it('handles large auctionId string (1000000)', () => {
    vi.mocked(useAuctionBids).mockReturnValue([]);
    render(<BidHistory auctionId="1000000" max={10} classes={mockClasses} />);
    expect(useAuctionBids).toHaveBeenCalledWith(BigInt(1000000));
  });

  it('renders only 1 item when max=1', () => {
    vi.mocked(useAuctionBids).mockReturnValue(mockBids);
    render(<BidHistory auctionId="1" max={1} classes={mockClasses} />);
    const items = screen.getAllByTestId('bid-history-item');
    expect(items).toHaveLength(1);
    // 最新 bid のみ
    expect(items[0]).toHaveTextContent('3000000000000000000');
  });

  it('renders extended bids (extended=true) normally', () => {
    const extendedBids = [{ ...mockBids[0], extended: true }];
    vi.mocked(useAuctionBids).mockReturnValue(extendedBids);
    render(<BidHistory auctionId="1" max={10} classes={mockClasses} />);
    expect(screen.getAllByTestId('bid-history-item')).toHaveLength(1);
  });

  it('passes isCool=true to BidHistoryItem via mocked atom (Cool: yes)', () => {
    vi.mocked(useAuctionBids).mockReturnValue([mockBids[0]]);
    render(<BidHistory auctionId="1" max={10} classes={mockClasses} />);
    const item = screen.getByTestId('bid-history-item');
    expect(item).toHaveTextContent('Cool: yes');
  });

  it('list role element is rendered always (even with no bids)', () => {
    vi.mocked(useAuctionBids).mockReturnValue([]);
    render(<BidHistory auctionId="1" max={10} classes={mockClasses} />);
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('renders 0 bid items when max=0', () => {
    vi.mocked(useAuctionBids).mockReturnValue(mockBids);
    render(<BidHistory auctionId="1" max={0} classes={mockClasses} />);
    expect(screen.queryAllByTestId('bid-history-item').length).toBe(0);
  });

  it('handles auctionId="0" (BigInt(0))', () => {
    vi.mocked(useAuctionBids).mockReturnValue([]);
    render(<BidHistory auctionId="0" max={10} classes={mockClasses} />);
    expect(useAuctionBids).toHaveBeenCalledWith(0n);
  });

  it('preserves desc order even when bids initially unordered', () => {
    const unordered = [mockBids[2], mockBids[0], mockBids[1]];
    vi.mocked(useAuctionBids).mockReturnValue(unordered);
    render(<BidHistory auctionId="1" max={10} classes={mockClasses} />);
    const items = screen.getAllByTestId('bid-history-item');
    expect(items[0]).toHaveTextContent('3000000000000000000');
    expect(items[1]).toHaveTextContent('2000000000000000000');
    expect(items[2]).toHaveTextContent('1000000000000000000');
  });

  it('applies bidCollection class to list element', () => {
    vi.mocked(useAuctionBids).mockReturnValue([]);
    render(<BidHistory auctionId="1" max={10} classes={mockClasses} />);
    expect(screen.getByRole('list')).toHaveClass(mockClasses.bidCollection);
  });
});
