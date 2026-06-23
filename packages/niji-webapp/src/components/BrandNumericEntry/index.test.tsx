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
});
