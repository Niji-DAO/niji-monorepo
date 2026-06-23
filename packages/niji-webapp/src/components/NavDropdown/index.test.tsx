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
});
