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

  it('renders 10 instances each with own startTime', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <>
        {Array.from({ length: 10 }, (_, i) => (
          <AuctionActivityDateHeadline key={i} startTime={1735689600n + BigInt(i * 86400)} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('h4').length).toBe(10);
  });

  it('rerender with new startTime updates display', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container, rerender } = render(<AuctionActivityDateHeadline startTime={1735689600n} />);
    expect(container.querySelector('h4')?.textContent).toContain('2025');
    rerender(<AuctionActivityDateHeadline startTime={1893456000n} />);
    expect(container.querySelector('h4')?.textContent).toContain('2030');
  });

  it('renders for very large startTime (year 9999)', () => {
    useAtomValueMock.mockReturnValue(true);
    expect(() => render(<AuctionActivityDateHeadline startTime={253402300799n} />)).not.toThrow();
  });

  it('renders for startTime=0n (epoch)', () => {
    useAtomValueMock.mockReturnValue(true);
    expect(() => render(<AuctionActivityDateHeadline startTime={0n} />)).not.toThrow();
  });

  it('useAtomValue=false renders without crash', () => {
    useAtomValueMock.mockReturnValue(false);
    expect(() => render(<AuctionActivityDateHeadline startTime={1735689600n} />)).not.toThrow();
  });

  it('renders 20 instances independently with same startTime', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <>
        {Array.from({ length: 20 }, (_, i) => (
          <AuctionActivityDateHeadline key={i} startTime={1735689600n} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('h4').length).toBe(20);
  });

  it('renders March startTime (2025-03-15)', () => {
    useAtomValueMock.mockReturnValue(true);
    const marchTime = 1742000000n;
    const { container } = render(<AuctionActivityDateHeadline startTime={marchTime} />);
    expect(container.querySelector('h4')?.textContent).toContain('2025');
  });

  it('renders June startTime (2025-06-15)', () => {
    useAtomValueMock.mockReturnValue(true);
    const juneTime = 1750000000n;
    const { container } = render(<AuctionActivityDateHeadline startTime={juneTime} />);
    expect(container.querySelector('h4')?.textContent).toContain('2025');
  });

  it('renders 10 consecutive different startTimes', () => {
    useAtomValueMock.mockReturnValue(true);
    for (let i = 0; i < 10; i++) {
      const time = 1735689600n + BigInt(i * 86400);
      expect(() => render(<AuctionActivityDateHeadline startTime={time} />)).not.toThrow();
    }
  });

  it('rerender to past startTime (1970)', () => {
    useAtomValueMock.mockReturnValue(true);
    const { rerender } = render(<AuctionActivityDateHeadline startTime={1735689600n} />);
    expect(() => rerender(<AuctionActivityDateHeadline startTime={0n} />)).not.toThrow();
  });

  it('renders 50 instances independently', () => {
    useAtomValueMock.mockReturnValue(true);
    const baseTime = 1735689600n;
    const { container } = render(
      <>
        {Array.from({ length: 50 }, (_, i) => (
          <AuctionActivityDateHeadline key={i} startTime={baseTime + BigInt(i * 86400)} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('h4').length).toBe(50);
  });

  it('handles startTime 1n (very early epoch)', () => {
    useAtomValueMock.mockReturnValue(true);
    expect(() => render(<AuctionActivityDateHeadline startTime={1n} />)).not.toThrow();
  });

  it('rerender preserves h4 element', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container, rerender } = render(<AuctionActivityDateHeadline startTime={1735689600n} />);
    expect(container.querySelector('h4')).not.toBeNull();
    rerender(<AuctionActivityDateHeadline startTime={1893456000n} />);
    expect(container.querySelector('h4')).not.toBeNull();
  });

  it('renders consistent h4 element count (=1) across rerenders', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container, rerender } = render(<AuctionActivityDateHeadline startTime={1735689600n} />);
    expect(container.querySelectorAll('h4').length).toBe(1);
    rerender(<AuctionActivityDateHeadline startTime={1893456000n} />);
    expect(container.querySelectorAll('h4').length).toBe(1);
  });

  it('renders 5 different time eras consecutively', () => {
    useAtomValueMock.mockReturnValue(true);
    const eras = [1n, 1000n, 1735689600n, 4102444800n, 9007199254740991n];
    eras.forEach(time => {
      expect(() => render(<AuctionActivityDateHeadline startTime={time} />)).not.toThrow();
    });
  });

  it('renders 50 instances independently', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <>
        {Array.from({ length: 50 }, (_, i) => (
          <AuctionActivityDateHeadline key={i} startTime={1735689600n + BigInt(i * 86400)} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('h4').length).toBe(50);
  });

  it('rerender 30 times preserves h4', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container, rerender } = render(<AuctionActivityDateHeadline startTime={1735689600n} />);
    for (let i = 0; i < 30; i++) {
      rerender(<AuctionActivityDateHeadline startTime={1735689600n + BigInt(i * 86400)} />);
      expect(container.querySelector('h4')).not.toBeNull();
    }
  });

  it('handles 100 consecutive renders without crash', () => {
    useAtomValueMock.mockReturnValue(true);
    for (let i = 0; i < 100; i++) {
      expect(() =>
        render(<AuctionActivityDateHeadline startTime={1735689600n + BigInt(i)} />),
      ).not.toThrow();
    }
  });

  it('renders for very large startTime (year 9999)', () => {
    useAtomValueMock.mockReturnValue(true);
    expect(() => render(<AuctionActivityDateHeadline startTime={253402300799n} />)).not.toThrow();
  });

  it('switches isCool true/false preserves h4 element', () => {
    useAtomValueMock.mockReturnValueOnce(true);
    const { container, rerender } = render(<AuctionActivityDateHeadline startTime={1735689600n} />);
    expect(container.querySelector('h4')).not.toBeNull();
    useAtomValueMock.mockReturnValue(false);
    rerender(<AuctionActivityDateHeadline startTime={1735689600n} />);
    expect(container.querySelector('h4')).not.toBeNull();
  });

  it('renders 100 instances without crash', () => {
    useAtomValueMock.mockReturnValue(true);
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <AuctionActivityDateHeadline key={i} startTime={BigInt(1700000000 + i)} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender 30 times preserves h4', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container, rerender } = render(<AuctionActivityDateHeadline startTime={1700000000n} />);
    for (let i = 0; i < 30; i++) {
      rerender(<AuctionActivityDateHeadline startTime={BigInt(1700000000 + i)} />);
    }
    expect(container.querySelector('h4')).not.toBeNull();
  });

  it('handles 0n startTime', () => {
    useAtomValueMock.mockReturnValue(true);
    expect(() => render(<AuctionActivityDateHeadline startTime={0n} />)).not.toThrow();
  });

  it('handles very large bigint startTime', () => {
    useAtomValueMock.mockReturnValue(true);
    expect(() =>
      render(<AuctionActivityDateHeadline startTime={9_007_199_254_740_991n} />),
    ).not.toThrow();
  });

  it('rapid 50 isCool toggle without crash', () => {
    const { rerender } = render(<AuctionActivityDateHeadline startTime={1700000000n} />);
    for (let i = 0; i < 50; i++) {
      useAtomValueMock.mockReturnValue(i % 2 === 0);
      expect(() => rerender(<AuctionActivityDateHeadline startTime={1700000000n} />)).not.toThrow();
    }
  });

  it('handles 1n startTime (very small)', () => {
    useAtomValueMock.mockReturnValue(true);
    expect(() => render(<AuctionActivityDateHeadline startTime={1n} />)).not.toThrow();
  });

  it('renders 200 instances', () => {
    useAtomValueMock.mockReturnValue(false);
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <AuctionActivityDateHeadline key={i} startTime={BigInt(1700000000 + i)} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('h4').length).toBe(200);
  });

  it('all 100 instances have warm style when isCool=false', () => {
    useAtomValueMock.mockReturnValue(false);
    const { container } = render(
      <>
        {Array.from({ length: 100 }, (_, i) => (
          <AuctionActivityDateHeadline key={i} startTime={BigInt(1700000000 + i)} />
        ))}
      </>,
    );
    const h4s = container.querySelectorAll('h4');
    h4s.forEach(h4 => {
      expect(h4.getAttribute('style')).toContain('warm');
    });
  });

  it('mount-unmount 200 cycles', () => {
    useAtomValueMock.mockReturnValue(true);
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<AuctionActivityDateHeadline startTime={1735689600n} />);
      unmount();
    }
  });

  it('renders 500 instances without crash', () => {
    useAtomValueMock.mockReturnValue(true);
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <AuctionActivityDateHeadline key={i} startTime={BigInt(1700000000 + i)} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 50 different startTime sequentially', () => {
    useAtomValueMock.mockReturnValue(true);
    for (let i = 0; i < 50; i++) {
      const { container, unmount } = render(
        <AuctionActivityDateHeadline startTime={BigInt(1700000000 + i * 86400)} />,
      );
      expect(container.querySelector('h4')).not.toBeNull();
      unmount();
    }
  });

  it('all 100 cool instances have brand-cool-light-text', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <>
        {Array.from({ length: 100 }, (_, i) => (
          <AuctionActivityDateHeadline key={i} startTime={1735689600n} />
        ))}
      </>,
    );
    const h4s = container.querySelectorAll('h4');
    h4s.forEach(h4 => {
      expect(h4.getAttribute('style')).toContain('brand-cool-light-text');
    });
  });

  it('handles 1n startTime edge case', () => {
    useAtomValueMock.mockReturnValue(true);
    expect(() => render(<AuctionActivityDateHeadline startTime={1n} />)).not.toThrow();
  });

  it('mount-unmount 500 cycles', () => {
    useAtomValueMock.mockReturnValue(true);
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<AuctionActivityDateHeadline startTime={1735689600n} />);
      unmount();
    }
  });

  it('renders 1000 instances without crash', () => {
    useAtomValueMock.mockReturnValue(true);
    expect(() =>
      render(
        <>
          {Array.from({ length: 1000 }, (_, i) => (
            <AuctionActivityDateHeadline key={i} startTime={BigInt(1700000000 + i)} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 100 different startTimes', () => {
    useAtomValueMock.mockReturnValue(true);
    for (let i = 0; i < 100; i++) {
      const { container, unmount } = render(
        <AuctionActivityDateHeadline startTime={BigInt(1700000000 + i * 86400)} />,
      );
      expect(container.querySelector('h4')).not.toBeNull();
      unmount();
    }
  });

  it('rapid 100 isCool toggle rerender', () => {
    const { rerender } = render(<AuctionActivityDateHeadline startTime={1700000000n} />);
    for (let i = 0; i < 100; i++) {
      useAtomValueMock.mockReturnValue(i % 2 === 0);
      expect(() => rerender(<AuctionActivityDateHeadline startTime={1700000000n} />)).not.toThrow();
    }
  });

  it('all 200 h4 elements have CSS module className', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <AuctionActivityDateHeadline key={i} startTime={1735689600n} />
        ))}
      </>,
    );
    const h4s = container.querySelectorAll('h4');
    h4s.forEach(h4 => {
      expect(h4.className).toBeTruthy();
    });
  });
});
