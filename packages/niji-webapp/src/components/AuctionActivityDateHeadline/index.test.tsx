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

  it('rerender with different startTime updates the date', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container, rerender } = render(<AuctionActivityDateHeadline startTime={1735689600n} />);
    expect(container.querySelector('h4')?.textContent).toContain('2025');
    // 4102444800 = 2100-01-01
    rerender(<AuctionActivityDateHeadline startTime={4102444800n} />);
    expect(container.querySelector('h4')?.textContent).toContain('2100');
  });

  it('mid-year date (2024-07-04) renders July', () => {
    useAtomValueMock.mockReturnValue(true);
    // 1720051200 = 2024-07-04 UTC
    const { container } = render(<AuctionActivityDateHeadline startTime={1720051200n} />);
    expect(container.querySelector('h4')?.textContent).toContain('July');
  });

  it('multiple instances render independently', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <>
        <AuctionActivityDateHeadline startTime={1735689600n} />
        <AuctionActivityDateHeadline startTime={4102444800n} />
      </>,
    );
    const h4s = container.querySelectorAll('h4');
    expect(h4s.length).toBe(2);
    expect(h4s[0].textContent).toContain('2025');
    expect(h4s[1].textContent).toContain('2100');
  });

  it('isCool toggle preserves date content', () => {
    useAtomValueMock.mockReturnValue(false);
    const { container } = render(<AuctionActivityDateHeadline startTime={1735689600n} />);
    expect(container.querySelector('h4')?.textContent).toContain('2025');
  });

  it('h4 style attribute always contains brand color reference', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(<AuctionActivityDateHeadline startTime={1735689600n} />);
    expect(container.querySelector('h4')?.getAttribute('style')).toMatch(/brand-/);
  });

  it('December 2024 startTime renders December', () => {
    useAtomValueMock.mockReturnValue(true);
    // 1733011200 = 2024-12-01 UTC
    const { container } = render(<AuctionActivityDateHeadline startTime={1733011200n} />);
    expect(container.querySelector('h4')?.textContent).toContain('December');
    expect(container.querySelector('h4')?.textContent).toContain('2024');
  });

  it('rerender from isCool=true to false switches color', () => {
    useAtomValueMock.mockReturnValueOnce(true);
    const { container, rerender } = render(<AuctionActivityDateHeadline startTime={1735689600n} />);
    expect(container.querySelector('h4')?.getAttribute('style')).toContain('cool');
    useAtomValueMock.mockReturnValue(false);
    rerender(<AuctionActivityDateHeadline startTime={1735689600n} />);
    expect(container.querySelector('h4')?.getAttribute('style')).toContain('warm');
  });

  it('h4 className is non-empty (CSS module applied)', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(<AuctionActivityDateHeadline startTime={1735689600n} />);
    expect(container.querySelector('h4')?.className).toBeTruthy();
  });

  it('div wrapper renders 1 instance per component', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(<AuctionActivityDateHeadline startTime={1735689600n} />);
    expect(container.querySelectorAll('div').length).toBe(1);
  });

  it('Mid-February 2025 renders February', () => {
    useAtomValueMock.mockReturnValue(true);
    // 1739664000 = 2025-02-16 UTC
    const { container } = render(<AuctionActivityDateHeadline startTime={1739664000n} />);
    expect(container.querySelector('h4')?.textContent).toContain('February');
  });

  it('5 instances render 5 h4 elements', () => {
    useAtomValueMock.mockReturnValue(true);
    const times = [1735689600n, 1739664000n, 1720051200n, 4102444800n, 0n];
    const { container } = render(
      <>
        {times.map((t, i) => (
          <AuctionActivityDateHeadline key={i} startTime={t} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('h4').length).toBe(5);
  });

  it('h4 style contains "color" property', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(<AuctionActivityDateHeadline startTime={1735689600n} />);
    expect(container.querySelector('h4')?.getAttribute('style')).toContain('color');
  });

  it('March 2025 startTime renders March', () => {
    useAtomValueMock.mockReturnValue(true);
    // 1741996800 = 2025-03-15 UTC
    const { container } = render(<AuctionActivityDateHeadline startTime={1741996800n} />);
    expect(container.querySelector('h4')?.textContent).toContain('March');
  });

  it('h4 textContent length is non-zero', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(<AuctionActivityDateHeadline startTime={1735689600n} />);
    expect((container.querySelector('h4')?.textContent ?? '').length).toBeGreaterThan(0);
  });

  it('rerender from cool to warm preserves date content', () => {
    useAtomValueMock.mockReturnValueOnce(true);
    const { container, rerender } = render(<AuctionActivityDateHeadline startTime={1735689600n} />);
    expect(container.querySelector('h4')?.textContent).toContain('2025');
    useAtomValueMock.mockReturnValue(false);
    rerender(<AuctionActivityDateHeadline startTime={1735689600n} />);
    expect(container.querySelector('h4')?.textContent).toContain('2025');
  });

  it('h4 renders within wrapper div', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(<AuctionActivityDateHeadline startTime={1735689600n} />);
    expect(container.querySelector('div h4')).not.toBeNull();
  });
});
