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
});
