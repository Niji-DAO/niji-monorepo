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
});
