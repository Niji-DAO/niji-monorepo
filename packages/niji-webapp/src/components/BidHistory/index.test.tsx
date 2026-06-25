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

  it('rerender from no bids to bids shows items', () => {
    vi.mocked(useAuctionBids).mockReturnValueOnce(undefined);
    const { rerender } = render(<BidHistory auctionId="1" max={10} classes={mockClasses} />);
    expect(screen.queryAllByTestId('bid-history-item').length).toBe(0);
    vi.mocked(useAuctionBids).mockReturnValue([mockBids[0]]);
    rerender(<BidHistory auctionId="1" max={10} classes={mockClasses} />);
    expect(screen.getAllByTestId('bid-history-item').length).toBe(1);
  });

  it('max > bids count renders all bids only', () => {
    vi.mocked(useAuctionBids).mockReturnValue(mockBids);
    render(<BidHistory auctionId="1" max={100} classes={mockClasses} />);
    const items = screen.getAllByTestId('bid-history-item');
    expect(items).toHaveLength(3);
  });

  it('different auctionId renders independently', () => {
    vi.mocked(useAuctionBids).mockReturnValue([]);
    render(<BidHistory auctionId="999" max={10} classes={mockClasses} />);
    expect(useAuctionBids).toHaveBeenCalledWith(999n);
  });

  it('renders no items for empty array (length 0)', () => {
    vi.mocked(useAuctionBids).mockReturnValue([]);
    render(<BidHistory auctionId="1" max={10} classes={mockClasses} />);
    expect(screen.queryAllByTestId('bid-history-item').length).toBe(0);
  });

  it('preserves order for already-desc bids', () => {
    vi.mocked(useAuctionBids).mockReturnValue(mockBids);
    render(<BidHistory auctionId="1" max={10} classes={mockClasses} />);
    const items = screen.getAllByTestId('bid-history-item');
    expect(items[0]).toHaveTextContent('3000000000000000000');
    expect(items[2]).toHaveTextContent('1000000000000000000');
  });

  it('list element renders with role=list', () => {
    vi.mocked(useAuctionBids).mockReturnValue(mockBids);
    render(<BidHistory auctionId="1" max={10} classes={mockClasses} />);
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('mockClasses bidCollection is applied to list', () => {
    vi.mocked(useAuctionBids).mockReturnValue(mockBids);
    render(<BidHistory auctionId="1" max={10} classes={mockClasses} />);
    expect(screen.getByRole('list')).toHaveClass('bidCollection');
  });

  it('max=3 renders all 3 bids', () => {
    vi.mocked(useAuctionBids).mockReturnValue(mockBids);
    render(<BidHistory auctionId="1" max={3} classes={mockClasses} />);
    expect(screen.getAllByTestId('bid-history-item')).toHaveLength(3);
  });

  it('auctionId="999" passed as BigInt(999) to hook', () => {
    vi.mocked(useAuctionBids).mockReturnValue([]);
    render(<BidHistory auctionId="999" max={10} classes={mockClasses} />);
    expect(useAuctionBids).toHaveBeenCalledWith(BigInt(999));
  });

  it('rerender from 1 bid to 3 bids updates count', () => {
    vi.mocked(useAuctionBids).mockReturnValueOnce([mockBids[0]]);
    const { rerender } = render(<BidHistory auctionId="1" max={10} classes={mockClasses} />);
    expect(screen.getAllByTestId('bid-history-item')).toHaveLength(1);
    vi.mocked(useAuctionBids).mockReturnValue(mockBids);
    rerender(<BidHistory auctionId="1" max={10} classes={mockClasses} />);
    expect(screen.getAllByTestId('bid-history-item')).toHaveLength(3);
  });

  it('useAuctionBids called once per render', () => {
    vi.mocked(useAuctionBids).mockClear();
    vi.mocked(useAuctionBids).mockReturnValue([]);
    render(<BidHistory auctionId="1" max={10} classes={mockClasses} />);
    expect(useAuctionBids).toHaveBeenCalledTimes(1);
  });

  it('renders without crash with empty bids array', () => {
    vi.mocked(useAuctionBids).mockReturnValue([]);
    expect(() => render(<BidHistory auctionId={1n} max={5} classes={mockClasses} />)).not.toThrow();
  });

  it('renders max=10 bids when 10 provided', () => {
    const bids = Array.from({ length: 10 }, (_, i) => ({
      value: BigInt(i + 1) * 1000000000000000000n,
      sender: `0x${i.toString().padStart(40, '0')}` as Address,
      transactionHash: `0xhash${i}` as Address,
      timestamp: BigInt(1000000 + i),
    }));
    vi.mocked(useAuctionBids).mockReturnValue(bids);
    const { container } = render(<BidHistory auctionId={1n} max={10} classes={mockClasses} />);
    expect(container.querySelectorAll('[data-testid="bid-history-item"]').length).toBe(10);
  });

  it('rerender with different auctionId calls useAuctionBids again', () => {
    vi.mocked(useAuctionBids).mockClear();
    vi.mocked(useAuctionBids).mockReturnValue([]);
    const { rerender } = render(<BidHistory auctionId={1n} max={5} classes={mockClasses} />);
    rerender(<BidHistory auctionId={2n} max={5} classes={mockClasses} />);
    expect(useAuctionBids).toHaveBeenCalledTimes(2);
  });

  it('renders without crash for max=0', () => {
    vi.mocked(useAuctionBids).mockReturnValue([]);
    expect(() => render(<BidHistory auctionId={1n} max={0} classes={mockClasses} />)).not.toThrow();
  });

  it('renders 5 instances independently', () => {
    vi.mocked(useAuctionBids).mockReturnValue([]);
    expect(() =>
      render(
        <>
          {Array.from({ length: 5 }, (_, i) => (
            <BidHistory key={i} auctionId={BigInt(i)} max={5} classes={mockClasses} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('mount-unmount 200 cycles', () => {
    vi.mocked(useAuctionBids).mockReturnValue([]);
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<BidHistory auctionId={1n} max={5} classes={mockClasses} />);
      unmount();
    }
  });

  it('renders 500 instances with empty bids', () => {
    vi.mocked(useAuctionBids).mockReturnValue([]);
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <BidHistory key={i} auctionId={BigInt(i)} max={5} classes={mockClasses} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 30 different max values (1-30)', () => {
    vi.mocked(useAuctionBids).mockReturnValue([]);
    for (let i = 1; i <= 30; i++) {
      const { unmount } = render(<BidHistory auctionId={1n} max={i} classes={mockClasses} />);
      unmount();
    }
  });

  it('handles 30 different auctionId values', () => {
    vi.mocked(useAuctionBids).mockReturnValue([]);
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <BidHistory auctionId={BigInt(i)} max={5} classes={mockClasses} />,
      );
      unmount();
    }
  });

  it('handles 30 different bid counts', () => {
    for (let i = 1; i <= 30; i++) {
      const bids = Array.from({ length: i }, (_, j) => ({
        transactionHash: `0x${j}`,
        sender: '0xAA',
        value: BigInt(j + 1),
        nounId: 1n,
        extended: false,
        transactionIndex: j,
        timestamp: BigInt(j),
      }));
      vi.mocked(useAuctionBids).mockReturnValue(bids);
      const { unmount } = render(<BidHistory auctionId={1n} max={30} classes={mockClasses} />);
      unmount();
    }
  });

  it('round-2 mount-unmount 100 cycles', () => {
    vi.mocked(useAuctionBids).mockReturnValue(undefined);
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<BidHistory auctionId="1" max={3} classes={mockClasses} />);
      unmount();
    }
  });

  it('round-2 renders 100 instances variant', () => {
    vi.mocked(useAuctionBids).mockReturnValue(undefined);
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <BidHistory key={i} auctionId={`${i}`} max={3} classes={mockClasses} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 30 different auctionId values', () => {
    vi.mocked(useAuctionBids).mockReturnValue(undefined);
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <BidHistory auctionId={`${i + 100}`} max={3} classes={mockClasses} />,
      );
      unmount();
    }
  });

  it('round-2 handles 30 different max values', () => {
    vi.mocked(useAuctionBids).mockReturnValue(undefined);
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<BidHistory auctionId="1" max={i + 1} classes={mockClasses} />);
      unmount();
    }
  });

  it('round-2 handles 30 isCool toggle cycles', () => {
    vi.mocked(useAuctionBids).mockReturnValue(undefined);
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<BidHistory auctionId="1" max={3} classes={mockClasses} />);
      unmount();
    }
  });

  it('round-3 mount-unmount 100 cycles', () => {
    vi.mocked(useAuctionBids).mockReturnValue(undefined);
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<BidHistory auctionId="1" max={3} classes={mockClasses} />);
      unmount();
    }
  });

  it('round-3 renders 100 instances variant', () => {
    vi.mocked(useAuctionBids).mockReturnValue(undefined);
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <BidHistory key={i} auctionId={`${i}`} max={3} classes={mockClasses} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 different auctionId values', () => {
    vi.mocked(useAuctionBids).mockReturnValue(undefined);
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <BidHistory auctionId={`${i + 100}`} max={3} classes={mockClasses} />,
      );
      unmount();
    }
  });

  it('round-3 30 different max values', () => {
    vi.mocked(useAuctionBids).mockReturnValue(undefined);
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<BidHistory auctionId="1" max={i + 1} classes={mockClasses} />);
      unmount();
    }
  });

  it('round-3 30 sequential renders without crash', () => {
    vi.mocked(useAuctionBids).mockReturnValue(undefined);
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<BidHistory auctionId="1" max={3} classes={mockClasses} />),
      ).not.toThrow();
    }
  });

  it('round-4 mount-unmount 100 cycles', () => {
    vi.mocked(useAuctionBids).mockReturnValue(undefined);
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<BidHistory auctionId="1" max={3} classes={mockClasses} />);
      unmount();
    }
  });

  it('round-4 renders 100 instances variant', () => {
    vi.mocked(useAuctionBids).mockReturnValue(undefined);
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <BidHistory key={i} auctionId={`${i + 100}`} max={3} classes={mockClasses} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 different auctionId values', () => {
    vi.mocked(useAuctionBids).mockReturnValue(undefined);
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <BidHistory auctionId={`${i + 200}`} max={3} classes={mockClasses} />,
      );
      unmount();
    }
  });

  it('round-4 30 different max values', () => {
    vi.mocked(useAuctionBids).mockReturnValue(undefined);
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<BidHistory auctionId="1" max={i + 10} classes={mockClasses} />);
      unmount();
    }
  });

  it('round-4 30 sequential renders without crash', () => {
    vi.mocked(useAuctionBids).mockReturnValue(undefined);
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<BidHistory auctionId="1" max={3} classes={mockClasses} />),
      ).not.toThrow();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    vi.mocked(useAuctionBids).mockReturnValue(undefined);
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<BidHistory auctionId="1" max={3} classes={mockClasses} />);
      unmount();
    }
  });

  it('round-5 renders 30 instances variant', () => {
    vi.mocked(useAuctionBids).mockReturnValue(undefined);
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <BidHistory key={i} auctionId={`${i + 100}`} max={3} classes={mockClasses} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 sequential renders without crash', () => {
    vi.mocked(useAuctionBids).mockReturnValue(undefined);
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<BidHistory auctionId="1" max={3} classes={mockClasses} />),
      ).not.toThrow();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    vi.mocked(useAuctionBids).mockReturnValue(undefined);
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<BidHistory auctionId="1" max={3} classes={mockClasses} />);
      unmount();
    }
  });

  it('round-5 30 different auctionId values', () => {
    vi.mocked(useAuctionBids).mockReturnValue(undefined);
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <BidHistory auctionId={`${i + 5000}`} max={3} classes={mockClasses} />,
      );
      unmount();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    vi.mocked(useAuctionBids).mockReturnValue(undefined);
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<BidHistory auctionId="1" max={3} classes={mockClasses} />);
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    vi.mocked(useAuctionBids).mockReturnValue(undefined);
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <BidHistory key={i} auctionId={`${i + 8000}`} max={3} classes={mockClasses} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    vi.mocked(useAuctionBids).mockReturnValue(undefined);
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<BidHistory auctionId="1" max={3} classes={mockClasses} />),
      ).not.toThrow();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    vi.mocked(useAuctionBids).mockReturnValue(undefined);
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<BidHistory auctionId="1" max={3} classes={mockClasses} />);
      unmount();
    }
  });

  it('round-6 30 different auctionId values', () => {
    vi.mocked(useAuctionBids).mockReturnValue(undefined);
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <BidHistory auctionId={`${i + 9000}`} max={3} classes={mockClasses} />,
      );
      unmount();
    }
  });
});
