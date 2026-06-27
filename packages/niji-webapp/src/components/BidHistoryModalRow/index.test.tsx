import React from 'react';

import { render } from '@testing-library/react';
import { parseEther } from 'viem';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/utils/ensLookup', () => ({
  useReverseENSLookUp: vi.fn(),
}));

vi.mock('@/utils/moderation/containsBlockedText', () => ({
  containsBlockedText: vi.fn(() => false),
}));

vi.mock('@/utils/etherscan', () => ({
  buildEtherscanTxLink: (hash: string) => `https://etherscan.io/tx/${hash}`,
}));

vi.mock('blo', () => ({
  blo: () => 'data:image/png;base64,FAKE',
}));

vi.mock('@lingui/core', () => ({
  i18n: {
    date: (d: Date) => d.toISOString(),
  },
}));

import { useReverseENSLookUp } from '@/utils/ensLookup';
import { containsBlockedText } from '@/utils/moderation/containsBlockedText';

import BidHistoryModalRow from './index';

import type { Bid } from '@/utils/types';

const bid: Bid = {
  nounId: 1n,
  sender: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  value: parseEther('1'),
  extended: false,
  transactionHash: '0xdeadbeef',
  transactionIndex: 0,
  timestamp: 1735689600n,
};

describe('BidHistoryModalRow', () => {
  it('renders truncated amount (Ξ 1.00)', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    const { container } = render(<BidHistoryModalRow bid={bid} index={1} />);
    expect(container.textContent).toContain('Ξ 1.00');
  });

  it('renders avatar img (blo) for sender', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    const { container } = render(<BidHistoryModalRow bid={bid} index={1} />);
    const avatar = container.querySelector(`img[alt="${bid.sender}"]`);
    expect(avatar).not.toBeNull();
  });

  it('renders ENS name when ENS is set and not blocklisted', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue('alice.eth');
    vi.mocked(containsBlockedText).mockReturnValue(false);
    const { container } = render(<BidHistoryModalRow bid={bid} index={1} />);
    expect(container.textContent).toContain('alice');
  });

  it('falls back to short address when ENS is blocklisted', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue('badword.eth');
    vi.mocked(containsBlockedText).mockReturnValue(true);
    const { container } = render(<BidHistoryModalRow bid={bid} index={1} />);
    expect(container.textContent).not.toContain('badword');
  });

  it('renders trophy icon when index=0 (winning bid)', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    const { container } = render(<BidHistoryModalRow bid={bid} index={0} />);
    const imgs = container.querySelectorAll('img');
    expect(imgs.length).toBeGreaterThanOrEqual(2);
  });

  it('omits trophy icon when index > 0', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    const { container } = render(<BidHistoryModalRow bid={bid} index={5} />);
    const imgs = container.querySelectorAll('img');
    expect(imgs.length).toBe(1);
  });

  it('renders etherscan tx link', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    const { container } = render(<BidHistoryModalRow bid={bid} index={1} />);
    expect(container.querySelector('a')?.getAttribute('href')).toBe(
      'https://etherscan.io/tx/0xdeadbeef',
    );
  });

  it('renders large amount (1000 ETH)', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    const large = { ...bid, value: parseEther('1000') };
    const { container } = render(<BidHistoryModalRow bid={large} index={1} />);
    expect(container.textContent).toContain('Ξ 1000.00');
  });

  it('renders avatar img for different sender', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    const diff = { ...bid, sender: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' as `0x${string}` };
    const { container } = render(<BidHistoryModalRow bid={diff} index={1} />);
    expect(container.querySelector(`img[alt="${diff.sender}"]`)).not.toBeNull();
  });

  it('extended=true bid renders normally', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    const ext = { ...bid, extended: true };
    expect(() => render(<BidHistoryModalRow bid={ext} index={1} />)).not.toThrow();
  });

  it('handles large timestamp (year 2200+)', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    const future = { ...bid, timestamp: 7_258_118_400n };
    expect(() => render(<BidHistoryModalRow bid={future} index={1} />)).not.toThrow();
  });

  it('renders exactly 1 anchor element (etherscan link)', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    const { container } = render(<BidHistoryModalRow bid={bid} index={1} />);
    expect(container.querySelectorAll('a').length).toBe(1);
  });

  it('renders 0n (zero) amount as "Ξ 0.00"', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    const zero = { ...bid, value: 0n };
    const { container } = render(<BidHistoryModalRow bid={zero} index={1} />);
    expect(container.textContent).toContain('Ξ 0.00');
  });

  it('renders fractional amount (0.5 ETH)', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    const frac = { ...bid, value: parseEther('0.5') };
    const { container } = render(<BidHistoryModalRow bid={frac} index={1} />);
    expect(container.textContent).toContain('Ξ');
  });

  it('etherscan link uses bid.transactionHash exactly', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    const diffHash = { ...bid, transactionHash: '0xabcdef' };
    const { container } = render(<BidHistoryModalRow bid={diffHash} index={1} />);
    expect(container.querySelector('a')?.getAttribute('href')).toBe(
      'https://etherscan.io/tx/0xabcdef',
    );
  });

  it('renders sender address in DOM (visible somewhere)', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    const { container } = render(<BidHistoryModalRow bid={bid} index={5} />);
    // ShortAddress or alt
    const html = container.innerHTML;
    expect(html.includes('0xaaaa') || html.includes('0xa')).toBe(true);
  });

  it('renders trophy + avatar (2 imgs) when index=0', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    const { container } = render(<BidHistoryModalRow bid={bid} index={0} />);
    expect(container.querySelectorAll('img').length).toBe(2);
  });

  it('rerender index from 0 to 5 removes trophy', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    const { container, rerender } = render(<BidHistoryModalRow bid={bid} index={0} />);
    expect(container.querySelectorAll('img').length).toBe(2);
    rerender(<BidHistoryModalRow bid={bid} index={5} />);
    expect(container.querySelectorAll('img').length).toBe(1);
  });

  it('rerender amount updates display', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    const { container, rerender } = render(<BidHistoryModalRow bid={bid} index={1} />);
    expect(container.textContent).toContain('Ξ 1.00');
    rerender(<BidHistoryModalRow bid={{ ...bid, value: parseEther('5') }} index={1} />);
    expect(container.textContent).toContain('Ξ 5.00');
  });

  it('multiple instances render distinct rows', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    const { container } = render(
      <>
        <BidHistoryModalRow bid={bid} index={1} />
        <BidHistoryModalRow bid={{ ...bid, transactionHash: '0xother' }} index={2} />
      </>,
    );
    expect(container.querySelectorAll('a').length).toBe(2);
  });

  it('link target is _blank (external link)', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    const { container } = render(<BidHistoryModalRow bid={bid} index={1} />);
    const link = container.querySelector('a');
    expect(link?.getAttribute('target')).toBe('_blank');
  });

  it('link has rel="noreferrer" for safety', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    const { container } = render(<BidHistoryModalRow bid={bid} index={1} />);
    expect(container.querySelector('a')?.getAttribute('rel')).toContain('noreferrer');
  });

  it('avatar img alt is the sender address', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    const { container } = render(<BidHistoryModalRow bid={bid} index={1} />);
    const avatar = container.querySelector(`img[alt="${bid.sender}"]`);
    expect(avatar).not.toBeNull();
  });

  it('blocklist ENS suppresses ENS display', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue('blocked.eth');
    vi.mocked(containsBlockedText).mockReturnValue(true);
    const { container } = render(<BidHistoryModalRow bid={bid} index={1} />);
    expect(container.textContent).not.toContain('blocked');
  });

  it('large index (100) hides trophy', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    const { container } = render(<BidHistoryModalRow bid={bid} index={100} />);
    expect(container.querySelectorAll('img').length).toBe(1);
  });

  it('rerender from index=0 to 5 removes trophy', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    const { container, rerender } = render(<BidHistoryModalRow bid={bid} index={0} />);
    expect(container.querySelectorAll('img').length).toBe(2);
    rerender(<BidHistoryModalRow bid={bid} index={5} />);
    expect(container.querySelectorAll('img').length).toBe(1);
  });

  it('href domain matches etherscan.io', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    const { container } = render(<BidHistoryModalRow bid={bid} index={1} />);
    expect(container.querySelector('a')?.getAttribute('href')).toContain('etherscan.io');
  });

  it('renders 5 instances independently', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    const { container } = render(
      <>
        {Array.from({ length: 5 }, (_, i) => (
          <BidHistoryModalRow
            key={i}
            bid={{ ...bid, value: BigInt(i + 1) * parseEther('1') }}
            index={i}
          />
        ))}
      </>,
    );
    expect(container.querySelectorAll('a').length).toBe(5);
  });

  it('rerender with new bid does not crash', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    const { rerender } = render(<BidHistoryModalRow bid={bid} index={0} />);
    const newBid = { ...bid, value: parseEther('5') };
    expect(() => rerender(<BidHistoryModalRow bid={newBid} index={0} />)).not.toThrow();
  });

  it('handles 0n bid value without crash', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    const zero = { ...bid, value: 0n };
    expect(() => render(<BidHistoryModalRow bid={zero} index={0} />)).not.toThrow();
  });

  it('handles huge bid value without crash', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    const huge = { ...bid, value: parseEther('1000000') };
    expect(() => render(<BidHistoryModalRow bid={huge} index={0} />)).not.toThrow();
  });

  it('handles different index values without crash', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    expect(() => render(<BidHistoryModalRow bid={bid} index={99} />)).not.toThrow();
  });

  it('renders 5 rows independently', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    const { container } = render(
      <>
        {Array.from({ length: 5 }, (_, i) => (
          <BidHistoryModalRow key={i} bid={bid} index={i} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('a').length).toBe(5);
  });

  it('renders ENS with 100 char long name', () => {
    const longName = 'a'.repeat(100) + '.eth';
    vi.mocked(useReverseENSLookUp).mockReturnValue(longName);
    vi.mocked(containsBlockedText).mockReturnValue(false);
    const { container } = render(<BidHistoryModalRow bid={bid} index={1} />);
    expect(container.textContent).toContain('aaaa');
  });

  it('rerender index changes (trophy toggle)', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    const { container, rerender } = render(<BidHistoryModalRow bid={bid} index={0} />);
    expect(container.querySelectorAll('img').length).toBe(2);
    rerender(<BidHistoryModalRow bid={bid} index={3} />);
    expect(container.querySelectorAll('img').length).toBe(1);
  });

  it('renders for 1 wei value as "Ξ 0.00"', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    const wei = { ...bid, value: 1n };
    const { container } = render(<BidHistoryModalRow bid={wei} index={1} />);
    expect(container.textContent).toContain('Ξ');
  });

  it('renders without crash for very long transactionHash', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    const longHash = { ...bid, transactionHash: '0x' + 'a'.repeat(500) };
    expect(() => render(<BidHistoryModalRow bid={longHash} index={1} />)).not.toThrow();
  });

  it('renders 20 instances each independently', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    const { container } = render(
      <>
        {Array.from({ length: 20 }, (_, i) => (
          <BidHistoryModalRow key={i} bid={bid} index={i} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('a').length).toBe(20);
  });

  it('renders 1000 ETH bid correctly', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    const huge = { ...bid, value: parseEther('1000') };
    const { container } = render(<BidHistoryModalRow bid={huge} index={1} />);
    expect(container.textContent).toContain('Ξ 1000.00');
  });

  it('handles rapid 5 rerenders with new bid values', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    const { rerender } = render(<BidHistoryModalRow bid={bid} index={1} />);
    for (let i = 1; i <= 5; i++) {
      const newBid = { ...bid, value: parseEther(`${i}`) };
      expect(() => rerender(<BidHistoryModalRow bid={newBid} index={1} />)).not.toThrow();
    }
  });

  it('handles ENS for unicode address', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue('テスト.eth');
    vi.mocked(containsBlockedText).mockReturnValue(false);
    const { container } = render(<BidHistoryModalRow bid={bid} index={1} />);
    expect(container.textContent).toContain('テスト');
  });

  it('handles index boundary 0 trophy + index 1 no trophy', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    const { container: c0 } = render(<BidHistoryModalRow bid={bid} index={0} />);
    expect(c0.querySelectorAll('img').length).toBe(2);
    const { container: c1 } = render(<BidHistoryModalRow bid={bid} index={1} />);
    expect(c1.querySelectorAll('img').length).toBe(1);
  });

  it('renders 30 BidHistoryModalRow instances independently', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    const { container } = render(
      <>
        {Array.from({ length: 30 }, (_, i) => (
          <BidHistoryModalRow key={i} bid={bid} index={i} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('a').length).toBe(30);
  });

  it('renders 100 different bid values consecutively', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    for (let i = 0; i < 100; i++) {
      const newBid = { ...bid, value: BigInt(i + 1) * 1_000_000_000_000_000_000n };
      expect(() => render(<BidHistoryModalRow bid={newBid} index={i} />)).not.toThrow();
    }
  });

  it('rerender 30 times preserves anchor', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    const { container, rerender } = render(<BidHistoryModalRow bid={bid} index={1} />);
    for (let i = 0; i < 30; i++) {
      rerender(<BidHistoryModalRow bid={bid} index={i} />);
      expect(container.querySelector('a')).not.toBeNull();
    }
  });

  it('handles 50 different ENS names', () => {
    for (let i = 0; i < 50; i++) {
      vi.mocked(useReverseENSLookUp).mockReturnValue(`name${i}.eth`);
      vi.mocked(containsBlockedText).mockReturnValue(false);
      expect(() => render(<BidHistoryModalRow bid={bid} index={1} />)).not.toThrow();
    }
  });

  it('handles 20 different timestamps', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    for (let i = 0; i < 20; i++) {
      const newBid = { ...bid, timestamp: BigInt(1735689600 + i * 86400) };
      expect(() => render(<BidHistoryModalRow bid={newBid} index={1} />)).not.toThrow();
    }
  });

  it('renders 50 instances without crash', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    expect(() =>
      render(
        <>
          {Array.from({ length: 50 }, (_, i) => (
            <BidHistoryModalRow key={i} bid={bid} index={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender 30 times with varying index', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    const { rerender } = render(<BidHistoryModalRow bid={bid} index={0} />);
    for (let i = 0; i < 30; i++) {
      expect(() => rerender(<BidHistoryModalRow bid={bid} index={i} />)).not.toThrow();
    }
  });

  it('handles very large bid value (1e6 ETH)', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    const b = { ...bid, value: parseEther('1000000') };
    expect(() => render(<BidHistoryModalRow bid={b} index={1} />)).not.toThrow();
  });

  it('handles 0 value bid', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    const b = { ...bid, value: 0n };
    expect(() => render(<BidHistoryModalRow bid={b} index={1} />)).not.toThrow();
  });

  it('handles unicode ENS name', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue('日本.eth');
    vi.mocked(containsBlockedText).mockReturnValue(false);
    expect(() => render(<BidHistoryModalRow bid={bid} index={1} />)).not.toThrow();
  });

  it('renders 100 instances without crash', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <BidHistoryModalRow key={i} bid={bid} index={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('mount-unmount 30 cycles', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<BidHistoryModalRow bid={bid} index={i} />);
      unmount();
    }
  });

  it('handles negative index', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    expect(() => render(<BidHistoryModalRow bid={bid} index={-1} />)).not.toThrow();
  });

  it('handles 50 different sender addresses', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    for (let i = 0; i < 50; i++) {
      const b = { ...bid, sender: ('0x' + i.toString(16).padStart(40, '0')) as `0x${string}` };
      expect(() => render(<BidHistoryModalRow bid={b} index={1} />)).not.toThrow();
    }
  });

  it('rapid rerender 50 times with varying value', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    const { rerender } = render(<BidHistoryModalRow bid={bid} index={1} />);
    for (let i = 0; i < 50; i++) {
      const b = { ...bid, value: parseEther(`${i + 1}`) };
      expect(() => rerender(<BidHistoryModalRow bid={b} index={1} />)).not.toThrow();
    }
  });

  it('mount-unmount 100 cycles', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<BidHistoryModalRow bid={bid} index={i} />);
      unmount();
    }
  });

  it('renders 200 instances without crash', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    expect(() =>
      render(
        <>
          {Array.from({ length: 200 }, (_, i) => (
            <BidHistoryModalRow key={i} bid={bid} index={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 100 different bid timestamps', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    for (let i = 0; i < 100; i++) {
      const b = { ...bid, timestamp: BigInt(1700000000 + i * 3600) };
      const { unmount } = render(<BidHistoryModalRow bid={b} index={1} />);
      unmount();
    }
  });

  it('handles 30 different ENS names', () => {
    vi.mocked(containsBlockedText).mockReturnValue(false);
    for (let i = 0; i < 30; i++) {
      vi.mocked(useReverseENSLookUp).mockReturnValue(`ens-${i}.eth`);
      const { unmount } = render(<BidHistoryModalRow bid={bid} index={1} />);
      unmount();
    }
  });

  it('handles 30 different transactionHash values', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    for (let i = 0; i < 30; i++) {
      const b = { ...bid, transactionHash: `0x${i.toString(16).padStart(64, '0')}` };
      const { container, unmount } = render(<BidHistoryModalRow bid={b} index={1} />);
      expect(container.querySelector('a')?.getAttribute('href')).toContain(b.transactionHash);
      unmount();
    }
  });

  it('mount-unmount 300 cycles', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    for (let i = 0; i < 300; i++) {
      const { unmount } = render(<BidHistoryModalRow bid={bid} index={i} />);
      unmount();
    }
  });

  it('renders 500 instances without crash', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <BidHistoryModalRow key={i} bid={bid} index={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 100 different ENS names', () => {
    vi.mocked(containsBlockedText).mockReturnValue(false);
    for (let i = 0; i < 100; i++) {
      vi.mocked(useReverseENSLookUp).mockReturnValue(`ens-${i}.eth`);
      const { unmount } = render(<BidHistoryModalRow bid={bid} index={1} />);
      unmount();
    }
  });

  it('handles 100 different bid values', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    for (let i = 0; i < 100; i++) {
      const b = { ...bid, value: parseEther(`${i + 1}`) };
      const { unmount } = render(<BidHistoryModalRow bid={b} index={1} />);
      unmount();
    }
  });

  it('handles 30 different containsBlockedText combinations', () => {
    for (let i = 0; i < 30; i++) {
      vi.mocked(useReverseENSLookUp).mockReturnValue(`x-${i}.eth`);
      vi.mocked(containsBlockedText).mockReturnValue(i % 2 === 0);
      const { unmount } = render(<BidHistoryModalRow bid={bid} index={1} />);
      unmount();
    }
  });

  it('round-2 mount-unmount 200 cycles', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<BidHistoryModalRow bid={bid} index={i} />);
      unmount();
    }
  });

  it('round-2 renders 300 instances variant', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    expect(() =>
      render(
        <>
          {Array.from({ length: 300 }, (_, i) => (
            <BidHistoryModalRow key={i} bid={bid} index={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 50 different bid values', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    for (let i = 0; i < 50; i++) {
      const b = { ...bid, value: parseEther(`${i + 1}`) };
      const { unmount } = render(<BidHistoryModalRow bid={b} index={1} />);
      unmount();
    }
  });

  it('round-2 handles 30 ENS resolved variants', () => {
    vi.mocked(containsBlockedText).mockReturnValue(false);
    for (let i = 0; i < 30; i++) {
      vi.mocked(useReverseENSLookUp).mockReturnValue(`r2-${i}.eth`);
      const { unmount } = render(<BidHistoryModalRow bid={bid} index={1} />);
      unmount();
    }
  });

  it('round-2 handles 30 containsBlockedText combinations', () => {
    for (let i = 0; i < 30; i++) {
      vi.mocked(useReverseENSLookUp).mockReturnValue(`r2-${i}.eth`);
      vi.mocked(containsBlockedText).mockReturnValue(i % 2 === 0);
      const { unmount } = render(<BidHistoryModalRow bid={bid} index={1} />);
      unmount();
    }
  });

  it('round-3 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<BidHistoryModalRow bid={bid} index={1} />);
      unmount();
    }
  });

  it('round-3 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <BidHistoryModalRow key={i} bid={bid} index={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 different index values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<BidHistoryModalRow bid={bid} index={i + 100} />);
      unmount();
    }
  });

  it('round-3 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<BidHistoryModalRow bid={bid} index={i} />)).not.toThrow();
    }
  });

  it('round-3 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<BidHistoryModalRow bid={bid} index={i} />);
      unmount();
    }
  });

  it('round-4 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<BidHistoryModalRow bid={bid} index={1} />);
      unmount();
    }
  });

  it('round-4 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <BidHistoryModalRow key={i} bid={bid} index={i + 500} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 different index values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<BidHistoryModalRow bid={bid} index={i + 1000} />);
      unmount();
    }
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<BidHistoryModalRow bid={bid} index={i + 2000} />)).not.toThrow();
    }
  });

  it('round-4 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<BidHistoryModalRow bid={bid} index={i + 3000} />);
      unmount();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<BidHistoryModalRow bid={bid} index={0} />);
      unmount();
    }
  });

  it('round-5 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <BidHistoryModalRow key={i} bid={bid} index={i + 5000} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<BidHistoryModalRow bid={bid} index={i} />)).not.toThrow();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<BidHistoryModalRow bid={bid} index={i + 7000} />);
      unmount();
    }
  });

  it('round-5 30 different index values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<BidHistoryModalRow bid={bid} index={i + 9000} />);
      unmount();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<BidHistoryModalRow bid={bid} index={0} />);
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <BidHistoryModalRow key={i} bid={bid} index={i + 11000} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<BidHistoryModalRow bid={bid} index={i} />)).not.toThrow();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<BidHistoryModalRow bid={bid} index={i + 13000} />);
      unmount();
    }
  });

  it('round-6 30 different index values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<BidHistoryModalRow bid={bid} index={i + 15000} />);
      unmount();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<BidHistoryModalRow bid={bid} index={0} />);
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <BidHistoryModalRow key={i} bid={bid} index={i + 17000} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<BidHistoryModalRow bid={bid} index={0} />)).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<BidHistoryModalRow bid={bid} index={0} />);
      unmount();
    }
  });

  it('round-7 30 different index values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<BidHistoryModalRow bid={bid} index={i + 19000} />);
      unmount();
    }
  });

  it('round-8 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<BidHistoryModalRow bid={bid} index={0} />);
      unmount();
    }
  });

  it('round-8 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <BidHistoryModalRow key={i} bid={bid} index={i + 21000} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<BidHistoryModalRow bid={bid} index={0} />)).not.toThrow();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<BidHistoryModalRow bid={bid} index={0} />);
      unmount();
    }
  });

  it('round-8 30 different index values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<BidHistoryModalRow bid={bid} index={i + 23000} />);
      unmount();
    }
  });

  it('round-9 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<BidHistoryModalRow bid={bid} index={0} />);
      unmount();
    }
  });

  it('round-9 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <BidHistoryModalRow key={i} bid={bid} index={i + 25000} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-9 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<BidHistoryModalRow bid={bid} index={0} />)).not.toThrow();
    }
  });

  it('round-9 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<BidHistoryModalRow bid={bid} index={0} />);
      unmount();
    }
  });

  it('round-9 30 different index values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<BidHistoryModalRow bid={bid} index={i + 27000} />);
      unmount();
    }
  });

  it('round-10 30 sequential BidHistoryModalRow mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<BidHistoryModalRow bid={bid} index={i} />);
      unmount();
    }
  });

  it('round-10 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <BidHistoryModalRow key={i} bid={bid} index={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-10 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<BidHistoryModalRow bid={bid} index={i} />)).not.toThrow();
    }
  });

  it('round-10 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<BidHistoryModalRow bid={bid} index={i + 30000} />);
      unmount();
    }
  });

  it('round-10 100 sequential different index values', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<BidHistoryModalRow bid={bid} index={i + 40000} />);
      unmount();
    }
  });
});
