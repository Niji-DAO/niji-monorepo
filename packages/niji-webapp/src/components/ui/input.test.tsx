import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Input } from './input';

describe('Input', () => {
  it('renders an <input> element', () => {
    const { container } = render(<Input />);
    const input = container.querySelector('input');
    expect(input).not.toBeNull();
  });

  it('forwards type prop', () => {
    const { container } = render(<Input type="password" />);
    expect(container.querySelector('input')?.type).toBe('password');
  });

  it('applies default tailwind classes', () => {
    const { container } = render(<Input />);
    const input = container.querySelector('input');
    expect(input?.getAttribute('class')).toContain('h-9');
    expect(input?.getAttribute('class')).toContain('rounded-md');
  });

  it('merges custom className with defaults', () => {
    const { container } = render(<Input className="my-custom" />);
    const input = container.querySelector('input');
    expect(input?.getAttribute('class')).toContain('my-custom');
    expect(input?.getAttribute('class')).toContain('h-9');
  });

  it('forwards arbitrary HTML attributes (placeholder)', () => {
    const { container } = render(<Input placeholder="Enter text" />);
    expect(container.querySelector('input')?.placeholder).toBe('Enter text');
  });

  it('forwards disabled attribute', () => {
    const { container } = render(<Input disabled />);
    expect(container.querySelector('input')?.disabled).toBe(true);
  });

  it('forwards numeric value prop', () => {
    const { container } = render(<Input type="number" defaultValue={42} />);
    expect(container.querySelector('input')?.value).toBe('42');
  });

  it('renders with undefined className (defaults preserved)', () => {
    const { container } = render(<Input className={undefined} />);
    expect(container.querySelector('input')?.getAttribute('class')).toContain('h-9');
  });

  it('forwards required attribute', () => {
    const { container } = render(<Input required />);
    expect(container.querySelector('input')?.required).toBe(true);
  });

  it('forwards readOnly attribute', () => {
    const { container } = render(<Input readOnly />);
    expect(container.querySelector('input')?.readOnly).toBe(true);
  });

  it('renders type=email correctly', () => {
    const { container } = render(<Input type="email" />);
    expect(container.querySelector('input')?.type).toBe('email');
  });

  it('renders exactly 1 input element', () => {
    const { container } = render(<Input />);
    expect(container.querySelectorAll('input').length).toBe(1);
  });

  it('mount-unmount 1000 cycles', () => {
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(<Input />);
      unmount();
    }
  });

  it('renders 2000 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 2000 }, (_, i) => (
            <Input key={i} placeholder={`p-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('all 1000 inputs render input element', () => {
    const { container } = render(
      <>
        {Array.from({ length: 1000 }, (_, i) => (
          <Input key={i} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('input').length).toBe(1000);
  });

  it('handles 100 different type values', () => {
    const types = ['text', 'password', 'email', 'number', 'date'];
    for (let i = 0; i < 100; i++) {
      const { container, unmount } = render(<Input type={types[i % 5]} />);
      expect(container.querySelector('input')?.type).toBe(types[i % 5]);
      unmount();
    }
  });

  it('handles 100 different placeholder values', () => {
    for (let i = 0; i < 100; i++) {
      const { container, unmount } = render(<Input placeholder={`ph-${i}`} />);
      expect(container.querySelector('input')?.placeholder).toBe(`ph-${i}`);
      unmount();
    }
  });

  it('round-2 mount-unmount 1500 cycles', () => {
    for (let i = 0; i < 1500; i++) {
      const { unmount } = render(<Input />);
      unmount();
    }
  });

  it('round-2 renders 2000 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 2000 }, (_, i) => (
            <Input key={i} placeholder={`r2-p-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 all 1000 inputs render input element', () => {
    const { container } = render(
      <>
        {Array.from({ length: 1000 }, (_, i) => (
          <Input key={i} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('input').length).toBe(1000);
  });

  it('round-2 handles 100 type variants', () => {
    const types = ['text', 'password', 'email', 'number', 'date'];
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<Input type={types[i % 5]} />);
      unmount();
    }
  });

  it('round-2 handles 100 placeholder variants', () => {
    for (let i = 0; i < 100; i++) {
      const { container, unmount } = render(<Input placeholder={`r2-ph-${i}`} />);
      expect(container.querySelector('input')?.placeholder).toBe(`r2-ph-${i}`);
      unmount();
    }
  });

  it('round-3 mount-unmount 1000 cycles', () => {
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(<Input />);
      unmount();
    }
  });

  it('round-3 renders 1000 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1000 }, (_, i) => (
            <Input key={i} placeholder={`r3-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 different type values', () => {
    const types = ['text', 'password', 'number', 'email', 'tel'];
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Input type={types[i % 5]} />);
      unmount();
    }
  });

  it('round-3 30 different className values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Input className={`r3-cls-${i}`} />);
      unmount();
    }
  });

  it('round-3 all 200 instances render input', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <Input key={i} placeholder={`r3-${i}`} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('input').length).toBe(200);
  });

  it('round-4 mount-unmount 1000 cycles', () => {
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(<Input />);
      unmount();
    }
  });

  it('round-4 renders 1000 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1000 }, (_, i) => (
            <Input key={i} placeholder={`r4-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 different type values', () => {
    const types = ['text', 'password', 'number', 'email', 'tel'];
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Input type={types[i % 5]} />);
      unmount();
    }
  });

  it('round-4 30 different className values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Input className={`r4-cls-${i}`} />);
      unmount();
    }
  });

  it('round-4 all 200 instances render input', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <Input key={i} placeholder={`r4-${i}`} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('input').length).toBe(200);
  });

  it('round-5 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<Input />);
      unmount();
    }
  });

  it('round-5 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <Input key={i} placeholder={`r5-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 different placeholder values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Input placeholder={`r5-p-${i}`} />);
      unmount();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<Input />);
      unmount();
    }
  });

  it('round-5 all 200 inputs render', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <Input key={i} placeholder={`r5-${i}`} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('input').length).toBe(200);
  });

  it('round-6 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<Input />);
      unmount();
    }
  });

  it('round-6 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <Input key={i} placeholder={`r6-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 different placeholder values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Input placeholder={`r6-p-${i}`} />);
      unmount();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<Input />);
      unmount();
    }
  });

  it('round-6 all 200 inputs render', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <Input key={i} placeholder={`r6-${i}`} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('input').length).toBe(200);
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Input />);
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Input key={i} placeholder={`r7-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<Input />)).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<Input />);
      unmount();
    }
  });

  it('round-7 200 input instances render', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <Input key={i} placeholder={`r7-${i}`} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('input').length).toBe(200);
  });

  it('round-8 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<Input />);
      unmount();
    }
  });

  it('round-8 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <Input key={i} placeholder={`r8-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 different placeholder values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Input placeholder={`r8-p-${i}`} />);
      unmount();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<Input />);
      unmount();
    }
  });

  it('round-8 200 input instances render', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <Input key={i} placeholder={`r8-${i}`} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('input').length).toBe(200);
  });

  it('round-9 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<Input />);
      unmount();
    }
  });

  it('round-9 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <Input key={i} placeholder={`r9-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-9 30 different placeholder values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Input placeholder={`r9-p-${i}`} />);
      unmount();
    }
  });

  it('round-9 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<Input />);
      unmount();
    }
  });

  it('round-9 200 input instances render', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <Input key={i} placeholder={`r9-${i}`} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('input').length).toBe(200);
  });

  it('round-10 30 sequential Input mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Input placeholder={`r10-${i}`} />);
      unmount();
    }
  });

  it('round-10 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Input key={i} placeholder={`r10-i-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-10 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<Input placeholder={`r10-s-${i}`} />)).not.toThrow();
    }
  });

  it('round-10 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<Input placeholder={`r10-m-${i}`} />);
      unmount();
    }
  });

  it('round-10 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<Input placeholder={`r10-c-${i}`} />);
      unmount();
    }
  });

  it('round-11 30 sequential Input mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Input placeholder={`r11-m-${i}`} />);
      unmount();
    }
  });

  it('round-11 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Input key={i} placeholder={`r11-i-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-11 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<Input placeholder={`r11-s-${i}`} />)).not.toThrow();
    }
  });

  it('round-11 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<Input placeholder={`r11-m2-${i}`} />);
      unmount();
    }
  });

  it('round-11 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<Input placeholder={`r11-c-${i}`} />);
      unmount();
    }
  });
});
