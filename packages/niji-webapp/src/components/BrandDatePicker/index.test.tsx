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
});
