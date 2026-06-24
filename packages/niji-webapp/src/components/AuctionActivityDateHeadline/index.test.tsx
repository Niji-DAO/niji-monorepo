import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const useAtomValueMock = vi.fn();
vi.mock('jotai/react', () => ({
  useAtomValue: () => useAtomValueMock(),
}));

vi.mock('@lingui/core', () => ({
  i18n: {
    date: (input: string) => input,
  },
}));

import AuctionActivityDateHeadline from './index';

describe('AuctionActivityDateHeadline', () => {
  it('renders formatted UTC date in h4', () => {
    useAtomValueMock.mockReturnValue(true);
    // 1735689600 = 2025-01-01 UTC
    const { container } = render(<AuctionActivityDateHeadline startTime={1735689600n} />);
    expect(container.querySelector('h4')?.textContent).toContain('January');
    expect(container.querySelector('h4')?.textContent).toContain('2025');
  });

  it('uses cool color when isCool=true', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(<AuctionActivityDateHeadline startTime={1735689600n} />);
    expect(container.querySelector('h4')?.getAttribute('style')).toContain('brand-cool-light-text');
  });

  it('uses warm color when isCool=false', () => {
    useAtomValueMock.mockReturnValue(false);
    const { container } = render(<AuctionActivityDateHeadline startTime={1735689600n} />);
    expect(container.querySelector('h4')?.getAttribute('style')).toContain('brand-warm-light-text');
  });

  it('wraps h4 in a div', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(<AuctionActivityDateHeadline startTime={1735689600n} />);
    expect(container.querySelector('div h4')).not.toBeNull();
  });

  it('renders exactly 1 h4 element', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(<AuctionActivityDateHeadline startTime={1735689600n} />);
    expect(container.querySelectorAll('h4').length).toBe(1);
  });

  it('handles 0n startTime (Unix epoch)', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(<AuctionActivityDateHeadline startTime={0n} />);
    expect(container.querySelector('h4')?.textContent).toContain('January');
    expect(container.querySelector('h4')?.textContent).toContain('1970');
  });

  it('handles large startTime (year 2100)', () => {
    useAtomValueMock.mockReturnValue(true);
    // 2100-01-01 UTC = 4102444800
    const { container } = render(<AuctionActivityDateHeadline startTime={4102444800n} />);
    expect(container.querySelector('h4')?.textContent).toContain('2100');
  });

  it('outermost wrapper is a single <div>', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(<AuctionActivityDateHeadline startTime={1735689600n} />);
    expect(container.children.length).toBe(1);
    expect(container.firstElementChild?.tagName).toBe('DIV');
  });

  it('wrapper div has CSS module className', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(<AuctionActivityDateHeadline startTime={1735689600n} />);
    expect(container.querySelector('div')?.className).toBeTruthy();
  });

  it('h4 receives MMMM DD, YYYY format (month name + day + year)', () => {
    useAtomValueMock.mockReturnValue(true);
    // 1735689600 = 2025-01-01 UTC
    const { container } = render(<AuctionActivityDateHeadline startTime={1735689600n} />);
    expect(container.querySelector('h4')?.textContent).toMatch(/January\s+0?1.*2025/);
  });
});
