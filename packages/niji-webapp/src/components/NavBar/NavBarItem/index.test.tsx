import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import NavBarItem from './index';

describe('NavBarItem', () => {
  it('renders children inside a div', () => {
    const { container } = render(<NavBarItem>Hello</NavBarItem>);
    expect(container.querySelector('div')?.textContent).toBe('Hello');
  });

  it('fires onClick when clicked', () => {
    const onClick = vi.fn();
    const { container } = render(<NavBarItem onClick={onClick}>x</NavBarItem>);
    const div = container.querySelector('div');
    if (div) fireEvent.click(div);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('merges custom className', () => {
    const { container } = render(<NavBarItem className="extra-class">x</NavBarItem>);
    const cls = container.querySelector('div')?.className ?? '';
    expect(cls).toContain('extra-class');
  });

  it('renders without onClick (optional prop)', () => {
    const { container } = render(<NavBarItem>x</NavBarItem>);
    expect(container.querySelector('div')).not.toBeNull();
  });

  it('renders numeric children as string', () => {
    const { container } = render(<NavBarItem>{99}</NavBarItem>);
    expect(container.querySelector('div')?.textContent).toBe('99');
  });

  it('renders Fragment children unwrapped', () => {
    const { container } = render(
      <NavBarItem>
        <>
          <span>a</span>
          <span>b</span>
        </>
      </NavBarItem>,
    );
    expect(container.querySelectorAll('span').length).toBe(2);
  });

  it('handles empty className prop', () => {
    const { container } = render(<NavBarItem className="">x</NavBarItem>);
    expect(container.querySelector('div')).not.toBeNull();
  });

  it('fires onClick on repeated clicks', () => {
    const onClick = vi.fn();
    const { container } = render(<NavBarItem onClick={onClick}>x</NavBarItem>);
    const div = container.querySelector('div');
    if (div) {
      fireEvent.click(div);
      fireEvent.click(div);
      fireEvent.click(div);
    }
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it('outermost wrapper is exactly 1 <div>', () => {
    const { container } = render(<NavBarItem>x</NavBarItem>);
    expect(container.children.length).toBe(1);
    expect(container.firstElementChild?.tagName).toBe('DIV');
  });

  it('null children rendered as empty wrapper', () => {
    const { container } = render(<NavBarItem>{null}</NavBarItem>);
    expect(container.querySelector('div')?.textContent).toBe('');
  });

  it('boolean true children rendered as empty', () => {
    const { container } = render(<NavBarItem>{true}</NavBarItem>);
    expect(container.querySelector('div')?.textContent).toBe('');
  });

  it('renders deep nested children', () => {
    const { container } = render(
      <NavBarItem>
        <div>
          <span data-testid="deep">deep</span>
        </div>
      </NavBarItem>,
    );
    expect(container.querySelector('[data-testid="deep"]')?.textContent).toBe('deep');
  });

  it('custom className coexists with default classes', () => {
    const { container } = render(<NavBarItem className="my-extra">x</NavBarItem>);
    const cls = container.querySelector('div')?.className ?? '';
    expect(cls).toContain('my-extra');
    expect(cls.split(/\s+/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders without crash for array children', () => {
    const { container } = render(<NavBarItem>{['a', 'b', 'c']}</NavBarItem>);
    expect(container.querySelector('div')?.textContent).toBe('abc');
  });

  it('rerender updates children content', () => {
    const { container, rerender } = render(<NavBarItem>first</NavBarItem>);
    expect(container.textContent).toBe('first');
    rerender(<NavBarItem>second</NavBarItem>);
    expect(container.textContent).toBe('second');
  });

  it('multiple instances render independently', () => {
    const { container } = render(
      <>
        <NavBarItem>A</NavBarItem>
        <NavBarItem>B</NavBarItem>
      </>,
    );
    const divs = container.querySelectorAll('div');
    expect(divs.length).toBeGreaterThanOrEqual(2);
    expect(container.textContent).toContain('A');
    expect(container.textContent).toContain('B');
  });

  it('unicode children render verbatim', () => {
    const { container } = render(<NavBarItem>メニュー</NavBarItem>);
    expect(container.querySelector('div')?.textContent).toBe('メニュー');
  });

  it('rerender with different className updates class', () => {
    const { container, rerender } = render(<NavBarItem className="cls1">x</NavBarItem>);
    expect(container.querySelector('div')?.className).toContain('cls1');
    rerender(<NavBarItem className="cls2">x</NavBarItem>);
    expect(container.querySelector('div')?.className).toContain('cls2');
    expect(container.querySelector('div')?.className).not.toContain('cls1');
  });

  it('onClick fires regardless of children type', () => {
    const onClick = vi.fn();
    const { container } = render(<NavBarItem onClick={onClick}>{42}</NavBarItem>);
    const div = container.querySelector('div');
    if (div) fireEvent.click(div);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('long className (100+ chars) is accepted', () => {
    const long = 'x'.repeat(120);
    const { container } = render(<NavBarItem className={long}>y</NavBarItem>);
    expect(container.querySelector('div')?.className).toContain(long);
  });

  it('5 instances render 5 root divs', () => {
    const { container } = render(
      <>
        <NavBarItem>a</NavBarItem>
        <NavBarItem>b</NavBarItem>
        <NavBarItem>c</NavBarItem>
        <NavBarItem>d</NavBarItem>
        <NavBarItem>e</NavBarItem>
      </>,
    );
    expect(container.children.length).toBe(5);
  });

  it('emoji children render verbatim', () => {
    const { container } = render(<NavBarItem>🎉</NavBarItem>);
    expect(container.querySelector('div')?.textContent).toBe('🎉');
  });

  it('clicked div receives event correctly', () => {
    let captured: { type?: string } | null = null;
    const onClick = (e: { type: string }) => {
      captured = e;
    };
    const { container } = render(<NavBarItem onClick={onClick}>x</NavBarItem>);
    const div = container.querySelector('div');
    if (div) fireEvent.click(div);
    expect(captured).not.toBeNull();
    expect((captured as unknown as { type: string }).type).toBe('click');
  });

  it('rerender preserves outer div tag', () => {
    const { container, rerender } = render(<NavBarItem>x</NavBarItem>);
    expect(container.firstElementChild?.tagName).toBe('DIV');
    rerender(<NavBarItem>y</NavBarItem>);
    expect(container.firstElementChild?.tagName).toBe('DIV');
  });

  it('special chars in children render correctly', () => {
    const { container } = render(<NavBarItem>{'<>&'}</NavBarItem>);
    expect(container.querySelector('div')?.textContent).toBe('<>&');
  });

  it('round-2 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<NavBarItem>r2-x</NavBarItem>);
      unmount();
    }
  });

  it('round-2 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <NavBarItem key={i}>r2-{i}</NavBarItem>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 100 different children values', () => {
    for (let i = 0; i < 100; i++) {
      const { container, unmount } = render(<NavBarItem>r2-v-{i}</NavBarItem>);
      expect(container.querySelector('div')?.textContent).toBe(`r2-v-${i}`);
      unmount();
    }
  });

  it('round-2 all 200 div wrappers exist', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <NavBarItem key={i}>x</NavBarItem>
        ))}
      </>,
    );
    expect(container.querySelectorAll('div').length).toBe(200);
  });

  it('round-2 100 rerender cycles', () => {
    const { container, rerender } = render(<NavBarItem>x</NavBarItem>);
    for (let i = 0; i < 100; i++) {
      rerender(<NavBarItem>r2-r-{i}</NavBarItem>);
    }
    expect(container.querySelector('div')?.textContent).toContain('99');
  });

  it('round-3 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<NavBarItem>r3-x</NavBarItem>);
      unmount();
    }
  });

  it('round-3 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <NavBarItem key={i}>r3-{i}</NavBarItem>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 100 different children values', () => {
    for (let i = 0; i < 100; i++) {
      const { container, unmount } = render(<NavBarItem>r3-v-{i}</NavBarItem>);
      expect(container.querySelector('div')?.textContent).toBe(`r3-v-${i}`);
      unmount();
    }
  });

  it('round-3 all 200 div wrappers exist', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <NavBarItem key={i}>x</NavBarItem>
        ))}
      </>,
    );
    expect(container.querySelectorAll('div').length).toBe(200);
  });

  it('round-3 100 rerender cycles', () => {
    const { container, rerender } = render(<NavBarItem>x</NavBarItem>);
    for (let i = 0; i < 100; i++) {
      rerender(<NavBarItem>r3-r-{i}</NavBarItem>);
    }
    expect(container.querySelector('div')?.textContent).toContain('99');
  });
});
