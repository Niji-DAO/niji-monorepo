import React from 'react';

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@niji/sdk/react', () => ({
  nijiAuctionHouseAddress: { 1: '0xAUCTIONHOUSE' },
}));

vi.mock('@/wagmi', () => ({
  defaultChain: { id: 1 },
}));

vi.mock('@/components/ShortAddress', () => ({
  default: ({ address }: { address: string }) => (
    <span data-testid="short-address">{address.slice(0, 6)}</span>
  ),
}));

vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/hooks/useActivateLocale', () => ({
  useActiveLocale: () => 'en-US',
}));

vi.mock('@/state/atoms/applicationAtom', () => ({
  isCoolBackgroundAtom: 'MOCK_ATOM',
}));

vi.mock('jotai/react', () => ({
  useAtomValue: () => false,
}));

vi.mock('wagmi', () => ({
  useAccount: () => ({ address: undefined }),
}));

vi.mock('@/utils/etherscan', () => ({
  buildEtherscanAddressLink: (addr: string) => `https://etherscan.io/address/${addr}`,
}));

import { WithProviders } from '@/test-utils/providers';

import Winner from './index';

describe('Winner (Issue #3055)', () => {
  it('renders ShortAddress avatar when winner is a normal wallet (regression baseline)', () => {
    const { container } = render(
      <Winner winner={'0xBIDDER0000000000000000000000000000000BEEF'} />,
      {
        wrapper: WithProviders,
      },
    );
    expect(container.querySelector('[data-testid="short-address"]')).not.toBeNull();
    expect(container.textContent).not.toContain('Waiting for bid');
  });

  it('renders "Waiting for bid" text when winner equals auction house address', () => {
    const { container } = render(<Winner winner={'0xAUCTIONHOUSE'} />, { wrapper: WithProviders });
    expect(container.textContent).toContain('Waiting for bid');
    expect(container.querySelector('[data-testid="short-address"]')).toBeNull();
  });

  it('case-insensitive comparison still maps to "Waiting for bid" branch', () => {
    const { container } = render(<Winner winner={'0xauctionhouse'} />, { wrapper: WithProviders });
    expect(container.textContent).toContain('Waiting for bid');
    expect(container.querySelector('[data-testid="short-address"]')).toBeNull();
  });

  it('renders niji.eth link when isNounders is true (Nounders auction preserved)', () => {
    const { container } = render(<Winner winner={'0xAUCTIONHOUSE'} isNounders={true} />, {
      wrapper: WithProviders,
    });
    expect(container.textContent).toContain('niji.eth');
    expect(container.textContent).not.toContain('Waiting for bid');
    expect(container.querySelector('[data-testid="short-address"]')).toBeNull();
  });

  it('renders niji.eth link when isNounders is true even for normal wallet', () => {
    const { container } = render(
      <Winner winner={'0xBIDDER0000000000000000000000000000000BEEF'} isNounders={true} />,
      { wrapper: WithProviders },
    );
    expect(container.textContent).toContain('niji.eth');
    expect(container.querySelector('[data-testid="short-address"]')).toBeNull();
  });

  it('renders label "Winner" heading', () => {
    const { container } = render(<Winner winner={'0xBIDDER'} />, { wrapper: WithProviders });
    expect(container.textContent).toContain('Winner');
  });

  it('does not render avatar (ShortAddress) on auction house branch', () => {
    const { container } = render(<Winner winner={'0xAUCTIONHOUSE'} />, { wrapper: WithProviders });
    expect(container.querySelector('[data-testid="short-address"]')).toBeNull();
  });

  it('renders auction house branch with empty state (span) not avatar (div)', () => {
    const { container } = render(<Winner winner={'0xAUCTIONHOUSE'} />, { wrapper: WithProviders });
    // 「入札待ち」 表示は <span> element、 avatar (div) 存在しない
    const spans = Array.from(container.querySelectorAll('span'));
    const waitingSpan = spans.find(s => s.textContent === 'Waiting for bid');
    expect(waitingSpan).not.toBeUndefined();
  });

  it('renders auction house branch when winner exactly matches (mixed casing address)', () => {
    const { container } = render(<Winner winner={'0xAuctionHouse'} />, { wrapper: WithProviders });
    expect(container.textContent).toContain('Waiting for bid');
  });

  it('renders normal branch for a different wallet address', () => {
    const { container } = render(<Winner winner={'0xC0FFEE0000000000000000000000000000C0FFEE'} />, {
      wrapper: WithProviders,
    });
    expect(container.textContent).not.toContain('Waiting for bid');
    expect(container.querySelector('[data-testid="short-address"]')).not.toBeNull();
  });
});
