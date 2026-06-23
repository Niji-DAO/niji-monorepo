import React from 'react';

import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/ShortAddress', () => ({
  default: ({ address }: { address: string }) => (
    <span data-testid="short">{address.slice(0, 6)}</span>
  ),
}));

vi.mock('@niji/sdk/react', () => ({
  nijiAuctionHouseAddress: { 1: '0xAUCTIONHOUSE' },
}));

vi.mock('@/wagmi', () => ({
  defaultChain: { id: 1 },
}));

vi.mock('@/utils/etherscan', () => ({
  buildEtherscanAddressLink: (addr: string) => `https://etherscan.io/address/${addr}`,
}));

vi.mock('@/wrappers/subgraph', () => ({
  auctionQuery: 'AUCTION_QUERY_PLACEHOLDER',
}));

const executeMock = vi.fn();
vi.mock('@/subgraphs/execute', () => ({
  execute: () => executeMock(),
}));

import { WithProviders } from '@/test-utils/providers';

import NijiInfoRowHolder from './NijiInfoRowHolder';

describe('NijiInfoRowHolder', () => {
  it('renders Loading text while query is pending', () => {
    executeMock.mockReturnValue(new Promise(() => {}));
    const { container } = render(<NijiInfoRowHolder nounId={1n} />, { wrapper: WithProviders });
    expect(container.textContent).toBe('Loading...');
  });

  it('renders nothing when winner is missing', async () => {
    executeMock.mockResolvedValue({ auction: null });
    const { container } = render(<NijiInfoRowHolder nounId={1n} />, { wrapper: WithProviders });
    await waitFor(() => expect(container.textContent).toBe(''));
  });

  it('renders winner ShortAddress + etherscan link when winner is not auction house', async () => {
    executeMock.mockResolvedValue({ auction: { bidder: { id: '0xBIDDER' } } });
    const { container } = render(<NijiInfoRowHolder nounId={1n} />, { wrapper: WithProviders });
    await waitFor(() => {
      expect(container.querySelector('[data-testid="short"]')?.textContent).toBe('0xBIDD');
    });
    expect(container.querySelector('a')?.getAttribute('href')).toBe(
      'https://etherscan.io/address/0xBIDDER',
    );
    expect(container.querySelector('a')?.getAttribute('target')).toBe('_blank');
    expect(container.querySelector('a')?.getAttribute('rel')).toBe('noreferrer');
  });

  it('renders "Niji Auction House" when winner equals auction house address', async () => {
    executeMock.mockResolvedValue({ auction: { bidder: { id: '0xAUCTIONHOUSE' } } });
    const { container } = render(<NijiInfoRowHolder nounId={1n} />, { wrapper: WithProviders });
    await waitFor(() => {
      expect(container.textContent).toContain('Niji Auction House');
    });
    expect(container.querySelector('[data-testid="short"]')).toBeNull();
  });

  it('merges custom className', async () => {
    executeMock.mockResolvedValue({ auction: { bidder: { id: '0xBIDDER' } } });
    const { container } = render(<NijiInfoRowHolder nounId={1n} className="extra" />, {
      wrapper: WithProviders,
    });
    await waitFor(() => {
      expect(container.querySelector('span')?.className).toContain('extra');
    });
  });

  it('renders external link icon (svg)', async () => {
    executeMock.mockResolvedValue({ auction: { bidder: { id: '0xBIDDER' } } });
    const { container } = render(<NijiInfoRowHolder nounId={1n} />, { wrapper: WithProviders });
    await waitFor(() => {
      expect(container.querySelector('svg')).not.toBeNull();
    });
  });
});
