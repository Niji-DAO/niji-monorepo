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

  it('renders 0n nounId correctly', () => {
    const { container } = render(<CandidateSponsorImage nounId={0n} />);
    expect(container.querySelector('[data-testid="niji-image"]')?.textContent).toBe('0');
  });

  it('renders very large bigint nounId', () => {
    const huge = 9_007_199_254_740_991n; // Number.MAX_SAFE_INTEGER as bigint
    const { container } = render(<CandidateSponsorImage nounId={huge} />);
    expect(container.querySelector('[data-testid="niji-image"]')?.textContent).toBe(
      huge.toString(),
    );
  });

  it('outermost wrapper is a single <div>', () => {
    const { container } = render(<CandidateSponsorImage nounId={1n} />);
    expect(container.children.length).toBe(1);
    expect(container.firstElementChild?.tagName).toBe('DIV');
  });

  it('renders exactly 1 NijiImage child', () => {
    const { container } = render(<CandidateSponsorImage nounId={1n} />);
    expect(container.querySelectorAll('[data-testid="niji-image"]').length).toBe(1);
  });

  it('applies CSS module className on wrapper div', () => {
    const { container } = render(<CandidateSponsorImage nounId={1n} />);
    const className = container.querySelector('div')?.className;
    expect(className).toBeTruthy();
    expect(className?.length).toBeGreaterThan(0);
  });

  it('multiple renders with different nounIds produce isolated trees', () => {
    const { container: c1 } = render(<CandidateSponsorImage nounId={1n} />);
    const { container: c2 } = render(<CandidateSponsorImage nounId={2n} />);
    expect(c1.querySelector('[data-testid="niji-image"]')?.textContent).toBe('1');
    expect(c2.querySelector('[data-testid="niji-image"]')?.textContent).toBe('2');
  });
});
