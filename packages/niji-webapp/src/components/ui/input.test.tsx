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

  it('forwards numeric value prop', () => {
    const { container } = render(<Input type="number" defaultValue={42} />);
    expect(container.querySelector('input')?.value).toBe('42');
  });

  it('renders with undefined className (defaults preserved)', () => {
    const { container } = render(<Input className={undefined} />);
    expect(container.querySelector('input')?.getAttribute('class')).toContain('h-9');
  });

  it('forwards required attribute', () => {
    const { container } = render(<Input required />);
    expect(container.querySelector('input')?.required).toBe(true);
  });

  it('forwards readOnly attribute', () => {
    const { container } = render(<Input readOnly />);
    expect(container.querySelector('input')?.readOnly).toBe(true);
  });

  it('renders type=email correctly', () => {
    const { container } = render(<Input type="email" />);
    expect(container.querySelector('input')?.type).toBe('email');
  });

  it('renders exactly 1 input element', () => {
    const { container } = render(<Input />);
    expect(container.querySelectorAll('input').length).toBe(1);
  });
});
