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

  it('handles large bigint nounId without crash', () => {
    executeMock.mockReturnValue(new Promise(() => {}));
    expect(() =>
      render(<NijiInfoRowHolder nounId={9_007_199_254_740_991n} />, { wrapper: WithProviders }),
    ).not.toThrow();
  });

  it('renders empty className (no merge crash)', async () => {
    executeMock.mockResolvedValue({ auction: { bidder: { id: '0xBIDDER' } } });
    const { container } = render(<NijiInfoRowHolder nounId={1n} className="" />, {
      wrapper: WithProviders,
    });
    await waitFor(() => {
      expect(container.querySelector('[data-testid="short"]')).not.toBeNull();
    });
  });

  it('renders exactly 1 svg icon (winner path)', async () => {
    executeMock.mockResolvedValue({ auction: { bidder: { id: '0xBIDDER' } } });
    const { container } = render(<NijiInfoRowHolder nounId={1n} />, { wrapper: WithProviders });
    await waitFor(() => {
      expect(container.querySelectorAll('svg').length).toBe(1);
    });
  });

  it('etherscan link has noreferrer rel + _blank target (multi attribute)', async () => {
    executeMock.mockResolvedValue({ auction: { bidder: { id: '0xBIDDER' } } });
    const { container } = render(<NijiInfoRowHolder nounId={1n} />, { wrapper: WithProviders });
    await waitFor(() => {
      const a = container.querySelector('a');
      expect(a?.getAttribute('rel')).toBe('noreferrer');
      expect(a?.getAttribute('target')).toBe('_blank');
    });
  });

  it('auction house lowercase comparison still maps to "Niji Auction House" branch', async () => {
    // mock auction house = '0xAUCTIONHOUSE'、 case-insensitive comparison で同一判定
    executeMock.mockResolvedValue({ auction: { bidder: { id: '0xauctionhouse' } } });
    const { container } = render(<NijiInfoRowHolder nounId={1n} />, { wrapper: WithProviders });
    await waitFor(() => {
      expect(container.textContent).toContain('Niji Auction House');
    });
  });

  it('renders anchor even when winner is auction house (with Niji Auction House label)', async () => {
    executeMock.mockResolvedValue({ auction: { bidder: { id: '0xAUCTIONHOUSE' } } });
    const { container } = render(<NijiInfoRowHolder nounId={1n} />, { wrapper: WithProviders });
    await waitFor(() => {
      expect(container.textContent).toContain('Niji Auction House');
    });
    // anchor は残る (svg link icon が残るため)
    expect(container.querySelector('a')).not.toBeNull();
  });

  it('renders only Loading text on initial render (pending state)', () => {
    executeMock.mockReturnValue(new Promise(() => {}));
    const { container } = render(<NijiInfoRowHolder nounId={5n} />, { wrapper: WithProviders });
    expect(container.querySelector('a')).toBeNull();
    expect(container.querySelector('[data-testid="short"]')).toBeNull();
  });

  it('handles auction null case (no winner key) without crash', async () => {
    executeMock.mockResolvedValue({ auction: null });
    const { container } = render(<NijiInfoRowHolder nounId={1n} />, { wrapper: WithProviders });
    await waitFor(() => expect(container.textContent).toBe(''));
    expect(container.querySelector('a')).toBeNull();
  });

  it('renders different winner address format correctly', async () => {
    executeMock.mockResolvedValue({ auction: { bidder: { id: '0x123456' } } });
    const { container } = render(<NijiInfoRowHolder nounId={3n} />, { wrapper: WithProviders });
    await waitFor(() => {
      expect(container.querySelector('[data-testid="short"]')?.textContent).toBe('0x1234');
    });
  });

  it('etherscan link uses winner id verbatim in href', async () => {
    executeMock.mockResolvedValue({ auction: { bidder: { id: '0xFOOBAR' } } });
    const { container } = render(<NijiInfoRowHolder nounId={1n} />, { wrapper: WithProviders });
    await waitFor(() => {
      expect(container.querySelector('a')?.getAttribute('href')).toBe(
        'https://etherscan.io/address/0xFOOBAR',
      );
    });
  });
});
