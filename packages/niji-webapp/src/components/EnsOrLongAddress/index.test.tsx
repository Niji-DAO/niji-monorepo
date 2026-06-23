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
});
