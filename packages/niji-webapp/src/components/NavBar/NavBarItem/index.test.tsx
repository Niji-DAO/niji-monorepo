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
});
