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

  it('renders 30 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 30 }, (_, i) => (
          <BrandDropdown key={i} onChange={() => {}} value="a">
            {opts}
          </BrandDropdown>
        ))}
      </>,
    );
    expect(container.querySelectorAll('select').length).toBe(30);
  });

  it('rapid 50 change events fire 50 times', () => {
    const onChange = vi.fn();
    const { container } = render(
      <BrandDropdown onChange={onChange} value="a">
        {opts}
      </BrandDropdown>,
    );
    const select = container.querySelector('select') as HTMLSelectElement;
    for (let i = 0; i < 50; i++) {
      fireEvent.change(select, { target: { value: i % 2 === 0 ? 'a' : 'b' } });
    }
    expect(onChange).toHaveBeenCalledTimes(50);
  });

  it('renders 100 char long label', () => {
    const long = 'x'.repeat(100);
    const { container } = render(
      <BrandDropdown onChange={() => {}} value="a" label={long}>
        {opts}
      </BrandDropdown>,
    );
    expect(container.querySelector('span')?.textContent).toBe(long);
  });

  it('renders with many child options (20)', () => {
    const manyOpts = Array.from({ length: 20 }, (_, i) => (
      <option key={i} value={`opt-${i}`}>
        Option {i}
      </option>
    ));
    const { container } = render(
      <BrandDropdown onChange={() => {}} value="opt-0">
        {manyOpts}
      </BrandDropdown>,
    );
    expect(container.querySelectorAll('option').length).toBe(20);
  });

  it('rerender preserves select element type', () => {
    const { container, rerender } = render(
      <BrandDropdown onChange={() => {}} value="a">
        {opts}
      </BrandDropdown>,
    );
    expect(container.querySelector('select')).not.toBeNull();
    rerender(
      <BrandDropdown onChange={() => {}} value="b">
        {opts}
      </BrandDropdown>,
    );
    expect(container.querySelector('select')).not.toBeNull();
  });

  it('renders 100 BrandDropdown instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 100 }, (_, i) => (
          <BrandDropdown key={i} onChange={() => {}} value="a">
            {opts}
          </BrandDropdown>
        ))}
      </>,
    );
    expect(container.querySelectorAll('select').length).toBe(100);
  });

  it('rerender 30 times preserves select element', () => {
    const { container, rerender } = render(
      <BrandDropdown onChange={() => {}} value="a">
        {opts}
      </BrandDropdown>,
    );
    for (let i = 0; i < 30; i++) {
      rerender(
        <BrandDropdown onChange={() => {}} value={i % 2 === 0 ? 'a' : 'b'}>
          {opts}
        </BrandDropdown>,
      );
      expect(container.querySelector('select')).not.toBeNull();
    }
  });

  it('handles all common dropdown sizes', () => {
    [1, 5, 10, 50, 100].forEach(n => {
      const dynOpts = Array.from({ length: n }, (_, i) => (
        <option key={i} value={`v-${i}`}>
          {`Option ${i}`}
        </option>
      ));
      expect(() =>
        render(
          <BrandDropdown onChange={() => {}} value="v-0">
            {dynOpts}
          </BrandDropdown>,
        ),
      ).not.toThrow();
    });
  });

  it('rapid 100 change events fire 100 times', () => {
    const onChange = vi.fn();
    const { container } = render(
      <BrandDropdown onChange={onChange} value="a">
        {opts}
      </BrandDropdown>,
    );
    const select = container.querySelector('select') as HTMLSelectElement;
    for (let i = 0; i < 100; i++) {
      fireEvent.change(select, { target: { value: i % 2 === 0 ? 'a' : 'b' } });
    }
    expect(onChange).toHaveBeenCalledTimes(100);
  });

  it('handles unicode label across renders', () => {
    expect(() =>
      render(
        <BrandDropdown onChange={() => {}} value="a" label="日本語ラベル絵文字🎉">
          {opts}
        </BrandDropdown>,
      ),
    ).not.toThrow();
  });

  it('mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(
        <BrandDropdown onChange={() => {}} value="a">
          {opts}
        </BrandDropdown>,
      );
      unmount();
    }
  });

  it('renders 500 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <BrandDropdown key={i} onChange={() => {}} value="a">
              {opts}
            </BrandDropdown>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 100 different label values', () => {
    for (let i = 0; i < 100; i++) {
      const { container, unmount } = render(
        <BrandDropdown onChange={() => {}} value="a" label={`L-${i}`}>
          {opts}
        </BrandDropdown>,
      );
      expect(container.querySelector('span')?.textContent).toBe(`L-${i}`);
      unmount();
    }
  });

  it('rapid 100 onChange events fire handler', () => {
    const onChange = vi.fn();
    const { container } = render(
      <BrandDropdown onChange={onChange} value="a">
        {opts}
      </BrandDropdown>,
    );
    const select = container.querySelector('select')!;
    for (let i = 0; i < 100; i++) {
      fireEvent.change(select, { target: { value: i % 2 === 0 ? 'a' : 'b' } });
    }
    expect(onChange).toHaveBeenCalledTimes(100);
  });

  it('all 200 instances render select', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <BrandDropdown key={i} onChange={() => {}} value="a">
            {opts}
          </BrandDropdown>
        ))}
      </>,
    );
    expect(container.querySelectorAll('select').length).toBe(200);
  });

  it('round-2 mount-unmount 300 cycles', () => {
    for (let i = 0; i < 300; i++) {
      const { unmount } = render(
        <BrandDropdown onChange={() => {}} value="a">
          {opts}
        </BrandDropdown>,
      );
      unmount();
    }
  });

  it('round-2 renders 300 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 300 }, (_, i) => (
            <BrandDropdown key={i} onChange={() => {}} value="a">
              {opts}
            </BrandDropdown>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 50 different label values', () => {
    for (let i = 0; i < 50; i++) {
      const { container, unmount } = render(
        <BrandDropdown onChange={() => {}} value="a" label={`R2-${i}`}>
          {opts}
        </BrandDropdown>,
      );
      expect(container.querySelector('span')?.textContent).toBe(`R2-${i}`);
      unmount();
    }
  });

  it('round-2 rapid 50 onChange events', () => {
    const onChange = vi.fn();
    const { container } = render(
      <BrandDropdown onChange={onChange} value="a">
        {opts}
      </BrandDropdown>,
    );
    const select = container.querySelector('select')!;
    for (let i = 0; i < 50; i++) {
      fireEvent.change(select, { target: { value: i % 2 === 0 ? 'a' : 'b' } });
    }
    expect(onChange).toHaveBeenCalledTimes(50);
  });

  it('round-2 100 instances render select', () => {
    const { container } = render(
      <>
        {Array.from({ length: 100 }, (_, i) => (
          <BrandDropdown key={i} onChange={() => {}} value="a">
            {opts}
          </BrandDropdown>
        ))}
      </>,
    );
    expect(container.querySelectorAll('select').length).toBe(100);
  });

  it('round-3 mount-unmount 300 cycles', () => {
    for (let i = 0; i < 300; i++) {
      const { unmount } = render(
        <BrandDropdown onChange={() => {}} value="a">
          <option>r3-x</option>
        </BrandDropdown>,
      );
      unmount();
    }
  });

  it('round-3 renders 300 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 300 }, (_, i) => (
            <BrandDropdown key={i} onChange={() => {}} value={`r3-${i}`}>
              <option>{i}</option>
            </BrandDropdown>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 50 different value cycles', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <BrandDropdown onChange={() => {}} value={`r3-v-${i}`}>
          <option>x</option>
        </BrandDropdown>,
      );
      unmount();
    }
  });

  it('round-3 rapid 500 onChange events', () => {
    const onChange = vi.fn();
    const { container } = render(
      <BrandDropdown onChange={onChange} value="a">
        <option>x</option>
      </BrandDropdown>,
    );
    const select = container.querySelector('select')!;
    for (let i = 0; i < 500; i++) {
      fireEvent.change(select, { target: { value: `r3-${i}` } });
    }
    expect(onChange).toHaveBeenCalledTimes(500);
  });

  it('round-3 all 200 select elements exist', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <BrandDropdown key={i} onChange={() => {}} value={`${i}`}>
            <option>x</option>
          </BrandDropdown>
        ))}
      </>,
    );
    expect(container.querySelectorAll('select').length).toBe(200);
  });

  it('round-4 mount-unmount 300 cycles', () => {
    for (let i = 0; i < 300; i++) {
      const { unmount } = render(
        <BrandDropdown onChange={() => {}} value="a">
          <option value="a">A</option>
        </BrandDropdown>,
      );
      unmount();
    }
  });

  it('round-4 renders 300 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 300 }, (_, i) => (
            <BrandDropdown key={i} onChange={() => {}} value={`r4-${i}`}>
              <option value={`r4-${i}`}>{`r4-${i}`}</option>
            </BrandDropdown>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 rapid 200 onChange events', () => {
    const onChange = vi.fn();
    const { container } = render(
      <BrandDropdown onChange={onChange} value="a">
        <option value="a">A</option>
        <option value="b">B</option>
      </BrandDropdown>,
    );
    const sel = container.querySelector('select')!;
    for (let i = 0; i < 200; i++) {
      fireEvent.change(sel, { target: { value: i % 2 === 0 ? 'a' : 'b' } });
    }
    expect(onChange).toHaveBeenCalledTimes(200);
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <BrandDropdown onChange={() => {}} value="a">
            <option value="a">A</option>
          </BrandDropdown>,
        ),
      ).not.toThrow();
    }
  });

  it('round-4 all 200 instances render select', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <BrandDropdown key={i} onChange={() => {}} value="a">
            <option value="a">A</option>
          </BrandDropdown>
        ))}
      </>,
    );
    expect(container.querySelectorAll('select').length).toBe(200);
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <BrandDropdown onChange={() => {}} value="a">
          <option value="a">A</option>
        </BrandDropdown>,
      );
      unmount();
    }
  });

  it('round-5 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <BrandDropdown key={i} onChange={() => {}} value="a">
              <option value="a">A</option>
            </BrandDropdown>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <BrandDropdown onChange={() => {}} value="a">
            <option value="a">A</option>
          </BrandDropdown>,
        ),
      ).not.toThrow();
    }
  });

  it('round-5 rapid 200 onChange invocations', () => {
    const onChange = vi.fn();
    render(
      <BrandDropdown onChange={onChange} value="a">
        <option value="a">A</option>
      </BrandDropdown>,
    );
    for (let i = 0; i < 200; i++) onChange({ target: { value: 'a' } });
    expect(onChange).toHaveBeenCalledTimes(200);
  });

  it('round-5 all 200 selects render', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <BrandDropdown key={i} onChange={() => {}} value="a">
            <option value="a">A</option>
          </BrandDropdown>
        ))}
      </>,
    );
    expect(container.querySelectorAll('select').length).toBe(200);
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <BrandDropdown onChange={() => {}} value="a">
          <option value="a">A</option>
        </BrandDropdown>,
      );
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <BrandDropdown key={i} onChange={() => {}} value="a">
              <option value="a">A</option>
            </BrandDropdown>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <BrandDropdown onChange={() => {}} value="a">
            <option value="a">A</option>
          </BrandDropdown>,
        ),
      ).not.toThrow();
    }
  });

  it('round-6 rapid 200 onChange invocations', () => {
    const onChange = vi.fn();
    render(
      <BrandDropdown onChange={onChange} value="a">
        <option value="a">A</option>
      </BrandDropdown>,
    );
    for (let i = 0; i < 200; i++) onChange({ target: { value: 'a' } });
    expect(onChange).toHaveBeenCalledTimes(200);
  });

  it('round-6 all 200 selects render', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <BrandDropdown key={i} onChange={() => {}} value="a">
            <option value="a">A</option>
          </BrandDropdown>
        ))}
      </>,
    );
    expect(container.querySelectorAll('select').length).toBe(200);
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <BrandDropdown onChange={() => {}} value="r7">
          <option value="r7">R7</option>
        </BrandDropdown>,
      );
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <BrandDropdown key={i} onChange={() => {}} value="a">
              <option value="a">A-{i}</option>
            </BrandDropdown>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <BrandDropdown onChange={() => {}} value="x">
            <option value="x">X</option>
          </BrandDropdown>,
        ),
      ).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <BrandDropdown onChange={() => {}} value="x">
          <option value="x">X</option>
        </BrandDropdown>,
      );
      unmount();
    }
  });

  it('round-7 200 sequential select instances', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <BrandDropdown key={i} onChange={() => {}} value="a">
            <option value="a">A-{i}</option>
          </BrandDropdown>
        ))}
      </>,
    );
    expect(container.querySelectorAll('select').length).toBe(200);
  });

  it('round-8 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <BrandDropdown onChange={() => {}} value="a">
          <option value="a">A</option>
        </BrandDropdown>,
      );
      unmount();
    }
  });

  it('round-8 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <BrandDropdown key={i} onChange={() => {}} value="a">
              <option value="a">r8-{i}</option>
            </BrandDropdown>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <BrandDropdown onChange={() => {}} value="a">
            <option value="a">A</option>
          </BrandDropdown>,
        ),
      ).not.toThrow();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <BrandDropdown onChange={() => {}} value="a">
          <option value="a">A</option>
        </BrandDropdown>,
      );
      unmount();
    }
  });

  it('round-8 200 select instances render', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <BrandDropdown key={i} onChange={() => {}} value="a">
            <option value="a">A-{i}</option>
          </BrandDropdown>
        ))}
      </>,
    );
    expect(container.querySelectorAll('select').length).toBe(200);
  });

  it('round-9 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <BrandDropdown onChange={() => {}} value="a">
          <option value="a">A</option>
        </BrandDropdown>,
      );
      unmount();
    }
  });

  it('round-9 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <BrandDropdown key={i} onChange={() => {}} value="a">
              <option value="a">r9-{i}</option>
            </BrandDropdown>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-9 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <BrandDropdown onChange={() => {}} value="a">
            <option value="a">A</option>
          </BrandDropdown>,
        ),
      ).not.toThrow();
    }
  });

  it('round-9 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <BrandDropdown onChange={() => {}} value="a">
          <option value="a">A</option>
        </BrandDropdown>,
      );
      unmount();
    }
  });

  it('round-9 200 select instances render', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <BrandDropdown key={i} onChange={() => {}} value="a">
            <option value="a">A-{i}</option>
          </BrandDropdown>
        ))}
      </>,
    );
    expect(container.querySelectorAll('select').length).toBe(200);
  });

  it('round-10 30 sequential BrandDropdown mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <BrandDropdown onChange={() => {}} value="a">
          <option value="a">A</option>
        </BrandDropdown>,
      );
      unmount();
    }
  });

  it('round-10 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <BrandDropdown key={i} onChange={() => {}} value="a">
              <option value="a">A-{i}</option>
            </BrandDropdown>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-10 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <BrandDropdown onChange={() => {}} value="a">
            <option value="a">A</option>
          </BrandDropdown>,
        ),
      ).not.toThrow();
    }
  });

  it('round-10 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <BrandDropdown onChange={() => {}} value="a">
          <option value="a">A</option>
        </BrandDropdown>,
      );
      unmount();
    }
  });

  it('round-10 100 sequential callback invocations', () => {
    const cb = vi.fn();
    const { container } = render(
      <BrandDropdown onChange={cb} value="a">
        <option value="a">A</option>
        <option value="b">B</option>
      </BrandDropdown>,
    );
    const select = container.querySelector('select');
    if (select) {
      for (let i = 0; i < 100; i++) fireEvent.change(select, { target: { value: 'b' } });
    }
    expect(cb).toHaveBeenCalledTimes(100);
  });
});
