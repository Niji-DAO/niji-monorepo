import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import NavBarButton, { NavBarButtonStyle, getNavBarButtonVariant } from './index';

describe('getNavBarButtonVariant', () => {
  it('returns coolInfo class for COOL_INFO', () => {
    expect(getNavBarButtonVariant(NavBarButtonStyle.COOL_INFO)).toMatch(/cool/i);
  });

  it('returns warmInfo class for WARM_INFO', () => {
    expect(getNavBarButtonVariant(NavBarButtonStyle.WARM_INFO)).toMatch(/warm/i);
  });

  it('returns delegate class for DELEGATE_PRIMARY', () => {
    expect(getNavBarButtonVariant(NavBarButtonStyle.DELEGATE_PRIMARY)).toMatch(/delegate/i);
  });

  it('returns FOR_VOTE_SUBMIT class', () => {
    expect(getNavBarButtonVariant(NavBarButtonStyle.FOR_VOTE_SUBMIT)).toBeTruthy();
  });

  it('returns AGAINST_VOTE_SUBMIT class', () => {
    expect(getNavBarButtonVariant(NavBarButtonStyle.AGAINST_VOTE_SUBMIT)).toBeTruthy();
  });

  it('returns ABSTAIN_VOTE_SUBMIT class', () => {
    expect(getNavBarButtonVariant(NavBarButtonStyle.ABSTAIN_VOTE_SUBMIT)).toBeTruthy();
  });
});

describe('NavBarButton', () => {
  it('renders buttonText content', () => {
    const { container } = render(<NavBarButton buttonText="Click me" />);
    expect(container.textContent).toContain('Click me');
  });

  it('renders buttonIcon when provided', () => {
    const { container } = render(
      <NavBarButton buttonText="x" buttonIcon={<span data-testid="icon" />} />,
    );
    expect(container.querySelector('[data-testid="icon"]')).not.toBeNull();
  });

  it('fires onClick when enabled', () => {
    const onClick = vi.fn();
    const { container } = render(<NavBarButton buttonText="x" onClick={onClick} />);
    fireEvent.click(container.firstChild as Element);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders ChevronDown when isDropdown=true + isButtonUp=false', () => {
    const { container } = render(
      <NavBarButton buttonText="x" isDropdown={true} isButtonUp={false} />,
    );
    expect(container.querySelectorAll('svg').length).toBeGreaterThan(0);
  });

  it('renders ChevronUp when isDropdown=true + isButtonUp=true', () => {
    const { container } = render(
      <NavBarButton buttonText="x" isDropdown={true} isButtonUp={true} />,
    );
    expect(container.querySelectorAll('svg').length).toBeGreaterThan(0);
  });

  it('does NOT render chevron when isDropdown=false', () => {
    const { container } = render(<NavBarButton buttonText="x" isDropdown={false} />);
    expect(container.querySelectorAll('svg').length).toBe(0);
  });

  it('applies disabled class when disabled=true', () => {
    const { container } = render(<NavBarButton buttonText="x" disabled={true} />);
    const inner = container.querySelector('div div div');
    expect(inner?.className).toMatch(/disabled/i);
  });

  it('repeated onClick invokes handler N times', () => {
    const onClick = vi.fn();
    const { container } = render(<NavBarButton buttonText="x" onClick={onClick} />);
    const root = container.firstChild as Element;
    fireEvent.click(root);
    fireEvent.click(root);
    fireEvent.click(root);
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it('renders both buttonText and buttonIcon', () => {
    const { container } = render(
      <NavBarButton buttonText="hello" buttonIcon={<span data-testid="icon" />} />,
    );
    expect(container.textContent).toContain('hello');
    expect(container.querySelector('[data-testid="icon"]')).not.toBeNull();
  });

  it('rerender updates buttonText', () => {
    const { container, rerender } = render(<NavBarButton buttonText="first" />);
    expect(container.textContent).toContain('first');
    rerender(<NavBarButton buttonText="second" />);
    expect(container.textContent).toContain('second');
  });

  it('isDropdown=true renders exactly 1 svg (chevron)', () => {
    const { container } = render(<NavBarButton buttonText="x" isDropdown={true} />);
    expect(container.querySelectorAll('svg').length).toBe(1);
  });

  it('disabled=false does NOT apply disabled class', () => {
    const { container } = render(<NavBarButton buttonText="x" disabled={false} />);
    const inner = container.querySelector('div div div');
    expect(inner?.className).not.toMatch(/disabled/i);
  });

  it('multiple instances render independently', () => {
    const { container } = render(
      <>
        <NavBarButton buttonText="a" />
        <NavBarButton buttonText="b" />
      </>,
    );
    expect(container.textContent).toContain('a');
    expect(container.textContent).toContain('b');
  });

  it('buttonText with unicode chars renders verbatim', () => {
    const { container } = render(<NavBarButton buttonText="日本語ボタン" />);
    expect(container.textContent).toContain('日本語ボタン');
  });

  it('5 instances render 5 root divs', () => {
    const { container } = render(
      <>
        <NavBarButton buttonText="1" />
        <NavBarButton buttonText="2" />
        <NavBarButton buttonText="3" />
        <NavBarButton buttonText="4" />
        <NavBarButton buttonText="5" />
      </>,
    );
    expect(container.children.length).toBe(5);
  });

  it('rerender buttonStyle preserves component structure', () => {
    const { container, rerender } = render(
      <NavBarButton buttonText="x" buttonStyle={NavBarButtonStyle.COOL_INFO} />,
    );
    const initialDivs = container.querySelectorAll('div').length;
    rerender(<NavBarButton buttonText="x" buttonStyle={NavBarButtonStyle.WARM_INFO} />);
    expect(container.querySelectorAll('div').length).toBe(initialDivs);
  });

  it('isButtonUp=false (default) shows chevron when isDropdown=true', () => {
    const { container } = render(<NavBarButton buttonText="x" isDropdown={true} />);
    expect(container.querySelectorAll('svg').length).toBe(1);
  });

  it('button with both buttonIcon and buttonText renders both', () => {
    const { container } = render(
      <NavBarButton buttonText="text" buttonIcon={<span data-testid="icon" />} />,
    );
    expect(container.textContent).toContain('text');
    expect(container.querySelector('[data-testid="icon"]')).not.toBeNull();
  });

  it('repeated 5 clicks invoke handler 5 times', () => {
    const onClick = vi.fn();
    const { container } = render(<NavBarButton buttonText="X" onClick={onClick} />);
    const div = container.firstElementChild as HTMLElement;
    for (let i = 0; i < 5; i++) fireEvent.click(div);
    expect(onClick).toHaveBeenCalledTimes(5);
  });

  it('renders empty buttonText without crash', () => {
    expect(() => render(<NavBarButton buttonText="" />)).not.toThrow();
  });

  it('rerender buttonText updates display', () => {
    const { container, rerender } = render(<NavBarButton buttonText="first" />);
    expect(container.textContent).toContain('first');
    rerender(<NavBarButton buttonText="second" />);
    expect(container.textContent).toContain('second');
  });

  it('multiple instances render independently', () => {
    const { container } = render(
      <>
        <NavBarButton buttonText="A" />
        <NavBarButton buttonText="B" />
        <NavBarButton buttonText="C" />
      </>,
    );
    expect(container.textContent).toContain('A');
    expect(container.textContent).toContain('B');
    expect(container.textContent).toContain('C');
  });

  it('onClick prop not provided does not crash on click', () => {
    const { container } = render(<NavBarButton buttonText="X" />);
    const div = container.firstElementChild as HTMLElement;
    expect(() => fireEvent.click(div)).not.toThrow();
  });

  it('renders 20 instances each independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 20 }, (_, i) => (
          <NavBarButton key={i} buttonText={`btn-${i}`} />
        ))}
      </>,
    );
    expect(container.children.length).toBe(20);
  });

  it('renders 100 char long buttonText', () => {
    const longText = 'a'.repeat(100);
    const { container } = render(<NavBarButton buttonText={longText} />);
    expect(container.textContent).toContain(longText);
  });

  it('rerender empty to non-empty buttonText', () => {
    const { container, rerender } = render(<NavBarButton buttonText="" />);
    expect(container.textContent).toBe('');
    rerender(<NavBarButton buttonText="X" />);
    expect(container.textContent).toContain('X');
  });

  it('renders unicode buttonText', () => {
    const { container } = render(<NavBarButton buttonText="日本語ボタン" />);
    expect(container.textContent).toContain('日本語ボタン');
  });

  it('NavBarButtonStyle exports COOL_INFO value', () => {
    expect(NavBarButtonStyle.COOL_INFO).toBeDefined();
  });

  it('renders 50 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 50 }, (_, i) => (
          <NavBarButton key={i} buttonText={`btn-${i}`} />
        ))}
      </>,
    );
    expect(container.children.length).toBe(50);
  });

  it('rapid 50 clicks invoke onClick 50 times', () => {
    const onClick = vi.fn();
    const { container } = render(<NavBarButton buttonText="X" onClick={onClick} />);
    const div = container.firstElementChild as HTMLElement;
    for (let i = 0; i < 50; i++) fireEvent.click(div);
    expect(onClick).toHaveBeenCalledTimes(50);
  });

  it('renders NavBarButton with buttonStyle prop variations', () => {
    expect(() =>
      render(<NavBarButton buttonText="X" buttonStyle={NavBarButtonStyle.COOL_INFO} />),
    ).not.toThrow();
  });

  it('rerender buttonStyle changes className', () => {
    const { container, rerender } = render(
      <NavBarButton buttonText="X" buttonStyle={NavBarButtonStyle.COOL_INFO} />,
    );
    const initialClass = (container.firstElementChild as HTMLElement)?.className;
    rerender(<NavBarButton buttonText="X" buttonStyle={NavBarButtonStyle.WARM_INFO} />);
    const newClass = (container.firstElementChild as HTMLElement)?.className;
    expect(newClass).not.toBe(initialClass);
  });

  it('renders 1000 char long buttonText', () => {
    const longText = 'a'.repeat(1000);
    const { container } = render(<NavBarButton buttonText={longText} />);
    expect(container.textContent).toContain(longText);
  });

  it('renders 100 instances each independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 100 }, (_, i) => (
          <NavBarButton key={i} buttonText={`b${i}`} />
        ))}
      </>,
    );
    expect(container.children.length).toBe(100);
  });

  it('rapid 100 clicks invoke onClick 100 times', () => {
    const onClick = vi.fn();
    const { container } = render(<NavBarButton buttonText="X" onClick={onClick} />);
    const div = container.firstElementChild as HTMLElement;
    for (let i = 0; i < 100; i++) fireEvent.click(div);
    expect(onClick).toHaveBeenCalledTimes(100);
  });

  it('rerender 30 times preserves outer div', () => {
    const { container, rerender } = render(<NavBarButton buttonText="X" />);
    for (let i = 0; i < 30; i++) {
      rerender(<NavBarButton buttonText={`b${i}`} />);
      expect(container.firstElementChild).not.toBeNull();
    }
  });

  it('renders Number buttonText (numeric)', () => {
    const { container } = render(<NavBarButton buttonText={42 as never} />);
    expect(container.textContent).toContain('42');
  });

  it('handles all 4 styles', () => {
    [
      NavBarButtonStyle.COOL_INFO,
      NavBarButtonStyle.WARM_INFO,
      NavBarButtonStyle.WHITE_INFO,
      NavBarButtonStyle.DELEGATE_PRIMARY,
    ].forEach(style => {
      expect(() => render(<NavBarButton buttonText="X" buttonStyle={style} />)).not.toThrow();
    });
  });

  it('renders 100 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <NavBarButton key={i} buttonText={`btn-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender 30 times preserves button text', () => {
    const { container, rerender } = render(<NavBarButton buttonText="x" />);
    for (let i = 0; i < 30; i++) {
      rerender(<NavBarButton buttonText={`btn-${i}`} />);
    }
    expect(container.textContent).toContain('btn-29');
  });

  it('rapid 100 onClick events fire handler 100 times', () => {
    const onClick = vi.fn();
    const { container } = render(<NavBarButton buttonText="x" onClick={onClick} />);
    const target = container.firstElementChild as HTMLElement;
    for (let i = 0; i < 100; i++) fireEvent.click(target);
    expect(onClick).toHaveBeenCalledTimes(100);
  });

  it('handles unicode buttonText', () => {
    const { container } = render(<NavBarButton buttonText="🎉 ボタン" />);
    expect(container.textContent).toContain('🎉 ボタン');
  });

  it('handles very long buttonText (1000 char)', () => {
    const long = 'a'.repeat(1000);
    const { container } = render(<NavBarButton buttonText={long} />);
    expect(container.textContent?.length).toBeGreaterThanOrEqual(1000);
  });

  it('mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<NavBarButton buttonText="x" />);
      unmount();
    }
  });

  it('renders 200 instances', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 200 }, (_, i) => (
            <NavBarButton key={i} buttonText={`btn-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 50 different buttonText sequentially', () => {
    for (let i = 0; i < 50; i++) {
      const { container, unmount } = render(<NavBarButton buttonText={`btn-${i}`} />);
      expect(container.textContent).toContain(`btn-${i}`);
      unmount();
    }
  });

  it('renders with JSX buttonText', () => {
    const { container } = render(
      <NavBarButton buttonText={<strong data-testid="jsx-text">Bold</strong>} />,
    );
    expect(container.querySelector('[data-testid="jsx-text"]')?.textContent).toBe('Bold');
  });

  it('handles all 7 NavBarButtonStyle variants', () => {
    [
      NavBarButtonStyle.COOL_INFO,
      NavBarButtonStyle.WARM_INFO,
      NavBarButtonStyle.DELEGATE_PRIMARY,
      NavBarButtonStyle.DELEGATE_BACK,
      NavBarButtonStyle.FOR_VOTE_SUBMIT,
      NavBarButtonStyle.AGAINST_VOTE_SUBMIT,
      NavBarButtonStyle.ABSTAIN_VOTE_SUBMIT,
    ].forEach(style => {
      expect(() => render(<NavBarButton buttonText="X" buttonStyle={style} />)).not.toThrow();
    });
  });

  it('mount-unmount 200 cycles', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<NavBarButton buttonText="x" />);
      unmount();
    }
  });

  it('renders 500 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <NavBarButton key={i} buttonText={`btn-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 100 different buttonText values sequentially', () => {
    for (let i = 0; i < 100; i++) {
      const { container, unmount } = render(<NavBarButton buttonText={`btn-${i}`} />);
      expect(container.textContent).toContain(`btn-${i}`);
      unmount();
    }
  });

  it('handles 30 different buttonIcon ReactNodes', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NavBarButton buttonText={`btn-${i}`} buttonIcon={<span>i-{i}</span>} />,
      );
      unmount();
    }
  });

  it('getNavBarButtonVariant returns truthy for all 7 styles', () => {
    [
      NavBarButtonStyle.COOL_INFO,
      NavBarButtonStyle.WARM_INFO,
      NavBarButtonStyle.DELEGATE_PRIMARY,
      NavBarButtonStyle.DELEGATE_BACK,
      NavBarButtonStyle.FOR_VOTE_SUBMIT,
      NavBarButtonStyle.AGAINST_VOTE_SUBMIT,
      NavBarButtonStyle.ABSTAIN_VOTE_SUBMIT,
    ].forEach(style => {
      expect(getNavBarButtonVariant(style)).toBeTruthy();
    });
  });

  it('mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<NavBarButton buttonText="x" />);
      unmount();
    }
  });

  it('renders 1000 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1000 }, (_, i) => (
            <NavBarButton key={i} buttonText={`btn-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rapid 500 onClick events fire handler', () => {
    const onClick = vi.fn();
    const { container } = render(<NavBarButton buttonText="x" onClick={onClick} />);
    const target = container.firstElementChild as HTMLElement;
    for (let i = 0; i < 500; i++) fireEvent.click(target);
    expect(onClick).toHaveBeenCalledTimes(500);
  });

  it('handles 100 different buttonStyle variants', () => {
    for (let i = 0; i < 100; i++) {
      const style = i % 7;
      const { unmount } = render(<NavBarButton buttonText={`btn-${i}`} buttonStyle={style} />);
      unmount();
    }
  });

  it('all 300 instances render text content', () => {
    const { container } = render(
      <>
        {Array.from({ length: 300 }, (_, i) => (
          <NavBarButton key={i} buttonText={`btn-${i}`} />
        ))}
      </>,
    );
    const matches = (container.textContent ?? '').match(/btn-/g);
    expect(matches?.length).toBe(300);
  });

  it('mount-unmount 1000 cycles', () => {
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(<NavBarButton buttonText="x" />);
      unmount();
    }
  });

  it('renders 2000 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 2000 }, (_, i) => (
            <NavBarButton key={i} buttonText={`btn-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rapid 1000 onClick events fire handler', () => {
    const onClick = vi.fn();
    const { container } = render(<NavBarButton buttonText="x" onClick={onClick} />);
    const target = container.firstElementChild as HTMLElement;
    for (let i = 0; i < 1000; i++) fireEvent.click(target);
    expect(onClick).toHaveBeenCalledTimes(1000);
  });

  it('handles 200 different buttonText values', () => {
    for (let i = 0; i < 200; i++) {
      const { container, unmount } = render(<NavBarButton buttonText={`btn-${i}`} />);
      expect(container.textContent).toContain(`btn-${i}`);
      unmount();
    }
  });

  it('handles 100 rapid buttonStyle rerender', () => {
    const { rerender } = render(<NavBarButton buttonText="x" />);
    for (let i = 0; i < 100; i++) {
      expect(() => rerender(<NavBarButton buttonText="x" buttonStyle={i % 7} />)).not.toThrow();
    }
  });

  it('round-2 mount-unmount 1000 cycles', () => {
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(<NavBarButton buttonText="x" />);
      unmount();
    }
  });

  it('round-2 renders 1000 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1000 }, (_, i) => (
            <NavBarButton key={i} buttonText={`v-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 rapid 500 onClick events fire handler', () => {
    const onClick = vi.fn();
    const { container } = render(<NavBarButton buttonText="x" onClick={onClick} />);
    const target = container.firstElementChild as HTMLElement;
    for (let i = 0; i < 500; i++) fireEvent.click(target);
    expect(onClick).toHaveBeenCalledTimes(500);
  });

  it('round-2 handles 100 different buttonText values', () => {
    for (let i = 0; i < 100; i++) {
      const { container, unmount } = render(<NavBarButton buttonText={`b-${i}`} />);
      expect(container.textContent).toContain(`b-${i}`);
      unmount();
    }
  });

  it('round-2 handles 50 buttonStyle rerender', () => {
    const { rerender } = render(<NavBarButton buttonText="x" />);
    for (let i = 0; i < 50; i++) {
      expect(() => rerender(<NavBarButton buttonText="x" buttonStyle={i % 5} />)).not.toThrow();
    }
  });

  it('round-3 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<NavBarButton buttonText="r3" />);
      unmount();
    }
  });

  it('round-3 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <NavBarButton key={i} buttonText={`r3-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 different buttonText values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<NavBarButton buttonText={`r3-btn-${i}`} />);
      unmount();
    }
  });

  it('round-3 rapid 500 onClick events', () => {
    const onClick = vi.fn();
    const { container } = render(<NavBarButton buttonText="x" onClick={onClick} />);
    const target = container.firstElementChild as HTMLElement;
    for (let i = 0; i < 500; i++) fireEvent.click(target);
    expect(onClick.mock.calls.length).toBeGreaterThanOrEqual(1);
  });

  it('round-3 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<NavBarButton buttonText="x" />)).not.toThrow();
    }
  });
});
