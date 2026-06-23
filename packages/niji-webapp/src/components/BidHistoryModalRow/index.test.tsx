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
});
