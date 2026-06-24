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

  it('100 options render without crash', () => {
    const manyOpts = (
      <>
        {Array.from({ length: 100 }, (_, i) => (
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
    expect(container.querySelectorAll('option').length).toBe(100);
  });

  it('rerender value changes select.value', () => {
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

  it('chevron right/top default both 10 when neither prop set', () => {
    const { container } = render(
      <BrandDropdown onChange={() => {}} value="a">
        {opts}
      </BrandDropdown>,
    );
    const chev = container.querySelector('div[style]');
    expect(chev?.getAttribute('style')).toContain('right: 10px');
    expect(chev?.getAttribute('style')).toContain('top: 10px');
  });

  it('select element outermost wrapper exists', () => {
    const { container } = render(
      <BrandDropdown onChange={() => {}} value="a">
        {opts}
      </BrandDropdown>,
    );
    expect(container.querySelector('select')).not.toBeNull();
  });

  it('long label (200 chars) renders verbatim', () => {
    const long = 'a'.repeat(200);
    const { container } = render(
      <BrandDropdown onChange={() => {}} value="a" label={long}>
        {opts}
      </BrandDropdown>,
    );
    expect(container.querySelector('span')?.textContent).toBe(long);
  });

  it('rerender chevron position updates inline style', () => {
    const { container, rerender } = render(
      <BrandDropdown onChange={() => {}} value="a" chevonRight={10}>
        {opts}
      </BrandDropdown>,
    );
    expect(container.querySelector('div[style]')?.getAttribute('style')).toContain('right: 10px');
    rerender(
      <BrandDropdown onChange={() => {}} value="a" chevonRight={50}>
        {opts}
      </BrandDropdown>,
    );
    expect(container.querySelector('div[style]')?.getAttribute('style')).toContain('right: 50px');
  });

  it('renders 5 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 5 }, (_, i) => (
          <BrandDropdown key={i} onChange={() => {}} value="a" label={`L${i}`}>
            {opts}
          </BrandDropdown>
        ))}
      </>,
    );
    expect(container.querySelectorAll('select').length).toBe(5);
  });

  it('rerender from "a" to "b" updates value', () => {
    const { container, rerender } = render(
      <BrandDropdown onChange={() => {}} value="a">
        {opts}
      </BrandDropdown>,
    );
    expect((container.querySelector('select') as HTMLSelectElement)?.value).toBe('a');
    rerender(
      <BrandDropdown onChange={() => {}} value="b">
        {opts}
      </BrandDropdown>,
    );
    expect((container.querySelector('select') as HTMLSelectElement)?.value).toBe('b');
  });

  it('rapid 10 change events invoke handler 10 times', () => {
    const onChange = vi.fn();
    const { container } = render(
      <BrandDropdown onChange={onChange} value="a">
        {opts}
      </BrandDropdown>,
    );
    const select = container.querySelector('select') as HTMLSelectElement;
    for (let i = 0; i < 10; i++) {
      fireEvent.change(select, { target: { value: i % 2 === 0 ? 'a' : 'b' } });
    }
    expect(onChange).toHaveBeenCalledTimes(10);
  });

  it('renders unicode label', () => {
    const { container } = render(
      <BrandDropdown onChange={() => {}} value="a" label="選択">
        {opts}
      </BrandDropdown>,
    );
    expect(container.querySelector('span')?.textContent).toBe('選択');
  });

  it('empty children renders select without options', () => {
    const { container } = render(
      <BrandDropdown onChange={() => {}} value="">
        {[]}
      </BrandDropdown>,
    );
    expect(container.querySelector('select')).not.toBeNull();
  });

  it('renders 15 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 15 }, (_, i) => (
          <BrandDropdown key={i} onChange={() => {}} value="a">
            {opts}
          </BrandDropdown>
        ))}
      </>,
    );
    expect(container.querySelectorAll('select').length).toBe(15);
  });

  it('renders label rerender from defined to undefined', () => {
    const { container, rerender } = render(
      <BrandDropdown onChange={() => {}} value="a" label="L">
        {opts}
      </BrandDropdown>,
    );
    expect(container.querySelector('span')?.textContent).toBe('L');
    rerender(
      <BrandDropdown onChange={() => {}} value="a">
        {opts}
      </BrandDropdown>,
    );
    expect(container.querySelector('span')).toBeNull();
  });

  it('handles disabled state via prop', () => {
    expect(() =>
      render(
        <BrandDropdown onChange={() => {}} value="a" disabled>
          {opts}
        </BrandDropdown>,
      ),
    ).not.toThrow();
  });

  it('select element has options children', () => {
    const { container } = render(
      <BrandDropdown onChange={() => {}} value="a">
        {opts}
      </BrandDropdown>,
    );
    expect(container.querySelectorAll('option').length).toBe(2);
  });

  it('rerender with new value updates select.value', () => {
    const { container, rerender } = render(
      <BrandDropdown onChange={() => {}} value="a">
        {opts}
      </BrandDropdown>,
    );
    expect((container.querySelector('select') as HTMLSelectElement)?.value).toBe('a');
    rerender(
      <BrandDropdown onChange={() => {}} value="b">
        {opts}
      </BrandDropdown>,
    );
    expect((container.querySelector('select') as HTMLSelectElement)?.value).toBe('b');
  });
});
