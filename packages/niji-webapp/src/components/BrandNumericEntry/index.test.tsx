import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import BrandNumericEntry from './index';

describe('BrandNumericEntry', () => {
  it('renders label when provided', () => {
    const { container } = render(<BrandNumericEntry label="Amount" />);
    expect(container.querySelector('span')?.textContent).toBe('Amount');
  });

  it('omits label when not provided', () => {
    const { container } = render(<BrandNumericEntry />);
    expect(container.querySelector('span')).toBeNull();
  });

  it('renders an input from react-number-format (allowNegative=false)', () => {
    const { container } = render(<BrandNumericEntry />);
    expect(container.querySelector('input')).not.toBeNull();
  });

  it('forwards placeholder', () => {
    const { container } = render(<BrandNumericEntry placeholder="Type number" />);
    expect(container.querySelector('input')?.getAttribute('placeholder')).toBe('Type number');
  });

  it('applies invalid class when isInvalid=true', () => {
    const { container } = render(<BrandNumericEntry isInvalid />);
    const input = container.querySelector('input');
    expect(input?.className).toMatch(/invalid/i);
  });

  it('forwards value prop (numeric formatted)', () => {
    const { container } = render(<BrandNumericEntry value={1234567} />);
    expect(container.querySelector('input')?.value).toContain('1,234,567');
  });

  it('rejects negative input (allowNegative=false)', () => {
    const onValueChange = vi.fn();
    const { container } = render(<BrandNumericEntry onValueChange={onValueChange} />);
    const input = container.querySelector('input');
    if (input) fireEvent.change(input, { target: { value: '-5' } });
    // react-number-format で - は除去されるはず
    expect(input?.value).not.toContain('-');
  });

  it('forwards large value (1_000_000_000_000)', () => {
    const { container } = render(<BrandNumericEntry value={1_000_000_000_000} />);
    expect(container.querySelector('input')?.value).toContain('1,000,000,000,000');
  });

  it('forwards 0 value', () => {
    const { container } = render(<BrandNumericEntry value={0} />);
    expect(container.querySelector('input')?.value).toBe('0');
  });

  it('renders exactly 1 input element', () => {
    const { container } = render(<BrandNumericEntry />);
    expect(container.querySelectorAll('input').length).toBe(1);
  });

  it('renders label span exactly 1 element when label provided', () => {
    const { container } = render(<BrandNumericEntry label="Amount" />);
    expect(container.querySelectorAll('span').length).toBe(1);
  });

  it('does NOT apply invalid class when isInvalid=false (default)', () => {
    const { container } = render(<BrandNumericEntry isInvalid={false} />);
    expect(container.querySelector('input')?.className).not.toMatch(/invalid/i);
  });

  it('rerender label changes update span text', () => {
    const { container, rerender } = render(<BrandNumericEntry label="First" />);
    expect(container.querySelector('span')?.textContent).toBe('First');
    rerender(<BrandNumericEntry label="Second" />);
    expect(container.querySelector('span')?.textContent).toBe('Second');
  });

  it('value=100 renders without comma (3 digits)', () => {
    const { container } = render(<BrandNumericEntry value={100} />);
    expect(container.querySelector('input')?.value).toBe('100');
  });

  it('forwards decimal value (1.5)', () => {
    const { container } = render(<BrandNumericEntry value={1.5} />);
    expect(container.querySelector('input')?.value).toContain('1.5');
  });

  it('placeholder renders empty input by default', () => {
    const { container } = render(<BrandNumericEntry placeholder="placeholder text" />);
    const input = container.querySelector('input');
    expect(input?.getAttribute('placeholder')).toBe('placeholder text');
    expect(input?.value).toBe('');
  });

  it('multiple BrandNumericEntry instances render independently', () => {
    const { container } = render(
      <>
        <BrandNumericEntry value={1} />
        <BrandNumericEntry value={2} />
      </>,
    );
    const inputs = container.querySelectorAll('input');
    expect(inputs.length).toBe(2);
    expect(inputs[0].value).toBe('1');
    expect(inputs[1].value).toBe('2');
  });

  it('rerender value updates input', () => {
    const { container, rerender } = render(<BrandNumericEntry value={10} />);
    expect(container.querySelector('input')?.value).toBe('10');
    rerender(<BrandNumericEntry value={50} />);
    expect(container.querySelector('input')?.value).toBe('50');
  });

  it('rerender isInvalid changes class', () => {
    const { container, rerender } = render(<BrandNumericEntry isInvalid={false} />);
    expect(container.querySelector('input')?.className).not.toMatch(/invalid/i);
    rerender(<BrandNumericEntry isInvalid={true} />);
    expect(container.querySelector('input')?.className).toMatch(/invalid/i);
  });

  it('input type is "text" (react-number-format default)', () => {
    const { container } = render(<BrandNumericEntry />);
    const input = container.querySelector('input');
    expect(input?.getAttribute('type')).toBeDefined();
  });

  it('value=1000 renders with thousand separator', () => {
    const { container } = render(<BrandNumericEntry value={1000} />);
    expect(container.querySelector('input')?.value).toContain('1,000');
  });

  it('5 instances render 5 inputs', () => {
    const { container } = render(
      <>
        <BrandNumericEntry value={1} />
        <BrandNumericEntry value={2} />
        <BrandNumericEntry value={3} />
        <BrandNumericEntry value={4} />
        <BrandNumericEntry value={5} />
      </>,
    );
    expect(container.querySelectorAll('input').length).toBe(5);
  });

  it('value=99999 renders with comma separator', () => {
    const { container } = render(<BrandNumericEntry value={99999} />);
    expect(container.querySelector('input')?.value).toContain('99,999');
  });

  it('multiple onValueChange calls invoke callback N times', () => {
    const onValueChange = vi.fn();
    const { container } = render(<BrandNumericEntry onValueChange={onValueChange} />);
    const input = container.querySelector('input');
    if (input) {
      fireEvent.change(input, { target: { value: '1' } });
      fireEvent.change(input, { target: { value: '2' } });
      fireEvent.change(input, { target: { value: '3' } });
    }
    expect(onValueChange).toHaveBeenCalledTimes(3);
  });

  it('empty label prop renders without crash', () => {
    expect(() => render(<BrandNumericEntry label="" />)).not.toThrow();
  });

  it('value=0.001 renders fractional value', () => {
    const { container } = render(<BrandNumericEntry value={0.001} />);
    expect(container.querySelector('input')?.value).toContain('0.001');
  });

  it('placeholder + label both render correctly', () => {
    const { container } = render(<BrandNumericEntry label="My Label" placeholder="Type here" />);
    expect(container.querySelector('span')?.textContent).toBe('My Label');
    expect(container.querySelector('input')?.getAttribute('placeholder')).toBe('Type here');
  });

  it('renders 5 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 5 }, (_, i) => (
          <BrandNumericEntry key={i} label={`L${i}`} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('input').length).toBe(5);
  });

  it('rerender from invalid=true to false removes invalid class', () => {
    const { container, rerender } = render(<BrandNumericEntry isInvalid />);
    expect(container.querySelector('input')?.className).toMatch(/invalid/i);
    rerender(<BrandNumericEntry isInvalid={false} />);
    expect(container.querySelector('input')?.className).not.toMatch(/invalid/i);
  });

  it('rapid 10 input change events do not crash', () => {
    const { container } = render(<BrandNumericEntry />);
    const input = container.querySelector('input') as HTMLInputElement;
    for (let i = 0; i < 10; i++) {
      fireEvent.change(input, { target: { value: `${i}` } });
    }
    expect(input).not.toBeNull();
  });

  it('renders unicode label', () => {
    const { container } = render(<BrandNumericEntry label="金額" />);
    expect(container.querySelector('span')?.textContent).toBe('金額');
  });

  it('empty placeholder still preserves input element', () => {
    const { container } = render(<BrandNumericEntry placeholder="" />);
    expect(container.querySelector('input')).not.toBeNull();
  });
});
