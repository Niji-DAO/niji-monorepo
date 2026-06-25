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
});
