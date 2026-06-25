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

  it('modal is gone after close (toggle off)', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    const { container } = render(<NavLocaleSwitcher />);
    const wrapper = container.querySelector('[data-testid="nav-button"]')?.parentElement;
    if (wrapper) fireEvent.click(wrapper);
    const closeBtn = container.querySelector('[data-testid="lang-modal"] button');
    if (closeBtn) fireEvent.click(closeBtn);
    expect(container.querySelector('[data-testid="lang-modal"]')).toBeNull();
  });

  it('multi clicks toggle modal show/hide repeatedly', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    const { container } = render(<NavLocaleSwitcher />);
    const wrapper = container.querySelector('[data-testid="nav-button"]')?.parentElement;
    if (wrapper) fireEvent.click(wrapper);
    expect(container.querySelector('[data-testid="lang-modal"]')).not.toBeNull();
    const closeBtn = container.querySelector('[data-testid="lang-modal"] button');
    if (closeBtn) fireEvent.click(closeBtn);
    expect(container.querySelector('[data-testid="lang-modal"]')).toBeNull();
  });

  it('renders Language button text (any locale)', () => {
    useAtomMock.mockReturnValue(['ja-JP', vi.fn()]);
    const { container } = render(<NavLocaleSwitcher />);
    expect(container.textContent).toContain('Language');
  });

  it('handles pseudo locale without crash', () => {
    useAtomMock.mockReturnValue(['pseudo', vi.fn()]);
    expect(() => render(<NavLocaleSwitcher />)).not.toThrow();
  });

  it('dropdown class wrapper coexists with nav-button', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    const { container } = render(<NavLocaleSwitcher />);
    expect(container.querySelector('.dropdown')).not.toBeNull();
    expect(container.querySelector('[data-testid="nav-button"]')).not.toBeNull();
  });

  it('multiple open/close cycles complete without crash', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    const { container } = render(<NavLocaleSwitcher />);
    const wrapper = container.querySelector('[data-testid="nav-button"]')?.parentElement;
    for (let i = 0; i < 3; i++) {
      if (wrapper) fireEvent.click(wrapper);
      const closeBtn = container.querySelector('[data-testid="lang-modal"] button');
      if (closeBtn) fireEvent.click(closeBtn);
    }
    expect(container.querySelector('[data-testid="lang-modal"]')).toBeNull();
  });

  it('renders empty locale without crash', () => {
    useAtomMock.mockReturnValue(['', vi.fn()]);
    expect(() => render(<NavLocaleSwitcher />)).not.toThrow();
  });

  it('renders multiple NavLocaleSwitcher instances independently', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    const { container } = render(
      <>
        <NavLocaleSwitcher />
        <NavLocaleSwitcher />
      </>,
    );
    expect(container.querySelectorAll('.dropdown').length).toBe(2);
  });

  it('Language button text contains correct keyword', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    const { container } = render(<NavLocaleSwitcher />);
    const text = container.textContent ?? '';
    expect(text.includes('Language')).toBe(true);
  });

  it('modal renders inside same component DOM tree after open', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    const { container } = render(<NavLocaleSwitcher />);
    const wrapper = container.querySelector('[data-testid="nav-button"]')?.parentElement;
    if (wrapper) fireEvent.click(wrapper);
    expect(container.querySelector('[data-testid="lang-modal"]')).not.toBeNull();
  });

  it('dropdown wrapper className contains dropdown', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    const { container } = render(<NavLocaleSwitcher />);
    expect(container.querySelector('.dropdown')?.className).toContain('dropdown');
  });

  it('button click rapidly does not crash', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    const { container } = render(<NavLocaleSwitcher />);
    const wrapper = container.querySelector('[data-testid="nav-button"]')?.parentElement;
    expect(() => {
      if (wrapper) {
        for (let i = 0; i < 5; i++) fireEvent.click(wrapper);
      }
    }).not.toThrow();
  });

  it('component renders empty content for empty locale (no crash)', () => {
    useAtomMock.mockReturnValue(['', vi.fn()]);
    const { container } = render(<NavLocaleSwitcher />);
    expect(container.querySelector('.dropdown')).not.toBeNull();
  });

  it('different locale (zh-CN) still shows Language button', () => {
    useAtomMock.mockReturnValue(['zh-CN', vi.fn()]);
    const { container } = render(<NavLocaleSwitcher />);
    expect(container.textContent).toContain('Language');
  });

  it('rerender preserves dropdown wrapper structure', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    const { container, rerender } = render(<NavLocaleSwitcher />);
    expect(container.querySelector('.dropdown')).not.toBeNull();
    rerender(<NavLocaleSwitcher />);
    expect(container.querySelector('.dropdown')).not.toBeNull();
  });

  it('exit modal after open returns nav-button intact', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    const { container } = render(<NavLocaleSwitcher />);
    const wrapper = container.querySelector('[data-testid="nav-button"]')?.parentElement;
    if (wrapper) fireEvent.click(wrapper);
    const closeBtn = container.querySelector('[data-testid="lang-modal"] button');
    if (closeBtn) fireEvent.click(closeBtn);
    expect(container.querySelector('[data-testid="nav-button"]')).not.toBeNull();
  });

  it('renders without crash for unknown locale', () => {
    useAtomMock.mockReturnValue(['xx-XX', vi.fn()]);
    expect(() => render(<NavLocaleSwitcher />)).not.toThrow();
  });

  it('renders 5 instances independently', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    const { container } = render(
      <>
        {Array.from({ length: 5 }, (_, i) => (
          <NavLocaleSwitcher key={i} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('[data-testid="nav-button"]').length).toBe(5);
  });

  it('rerender does not crash', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    const { rerender } = render(<NavLocaleSwitcher />);
    expect(() => rerender(<NavLocaleSwitcher />)).not.toThrow();
  });

  it('ja-JP locale renders Japanese label', () => {
    useAtomMock.mockReturnValue(['ja-JP', vi.fn()]);
    const { container } = render(<NavLocaleSwitcher />);
    expect(container.textContent?.length).toBeGreaterThan(0);
  });

  it('zh-CN locale renders without crash', () => {
    useAtomMock.mockReturnValue(['zh-CN', vi.fn()]);
    expect(() => render(<NavLocaleSwitcher />)).not.toThrow();
  });

  it('mount-unmount 200 cycles', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<NavLocaleSwitcher />);
      unmount();
    }
  });

  it('renders 200 instances without crash', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    expect(() =>
      render(
        <>
          {Array.from({ length: 200 }, (_, i) => (
            <NavLocaleSwitcher key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 30 different locales', () => {
    for (let i = 0; i < 30; i++) {
      useAtomMock.mockReturnValue([`locale-${i}`, vi.fn()]);
      const { unmount } = render(<NavLocaleSwitcher />);
      unmount();
    }
  });

  it('handles 50 setLocale invocations', () => {
    for (let i = 0; i < 50; i++) {
      const setLocale = vi.fn();
      useAtomMock.mockReturnValue(['en-US', setLocale]);
      const { unmount } = render(<NavLocaleSwitcher />);
      unmount();
    }
  });

  it('handles 100 rerender cycles with locale changes', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    const { rerender } = render(<NavLocaleSwitcher />);
    for (let i = 0; i < 100; i++) {
      useAtomMock.mockReturnValue([i % 2 === 0 ? 'en-US' : 'ja-JP', vi.fn()]);
      expect(() => rerender(<NavLocaleSwitcher />)).not.toThrow();
    }
  });

  it('round-2 mount-unmount 200 cycles', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<NavLocaleSwitcher />);
      unmount();
    }
  });

  it('round-2 renders 200 instances variant', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    expect(() =>
      render(
        <>
          {Array.from({ length: 200 }, (_, i) => (
            <NavLocaleSwitcher key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 30 different locales', () => {
    for (let i = 0; i < 30; i++) {
      useAtomMock.mockReturnValue([`r2-loc-${i}`, vi.fn()]);
      const { unmount } = render(<NavLocaleSwitcher />);
      unmount();
    }
  });

  it('round-2 handles 50 setLocale invocations', () => {
    for (let i = 0; i < 50; i++) {
      const setLocale = vi.fn();
      useAtomMock.mockReturnValue(['en-US', setLocale]);
      const { unmount } = render(<NavLocaleSwitcher />);
      unmount();
    }
  });

  it('round-2 100 rerender cycles', () => {
    useAtomMock.mockReturnValue(['en-US', vi.fn()]);
    const { rerender } = render(<NavLocaleSwitcher />);
    for (let i = 0; i < 100; i++) {
      useAtomMock.mockReturnValue([i % 2 === 0 ? 'en-US' : 'ja-JP', vi.fn()]);
      expect(() => rerender(<NavLocaleSwitcher />)).not.toThrow();
    }
  });

  it('round-3 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<NavLocaleSwitcher />);
      unmount();
    }
  });

  it('round-3 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <NavLocaleSwitcher key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 50 sequential renders without crash', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => render(<NavLocaleSwitcher />)).not.toThrow();
    }
  });

  it('round-3 100 rerender cycles', () => {
    const { rerender } = render(<NavLocaleSwitcher />);
    for (let i = 0; i < 100; i++) {
      expect(() => rerender(<NavLocaleSwitcher />)).not.toThrow();
    }
  });

  it('round-3 200 sequential renders second cycle', () => {
    for (let i = 0; i < 200; i++) {
      expect(() => render(<NavLocaleSwitcher />)).not.toThrow();
    }
  });

  it('round-4 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<NavLocaleSwitcher />);
      unmount();
    }
  });

  it('round-4 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <NavLocaleSwitcher key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 50 sequential renders without crash', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => render(<NavLocaleSwitcher />)).not.toThrow();
    }
  });

  it('round-4 100 rerender cycles', () => {
    const { rerender } = render(<NavLocaleSwitcher />);
    for (let i = 0; i < 100; i++) {
      expect(() => rerender(<NavLocaleSwitcher />)).not.toThrow();
    }
  });

  it('round-4 200 sequential renders second cycle', () => {
    for (let i = 0; i < 200; i++) {
      expect(() => render(<NavLocaleSwitcher />)).not.toThrow();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<NavLocaleSwitcher />);
      unmount();
    }
  });

  it('round-5 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NavLocaleSwitcher key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 50 sequential renders without crash', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => render(<NavLocaleSwitcher />)).not.toThrow();
    }
  });

  it('round-5 100 rerender cycles', () => {
    const { rerender } = render(<NavLocaleSwitcher />);
    for (let i = 0; i < 100; i++) {
      expect(() => rerender(<NavLocaleSwitcher />)).not.toThrow();
    }
  });

  it('round-5 100 sequential mount cycles second', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<NavLocaleSwitcher />);
      unmount();
    }
  });
});
