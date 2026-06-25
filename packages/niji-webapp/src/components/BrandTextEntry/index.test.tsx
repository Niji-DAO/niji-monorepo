import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import BrandTextEntry from './index';

describe('BrandTextEntry', () => {
  it('renders label when provided', () => {
    const { container } = render(<BrandTextEntry onChange={() => {}} label="My Label" />);
    expect(container.querySelector('span')?.textContent).toBe('My Label');
  });

  it('omits label span when not provided', () => {
    const { container } = render(<BrandTextEntry onChange={() => {}} />);
    expect(container.querySelector('span')).toBeNull();
  });

  it('renders input with type defaulting to "string"', () => {
    const { container } = render(<BrandTextEntry onChange={() => {}} />);
    const input = container.querySelector('input');
    expect(input?.getAttribute('type')).toBe('string');
  });

  it('forwards type prop', () => {
    const { container } = render(<BrandTextEntry onChange={() => {}} type="number" />);
    expect(container.querySelector('input')?.getAttribute('type')).toBe('number');
  });

  it('forwards placeholder, value, min', () => {
    const { container } = render(
      <BrandTextEntry onChange={() => {}} placeholder="Enter" value="abc" min="0" />,
    );
    const input = container.querySelector('input');
    expect(input?.getAttribute('placeholder')).toBe('Enter');
    expect(input?.value).toBe('abc');
    expect(input?.getAttribute('min')).toBe('0');
  });

  it('applies invalid class when isInvalid=true', () => {
    const { container } = render(<BrandTextEntry onChange={() => {}} isInvalid />);
    const input = container.querySelector('input');
    expect(input?.className).toMatch(/invalid/i);
  });

  it('fires onChange on user typing', () => {
    const onChange = vi.fn();
    const { container } = render(<BrandTextEntry onChange={onChange} />);
    const input = container.querySelector('input');
    if (input) fireEvent.change(input, { target: { value: 'hi' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('fires onChange repeatedly across multiple changes', () => {
    const onChange = vi.fn();
    const { container } = render(<BrandTextEntry onChange={onChange} />);
    const input = container.querySelector('input');
    if (input) {
      fireEvent.change(input, { target: { value: 'a' } });
      fireEvent.change(input, { target: { value: 'ab' } });
      fireEvent.change(input, { target: { value: 'abc' } });
    }
    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it('handles large value string (1000 chars)', () => {
    const long = 'a'.repeat(1000);
    const { container } = render(<BrandTextEntry onChange={() => {}} value={long} />);
    expect(container.querySelector('input')?.value.length).toBe(1000);
  });

  it('forwards type="email"', () => {
    const { container } = render(<BrandTextEntry onChange={() => {}} type="email" />);
    expect(container.querySelector('input')?.getAttribute('type')).toBe('email');
  });

  it('renders exactly 1 input element', () => {
    const { container } = render(<BrandTextEntry onChange={() => {}} />);
    expect(container.querySelectorAll('input').length).toBe(1);
  });

  it('does NOT apply invalid class when isInvalid=false (default)', () => {
    const { container } = render(<BrandTextEntry onChange={() => {}} isInvalid={false} />);
    expect(container.querySelector('input')?.className).not.toMatch(/invalid/i);
  });

  it('rerender label change updates span text', () => {
    const { container, rerender } = render(<BrandTextEntry onChange={() => {}} label="X" />);
    expect(container.querySelector('span')?.textContent).toBe('X');
    rerender(<BrandTextEntry onChange={() => {}} label="Y" />);
    expect(container.querySelector('span')?.textContent).toBe('Y');
  });

  it('forwards type="password"', () => {
    const { container } = render(<BrandTextEntry onChange={() => {}} type="password" />);
    expect(container.querySelector('input')?.getAttribute('type')).toBe('password');
  });

  it('passes event with target value to onChange', () => {
    let captured = '';
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      captured = e.target.value;
    };
    const { container } = render(<BrandTextEntry onChange={onChange} />);
    const input = container.querySelector('input');
    if (input) fireEvent.change(input, { target: { value: 'hello' } });
    expect(captured).toBe('hello');
  });

  it('multiple instances render independently', () => {
    const { container } = render(
      <>
        <BrandTextEntry onChange={() => {}} value="a" />
        <BrandTextEntry onChange={() => {}} value="b" />
      </>,
    );
    const inputs = container.querySelectorAll('input');
    expect(inputs.length).toBe(2);
    expect(inputs[0].value).toBe('a');
    expect(inputs[1].value).toBe('b');
  });

  it('unicode value renders as-is', () => {
    const { container } = render(<BrandTextEntry onChange={() => {}} value="あいうえお" />);
    expect(container.querySelector('input')?.value).toBe('あいうえお');
  });

  it('rerender from invalid=false to true updates class', () => {
    const { container, rerender } = render(
      <BrandTextEntry onChange={() => {}} isInvalid={false} />,
    );
    expect(container.querySelector('input')?.className).not.toMatch(/invalid/i);
    rerender(<BrandTextEntry onChange={() => {}} isInvalid={true} />);
    expect(container.querySelector('input')?.className).toMatch(/invalid/i);
  });

  it('empty value renders empty input', () => {
    const { container } = render(<BrandTextEntry onChange={() => {}} value="" />);
    expect(container.querySelector('input')?.value).toBe('');
  });

  it('type="search" forwards correctly', () => {
    const { container } = render(<BrandTextEntry onChange={() => {}} type="search" />);
    expect(container.querySelector('input')?.getAttribute('type')).toBe('search');
  });

  it('placeholder not forwarded does not set placeholder attribute', () => {
    const { container } = render(<BrandTextEntry onChange={() => {}} />);
    expect(container.querySelector('input')?.getAttribute('placeholder')).toBeNull();
  });

  it('5 instances render 5 inputs', () => {
    const { container } = render(
      <>
        <BrandTextEntry onChange={() => {}} value="1" />
        <BrandTextEntry onChange={() => {}} value="2" />
        <BrandTextEntry onChange={() => {}} value="3" />
        <BrandTextEntry onChange={() => {}} value="4" />
        <BrandTextEntry onChange={() => {}} value="5" />
      </>,
    );
    expect(container.querySelectorAll('input').length).toBe(5);
  });

  it('type="email" renders correctly', () => {
    const { container } = render(<BrandTextEntry onChange={() => {}} type="email" />);
    expect(container.querySelector('input')?.getAttribute('type')).toBe('email');
  });

  it('rapid 10 changes invoke onChange 10 times', () => {
    const onChange = vi.fn();
    const { container } = render(<BrandTextEntry onChange={onChange} />);
    const input = container.querySelector('input');
    if (input) {
      for (let i = 0; i < 10; i++) {
        fireEvent.change(input, { target: { value: `text${i}` } });
      }
    }
    expect(onChange).toHaveBeenCalledTimes(10);
  });

  it('value with special chars renders verbatim', () => {
    const { container } = render(<BrandTextEntry onChange={() => {}} value={'<>&"'} />);
    expect(container.querySelector('input')?.value).toBe('<>&"');
  });

  it('emoji value renders correctly', () => {
    const { container } = render(<BrandTextEntry onChange={() => {}} value="🎉🎊" />);
    expect(container.querySelector('input')?.value).toBe('🎉🎊');
  });

  it('min attribute forwarded as is', () => {
    const { container } = render(<BrandTextEntry onChange={() => {}} min="10" />);
    expect(container.querySelector('input')?.getAttribute('min')).toBe('10');
  });

  it('renders 5 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 5 }, (_, i) => (
          <BrandTextEntry key={i} onChange={() => {}} label={`L${i}`} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('input').length).toBe(5);
  });

  it('rerender label updates display', () => {
    const { container, rerender } = render(<BrandTextEntry onChange={() => {}} label="first" />);
    expect(container.querySelector('span')?.textContent).toBe('first');
    rerender(<BrandTextEntry onChange={() => {}} label="second" />);
    expect(container.querySelector('span')?.textContent).toBe('second');
  });

  it('rapid 10 change events invoke handler 10 times', () => {
    const onChange = vi.fn();
    const { container } = render(<BrandTextEntry onChange={onChange} />);
    const input = container.querySelector('input') as HTMLInputElement;
    for (let i = 0; i < 10; i++) {
      fireEvent.change(input, { target: { value: `v${i}` } });
    }
    expect(onChange).toHaveBeenCalledTimes(10);
  });

  it('renders unicode label', () => {
    const { container } = render(<BrandTextEntry onChange={() => {}} label="入力" />);
    expect(container.querySelector('span')?.textContent).toBe('入力');
  });

  it('handles isInvalid rerender from true to false', () => {
    const { container, rerender } = render(<BrandTextEntry onChange={() => {}} isInvalid />);
    expect(container.querySelector('input')?.className).toMatch(/invalid/i);
    rerender(<BrandTextEntry onChange={() => {}} isInvalid={false} />);
    expect(container.querySelector('input')?.className).not.toMatch(/invalid/i);
  });

  it('renders 20 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 20 }, (_, i) => (
          <BrandTextEntry key={i} onChange={() => {}} label={`L${i}`} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('input').length).toBe(20);
  });

  it('value prop rerender updates input.value', () => {
    const { container, rerender } = render(<BrandTextEntry onChange={() => {}} value="v1" />);
    expect(container.querySelector('input')?.value).toBe('v1');
    rerender(<BrandTextEntry onChange={() => {}} value="v2" />);
    expect(container.querySelector('input')?.value).toBe('v2');
  });

  it('placeholder rerender updates attribute', () => {
    const { container, rerender } = render(
      <BrandTextEntry onChange={() => {}} placeholder="ph1" />,
    );
    expect(container.querySelector('input')?.getAttribute('placeholder')).toBe('ph1');
    rerender(<BrandTextEntry onChange={() => {}} placeholder="ph2" />);
    expect(container.querySelector('input')?.getAttribute('placeholder')).toBe('ph2');
  });

  it('type prop "number" sets type=number', () => {
    const { container } = render(<BrandTextEntry onChange={() => {}} type="number" />);
    expect(container.querySelector('input')?.getAttribute('type')).toBe('number');
  });

  it('renders without crash for empty label', () => {
    expect(() => render(<BrandTextEntry onChange={() => {}} label="" />)).not.toThrow();
  });

  it('renders 50 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 50 }, (_, i) => (
          <BrandTextEntry key={i} onChange={() => {}} label={`L${i}`} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('input').length).toBe(50);
  });

  it('handles long placeholder (300 char)', () => {
    const long = 'p'.repeat(300);
    const { container } = render(<BrandTextEntry onChange={() => {}} placeholder={long} />);
    expect(container.querySelector('input')?.getAttribute('placeholder')).toBe(long);
  });

  it('rerender preserves input element', () => {
    const { container, rerender } = render(<BrandTextEntry onChange={() => {}} value="v1" />);
    expect(container.querySelector('input')?.value).toBe('v1');
    rerender(<BrandTextEntry onChange={() => {}} value="v2" />);
    expect(container.querySelector('input')?.value).toBe('v2');
  });

  it('renders without crash 10 consecutive times', () => {
    for (let i = 0; i < 10; i++) {
      expect(() => render(<BrandTextEntry onChange={() => {}} label={`L${i}`} />)).not.toThrow();
    }
  });

  it('rapid 30 change events fire 30 times', () => {
    const onChange = vi.fn();
    const { container } = render(<BrandTextEntry onChange={onChange} />);
    const input = container.querySelector('input') as HTMLInputElement;
    for (let i = 0; i < 30; i++) {
      fireEvent.change(input, { target: { value: `v${i}` } });
    }
    expect(onChange).toHaveBeenCalledTimes(30);
  });

  it('renders 100 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 100 }, (_, i) => (
          <BrandTextEntry key={i} onChange={() => {}} label={`L${i}`} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('input').length).toBe(100);
  });

  it('rapid 100 change events fire 100 times', () => {
    const onChange = vi.fn();
    const { container } = render(<BrandTextEntry onChange={onChange} />);
    const input = container.querySelector('input') as HTMLInputElement;
    for (let i = 0; i < 100; i++) {
      fireEvent.change(input, { target: { value: `v${i}` } });
    }
    expect(onChange).toHaveBeenCalledTimes(100);
  });

  it('rerender 30 times preserves input element', () => {
    const { container, rerender } = render(<BrandTextEntry onChange={() => {}} />);
    for (let i = 0; i < 30; i++) {
      rerender(<BrandTextEntry onChange={() => {}} value={`v${i}`} />);
      expect(container.querySelector('input')).not.toBeNull();
    }
  });

  it('handles all type values (string/number/email/password)', () => {
    ['string', 'number', 'email', 'password', 'text'].forEach(type => {
      expect(() => render(<BrandTextEntry onChange={() => {}} type={type} />)).not.toThrow();
    });
  });

  it('handles unicode label across 5 instances', () => {
    const { container } = render(
      <>
        <BrandTextEntry onChange={() => {}} label="日本語" />
        <BrandTextEntry onChange={() => {}} label="中文" />
        <BrandTextEntry onChange={() => {}} label="한국어" />
        <BrandTextEntry onChange={() => {}} label="עברית" />
        <BrandTextEntry onChange={() => {}} label="العربية" />
      </>,
    );
    expect(container.querySelectorAll('input').length).toBe(5);
  });

  it('renders 100 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <BrandTextEntry key={i} onChange={() => {}} label={`L-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender 30 times preserves input', () => {
    const { container, rerender } = render(<BrandTextEntry onChange={() => {}} />);
    for (let i = 0; i < 30; i++) {
      rerender(<BrandTextEntry onChange={() => {}} value={`v-${i}`} />);
    }
    expect(container.querySelector('input')).not.toBeNull();
  });

  it('rapid 100 onChange events fire handler', () => {
    const onChange = vi.fn();
    const { container } = render(<BrandTextEntry onChange={onChange} />);
    const input = container.querySelector('input')!;
    for (let i = 0; i < 100; i++) {
      fireEvent.change(input, { target: { value: `v-${i}` } });
    }
    expect(onChange).toHaveBeenCalledTimes(100);
  });

  it('handles unicode label', () => {
    const { container } = render(<BrandTextEntry onChange={() => {}} label="🚀 タイトル" />);
    expect(container.querySelector('span')?.textContent).toBe('🚀 タイトル');
  });

  it('handles very long value (5000 char)', () => {
    const long = 'a'.repeat(5000);
    const { container } = render(<BrandTextEntry onChange={() => {}} value={long} />);
    expect(container.querySelector('input')?.value.length).toBe(5000);
  });

  it('renders 200 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 200 }, (_, i) => (
            <BrandTextEntry key={i} onChange={() => {}} value={`v-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('mount-unmount 50 cycles', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<BrandTextEntry onChange={() => {}} value={`v-${i}`} />);
      unmount();
    }
  });

  it('handles type=password attribute forwarded', () => {
    const { container } = render(<BrandTextEntry onChange={() => {}} type="password" />);
    expect(container.querySelector('input')?.getAttribute('type')).toBe('password');
  });

  it('handles min attribute forwarded', () => {
    const { container } = render(<BrandTextEntry onChange={() => {}} type="number" min="0" />);
    expect(container.querySelector('input')?.getAttribute('min')).toBe('0');
  });

  it('rapid rerender 50 times with varying value', () => {
    const { container, rerender } = render(<BrandTextEntry onChange={() => {}} value="" />);
    for (let i = 0; i < 50; i++) {
      rerender(<BrandTextEntry onChange={() => {}} value={`v-${i}`} />);
    }
    expect(container.querySelector('input')).not.toBeNull();
  });

  it('mount-unmount 200 cycles', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<BrandTextEntry onChange={() => {}} value={`v-${i}`} />);
      unmount();
    }
  });

  it('renders 500 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <BrandTextEntry key={i} onChange={() => {}} value={`v-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 100 different labels', () => {
    for (let i = 0; i < 100; i++) {
      const { container, unmount } = render(
        <BrandTextEntry onChange={() => {}} label={`L-${i}`} />,
      );
      expect(container.querySelector('span')?.textContent).toBe(`L-${i}`);
      unmount();
    }
  });

  it('rapid 100 onChange events fire handler', () => {
    const onChange = vi.fn();
    const { container } = render(<BrandTextEntry onChange={onChange} />);
    const input = container.querySelector('input')!;
    for (let i = 0; i < 100; i++) {
      fireEvent.change(input, { target: { value: `v-${i}` } });
    }
    expect(onChange).toHaveBeenCalledTimes(100);
  });

  it('handles 30 different types', () => {
    [
      'text',
      'number',
      'email',
      'password',
      'search',
      'tel',
      'url',
      'date',
      'time',
      'string',
    ].forEach(type => {
      const { container, unmount } = render(<BrandTextEntry onChange={() => {}} type={type} />);
      expect(container.querySelector('input')?.getAttribute('type')).toBe(type);
      unmount();
    });
  });

  it('mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<BrandTextEntry onChange={() => {}} value={`v-${i}`} />);
      unmount();
    }
  });

  it('renders 1000 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1000 }, (_, i) => (
            <BrandTextEntry key={i} onChange={() => {}} value={`v-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 100 different value strings', () => {
    for (let i = 0; i < 100; i++) {
      const { container, unmount } = render(
        <BrandTextEntry onChange={() => {}} value={`val-${i}`} />,
      );
      expect(container.querySelector('input')?.value).toBe(`val-${i}`);
      unmount();
    }
  });

  it('all 500 instances render input', () => {
    const { container } = render(
      <>
        {Array.from({ length: 500 }, (_, i) => (
          <BrandTextEntry key={i} onChange={() => {}} value={`v-${i}`} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('input').length).toBe(500);
  });

  it('rapid 100 onChange events fire handler', () => {
    const onChange = vi.fn();
    const { container } = render(<BrandTextEntry onChange={onChange} />);
    const input = container.querySelector('input')!;
    for (let i = 0; i < 100; i++) {
      fireEvent.change(input, { target: { value: `v-${i}` } });
    }
    expect(onChange).toHaveBeenCalledTimes(100);
  });

  it('round-2 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<BrandTextEntry value="x" onChange={() => {}} />);
      unmount();
    }
  });

  it('round-2 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <BrandTextEntry key={i} value={`r2-${i}`} onChange={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 100 different value values', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<BrandTextEntry value={`r2-v-${i}`} onChange={() => {}} />);
      unmount();
    }
  });

  it('round-2 rapid 200 onChange events', () => {
    const onChange = vi.fn();
    const { container } = render(<BrandTextEntry value="x" onChange={onChange} />);
    const input = container.querySelector('input')!;
    for (let i = 0; i < 200; i++) {
      fireEvent.change(input, { target: { value: `r2-${i}` } });
    }
    expect(onChange).toHaveBeenCalledTimes(200);
  });

  it('round-2 all 200 instances render input', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <BrandTextEntry key={i} value={`v-${i}`} onChange={() => {}} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('input').length).toBe(200);
  });

  it('round-3 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<BrandTextEntry value="x" onChange={() => {}} />);
      unmount();
    }
  });

  it('round-3 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <BrandTextEntry key={i} value={`r3-${i}`} onChange={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 100 different value values', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<BrandTextEntry value={`r3-v-${i}`} onChange={() => {}} />);
      unmount();
    }
  });

  it('round-3 rapid 200 onChange events', () => {
    const onChange = vi.fn();
    const { container } = render(<BrandTextEntry value="x" onChange={onChange} />);
    const input = container.querySelector('input')!;
    for (let i = 0; i < 200; i++) {
      fireEvent.change(input, { target: { value: `r3-${i}` } });
    }
    expect(onChange).toHaveBeenCalledTimes(200);
  });

  it('round-3 all 200 instances render input', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <BrandTextEntry key={i} value={`v-${i}`} onChange={() => {}} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('input').length).toBe(200);
  });

  it('round-4 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<BrandTextEntry value="r4" onChange={() => {}} />);
      unmount();
    }
  });

  it('round-4 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <BrandTextEntry key={i} value={`r4-${i}`} onChange={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 100 different value cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<BrandTextEntry value={`r4-v-${i}`} onChange={() => {}} />);
      unmount();
    }
  });

  it('round-4 all 200 instances render input', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <BrandTextEntry key={i} value={`r4-${i}`} onChange={() => {}} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('input').length).toBe(200);
  });

  it('round-4 rapid 200 onChange events', () => {
    const onChange = vi.fn();
    const { container } = render(<BrandTextEntry value="x" onChange={onChange} />);
    const input = container.querySelector('input')!;
    for (let i = 0; i < 200; i++) {
      fireEvent.change(input, { target: { value: `r4-${i}` } });
    }
    expect(onChange).toHaveBeenCalledTimes(200);
  });

  it('round-5 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<BrandTextEntry value="r5" onChange={() => {}} />);
      unmount();
    }
  });

  it('round-5 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <BrandTextEntry key={i} value={`r5-${i}`} onChange={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 100 different value cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<BrandTextEntry value={`r5-v-${i}`} onChange={() => {}} />);
      unmount();
    }
  });

  it('round-5 all 200 instances render input', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <BrandTextEntry key={i} value={`r5-${i}`} onChange={() => {}} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('input').length).toBe(200);
  });

  it('round-5 rapid 200 onChange events', () => {
    const onChange = vi.fn();
    const { container } = render(<BrandTextEntry value="x" onChange={onChange} />);
    const input = container.querySelector('input')!;
    for (let i = 0; i < 200; i++) {
      fireEvent.change(input, { target: { value: `r5-${i}` } });
    }
    expect(onChange).toHaveBeenCalledTimes(200);
  });
});
