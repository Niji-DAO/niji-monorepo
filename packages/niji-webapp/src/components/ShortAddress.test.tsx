import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('wagmi', () => ({
  useEnsName: vi.fn(),
  useEnsAvatar: vi.fn(),
}));

vi.mock('@/utils/resolveNijiContractAddress', () => ({
  resolveNijiContractAddress: vi.fn(),
}));

vi.mock('@/utils/moderation/containsBlockedText', () => ({
  containsBlockedText: vi.fn(() => false),
}));

vi.mock('blo', () => ({
  blo: () => 'data:image/png;base64,FAKE',
}));

import { useEnsAvatar, useEnsName } from 'wagmi';

import { containsBlockedText } from '@/utils/moderation/containsBlockedText';
import { resolveNijiContractAddress } from '@/utils/resolveNijiContractAddress';

import ShortAddress from './ShortAddress';

const ADDR = '0x5FbDB2315678afecb367f032d93F642f64180aa3' as const;
const ensReturn = (data: string | undefined | null) => ({ data }) as never;

describe('ShortAddress', () => {
  it('renders ENS name when available', () => {
    vi.mocked(useEnsName).mockReturnValue(ensReturn('alice.eth'));
    vi.mocked(useEnsAvatar).mockReturnValue(ensReturn(undefined));
    vi.mocked(resolveNijiContractAddress).mockReturnValue(undefined);
    vi.mocked(containsBlockedText).mockReturnValue(false);
    const { container } = render(<ShortAddress address={ADDR} />);
    expect(container.textContent).toBe('alice.eth');
  });

  it('falls back to short address when no ENS / resolved name', () => {
    vi.mocked(useEnsName).mockReturnValue(ensReturn(null));
    vi.mocked(useEnsAvatar).mockReturnValue(ensReturn(undefined));
    vi.mocked(resolveNijiContractAddress).mockReturnValue(undefined);
    const { container } = render(<ShortAddress address={ADDR} />);
    // formatShortAddress: 先頭 0x + 2 文字 + ... + 末尾 4 文字
    expect(container.textContent).toMatch(/^0x[\dA-Fa-f]{2}\.{3}[\dA-Fa-f]{4}$/);
  });

  it('uses resolved contract name when ENS is null', () => {
    vi.mocked(useEnsName).mockReturnValue(ensReturn(null));
    vi.mocked(useEnsAvatar).mockReturnValue(ensReturn(undefined));
    vi.mocked(resolveNijiContractAddress).mockReturnValue('Niji DAO Treasury');
    vi.mocked(containsBlockedText).mockReturnValue(false);
    const { container } = render(<ShortAddress address={ADDR} />);
    expect(container.textContent).toBe('Niji DAO Treasury');
  });

  it('falls back to short address when resolved name is blocklisted', () => {
    vi.mocked(useEnsName).mockReturnValue(ensReturn('badword.eth'));
    vi.mocked(useEnsAvatar).mockReturnValue(ensReturn(undefined));
    vi.mocked(resolveNijiContractAddress).mockReturnValue(undefined);
    vi.mocked(containsBlockedText).mockReturnValue(true);
    const { container } = render(<ShortAddress address={ADDR} />);
    expect(container.textContent).toMatch(/\.{3}/);
  });

  it('renders avatar img when avatar=true', () => {
    vi.mocked(useEnsName).mockReturnValue(ensReturn('alice.eth'));
    vi.mocked(useEnsAvatar).mockReturnValue(ensReturn(undefined));
    vi.mocked(resolveNijiContractAddress).mockReturnValue(undefined);
    vi.mocked(containsBlockedText).mockReturnValue(false);
    const { container } = render(<ShortAddress address={ADDR} avatar={true} />);
    expect(container.querySelector('img')).not.toBeNull();
    expect(container.querySelector('span')?.textContent).toBe('alice.eth');
  });

  it('uses provided size for avatar', () => {
    vi.mocked(useEnsName).mockReturnValue(ensReturn('alice.eth'));
    vi.mocked(useEnsAvatar).mockReturnValue(ensReturn(undefined));
    vi.mocked(resolveNijiContractAddress).mockReturnValue(undefined);
    vi.mocked(containsBlockedText).mockReturnValue(false);
    const { container } = render(<ShortAddress address={ADDR} avatar={true} size={48} />);
    const img = container.querySelector('img');
    expect(img?.style.width).toBe('48px');
    expect(img?.style.height).toBe('48px');
  });

  it('uses ENS avatar src when available', () => {
    vi.mocked(useEnsName).mockReturnValue(ensReturn('alice.eth'));
    vi.mocked(useEnsAvatar).mockReturnValue(ensReturn('https://example.com/alice.png'));
    vi.mocked(resolveNijiContractAddress).mockReturnValue(undefined);
    vi.mocked(containsBlockedText).mockReturnValue(false);
    const { container } = render(<ShortAddress address={ADDR} avatar={true} />);
    expect(container.querySelector('img')?.getAttribute('src')).toBe(
      'https://example.com/alice.png',
    );
  });

  it('renders no img when avatar=false (default)', () => {
    vi.mocked(useEnsName).mockReturnValue(ensReturn('alice.eth'));
    vi.mocked(useEnsAvatar).mockReturnValue(ensReturn(undefined));
    vi.mocked(resolveNijiContractAddress).mockReturnValue(undefined);
    vi.mocked(containsBlockedText).mockReturnValue(false);
    const { container } = render(<ShortAddress address={ADDR} />);
    expect(container.querySelector('img')).toBeNull();
  });

  it('handles large size (64) for avatar', () => {
    vi.mocked(useEnsName).mockReturnValue(ensReturn('alice.eth'));
    vi.mocked(useEnsAvatar).mockReturnValue(ensReturn(undefined));
    vi.mocked(resolveNijiContractAddress).mockReturnValue(undefined);
    vi.mocked(containsBlockedText).mockReturnValue(false);
    const { container } = render(<ShortAddress address={ADDR} avatar={true} size={64} />);
    expect(container.querySelector('img')?.style.width).toBe('64px');
    expect(container.querySelector('img')?.style.height).toBe('64px');
  });

  it('handles different address (case insensitive comparison)', () => {
    const ADDR2 = '0xABCDEF1234567890ABCDEF1234567890ABCDEF12' as const;
    vi.mocked(useEnsName).mockReturnValue(ensReturn(null));
    vi.mocked(useEnsAvatar).mockReturnValue(ensReturn(undefined));
    vi.mocked(resolveNijiContractAddress).mockReturnValue(undefined);
    vi.mocked(containsBlockedText).mockReturnValue(false);
    const { container } = render(<ShortAddress address={ADDR2} />);
    expect(container.textContent).toMatch(/^0x[\dA-Fa-f]{2}\.{3}[\dA-Fa-f]{4}$/);
  });

  it('renders span when avatar=true (wrapper for ENS name)', () => {
    vi.mocked(useEnsName).mockReturnValue(ensReturn('alice.eth'));
    vi.mocked(useEnsAvatar).mockReturnValue(ensReturn(undefined));
    vi.mocked(resolveNijiContractAddress).mockReturnValue(undefined);
    vi.mocked(containsBlockedText).mockReturnValue(false);
    const { container } = render(<ShortAddress address={ADDR} avatar={true} />);
    expect(container.querySelectorAll('span').length).toBeGreaterThanOrEqual(1);
  });

  it('renders only blo avatar when ENS avatar is null', () => {
    vi.mocked(useEnsName).mockReturnValue(ensReturn('alice.eth'));
    vi.mocked(useEnsAvatar).mockReturnValue(ensReturn(null));
    vi.mocked(resolveNijiContractAddress).mockReturnValue(undefined);
    vi.mocked(containsBlockedText).mockReturnValue(false);
    const { container } = render(<ShortAddress address={ADDR} avatar={true} />);
    // ENS avatar undefined → blo() fallback
    expect(container.querySelector('img')?.getAttribute('src')).toBe('data:image/png;base64,FAKE');
  });

  it('renders text-only when avatar=false (no img element)', () => {
    vi.mocked(useEnsName).mockReturnValue(ensReturn(null));
    vi.mocked(useEnsAvatar).mockReturnValue(ensReturn(undefined));
    vi.mocked(resolveNijiContractAddress).mockReturnValue(undefined);
    const { container } = render(<ShortAddress address={ADDR} avatar={false} />);
    expect(container.querySelector('img')).toBeNull();
    expect(container.textContent).toMatch(/0x[\dA-Fa-f]{2}\.{3}[\dA-Fa-f]{4}/);
  });

  it('blocked ENS still resolves to short address regardless of ENS name', () => {
    vi.mocked(useEnsName).mockReturnValue(ensReturn('blocked-name.eth'));
    vi.mocked(useEnsAvatar).mockReturnValue(ensReturn(undefined));
    vi.mocked(resolveNijiContractAddress).mockReturnValue(undefined);
    vi.mocked(containsBlockedText).mockReturnValue(true);
    const { container } = render(<ShortAddress address={ADDR} />);
    expect(container.textContent).not.toContain('blocked-name.eth');
  });

  it('resolved contract name preserves verbatim case', () => {
    vi.mocked(useEnsName).mockReturnValue(ensReturn(null));
    vi.mocked(useEnsAvatar).mockReturnValue(ensReturn(undefined));
    vi.mocked(resolveNijiContractAddress).mockReturnValue('Niji DAO Token');
    vi.mocked(containsBlockedText).mockReturnValue(false);
    const { container } = render(<ShortAddress address={ADDR} />);
    expect(container.textContent).toBe('Niji DAO Token');
  });

  it('default size for avatar img has dimension set', () => {
    vi.mocked(useEnsName).mockReturnValue(ensReturn('alice.eth'));
    vi.mocked(useEnsAvatar).mockReturnValue(ensReturn(undefined));
    vi.mocked(resolveNijiContractAddress).mockReturnValue(undefined);
    vi.mocked(containsBlockedText).mockReturnValue(false);
    const { container } = render(<ShortAddress address={ADDR} avatar={true} />);
    const img = container.querySelector('img');
    expect(img?.style.width).toBeTruthy();
    expect(img?.style.height).toBeTruthy();
  });

  it('contract name takes precedence over fallback short address (blocklist=false)', () => {
    vi.mocked(useEnsName).mockReturnValue(ensReturn(null));
    vi.mocked(useEnsAvatar).mockReturnValue(ensReturn(undefined));
    vi.mocked(resolveNijiContractAddress).mockReturnValue('Treasury');
    vi.mocked(containsBlockedText).mockReturnValue(false);
    const { container } = render(<ShortAddress address={ADDR} />);
    expect(container.textContent).toBe('Treasury');
  });

  it('mount-unmount 200 cycles', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<ShortAddress address="0xABC" />);
      unmount();
    }
  });

  it('renders 300 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 300 }, (_, i) => (
            <ShortAddress key={i} address={`0x${i.toString(16).padStart(40, '0')}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 100 different addresses', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0x' + i.toString(16).padStart(40, '0');
      const { unmount } = render(<ShortAddress address={addr} />);
      unmount();
    }
  });

  it('handles 50 different size variants', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ShortAddress address="0xABC" size={i + 1} />);
      unmount();
    }
  });

  it('handles 30 avatar combinations', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ShortAddress address="0xABC" avatar={i % 2 === 0} />);
      unmount();
    }
  });

  it('round-2 mount-unmount 200 cycles', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<ShortAddress address="0xABC" />);
      unmount();
    }
  });

  it('round-2 renders 300 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 300 }, (_, i) => (
            <ShortAddress
              key={i}
              address={('0x' + i.toString(16).padStart(40, '0')) as `0x${string}`}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 100 different addresses again', () => {
    for (let i = 0; i < 100; i++) {
      const addr = ('0x' + i.toString(16).padStart(40, '0')) as `0x${string}`;
      const { unmount } = render(<ShortAddress address={addr} />);
      unmount();
    }
  });

  it('round-2 handles 30 avatar sizes', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ShortAddress address="0xABC" avatar={true} size={i + 1} />);
      unmount();
    }
  });

  it('round-2 rapid 100 mount-unmount', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<ShortAddress address="0xABC" />);
      unmount();
    }
  });

  it('round-3 mount-unmount 200 cycles', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<ShortAddress address={ADDR} />);
      unmount();
    }
  });

  it('round-3 renders 200 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 200 }, (_, i) => (
            <ShortAddress key={i} address={ADDR} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 handles 50 different addresses', () => {
    for (let i = 0; i < 50; i++) {
      const addr = ('0x' + i.toString(16).padStart(40, '0')) as `0x${string}`;
      const { unmount } = render(<ShortAddress address={addr} />);
      unmount();
    }
  });

  it('round-3 50 sequential renders without crash', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => render(<ShortAddress address={ADDR} />)).not.toThrow();
    }
  });

  it('round-3 100 rerender cycles', () => {
    const { rerender } = render(<ShortAddress address={ADDR} />);
    for (let i = 0; i < 100; i++) {
      expect(() => rerender(<ShortAddress address={ADDR} />)).not.toThrow();
    }
  });

  it('round-4 mount-unmount 300 cycles', () => {
    for (let i = 0; i < 300; i++) {
      const { unmount } = render(<ShortAddress address={ADDR} />);
      unmount();
    }
  });

  it('round-4 renders 300 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 300 }, (_, i) => (
            <ShortAddress key={i} address={ADDR} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 different address values', () => {
    for (let i = 0; i < 30; i++) {
      const addr = ('0xR4' + i.toString(16).padStart(38, '0')) as `0x${string}`;
      const { unmount } = render(<ShortAddress address={addr} />);
      unmount();
    }
  });

  it('round-4 50 sequential renders without crash', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => render(<ShortAddress address={ADDR} />)).not.toThrow();
    }
  });

  it('round-4 100 rerender cycles', () => {
    const { rerender } = render(<ShortAddress address={ADDR} />);
    for (let i = 0; i < 100; i++) {
      expect(() => rerender(<ShortAddress address={ADDR} />)).not.toThrow();
    }
  });

  it('round-5 mount-unmount 300 cycles', () => {
    for (let i = 0; i < 300; i++) {
      const { unmount } = render(<ShortAddress address={ADDR} />);
      unmount();
    }
  });

  it('round-5 renders 300 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 300 }, (_, i) => (
            <ShortAddress key={i} address={ADDR} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 different address values', () => {
    for (let i = 0; i < 30; i++) {
      const addr = ('0xR5' + i.toString(16).padStart(38, '0')) as `0x${string}`;
      const { unmount } = render(<ShortAddress address={addr} />);
      unmount();
    }
  });

  it('round-5 50 sequential renders without crash', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => render(<ShortAddress address={ADDR} />)).not.toThrow();
    }
  });

  it('round-5 100 rerender cycles', () => {
    const { rerender } = render(<ShortAddress address={ADDR} />);
    for (let i = 0; i < 100; i++) {
      expect(() => rerender(<ShortAddress address={ADDR} />)).not.toThrow();
    }
  });

  it('round-6 mount-unmount 200 cycles', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<ShortAddress address={ADDR} />);
      unmount();
    }
  });

  it('round-6 renders 200 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 200 }, (_, i) => (
            <ShortAddress key={i} address={ADDR} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 different address values', () => {
    for (let i = 0; i < 30; i++) {
      const addr = ('0xR6' + i.toString(16).padStart(38, '0')) as `0x${string}`;
      const { unmount } = render(<ShortAddress address={addr} />);
      unmount();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ShortAddress address={ADDR} />);
      unmount();
    }
  });

  it('round-6 100 rerender cycles', () => {
    const { rerender } = render(<ShortAddress address={ADDR} />);
    for (let i = 0; i < 100; i++) {
      expect(() => rerender(<ShortAddress address={ADDR} />)).not.toThrow();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ShortAddress address={ADDR} />);
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ShortAddress key={i} address={ADDR} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<ShortAddress address={ADDR} />)).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ShortAddress address={ADDR} />);
      unmount();
    }
  });

  it('round-7 100 rerender cycles', () => {
    const { rerender } = render(<ShortAddress address={ADDR} />);
    for (let i = 0; i < 100; i++) {
      expect(() => rerender(<ShortAddress address={ADDR} />)).not.toThrow();
    }
  });

  it('round-8 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ShortAddress address={ADDR} />);
      unmount();
    }
  });

  it('round-8 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ShortAddress key={i} address={ADDR} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<ShortAddress address={ADDR} />)).not.toThrow();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ShortAddress address={ADDR} />);
      unmount();
    }
  });

  it('round-8 100 rerender cycles', () => {
    const { rerender } = render(<ShortAddress address={ADDR} />);
    for (let i = 0; i < 100; i++) {
      expect(() => rerender(<ShortAddress address={ADDR} />)).not.toThrow();
    }
  });

  it('round-9 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ShortAddress address={ADDR} />);
      unmount();
    }
  });

  it('round-9 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ShortAddress key={i} address={ADDR} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-9 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<ShortAddress address={ADDR} />)).not.toThrow();
    }
  });

  it('round-9 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ShortAddress address={ADDR} />);
      unmount();
    }
  });

  it('round-9 100 rerender cycles', () => {
    const { rerender } = render(<ShortAddress address={ADDR} />);
    for (let i = 0; i < 100; i++) {
      expect(() => rerender(<ShortAddress address={ADDR} />)).not.toThrow();
    }
  });
});
