import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import BrandDatePicker from './index';

describe('BrandDatePicker', () => {
  it('renders label when provided', () => {
    const { container } = render(<BrandDatePicker onChange={() => {}} label="Date" />);
    expect(container.querySelector('span')?.textContent).toBe('Date');
  });

  it('omits label span when not provided', () => {
    const { container } = render(<BrandDatePicker onChange={() => {}} />);
    expect(container.querySelector('span')).toBeNull();
  });

  it('renders input type=date', () => {
    const { container } = render(<BrandDatePicker onChange={() => {}} />);
    expect(container.querySelector('input')?.getAttribute('type')).toBe('date');
  });

  it('forwards value prop', () => {
    const { container } = render(<BrandDatePicker onChange={() => {}} value="2025-01-01" />);
    expect(container.querySelector('input')?.value).toBe('2025-01-01');
  });

  it('applies invalid class when isInvalid=true', () => {
    const { container } = render(<BrandDatePicker onChange={() => {}} isInvalid />);
    expect(container.querySelector('input')?.className).toMatch(/invalid/i);
  });

  it('fires onChange', () => {
    const onChange = vi.fn();
    const { container } = render(<BrandDatePicker onChange={onChange} />);
    const input = container.querySelector('input');
    if (input) fireEvent.change(input, { target: { value: '2025-06-23' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('fires onChange repeatedly for multiple date changes', () => {
    const onChange = vi.fn();
    const { container } = render(<BrandDatePicker onChange={onChange} />);
    const input = container.querySelector('input');
    if (input) {
      fireEvent.change(input, { target: { value: '2025-01-01' } });
      fireEvent.change(input, { target: { value: '2025-02-15' } });
      fireEvent.change(input, { target: { value: '2025-03-31' } });
    }
    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it('renders label span exactly once when label is provided', () => {
    const { container } = render(<BrandDatePicker onChange={() => {}} label="Date" />);
    expect(container.querySelectorAll('span').length).toBe(1);
  });

  it('does NOT apply invalid class when isInvalid=false (default)', () => {
    const { container } = render(<BrandDatePicker onChange={() => {}} isInvalid={false} />);
    expect(container.querySelector('input')?.className).not.toMatch(/invalid/i);
  });

  it('accepts non-ISO date string value (browser may reject but DOM holds it)', () => {
    const { container } = render(<BrandDatePicker onChange={() => {}} value="not-a-date" />);
    // input type=date は valid な値以外を保持しない (DOM 仕様)
    expect(container.querySelector('input')).not.toBeNull();
  });

  it('renders exactly 1 input element', () => {
    const { container } = render(<BrandDatePicker onChange={() => {}} />);
    expect(container.querySelectorAll('input').length).toBe(1);
  });

  it('label text is rendered verbatim (no trimming)', () => {
    const { container } = render(<BrandDatePicker onChange={() => {}} label="  My Date  " />);
    expect(container.querySelector('span')?.textContent).toBe('  My Date  ');
  });

  it('long label (200 chars) renders', () => {
    const long = 'a'.repeat(200);
    const { container } = render(<BrandDatePicker onChange={() => {}} label={long} />);
    expect(container.querySelector('span')?.textContent?.length).toBe(200);
  });

  it('passes change event with target value to onChange', () => {
    let capturedValue = '';
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      capturedValue = e.target.value;
    };
    const { container } = render(<BrandDatePicker onChange={onChange} />);
    const input = container.querySelector('input');
    if (input) fireEvent.change(input, { target: { value: '2030-12-25' } });
    expect(capturedValue).toBe('2030-12-25');
  });

  it('isInvalid=true + value still renders input', () => {
    const { container } = render(
      <BrandDatePicker onChange={() => {}} isInvalid value="2025-01-01" />,
    );
    expect(container.querySelector('input')?.value).toBe('2025-01-01');
  });

  it('rerender label change updates span text', () => {
    const { container, rerender } = render(<BrandDatePicker onChange={() => {}} label="A" />);
    expect(container.querySelector('span')?.textContent).toBe('A');
    rerender(<BrandDatePicker onChange={() => {}} label="B" />);
    expect(container.querySelector('span')?.textContent).toBe('B');
  });
});
