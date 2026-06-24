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
});
