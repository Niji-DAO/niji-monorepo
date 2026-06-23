import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/components/Niji', () => ({
  NijiImage: ({ nounId }: { nounId: bigint }) => (
    <span data-testid="niji-image">{nounId.toString()}</span>
  ),
}));

import CandidateSponsorImage from './CandidateSponsorImage';

describe('CandidateSponsorImage', () => {
  it('passes nounId to NijiImage', () => {
    const { container } = render(<CandidateSponsorImage nounId={42n} />);
    expect(container.querySelector('[data-testid="niji-image"]')?.textContent).toBe('42');
  });

  it('wraps NijiImage in a div with sponsorAvatar class', () => {
    const { container } = render(<CandidateSponsorImage nounId={1n} />);
    const div = container.querySelector('div');
    expect(div).not.toBeNull();
    expect(div?.querySelector('[data-testid="niji-image"]')).not.toBeNull();
  });
});
