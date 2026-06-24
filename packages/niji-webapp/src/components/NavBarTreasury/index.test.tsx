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
});
