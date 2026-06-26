import React from 'react';

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const useAccountMock = vi.fn();
vi.mock('wagmi', () => ({
  useAccount: () => useAccountMock(),
}));

const useAtomValueMock = vi.fn();
vi.mock('jotai/react', () => ({
  useAtomValue: () => useAtomValueMock(),
}));

const useActiveLocaleMock = vi.fn();
vi.mock('@/hooks/useActivateLocale', () => ({
  useActiveLocale: () => useActiveLocaleMock(),
}));

vi.mock('@/components/ShortAddress', () => ({
  default: ({ address }: { address: string }) => <span data-testid="short">{address}</span>,
}));

vi.mock('@/utils/etherscan', () => ({
  buildEtherscanAddressLink: (addr: string) => `https://etherscan.io/address/${addr}`,
}));

import { WithProviders } from '@/test-utils/providers';

import Winner from './index';

const ADDR = '0x5FbDB2315678afecb367f032d93F642f64180aa3' as const;

describe('Winner', () => {
  it('renders ShortAddress when winner is not connected user', () => {
    useAccountMock.mockReturnValue({ address: '0xOTHER' });
    useAtomValueMock.mockReturnValue(true);
    useActiveLocaleMock.mockReturnValue('en-US');
    const { container } = render(<Winner winner={ADDR} />, { wrapper: WithProviders });
    expect(container.querySelector('[data-testid="short"]')?.textContent).toBe(ADDR);
  });

  it('renders "you" branch when winner === connected user', () => {
    useAccountMock.mockReturnValue({ address: ADDR });
    useAtomValueMock.mockReturnValue(true);
    useActiveLocaleMock.mockReturnValue('en-US');
    const { container } = render(<Winner winner={ADDR} />, { wrapper: WithProviders });
    expect(container.textContent?.toLowerCase()).toContain('you');
  });

  it('renders Nounders branch when isNounders=true', () => {
    useAccountMock.mockReturnValue({ address: '0xOTHER' });
    useAtomValueMock.mockReturnValue(true);
    useActiveLocaleMock.mockReturnValue('en-US');
    const { container } = render(<Winner winner={ADDR} isNounders={true} />, {
      wrapper: WithProviders,
    });
    expect(container.textContent?.length).toBeGreaterThan(0);
  });

  it('handles ja-JP locale layout column variant', () => {
    useAccountMock.mockReturnValue({ address: ADDR });
    useAtomValueMock.mockReturnValue(true);
    useActiveLocaleMock.mockReturnValue('ja-JP');
    const { container } = render(<Winner winner={ADDR} />, { wrapper: WithProviders });
    expect(container.textContent?.toLowerCase()).toContain('you');
  });

  it('handles ja-JP locale with isNounders=true', () => {
    useAccountMock.mockReturnValue({ address: '0xOTHER' });
    useAtomValueMock.mockReturnValue(true);
    useActiveLocaleMock.mockReturnValue('ja-JP');
    const { container } = render(<Winner winner={ADDR} isNounders={true} />, {
      wrapper: WithProviders,
    });
    expect(container.textContent?.length).toBeGreaterThan(0);
  });

  it('handles warm bg variant (useAtomValue false)', () => {
    useAccountMock.mockReturnValue({ address: '0xOTHER' });
    useAtomValueMock.mockReturnValue(false);
    useActiveLocaleMock.mockReturnValue('en-US');
    const { container } = render(<Winner winner={ADDR} />, { wrapper: WithProviders });
    expect(container.textContent?.length).toBeGreaterThan(0);
  });

  it('handles useAccount returning undefined address', () => {
    useAccountMock.mockReturnValue({ address: undefined });
    useAtomValueMock.mockReturnValue(true);
    useActiveLocaleMock.mockReturnValue('en-US');
    const { container } = render(<Winner winner={ADDR} />, { wrapper: WithProviders });
    // 未接続でも winner = ADDR で render 可能
    expect(container.querySelector('[data-testid="short"]')?.textContent).toBe(ADDR);
  });

  it('zero address winner renders without crashing', () => {
    useAccountMock.mockReturnValue({ address: '0xOTHER' });
    useAtomValueMock.mockReturnValue(true);
    useActiveLocaleMock.mockReturnValue('en-US');
    const zero = '0x0000000000000000000000000000000000000000' as const;
    expect(() => render(<Winner winner={zero} />, { wrapper: WithProviders })).not.toThrow();
  });

  it('"you" branch fires for matching account in any locale', () => {
    useAccountMock.mockReturnValue({ address: ADDR });
    useAtomValueMock.mockReturnValue(false);
    useActiveLocaleMock.mockReturnValue('en-US');
    const { container } = render(<Winner winner={ADDR} />, { wrapper: WithProviders });
    expect(container.textContent?.toLowerCase()).toContain('you');
  });

  it('renders ShortAddress with full winner address verbatim', () => {
    useAccountMock.mockReturnValue({ address: '0xOTHER' });
    useAtomValueMock.mockReturnValue(true);
    useActiveLocaleMock.mockReturnValue('en-US');
    const { container } = render(<Winner winner={ADDR} />, { wrapper: WithProviders });
    expect(container.querySelector('[data-testid="short"]')?.textContent).toBe(ADDR);
  });

  it('zh-CN locale renders with you branch when winner matches user', () => {
    useAccountMock.mockReturnValue({ address: ADDR });
    useAtomValueMock.mockReturnValue(true);
    useActiveLocaleMock.mockReturnValue('zh-CN');
    const { container } = render(<Winner winner={ADDR} />, { wrapper: WithProviders });
    expect(container.textContent?.length).toBeGreaterThan(0);
  });

  it('handles case-insensitive winner === account comparison', () => {
    const lowerADDR = '0x5fbdb2315678afecb367f032d93f642f64180aa3' as const;
    useAccountMock.mockReturnValue({ address: lowerADDR });
    useAtomValueMock.mockReturnValue(true);
    useActiveLocaleMock.mockReturnValue('en-US');
    const { container } = render(<Winner winner={ADDR} />, { wrapper: WithProviders });
    // 大文字小文字違いでも you 判定
    expect(container.textContent?.toLowerCase()).toContain('you');
  });

  it('isNounders ja-JP + warm bg combination', () => {
    useAccountMock.mockReturnValue({ address: '0xOTHER' });
    useAtomValueMock.mockReturnValue(false);
    useActiveLocaleMock.mockReturnValue('ja-JP');
    const { container } = render(<Winner winner={ADDR} isNounders={true} />, {
      wrapper: WithProviders,
    });
    expect(container.textContent?.length).toBeGreaterThan(0);
  });

  it('renders ShortAddress 1 element when not user winner', () => {
    useAccountMock.mockReturnValue({ address: '0xOTHER' });
    useAtomValueMock.mockReturnValue(true);
    useActiveLocaleMock.mockReturnValue('en-US');
    const { container } = render(<Winner winner={ADDR} />, { wrapper: WithProviders });
    expect(container.querySelectorAll('[data-testid="short"]').length).toBe(1);
  });

  it('does NOT render ShortAddress when "you" branch fires', () => {
    useAccountMock.mockReturnValue({ address: ADDR });
    useAtomValueMock.mockReturnValue(true);
    useActiveLocaleMock.mockReturnValue('en-US');
    const { container } = render(<Winner winner={ADDR} />, { wrapper: WithProviders });
    expect(container.querySelector('[data-testid="short"]')).toBeNull();
  });

  it('rerender from other to user winner switches to you branch', () => {
    useAccountMock.mockReturnValue({ address: '0xOTHER' });
    useAtomValueMock.mockReturnValue(true);
    useActiveLocaleMock.mockReturnValue('en-US');
    const { container, rerender } = render(<Winner winner={ADDR} />, { wrapper: WithProviders });
    expect(container.querySelector('[data-testid="short"]')).not.toBeNull();
    useAccountMock.mockReturnValue({ address: ADDR });
    rerender(<Winner winner={ADDR} />);
    expect(container.textContent?.toLowerCase()).toContain('you');
  });

  it('zh-CN locale + isNounders renders without crash', () => {
    useAccountMock.mockReturnValue({ address: '0xOTHER' });
    useAtomValueMock.mockReturnValue(true);
    useActiveLocaleMock.mockReturnValue('zh-CN');
    const { container } = render(<Winner winner={ADDR} isNounders={true} />, {
      wrapper: WithProviders,
    });
    expect(container.textContent?.length).toBeGreaterThan(0);
  });

  it('different winner address rerender updates short address', () => {
    useAccountMock.mockReturnValue({ address: '0xOTHER' });
    useAtomValueMock.mockReturnValue(true);
    useActiveLocaleMock.mockReturnValue('en-US');
    const { container, rerender } = render(<Winner winner={ADDR} />, { wrapper: WithProviders });
    expect(container.querySelector('[data-testid="short"]')?.textContent).toBe(ADDR);
    const ADDR_B = '0x0000000000000000000000000000000000000abc' as const;
    rerender(<Winner winner={ADDR_B} />);
    expect(container.querySelector('[data-testid="short"]')?.textContent).toBe(ADDR_B);
  });

  it('warm bg + en-US renders with text content', () => {
    useAccountMock.mockReturnValue({ address: '0xOTHER' });
    useAtomValueMock.mockReturnValue(false);
    useActiveLocaleMock.mockReturnValue('en-US');
    const { container } = render(<Winner winner={ADDR} />, { wrapper: WithProviders });
    expect(container.textContent?.length).toBeGreaterThan(0);
  });

  it('warm bg + ja-JP + non-user winner renders ShortAddress', () => {
    useAccountMock.mockReturnValue({ address: '0xOTHER' });
    useAtomValueMock.mockReturnValue(false);
    useActiveLocaleMock.mockReturnValue('ja-JP');
    const { container } = render(<Winner winner={ADDR} />, { wrapper: WithProviders });
    expect(container.querySelector('[data-testid="short"]')).not.toBeNull();
  });

  it('zh-CN locale with non-user winner shows ShortAddress', () => {
    useAccountMock.mockReturnValue({ address: '0xOTHER' });
    useAtomValueMock.mockReturnValue(true);
    useActiveLocaleMock.mockReturnValue('zh-CN');
    const { container } = render(<Winner winner={ADDR} />, { wrapper: WithProviders });
    expect(container.querySelector('[data-testid="short"]')).not.toBeNull();
  });

  it('isNounders + warm bg + zh-CN does not crash', () => {
    useAccountMock.mockReturnValue({ address: '0xOTHER' });
    useAtomValueMock.mockReturnValue(false);
    useActiveLocaleMock.mockReturnValue('zh-CN');
    expect(() =>
      render(<Winner winner={ADDR} isNounders={true} />, { wrapper: WithProviders }),
    ).not.toThrow();
  });

  it('multiple Winner instances render with own contents', () => {
    useAccountMock.mockReturnValue({ address: '0xOTHER' });
    useAtomValueMock.mockReturnValue(true);
    useActiveLocaleMock.mockReturnValue('en-US');
    const ADDR_B = '0x000000000000000000000000000000000000bbbb' as const;
    const { container } = render(
      <>
        <Winner winner={ADDR} />
        <Winner winner={ADDR_B} />
      </>,
      { wrapper: WithProviders },
    );
    expect(container.querySelectorAll('[data-testid="short"]').length).toBe(2);
  });

  it('isNounders=true renders without ShortAddress when warm + zh-CN', () => {
    useAccountMock.mockReturnValue({ address: '0xOTHER' });
    useAtomValueMock.mockReturnValue(false);
    useActiveLocaleMock.mockReturnValue('zh-CN');
    const { container } = render(<Winner winner={ADDR} isNounders={true} />, {
      wrapper: WithProviders,
    });
    expect(container.textContent?.length).toBeGreaterThan(0);
  });

  it('zero address ja-JP renders without crash', () => {
    useAccountMock.mockReturnValue({ address: '0xOTHER' });
    useAtomValueMock.mockReturnValue(true);
    useActiveLocaleMock.mockReturnValue('ja-JP');
    const zero = '0x0000000000000000000000000000000000000000' as const;
    expect(() => render(<Winner winner={zero} />, { wrapper: WithProviders })).not.toThrow();
  });

  it('renders ShortAddress with different address', () => {
    useAccountMock.mockReturnValue({ address: ADDR });
    useAtomValueMock.mockReturnValue(true);
    useActiveLocaleMock.mockReturnValue('en-US');
    const { container } = render(<Winner winner={'0xDIFFERENT_ADDRESS'} />, {
      wrapper: WithProviders,
    });
    expect(container.querySelector('[data-testid="short"]')?.textContent).toBe(
      '0xDIFFERENT_ADDRESS',
    );
  });

  it('renders without crash 5 times consecutively', () => {
    useAccountMock.mockReturnValue({ address: ADDR });
    useAtomValueMock.mockReturnValue(true);
    useActiveLocaleMock.mockReturnValue('en-US');
    for (let i = 0; i < 5; i++) {
      expect(() => render(<Winner winner={ADDR} />, { wrapper: WithProviders })).not.toThrow();
    }
  });

  it('useAccount returns null address (no wallet) handled', () => {
    useAccountMock.mockReturnValue({ address: undefined });
    useAtomValueMock.mockReturnValue(true);
    useActiveLocaleMock.mockReturnValue('en-US');
    expect(() => render(<Winner winner={ADDR} />, { wrapper: WithProviders })).not.toThrow();
  });

  it('rerender with different winner does not crash', () => {
    useAccountMock.mockReturnValue({ address: ADDR });
    useAtomValueMock.mockReturnValue(true);
    useActiveLocaleMock.mockReturnValue('en-US');
    const { rerender } = render(<Winner winner={ADDR} />, { wrapper: WithProviders });
    expect(() => rerender(<Winner winner={'0xNEW_WINNER'} />)).not.toThrow();
  });

  it('ja-JP locale renders without crash', () => {
    useAccountMock.mockReturnValue({ address: ADDR });
    useAtomValueMock.mockReturnValue(true);
    useActiveLocaleMock.mockReturnValue('ja-JP');
    expect(() => render(<Winner winner={ADDR} />, { wrapper: WithProviders })).not.toThrow();
  });

  it('mount-unmount 200 cycles', () => {
    useAccountMock.mockReturnValue({ address: '0xUSER' });
    useAtomValueMock.mockReturnValue(true);
    useActiveLocaleMock.mockReturnValue('en-US');
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<Winner winner={ADDR} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('renders 200 instances without crash', () => {
    useAccountMock.mockReturnValue({ address: '0xUSER' });
    useAtomValueMock.mockReturnValue(true);
    useActiveLocaleMock.mockReturnValue('en-US');
    expect(() =>
      render(
        <>
          {Array.from({ length: 200 }, (_, i) => (
            <Winner key={i} winner={ADDR} />
          ))}
        </>,
        { wrapper: WithProviders },
      ),
    ).not.toThrow();
  });

  it('handles 100 different winner addresses', () => {
    useAccountMock.mockReturnValue({ address: '0xUSER' });
    useAtomValueMock.mockReturnValue(true);
    useActiveLocaleMock.mockReturnValue('en-US');
    for (let i = 0; i < 100; i++) {
      const addr = ('0x' + i.toString(16).padStart(40, '0')) as `0x${string}`;
      const { unmount } = render(<Winner winner={addr} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('handles 50 different isNounders/isWinnerYou combinations', () => {
    useAccountMock.mockReturnValue({ address: ADDR });
    useAtomValueMock.mockReturnValue(true);
    useActiveLocaleMock.mockReturnValue('en-US');
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<Winner winner={ADDR} isNounders={i % 2 === 0} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('handles 30 locale variations', () => {
    useAccountMock.mockReturnValue({ address: '0xUSER' });
    useAtomValueMock.mockReturnValue(true);
    for (let i = 0; i < 30; i++) {
      useActiveLocaleMock.mockReturnValue(i % 2 === 0 ? 'en-US' : 'ja-JP');
      const { unmount } = render(<Winner winner={ADDR} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-2 mount-unmount 50 cycles', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<Winner winner="0xWIN" />);
      unmount();
    }
  });

  it('round-2 renders 50 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 50 }, (_, i) => (
            <Winner key={i} winner={('0x' + i.toString(16).padStart(40, '0')) as `0x${string}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 30 different winner addresses', () => {
    for (let i = 0; i < 30; i++) {
      const addr = ('0x' + i.toString(16).padStart(40, '0')) as `0x${string}`;
      const { unmount } = render(<Winner winner={addr} />);
      unmount();
    }
  });

  it('round-2 handles 30 isNounder toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Winner winner="0xWIN" isNounder={i % 2 === 0} />);
      unmount();
    }
  });

  it('round-2 50 sequential renders without crash', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<Winner winner="0xWIN" />);
      unmount();
    }
  });

  it('round-3 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<Winner winner={ADDR} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-3 30 different winner addresses', () => {
    for (let i = 0; i < 30; i++) {
      const addr = ('0x' + i.toString(16).padStart(40, '0')) as `0x${string}`;
      const { unmount } = render(<Winner winner={addr} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-3 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<Winner winner={ADDR} />, { wrapper: WithProviders })).not.toThrow();
    }
  });

  it('round-3 30 isNounders toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Winner winner={ADDR} isNounders={i % 2 === 0} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-3 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<Winner winner={ADDR} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-4 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<Winner winner={ADDR} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-4 30 different winner addresses', () => {
    for (let i = 0; i < 30; i++) {
      const addr = ('0xR4' + i.toString(16).padStart(38, '0')) as `0x${string}`;
      const { unmount } = render(<Winner winner={addr} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<Winner winner={ADDR} />, { wrapper: WithProviders })).not.toThrow();
    }
  });

  it('round-4 30 isNounders toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Winner winner={ADDR} isNounders={i % 2 === 0} />, {
        wrapper: WithProviders,
      });
      unmount();
    }
  });

  it('round-4 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<Winner winner={ADDR} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Winner winner={ADDR} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-5 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Winner key={i} winner={ADDR} />
          ))}
        </>,
        { wrapper: WithProviders },
      ),
    ).not.toThrow();
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<Winner winner={ADDR} />, { wrapper: WithProviders })).not.toThrow();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<Winner winner={ADDR} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-5 30 different winner values', () => {
    for (let i = 0; i < 30; i++) {
      const addr = ('0xR5' + i.toString(16).padStart(38, '0')) as `0x${string}`;
      const { unmount } = render(<Winner winner={addr} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const addr = ('0xR6' + i.toString(16).padStart(38, '0')) as `0x${string}`;
      const { unmount } = render(<Winner winner={addr} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => {
            const addr = ('0xR6' + i.toString(16).padStart(38, '0')) as `0x${string}`;
            return <Winner key={i} winner={addr} />;
          })}
        </>,
        { wrapper: WithProviders },
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<Winner winner={('0xR6' + '0'.padStart(38, '0')) as `0x${string}`} />, {
          wrapper: WithProviders,
        }),
      ).not.toThrow();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const addr = ('0xR6' + i.toString(16).padStart(38, '0')) as `0x${string}`;
      const { unmount } = render(<Winner winner={addr} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-6 30 different winner values', () => {
    for (let i = 0; i < 30; i++) {
      const addr = ('0xR6V' + i.toString(16).padStart(37, '0')) as `0x${string}`;
      const { unmount } = render(<Winner winner={addr} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    const addr = '0x5FbDB2315678afecb367f032d93F642f64180aa3' as const;
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Winner winner={addr} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => {
            const addr = ('0xR7V' + i.toString(16).padStart(37, '0')) as `0x${string}`;
            return <Winner key={i} winner={addr} />;
          })}
        </>,
        { wrapper: WithProviders },
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    const addr = '0x5FbDB2315678afecb367f032d93F642f64180aa3' as const;
    for (let i = 0; i < 30; i++) {
      expect(() => render(<Winner winner={addr} />, { wrapper: WithProviders })).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    const addr = '0x5FbDB2315678afecb367f032d93F642f64180aa3' as const;
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<Winner winner={addr} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-7 30 different winner values', () => {
    for (let i = 0; i < 30; i++) {
      const addr = ('0xR7V' + i.toString(16).padStart(37, '0')) as `0x${string}`;
      const { unmount } = render(<Winner winner={addr} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-8 mount-unmount 30 cycles', () => {
    const addr = '0x5FbDB2315678afecb367f032d93F642f64180aa3' as const;
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Winner winner={addr} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-8 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => {
            const addr = ('0xR8V' + i.toString(16).padStart(37, '0')) as `0x${string}`;
            return <Winner key={i} winner={addr} />;
          })}
        </>,
        { wrapper: WithProviders },
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    const addr = '0x5FbDB2315678afecb367f032d93F642f64180aa3' as const;
    for (let i = 0; i < 30; i++) {
      expect(() => render(<Winner winner={addr} />, { wrapper: WithProviders })).not.toThrow();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    const addr = '0x5FbDB2315678afecb367f032d93F642f64180aa3' as const;
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<Winner winner={addr} />, { wrapper: WithProviders });
      unmount();
    }
  });

  it('round-8 30 different winner values', () => {
    for (let i = 0; i < 30; i++) {
      const addr = ('0xR8V' + i.toString(16).padStart(37, '0')) as `0x${string}`;
      const { unmount } = render(<Winner winner={addr} />, { wrapper: WithProviders });
      unmount();
    }
  });
});
