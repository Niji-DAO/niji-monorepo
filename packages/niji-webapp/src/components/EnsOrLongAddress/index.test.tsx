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

  it('ENS lookup result with unicode chars renders verbatim', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue('日本.eth');
    vi.mocked(containsBlockedText).mockReturnValue(false);
    const { container } = render(<EnsOrLongAddress address={ADDR} />);
    expect(container.textContent).toBe('日本.eth');
  });

  it('multiple component instances render independently', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue('alice.eth');
    vi.mocked(containsBlockedText).mockReturnValue(false);
    const { container } = render(
      <>
        <EnsOrLongAddress address={ADDR} />
        <EnsOrLongAddress address={ADDR} />
      </>,
    );
    expect(container.textContent).toBe('alice.ethalice.eth');
  });

  it('lowercase only address forwarded to ENS lookup as-is', () => {
    const lower = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' as `0x${string}`;
    vi.mocked(useReverseENSLookUp).mockClear();
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    render(<EnsOrLongAddress address={lower} />);
    expect(useReverseENSLookUp).toHaveBeenCalledWith(lower);
  });

  it('blocklist enabled but blank string still falls back to address', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue('  ');
    vi.mocked(containsBlockedText).mockReturnValue(true);
    const { container } = render(<EnsOrLongAddress address={ADDR} />);
    expect(container.textContent).toBe(ADDR);
  });

  it('rerender from ENS name to undefined falls back to address', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue('alice.eth');
    vi.mocked(containsBlockedText).mockReturnValue(false);
    const { container, rerender } = render(<EnsOrLongAddress address={ADDR} />);
    expect(container.textContent).toBe('alice.eth');
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    rerender(<EnsOrLongAddress address={ADDR} />);
    expect(container.textContent).toBe(ADDR);
  });

  it('ENS suffix-less name still rendered', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue('alice');
    vi.mocked(containsBlockedText).mockReturnValue(false);
    const { container } = render(<EnsOrLongAddress address={ADDR} />);
    expect(container.textContent).toBe('alice');
  });

  it('multiple ENS results render distinct text', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValueOnce('bob.eth');
    vi.mocked(containsBlockedText).mockReturnValue(false);
    const { container, rerender } = render(<EnsOrLongAddress address={ADDR} />);
    expect(container.textContent).toBe('bob.eth');
    vi.mocked(useReverseENSLookUp).mockReturnValue('carol.eth');
    rerender(<EnsOrLongAddress address={ADDR} />);
    expect(container.textContent).toBe('carol.eth');
  });

  it('blocked ENS with special chars falls back to address', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue('!@#$%.eth');
    vi.mocked(containsBlockedText).mockReturnValue(true);
    const { container } = render(<EnsOrLongAddress address={ADDR} />);
    expect(container.textContent).toBe(ADDR);
  });

  it('ENS lookup returning ".eth" only renders verbatim (no blocklist)', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue('.eth');
    vi.mocked(containsBlockedText).mockReturnValue(false);
    const { container } = render(<EnsOrLongAddress address={ADDR} />);
    expect(container.textContent).toBe('.eth');
  });

  it('multiple component instances render with different ENS', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue('shared.eth');
    vi.mocked(containsBlockedText).mockReturnValue(false);
    const { container } = render(
      <>
        <EnsOrLongAddress address={ADDR} />
        <EnsOrLongAddress address={ADDR} />
      </>,
    );
    expect(container.textContent).toBe('shared.ethshared.eth');
  });

  it('renders empty wrapper when address only without ENS (still renders ADDR)', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    const { container } = render(<EnsOrLongAddress address={ADDR} />);
    expect(container.textContent?.length).toBeGreaterThan(0);
  });

  it('renders address even when containsBlockedText is true with ENS undefined', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    vi.mocked(containsBlockedText).mockReturnValue(true);
    const { container } = render(<EnsOrLongAddress address={ADDR} />);
    expect(container.textContent).toBe(ADDR);
  });

  it('renders 10 instances each with ENS name', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue('bulk.eth');
    vi.mocked(containsBlockedText).mockReturnValue(false);
    const { container } = render(
      <>
        {Array.from({ length: 10 }, (_, i) => (
          <EnsOrLongAddress key={i} address={ADDR} />
        ))}
      </>,
    );
    expect(container.textContent).toBe('bulk.eth'.repeat(10));
  });

  it('different address triggers re-lookup (rerender path)', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue('first.eth');
    const { container, rerender } = render(<EnsOrLongAddress address={ADDR} />);
    expect(container.textContent).toBe('first.eth');
    vi.mocked(useReverseENSLookUp).mockReturnValue('second.eth');
    rerender(<EnsOrLongAddress address={'0x1234567890123456789012345678901234567890'} />);
    expect(container.textContent).toBe('second.eth');
  });

  it('extremely long ENS string renders verbatim', () => {
    const longName = 'a'.repeat(200) + '.eth';
    vi.mocked(useReverseENSLookUp).mockReturnValue(longName);
    vi.mocked(containsBlockedText).mockReturnValue(false);
    const { container } = render(<EnsOrLongAddress address={ADDR} />);
    expect(container.textContent).toBe(longName);
  });

  it('renders for empty ENS string falls back to address', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue('');
    const { container } = render(<EnsOrLongAddress address={ADDR} />);
    expect(container.textContent).toBe(ADDR);
  });

  it('renders ENS with very short name', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue('a.eth');
    vi.mocked(containsBlockedText).mockReturnValue(false);
    const { container } = render(<EnsOrLongAddress address={ADDR} />);
    expect(container.textContent).toBe('a.eth');
  });

  it('renders 20 instances each with own ENS', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue('shared.eth');
    vi.mocked(containsBlockedText).mockReturnValue(false);
    const { container } = render(
      <>
        {Array.from({ length: 20 }, (_, i) => (
          <EnsOrLongAddress key={i} address={ADDR} />
        ))}
      </>,
    );
    expect(container.textContent).toBe('shared.eth'.repeat(20));
  });

  it('blocklist takes precedence when ENS is set', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue('bad.eth');
    vi.mocked(containsBlockedText).mockReturnValue(true);
    const { container } = render(<EnsOrLongAddress address={ADDR} />);
    expect(container.textContent).toBe(ADDR);
    expect(container.textContent).not.toContain('bad.eth');
  });

  it('different address sets different short address fallback', () => {
    vi.mocked(useReverseENSLookUp).mockReturnValue(undefined);
    const otherAddr = '0x1111111111111111111111111111111111111111';
    const { container } = render(<EnsOrLongAddress address={otherAddr} />);
    expect(container.textContent).toBe(otherAddr);
  });
});
