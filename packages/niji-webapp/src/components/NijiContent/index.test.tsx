import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useLingui: () => ({ t: (s: TemplateStringsArray | string) => (Array.isArray(s) ? s[0] : s) }),
}));

const writeContractMock = vi.fn();
const settleHookState: {
  writeContract: typeof writeContractMock;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: { message: string } | null;
} = {
  writeContract: writeContractMock,
  isPending: false,
  isSuccess: false,
  isError: false,
  error: null,
};
vi.mock('@niji/sdk/react', () => ({
  useWriteNijiAuctionHouseSettleCurrentAndCreateNewAuction: () => settleHookState,
}));

const useAtomValueMock = vi.fn();
vi.mock('jotai/react', () => ({
  useAtomValue: () => useAtomValueMock(),
}));

const useAccountMock = vi.fn();
const useBlockMock = vi.fn();
vi.mock('wagmi', () => ({
  useAccount: () => useAccountMock(),
  useBlock: () => useBlockMock(),
}));

const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();
vi.mock('sonner', () => ({
  toast: {
    success: (msg: string) => toastSuccessMock(msg),
    error: (msg: string) => toastErrorMock(msg),
  },
}));

vi.mock('@/components/AuctionActivityDateHeadline', () => ({
  default: () => <span data-testid="date-headline" />,
}));

vi.mock('@/components/AuctionActivityNijiTitle', () => ({
  default: () => <span data-testid="niji-title" />,
}));

vi.mock('@/components/AuctionActivityWrapper', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="wrapper">{children}</div>
  ),
}));

const prevClickMock = vi.fn();
const nextClickMock = vi.fn();
vi.mock('@/components/AuctionNavigation', () => ({
  default: ({
    onPrevAuctionClick,
    onNextAuctionClick,
  }: {
    onPrevAuctionClick: () => void;
    onNextAuctionClick: () => void;
  }) => (
    <div data-testid="auction-nav">
      <button data-testid="prev-btn" onClick={onPrevAuctionClick} />
      <button data-testid="next-btn" onClick={onNextAuctionClick} />
    </div>
  ),
}));

vi.mock('@/components/AuctionTitleAndNavWrapper', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="title-wrap">{children}</div>
  ),
}));

vi.mock('@/components/CurrentBid', () => ({
  default: () => <span data-testid="current-bid" />,
  BID_N_A: 'n/a',
}));

vi.mock('@/components/SettleManuallyBtn', () => ({
  default: ({ settleAuctionHandler }: { settleAuctionHandler: () => void }) => (
    <button data-testid="settle-btn" onClick={settleAuctionHandler} />
  ),
}));

vi.mock('@/components/Winner', () => ({
  default: () => <span data-testid="winner" />,
}));

import NijiContent from './index';

const makeAuction = (endTime: bigint) => ({
  amount: 0n,
  bidder: '0x',
  endTime,
  startTime: 0n,
  nounId: 0n,
  settled: false,
});

const defaults = {
  mintTimestamp: 0n,
  nounId: 0n,
  isFirstAuction: false,
  isLastAuction: true,
  onPrevAuctionClick: prevClickMock,
  onNextAuctionClick: nextClickMock,
};

const wrap = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

const resetState = () => {
  settleHookState.isPending = false;
  settleHookState.isSuccess = false;
  settleHookState.isError = false;
  settleHookState.error = null;
  writeContractMock.mockReset();
  prevClickMock.mockReset();
  nextClickMock.mockReset();
  toastSuccessMock.mockReset();
  toastErrorMock.mockReset();
};

describe('NijiContent', () => {
  it('renders wrapper with title and Nijider winner', () => {
    resetState();
    useAtomValueMock.mockReturnValue(true);
    useAccountMock.mockReturnValue({ address: undefined });
    useBlockMock.mockReturnValue({ data: { timestamp: 0n } });
    const { container } = wrap(<NijiContent {...defaults} />);
    expect(container.querySelector('[data-testid="wrapper"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="winner"]')).not.toBeNull();
  });

  it('hides SettleManuallyBtn when chain time < endTime', () => {
    resetState();
    useAtomValueMock.mockReturnValue(true);
    useAccountMock.mockReturnValue({ address: '0xUSER' });
    useBlockMock.mockReturnValue({ data: { timestamp: 100n } });
    const { container } = wrap(<NijiContent {...defaults} auction={makeAuction(1000n)} />);
    expect(container.querySelector('[data-testid="settle-btn"]')).toBeNull();
  });

  it('shows SettleManuallyBtn when chainNow >= endTime and wallet connected', () => {
    resetState();
    useAtomValueMock.mockReturnValue(true);
    useAccountMock.mockReturnValue({ address: '0xUSER' });
    useBlockMock.mockReturnValue({ data: { timestamp: 2000n } });
    const { container } = wrap(<NijiContent {...defaults} auction={makeAuction(1000n)} />);
    expect(container.querySelector('[data-testid="settle-btn"]')).not.toBeNull();
  });

  it('hides SettleManuallyBtn when wallet is disconnected even if ended', () => {
    resetState();
    useAtomValueMock.mockReturnValue(true);
    useAccountMock.mockReturnValue({ address: undefined });
    useBlockMock.mockReturnValue({ data: { timestamp: 2000n } });
    const { container } = wrap(<NijiContent {...defaults} auction={makeAuction(1000n)} />);
    expect(container.querySelector('[data-testid="settle-btn"]')).toBeNull();
  });

  it('shows "送信中" pending text while settling', () => {
    resetState();
    settleHookState.isPending = true;
    useAtomValueMock.mockReturnValue(true);
    useAccountMock.mockReturnValue({ address: '0xUSER' });
    useBlockMock.mockReturnValue({ data: { timestamp: 2000n } });
    const { container } = wrap(<NijiContent {...defaults} auction={makeAuction(1000n)} />);
    expect(container.textContent).toContain('送信中');
  });

  it('invokes onPrevAuctionClick on ArrowLeft keydown', () => {
    resetState();
    useAtomValueMock.mockReturnValue(true);
    useAccountMock.mockReturnValue({ address: undefined });
    useBlockMock.mockReturnValue({ data: { timestamp: 0n } });
    wrap(<NijiContent {...defaults} />);
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(prevClickMock).toHaveBeenCalled();
  });

  it('invokes onNextAuctionClick on ArrowRight keydown', () => {
    resetState();
    useAtomValueMock.mockReturnValue(true);
    useAccountMock.mockReturnValue({ address: undefined });
    useBlockMock.mockReturnValue({ data: { timestamp: 0n } });
    wrap(<NijiContent {...defaults} />);
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(nextClickMock).toHaveBeenCalled();
  });

  it('renders Learn more link to /nounders', () => {
    resetState();
    useAtomValueMock.mockReturnValue(true);
    useAccountMock.mockReturnValue({ address: undefined });
    useBlockMock.mockReturnValue({ data: { timestamp: 0n } });
    const { container } = wrap(<NijiContent {...defaults} />);
    expect(container.querySelector('a[href="/nounders"]')).not.toBeNull();
  });

  it('settle button triggers writeContract call', () => {
    resetState();
    useAtomValueMock.mockReturnValue(true);
    useAccountMock.mockReturnValue({ address: '0xUSER' });
    useBlockMock.mockReturnValue({ data: { timestamp: 2000n } });
    const { container } = wrap(<NijiContent {...defaults} auction={makeAuction(1000n)} />);
    fireEvent.click(container.querySelector('[data-testid="settle-btn"]')!);
    expect(writeContractMock).toHaveBeenCalledWith({});
  });
});
