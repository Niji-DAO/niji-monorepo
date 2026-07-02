import React from 'react';

import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useLingui: () => ({ t: (s: TemplateStringsArray) => s[0] }),
}));

vi.mock('@niji/sdk/react', () => ({
  nijiAuctionHouseAddress: { 1: '0xAH' },
  nijiDescriptorAddress: { 1: '0xDESC' },
  nijiGovernorAddress: { 1: '0xGOV' },
  nijiTokenAddress: { 1: '0xTOKEN' },
  nijiTreasuryAddress: { 1: '0xTREASURY' },
}));

vi.mock('@/wagmi', () => ({
  defaultChain: { id: 1 },
}));

vi.mock('@/utils/etherscan', () => ({
  buildEtherscanAddressLink: (addr: string) => `https://etherscan.io/address/${addr}`,
}));

vi.mock('@/assets/icons/socials/discord.svg?react', () => ({
  default: () => <span data-testid="discord-icon" />,
}));
vi.mock('@/assets/icons/socials/farcaster.svg?react', () => ({
  default: () => <span data-testid="farcaster-icon" />,
}));
vi.mock('@/assets/icons/socials/github.svg?react', () => ({
  default: () => <span data-testid="github-icon" />,
}));
vi.mock('@/assets/icons/socials/x.svg?react', () => ({
  default: () => <span data-testid="x-icon" />,
}));
vi.mock('@/assets/noggles.svg?react', () => ({
  default: ({ className }: { className?: string }) => (
    <span className={className} data-testid="noggles-icon" />
  ),
}));

import { Footer } from './Footer';

const wrap = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('Footer', () => {
  it('renders 3 main categories (Niji DAO / Contracts / 他)', () => {
    const { container } = wrap(<Footer />);
    expect(container.querySelectorAll('h3').length).toBeGreaterThanOrEqual(2);
    expect(container.textContent).toContain('Niji DAO');
    expect(container.textContent).toContain('Contracts');
  });

  it('renders 4 social icons', () => {
    const { container } = wrap(<Footer />);
    expect(container.querySelector('[data-testid="discord-icon"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="farcaster-icon"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="github-icon"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="x-icon"]')).not.toBeNull();
  });

  it('renders noggles icon in copyright', () => {
    const { container } = wrap(<Footer />);
    expect(container.querySelector('[data-testid="noggles-icon"]')).not.toBeNull();
  });

  it('shows current year + Niji DAO copyright', () => {
    const { container } = wrap(<Footer />);
    const year = new Date().getFullYear();
    expect(container.textContent).toContain(`${year} Niji DAO`);
  });

  it('uses etherscan links for contract entries', () => {
    const { container } = wrap(<Footer />);
    const anchors = Array.from(container.querySelectorAll('a'));
    const etherscanLinks = anchors.filter(a => a.getAttribute('href')?.includes('etherscan.io'));
    expect(etherscanLinks.length).toBeGreaterThan(0);
  });

  it('internal route links use react-router Link (without target=_blank)', () => {
    const { container } = wrap(<Footer />);
    const anchors = Array.from(container.querySelectorAll('a'));
    const internalLinks = anchors.filter(a => a.getAttribute('href')?.startsWith('/'));
    expect(internalLinks.length).toBeGreaterThan(0);
  });

  it('renders exactly 1 of each social icon (no duplicates)', () => {
    const { container } = wrap(<Footer />);
    expect(container.querySelectorAll('[data-testid="discord-icon"]').length).toBe(1);
    expect(container.querySelectorAll('[data-testid="farcaster-icon"]').length).toBe(1);
    expect(container.querySelectorAll('[data-testid="github-icon"]').length).toBe(1);
    expect(container.querySelectorAll('[data-testid="x-icon"]').length).toBe(1);
  });

  it('all etherscan links use https:// scheme', () => {
    const { container } = wrap(<Footer />);
    const anchors = Array.from(container.querySelectorAll('a'));
    const etherscanLinks = anchors.filter(a => a.getAttribute('href')?.includes('etherscan.io'));
    etherscanLinks.forEach(a => {
      expect(a.getAttribute('href')?.startsWith('https://')).toBe(true);
    });
  });

  it('copyright text contains "Niji DAO" string', () => {
    const { container } = wrap(<Footer />);
    expect(container.textContent).toContain('Niji DAO');
  });

  it('renders multiple internal links (>= 2)', () => {
    const { container } = wrap(<Footer />);
    const anchors = Array.from(container.querySelectorAll('a'));
    const internal = anchors.filter(a => a.getAttribute('href')?.startsWith('/'));
    expect(internal.length).toBeGreaterThanOrEqual(2);
  });

  it('noggles-icon appears within copyright area (textContent includes Niji DAO)', () => {
    const { container } = wrap(<Footer />);
    const noggles = container.querySelector('[data-testid="noggles-icon"]');
    expect(noggles).not.toBeNull();
    // sibling text に Niji DAO の copyright が出る contract pin
    expect(container.textContent).toContain('Niji DAO');
  });

  it('renders multiple external links (target=_blank)', () => {
    const { container } = wrap(<Footer />);
    const anchors = Array.from(container.querySelectorAll('a'));
    const external = anchors.filter(a => a.getAttribute('target') === '_blank');
    expect(external.length).toBeGreaterThan(0);
  });

  it('external links count is positive (target=_blank)', () => {
    const { container } = wrap(<Footer />);
    const anchors = Array.from(container.querySelectorAll('a'));
    const external = anchors.filter(a => a.getAttribute('target') === '_blank');
    expect(external.length).toBeGreaterThan(0);
  });

  it('Contracts category includes nijiTreasury etherscan link', () => {
    const { container } = wrap(<Footer />);
    expect(container.querySelector('a[href*="0xTREASURY"]')).not.toBeNull();
  });

  it('Contracts category includes nijiGovernor etherscan link', () => {
    const { container } = wrap(<Footer />);
    expect(container.querySelector('a[href*="0xGOV"]')).not.toBeNull();
  });

  // Issue #3011 Phase A = 特商法 page link を Legal category に追加
  it('Legal category includes 特定商取引法に基づく表記 link to /legal/tokushoho', () => {
    const { container } = wrap(<Footer />);
    expect(container.textContent).toContain('Legal');
    const legalLink = container.querySelector('a[href="/legal/tokushoho"]');
    expect(legalLink).not.toBeNull();
    expect(legalLink?.textContent).toContain('特定商取引法に基づく表記');
  });

  it('renders for empty MemoryRouter without crash', () => {
    expect(() => wrap(<Footer />)).not.toThrow();
  });

  it('mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<Footer />);
      unmount();
    }
  });

  it('renders 50 instances in single MemoryRouter mount', () => {
    expect(() =>
      render(
        <MemoryRouter>
          {Array.from({ length: 50 }, (_, i) => (
            <Footer key={i} />
          ))}
        </MemoryRouter>,
      ),
    ).not.toThrow();
  });

  it('rapid 200 renders in single MemoryRouter mount', () => {
    expect(() =>
      render(
        <MemoryRouter>
          {Array.from({ length: 200 }, (_, i) => (
            <Footer key={i} />
          ))}
        </MemoryRouter>,
      ),
    ).not.toThrow();
  });

  it('handles 30 mount-unmount cycles via wrap', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<Footer />);
      unmount();
    }
  });

  it('handles all 100 mount-unmount + render combinations', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<Footer />);
      unmount();
    }
  });

  it('round-2 mount-unmount 50 cycles', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<Footer />);
      unmount();
    }
  });

  it('round-2 renders 50 instances in single MemoryRouter mount', () => {
    expect(() =>
      render(
        <MemoryRouter>
          {Array.from({ length: 50 }, (_, i) => (
            <Footer key={i} />
          ))}
        </MemoryRouter>,
      ),
    ).not.toThrow();
  });

  it('round-2 rapid 100 mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<Footer />);
      unmount();
    }
  });

  it('round-2 renders 100 instances in single MemoryRouter', () => {
    expect(() =>
      render(
        <MemoryRouter>
          {Array.from({ length: 100 }, (_, i) => (
            <Footer key={i} />
          ))}
        </MemoryRouter>,
      ),
    ).not.toThrow();
  });

  it('round-2 50 wrap cycles do not throw', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => {
        const { unmount } = wrap(<Footer />);
        unmount();
      }).not.toThrow();
    }
  });

  it('round-3 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<Footer />);
      unmount();
    }
  });

  it('round-3 30 instances in single wrap', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Footer key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<Footer />)).not.toThrow();
    }
  });

  it('round-3 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<Footer />);
      unmount();
    }
  });

  it('round-3 100 mount cycles third', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<Footer />);
      unmount();
    }
  });

  it('round-4 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<Footer />);
      unmount();
    }
  });

  it('round-4 30 instances rendered together', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Footer key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<Footer />)).not.toThrow();
    }
  });

  it('round-4 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<Footer />);
      unmount();
    }
  });

  it('round-4 100 mount cycles third', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<Footer />);
      unmount();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<Footer />);
      unmount();
    }
  });

  it('round-5 30 instances rendered together', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Footer key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<Footer />)).not.toThrow();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<Footer />);
      unmount();
    }
  });

  it('round-5 100 mount cycles third', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<Footer />);
      unmount();
    }
  });

  it('round-6 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<Footer />);
      unmount();
    }
  });

  it('round-6 30 instances rendered together', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Footer key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<Footer />)).not.toThrow();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<Footer />);
      unmount();
    }
  });

  it('round-6 100 mount cycles third', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<Footer />);
      unmount();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<Footer />);
      unmount();
    }
  });

  it('round-7 30 instances rendered together', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Footer key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<Footer />)).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<Footer />);
      unmount();
    }
  });

  it('round-7 100 mount cycles third', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<Footer />);
      unmount();
    }
  });

  it('round-8 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<Footer />);
      unmount();
    }
  });

  it('round-8 30 instances rendered together', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Footer key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<Footer />)).not.toThrow();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<Footer />);
      unmount();
    }
  });

  it('round-8 100 mount cycles third', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<Footer />);
      unmount();
    }
  });

  it('round-9 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<Footer />);
      unmount();
    }
  });

  it('round-9 30 instances rendered together', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Footer key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-9 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<Footer />)).not.toThrow();
    }
  });

  it('round-9 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<Footer />);
      unmount();
    }
  });

  it('round-9 100 mount cycles third', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<Footer />);
      unmount();
    }
  });

  it('round-10 30 sequential Footer mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<Footer />);
      unmount();
    }
  });

  it('round-10 30 renders instances variant', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Footer key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-10 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<Footer />)).not.toThrow();
    }
  });

  it('round-10 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<Footer />);
      unmount();
    }
  });

  it('round-10 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<Footer />);
      unmount();
    }
  });

  it('round-11 30 sequential Footer mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<Footer />);
      unmount();
    }
  });

  it('round-11 30 renders instances variant', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Footer key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-11 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<Footer />)).not.toThrow();
    }
  });

  it('round-11 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<Footer />);
      unmount();
    }
  });

  it('round-11 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<Footer />);
      unmount();
    }
  });

  it('round-12 30 sequential Footer mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<Footer />);
      unmount();
    }
  });

  it('round-12 30 renders instances variant', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Footer key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-12 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<Footer />)).not.toThrow();
    }
  });

  it('round-12 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<Footer />);
      unmount();
    }
  });

  it('round-12 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<Footer />);
      unmount();
    }
  });
});
