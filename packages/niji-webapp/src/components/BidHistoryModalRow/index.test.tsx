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
});
