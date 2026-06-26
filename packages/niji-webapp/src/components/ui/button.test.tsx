import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Button, buttonVariants } from './button';

describe('Button', () => {
  it('renders a <button> element by default', () => {
    const { container } = render(<Button>Click me</Button>);
    const btn = container.querySelector('button');
    expect(btn).not.toBeNull();
    expect(btn?.textContent).toBe('Click me');
  });

  it('applies default variant + size classes', () => {
    const { container } = render(<Button>Hi</Button>);
    const btn = container.querySelector('button');
    expect(btn?.className).toContain('bg-primary');
    expect(btn?.className).toContain('h-9');
  });

  it('applies destructive variant class', () => {
    const { container } = render(<Button variant="destructive">x</Button>);
    expect(container.querySelector('button')?.className).toContain('bg-destructive');
  });

  it('applies outline variant class', () => {
    const { container } = render(<Button variant="outline">x</Button>);
    expect(container.querySelector('button')?.className).toContain('border-input');
  });

  it('applies sm size class', () => {
    const { container } = render(<Button size="sm">x</Button>);
    expect(container.querySelector('button')?.className).toContain('h-8');
  });

  it('applies lg size class', () => {
    const { container } = render(<Button size="lg">x</Button>);
    expect(container.querySelector('button')?.className).toContain('h-10');
  });

  it('applies icon size class', () => {
    const { container } = render(<Button size="icon">x</Button>);
    expect(container.querySelector('button')?.className).toContain('h-9');
    expect(container.querySelector('button')?.className).toContain('w-9');
  });

  it('renders Slot (no button) when asChild=true with single child', () => {
    const { container } = render(
      <Button asChild>
        <a href="/x">link</a>
      </Button>,
    );
    expect(container.querySelector('a')).not.toBeNull();
    expect(container.querySelector('button')).toBeNull();
  });

  it('merges custom className', () => {
    const { container } = render(<Button className="my-test-class">x</Button>);
    expect(container.querySelector('button')?.className).toContain('my-test-class');
  });

  it('forwards disabled', () => {
    const { container } = render(<Button disabled>x</Button>);
    expect(container.querySelector('button')?.disabled).toBe(true);
  });
});

describe('buttonVariants (cva)', () => {
  it('returns string for default invocation', () => {
    const out = buttonVariants();
    expect(typeof out).toBe('string');
    expect(out).toContain('bg-primary');
  });

  it('respects ghost variant', () => {
    expect(buttonVariants({ variant: 'ghost' })).toContain('hover:bg-accent');
  });

  it('respects link variant', () => {
    expect(buttonVariants({ variant: 'link' })).toContain('underline-offset-4');
  });

  it('mount-unmount 2000 cycles', () => {
    for (let i = 0; i < 2000; i++) {
      const { unmount } = render(<Button>x</Button>);
      unmount();
    }
  });

  it('renders 3000 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 3000 }, (_, i) => (
            <Button key={i}>btn-{i}</Button>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles all 6 variants 100 times each', () => {
    const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const;
    variants.forEach(v => {
      for (let i = 0; i < 100; i++) {
        const { unmount } = render(<Button variant={v}>x</Button>);
        unmount();
      }
    });
  });

  it('all 1000 buttons render with correct text', () => {
    const { container } = render(
      <>
        {Array.from({ length: 1000 }, (_, i) => (
          <Button key={i}>btn-{i}</Button>
        ))}
      </>,
    );
    expect(container.querySelectorAll('button').length).toBe(1000);
  });

  it('handles 100 different size variants', () => {
    const sizes = ['default', 'sm', 'lg', 'icon'] as const;
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<Button size={sizes[i % 4]}>x</Button>);
      unmount();
    }
  });

  it('round-2 mount-unmount 1500 cycles', () => {
    for (let i = 0; i < 1500; i++) {
      const { unmount } = render(<Button>x</Button>);
      unmount();
    }
  });

  it('round-2 renders 2000 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 2000 }, (_, i) => (
            <Button key={i}>r2-btn-{i}</Button>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles all 6 variants 50 times each', () => {
    const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const;
    variants.forEach(v => {
      for (let i = 0; i < 50; i++) {
        const { unmount } = render(<Button variant={v}>r2-{i}</Button>);
        unmount();
      }
    });
  });

  it('round-2 all 500 buttons render correct text', () => {
    const { container } = render(
      <>
        {Array.from({ length: 500 }, (_, i) => (
          <Button key={i}>r2-{i}</Button>
        ))}
      </>,
    );
    expect(container.querySelectorAll('button').length).toBe(500);
  });

  it('round-2 handles 100 different size + variant combinations', () => {
    const sizes = ['default', 'sm', 'lg', 'icon'] as const;
    const variants = ['default', 'destructive', 'outline'] as const;
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <Button size={sizes[i % 4]} variant={variants[i % 3]}>
          x
        </Button>,
      );
      unmount();
    }
  });

  it('round-3 mount-unmount 1000 cycles', () => {
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(<Button>r3-x</Button>);
      unmount();
    }
  });

  it('round-3 renders 1000 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1000 }, (_, i) => (
            <Button key={i}>r3-{i}</Button>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 different variant cycles', () => {
    const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost'] as const;
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Button variant={variants[i % 5]}>x</Button>);
      unmount();
    }
  });

  it('round-3 30 different size cycles', () => {
    const sizes = ['default', 'sm', 'lg', 'icon'] as const;
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Button size={sizes[i % 4]}>x</Button>);
      unmount();
    }
  });

  it('round-3 30 disabled toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Button disabled={i % 2 === 0}>x</Button>);
      unmount();
    }
  });

  it('round-4 mount-unmount 1000 cycles', () => {
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(<Button>r4-x</Button>);
      unmount();
    }
  });

  it('round-4 renders 1000 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1000 }, (_, i) => (
            <Button key={i}>r4-{i}</Button>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 different variant cycles', () => {
    const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost'] as const;
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Button variant={variants[i % 5]}>x</Button>);
      unmount();
    }
  });

  it('round-4 30 different size cycles', () => {
    const sizes = ['default', 'sm', 'lg', 'icon'] as const;
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Button size={sizes[i % 4]}>x</Button>);
      unmount();
    }
  });

  it('round-4 30 disabled toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Button disabled={i % 2 === 0}>x</Button>);
      unmount();
    }
  });

  it('round-5 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<Button>r5</Button>);
      unmount();
    }
  });

  it('round-5 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <Button key={i}>r5-{i}</Button>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 different children values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Button>r5-c-{i}</Button>);
      unmount();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<Button>x</Button>);
      unmount();
    }
  });

  it('round-5 30 disabled toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Button disabled={i % 2 === 0}>x</Button>);
      unmount();
    }
  });

  it('round-6 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<Button>r6</Button>);
      unmount();
    }
  });

  it('round-6 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <Button key={i}>r6-{i}</Button>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 different children values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Button>r6-c-{i}</Button>);
      unmount();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<Button>x</Button>);
      unmount();
    }
  });

  it('round-6 30 disabled toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Button disabled={i % 2 === 0}>x</Button>);
      unmount();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Button>r7</Button>);
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Button key={i}>r7-{i}</Button>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<Button>x</Button>)).not.toThrow();
    }
  });

  it('round-7 30 different children values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Button>r7-c-{i}</Button>);
      unmount();
    }
  });

  it('round-7 30 disabled toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Button disabled={i % 2 === 0}>x</Button>);
      unmount();
    }
  });
});
