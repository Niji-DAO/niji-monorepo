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
});
