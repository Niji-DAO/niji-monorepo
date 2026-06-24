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

  it('passes selected value via onChange event.target.value', () => {
    let captured = '';
    const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      captured = e.target.value;
    };
    const { container } = render(
      <BrandDropdown onChange={onChange} value="a">
        {opts}
      </BrandDropdown>,
    );
    const select = container.querySelector('select');
    if (select) fireEvent.change(select, { target: { value: 'b' } });
    expect(captured).toBe('b');
  });

  it('chevron right=0 explicit value applies (not default 10)', () => {
    const { container } = render(
      <BrandDropdown onChange={() => {}} value="a" chevonRight={0}>
        {opts}
      </BrandDropdown>,
    );
    const chev = container.querySelector('div[style]');
    expect(chev?.getAttribute('style')).toContain('right: 0px');
  });

  it('chevron top=0 explicit value applies', () => {
    const { container } = render(
      <BrandDropdown onChange={() => {}} value="a" chevronTop={0}>
        {opts}
      </BrandDropdown>,
    );
    const chev = container.querySelector('div[style]');
    expect(chev?.getAttribute('style')).toContain('top: 0px');
  });

  it('renders no option when children empty', () => {
    const { container } = render(
      <BrandDropdown onChange={() => {}} value="">
        <></>
      </BrandDropdown>,
    );
    expect(container.querySelectorAll('option').length).toBe(0);
  });

  it('label text matches provided label prop verbatim', () => {
    const { container } = render(
      <BrandDropdown onChange={() => {}} value="a" label="Custom Label 123">
        {opts}
      </BrandDropdown>,
    );
    expect(container.querySelector('span')?.textContent).toBe('Custom Label 123');
  });

  it('rerender label updates span text', () => {
    const { container, rerender } = render(
      <BrandDropdown onChange={() => {}} value="a" label="L1">
        {opts}
      </BrandDropdown>,
    );
    expect(container.querySelector('span')?.textContent).toBe('L1');
    rerender(
      <BrandDropdown onChange={() => {}} value="a" label="L2">
        {opts}
      </BrandDropdown>,
    );
    expect(container.querySelector('span')?.textContent).toBe('L2');
  });

  it('multiple instances render with separate selects', () => {
    const { container } = render(
      <>
        <BrandDropdown onChange={() => {}} value="a">
          {opts}
        </BrandDropdown>
        <BrandDropdown onChange={() => {}} value="b">
          {opts}
        </BrandDropdown>
      </>,
    );
    expect(container.querySelectorAll('select').length).toBe(2);
  });

  it('unicode label renders verbatim', () => {
    const { container } = render(
      <BrandDropdown onChange={() => {}} value="a" label="選択">
        {opts}
      </BrandDropdown>,
    );
    expect(container.querySelector('span')?.textContent).toBe('選択');
  });

  it('chevron position default both 10px when neither chevonRight nor chevronTop set', () => {
    const { container } = render(
      <BrandDropdown onChange={() => {}} value="a">
        {opts}
      </BrandDropdown>,
    );
    const chev = container.querySelector('div[style]');
    expect(chev?.getAttribute('style')).toContain('10px');
  });

  it('10+ options render correctly', () => {
    const manyOpts = (
      <>
        {Array.from({ length: 10 }, (_, i) => (
          <option key={i} value={String(i)}>
            {`Option ${i}`}
          </option>
        ))}
      </>
    );
    const { container } = render(
      <BrandDropdown onChange={() => {}} value="0">
        {manyOpts}
      </BrandDropdown>,
    );
    expect(container.querySelectorAll('option').length).toBe(10);
  });
});
