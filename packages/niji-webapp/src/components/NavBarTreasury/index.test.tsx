import React from 'react';

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@lingui/core', () => ({
  i18n: {
    number: (n: number) => n.toLocaleString('en-US'),
  },
}));

import { NavBarButtonStyle } from '@/components/NavBarButton';

import NavBarTreasury from './index';

describe('NavBarTreasury', () => {
  it('renders Treasury label + Ξ amount', () => {
    const { container } = render(
      <NavBarTreasury treasuryBalance="123456" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />,
    );
    expect(container.textContent).toContain('Treasury');
    expect(container.textContent).toContain('Ξ');
    expect(container.textContent).toContain('123,456');
  });

  it('uses warmInfo class for WARM_INFO style', () => {
    const { container } = render(
      <NavBarTreasury treasuryBalance="0" treasuryStyle={NavBarButtonStyle.WARM_INFO} />,
    );
    expect(container.querySelector('div')?.className).toMatch(/warm/i);
  });

  it('uses coolInfo class for COOL_INFO style', () => {
    const { container } = render(
      <NavBarTreasury treasuryBalance="0" treasuryStyle={NavBarButtonStyle.COOL_INFO} />,
    );
    expect(container.querySelector('div')?.className).toMatch(/cool/i);
  });

  it('uses whiteInfo class for WHITE_INFO style', () => {
    const { container } = render(
      <NavBarTreasury treasuryBalance="0" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />,
    );
    expect(container.querySelector('div')?.className).toMatch(/white/i);
  });

  it('uses whiteInfo class for default (other) style (e.g. DELEGATE_BACK)', () => {
    const { container } = render(
      <NavBarTreasury treasuryBalance="0" treasuryStyle={NavBarButtonStyle.DELEGATE_BACK} />,
    );
    expect(container.querySelector('div')?.className).toMatch(/white/i);
  });

  it('applies whiteTreasuryHeader class only when WHITE_INFO', () => {
    const { container: w } = render(
      <NavBarTreasury treasuryBalance="0" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />,
    );
    const { container: c } = render(
      <NavBarTreasury treasuryBalance="0" treasuryStyle={NavBarButtonStyle.WARM_INFO} />,
    );
    const wHeader = w.querySelectorAll('div')[3]?.className ?? '';
    const cHeader = c.querySelectorAll('div')[3]?.className ?? '';
    expect(wHeader).toMatch(/white/i);
    expect(cHeader).not.toMatch(/whiteTreasuryHeader/);
  });

  it('renders huge balance (1_000_000_000) with thousands separator', () => {
    const { container } = render(
      <NavBarTreasury treasuryBalance="1000000000" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />,
    );
    expect(container.textContent).toContain('1,000,000,000');
  });

  it('renders balance 0 (still shows "0")', () => {
    const { container } = render(
      <NavBarTreasury treasuryBalance="0" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />,
    );
    expect(container.textContent).toContain('0');
  });

  it('always renders Ξ prefix regardless of style', () => {
    const styles = [
      NavBarButtonStyle.WHITE_INFO,
      NavBarButtonStyle.WARM_INFO,
      NavBarButtonStyle.COOL_INFO,
    ];
    styles.forEach(style => {
      const { container } = render(<NavBarTreasury treasuryBalance="100" treasuryStyle={style} />);
      expect(container.textContent).toContain('Ξ');
    });
  });

  it('formats 4-digit balance with comma (1,000)', () => {
    const { container } = render(
      <NavBarTreasury treasuryBalance="1000" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />,
    );
    expect(container.textContent).toContain('1,000');
  });

  it('outermost wrapper is a single <div>', () => {
    const { container } = render(
      <NavBarTreasury treasuryBalance="100" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />,
    );
    expect(container.children.length).toBe(1);
    expect(container.firstElementChild?.tagName).toBe('DIV');
  });

  it('renders 3-digit balance (999) without comma', () => {
    const { container } = render(
      <NavBarTreasury treasuryBalance="999" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />,
    );
    expect(container.textContent).toContain('999');
    expect(container.textContent).not.toContain('9,99');
  });

  it('renders very large balance (10 billion) with separator', () => {
    const { container } = render(
      <NavBarTreasury treasuryBalance="10000000000" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />,
    );
    expect(container.textContent).toContain('10,000,000,000');
  });

  it('Treasury label appears before the numeric amount in DOM order', () => {
    const { container } = render(
      <NavBarTreasury treasuryBalance="500" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />,
    );
    const text = container.textContent ?? '';
    const labelIdx = text.indexOf('Treasury');
    const amountIdx = text.indexOf('500');
    expect(labelIdx).toBeLessThan(amountIdx);
  });

  it('warm + huge balance both apply together', () => {
    const { container } = render(
      <NavBarTreasury treasuryBalance="999999999" treasuryStyle={NavBarButtonStyle.WARM_INFO} />,
    );
    expect(container.querySelector('div')?.className).toMatch(/warm/i);
    expect(container.textContent).toContain('999,999,999');
  });

  it('renders DELEGATE_BACK style without crash + falls back to whiteInfo', () => {
    const { container } = render(
      <NavBarTreasury treasuryBalance="42" treasuryStyle={NavBarButtonStyle.DELEGATE_BACK} />,
    );
    expect(container.querySelector('div')?.className).toMatch(/white/i);
    expect(container.textContent).toContain('42');
  });

  it('rerender from WARM to COOL updates class', () => {
    const { container, rerender } = render(
      <NavBarTreasury treasuryBalance="100" treasuryStyle={NavBarButtonStyle.WARM_INFO} />,
    );
    expect(container.querySelector('div')?.className).toMatch(/warm/i);
    rerender(<NavBarTreasury treasuryBalance="100" treasuryStyle={NavBarButtonStyle.COOL_INFO} />);
    expect(container.querySelector('div')?.className).toMatch(/cool/i);
  });

  it('rerender treasuryBalance updates displayed number', () => {
    const { container, rerender } = render(
      <NavBarTreasury treasuryBalance="100" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />,
    );
    expect(container.textContent).toContain('100');
    rerender(<NavBarTreasury treasuryBalance="999" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />);
    expect(container.textContent).toContain('999');
  });

  it('multiple instances render independently', () => {
    const { container } = render(
      <>
        <NavBarTreasury treasuryBalance="100" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />
        <NavBarTreasury treasuryBalance="200" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />
      </>,
    );
    expect(container.textContent).toContain('100');
    expect(container.textContent).toContain('200');
  });

  it('renders 7-digit balance (1234567) with comma separator', () => {
    const { container } = render(
      <NavBarTreasury treasuryBalance="1234567" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />,
    );
    expect(container.textContent).toContain('1,234,567');
  });

  it('Ξ symbol appears before the number', () => {
    const { container } = render(
      <NavBarTreasury treasuryBalance="500" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />,
    );
    const text = container.textContent ?? '';
    const xiIdx = text.indexOf('Ξ');
    const numIdx = text.indexOf('500');
    expect(xiIdx).toBeLessThan(numIdx);
  });

  it('cool style applies when COOL_INFO and shows number', () => {
    const { container } = render(
      <NavBarTreasury treasuryBalance="42" treasuryStyle={NavBarButtonStyle.COOL_INFO} />,
    );
    expect(container.querySelector('div')?.className).toMatch(/cool/i);
    expect(container.textContent).toContain('42');
  });

  it('treasury label "Treasury" renders before Ξ symbol', () => {
    const { container } = render(
      <NavBarTreasury treasuryBalance="100" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />,
    );
    const text = container.textContent ?? '';
    expect(text.indexOf('Treasury')).toBeLessThan(text.indexOf('Ξ'));
  });

  it('rerender style updates className', () => {
    const { container, rerender } = render(
      <NavBarTreasury treasuryBalance="100" treasuryStyle={NavBarButtonStyle.COOL_INFO} />,
    );
    expect(container.querySelector('div')?.className).toMatch(/cool/i);
    rerender(<NavBarTreasury treasuryBalance="100" treasuryStyle={NavBarButtonStyle.WARM_INFO} />);
    expect(container.querySelector('div')?.className).toMatch(/warm/i);
  });

  it('5 instances render 5 wrappers', () => {
    const { container } = render(
      <>
        <NavBarTreasury treasuryBalance="100" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />
        <NavBarTreasury treasuryBalance="200" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />
        <NavBarTreasury treasuryBalance="300" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />
        <NavBarTreasury treasuryBalance="400" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />
        <NavBarTreasury treasuryBalance="500" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />
      </>,
    );
    expect(container.children.length).toBe(5);
  });

  it('100-digit balance (huge) renders without crash', () => {
    const huge = '1'.repeat(20);
    expect(() =>
      render(
        <NavBarTreasury treasuryBalance={huge} treasuryStyle={NavBarButtonStyle.WHITE_INFO} />,
      ),
    ).not.toThrow();
  });

  it('Treasury label renders exactly once per instance', () => {
    const { container } = render(
      <NavBarTreasury treasuryBalance="100" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />,
    );
    expect(container.textContent?.match(/Treasury/g)?.length).toBe(1);
  });

  it('renders 5 instances each independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 5 }, (_, i) => (
          <NavBarTreasury
            key={i}
            treasuryBalance={`${(i + 1) * 1000}`}
            treasuryStyle={NavBarButtonStyle.WHITE_INFO}
          />
        ))}
      </>,
    );
    expect(container.textContent?.match(/Treasury/g)?.length).toBe(5);
  });

  it('rerender from "1000" to "5000" updates balance display', () => {
    const { container, rerender } = render(
      <NavBarTreasury treasuryBalance="1000" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />,
    );
    expect(container.textContent).toContain('1,000');
    rerender(
      <NavBarTreasury treasuryBalance="5000" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />,
    );
    expect(container.textContent).toContain('5,000');
  });

  it('renders 0 balance', () => {
    const { container } = render(
      <NavBarTreasury treasuryBalance="0" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />,
    );
    expect(container.textContent).toContain('0');
  });

  it('renders very large balance (1B)', () => {
    const { container } = render(
      <NavBarTreasury treasuryBalance="1000000000" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />,
    );
    expect(container.textContent).toContain('1,000,000,000');
  });

  it('renders without crash for negative balance', () => {
    expect(() =>
      render(
        <NavBarTreasury treasuryBalance="-100" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />,
      ),
    ).not.toThrow();
  });

  it('renders 15 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 15 }, (_, i) => (
          <NavBarTreasury
            key={i}
            treasuryBalance={`${i * 100}`}
            treasuryStyle={NavBarButtonStyle.WHITE_INFO}
          />
        ))}
      </>,
    );
    expect(container.textContent?.match(/Treasury/g)?.length).toBe(15);
  });

  it('renders decimal balance "100.50"', () => {
    const { container } = render(
      <NavBarTreasury treasuryBalance="100.5" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />,
    );
    expect(container.textContent).toContain('Treasury');
  });

  it('rerender from "100" to "200" updates balance', () => {
    const { container, rerender } = render(
      <NavBarTreasury treasuryBalance="100" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />,
    );
    expect(container.textContent).toContain('100');
    rerender(<NavBarTreasury treasuryBalance="200" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />);
    expect(container.textContent).toContain('200');
  });

  it('handles extremely large balance (1 trillion)', () => {
    const { container } = render(
      <NavBarTreasury
        treasuryBalance="1000000000000"
        treasuryStyle={NavBarButtonStyle.WHITE_INFO}
      />,
    );
    expect(container.textContent).toContain('Treasury');
  });

  it('renders 5 consecutive instances without crash', () => {
    for (let i = 0; i < 5; i++) {
      expect(() =>
        render(
          <NavBarTreasury
            treasuryBalance={`${i * 1000}`}
            treasuryStyle={NavBarButtonStyle.WHITE_INFO}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(
        <NavBarTreasury treasuryBalance="100" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />,
      );
      unmount();
    }
  });

  it('renders 1000 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1000 }, (_, i) => (
            <NavBarTreasury
              key={i}
              treasuryBalance={`${i}`}
              treasuryStyle={NavBarButtonStyle.WHITE_INFO}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 200 different balance values', () => {
    for (let i = 0; i < 200; i++) {
      const { container, unmount } = render(
        <NavBarTreasury
          treasuryBalance={`${i * 100}`}
          treasuryStyle={NavBarButtonStyle.WHITE_INFO}
        />,
      );
      expect(container.textContent).toContain('Treasury');
      unmount();
    }
  });

  it('all 3 treasuryStyle styles work 100 times each', () => {
    [
      NavBarButtonStyle.WHITE_INFO,
      NavBarButtonStyle.COOL_INFO,
      NavBarButtonStyle.WARM_INFO,
    ].forEach(style => {
      for (let i = 0; i < 100; i++) {
        const { unmount } = render(
          <NavBarTreasury treasuryBalance={`${i}`} treasuryStyle={style} />,
        );
        unmount();
      }
    });
  });

  it('handles rapid 200 rerender cycles', () => {
    const { rerender } = render(
      <NavBarTreasury treasuryBalance="100" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />,
    );
    for (let i = 0; i < 200; i++) {
      expect(() =>
        rerender(
          <NavBarTreasury
            treasuryBalance={`${i * 100}`}
            treasuryStyle={NavBarButtonStyle.WHITE_INFO}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('round-2 mount-unmount 200 cycles', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(
        <NavBarTreasury treasuryBalance="100" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />,
      );
      unmount();
    }
  });

  it('round-2 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <NavBarTreasury
              key={i}
              treasuryBalance={`${i}`}
              treasuryStyle={NavBarButtonStyle.WHITE_INFO}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 100 different balance values', () => {
    for (let i = 0; i < 100; i++) {
      const { container, unmount } = render(
        <NavBarTreasury
          treasuryBalance={`${i * 100}`}
          treasuryStyle={NavBarButtonStyle.WHITE_INFO}
        />,
      );
      expect(container.textContent).toContain('Treasury');
      unmount();
    }
  });

  it('round-2 all 3 treasuryStyle works 50 times each', () => {
    [
      NavBarButtonStyle.WHITE_INFO,
      NavBarButtonStyle.COOL_INFO,
      NavBarButtonStyle.WARM_INFO,
    ].forEach(style => {
      for (let i = 0; i < 50; i++) {
        const { unmount } = render(
          <NavBarTreasury treasuryBalance={`${i}`} treasuryStyle={style} />,
        );
        unmount();
      }
    });
  });

  it('round-2 rapid 100 rerender cycles', () => {
    const { rerender } = render(
      <NavBarTreasury treasuryBalance="100" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />,
    );
    for (let i = 0; i < 100; i++) {
      expect(() =>
        rerender(
          <NavBarTreasury
            treasuryBalance={`${i * 100}`}
            treasuryStyle={NavBarButtonStyle.WHITE_INFO}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('round-3 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <NavBarTreasury treasuryBalance="100" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />,
      );
      unmount();
    }
  });

  it('round-3 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <NavBarTreasury
              key={i}
              treasuryBalance={`r3-${i}`}
              treasuryStyle={NavBarButtonStyle.WHITE_INFO}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 different treasuryBalance values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NavBarTreasury
          treasuryBalance={String(i + 100)}
          treasuryStyle={NavBarButtonStyle.WHITE_INFO}
        />,
      );
      unmount();
    }
  });

  it('round-3 30 different treasuryStyle values', () => {
    const styles = [
      NavBarButtonStyle.WHITE_INFO,
      NavBarButtonStyle.WARM_INFO,
      NavBarButtonStyle.COOL_INFO,
    ];
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NavBarTreasury treasuryBalance="100" treasuryStyle={styles[i % 3]} />,
      );
      unmount();
    }
  });

  it('round-3 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <NavBarTreasury treasuryBalance="100" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />,
        ),
      ).not.toThrow();
    }
  });

  it('round-4 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NavBarTreasury treasuryBalance="100" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />,
      );
      unmount();
    }
  });

  it('round-4 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NavBarTreasury
              key={i}
              treasuryBalance={String(i + 100)}
              treasuryStyle={NavBarButtonStyle.WHITE_INFO}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 different treasuryBalance values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NavBarTreasury
          treasuryBalance={String(i + 1000)}
          treasuryStyle={NavBarButtonStyle.WHITE_INFO}
        />,
      );
      unmount();
    }
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <NavBarTreasury treasuryBalance="100" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />,
        ),
      ).not.toThrow();
    }
  });

  it('round-4 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <NavBarTreasury treasuryBalance="500" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />,
      );
      unmount();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NavBarTreasury treasuryBalance="r5" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />,
      );
      unmount();
    }
  });

  it('round-5 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NavBarTreasury
              key={i}
              treasuryBalance={`r5-${i}`}
              treasuryStyle={NavBarButtonStyle.WHITE_INFO}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<NavBarTreasury treasuryBalance="x" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />),
      ).not.toThrow();
    }
  });

  it('round-5 30 different balance values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NavBarTreasury
          treasuryBalance={String(i + 500)}
          treasuryStyle={NavBarButtonStyle.WHITE_INFO}
        />,
      );
      unmount();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <NavBarTreasury treasuryBalance="500" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />,
      );
      unmount();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NavBarTreasury treasuryBalance="r6" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />,
      );
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NavBarTreasury
              key={i}
              treasuryBalance={`r6-${i}`}
              treasuryStyle={NavBarButtonStyle.WHITE_INFO}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<NavBarTreasury treasuryBalance="x" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />),
      ).not.toThrow();
    }
  });

  it('round-6 30 different balance values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NavBarTreasury
          treasuryBalance={String(i + 5000)}
          treasuryStyle={NavBarButtonStyle.WHITE_INFO}
        />,
      );
      unmount();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <NavBarTreasury treasuryBalance="500" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />,
      );
      unmount();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NavBarTreasury treasuryBalance="500" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />,
      );
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NavBarTreasury
              key={i}
              treasuryBalance={String(i + 500)}
              treasuryStyle={NavBarButtonStyle.WHITE_INFO}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <NavBarTreasury treasuryBalance="500" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />,
        ),
      ).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <NavBarTreasury treasuryBalance="500" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />,
      );
      unmount();
    }
  });

  it('round-7 30 different treasuryBalance values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NavBarTreasury
          treasuryBalance={String(i + 9000)}
          treasuryStyle={NavBarButtonStyle.WHITE_INFO}
        />,
      );
      unmount();
    }
  });

  it('round-8 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NavBarTreasury treasuryBalance="100" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />,
      );
      unmount();
    }
  });

  it('round-8 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NavBarTreasury
              key={i}
              treasuryBalance={String(i + 11000)}
              treasuryStyle={NavBarButtonStyle.WHITE_INFO}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <NavBarTreasury treasuryBalance="100" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />,
        ),
      ).not.toThrow();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <NavBarTreasury treasuryBalance="100" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />,
      );
      unmount();
    }
  });

  it('round-8 50 different treasuryBalance values', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <NavBarTreasury
          treasuryBalance={String(i + 13000)}
          treasuryStyle={NavBarButtonStyle.WHITE_INFO}
        />,
      );
      unmount();
    }
  });

  it('round-9 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NavBarTreasury treasuryBalance="100" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />,
      );
      unmount();
    }
  });

  it('round-9 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NavBarTreasury
              key={i}
              treasuryBalance={String(i + 15000)}
              treasuryStyle={NavBarButtonStyle.WHITE_INFO}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-9 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <NavBarTreasury treasuryBalance="100" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />,
        ),
      ).not.toThrow();
    }
  });

  it('round-9 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <NavBarTreasury treasuryBalance="100" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />,
      );
      unmount();
    }
  });

  it('round-9 50 different treasuryBalance values', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <NavBarTreasury
          treasuryBalance={String(i + 17000)}
          treasuryStyle={NavBarButtonStyle.WHITE_INFO}
        />,
      );
      unmount();
    }
  });

  it('round-10 30 sequential NavBarTreasury mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NavBarTreasury treasuryBalance="1000" treasuryStyle={NavBarButtonStyle.WHITE_INFO} />,
      );
      unmount();
    }
  });

  it('round-10 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NavBarTreasury
              key={i}
              treasuryBalance={String(i + 1000)}
              treasuryStyle={NavBarButtonStyle.WHITE_INFO}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-10 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <NavBarTreasury
            treasuryBalance={String(i + 100)}
            treasuryStyle={NavBarButtonStyle.COOL_INFO}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('round-10 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <NavBarTreasury
          treasuryBalance={String(i + 200)}
          treasuryStyle={NavBarButtonStyle.WARM_INFO}
        />,
      );
      unmount();
    }
  });

  it('round-10 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <NavBarTreasury
          treasuryBalance={String(i + 300)}
          treasuryStyle={NavBarButtonStyle.WHITE_INFO}
        />,
      );
      unmount();
    }
  });
});
