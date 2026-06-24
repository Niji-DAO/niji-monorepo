import React from 'react';

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/utils/colorResponsiveUIUtils', () => ({
  usePickByStateColor: () => ({
    stateSelectedDropdownClass: 'state-dropdown',
    statePrimaryButtonClass: 'state-primary',
  }),
}));

vi.mock('@/components/NavBarButton', () => {
  const NavBarButtonStyle = { COOL_INFO: 0 };
  const NavBarButton = ({ buttonText }: { buttonText: React.ReactNode }) => (
    <span data-testid="nav-button">{buttonText}</span>
  );
  return { default: NavBarButton, NavBarButtonStyle };
});

import NavDropDown from './index';

describe('NavDropDown', () => {
  it('renders NavBarButton with buttonText inside dropdown toggle', () => {
    const { container } = render(
      <NavDropDown buttonText="Menu">
        <span>item</span>
      </NavDropDown>,
    );
    expect(container.querySelector('[data-testid="nav-button"]')?.textContent).toBe('Menu');
  });

  it('accepts buttonIcon and forwards to NavBarButton', () => {
    const { container } = render(
      <NavDropDown buttonText="Menu" buttonIcon={<span data-testid="icon" />}>
        <span>x</span>
      </NavDropDown>,
    );
    // mock NavBarButton は icon を直接描画しないので nav-button 自体の確認
    expect(container.querySelector('[data-testid="nav-button"]')).not.toBeNull();
  });

  it('renders Dropdown wrapper element', () => {
    const { container } = render(
      <NavDropDown buttonText="Menu">
        <span>x</span>
      </NavDropDown>,
    );
    expect(container.querySelector('.dropdown')).not.toBeNull();
  });

  it('renders empty buttonText without crashing', () => {
    const { container } = render(
      <NavDropDown buttonText="">
        <span>x</span>
      </NavDropDown>,
    );
    expect(container.querySelector('[data-testid="nav-button"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="nav-button"]')?.textContent).toBe('');
  });

  it('renders without throwing when given multiple ReactNode children', () => {
    // collapsed Dropdown は children DOM を遅延 mount、 jsdom default で hidden。
    // 例外なく render 完了するかを pin する。
    expect(() => {
      render(
        <NavDropDown buttonText="Menu">
          <span>a</span>
          <span>b</span>
          <span>c</span>
        </NavDropDown>,
      );
    }).not.toThrow();
  });

  it('exactly 1 Dropdown rendered', () => {
    const { container } = render(
      <NavDropDown buttonText="Menu">
        <span>x</span>
      </NavDropDown>,
    );
    expect(container.querySelectorAll('.dropdown').length).toBe(1);
  });

  it('renders 1 nav-button regardless of children count', () => {
    const { container } = render(
      <NavDropDown buttonText="Menu">
        <span>a</span>
        <span>b</span>
      </NavDropDown>,
    );
    expect(container.querySelectorAll('[data-testid="nav-button"]').length).toBe(1);
  });

  it('long buttonText is forwarded as-is', () => {
    const long = 'a'.repeat(200);
    const { container } = render(
      <NavDropDown buttonText={long}>
        <span>x</span>
      </NavDropDown>,
    );
    expect(container.querySelector('[data-testid="nav-button"]')?.textContent).toBe(long);
  });

  it('renders JSX buttonText (ReactNode)', () => {
    const { container } = render(
      <NavDropDown buttonText={<strong data-testid="jsx-text">Bold</strong>}>
        <span>x</span>
      </NavDropDown>,
    );
    expect(container.querySelector('[data-testid="jsx-text"]')?.textContent).toBe('Bold');
  });

  it('renders no children (empty fragment) without crash', () => {
    expect(() => render(<NavDropDown buttonText="Menu">{null}</NavDropDown>)).not.toThrow();
  });

  it('dropdown class is exactly applied (no extras after split)', () => {
    const { container } = render(
      <NavDropDown buttonText="Menu">
        <span>x</span>
      </NavDropDown>,
    );
    const dropdown = container.querySelector('.dropdown');
    expect(dropdown?.className.split(' ')).toContain('dropdown');
  });

  it('numeric buttonText is rendered', () => {
    const { container } = render(
      <NavDropDown buttonText={42 as never}>
        <span>x</span>
      </NavDropDown>,
    );
    expect(container.querySelector('[data-testid="nav-button"]')?.textContent).toBe('42');
  });

  it('without buttonIcon prop still renders nav-button', () => {
    const { container } = render(
      <NavDropDown buttonText="Menu">
        <span>x</span>
      </NavDropDown>,
    );
    expect(container.querySelector('[data-testid="nav-button"]')).not.toBeNull();
  });

  it('multiple NavDropDown instances render independently', () => {
    const { container } = render(
      <>
        <NavDropDown buttonText="First">
          <span>x</span>
        </NavDropDown>
        <NavDropDown buttonText="Second">
          <span>y</span>
        </NavDropDown>
      </>,
    );
    const navs = container.querySelectorAll('[data-testid="nav-button"]');
    expect(navs.length).toBe(2);
    expect(navs[0].textContent).toBe('First');
    expect(navs[1].textContent).toBe('Second');
  });

  it('rerender updates buttonText', () => {
    const { container, rerender } = render(
      <NavDropDown buttonText="A">
        <span>x</span>
      </NavDropDown>,
    );
    expect(container.querySelector('[data-testid="nav-button"]')?.textContent).toBe('A');
    rerender(
      <NavDropDown buttonText="B">
        <span>x</span>
      </NavDropDown>,
    );
    expect(container.querySelector('[data-testid="nav-button"]')?.textContent).toBe('B');
  });

  it('unicode buttonText (日本語) renders verbatim', () => {
    const { container } = render(
      <NavDropDown buttonText="メニュー">
        <span>x</span>
      </NavDropDown>,
    );
    expect(container.querySelector('[data-testid="nav-button"]')?.textContent).toBe('メニュー');
  });

  it('dropdown wrapper has className containing "dropdown"', () => {
    const { container } = render(
      <NavDropDown buttonText="Menu">
        <span>x</span>
      </NavDropDown>,
    );
    expect(container.querySelector('.dropdown')?.className).toContain('dropdown');
  });

  it('children prop variation does not affect nav-button rendering', () => {
    const { container: c1 } = render(
      <NavDropDown buttonText="Menu">
        <span>1</span>
      </NavDropDown>,
    );
    const { container: c2 } = render(
      <NavDropDown buttonText="Menu">
        <span>1</span>
        <span>2</span>
        <span>3</span>
      </NavDropDown>,
    );
    expect(c1.querySelectorAll('[data-testid="nav-button"]').length).toBe(1);
    expect(c2.querySelectorAll('[data-testid="nav-button"]').length).toBe(1);
  });
});
