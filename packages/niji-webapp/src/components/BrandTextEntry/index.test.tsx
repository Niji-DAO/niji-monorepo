import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import BrandTextEntry from './index';

describe('BrandTextEntry', () => {
  it('renders label when provided', () => {
    const { container } = render(<BrandTextEntry onChange={() => {}} label="My Label" />);
    expect(container.querySelector('span')?.textContent).toBe('My Label');
  });

  it('omits label span when not provided', () => {
    const { container } = render(<BrandTextEntry onChange={() => {}} />);
    expect(container.querySelector('span')).toBeNull();
  });

  it('renders input with type defaulting to "string"', () => {
    const { container } = render(<BrandTextEntry onChange={() => {}} />);
    const input = container.querySelector('input');
    expect(input?.getAttribute('type')).toBe('string');
  });

  it('forwards type prop', () => {
    const { container } = render(<BrandTextEntry onChange={() => {}} type="number" />);
    expect(container.querySelector('input')?.getAttribute('type')).toBe('number');
  });

  it('forwards placeholder, value, min', () => {
    const { container } = render(
      <BrandTextEntry onChange={() => {}} placeholder="Enter" value="abc" min="0" />,
    );
    const input = container.querySelector('input');
    expect(input?.getAttribute('placeholder')).toBe('Enter');
    expect(input?.value).toBe('abc');
    expect(input?.getAttribute('min')).toBe('0');
  });

  it('applies invalid class when isInvalid=true', () => {
    const { container } = render(<BrandTextEntry onChange={() => {}} isInvalid />);
    const input = container.querySelector('input');
    expect(input?.className).toMatch(/invalid/i);
  });

  it('fires onChange on user typing', () => {
    const onChange = vi.fn();
    const { container } = render(<BrandTextEntry onChange={onChange} />);
    const input = container.querySelector('input');
    if (input) fireEvent.change(input, { target: { value: 'hi' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('fires onChange repeatedly across multiple changes', () => {
    const onChange = vi.fn();
    const { container } = render(<BrandTextEntry onChange={onChange} />);
    const input = container.querySelector('input');
    if (input) {
      fireEvent.change(input, { target: { value: 'a' } });
      fireEvent.change(input, { target: { value: 'ab' } });
      fireEvent.change(input, { target: { value: 'abc' } });
    }
    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it('handles large value string (1000 chars)', () => {
    const long = 'a'.repeat(1000);
    const { container } = render(<BrandTextEntry onChange={() => {}} value={long} />);
    expect(container.querySelector('input')?.value.length).toBe(1000);
  });

  it('forwards type="email"', () => {
    const { container } = render(<BrandTextEntry onChange={() => {}} type="email" />);
    expect(container.querySelector('input')?.getAttribute('type')).toBe('email');
  });

  it('renders exactly 1 input element', () => {
    const { container } = render(<BrandTextEntry onChange={() => {}} />);
    expect(container.querySelectorAll('input').length).toBe(1);
  });

  it('does NOT apply invalid class when isInvalid=false (default)', () => {
    const { container } = render(<BrandTextEntry onChange={() => {}} isInvalid={false} />);
    expect(container.querySelector('input')?.className).not.toMatch(/invalid/i);
  });

  it('rerender label change updates span text', () => {
    const { container, rerender } = render(<BrandTextEntry onChange={() => {}} label="X" />);
    expect(container.querySelector('span')?.textContent).toBe('X');
    rerender(<BrandTextEntry onChange={() => {}} label="Y" />);
    expect(container.querySelector('span')?.textContent).toBe('Y');
  });

  it('forwards type="password"', () => {
    const { container } = render(<BrandTextEntry onChange={() => {}} type="password" />);
    expect(container.querySelector('input')?.getAttribute('type')).toBe('password');
  });

  it('passes event with target value to onChange', () => {
    let captured = '';
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      captured = e.target.value;
    };
    const { container } = render(<BrandTextEntry onChange={onChange} />);
    const input = container.querySelector('input');
    if (input) fireEvent.change(input, { target: { value: 'hello' } });
    expect(captured).toBe('hello');
  });

  it('multiple instances render independently', () => {
    const { container } = render(
      <>
        <BrandTextEntry onChange={() => {}} value="a" />
        <BrandTextEntry onChange={() => {}} value="b" />
      </>,
    );
    const inputs = container.querySelectorAll('input');
    expect(inputs.length).toBe(2);
    expect(inputs[0].value).toBe('a');
    expect(inputs[1].value).toBe('b');
  });

  it('unicode value renders as-is', () => {
    const { container } = render(<BrandTextEntry onChange={() => {}} value="あいうえお" />);
    expect(container.querySelector('input')?.value).toBe('あいうえお');
  });

  it('rerender from invalid=false to true updates class', () => {
    const { container, rerender } = render(
      <BrandTextEntry onChange={() => {}} isInvalid={false} />,
    );
    expect(container.querySelector('input')?.className).not.toMatch(/invalid/i);
    rerender(<BrandTextEntry onChange={() => {}} isInvalid={true} />);
    expect(container.querySelector('input')?.className).toMatch(/invalid/i);
  });

  it('empty value renders empty input', () => {
    const { container } = render(<BrandTextEntry onChange={() => {}} value="" />);
    expect(container.querySelector('input')?.value).toBe('');
  });

  it('type="search" forwards correctly', () => {
    const { container } = render(<BrandTextEntry onChange={() => {}} type="search" />);
    expect(container.querySelector('input')?.getAttribute('type')).toBe('search');
  });

  it('placeholder not forwarded does not set placeholder attribute', () => {
    const { container } = render(<BrandTextEntry onChange={() => {}} />);
    expect(container.querySelector('input')?.getAttribute('placeholder')).toBeNull();
  });

  it('5 instances render 5 inputs', () => {
    const { container } = render(
      <>
        <BrandTextEntry onChange={() => {}} value="1" />
        <BrandTextEntry onChange={() => {}} value="2" />
        <BrandTextEntry onChange={() => {}} value="3" />
        <BrandTextEntry onChange={() => {}} value="4" />
        <BrandTextEntry onChange={() => {}} value="5" />
      </>,
    );
    expect(container.querySelectorAll('input').length).toBe(5);
  });
});
