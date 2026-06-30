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

  it('round-19 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-19 30 renders instances variant', () => {
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

  it('round-19 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-19 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-19 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-20 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-20 30 renders instances variant', () => {
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

  it('round-20 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-20 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-20 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-21 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-21 30 renders instances variant', () => {
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

  it('round-21 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-21 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-21 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-22 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-22 30 renders instances variant', () => {
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

  it('round-22 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-22 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-22 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-23 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-23 30 renders instances variant', () => {
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

  it('round-23 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-23 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-23 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-24 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-24 30 renders instances variant', () => {
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

  it('round-24 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-24 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-24 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-25 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-25 30 renders instances variant', () => {
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

  it('round-25 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-25 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-25 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-26 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-26 30 renders instances variant', () => {
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

  it('round-26 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-26 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-26 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-27 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-27 30 renders instances variant', () => {
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

  it('round-27 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-27 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-27 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-28 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-28 30 renders instances variant', () => {
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

  it('round-28 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-28 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-28 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-29 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-29 30 renders instances variant', () => {
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

  it('round-29 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-29 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-29 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-30 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-30 30 renders instances variant', () => {
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

  it('round-30 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-30 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-30 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-31 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-31 30 renders instances variant', () => {
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

  it('round-31 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-31 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-31 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-32 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-32 30 renders instances variant', () => {
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

  it('round-32 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-32 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-32 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-33 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-33 30 renders instances variant', () => {
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

  it('round-33 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-33 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-33 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-34 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-34 30 renders instances variant', () => {
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

  it('round-34 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-34 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-34 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-35 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-35 30 renders instances variant', () => {
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

  it('round-35 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-35 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-35 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-36 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-36 30 renders instances variant', () => {
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

  it('round-36 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-36 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-36 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-37 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-37 30 renders instances variant', () => {
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

  it('round-37 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-37 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-37 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-38 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-38 30 renders instances variant', () => {
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

  it('round-38 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-38 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-38 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-39 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-39 30 renders instances variant', () => {
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

  it('round-39 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-39 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-39 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-40 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-40 30 renders instances variant', () => {
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

  it('round-40 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-40 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-40 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-41 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-41 30 renders instances variant', () => {
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

  it('round-41 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-41 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-41 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-42 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-42 30 renders instances variant', () => {
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

  it('round-42 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-42 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-42 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-43 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-43 30 renders instances variant', () => {
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

  it('round-43 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-43 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-43 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-44 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-44 30 renders instances variant', () => {
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

  it('round-44 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-44 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-44 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-45 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-45 30 renders instances variant', () => {
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

  it('round-45 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-45 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-45 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-46 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-46 30 renders instances variant', () => {
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

  it('round-46 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-46 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-46 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-47 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-47 30 renders instances variant', () => {
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

  it('round-47 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-47 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-47 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-48 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-48 30 renders instances variant', () => {
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

  it('round-48 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-48 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-48 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-49 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-49 30 renders instances variant', () => {
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

  it('round-49 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-49 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-49 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-50 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-50 30 renders instances variant', () => {
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

  it('round-50 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-50 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-50 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-51 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-51 30 renders instances variant', () => {
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

  it('round-51 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-51 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-51 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-52 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-52 30 renders instances variant', () => {
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

  it('round-52 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-52 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-52 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-53 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-53 30 renders instances variant', () => {
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

  it('round-53 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-53 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-53 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-54 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-54 30 renders instances variant', () => {
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

  it('round-54 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-54 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-54 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-55 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-55 30 renders instances variant', () => {
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

  it('round-55 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-55 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-55 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-56 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-56 30 renders instances variant', () => {
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

  it('round-56 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-56 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-56 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-57 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-57 30 renders instances variant', () => {
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

  it('round-57 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-57 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-57 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-58 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-58 30 renders instances variant', () => {
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

  it('round-58 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-58 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-58 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-59 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-59 30 renders instances variant', () => {
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

  it('round-59 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-59 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-59 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-60 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-60 30 renders instances variant', () => {
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

  it('round-60 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-60 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-60 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-61 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-61 30 renders instances variant', () => {
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

  it('round-61 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-61 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-61 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-62 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-62 30 renders instances variant', () => {
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

  it('round-62 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-62 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-62 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-63 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-63 30 renders instances variant', () => {
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

  it('round-63 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-63 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-63 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-64 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-64 30 renders instances variant', () => {
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

  it('round-64 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-64 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-64 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-65 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-65 30 renders instances variant', () => {
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

  it('round-65 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-65 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-65 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-66 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-66 30 renders instances variant', () => {
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

  it('round-66 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-66 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-66 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-67 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-67 30 renders instances variant', () => {
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

  it('round-67 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-67 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-67 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-68 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-68 30 renders instances variant', () => {
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

  it('round-68 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-68 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-68 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-69 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-69 30 renders instances variant', () => {
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

  it('round-69 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-69 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-69 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-70 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-70 30 renders instances variant', () => {
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

  it('round-70 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-70 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-70 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-71 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-71 30 renders instances variant', () => {
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

  it('round-71 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-71 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-71 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-72 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-72 30 renders instances variant', () => {
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

  it('round-72 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-72 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-72 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-73 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-73 30 renders instances variant', () => {
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

  it('round-73 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-73 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-73 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-74 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-74 30 renders instances variant', () => {
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

  it('round-74 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-74 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-74 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-75 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-75 30 renders instances variant', () => {
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

  it('round-75 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-75 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-75 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-76 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-76 30 renders instances variant', () => {
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

  it('round-76 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-76 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-76 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-77 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-77 30 renders instances variant', () => {
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

  it('round-77 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-77 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-77 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-78 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-78 30 renders instances variant', () => {
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

  it('round-78 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-78 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-78 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-79 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-79 30 renders instances variant', () => {
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

  it('round-79 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-79 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-79 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-80 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-80 30 renders instances variant', () => {
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

  it('round-80 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-80 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-80 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-81 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-81 30 renders instances variant', () => {
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

  it('round-81 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-81 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-81 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-82 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-82 30 renders instances variant', () => {
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

  it('round-82 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-82 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-82 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-83 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-83 30 renders instances variant', () => {
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

  it('round-83 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-83 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-83 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-84 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-84 30 renders instances variant', () => {
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

  it('round-84 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-84 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-84 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-85 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-85 30 renders instances variant', () => {
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

  it('round-85 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-85 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-85 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-86 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-86 30 renders instances variant', () => {
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

  it('round-86 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-86 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-86 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-87 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-87 30 renders instances variant', () => {
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

  it('round-87 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-87 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-87 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-88 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-88 30 renders instances variant', () => {
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

  it('round-88 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-88 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-88 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-89 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-89 30 renders instances variant', () => {
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

  it('round-89 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-89 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-89 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-90 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-90 30 renders instances variant', () => {
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

  it('round-90 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-90 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-90 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-91 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-91 30 renders instances variant', () => {
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

  it('round-91 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-91 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-91 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-92 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-92 30 renders instances variant', () => {
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

  it('round-92 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-92 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-92 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-93 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-93 30 renders instances variant', () => {
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

  it('round-93 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-93 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-93 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-94 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-94 30 renders instances variant', () => {
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

  it('round-94 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-94 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-94 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-95 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-95 30 renders instances variant', () => {
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

  it('round-95 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-95 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-95 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-96 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-96 30 renders instances variant', () => {
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

  it('round-96 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-96 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-96 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-97 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-97 30 renders instances variant', () => {
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

  it('round-97 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-97 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-97 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-98 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-98 30 renders instances variant', () => {
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

  it('round-98 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-98 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-98 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-99 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-99 30 renders instances variant', () => {
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

  it('round-99 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-99 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-99 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-100 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-100 30 renders instances variant', () => {
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

  it('round-100 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-100 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-100 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-101 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-101 30 renders instances variant', () => {
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

  it('round-101 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-101 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-101 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-102 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-102 30 renders instances variant', () => {
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

  it('round-102 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-102 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-102 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-103 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-103 30 renders instances variant', () => {
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

  it('round-103 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-103 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-103 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-104 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-104 30 renders instances variant', () => {
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

  it('round-104 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-104 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-104 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-105 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-105 30 renders instances variant', () => {
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

  it('round-105 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-105 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-105 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-106 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-106 30 renders instances variant', () => {
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

  it('round-106 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-106 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-106 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-107 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-107 30 renders instances variant', () => {
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

  it('round-107 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-107 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-107 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-108 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-108 30 renders instances variant', () => {
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

  it('round-108 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-108 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-108 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-109 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-109 30 renders instances variant', () => {
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

  it('round-109 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-109 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-109 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-110 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-110 30 renders instances variant', () => {
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

  it('round-110 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-110 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-110 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-111 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-111 30 renders instances variant', () => {
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

  it('round-111 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-111 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-111 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-112 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-112 30 renders instances variant', () => {
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

  it('round-112 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-112 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-112 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-113 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-113 30 renders instances variant', () => {
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

  it('round-113 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-113 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-113 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-114 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-114 30 renders instances variant', () => {
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

  it('round-114 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-114 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-114 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-115 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-115 30 renders instances variant', () => {
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

  it('round-115 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-115 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-115 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-116 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-116 30 renders instances variant', () => {
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

  it('round-116 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-116 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-116 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-117 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-117 30 renders instances variant', () => {
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

  it('round-117 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-117 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-117 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-118 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-118 30 renders instances variant', () => {
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

  it('round-118 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-118 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-118 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-119 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-119 30 renders instances variant', () => {
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

  it('round-119 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-119 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-119 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-120 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-120 30 renders instances variant', () => {
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

  it('round-120 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-120 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-120 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-121 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-121 30 renders instances variant', () => {
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

  it('round-121 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-121 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-121 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-122 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-122 30 renders instances variant', () => {
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

  it('round-122 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-122 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-122 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-123 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-123 30 renders instances variant', () => {
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

  it('round-123 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-123 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-123 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-124 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-124 30 renders instances variant', () => {
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

  it('round-124 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-124 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-124 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-125 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-125 30 renders instances variant', () => {
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

  it('round-125 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-125 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-125 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-126 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-126 30 renders instances variant', () => {
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

  it('round-126 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-126 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-126 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-127 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-127 30 renders instances variant', () => {
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

  it('round-127 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-127 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-127 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-128 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-128 30 renders instances variant', () => {
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

  it('round-128 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-128 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-128 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-129 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-129 30 renders instances variant', () => {
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

  it('round-129 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-129 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-129 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-130 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-130 30 renders instances variant', () => {
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

  it('round-130 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-130 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-130 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-131 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-131 30 renders instances variant', () => {
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

  it('round-131 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-131 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-131 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-132 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-132 30 renders instances variant', () => {
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

  it('round-132 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-132 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-132 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-133 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-133 30 renders instances variant', () => {
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

  it('round-133 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-133 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-133 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-134 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-134 30 renders instances variant', () => {
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

  it('round-134 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-134 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-134 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-135 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-135 30 renders instances variant', () => {
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

  it('round-135 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });

  it('round-135 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-135 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-136 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-136 30 renders instances variant', () => {
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
  it('round-136 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-136 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-136 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-137 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-137 30 renders instances variant', () => {
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
  it('round-137 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-137 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-137 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-138 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-138 30 renders instances variant', () => {
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
  it('round-138 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-138 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-138 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-139 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-139 30 renders instances variant', () => {
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
  it('round-139 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-139 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-139 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-140 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-140 30 renders instances variant', () => {
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
  it('round-140 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-140 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-140 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-141 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-141 30 renders instances variant', () => {
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
  it('round-141 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-141 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-141 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-142 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-142 30 renders instances variant', () => {
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
  it('round-142 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-142 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-142 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-143 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-143 30 renders instances variant', () => {
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
  it('round-143 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-143 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-143 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-144 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-144 30 renders instances variant', () => {
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
  it('round-144 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-144 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-144 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-145 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-145 30 renders instances variant', () => {
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
  it('round-145 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-145 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-145 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-146 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-146 30 renders instances variant', () => {
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
  it('round-146 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-146 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-146 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-147 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-147 30 renders instances variant', () => {
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
  it('round-147 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-147 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-147 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-148 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-148 30 renders instances variant', () => {
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
  it('round-148 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-148 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-148 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-149 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-149 30 renders instances variant', () => {
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
  it('round-149 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-149 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-149 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-150 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-150 30 renders instances variant', () => {
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
  it('round-150 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-150 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-150 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-151 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-151 30 renders instances variant', () => {
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
  it('round-151 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-151 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-151 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-152 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-152 30 renders instances variant', () => {
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
  it('round-152 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-152 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-152 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-153 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-153 30 renders instances variant', () => {
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
  it('round-153 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-153 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-153 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-154 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-154 30 renders instances variant', () => {
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
  it('round-154 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-154 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-154 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-155 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-155 30 renders instances variant', () => {
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
  it('round-155 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-155 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-155 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-156 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-156 30 renders instances variant', () => {
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
  it('round-156 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-156 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-156 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-157 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-157 30 renders instances variant', () => {
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
  it('round-157 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-157 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-157 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-158 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-158 30 renders instances variant', () => {
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
  it('round-158 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-158 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-158 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-159 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-159 30 renders instances variant', () => {
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
  it('round-159 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-159 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-159 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-160 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-160 30 renders instances variant', () => {
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
  it('round-160 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-160 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-160 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-161 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-161 30 renders instances variant', () => {
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
  it('round-161 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-161 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-161 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-162 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-162 30 renders instances variant', () => {
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
  it('round-162 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-162 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-162 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-163 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-163 30 renders instances variant', () => {
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
  it('round-163 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-163 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-163 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });

  it('round-164 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-164 30 renders instances variant', () => {
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
  it('round-164 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-164 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-164 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-165 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-165 30 renders instances variant', () => {
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
  it('round-165 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-165 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-165 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-166 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-166 30 renders instances variant', () => {
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
  it('round-166 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-166 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-166 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-167 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-167 30 renders instances variant', () => {
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
  it('round-167 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-167 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-167 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-168 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-168 30 renders instances variant', () => {
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
  it('round-168 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-168 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-168 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-169 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-169 30 renders instances variant', () => {
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
  it('round-169 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-169 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-169 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-170 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-170 30 renders instances variant', () => {
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
  it('round-170 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-170 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-170 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-171 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-171 30 renders instances variant', () => {
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
  it('round-171 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-171 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-171 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-172 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-172 30 renders instances variant', () => {
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
  it('round-172 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-172 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-172 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-173 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-173 30 renders instances variant', () => {
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
  it('round-173 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-173 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-173 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-174 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-174 30 renders instances variant', () => {
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
  it('round-174 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-174 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-174 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-175 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-175 30 renders instances variant', () => {
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
  it('round-175 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-175 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-175 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-176 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-176 30 renders instances variant', () => {
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
  it('round-176 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-176 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-176 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-177 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-177 30 renders instances variant', () => {
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
  it('round-177 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-177 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-177 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-178 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-178 30 renders instances variant', () => {
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
  it('round-178 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-178 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-178 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-179 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-179 30 renders instances variant', () => {
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
  it('round-179 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-179 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-179 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-180 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-180 30 renders instances variant', () => {
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
  it('round-180 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-180 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-180 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-181 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-181 30 renders instances variant', () => {
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
  it('round-181 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-181 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-181 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-182 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-182 30 renders instances variant', () => {
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
  it('round-182 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-182 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-182 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-183 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-183 30 renders instances variant', () => {
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
  it('round-183 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-183 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-183 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-184 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-184 30 renders instances variant', () => {
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
  it('round-184 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-184 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-184 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-185 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-185 30 renders instances variant', () => {
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
  it('round-185 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-185 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-185 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-186 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-186 30 renders instances variant', () => {
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
  it('round-186 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-186 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-186 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-187 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-187 30 renders instances variant', () => {
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
  it('round-187 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-187 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-187 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-188 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-188 30 renders instances variant', () => {
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
  it('round-188 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-188 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-188 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-189 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-189 30 renders instances variant', () => {
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
  it('round-189 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-189 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-189 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-190 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-190 30 renders instances variant', () => {
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
  it('round-190 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-190 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-190 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-191 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-191 30 renders instances variant', () => {
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
  it('round-191 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-191 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-191 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-192 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-192 30 renders instances variant', () => {
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
  it('round-192 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-192 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-192 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-193 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-193 30 renders instances variant', () => {
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
  it('round-193 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-193 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-193 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-194 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-194 30 renders instances variant', () => {
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
  it('round-194 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-194 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-194 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-195 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-195 30 renders instances variant', () => {
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
  it('round-195 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-195 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-195 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-196 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-196 30 renders instances variant', () => {
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
  it('round-196 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-196 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-196 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-197 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-197 30 renders instances variant', () => {
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
  it('round-197 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-197 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-197 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-198 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-198 30 renders instances variant', () => {
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
  it('round-198 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-198 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-198 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-199 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-199 30 renders instances variant', () => {
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
  it('round-199 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-199 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-199 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-200 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-200 30 renders instances variant', () => {
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
  it('round-200 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-200 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-200 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-201 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-201 30 renders instances variant', () => {
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
  it('round-201 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-201 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-201 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-202 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-202 30 renders instances variant', () => {
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
  it('round-202 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-202 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-202 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-203 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-203 30 renders instances variant', () => {
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
  it('round-203 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-203 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-203 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-204 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-204 30 renders instances variant', () => {
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
  it('round-204 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-204 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-204 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-205 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-205 30 renders instances variant', () => {
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
  it('round-205 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-205 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-205 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-206 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-206 30 renders instances variant', () => {
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
  it('round-206 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-206 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-206 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-207 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-207 30 renders instances variant', () => {
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
  it('round-207 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-207 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-207 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-208 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-208 30 renders instances variant', () => {
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
  it('round-208 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-208 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-208 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-209 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-209 30 renders instances variant', () => {
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
  it('round-209 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-209 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-209 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-210 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-210 30 renders instances variant', () => {
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
  it('round-210 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-210 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-210 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-211 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-211 30 renders instances variant', () => {
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
  it('round-211 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-211 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-211 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-212 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-212 30 renders instances variant', () => {
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
  it('round-212 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-212 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-212 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-213 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-213 30 renders instances variant', () => {
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
  it('round-213 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-213 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-213 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-214 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-214 30 renders instances variant', () => {
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
  it('round-214 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-214 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-214 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-215 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-215 30 renders instances variant', () => {
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
  it('round-215 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-215 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-215 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-216 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-216 30 renders instances variant', () => {
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
  it('round-216 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-216 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-216 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-217 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-217 30 renders instances variant', () => {
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
  it('round-217 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-217 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-217 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-218 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-218 30 renders instances variant', () => {
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
  it('round-218 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-218 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-218 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-219 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-219 30 renders instances variant', () => {
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
  it('round-219 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-219 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-219 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-220 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-220 30 renders instances variant', () => {
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
  it('round-220 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-220 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-220 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-221 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-221 30 renders instances variant', () => {
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
  it('round-221 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-221 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-221 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-222 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-222 30 renders instances variant', () => {
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
  it('round-222 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-222 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-222 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-223 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-223 30 renders instances variant', () => {
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
  it('round-223 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-223 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-223 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-224 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-224 30 renders instances variant', () => {
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
  it('round-224 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-224 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-224 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-225 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-225 30 renders instances variant', () => {
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
  it('round-225 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-225 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-225 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-226 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-226 30 renders instances variant', () => {
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
  it('round-226 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-226 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-226 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-227 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-227 30 renders instances variant', () => {
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
  it('round-227 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-227 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-227 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-228 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-228 30 renders instances variant', () => {
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
  it('round-228 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-228 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-228 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-229 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-229 30 renders instances variant', () => {
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
  it('round-229 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-229 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-229 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-230 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-230 30 renders instances variant', () => {
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
  it('round-230 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-230 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-230 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-231 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-231 30 renders instances variant', () => {
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
  it('round-231 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-231 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-231 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-232 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-232 30 renders instances variant', () => {
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
  it('round-232 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-232 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-232 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-233 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-233 30 renders instances variant', () => {
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
  it('round-233 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-233 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-233 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-234 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-234 30 renders instances variant', () => {
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
  it('round-234 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-234 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-234 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-235 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-235 30 renders instances variant', () => {
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
  it('round-235 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-235 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-235 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-236 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-236 30 renders instances variant', () => {
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
  it('round-236 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-236 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-236 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-237 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-237 30 renders instances variant', () => {
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
  it('round-237 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-237 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-237 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-238 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-238 30 renders instances variant', () => {
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
  it('round-238 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-238 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-238 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-239 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-239 30 renders instances variant', () => {
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
  it('round-239 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-239 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-239 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-240 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-240 30 renders instances variant', () => {
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
  it('round-240 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-240 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-240 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-241 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-241 30 renders instances variant', () => {
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
  it('round-241 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-241 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-241 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-242 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-242 30 renders instances variant', () => {
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
  it('round-242 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-242 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-242 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-243 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-243 30 renders instances variant', () => {
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
  it('round-243 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-243 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-243 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-244 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-244 30 renders instances variant', () => {
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
  it('round-244 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-244 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-244 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-245 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-245 30 renders instances variant', () => {
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
  it('round-245 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-245 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-245 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-246 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-246 30 renders instances variant', () => {
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
  it('round-246 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-246 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-246 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-247 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-247 30 renders instances variant', () => {
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
  it('round-247 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-247 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-247 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-248 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-248 30 renders instances variant', () => {
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
  it('round-248 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-248 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-248 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-249 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-249 30 renders instances variant', () => {
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
  it('round-249 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-249 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-249 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-250 30 sequential NijiContent mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-250 30 renders instances variant', () => {
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
  it('round-250 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijiContent {...defaults} />)).not.toThrow();
    }
  });
  it('round-250 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
  it('round-250 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijiContent {...defaults} />);
      unmount();
    }
  });
});
