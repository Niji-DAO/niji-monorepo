import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import BrandDropdown from './index';

describe('BrandDropdown', () => {
  const opts = (
    <>
      <option value="a">A</option>
      <option value="b">B</option>
    </>
  );

  it('renders label when provided', () => {
    const { container } = render(
      <BrandDropdown onChange={() => {}} value="a" label="Choose">
        {opts}
      </BrandDropdown>,
    );
    expect(container.querySelector('span')?.textContent).toBe('Choose');
  });

  it('omits label span when not provided', () => {
    const { container } = render(
      <BrandDropdown onChange={() => {}} value="a">
        {opts}
      </BrandDropdown>,
    );
    expect(container.querySelector('span')).toBeNull();
  });

  it('renders a <select> with children option', () => {
    const { container } = render(
      <BrandDropdown onChange={() => {}} value="a">
        {opts}
      </BrandDropdown>,
    );
    expect(container.querySelectorAll('option').length).toBe(2);
  });

  it('forwards value to select', () => {
    const { container } = render(
      <BrandDropdown onChange={() => {}} value="b">
        {opts}
      </BrandDropdown>,
    );
    expect(container.querySelector('select')?.value).toBe('b');
  });

  it('fires onChange on selection change', () => {
    const onChange = vi.fn();
    const { container } = render(
      <BrandDropdown onChange={onChange} value="a">
        {opts}
      </BrandDropdown>,
    );
    const select = container.querySelector('select');
    if (select) fireEvent.change(select, { target: { value: 'b' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('uses chevon right/top defaults (10/10) for chevron wrapper position', () => {
    const { container } = render(
      <BrandDropdown onChange={() => {}} value="a">
        {opts}
      </BrandDropdown>,
    );
    const chev = container.querySelector('div[style]');
    expect(chev?.getAttribute('style')).toContain('right: 10px');
    expect(chev?.getAttribute('style')).toContain('top: 10px');
  });

  it('respects custom chevron position', () => {
    const { container } = render(
      <BrandDropdown onChange={() => {}} value="a" chevonRight={20} chevronTop={5}>
        {opts}
      </BrandDropdown>,
    );
    const chev = container.querySelector('div[style]');
    expect(chev?.getAttribute('style')).toContain('right: 20px');
    expect(chev?.getAttribute('style')).toContain('top: 5px');
  });

  it('fires onChange repeatedly across multiple changes', () => {
    const onChange = vi.fn();
    const { container } = render(
      <BrandDropdown onChange={onChange} value="a">
        {opts}
      </BrandDropdown>,
    );
    const select = container.querySelector('select');
    if (select) {
      fireEvent.change(select, { target: { value: 'b' } });
      fireEvent.change(select, { target: { value: 'a' } });
      fireEvent.change(select, { target: { value: 'b' } });
    }
    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it('renders 1 option for single-option case', () => {
    const { container } = render(
      <BrandDropdown onChange={() => {}} value="a">
        <option value="a">A</option>
      </BrandDropdown>,
    );
    expect(container.querySelectorAll('option').length).toBe(1);
  });

  it('renders exactly 1 select element', () => {
    const { container } = render(
      <BrandDropdown onChange={() => {}} value="a">
        {opts}
      </BrandDropdown>,
    );
    expect(container.querySelectorAll('select').length).toBe(1);
  });

  it('value forward updates select.value on rerender', () => {
    const { container, rerender } = render(
      <BrandDropdown onChange={() => {}} value="a">
        {opts}
      </BrandDropdown>,
    );
    expect(container.querySelector('select')?.value).toBe('a');
    rerender(
      <BrandDropdown onChange={() => {}} value="b">
        {opts}
      </BrandDropdown>,
    );
    expect(container.querySelector('select')?.value).toBe('b');
  });

  it('label span exactly 1 when label provided', () => {
    const { container } = render(
      <BrandDropdown onChange={() => {}} value="a" label="Choose">
        {opts}
      </BrandDropdown>,
    );
    expect(container.querySelectorAll('span').length).toBe(1);
  });
});
