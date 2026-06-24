import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const useAtomMock = vi.fn();
vi.mock('jotai/react', () => ({
  useAtom: () => useAtomMock(),
}));

vi.mock('@/utils/colorResponsiveUIUtils', () => ({
  usePickByStateColor: () => 'state-primary',
}));

vi.mock('@/components/NavBarButton', () => {
  const NavBarButtonStyle = { COOL_INFO: 0, WARM_INFO: 1, WHITE_INFO: 4 };
  const NavBarButton = ({ buttonText }: { buttonText: React.ReactNode }) => (
    <span data-testid="nav-button">{buttonText}</span>
  );
  return { default: NavBarButton, NavBarButtonStyle };
});

vi.mock('@/components/LanguageSelectionModal', () => ({
  default: ({ onDismiss }: { onDismiss: () => void }) => (
    <div data-testid="lang-modal">
      <button onClick={onDismiss}>close</button>
    </div>
  ),
}));

import NavLocaleSwitcher from './index';

describe('NavLocaleSwitcher', () => {
  it('renders Language nav button + dropdown wrapper', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    const { container } = render(<NavLocaleSwitcher />);
    const navButtons = container.querySelectorAll('[data-testid="nav-button"]');
    expect(navButtons.length).toBeGreaterThanOrEqual(1);
    expect(container.querySelector('.dropdown')).not.toBeNull();
  });

  it('mobile button click opens LanguageSelectionModal', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    const { container } = render(<NavLocaleSwitcher />);
    // mobile wrapper の onClick で modal display
    const wrapper = container.querySelector('[data-testid="nav-button"]')?.parentElement;
    if (wrapper) fireEvent.click(wrapper);
    expect(container.querySelector('[data-testid="lang-modal"]')).not.toBeNull();
  });

  it('modal close hides itself', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    const { container } = render(<NavLocaleSwitcher />);
    const wrapper = container.querySelector('[data-testid="nav-button"]')?.parentElement;
    if (wrapper) fireEvent.click(wrapper);
    expect(container.querySelector('[data-testid="lang-modal"]')).not.toBeNull();
    const closeBtn = container.querySelector('[data-testid="lang-modal"] button');
    if (closeBtn) fireEvent.click(closeBtn);
    expect(container.querySelector('[data-testid="lang-modal"]')).toBeNull();
  });

  it('renders Language label in nav button', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    const { container } = render(<NavLocaleSwitcher />);
    expect(container.textContent).toContain('Language');
  });

  it('does not render modal by default (closed)', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    const { container } = render(<NavLocaleSwitcher />);
    expect(container.querySelector('[data-testid="lang-modal"]')).toBeNull();
  });

  it('renders for ja-JP locale without crash', () => {
    useAtomMock.mockReturnValue(['ja-JP', vi.fn()]);
    expect(() => render(<NavLocaleSwitcher />)).not.toThrow();
  });

  it('renders for zh-CN locale without crash', () => {
    useAtomMock.mockReturnValue(['zh-CN', vi.fn()]);
    expect(() => render(<NavLocaleSwitcher />)).not.toThrow();
  });

  it('renders exactly 1 dropdown wrapper', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    const { container } = render(<NavLocaleSwitcher />);
    expect(container.querySelectorAll('.dropdown').length).toBe(1);
  });

  it('reopens modal after close + click again', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    const { container } = render(<NavLocaleSwitcher />);
    const wrapper = container.querySelector('[data-testid="nav-button"]')?.parentElement;
    if (wrapper) fireEvent.click(wrapper);
    expect(container.querySelector('[data-testid="lang-modal"]')).not.toBeNull();
    const closeBtn = container.querySelector('[data-testid="lang-modal"] button');
    if (closeBtn) fireEvent.click(closeBtn);
    if (wrapper) fireEvent.click(wrapper);
    expect(container.querySelector('[data-testid="lang-modal"]')).not.toBeNull();
  });

  it('renders 1+ nav-button (mobile + desktop variants)', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    const { container } = render(<NavLocaleSwitcher />);
    const buttons = container.querySelectorAll('[data-testid="nav-button"]');
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });
});
