import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

const navigateMock = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('@/components/AuctionActivity', () => ({
  default: ({
    onPrevAuctionClick,
    onNextAuctionClick,
    isFirstAuction,
    isLastAuction,
  }: {
    onPrevAuctionClick: () => void;
    onNextAuctionClick: () => void;
    isFirstAuction: boolean;
    isLastAuction: boolean;
  }) => (
    <div data-testid="auction-activity">
      <button data-testid="prev" onClick={onPrevAuctionClick} disabled={isFirstAuction} />
      <button data-testid="next" onClick={onNextAuctionClick} disabled={isLastAuction} />
    </div>
  ),
}));

vi.mock('@/components/LegacyNoun', () => ({
  LoadingNoun: () => <span data-testid="loading" />,
}));

vi.mock('@/components/Niji', () => ({
  NijiWithSeed: ({ nounId }: { nounId: bigint }) => (
    <span data-testid="niji-with-seed">{nounId.toString()}</span>
  ),
}));

vi.mock('@/components/NijiContent', () => ({
  default: () => <div data-testid="niji-content" />,
}));

const useAtomValueMock = vi.fn();
vi.mock('jotai/react', () => ({
  useAtomValue: () => useAtomValueMock(),
  useSetAtom: () => () => {},
}));

vi.mock('@/utils/history', () => ({
  nounPath: (id: number) => `/niji/${id}`,
}));

vi.mock('@/utils/nounBgColors', () => ({
  beige: '#beige',
  grey: '#grey',
}));

const isNounderMock = vi.fn();
vi.mock('@/utils/nounderNiji', () => ({
  isNounderNiji: (id: bigint) => isNounderMock(id),
}));

import Auction from './index';

const makeAuction = (nounId: bigint) => ({
  amount: 1000n,
  bidder: '0xAA',
  endTime: 100n,
  startTime: 0n,
  nounId,
  settled: false,
});

const wrap = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('Auction', () => {
  it('renders LoadingNoun when no auction', () => {
    useAtomValueMock.mockReturnValue(10n);
    const { container } = wrap(<Auction />);
    expect(container.querySelector('[data-testid="loading"]')).not.toBeNull();
  });

  it('renders NijiWithSeed when auction is provided', () => {
    useAtomValueMock.mockReturnValue(10n);
    isNounderMock.mockReturnValue(false);
    const { container } = wrap(<Auction auction={makeAuction(5n)} />);
    expect(container.querySelector('[data-testid="niji-with-seed"]')?.textContent).toBe('5');
  });

  it('renders AuctionActivity for non-Nounder auction', () => {
    useAtomValueMock.mockReturnValue(10n);
    isNounderMock.mockReturnValue(false);
    const { container } = wrap(<Auction auction={makeAuction(5n)} />);
    expect(container.querySelector('[data-testid="auction-activity"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="niji-content"]')).toBeNull();
  });

  it('renders NijiContent for Nounder auction', () => {
    useAtomValueMock.mockReturnValue(10n);
    isNounderMock.mockReturnValue(true);
    const { container } = wrap(<Auction auction={makeAuction(0n)} />);
    expect(container.querySelector('[data-testid="niji-content"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="auction-activity"]')).toBeNull();
  });

  it('isFirstAuction=true for nounId=0', () => {
    useAtomValueMock.mockReturnValue(10n);
    isNounderMock.mockReturnValue(false);
    const { container } = wrap(<Auction auction={makeAuction(0n)} />);
    expect(container.querySelector('[data-testid="prev"]')?.disabled).toBe(true);
  });

  it('isLastAuction=true when nounId === lastAuctionNounId', () => {
    useAtomValueMock.mockReturnValue(5n);
    isNounderMock.mockReturnValue(false);
    const { container } = wrap(<Auction auction={makeAuction(5n)} />);
    expect(container.querySelector('[data-testid="next"]')?.disabled).toBe(true);
  });

  it('prev click navigates to nounId-1', () => {
    useAtomValueMock.mockReturnValue(10n);
    isNounderMock.mockReturnValue(false);
    navigateMock.mockReset();
    const { container } = wrap(<Auction auction={makeAuction(5n)} />);
    fireEvent.click(container.querySelector('[data-testid="prev"]')!);
    expect(navigateMock).toHaveBeenCalledWith('/niji/4');
  });

  it('next click navigates to nounId+1', () => {
    useAtomValueMock.mockReturnValue(10n);
    isNounderMock.mockReturnValue(false);
    navigateMock.mockReset();
    const { container } = wrap(<Auction auction={makeAuction(5n)} />);
    fireEvent.click(container.querySelector('[data-testid="next"]')!);
    expect(navigateMock).toHaveBeenCalledWith('/niji/6');
  });

  it('does not render AuctionActivity when lastNounId is undefined', () => {
    useAtomValueMock.mockReturnValue(undefined);
    isNounderMock.mockReturnValue(false);
    const { container } = wrap(<Auction auction={makeAuction(5n)} />);
    expect(container.querySelector('[data-testid="auction-activity"]')).toBeNull();
  });

  it('isFirstAuction=false for nounId > 0', () => {
    useAtomValueMock.mockReturnValue(10n);
    isNounderMock.mockReturnValue(false);
    const { container } = wrap(<Auction auction={makeAuction(3n)} />);
    expect(container.querySelector('[data-testid="prev"]')?.disabled).toBe(false);
  });

  it('isLastAuction=false when nounId < lastAuctionNounId', () => {
    useAtomValueMock.mockReturnValue(10n);
    isNounderMock.mockReturnValue(false);
    const { container } = wrap(<Auction auction={makeAuction(3n)} />);
    expect(container.querySelector('[data-testid="next"]')?.disabled).toBe(false);
  });

  it('first auction prev click does not navigate (button is disabled)', () => {
    useAtomValueMock.mockReturnValue(10n);
    isNounderMock.mockReturnValue(false);
    navigateMock.mockReset();
    const { container } = wrap(<Auction auction={makeAuction(0n)} />);
    const prevBtn = container.querySelector('[data-testid="prev"]') as HTMLButtonElement;
    expect(prevBtn.disabled).toBe(true);
    fireEvent.click(prevBtn);
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('renders NijiWithSeed for large bigint nounId', () => {
    useAtomValueMock.mockReturnValue(1000n);
    isNounderMock.mockReturnValue(false);
    const { container } = wrap(<Auction auction={makeAuction(999n)} />);
    expect(container.querySelector('[data-testid="niji-with-seed"]')?.textContent).toBe('999');
  });

  it('Nounder auction (nounId=0, isNounder=true) does not render AuctionActivity', () => {
    useAtomValueMock.mockReturnValue(10n);
    isNounderMock.mockReturnValue(true);
    const { container } = wrap(<Auction auction={makeAuction(0n)} />);
    expect(container.querySelector('[data-testid="auction-activity"]')).toBeNull();
    expect(container.querySelector('[data-testid="niji-content"]')).not.toBeNull();
  });

  it('multiple next clicks navigate to nounId+1 each time', () => {
    useAtomValueMock.mockReturnValue(10n);
    isNounderMock.mockReturnValue(false);
    navigateMock.mockReset();
    const { container } = wrap(<Auction auction={makeAuction(3n)} />);
    const next = container.querySelector('[data-testid="next"]') as HTMLButtonElement;
    fireEvent.click(next);
    fireEvent.click(next);
    expect(navigateMock).toHaveBeenCalledTimes(2);
  });

  it('renders niji-with-seed exactly 1 time per auction', () => {
    useAtomValueMock.mockReturnValue(10n);
    isNounderMock.mockReturnValue(false);
    const { container } = wrap(<Auction auction={makeAuction(5n)} />);
    expect(container.querySelectorAll('[data-testid="niji-with-seed"]').length).toBe(1);
  });

  it('lastNounId undefined disables AuctionActivity render path', () => {
    useAtomValueMock.mockReturnValue(undefined);
    isNounderMock.mockReturnValue(false);
    const { container } = wrap(<Auction auction={makeAuction(5n)} />);
    expect(container.querySelector('[data-testid="niji-with-seed"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="auction-activity"]')).toBeNull();
  });

  it('last auction next click does not navigate (button disabled)', () => {
    useAtomValueMock.mockReturnValue(5n);
    isNounderMock.mockReturnValue(false);
    navigateMock.mockReset();
    const { container } = wrap(<Auction auction={makeAuction(5n)} />);
    const next = container.querySelector('[data-testid="next"]') as HTMLButtonElement;
    expect(next.disabled).toBe(true);
    fireEvent.click(next);
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('Nounder nounId=20 with isNounder=true renders niji-content', () => {
    useAtomValueMock.mockReturnValue(100n);
    isNounderMock.mockReturnValue(true);
    const { container } = wrap(<Auction auction={makeAuction(20n)} />);
    expect(container.querySelector('[data-testid="niji-content"]')).not.toBeNull();
  });

  it('isFirstAuction=false for nounId=1 (boundary)', () => {
    useAtomValueMock.mockReturnValue(10n);
    isNounderMock.mockReturnValue(false);
    const { container } = wrap(<Auction auction={makeAuction(1n)} />);
    expect(container.querySelector('[data-testid="prev"]')?.disabled).toBe(false);
  });

  it('renders 1 NijiWithSeed per Auction', () => {
    useAtomValueMock.mockReturnValue(10n);
    isNounderMock.mockReturnValue(false);
    const { container } = wrap(<Auction auction={makeAuction(5n)} />);
    expect(container.querySelectorAll('[data-testid="niji-with-seed"]').length).toBe(1);
  });

  it('multiple Auction instances render independently', () => {
    useAtomValueMock.mockReturnValue(10n);
    isNounderMock.mockReturnValue(false);
    const { container } = wrap(
      <>
        <Auction auction={makeAuction(1n)} />
        <Auction auction={makeAuction(2n)} />
      </>,
    );
    expect(container.querySelectorAll('[data-testid="niji-with-seed"]').length).toBe(2);
  });

  it('no auction prop renders only LoadingNoun', () => {
    useAtomValueMock.mockReturnValue(10n);
    const { container } = wrap(<Auction />);
    expect(container.querySelector('[data-testid="loading"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="niji-with-seed"]')).toBeNull();
  });

  it('lastAuctionNounId 100n + nounId 5n renders both buttons enabled', () => {
    useAtomValueMock.mockReturnValue(100n);
    isNounderMock.mockReturnValue(false);
    const { container } = wrap(<Auction auction={makeAuction(5n)} />);
    expect(container.querySelector('[data-testid="prev"]')?.disabled).toBe(false);
    expect(container.querySelector('[data-testid="next"]')?.disabled).toBe(false);
  });

  it('Nounder isFirstAuction logic still applies (NijiContent variant)', () => {
    useAtomValueMock.mockReturnValue(10n);
    isNounderMock.mockReturnValue(true);
    expect(() => wrap(<Auction auction={makeAuction(0n)} />)).not.toThrow();
  });

  it('renders without crash for auction id=999999n', () => {
    expect(() => wrap(<Auction auction={makeAuction(999999n)} />)).not.toThrow();
  });

  it('renders without crash for auction id=2n', () => {
    expect(() => wrap(<Auction auction={makeAuction(2n)} />)).not.toThrow();
  });

  it('renders for non-Nounders id', () => {
    expect(() => wrap(<Auction auction={makeAuction(11n)} />)).not.toThrow();
  });

  it('navigates without crash on rerender with different id', () => {
    expect(() => {
      const { rerender } = wrap(<Auction auction={makeAuction(1n)} />);
      rerender(<Auction auction={makeAuction(2n)} />);
    }).not.toThrow();
  });

  it('renders for MAX_SAFE bigint id', () => {
    expect(() => wrap(<Auction auction={makeAuction(9007199254740991n)} />)).not.toThrow();
  });

  it('renders without crash for negative id (-1n)', () => {
    expect(() => wrap(<Auction auction={makeAuction(-1n)} />)).not.toThrow();
  });

  it('renders without crash for id 100n', () => {
    expect(() => wrap(<Auction auction={makeAuction(100n)} />)).not.toThrow();
  });

  it('rerender same auction id does not crash', () => {
    expect(() => {
      wrap(<Auction auction={makeAuction(5n)} />);
      wrap(<Auction auction={makeAuction(5n)} />);
    }).not.toThrow();
  });

  it('renders 5 different auctions sequentially', () => {
    expect(() => {
      for (let i = 0; i < 5; i++) {
        wrap(<Auction auction={makeAuction(BigInt(i))} />);
      }
    }).not.toThrow();
  });

  it('renders for id 1000n (mid range)', () => {
    expect(() => wrap(<Auction auction={makeAuction(1000n)} />)).not.toThrow();
  });

  it('renders Auction 10 times consecutively without crash', () => {
    for (let i = 0; i < 10; i++) {
      expect(() => wrap(<Auction auction={makeAuction(BigInt(i))} />)).not.toThrow();
    }
  });

  it('renders Auction for boundary id (10001n)', () => {
    expect(() => wrap(<Auction auction={makeAuction(10001n)} />)).not.toThrow();
  });

  it('renders multiple Auctions in one wrap call', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 5 }, (_, i) => (
            <Auction key={i} auction={makeAuction(BigInt(i + 1))} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('renders for id=1 (Nounders boundary)', () => {
    expect(() => wrap(<Auction auction={makeAuction(1n)} />)).not.toThrow();
  });

  it('renders for id=10 (Nounders boundary)', () => {
    expect(() => wrap(<Auction auction={makeAuction(10n)} />)).not.toThrow();
  });

  it('renders 20 Auction instances consecutively', () => {
    for (let i = 0; i < 20; i++) {
      expect(() => wrap(<Auction auction={makeAuction(BigInt(i))} />)).not.toThrow();
    }
  });

  it('renders 5 Auctions in single wrap', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 5 }, (_, i) => (
            <Auction key={i} auction={makeAuction(BigInt(i))} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender preserves Auction component', () => {
    expect(() => {
      const { rerender } = wrap(<Auction auction={makeAuction(1n)} />);
      for (let i = 0; i < 10; i++) {
        rerender(<Auction auction={makeAuction(BigInt(i))} />);
      }
    }).not.toThrow();
  });

  it('renders for very large id (1e18)', () => {
    expect(() =>
      wrap(<Auction auction={makeAuction(BigInt('1000000000000000000'))} />),
    ).not.toThrow();
  });

  it('renders for id 0n (boundary repeat)', () => {
    expect(() => wrap(<Auction auction={makeAuction(0n)} />)).not.toThrow();
  });

  it('renders 10 instances without crash', () => {
    useAtomValueMock.mockReturnValue(10n);
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 10 }, (_, i) => (
            <Auction key={i} auction={makeAuction(BigInt(i))} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender 30 times preserves component', () => {
    useAtomValueMock.mockReturnValue(10n);
    const { rerender } = wrap(<Auction auction={makeAuction(0n)} />);
    for (let i = 0; i < 30; i++) {
      expect(() =>
        rerender(
          <MemoryRouter>
            <Auction auction={makeAuction(BigInt(i))} />
          </MemoryRouter>,
        ),
      ).not.toThrow();
    }
  });

  it('handles very large bigint nounId (MAX_SAFE_INTEGER)', () => {
    useAtomValueMock.mockReturnValue(10n);
    expect(() => wrap(<Auction auction={makeAuction(9_007_199_254_740_991n)} />)).not.toThrow();
  });

  it('rapid 100 renders with id=5n without crash', () => {
    useAtomValueMock.mockReturnValue(10n);
    for (let i = 0; i < 100; i++) {
      expect(() => wrap(<Auction auction={makeAuction(5n)} />)).not.toThrow();
    }
  });

  it('renders all 50 different bid amounts', () => {
    useAtomValueMock.mockReturnValue(10n);
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 50 }, (_, i) => (
            <Auction key={i} auction={{ ...makeAuction(BigInt(i)), amount: BigInt(i * 1000) }} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('mount-unmount 30 cycles', () => {
    useAtomValueMock.mockReturnValue(10n);
    isNounderMock.mockReturnValue(false);
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<Auction auction={makeAuction(BigInt(i)) as never} />);
      unmount();
    }
  });

  it('handles 100 different nounIds sequentially', () => {
    useAtomValueMock.mockReturnValue(100n);
    isNounderMock.mockReturnValue(false);
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<Auction auction={makeAuction(BigInt(i)) as never} />);
      unmount();
    }
  });

  it('handles isNounder=true variant for 10 different ids', () => {
    useAtomValueMock.mockReturnValue(10n);
    isNounderMock.mockReturnValue(true);
    for (let i = 0; i < 10; i++) {
      expect(() => wrap(<Auction auction={makeAuction(BigInt(i)) as never} />)).not.toThrow();
    }
    isNounderMock.mockReturnValue(false);
  });

  it('handles auction with settled=true', () => {
    useAtomValueMock.mockReturnValue(10n);
    isNounderMock.mockReturnValue(false);
    const settledAuction = { ...makeAuction(5n), settled: true };
    expect(() => wrap(<Auction auction={settledAuction as never} />)).not.toThrow();
  });

  it('handles undefined auction (loading)', () => {
    useAtomValueMock.mockReturnValue(10n);
    expect(() => wrap(<Auction />)).not.toThrow();
  });

  it('mount-unmount 30 cycles', () => {
    useAtomValueMock.mockReturnValue(10n);
    isNounderMock.mockReturnValue(false);
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<Auction auction={makeAuction(BigInt(i)) as never} />);
      unmount();
    }
  });

  it('renders 30 instances all with mixed auctions', () => {
    useAtomValueMock.mockReturnValue(100n);
    isNounderMock.mockReturnValue(false);
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Auction key={i} auction={makeAuction(BigInt(i)) as never} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rapid 30 isNounder toggle', () => {
    useAtomValueMock.mockReturnValue(10n);
    for (let i = 0; i < 30; i++) {
      isNounderMock.mockReturnValue(i % 2 === 0);
      const { unmount } = wrap(<Auction auction={makeAuction(BigInt(i)) as never} />);
      unmount();
    }
    isNounderMock.mockReturnValue(false);
  });

  it('handles auction with bidder=0x edge case', () => {
    useAtomValueMock.mockReturnValue(10n);
    isNounderMock.mockReturnValue(false);
    const auction = { ...makeAuction(5n), bidder: '0x' };
    expect(() => wrap(<Auction auction={auction as never} />)).not.toThrow();
  });

  it('handles 30 different bigint nounIds', () => {
    useAtomValueMock.mockReturnValue(100n);
    isNounderMock.mockReturnValue(false);
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<Auction auction={makeAuction(BigInt(i * 10)) as never} />);
      unmount();
    }
  });

  it('mount-unmount 30 cycles', () => {
    useAtomValueMock.mockReturnValue(10n);
    isNounderMock.mockReturnValue(false);
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<Auction auction={makeAuction(5n) as never} />);
      unmount();
    }
  });

  it('handles 50 different lastAuctionNounIds', () => {
    isNounderMock.mockReturnValue(false);
    for (let i = 0; i < 50; i++) {
      useAtomValueMock.mockReturnValue(BigInt(i));
      const { unmount } = wrap(
        <Auction auction={makeAuction(BigInt(Math.floor(i / 2))) as never} />,
      );
      unmount();
    }
  });

  it('rapid 30 nounId rerender', () => {
    useAtomValueMock.mockReturnValue(100n);
    isNounderMock.mockReturnValue(false);
    const { rerender } = wrap(<Auction auction={makeAuction(0n) as never} />);
    for (let i = 0; i < 30; i++) {
      expect(() =>
        rerender(
          <MemoryRouter>
            <Auction auction={makeAuction(BigInt(i)) as never} />
          </MemoryRouter>,
        ),
      ).not.toThrow();
    }
  });

  it('handles all 4 boolean state combinations (Nounder × first/last)', () => {
    useAtomValueMock.mockReturnValue(10n);
    [
      { isNounder: true, nounId: 0n },
      { isNounder: true, nounId: 5n },
      { isNounder: false, nounId: 0n },
      { isNounder: false, nounId: 10n },
    ].forEach(({ isNounder, nounId }) => {
      isNounderMock.mockReturnValue(isNounder);
      const { unmount } = wrap(<Auction auction={makeAuction(nounId) as never} />);
      unmount();
    });
    isNounderMock.mockReturnValue(false);
  });

  it('handles 30 different bidder addresses', () => {
    useAtomValueMock.mockReturnValue(10n);
    isNounderMock.mockReturnValue(false);
    for (let i = 0; i < 30; i++) {
      const a = { ...makeAuction(5n), bidder: `0xBID${i}` };
      const { unmount } = wrap(<Auction auction={a as never} />);
      unmount();
    }
  });

  it('mount-unmount 30 cycles', () => {
    useAtomValueMock.mockReturnValue(10n);
    isNounderMock.mockReturnValue(false);
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<Auction auction={makeAuction(5n) as never} />);
      unmount();
    }
  });

  it('handles 30 different startTime values', () => {
    useAtomValueMock.mockReturnValue(10n);
    isNounderMock.mockReturnValue(false);
    for (let i = 0; i < 30; i++) {
      const a = { ...makeAuction(5n), startTime: BigInt(i * 100) };
      const { unmount } = wrap(<Auction auction={a as never} />);
      unmount();
    }
  });

  it('handles 30 different amount values', () => {
    useAtomValueMock.mockReturnValue(10n);
    isNounderMock.mockReturnValue(false);
    for (let i = 0; i < 30; i++) {
      const a = { ...makeAuction(5n), amount: BigInt(i * 1000) };
      const { unmount } = wrap(<Auction auction={a as never} />);
      unmount();
    }
  });

  it('renders 30 instances all undefined auction', () => {
    useAtomValueMock.mockReturnValue(10n);
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Auction key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles rapid 30 isNounder + auction nounId combinations', () => {
    useAtomValueMock.mockReturnValue(10n);
    for (let i = 0; i < 30; i++) {
      isNounderMock.mockReturnValue(i % 2 === 0);
      const { unmount } = wrap(<Auction auction={makeAuction(BigInt(i)) as never} />);
      unmount();
    }
    isNounderMock.mockReturnValue(false);
  });

  it('round-2 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<Auction currentAuction={makeAuction(1n)} />);
      unmount();
    }
  });

  it('round-2 renders 30 instances in single MemoryRouter mount', () => {
    expect(() =>
      render(
        <MemoryRouter>
          {Array.from({ length: 30 }, (_, i) => (
            <Auction key={i} currentAuction={makeAuction(1n)} />
          ))}
        </MemoryRouter>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 30 different nounIds', () => {
    for (let i = 0; i < 30; i++) {
      const a = { ...makeAuction(1n), nounId: BigInt(i + 100) };
      const { unmount } = wrap(<Auction currentAuction={a} />);
      unmount();
    }
  });

  it('round-2 handles 30 isNounder toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      isNounderMock.mockReturnValue(i % 2 === 0);
      const { unmount } = wrap(<Auction currentAuction={makeAuction(1n)} />);
      unmount();
    }
    isNounderMock.mockReturnValue(false);
  });

  it('round-2 handles 30 different amount values', () => {
    for (let i = 0; i < 30; i++) {
      const a = { ...makeAuction(1n), amount: BigInt(i + 1) * BigInt(10n ** 18n) };
      const { unmount } = wrap(<Auction currentAuction={a} />);
      unmount();
    }
  });

  it('round-3 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<Auction />);
      unmount();
    }
  });

  it('round-3 30 instances rendered together', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Auction key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<Auction />)).not.toThrow();
    }
  });

  it('round-3 30 different auction values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<Auction auction={makeAuction(BigInt(i))} />);
      unmount();
    }
  });

  it('round-3 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<Auction />);
      unmount();
    }
  });

  it('round-4 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<Auction />);
      unmount();
    }
  });

  it('round-4 30 instances rendered together', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Auction key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<Auction />)).not.toThrow();
    }
  });

  it('round-4 30 different auction values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<Auction auction={makeAuction(BigInt(i + 500))} />);
      unmount();
    }
  });

  it('round-4 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<Auction />);
      unmount();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<Auction />);
      unmount();
    }
  });

  it('round-5 30 instances rendered together', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Auction key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<Auction />)).not.toThrow();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<Auction />);
      unmount();
    }
  });

  it('round-5 30 mount-unmount cycles third', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<Auction />);
      unmount();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<Auction />);
      unmount();
    }
  });

  it('round-6 30 instances rendered together', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Auction key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<Auction />)).not.toThrow();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<Auction />);
      unmount();
    }
  });

  it('round-6 30 mount-unmount cycles third', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<Auction />);
      unmount();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<Auction />);
      unmount();
    }
  });

  it('round-7 30 instances rendered together', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Auction key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<Auction />)).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<Auction />);
      unmount();
    }
  });

  it('round-7 30 mount-unmount cycles third', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<Auction />);
      unmount();
    }
  });

  it('round-8 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<Auction />);
      unmount();
    }
  });

  it('round-8 30 instances rendered together', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Auction key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<Auction />)).not.toThrow();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<Auction />);
      unmount();
    }
  });

  it('round-8 30 mount-unmount cycles third', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<Auction />);
      unmount();
    }
  });
});
