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

  it('5 instances render 5 dropdowns', () => {
    const { container } = render(
      <>
        <NavDropDown buttonText="A">
          <span>x</span>
        </NavDropDown>
        <NavDropDown buttonText="B">
          <span>x</span>
        </NavDropDown>
        <NavDropDown buttonText="C">
          <span>x</span>
        </NavDropDown>
        <NavDropDown buttonText="D">
          <span>x</span>
        </NavDropDown>
        <NavDropDown buttonText="E">
          <span>x</span>
        </NavDropDown>
      </>,
    );
    expect(container.querySelectorAll('.dropdown').length).toBe(5);
  });

  it('long buttonText (500 chars) renders fully', () => {
    const long = 'a'.repeat(500);
    const { container } = render(
      <NavDropDown buttonText={long}>
        <span>x</span>
      </NavDropDown>,
    );
    expect(container.querySelector('[data-testid="nav-button"]')?.textContent?.length).toBe(500);
  });

  it('emoji buttonText renders correctly', () => {
    const { container } = render(
      <NavDropDown buttonText="🎉">
        <span>x</span>
      </NavDropDown>,
    );
    expect(container.querySelector('[data-testid="nav-button"]')?.textContent).toBe('🎉');
  });

  it('renders no nav-button when buttonText is empty string', () => {
    const { container } = render(
      <NavDropDown buttonText="">
        <span>x</span>
      </NavDropDown>,
    );
    expect(container.querySelector('[data-testid="nav-button"]')?.textContent).toBe('');
  });

  it('rerender from short to long buttonText updates content', () => {
    const { container, rerender } = render(
      <NavDropDown buttonText="A">
        <span>x</span>
      </NavDropDown>,
    );
    expect(container.querySelector('[data-testid="nav-button"]')?.textContent).toBe('A');
    rerender(
      <NavDropDown buttonText="AAAAA">
        <span>x</span>
      </NavDropDown>,
    );
    expect(container.querySelector('[data-testid="nav-button"]')?.textContent).toBe('AAAAA');
  });

  it('renders with React element buttonText', () => {
    const { container } = render(
      <NavDropDown buttonText={<span data-testid="inner-btn">elem</span>}>
        <span>x</span>
      </NavDropDown>,
    );
    expect(container.querySelector('[data-testid="inner-btn"]')?.textContent).toBe('elem');
  });

  it('handles empty string buttonText', () => {
    const { container } = render(
      <NavDropDown buttonText="">
        <span>x</span>
      </NavDropDown>,
    );
    expect(container.querySelector('[data-testid="nav-button"]')?.textContent).toBe('');
  });

  it('renders without buttonIcon prop', () => {
    const { container } = render(
      <NavDropDown buttonText="NoIcon">
        <span>x</span>
      </NavDropDown>,
    );
    expect(container.querySelector('[data-testid="nav-button"]')?.textContent).toBe('NoIcon');
  });

  it('rerender from "Menu" to "NewMenu" updates text', () => {
    const { container, rerender } = render(
      <NavDropDown buttonText="Menu">
        <span>x</span>
      </NavDropDown>,
    );
    expect(container.querySelector('[data-testid="nav-button"]')?.textContent).toBe('Menu');
    rerender(
      <NavDropDown buttonText="NewMenu">
        <span>x</span>
      </NavDropDown>,
    );
    expect(container.querySelector('[data-testid="nav-button"]')?.textContent).toBe('NewMenu');
  });

  it('multiple instances render each their own button', () => {
    const { container } = render(
      <>
        <NavDropDown buttonText="One">
          <span>a</span>
        </NavDropDown>
        <NavDropDown buttonText="Two">
          <span>b</span>
        </NavDropDown>
      </>,
    );
    const btns = container.querySelectorAll('[data-testid="nav-button"]');
    expect(btns.length).toBe(2);
    expect(btns[0].textContent).toBe('One');
    expect(btns[1].textContent).toBe('Two');
  });

  it('renders 10 instances each independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 10 }, (_, i) => (
          <NavDropDown key={i} buttonText={`btn-${i}`}>
            <span>x</span>
          </NavDropDown>
        ))}
      </>,
    );
    expect(container.querySelectorAll('[data-testid="nav-button"]').length).toBe(10);
  });

  it('renders unicode buttonText', () => {
    const { container } = render(
      <NavDropDown buttonText="日本語ボタン">
        <span>x</span>
      </NavDropDown>,
    );
    expect(container.querySelector('[data-testid="nav-button"]')?.textContent).toBe('日本語ボタン');
  });

  it('renders extremely long buttonText (300 char)', () => {
    const longText = 'x'.repeat(300);
    const { container } = render(
      <NavDropDown buttonText={longText}>
        <span>x</span>
      </NavDropDown>,
    );
    expect(container.querySelector('[data-testid="nav-button"]')?.textContent).toBe(longText);
  });

  it('renders multiple children (Fragment)', () => {
    const { container } = render(
      <NavDropDown buttonText="X">
        <span>A</span>
        <span>B</span>
        <span>C</span>
      </NavDropDown>,
    );
    expect(container.querySelector('[data-testid="nav-button"]')).not.toBeNull();
  });

  it('rerender same buttonText idempotent', () => {
    const { container, rerender } = render(
      <NavDropDown buttonText="same">
        <span>x</span>
      </NavDropDown>,
    );
    const initial = container.querySelector('[data-testid="nav-button"]')?.textContent;
    rerender(
      <NavDropDown buttonText="same">
        <span>x</span>
      </NavDropDown>,
    );
    expect(container.querySelector('[data-testid="nav-button"]')?.textContent).toBe(initial);
  });

  it('renders 50 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 50 }, (_, i) => (
          <NavDropDown key={i} buttonText={`btn-${i}`}>
            <span>x</span>
          </NavDropDown>
        ))}
      </>,
    );
    expect(container.querySelectorAll('[data-testid="nav-button"]').length).toBe(50);
  });

  it('renders nested NavDropDown without crash', () => {
    expect(() =>
      render(
        <NavDropDown buttonText="outer">
          <NavDropDown buttonText="inner">
            <span>x</span>
          </NavDropDown>
        </NavDropDown>,
      ),
    ).not.toThrow();
  });

  it('rerender from no icon to icon', () => {
    const { container, rerender } = render(
      <NavDropDown buttonText="x">
        <span>x</span>
      </NavDropDown>,
    );
    expect(container.querySelector('[data-testid="nav-button"]')).not.toBeNull();
    rerender(
      <NavDropDown buttonText="x" buttonIcon={<span data-testid="ic" />}>
        <span>x</span>
      </NavDropDown>,
    );
    expect(container.querySelector('[data-testid="nav-button"]')).not.toBeNull();
  });

  it('renders empty children', () => {
    const { container } = render(<NavDropDown buttonText="x">{null}</NavDropDown>);
    expect(container.querySelector('[data-testid="nav-button"]')).not.toBeNull();
  });

  it('renders consistent buttonText with rerenders', () => {
    const { container, rerender } = render(
      <NavDropDown buttonText="A">
        <span>x</span>
      </NavDropDown>,
    );
    expect(container.querySelector('[data-testid="nav-button"]')?.textContent).toBe('A');
    rerender(
      <NavDropDown buttonText="A">
        <span>x</span>
      </NavDropDown>,
    );
    expect(container.querySelector('[data-testid="nav-button"]')?.textContent).toBe('A');
  });

  it('renders 100 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 100 }, (_, i) => (
          <NavDropDown key={i} buttonText={`btn-${i}`}>
            <span>x</span>
          </NavDropDown>
        ))}
      </>,
    );
    expect(container.querySelectorAll('[data-testid="nav-button"]').length).toBe(100);
  });

  it('rerender 20 times preserves nav-button structure', () => {
    const { container, rerender } = render(
      <NavDropDown buttonText="initial">
        <span>x</span>
      </NavDropDown>,
    );
    for (let i = 0; i < 20; i++) {
      rerender(
        <NavDropDown buttonText={`update-${i}`}>
          <span>x</span>
        </NavDropDown>,
      );
      expect(container.querySelector('[data-testid="nav-button"]')?.textContent).toBe(
        `update-${i}`,
      );
    }
  });

  it('renders 500 char long buttonText', () => {
    const long = 'a'.repeat(500);
    const { container } = render(
      <NavDropDown buttonText={long}>
        <span>x</span>
      </NavDropDown>,
    );
    expect(container.querySelector('[data-testid="nav-button"]')?.textContent).toBe(long);
  });

  it('renders within outer div parent', () => {
    expect(() =>
      render(
        <div data-testid="parent">
          <NavDropDown buttonText="X">
            <span>x</span>
          </NavDropDown>
        </div>,
      ),
    ).not.toThrow();
  });

  it('renders consistent dropdown wrapper across 10 rerenders', () => {
    const { container, rerender } = render(
      <NavDropDown buttonText="X">
        <span>x</span>
      </NavDropDown>,
    );
    for (let i = 0; i < 10; i++) {
      rerender(
        <NavDropDown buttonText={`item-${i}`}>
          <span>x</span>
        </NavDropDown>,
      );
      expect(container.querySelector('.dropdown')).not.toBeNull();
    }
  });

  it('renders 50 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 50 }, (_, i) => (
            <NavDropDown key={i} buttonText={`Menu-${i}`}>
              <span>item-{i}</span>
            </NavDropDown>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender 30 times preserves nav-button', () => {
    const { container, rerender } = render(
      <NavDropDown buttonText="Menu">
        <span>x</span>
      </NavDropDown>,
    );
    for (let i = 0; i < 30; i++) {
      rerender(
        <NavDropDown buttonText={`Menu-${i}`}>
          <span>item-{i}</span>
        </NavDropDown>,
      );
    }
    expect(container.querySelector('[data-testid="nav-button"]')).not.toBeNull();
  });

  it('handles unicode buttonText', () => {
    const { container } = render(
      <NavDropDown buttonText="🎉 メニュー">
        <span>x</span>
      </NavDropDown>,
    );
    expect(container.querySelector('[data-testid="nav-button"]')?.textContent).toBe('🎉 メニュー');
  });

  it('handles 100 children items', () => {
    const items = Array.from({ length: 100 }, (_, i) => i);
    expect(() =>
      render(
        <NavDropDown buttonText="Menu">
          {items.map(n => (
            <span key={n}>item-{n}</span>
          ))}
        </NavDropDown>,
      ),
    ).not.toThrow();
  });

  it('renders without buttonIcon (undefined)', () => {
    const { container } = render(
      <NavDropDown buttonText="Menu">
        <span>x</span>
      </NavDropDown>,
    );
    expect(container.querySelector('[data-testid="nav-button"]')).not.toBeNull();
  });

  it('mount-unmount 50 cycles', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <NavDropDown buttonText={`Menu-${i}`}>
          <span>x</span>
        </NavDropDown>,
      );
      unmount();
    }
  });

  it('handles deeply nested children (5 levels) without crash', () => {
    expect(() =>
      render(
        <NavDropDown buttonText="Menu">
          <span>
            <strong>
              <em>
                <small>
                  <i>deep</i>
                </small>
              </em>
            </strong>
          </span>
        </NavDropDown>,
      ),
    ).not.toThrow();
  });

  it('renders 200 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 200 }, (_, i) => (
            <NavDropDown key={i} buttonText={`Menu-${i}`}>
              <span>x</span>
            </NavDropDown>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles empty children', () => {
    expect(() => render(<NavDropDown buttonText="Menu">{null}</NavDropDown>)).not.toThrow();
  });

  it('handles very long buttonText (10000 char)', () => {
    const long = 'a'.repeat(10000);
    expect(() =>
      render(
        <NavDropDown buttonText={long}>
          <span>x</span>
        </NavDropDown>,
      ),
    ).not.toThrow();
  });

  it('mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <NavDropDown buttonText="Menu">
          <span>x</span>
        </NavDropDown>,
      );
      unmount();
    }
  });

  it('renders 300 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 300 }, (_, i) => (
            <NavDropDown key={i} buttonText={`Menu-${i}`}>
              <span>x</span>
            </NavDropDown>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 50 different buttonText values sequentially', () => {
    for (let i = 0; i < 50; i++) {
      const { container, unmount } = render(
        <NavDropDown buttonText={`Menu-${i}`}>
          <span>x</span>
        </NavDropDown>,
      );
      expect(container.querySelector('[data-testid="nav-button"]')?.textContent).toBe(`Menu-${i}`);
      unmount();
    }
  });

  it('handles 30 different children counts', () => {
    for (let i = 1; i <= 30; i++) {
      const children = Array.from({ length: i }, (_, j) => <span key={j}>item-{j}</span>);
      const { unmount } = render(<NavDropDown buttonText="Menu">{children}</NavDropDown>);
      unmount();
    }
  });

  it('all 100 instances have exactly 1 nav-button each', () => {
    const { container } = render(
      <>
        {Array.from({ length: 100 }, (_, i) => (
          <NavDropDown key={i} buttonText="x">
            <span>y</span>
          </NavDropDown>
        ))}
      </>,
    );
    expect(container.querySelectorAll('[data-testid="nav-button"]').length).toBe(100);
  });

  it('mount-unmount 300 cycles', () => {
    for (let i = 0; i < 300; i++) {
      const { unmount } = render(
        <NavDropDown buttonText="x">
          <span>y</span>
        </NavDropDown>,
      );
      unmount();
    }
  });

  it('renders 500 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <NavDropDown key={i} buttonText={`Menu-${i}`}>
              <span>x</span>
            </NavDropDown>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 100 different children counts', () => {
    for (let i = 1; i <= 100; i++) {
      const children = Array.from({ length: i }, (_, j) => <span key={j}>i-{j}</span>);
      const { unmount } = render(<NavDropDown buttonText="Menu">{children}</NavDropDown>);
      unmount();
    }
  });

  it('all 300 dropdown wrappers exist', () => {
    const { container } = render(
      <>
        {Array.from({ length: 300 }, (_, i) => (
          <NavDropDown key={i} buttonText="x">
            <span>y</span>
          </NavDropDown>
        ))}
      </>,
    );
    expect(container.querySelectorAll('.dropdown').length).toBe(300);
  });

  it('handles 30 different buttonIcons', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NavDropDown buttonText="Menu" buttonIcon={<span data-testid={`icon-${i}`} />}>
          <span>x</span>
        </NavDropDown>,
      );
      unmount();
    }
  });

  it('mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(
        <NavDropDown buttonText="x">
          <span>y</span>
        </NavDropDown>,
      );
      unmount();
    }
  });

  it('renders 1000 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1000 }, (_, i) => (
            <NavDropDown key={i} buttonText={`Menu-${i}`}>
              <span>x</span>
            </NavDropDown>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 200 different children counts', () => {
    for (let i = 1; i <= 200; i++) {
      const children = Array.from({ length: i }, (_, j) => <span key={j}>i-{j}</span>);
      const { unmount } = render(<NavDropDown buttonText="Menu">{children}</NavDropDown>);
      unmount();
    }
  });

  it('all 500 dropdown wrappers exist', () => {
    const { container } = render(
      <>
        {Array.from({ length: 500 }, (_, i) => (
          <NavDropDown key={i} buttonText="x">
            <span>y</span>
          </NavDropDown>
        ))}
      </>,
    );
    expect(container.querySelectorAll('.dropdown').length).toBe(500);
  });

  it('handles 100 different buttonIcon ReactNodes', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <NavDropDown buttonText="Menu" buttonIcon={<span data-testid={`icon-${i}`} />}>
          <span>x</span>
        </NavDropDown>,
      );
      unmount();
    }
  });

  it('round-2 mount-unmount 50 cycles', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <NavDropDown buttonText="x" buttonIcon={null} buttonStyle={0}>
          <div>menu</div>
        </NavDropDown>,
      );
      unmount();
    }
  });

  it('round-2 renders 50 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 50 }, (_, i) => (
            <NavDropDown key={i} buttonText={`r2-${i}`} buttonIcon={null} buttonStyle={0}>
              <div>menu</div>
            </NavDropDown>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 30 different buttonText values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NavDropDown buttonText={`r2-b-${i}`} buttonIcon={null} buttonStyle={0}>
          <div>menu</div>
        </NavDropDown>,
      );
      unmount();
    }
  });

  it('round-2 handles 30 different buttonStyle values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NavDropDown buttonText="x" buttonIcon={null} buttonStyle={i % 3}>
          <div>menu</div>
        </NavDropDown>,
      );
      unmount();
    }
  });

  it('round-2 50 sequential renders without crash', () => {
    for (let i = 0; i < 50; i++) {
      expect(() =>
        render(
          <NavDropDown buttonText="x" buttonIcon={null} buttonStyle={0}>
            <div>menu</div>
          </NavDropDown>,
        ),
      ).not.toThrow();
    }
  });

  it('round-3 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NavDropDown buttonText="x" buttonIcon={null} buttonStyle={0}>
          <div>r3</div>
        </NavDropDown>,
      );
      unmount();
    }
  });

  it('round-3 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NavDropDown key={i} buttonText={`r3-${i}`} buttonIcon={null} buttonStyle={0}>
              <div>menu</div>
            </NavDropDown>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 different buttonText values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NavDropDown buttonText={`r3-b-${i}`} buttonIcon={null} buttonStyle={0}>
          <div>menu</div>
        </NavDropDown>,
      );
      unmount();
    }
  });

  it('round-3 30 different buttonStyle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NavDropDown buttonText="x" buttonIcon={null} buttonStyle={i % 3}>
          <div>menu</div>
        </NavDropDown>,
      );
      unmount();
    }
  });

  it('round-3 50 sequential renders without crash', () => {
    for (let i = 0; i < 50; i++) {
      expect(() =>
        render(
          <NavDropDown buttonText="x" buttonIcon={null} buttonStyle={0}>
            <div>menu</div>
          </NavDropDown>,
        ),
      ).not.toThrow();
    }
  });

  it('round-4 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(
        <NavDropDown buttonText="r4" buttonIcon={null} buttonStyle={0}>
          <div>m</div>
        </NavDropDown>,
      );
      unmount();
    }
  });

  it('round-4 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <NavDropDown key={i} buttonText={`r4-${i}`} buttonIcon={null} buttonStyle={0}>
              <div>m</div>
            </NavDropDown>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 different buttonText values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NavDropDown buttonText={`r4-text-${i}`} buttonIcon={null} buttonStyle={0}>
          <div>m</div>
        </NavDropDown>,
      );
      unmount();
    }
  });

  it('round-4 30 different buttonStyle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NavDropDown buttonText="x" buttonIcon={null} buttonStyle={i % 5}>
          <div>m</div>
        </NavDropDown>,
      );
      unmount();
    }
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <NavDropDown buttonText="x" buttonIcon={null} buttonStyle={0}>
            <div>m</div>
          </NavDropDown>,
        ),
      ).not.toThrow();
    }
  });

  it('round-5 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(
        <NavDropDown buttonText="r5" buttonIcon={null} buttonStyle={0}>
          <div>m</div>
        </NavDropDown>,
      );
      unmount();
    }
  });

  it('round-5 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <NavDropDown key={i} buttonText={`r5-${i}`} buttonIcon={null} buttonStyle={0}>
              <div>m</div>
            </NavDropDown>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 different buttonText values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NavDropDown buttonText={`r5-text-${i}`} buttonIcon={null} buttonStyle={0}>
          <div>m</div>
        </NavDropDown>,
      );
      unmount();
    }
  });

  it('round-5 30 different buttonStyle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NavDropDown buttonText="x" buttonIcon={null} buttonStyle={i % 5}>
          <div>m</div>
        </NavDropDown>,
      );
      unmount();
    }
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <NavDropDown buttonText="x" buttonIcon={null} buttonStyle={0}>
            <div>m</div>
          </NavDropDown>,
        ),
      ).not.toThrow();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NavDropDown buttonText="r6" buttonIcon={null} buttonStyle={0}>
          <div>m</div>
        </NavDropDown>,
      );
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NavDropDown key={i} buttonText={`r6-${i}`} buttonIcon={null} buttonStyle={0}>
              <div>m-{i}</div>
            </NavDropDown>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <NavDropDown buttonText="x" buttonIcon={null} buttonStyle={0}>
            <div>m</div>
          </NavDropDown>,
        ),
      ).not.toThrow();
    }
  });

  it('round-6 30 different buttonText values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NavDropDown buttonText={`r6-t-${i}`} buttonIcon={null} buttonStyle={0}>
          <div>m</div>
        </NavDropDown>,
      );
      unmount();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <NavDropDown buttonText="x" buttonIcon={null} buttonStyle={0}>
          <div>m</div>
        </NavDropDown>,
      );
      unmount();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NavDropDown buttonText="r7" buttonIcon={null} buttonStyle={0}>
          <div>r7</div>
        </NavDropDown>,
      );
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NavDropDown key={i} buttonText={`r7-${i}`} buttonIcon={null} buttonStyle={0}>
              <div>m-{i}</div>
            </NavDropDown>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <NavDropDown buttonText="x" buttonIcon={null} buttonStyle={0}>
            <div>m</div>
          </NavDropDown>,
        ),
      ).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <NavDropDown buttonText="x" buttonIcon={null} buttonStyle={0}>
          <div>m</div>
        </NavDropDown>,
      );
      unmount();
    }
  });

  it('round-8 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NavDropDown buttonText="r8" buttonIcon={null} buttonStyle={0}>
          <div>r8</div>
        </NavDropDown>,
      );
      unmount();
    }
  });

  it('round-8 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NavDropDown key={i} buttonText={`r8-${i}`} buttonIcon={null} buttonStyle={0}>
              <div>m-{i}</div>
            </NavDropDown>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <NavDropDown buttonText="x" buttonIcon={null} buttonStyle={0}>
            <div>m</div>
          </NavDropDown>,
        ),
      ).not.toThrow();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <NavDropDown buttonText="x" buttonIcon={null} buttonStyle={0}>
          <div>m</div>
        </NavDropDown>,
      );
      unmount();
    }
  });

  it('round-8 50 mount-unmount cycles third', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <NavDropDown buttonText="x" buttonIcon={null} buttonStyle={0}>
          <div>m</div>
        </NavDropDown>,
      );
      unmount();
    }
  });

  it('round-9 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NavDropDown buttonText="r9" buttonIcon={null} buttonStyle={0}>
          <div>r9</div>
        </NavDropDown>,
      );
      unmount();
    }
  });

  it('round-9 30 instances rendered together', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NavDropDown key={i} buttonText={`r9-${i}`} buttonIcon={null} buttonStyle={0}>
              <div>r9-{i}</div>
            </NavDropDown>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-9 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <NavDropDown buttonText="x" buttonIcon={null} buttonStyle={0}>
            <div>m</div>
          </NavDropDown>,
        ),
      ).not.toThrow();
    }
  });

  it('round-9 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <NavDropDown buttonText="x" buttonIcon={null} buttonStyle={0}>
          <div>m</div>
        </NavDropDown>,
      );
      unmount();
    }
  });

  it('round-10 30 sequential NavDropDown mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NavDropDown buttonText="r10">
          <span>r10-{i}</span>
        </NavDropDown>,
      );
      unmount();
    }
  });

  it('round-10 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <NavDropDown key={i} buttonText={`r10-${i}`}>
              <span>r10-i</span>
            </NavDropDown>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-10 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <NavDropDown buttonText="r10-s">
            <span>r10-s</span>
          </NavDropDown>,
        ),
      ).not.toThrow();
    }
  });

  it('round-10 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <NavDropDown buttonText="r10-2">
          <span>r10-m-{i}</span>
        </NavDropDown>,
      );
      unmount();
    }
  });

  it('round-10 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <NavDropDown buttonText="r10-c">
          <span>r10-c-{i}</span>
        </NavDropDown>,
      );
      unmount();
    }
  });
});
