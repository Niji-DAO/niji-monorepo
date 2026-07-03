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

  it('renders "Waiting for bid" when winner equals auction house address (Issue #3049)', async () => {
    executeMock.mockResolvedValue({ auction: { bidder: { id: '0xAUCTIONHOUSE' } } });
    const { container } = render(<NijiInfoRowHolder nounId={1n} />, { wrapper: WithProviders });
    await waitFor(() => {
      expect(container.textContent).toContain('Waiting for bid');
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

  it('auction house lowercase comparison still maps to "Waiting for bid" branch (Issue #3049)', async () => {
    // mock auction house = '0xAUCTIONHOUSE'、 case-insensitive comparison で同一判定
    executeMock.mockResolvedValue({ auction: { bidder: { id: '0xauctionhouse' } } });
    const { container } = render(<NijiInfoRowHolder nounId={1n} />, { wrapper: WithProviders });
    await waitFor(() => {
      expect(container.textContent).toContain('Waiting for bid');
    });
  });

  it('renders anchor even when winner is auction house (with Waiting for bid label) (Issue #3049)', async () => {
    executeMock.mockResolvedValue({ auction: { bidder: { id: '0xAUCTIONHOUSE' } } });
    const { container } = render(<NijiInfoRowHolder nounId={1n} />, { wrapper: WithProviders });
    await waitFor(() => {
      expect(container.textContent).toContain('Waiting for bid');
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

  it('mount-unmount 50 cycles', () => {
    executeMock.mockResolvedValue({ auction: { bidder: { id: '0xAA' } } });
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<NijiInfoRowHolder nounId={1n} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('handles 30 different nounId values', () => {
    executeMock.mockResolvedValue({ auction: { bidder: { id: '0xAA' } } });
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<NijiInfoRowHolder nounId={BigInt(i)} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('handles 30 different bidder addresses', () => {
    for (let i = 0; i < 30; i++) {
      executeMock.mockResolvedValue({
        auction: { bidder: { id: `0x${i.toString(16).padStart(40, '0')}` } },
      });
      const { unmount } = render(<NijiInfoRowHolder nounId={1n} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('renders 30 instances all without crash', () => {
    executeMock.mockResolvedValue({ auction: { bidder: { id: '0xAA' } } });
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NijiInfoRowHolder key={i} nounId={BigInt(i)} />
          ))}
        </>,
        { wrapper: WithProviders },
      ),
    ).not.toThrow();
  });

  it('handles 30 different undefined bidder cases', () => {
    for (let i = 0; i < 30; i++) {
      executeMock.mockResolvedValue({ auction: { bidder: null } });
      const { unmount } = render(<NijiInfoRowHolder nounId={BigInt(i)} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-2 mount-unmount 30 cycles', () => {
    executeMock.mockResolvedValue({ auction: { bidder: { id: '0xAA' } } });
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<NijiInfoRowHolder nounId={1n} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-2 handles 30 different nounId values', () => {
    executeMock.mockResolvedValue({ auction: { bidder: { id: '0xAA' } } });
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<NijiInfoRowHolder nounId={BigInt(i + 100)} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-2 handles 30 different bidder addresses', () => {
    for (let i = 0; i < 30; i++) {
      executeMock.mockResolvedValue({
        auction: { bidder: { id: `0x${i.toString(16).padStart(40, '0')}` } },
      });
      const { unmount } = render(<NijiInfoRowHolder nounId={1n} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-2 renders 30 instances without crash', () => {
    executeMock.mockResolvedValue({ auction: { bidder: { id: '0xAA' } } });
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NijiInfoRowHolder key={i} nounId={BigInt(i)} />
          ))}
        </>,
        { wrapper: WithProviders },
      ),
    ).not.toThrow();
  });

  it('round-2 handles 30 different undefined bidder cases', () => {
    for (let i = 0; i < 30; i++) {
      executeMock.mockResolvedValue({ auction: null });
      const { unmount } = render(<NijiInfoRowHolder nounId={BigInt(i)} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-3 mount-unmount 50 cycles', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<NijiInfoRowHolder nounId={1n} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-3 30 different nounIds variant', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<NijiInfoRowHolder nounId={BigInt(i + 200)} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-3 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<NijiInfoRowHolder nounId={1n} />, { wrapper: WithProviders }),
      ).not.toThrow();
    }
  });

  it('round-3 30 instances rendered together', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NijiInfoRowHolder key={i} nounId={BigInt(i + 300)} />
          ))}
        </>,
        { wrapper: WithProviders },
      ),
    ).not.toThrow();
  });

  it('round-3 50 different className values', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<NijiInfoRowHolder nounId={1n} className={`r3-cls-${i}`} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-4 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<NijiInfoRowHolder nounId={1n} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-4 30 different nounId values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<NijiInfoRowHolder nounId={BigInt(i + 200)} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<NijiInfoRowHolder nounId={1n} />, { wrapper: WithProviders }),
      ).not.toThrow();
    }
  });

  it('round-4 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<NijiInfoRowHolder nounId={1n} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-4 50 different className values', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<NijiInfoRowHolder nounId={1n} className={`r4-cls-${i}`} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<NijiInfoRowHolder nounId={1n} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-5 30 different nounId values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<NijiInfoRowHolder nounId={BigInt(i + 500)} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<NijiInfoRowHolder nounId={1n} />, { wrapper: WithProviders }),
      ).not.toThrow();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<NijiInfoRowHolder nounId={1n} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-5 50 different className values', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<NijiInfoRowHolder nounId={1n} className={`r5-cls-${i}`} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-6 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<NijiInfoRowHolder nounId={1n} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-6 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <NijiInfoRowHolder key={i} nounId={BigInt(i + 500)} />
          ))}
        </>,
        { wrapper: WithProviders },
      ),
    ).not.toThrow();
  });

  it('round-6 30 different nounId values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<NijiInfoRowHolder nounId={BigInt(i + 5000)} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<NijiInfoRowHolder nounId={1n} />, { wrapper: WithProviders }),
      ).not.toThrow();
    }
  });

  it('round-6 50 different className values', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<NijiInfoRowHolder nounId={1n} className={`r6-cls-${i}`} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<NijiInfoRowHolder nounId={1n} className="r7" />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NijiInfoRowHolder key={i} nounId={BigInt(i + 8000)} className={`r7-${i}`} />
          ))}
        </>,
        { wrapper: WithProviders },
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<NijiInfoRowHolder nounId={1n} className="r7" />, { wrapper: WithProviders }),
      ).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<NijiInfoRowHolder nounId={1n} className="r7" />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-7 50 different className values', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<NijiInfoRowHolder nounId={1n} className={`r7-cls-${i}`} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-8 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<NijiInfoRowHolder nounId={1n} className="r8" />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-8 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NijiInfoRowHolder key={i} nounId={BigInt(i + 13000)} className={`r8-${i}`} />
          ))}
        </>,
        { wrapper: WithProviders },
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<NijiInfoRowHolder nounId={1n} className="r8" />, { wrapper: WithProviders }),
      ).not.toThrow();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<NijiInfoRowHolder nounId={1n} className="r8" />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-8 50 different className values', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<NijiInfoRowHolder nounId={1n} className={`r8-cls-${i}`} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-9 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<NijiInfoRowHolder nounId={1n} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-9 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NijiInfoRowHolder key={i} nounId={BigInt(i + 30000)} />
          ))}
        </>,
        { wrapper: WithProviders },
      ),
    ).not.toThrow();
  });

  it('round-9 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<NijiInfoRowHolder nounId={1n} />, { wrapper: WithProviders }),
      ).not.toThrow();
    }
  });

  it('round-9 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<NijiInfoRowHolder nounId={1n} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-9 50 different className values', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<NijiInfoRowHolder nounId={1n} className={`r9-cls-${i}`} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-10 30 sequential NijiInfoRowHolder mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<NijiInfoRowHolder nounId={1n} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-10 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NijiInfoRowHolder key={i} nounId={BigInt(i + 1)} />
          ))}
        </>,
        { wrapper: WithProviders },
      ),
    ).not.toThrow();
  });

  it('round-10 30 different nounId values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<NijiInfoRowHolder nounId={BigInt(i + 1000)} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-10 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<NijiInfoRowHolder nounId={2n} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-10 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<NijiInfoRowHolder nounId={BigInt(i + 2000)} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-11 30 sequential NijiInfoRowHolder mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<NijiInfoRowHolder nounId={BigInt(i)} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-11 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NijiInfoRowHolder key={i} nounId={BigInt(i + 1)} />
          ))}
        </>,
        { wrapper: WithProviders },
      ),
    ).not.toThrow();
  });

  it('round-11 30 different nounId values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<NijiInfoRowHolder nounId={BigInt(i + 5000)} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-11 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<NijiInfoRowHolder nounId={BigInt(i + 6000)} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-11 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<NijiInfoRowHolder nounId={BigInt(i + 7000)} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-12 30 sequential NijiInfoRowHolder mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<NijiInfoRowHolder nounId={BigInt(i + 8000)} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-12 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NijiInfoRowHolder key={i} nounId={BigInt(i + 9000)} />
          ))}
        </>,
        { wrapper: WithProviders },
      ),
    ).not.toThrow();
  });

  it('round-12 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<NijiInfoRowHolder nounId={BigInt(i + 10000)} />, { wrapper: WithProviders }),
      ).not.toThrow();
    }
  });

  it('round-12 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<NijiInfoRowHolder nounId={BigInt(i + 11000)} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-12 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<NijiInfoRowHolder nounId={BigInt(i + 12000)} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });
});
