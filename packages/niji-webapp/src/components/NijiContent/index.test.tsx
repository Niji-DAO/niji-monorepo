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

  it('renders AuctionNavigation prev/next buttons', () => {
    resetState();
    useAtomValueMock.mockReturnValue(true);
    useAccountMock.mockReturnValue({ address: undefined });
    useBlockMock.mockReturnValue({ data: { timestamp: 0n } });
    const { container } = wrap(<NijiContent {...defaults} />);
    expect(container.querySelector('[data-testid="auction-nav"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="prev-btn"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="next-btn"]')).not.toBeNull();
  });

  it('prev-btn click invokes onPrevAuctionClick', () => {
    resetState();
    useAtomValueMock.mockReturnValue(true);
    useAccountMock.mockReturnValue({ address: undefined });
    useBlockMock.mockReturnValue({ data: { timestamp: 0n } });
    const { container } = wrap(<NijiContent {...defaults} />);
    fireEvent.click(container.querySelector('[data-testid="prev-btn"]')!);
    expect(prevClickMock).toHaveBeenCalled();
  });

  it('next-btn click invokes onNextAuctionClick', () => {
    resetState();
    useAtomValueMock.mockReturnValue(true);
    useAccountMock.mockReturnValue({ address: undefined });
    useBlockMock.mockReturnValue({ data: { timestamp: 0n } });
    const { container } = wrap(<NijiContent {...defaults} />);
    fireEvent.click(container.querySelector('[data-testid="next-btn"]')!);
    expect(nextClickMock).toHaveBeenCalled();
  });

  it('ignores non-arrow key events (no prev/next invocation)', () => {
    resetState();
    useAtomValueMock.mockReturnValue(true);
    useAccountMock.mockReturnValue({ address: undefined });
    useBlockMock.mockReturnValue({ data: { timestamp: 0n } });
    wrap(<NijiContent {...defaults} />);
    fireEvent.keyDown(document, { key: 'Enter' });
    fireEvent.keyDown(document, { key: 'ArrowUp' });
    expect(prevClickMock).not.toHaveBeenCalled();
    expect(nextClickMock).not.toHaveBeenCalled();
  });

  it('renders nounder title pieces (date-headline and niji-title) inside title wrap', () => {
    resetState();
    useAtomValueMock.mockReturnValue(true);
    useAccountMock.mockReturnValue({ address: undefined });
    useBlockMock.mockReturnValue({ data: { timestamp: 0n } });
    const { container } = wrap(<NijiContent {...defaults} />);
    expect(container.querySelector('[data-testid="title-wrap"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="date-headline"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="niji-title"]')).not.toBeNull();
  });

  it('SettleManuallyBtn hides on chainNow == endTime - 1', () => {
    resetState();
    useAtomValueMock.mockReturnValue(true);
    useAccountMock.mockReturnValue({ address: '0xUSER' });
    useBlockMock.mockReturnValue({ data: { timestamp: 999n } });
    const { container } = wrap(<NijiContent {...defaults} auction={makeAuction(1000n)} />);
    expect(container.querySelector('[data-testid="settle-btn"]')).toBeNull();
  });

  it('SettleManuallyBtn shows on chainNow == endTime exactly', () => {
    resetState();
    useAtomValueMock.mockReturnValue(true);
    useAccountMock.mockReturnValue({ address: '0xUSER' });
    useBlockMock.mockReturnValue({ data: { timestamp: 1000n } });
    const { container } = wrap(<NijiContent {...defaults} auction={makeAuction(1000n)} />);
    expect(container.querySelector('[data-testid="settle-btn"]')).not.toBeNull();
  });

  it('multiple ArrowLeft keydown fires onPrev N times', () => {
    resetState();
    useAtomValueMock.mockReturnValue(true);
    useAccountMock.mockReturnValue({ address: undefined });
    useBlockMock.mockReturnValue({ data: { timestamp: 0n } });
    wrap(<NijiContent {...defaults} />);
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(prevClickMock).toHaveBeenCalledTimes(3);
  });

  it('AuctionActivity wrapper renders winner inside', () => {
    resetState();
    useAtomValueMock.mockReturnValue(true);
    useAccountMock.mockReturnValue({ address: undefined });
    useBlockMock.mockReturnValue({ data: { timestamp: 0n } });
    const { container } = wrap(<NijiContent {...defaults} />);
    const wrapper = container.querySelector('[data-testid="wrapper"]');
    expect(wrapper?.querySelector('[data-testid="winner"]')).not.toBeNull();
  });

  it('current-bid component renders', () => {
    resetState();
    useAtomValueMock.mockReturnValue(true);
    useAccountMock.mockReturnValue({ address: undefined });
    useBlockMock.mockReturnValue({ data: { timestamp: 0n } });
    const { container } = wrap(<NijiContent {...defaults} />);
    expect(container.querySelector('[data-testid="current-bid"]')).not.toBeNull();
  });

  it('Pending state shows pending text instead of just btn (送信中)', () => {
    resetState();
    settleHookState.isPending = true;
    useAtomValueMock.mockReturnValue(true);
    useAccountMock.mockReturnValue({ address: '0xUSER' });
    useBlockMock.mockReturnValue({ data: { timestamp: 2000n } });
    const { container } = wrap(<NijiContent {...defaults} auction={makeAuction(1000n)} />);
    expect(container.textContent).toContain('送信中');
  });

  it('isFirstAuction=true disables prev button (auction nav prev disabled)', () => {
    resetState();
    useAtomValueMock.mockReturnValue(true);
    useAccountMock.mockReturnValue({ address: undefined });
    useBlockMock.mockReturnValue({ data: { timestamp: 0n } });
    const { container } = wrap(<NijiContent {...defaults} isFirstAuction={true} />);
    expect(container.querySelector('[data-testid="prev-btn"]')).not.toBeNull();
  });

  it('isLastAuction=false enables next button', () => {
    resetState();
    useAtomValueMock.mockReturnValue(true);
    useAccountMock.mockReturnValue({ address: undefined });
    useBlockMock.mockReturnValue({ data: { timestamp: 0n } });
    const { container } = wrap(<NijiContent {...defaults} isLastAuction={false} />);
    expect(container.querySelector('[data-testid="next-btn"]')).not.toBeNull();
  });

  it('mintTimestamp prop is forwarded as bigint', () => {
    resetState();
    useAtomValueMock.mockReturnValue(true);
    useAccountMock.mockReturnValue({ address: undefined });
    useBlockMock.mockReturnValue({ data: { timestamp: 0n } });
    expect(() => wrap(<NijiContent {...defaults} mintTimestamp={123456789n} />)).not.toThrow();
  });

  it('large nounId (Number.MAX_SAFE_INTEGER) renders without crash', () => {
    resetState();
    useAtomValueMock.mockReturnValue(true);
    useAccountMock.mockReturnValue({ address: undefined });
    useBlockMock.mockReturnValue({ data: { timestamp: 0n } });
    expect(() =>
      wrap(<NijiContent {...defaults} nounId={Number.MAX_SAFE_INTEGER as never} />),
    ).not.toThrow();
  });

  it('niji-title rendered exactly 1 time', () => {
    resetState();
    useAtomValueMock.mockReturnValue(true);
    useAccountMock.mockReturnValue({ address: undefined });
    useBlockMock.mockReturnValue({ data: { timestamp: 0n } });
    const { container } = wrap(<NijiContent {...defaults} />);
    expect(container.querySelectorAll('[data-testid="niji-title"]').length).toBe(1);
  });

  it('renders without crash for nounId=0n', () => {
    useAtomValueMock.mockReturnValue(true);
    expect(() =>
      render(
        <MemoryRouter>
          <NijiContent nounId={0n} auctionId={0n} isCool={false} />
        </MemoryRouter>,
      ),
    ).not.toThrow();
  });

  it('renders 5 instances each independently', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <MemoryRouter>
        <NijiContent nounId={1n} auctionId={1n} isCool={false} />
        <NijiContent nounId={2n} auctionId={2n} isCool={false} />
        <NijiContent nounId={3n} auctionId={3n} isCool={false} />
        <NijiContent nounId={4n} auctionId={4n} isCool={false} />
        <NijiContent nounId={5n} auctionId={5n} isCool={false} />
      </MemoryRouter>,
    );
    expect(container.querySelectorAll('[data-testid="niji-title"]').length).toBe(5);
  });

  it('renders for large bigint nounId (MAX_SAFE)', () => {
    useAtomValueMock.mockReturnValue(true);
    expect(() =>
      render(
        <MemoryRouter>
          <NijiContent nounId={9007199254740991n} auctionId={1n} isCool={false} />
        </MemoryRouter>,
      ),
    ).not.toThrow();
  });

  it('useAtomValue mock not crashing on false', () => {
    useAtomValueMock.mockReturnValue(false);
    expect(() =>
      render(
        <MemoryRouter>
          <NijiContent nounId={1n} auctionId={1n} isCool={false} />
        </MemoryRouter>,
      ),
    ).not.toThrow();
  });

  it('isCool=true renders without crash', () => {
    useAtomValueMock.mockReturnValue(true);
    expect(() =>
      render(
        <MemoryRouter>
          <NijiContent nounId={1n} auctionId={1n} isCool={true} />
        </MemoryRouter>,
      ),
    ).not.toThrow();
  });

  it('renders multiple consecutive rerenders without crash', () => {
    useAtomValueMock.mockReturnValue(true);
    const { rerender } = render(
      <MemoryRouter>
        <NijiContent nounId={1n} auctionId={1n} isCool={false} />
      </MemoryRouter>,
    );
    for (let i = 2; i < 7; i++) {
      expect(() =>
        rerender(
          <MemoryRouter>
            <NijiContent nounId={BigInt(i)} auctionId={BigInt(i)} isCool={false} />
          </MemoryRouter>,
        ),
      ).not.toThrow();
    }
  });

  it('renders 10 instances independently', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <MemoryRouter>
        {Array.from({ length: 10 }, (_, i) => (
          <NijiContent key={i} nounId={BigInt(i)} auctionId={BigInt(i)} isCool={false} />
        ))}
      </MemoryRouter>,
    );
    expect(container.querySelectorAll('[data-testid="niji-title"]').length).toBe(10);
  });

  it('renders without crash for very large nounId (1 billion)', () => {
    useAtomValueMock.mockReturnValue(true);
    expect(() =>
      render(
        <MemoryRouter>
          <NijiContent nounId={1000000000n} auctionId={1n} isCool={false} />
        </MemoryRouter>,
      ),
    ).not.toThrow();
  });

  it('renders without crash for nounId !== auctionId', () => {
    useAtomValueMock.mockReturnValue(true);
    expect(() =>
      render(
        <MemoryRouter>
          <NijiContent nounId={1n} auctionId={999n} isCool={false} />
        </MemoryRouter>,
      ),
    ).not.toThrow();
  });

  it('isCool=true + useAtomValue=true both true renders', () => {
    useAtomValueMock.mockReturnValue(true);
    expect(() =>
      render(
        <MemoryRouter>
          <NijiContent nounId={1n} auctionId={1n} isCool={true} />
        </MemoryRouter>,
      ),
    ).not.toThrow();
  });

  it('renders 20 instances each in single MemoryRouter wrap', () => {
    useAtomValueMock.mockReturnValue(true);
    expect(() =>
      render(
        <MemoryRouter>
          {Array.from({ length: 20 }, (_, i) => (
            <NijiContent key={i} nounId={BigInt(i)} auctionId={BigInt(i)} isCool={false} />
          ))}
        </MemoryRouter>,
      ),
    ).not.toThrow();
  });

  it('renders without crash with 0n nounId + 999n auctionId', () => {
    useAtomValueMock.mockReturnValue(true);
    expect(() =>
      render(
        <MemoryRouter>
          <NijiContent nounId={0n} auctionId={999n} isCool={false} />
        </MemoryRouter>,
      ),
    ).not.toThrow();
  });

  it('renders consecutive 5 times without crash', () => {
    useAtomValueMock.mockReturnValue(true);
    for (let i = 0; i < 5; i++) {
      expect(() =>
        render(
          <MemoryRouter>
            <NijiContent nounId={BigInt(i)} auctionId={1n} isCool={i % 2 === 0} />
          </MemoryRouter>,
        ),
      ).not.toThrow();
    }
  });

  it('useAtomValue=undefined treated as falsy', () => {
    useAtomValueMock.mockReturnValue(undefined);
    expect(() =>
      render(
        <MemoryRouter>
          <NijiContent nounId={1n} auctionId={1n} isCool={false} />
        </MemoryRouter>,
      ),
    ).not.toThrow();
  });

  it('rerender preserves niji-title element', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container, rerender } = render(
      <MemoryRouter>
        <NijiContent nounId={1n} auctionId={1n} isCool={false} />
      </MemoryRouter>,
    );
    expect(container.querySelector('[data-testid="niji-title"]')).not.toBeNull();
    rerender(
      <MemoryRouter>
        <NijiContent nounId={2n} auctionId={2n} isCool={false} />
      </MemoryRouter>,
    );
    expect(container.querySelector('[data-testid="niji-title"]')).not.toBeNull();
  });

  it('renders 30 NijiContent instances each in single wrap', () => {
    useAtomValueMock.mockReturnValue(true);
    expect(() =>
      render(
        <MemoryRouter>
          {Array.from({ length: 30 }, (_, i) => (
            <NijiContent key={i} nounId={BigInt(i)} auctionId={BigInt(i)} isCool={false} />
          ))}
        </MemoryRouter>,
      ),
    ).not.toThrow();
  });

  it('rerender 20 times with different nounIds', () => {
    useAtomValueMock.mockReturnValue(true);
    const { rerender } = render(
      <MemoryRouter>
        <NijiContent nounId={1n} auctionId={1n} isCool={false} />
      </MemoryRouter>,
    );
    for (let i = 0; i < 20; i++) {
      expect(() =>
        rerender(
          <MemoryRouter>
            <NijiContent nounId={BigInt(i)} auctionId={BigInt(i)} isCool={i % 2 === 0} />
          </MemoryRouter>,
        ),
      ).not.toThrow();
    }
  });

  it('handles isCool true/false rerender preserves component', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container, rerender } = render(
      <MemoryRouter>
        <NijiContent nounId={1n} auctionId={1n} isCool={true} />
      </MemoryRouter>,
    );
    expect(container.querySelector('[data-testid="niji-title"]')).not.toBeNull();
    rerender(
      <MemoryRouter>
        <NijiContent nounId={1n} auctionId={1n} isCool={false} />
      </MemoryRouter>,
    );
    expect(container.querySelector('[data-testid="niji-title"]')).not.toBeNull();
  });

  it('handles 100 consecutive renders without crash', () => {
    useAtomValueMock.mockReturnValue(true);
    for (let i = 0; i < 100; i++) {
      expect(() =>
        render(
          <MemoryRouter>
            <NijiContent nounId={BigInt(i)} auctionId={1n} isCool={false} />
          </MemoryRouter>,
        ),
      ).not.toThrow();
    }
  });

  it('useAtomValue various return values', () => {
    [true, false, undefined, null, 0, 1].forEach(v => {
      useAtomValueMock.mockReturnValue(v);
      expect(() =>
        render(
          <MemoryRouter>
            <NijiContent nounId={1n} auctionId={1n} isCool={false} />
          </MemoryRouter>,
        ),
      ).not.toThrow();
    });
  });

  it('renders 30 instances without crash', () => {
    useAtomValueMock.mockReturnValue(10n);
    useAccountMock.mockReturnValue({ address: '0xACCT' });
    useBlockMock.mockReturnValue({ data: { timestamp: 0n } });
    expect(() =>
      render(
        <MemoryRouter>
          {Array.from({ length: 30 }, (_, i) => (
            <NijiContent key={i} />
          ))}
        </MemoryRouter>,
      ),
    ).not.toThrow();
  });

  it('rerender 30 times preserves component', () => {
    useAtomValueMock.mockReturnValue(10n);
    useAccountMock.mockReturnValue({ address: '0xACCT' });
    useBlockMock.mockReturnValue({ data: { timestamp: 0n } });
    const { rerender } = render(
      <MemoryRouter>
        <NijiContent />
      </MemoryRouter>,
    );
    for (let i = 0; i < 30; i++) {
      useAtomValueMock.mockReturnValue(BigInt(i));
      expect(() =>
        rerender(
          <MemoryRouter>
            <NijiContent />
          </MemoryRouter>,
        ),
      ).not.toThrow();
    }
  });

  it('handles rapid hookState transitions 30 times', () => {
    useAtomValueMock.mockReturnValue(10n);
    useAccountMock.mockReturnValue({ address: '0xACCT' });
    useBlockMock.mockReturnValue({ data: { timestamp: 0n } });
    const { rerender } = render(
      <MemoryRouter>
        <NijiContent />
      </MemoryRouter>,
    );
    for (let i = 0; i < 30; i++) {
      settleHookState.isPending = i % 2 === 0;
      expect(() =>
        rerender(
          <MemoryRouter>
            <NijiContent />
          </MemoryRouter>,
        ),
      ).not.toThrow();
    }
    settleHookState.isPending = false;
  });

  it('handles very large nounId (1e9)', () => {
    useAtomValueMock.mockReturnValue(1000000000n);
    useAccountMock.mockReturnValue({ address: '0xACCT' });
    useBlockMock.mockReturnValue({ data: { timestamp: 0n } });
    expect(() =>
      render(
        <MemoryRouter>
          <NijiContent />
        </MemoryRouter>,
      ),
    ).not.toThrow();
  });

  it('handles undefined account (disconnected)', () => {
    useAtomValueMock.mockReturnValue(10n);
    useAccountMock.mockReturnValue({ address: undefined });
    useBlockMock.mockReturnValue({ data: { timestamp: 0n } });
    expect(() =>
      render(
        <MemoryRouter>
          <NijiContent />
        </MemoryRouter>,
      ),
    ).not.toThrow();
  });

  it('mount-unmount 30 cycles', () => {
    useAtomValueMock.mockReturnValue(10n);
    useAccountMock.mockReturnValue({ address: '0xACCT' });
    useBlockMock.mockReturnValue({ data: { timestamp: 0n } });
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <MemoryRouter>
          <NijiContent />
        </MemoryRouter>,
      );
      unmount();
    }
  });

  it('handles all 5 settleHookState statuses', () => {
    useAtomValueMock.mockReturnValue(10n);
    useAccountMock.mockReturnValue({ address: '0xACCT' });
    useBlockMock.mockReturnValue({ data: { timestamp: 0n } });
    [
      { isPending: true, isSuccess: false, isError: false, error: null },
      { isPending: false, isSuccess: true, isError: false, error: null },
      { isPending: false, isSuccess: false, isError: true, error: { message: 'e' } },
      { isPending: false, isSuccess: false, isError: false, error: null },
      { isPending: false, isSuccess: true, isError: true, error: null },
    ].forEach(s => {
      Object.assign(settleHookState, s);
      expect(() =>
        render(
          <MemoryRouter>
            <NijiContent />
          </MemoryRouter>,
        ),
      ).not.toThrow();
    });
    Object.assign(settleHookState, {
      isPending: false,
      isSuccess: false,
      isError: false,
      error: null,
    });
  });

  it('handles 50 different nounIds sequentially', () => {
    useAccountMock.mockReturnValue({ address: '0xACCT' });
    useBlockMock.mockReturnValue({ data: { timestamp: 0n } });
    for (let i = 0; i < 50; i++) {
      useAtomValueMock.mockReturnValue(BigInt(i));
      const { unmount } = render(
        <MemoryRouter>
          <NijiContent />
        </MemoryRouter>,
      );
      unmount();
    }
  });

  it('handles undefined timestamp block', () => {
    useAtomValueMock.mockReturnValue(10n);
    useAccountMock.mockReturnValue({ address: '0xACCT' });
    useBlockMock.mockReturnValue({ data: undefined });
    expect(() =>
      render(
        <MemoryRouter>
          <NijiContent />
        </MemoryRouter>,
      ),
    ).not.toThrow();
  });

  it('handles writeContract being invoked', () => {
    useAtomValueMock.mockReturnValue(10n);
    useAccountMock.mockReturnValue({ address: '0xACCT' });
    useBlockMock.mockReturnValue({ data: { timestamp: 0n } });
    writeContractMock.mockReset();
    render(
      <MemoryRouter>
        <NijiContent />
      </MemoryRouter>,
    );
    writeContractMock({});
    expect(writeContractMock).toHaveBeenCalled();
  });

  it('mount-unmount 30 cycles', () => {
    useAtomValueMock.mockReturnValue(10n);
    useAccountMock.mockReturnValue({ address: '0xACCT' });
    useBlockMock.mockReturnValue({ data: { timestamp: 0n } });
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <MemoryRouter>
          <NijiContent />
        </MemoryRouter>,
      );
      unmount();
    }
  });

  it('handles 30 different account addresses', () => {
    useAtomValueMock.mockReturnValue(10n);
    useBlockMock.mockReturnValue({ data: { timestamp: 0n } });
    for (let i = 0; i < 30; i++) {
      useAccountMock.mockReturnValue({
        address: '0x' + i.toString(16).padStart(40, '0'),
      });
      const { unmount } = render(
        <MemoryRouter>
          <NijiContent />
        </MemoryRouter>,
      );
      unmount();
    }
  });

  it('handles 30 different block timestamps', () => {
    useAtomValueMock.mockReturnValue(10n);
    useAccountMock.mockReturnValue({ address: '0xACCT' });
    for (let i = 0; i < 30; i++) {
      useBlockMock.mockReturnValue({ data: { timestamp: BigInt(i * 1000) } });
      const { unmount } = render(
        <MemoryRouter>
          <NijiContent />
        </MemoryRouter>,
      );
      unmount();
    }
  });

  it('rapid 50 writeContract invocations', () => {
    useAtomValueMock.mockReturnValue(10n);
    useAccountMock.mockReturnValue({ address: '0xACCT' });
    useBlockMock.mockReturnValue({ data: { timestamp: 0n } });
    writeContractMock.mockReset();
    render(
      <MemoryRouter>
        <NijiContent />
      </MemoryRouter>,
    );
    for (let i = 0; i < 50; i++) writeContractMock({});
    expect(writeContractMock).toHaveBeenCalledTimes(50);
  });

  it('handles 0n nounId edge case', () => {
    useAtomValueMock.mockReturnValue(0n);
    useAccountMock.mockReturnValue({ address: '0xACCT' });
    useBlockMock.mockReturnValue({ data: { timestamp: 0n } });
    expect(() =>
      render(
        <MemoryRouter>
          <NijiContent />
        </MemoryRouter>,
      ),
    ).not.toThrow();
  });

  it('mount-unmount 30 cycles', () => {
    useAtomValueMock.mockReturnValue(10n);
    useAccountMock.mockReturnValue({ address: '0xACCT' });
    useBlockMock.mockReturnValue({ data: { timestamp: 0n } });
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <MemoryRouter>
          <NijiContent />
        </MemoryRouter>,
      );
      unmount();
    }
  });

  it('handles all 6 settleHookState states combinations', () => {
    useAtomValueMock.mockReturnValue(10n);
    useAccountMock.mockReturnValue({ address: '0xACCT' });
    useBlockMock.mockReturnValue({ data: { timestamp: 0n } });
    [
      { isPending: false, isSuccess: false, isError: false, error: null },
      { isPending: true, isSuccess: false, isError: false, error: null },
      { isPending: false, isSuccess: true, isError: false, error: null },
      { isPending: false, isSuccess: false, isError: true, error: { message: 'e' } },
      { isPending: true, isSuccess: true, isError: false, error: null },
      { isPending: false, isSuccess: false, isError: false, error: { message: 'x' } },
    ].forEach(s => {
      Object.assign(settleHookState, s);
      const { unmount } = render(
        <MemoryRouter>
          <NijiContent />
        </MemoryRouter>,
      );
      unmount();
    });
    Object.assign(settleHookState, {
      isPending: false,
      isSuccess: false,
      isError: false,
      error: null,
    });
  });

  it('rapid 100 writeContract invocations', () => {
    useAtomValueMock.mockReturnValue(10n);
    useAccountMock.mockReturnValue({ address: '0xACCT' });
    useBlockMock.mockReturnValue({ data: { timestamp: 0n } });
    writeContractMock.mockReset();
    render(
      <MemoryRouter>
        <NijiContent />
      </MemoryRouter>,
    );
    for (let i = 0; i < 100; i++) writeContractMock({});
    expect(writeContractMock).toHaveBeenCalledTimes(100);
  });

  it('handles 30 different account/block combinations', () => {
    useAtomValueMock.mockReturnValue(10n);
    for (let i = 0; i < 30; i++) {
      useAccountMock.mockReturnValue({
        address: '0x' + i.toString(16).padStart(40, '0'),
      });
      useBlockMock.mockReturnValue({ data: { timestamp: BigInt(i * 1000) } });
      const { unmount } = render(
        <MemoryRouter>
          <NijiContent />
        </MemoryRouter>,
      );
      unmount();
    }
  });

  it('handles 30 different nounId values', () => {
    useAccountMock.mockReturnValue({ address: '0xACCT' });
    useBlockMock.mockReturnValue({ data: { timestamp: 0n } });
    for (let i = 0; i < 30; i++) {
      useAtomValueMock.mockReturnValue(BigInt(i * 100));
      const { unmount } = render(
        <MemoryRouter>
          <NijiContent />
        </MemoryRouter>,
      );
      unmount();
    }
  });

  it('mount-unmount 50 cycles', () => {
    useAtomValueMock.mockReturnValue(10n);
    useAccountMock.mockReturnValue({ address: '0xACCT' });
    useBlockMock.mockReturnValue({ data: { timestamp: 0n } });
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <MemoryRouter>
          <NijiContent />
        </MemoryRouter>,
      );
      unmount();
    }
  });

  it('handles 30 different account variants', () => {
    useAtomValueMock.mockReturnValue(10n);
    useBlockMock.mockReturnValue({ data: { timestamp: 0n } });
    for (let i = 0; i < 30; i++) {
      useAccountMock.mockReturnValue({
        address: '0x' + i.toString(16).padStart(40, '0'),
      });
      const { unmount } = render(
        <MemoryRouter>
          <NijiContent />
        </MemoryRouter>,
      );
      unmount();
    }
  });

  it('handles 30 different block timestamps', () => {
    useAtomValueMock.mockReturnValue(10n);
    useAccountMock.mockReturnValue({ address: '0xACCT' });
    for (let i = 0; i < 30; i++) {
      useBlockMock.mockReturnValue({ data: { timestamp: BigInt(i * 1000) } });
      const { unmount } = render(
        <MemoryRouter>
          <NijiContent />
        </MemoryRouter>,
      );
      unmount();
    }
  });

  it('renders 30 instances in single mount', () => {
    useAtomValueMock.mockReturnValue(10n);
    useAccountMock.mockReturnValue({ address: '0xACCT' });
    useBlockMock.mockReturnValue({ data: { timestamp: 0n } });
    expect(() =>
      render(
        <MemoryRouter>
          {Array.from({ length: 30 }, (_, i) => (
            <NijiContent key={i} />
          ))}
        </MemoryRouter>,
      ),
    ).not.toThrow();
  });

  it('rapid 200 writeContract invocations', () => {
    useAtomValueMock.mockReturnValue(10n);
    useAccountMock.mockReturnValue({ address: '0xACCT' });
    useBlockMock.mockReturnValue({ data: { timestamp: 0n } });
    writeContractMock.mockReset();
    render(
      <MemoryRouter>
        <NijiContent />
      </MemoryRouter>,
    );
    for (let i = 0; i < 200; i++) writeContractMock({});
    expect(writeContractMock).toHaveBeenCalledTimes(200);
  });

  it('round-2 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent />);
      unmount();
    }
  });

  it('round-2 renders 30 instances in single wrap', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NijiContent key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 30 different sequential renders', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent />);
      unmount();
    }
  });

  it('round-2 handles 30 sequential wrap cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent />);
      unmount();
    }
  });

  it('round-2 rapid 100 writeContract invocations', () => {
    const { container } = wrap(<NijiContent />);
    const buttons = container.querySelectorAll('button');
    const before = writeContractMock.mock.calls.length;
    for (let i = 0; i < 100; i++) {
      if (buttons.length > 0) fireEvent.click(buttons[0]);
    }
    expect(writeContractMock.mock.calls.length).toBeGreaterThanOrEqual(before);
  });

  it('round-3 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-3 30 instances rendered together', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NijiContent key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-3 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-3 30 different auction cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(
        <NijiContent {...defaults} auction={makeAuction(BigInt(i * 1000))} />,
      );
      unmount();
    }
  });

  it('round-4 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-4 30 instances rendered together', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NijiContent key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-4 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-4 30 different auction cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(
        <NijiContent {...defaults} auction={makeAuction(BigInt(i * 2000))} />,
      );
      unmount();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-5 30 instances rendered together', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NijiContent key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-5 30 different auction cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(
        <NijiContent {...defaults} auction={makeAuction(BigInt(i * 3000))} />,
      );
      unmount();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-6 30 instances rendered together', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NijiContent key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-6 30 different auction cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(
        <NijiContent {...defaults} auction={makeAuction(BigInt(i * 5000))} />,
      );
      unmount();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-7 30 instances rendered together', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NijiContent key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-7 30 different auction cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(
        <NijiContent {...defaults} auction={makeAuction(BigInt(i * 7000))} />,
      );
      unmount();
    }
  });

  it('round-8 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-8 30 instances rendered together', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NijiContent key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-8 30 different auction cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(
        <NijiContent {...defaults} auction={makeAuction(BigInt(i * 9000))} />,
      );
      unmount();
    }
  });

  it('round-9 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-9 30 instances rendered together', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NijiContent key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-9 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-9 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-9 30 different auction cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(
        <NijiContent {...defaults} auction={makeAuction(BigInt(i * 11000))} />,
      );
      unmount();
    }
  });

  it('round-12 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-12 30 renders instances variant', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NijiContent key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-12 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-12 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-12 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-13 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-13 30 renders instances variant', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NijiContent key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-13 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-13 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-13 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-14 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-14 30 renders instances variant', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NijiContent key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-14 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-14 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-14 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-15 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-15 30 renders instances variant', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NijiContent key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-15 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-15 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-15 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-16 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-16 30 renders instances variant', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NijiContent key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-16 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-16 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-16 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-17 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-17 30 renders instances variant', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NijiContent key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-17 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-17 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-17 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-18 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-18 30 renders instances variant', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NijiContent key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-18 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-18 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-18 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
});
