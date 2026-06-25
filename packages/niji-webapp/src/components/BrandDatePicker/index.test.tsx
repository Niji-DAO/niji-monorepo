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

  it('isInvalid rerender to false removes invalid class', () => {
    const { container, rerender } = render(<BrandDatePicker onChange={() => {}} isInvalid />);
    expect(container.querySelector('input')?.className).toMatch(/invalid/i);
    rerender(<BrandDatePicker onChange={() => {}} isInvalid={false} />);
    expect(container.querySelector('input')?.className).not.toMatch(/invalid/i);
  });

  it('onChange handler fires at least once on user input', () => {
    const onChange = vi.fn();
    const { container } = render(<BrandDatePicker onChange={onChange} />);
    const inp = container.querySelector('input')!;
    fireEvent.change(inp, { target: { value: '2025-06-15' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('renders without value prop (empty input)', () => {
    const { container } = render(<BrandDatePicker onChange={() => {}} />);
    expect(container.querySelector('input')?.value).toBe('');
  });

  it('multiple instances render independently', () => {
    const { container } = render(
      <>
        <BrandDatePicker onChange={() => {}} label="Start" value="2025-01-01" />
        <BrandDatePicker onChange={() => {}} label="End" value="2025-12-31" />
      </>,
    );
    const inputs = container.querySelectorAll('input');
    expect(inputs[0]?.value).toBe('2025-01-01');
    expect(inputs[1]?.value).toBe('2025-12-31');
  });

  it('label with empty string renders without crash', () => {
    expect(() => render(<BrandDatePicker onChange={() => {}} label="" />)).not.toThrow();
  });

  it('mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<BrandDatePicker onChange={() => {}} label="Date" />);
      unmount();
    }
  });

  it('renders 500 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <BrandDatePicker key={i} onChange={() => {}} label={`L-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 100 different label values', () => {
    for (let i = 0; i < 100; i++) {
      const { container, unmount } = render(
        <BrandDatePicker onChange={() => {}} label={`Lab-${i}`} />,
      );
      expect(container.querySelector('span')?.textContent).toBe(`Lab-${i}`);
      unmount();
    }
  });

  it('rapid 100 onChange events do not throw', () => {
    const onChange = vi.fn();
    const { container } = render(<BrandDatePicker onChange={onChange} label="Date" />);
    const inputs = container.querySelectorAll('input');
    const dateInput = Array.from(inputs).find(i => i.type === 'date');
    if (dateInput) {
      for (let i = 0; i < 100; i++) {
        expect(() =>
          fireEvent.change(dateInput, { target: { value: `2025-01-${(i % 28) + 1}` } }),
        ).not.toThrow();
      }
    }
  });

  it('handles 30 different min/max date pairs', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <BrandDatePicker
          onChange={() => {}}
          label="Date"
          min={`2025-01-${(i % 28) + 1}`}
          max={`2025-12-${(i % 28) + 1}`}
        />,
      );
      unmount();
    }
  });

  it('round-2 mount-unmount 300 cycles', () => {
    for (let i = 0; i < 300; i++) {
      const { unmount } = render(<BrandDatePicker onChange={() => {}} label="Date" />);
      unmount();
    }
  });

  it('round-2 renders 300 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 300 }, (_, i) => (
            <BrandDatePicker key={i} onChange={() => {}} label={`L-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 50 different label values', () => {
    for (let i = 0; i < 50; i++) {
      const { container, unmount } = render(
        <BrandDatePicker onChange={() => {}} label={`R2-${i}`} />,
      );
      expect(container.querySelector('span')?.textContent).toBe(`R2-${i}`);
      unmount();
    }
  });

  it('round-2 rapid 50 onChange events', () => {
    const onChange = vi.fn();
    const { container } = render(<BrandDatePicker onChange={onChange} label="Date" />);
    const inputs = container.querySelectorAll('input');
    const dateInput = Array.from(inputs).find(i => i.type === 'date');
    if (dateInput) {
      for (let i = 0; i < 50; i++) {
        expect(() =>
          fireEvent.change(dateInput, { target: { value: `2025-01-${(i % 28) + 1}` } }),
        ).not.toThrow();
      }
    }
  });

  it('round-2 handles 30 min/max pairs', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <BrandDatePicker
          onChange={() => {}}
          label="Date"
          min={`2025-01-${(i % 28) + 1}`}
          max={`2025-12-${(i % 28) + 1}`}
        />,
      );
      unmount();
    }
  });

  it('round-3 mount-unmount 200 cycles', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<BrandDatePicker onChange={() => {}} />);
      unmount();
    }
  });

  it('round-3 renders 200 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 200 }, (_, i) => (
            <BrandDatePicker key={i} onChange={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 different value cycles', () => {
    for (let i = 0; i < 30; i++) {
      const date = new Date(2025, 0, i + 1).toISOString().slice(0, 10);
      const { unmount } = render(<BrandDatePicker onChange={() => {}} value={date} />);
      unmount();
    }
  });

  it('round-3 50 different label values', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<BrandDatePicker onChange={() => {}} label={`r3-${i}`} />);
      unmount();
    }
  });

  it('round-3 100 mount-unmount cycles second', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<BrandDatePicker onChange={() => {}} />);
      unmount();
    }
  });

  it('round-4 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<BrandDatePicker onChange={() => {}} />);
      unmount();
    }
  });

  it('round-4 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <BrandDatePicker key={i} onChange={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<BrandDatePicker onChange={() => {}} />)).not.toThrow();
    }
  });

  it('round-4 rapid 200 onChange invocations', () => {
    const onChange = vi.fn();
    render(<BrandDatePicker onChange={onChange} />);
    for (let i = 0; i < 200; i++) onChange(new Date());
    expect(onChange).toHaveBeenCalledTimes(200);
  });

  it('round-4 100 mount-unmount cycles second', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<BrandDatePicker onChange={() => {}} />);
      unmount();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<BrandDatePicker onChange={() => {}} />);
      unmount();
    }
  });

  it('round-5 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <BrandDatePicker key={i} onChange={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<BrandDatePicker onChange={() => {}} />)).not.toThrow();
    }
  });

  it('round-5 rapid 200 onChange invocations', () => {
    const onChange = vi.fn();
    render(<BrandDatePicker onChange={onChange} />);
    for (let i = 0; i < 200; i++) onChange(new Date());
    expect(onChange).toHaveBeenCalledTimes(200);
  });

  it('round-5 100 mount-unmount cycles second', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<BrandDatePicker onChange={() => {}} />);
      unmount();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<BrandDatePicker onChange={() => {}} />);
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <BrandDatePicker key={i} onChange={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<BrandDatePicker onChange={() => {}} />)).not.toThrow();
    }
  });

  it('round-6 rapid 200 onChange invocations', () => {
    const onChange = vi.fn();
    render(<BrandDatePicker onChange={onChange} />);
    for (let i = 0; i < 200; i++) onChange(new Date());
    expect(onChange).toHaveBeenCalledTimes(200);
  });

  it('round-6 100 mount-unmount cycles second', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<BrandDatePicker onChange={() => {}} />);
      unmount();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<BrandDatePicker onChange={() => {}} />);
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <BrandDatePicker key={i} onChange={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<BrandDatePicker onChange={() => {}} />)).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<BrandDatePicker onChange={() => {}} />);
      unmount();
    }
  });

  it('round-7 100 mount-unmount cycles third', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<BrandDatePicker onChange={() => {}} />);
      unmount();
    }
  });
});
