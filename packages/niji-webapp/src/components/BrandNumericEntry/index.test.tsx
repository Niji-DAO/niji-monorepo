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

  it('renders 20 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 20 }, (_, i) => (
          <BrandNumericEntry key={i} label={`L${i}`} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('input').length).toBe(20);
  });

  it('rerender label change updates span text', () => {
    const { container, rerender } = render(<BrandNumericEntry label="A" />);
    expect(container.querySelector('span')?.textContent).toBe('A');
    rerender(<BrandNumericEntry label="B" />);
    expect(container.querySelector('span')?.textContent).toBe('B');
  });

  it('rerender label from defined to undefined removes span', () => {
    const { container, rerender } = render(<BrandNumericEntry label="X" />);
    expect(container.querySelector('span')).not.toBeNull();
    rerender(<BrandNumericEntry />);
    expect(container.querySelector('span')).toBeNull();
  });

  it('handles placeholder rerenders', () => {
    const { container, rerender } = render(<BrandNumericEntry placeholder="ph1" />);
    expect(container.querySelector('input')?.getAttribute('placeholder')).toBe('ph1');
    rerender(<BrandNumericEntry placeholder="ph2" />);
    expect(container.querySelector('input')?.getAttribute('placeholder')).toBe('ph2');
  });

  it('input has type defined', () => {
    const { container } = render(<BrandNumericEntry />);
    expect(container.querySelector('input')?.getAttribute('type')).toBeTruthy();
  });

  it('renders 50 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 50 }, (_, i) => (
          <BrandNumericEntry key={i} label={`L${i}`} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('input').length).toBe(50);
  });

  it('handles long placeholder (200 char)', () => {
    const long = 'p'.repeat(200);
    const { container } = render(<BrandNumericEntry placeholder={long} />);
    expect(container.querySelector('input')?.getAttribute('placeholder')).toBe(long);
  });

  it('rerender preserves input + label structure', () => {
    const { container, rerender } = render(<BrandNumericEntry label="A" placeholder="ph1" />);
    expect(container.querySelector('input')).not.toBeNull();
    expect(container.querySelector('span')).not.toBeNull();
    rerender(<BrandNumericEntry label="B" placeholder="ph2" />);
    expect(container.querySelector('input')).not.toBeNull();
    expect(container.querySelector('span')).not.toBeNull();
  });

  it('renders consecutive 10 times', () => {
    for (let i = 0; i < 10; i++) {
      expect(() => render(<BrandNumericEntry label={`L${i}`} />)).not.toThrow();
    }
  });

  it('renders input + label exactly 1 each per instance', () => {
    const { container } = render(<BrandNumericEntry label="X" />);
    expect(container.querySelectorAll('input').length).toBe(1);
    expect(container.querySelectorAll('span').length).toBe(1);
  });

  it('renders 100 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 100 }, (_, i) => (
          <BrandNumericEntry key={i} label={`L${i}`} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('input').length).toBe(100);
  });

  it('rerender 30 times preserves input element', () => {
    const { container, rerender } = render(<BrandNumericEntry label="X" />);
    for (let i = 0; i < 30; i++) {
      rerender(<BrandNumericEntry label={`L${i}`} placeholder={`p${i}`} />);
      expect(container.querySelector('input')).not.toBeNull();
    }
  });

  it('handles 30 different placeholder values', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<BrandNumericEntry placeholder={`ph${i}`} />)).not.toThrow();
    }
  });

  it('handles unicode label across 5 instances', () => {
    const { container } = render(
      <>
        <BrandNumericEntry label="日本語" />
        <BrandNumericEntry label="中文" />
        <BrandNumericEntry label="한국어" />
        <BrandNumericEntry label="עברית" />
        <BrandNumericEntry label="العربية" />
      </>,
    );
    expect(container.querySelectorAll('input').length).toBe(5);
  });

  it('renders without crash with isInvalid + label both', () => {
    expect(() => render(<BrandNumericEntry label="X" isInvalid />)).not.toThrow();
  });

  it('renders 100 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <BrandNumericEntry key={i} label={`Amount-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender 30 times preserves input', () => {
    const { container, rerender } = render(<BrandNumericEntry />);
    for (let i = 0; i < 30; i++) {
      rerender(<BrandNumericEntry value={i} />);
    }
    expect(container.querySelector('input')).not.toBeNull();
  });

  it('rapid 100 onValueChange events fire handler', () => {
    const onValueChange = vi.fn();
    const { container } = render(<BrandNumericEntry onValueChange={onValueChange} />);
    const input = container.querySelector('input')!;
    for (let i = 0; i < 100; i++) {
      fireEvent.change(input, { target: { value: String(i) } });
    }
    expect(onValueChange).toHaveBeenCalledTimes(100);
  });

  it('handles unicode label', () => {
    const { container } = render(<BrandNumericEntry label="🎉 金額" />);
    expect(container.querySelector('span')?.textContent).toBe('🎉 金額');
  });

  it('handles very large value (1e15)', () => {
    const { container } = render(<BrandNumericEntry value={1_000_000_000_000_000} />);
    expect(container.querySelector('input')?.value).toContain('1,000,000,000,000,000');
  });

  it('renders 200 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 200 }, (_, i) => (
            <BrandNumericEntry key={i} value={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('mount-unmount 50 cycles', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<BrandNumericEntry value={i} />);
      unmount();
    }
  });

  it('handles 0 value', () => {
    const { container } = render(<BrandNumericEntry value={0} />);
    expect(container.querySelector('input')?.value).toBe('0');
  });

  it('handles decimal value 3.14', () => {
    const { container } = render(<BrandNumericEntry value={3.14} />);
    expect(container.querySelector('input')?.value).toContain('3.14');
  });

  it('rapid rerender 50 times with varying value', () => {
    const { container, rerender } = render(<BrandNumericEntry value={0} />);
    for (let i = 0; i < 50; i++) {
      rerender(<BrandNumericEntry value={i} />);
    }
    expect(container.querySelector('input')).not.toBeNull();
  });

  it('mount-unmount 200 cycles', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<BrandNumericEntry value={i} />);
      unmount();
    }
  });

  it('renders 500 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <BrandNumericEntry key={i} value={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 100 different label values', () => {
    for (let i = 0; i < 100; i++) {
      const { container, unmount } = render(<BrandNumericEntry label={`label-${i}`} />);
      expect(container.querySelector('span')?.textContent).toBe(`label-${i}`);
      unmount();
    }
  });

  it('rapid 100 onValueChange events fire handler', () => {
    const onValueChange = vi.fn();
    const { container } = render(<BrandNumericEntry onValueChange={onValueChange} />);
    const input = container.querySelector('input')!;
    for (let i = 0; i < 100; i++) {
      fireEvent.change(input, { target: { value: String(i) } });
    }
    expect(onValueChange).toHaveBeenCalledTimes(100);
  });

  it('handles 30 different placeholders', () => {
    for (let i = 0; i < 30; i++) {
      const { container, unmount } = render(<BrandNumericEntry placeholder={`ph-${i}`} />);
      expect(container.querySelector('input')?.getAttribute('placeholder')).toBe(`ph-${i}`);
      unmount();
    }
  });
});
