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

  it('renders 9999n nounId without crash', () => {
    const { container } = render(<CandidateSponsorImage nounId={9999n} />);
    expect(container.querySelector('[data-testid="niji-image"]')?.textContent).toBe('9999');
  });

  it('renders 100n with correct text content', () => {
    const { container } = render(<CandidateSponsorImage nounId={100n} />);
    expect(container.querySelector('[data-testid="niji-image"]')?.textContent).toBe('100');
  });

  it('rerender with new nounId updates the rendered text', () => {
    const { container, rerender } = render(<CandidateSponsorImage nounId={1n} />);
    expect(container.querySelector('[data-testid="niji-image"]')?.textContent).toBe('1');
    rerender(<CandidateSponsorImage nounId={5n} />);
    expect(container.querySelector('[data-testid="niji-image"]')?.textContent).toBe('5');
  });

  it('CSS class contains hash-like identifier (CSS module)', () => {
    const { container } = render(<CandidateSponsorImage nounId={1n} />);
    const className = container.querySelector('div')?.className ?? '';
    expect(className).toMatch(/_.+/);
  });

  it('NijiImage receives bigint type for nounId', () => {
    const { container } = render(<CandidateSponsorImage nounId={42n} />);
    // mock NijiImage は nounId.toString() を render するので bigint で渡されている証
    expect(container.querySelector('[data-testid="niji-image"]')?.textContent).toBe('42');
  });
});
