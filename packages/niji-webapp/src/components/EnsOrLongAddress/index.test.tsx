import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/utils/ensLookup', () => ({
  useReverseENSLookUp: vi.fn(),
}));

vi.mock('@/utils/moderation/containsBlockedText', () => ({
  containsBlockedText: vi.fn(() => false),
}));

import { useReverseENSLookUp } from '@/utils/ensLookup';
import { containsBlockedText } from '@/utils/moderation/containsBlockedText';

import EnsOrLongAddress from './index';

const ADDR = '0x5FbDB2315678afecb367f032d93F642f64180aa3' as const;

describe('EnsOrLongAddress', () => {
  it('renders ENS name when reverse lookup returns a name', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue('alice.eth');
    vi.mocked(containsBlockedText).mockReturnValue(false);
    const { container } = render(<EnsOrLongAddress address={ADDR} />);
    expect(container.textContent).toBe('alice.eth');
  });

  it('falls back to long address when ENS is undefined', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    const { container } = render(<EnsOrLongAddress address={ADDR} />);
    expect(container.textContent).toBe(ADDR);
  });

  it('falls back to long address when ENS matches blocklist', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue('badword.eth');
    vi.mocked(containsBlockedText).mockReturnValue(true);
    const { container } = render(<EnsOrLongAddress address={ADDR} />);
    expect(container.textContent).toBe(ADDR);
  });

  it('falls back to long address when ENS is empty string', () => {
    // '' は ens && truthy ガードで falsy 扱い、 address にフォールバック
    vi.mocked(useReverseENSLookUp).mockReturnValue('');
    vi.mocked(containsBlockedText).mockReturnValue(false);
    const { container } = render(<EnsOrLongAddress address={ADDR} />);
    expect(container.textContent).toBe(ADDR);
  });

  it('passes the address argument to useReverseENSLookUp', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue('x.eth');
    render(<EnsOrLongAddress address={ADDR} />);
    expect(useReverseENSLookUp).toHaveBeenCalledWith(ADDR);
  });

  it('calls containsBlockedText with English language code', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue('alice.eth');
    vi.mocked(containsBlockedText).mockReturnValue(false);
    render(<EnsOrLongAddress address={ADDR} />);
    expect(containsBlockedText).toHaveBeenCalledWith('alice.eth', 'en');
  });

  it('calls containsBlockedText with empty string when ENS is undefined', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    vi.mocked(containsBlockedText).mockReturnValue(false);
    render(<EnsOrLongAddress address={ADDR} />);
    // `ens || ''` で undefined は '' になる
    expect(containsBlockedText).toHaveBeenCalledWith('', 'en');
  });

  it('renders different address when prop changes', () => {
    const ADDR_B = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' as const;
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    const { container: c1 } = render(<EnsOrLongAddress address={ADDR} />);
    const { container: c2 } = render(<EnsOrLongAddress address={ADDR_B} />);
    expect(c1.textContent).toBe(ADDR);
    expect(c2.textContent).toBe(ADDR_B);
  });

  it('renders short ENS name (3 chars) verbatim', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue('ab.eth');
    vi.mocked(containsBlockedText).mockReturnValue(false);
    const { container } = render(<EnsOrLongAddress address={ADDR} />);
    expect(container.textContent).toBe('ab.eth');
  });

  it('renders very long ENS name (100 chars) verbatim', () => {
    const longEns = 'verylongdomain'.repeat(8) + '.eth';
    vi.mocked(useReverseENSLookUp).mockReturnValue(longEns);
    vi.mocked(containsBlockedText).mockReturnValue(false);
    const { container } = render(<EnsOrLongAddress address={ADDR} />);
    expect(container.textContent).toBe(longEns);
  });

  it('handles ENS=null (cast as undefined-like, falls back)', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(null as never);
    vi.mocked(containsBlockedText).mockReturnValue(false);
    const { container } = render(<EnsOrLongAddress address={ADDR} />);
    expect(container.textContent).toBe(ADDR);
  });

  it('rerender preserves new prop addresss', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    const { container, rerender } = render(<EnsOrLongAddress address={ADDR} />);
    expect(container.textContent).toBe(ADDR);
    const NEW_ADDR = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' as const;
    rerender(<EnsOrLongAddress address={NEW_ADDR} />);
    expect(container.textContent).toBe(NEW_ADDR);
  });

  it('useReverseENSLookUp called once per render', () => {
    vi.mocked(useReverseENSLookUp).mockClear();
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    render(<EnsOrLongAddress address={ADDR} />);
    expect(useReverseENSLookUp).toHaveBeenCalledTimes(1);
  });
});
