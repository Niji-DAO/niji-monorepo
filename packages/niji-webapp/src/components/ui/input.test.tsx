import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Input } from './input';

describe('Input', () => {
  it('renders an <input> element', () => {
    const { container } = render(<Input />);
    const input = container.querySelector('input');
    expect(input).not.toBeNull();
  });

  it('forwards type prop', () => {
    const { container } = render(<Input type="password" />);
    expect(container.querySelector('input')?.type).toBe('password');
  });

  it('applies default tailwind classes', () => {
    const { container } = render(<Input />);
    const input = container.querySelector('input');
    expect(input?.getAttribute('class')).toContain('h-9');
    expect(input?.getAttribute('class')).toContain('rounded-md');
  });

  it('merges custom className with defaults', () => {
    const { container } = render(<Input className="my-custom" />);
    const input = container.querySelector('input');
    expect(input?.getAttribute('class')).toContain('my-custom');
    expect(input?.getAttribute('class')).toContain('h-9');
  });

  it('forwards arbitrary HTML attributes (placeholder)', () => {
    const { container } = render(<Input placeholder="Enter text" />);
    expect(container.querySelector('input')?.placeholder).toBe('Enter text');
  });

  it('forwards disabled attribute', () => {
    const { container } = render(<Input disabled />);
    expect(container.querySelector('input')?.disabled).toBe(true);
  });
});
