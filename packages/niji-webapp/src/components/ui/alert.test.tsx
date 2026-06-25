import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Alert, AlertDescription, AlertTitle } from './alert';

describe('Alert', () => {
  it('renders a <div role="alert">', () => {
    const { container } = render(<Alert />);
    const div = container.querySelector('div[role="alert"]');
    expect(div).not.toBeNull();
  });

  it('applies default variant class', () => {
    const { container } = render(<Alert />);
    const div = container.querySelector('div[role="alert"]');
    expect(div?.className).toContain('bg-background');
  });

  it('applies destructive variant class', () => {
    const { container } = render(<Alert variant="destructive" />);
    const div = container.querySelector('div[role="alert"]');
    expect(div?.className).toContain('text-destructive');
  });

  it('merges custom className', () => {
    const { container } = render(<Alert className="ring-2" />);
    const div = container.querySelector('div[role="alert"]');
    expect(div?.className).toContain('ring-2');
  });

  it('renders children', () => {
    const { container } = render(<Alert>hello</Alert>);
    expect(container.querySelector('div[role="alert"]')?.textContent).toBe('hello');
  });
});

describe('AlertTitle', () => {
  it('renders an <h5> heading', () => {
    const { container } = render(<AlertTitle>Title</AlertTitle>);
    const h5 = container.querySelector('h5');
    expect(h5).not.toBeNull();
    expect(h5?.textContent).toBe('Title');
  });

  it('applies default font / leading classes', () => {
    const { container } = render(<AlertTitle>x</AlertTitle>);
    const h5 = container.querySelector('h5');
    expect(h5?.className).toContain('font-medium');
  });

  it('merges custom className', () => {
    const { container } = render(<AlertTitle className="text-2xl">x</AlertTitle>);
    expect(container.querySelector('h5')?.className).toContain('text-2xl');
  });
});

describe('AlertDescription', () => {
  it('renders a <div> with text-sm', () => {
    const { container } = render(<AlertDescription>body</AlertDescription>);
    // AlertDescription は <div> 実装 (h5 でも p でもない)
    const desc = container.querySelector('div');
    expect(desc).not.toBeNull();
    expect(desc?.className).toContain('text-sm');
    expect(desc?.textContent).toBe('body');
  });

  it('merges custom className', () => {
    const { container } = render(<AlertDescription className="italic">x</AlertDescription>);
    expect(container.firstChild as Element).toBeTruthy();
    expect((container.firstChild as Element).getAttribute('class')).toContain('italic');
  });
});

describe('Alert extra cases', () => {
  it('renders nested AlertTitle + AlertDescription correctly', () => {
    const { container } = render(
      <Alert>
        <AlertTitle>title</AlertTitle>
        <AlertDescription>desc</AlertDescription>
      </Alert>,
    );
    expect(container.querySelector('h5')?.textContent).toBe('title');
    expect(container.textContent).toContain('desc');
  });

  it('default Alert (no variant) does not have destructive class', () => {
    const { container } = render(<Alert />);
    expect(container.querySelector('div[role="alert"]')?.className).not.toContain(
      'text-destructive',
    );
  });

  it('Alert renders exactly 1 role=alert element', () => {
    const { container } = render(<Alert>x</Alert>);
    expect(container.querySelectorAll('div[role="alert"]').length).toBe(1);
  });

  it('AlertTitle renders nested JSX correctly', () => {
    const { container } = render(
      <AlertTitle>
        <span data-testid="nested">nested</span>
      </AlertTitle>,
    );
    expect(container.querySelector('[data-testid="nested"]')?.textContent).toBe('nested');
  });

  it('AlertDescription renders 200-char long string', () => {
    const long = 'a'.repeat(200);
    const { container } = render(<AlertDescription>{long}</AlertDescription>);
    expect(container.firstChild?.textContent?.length).toBe(200);
  });

  it('Alert mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<Alert />);
      unmount();
    }
  });

  it('Alert renders 1000 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1000 }, (_, i) => (
            <Alert key={i}>content-{i}</Alert>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('all 500 alerts have role=alert', () => {
    const { container } = render(
      <>
        {Array.from({ length: 500 }, (_, i) => (
          <Alert key={i} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('div[role="alert"]').length).toBe(500);
  });

  it('AlertTitle + AlertDescription render 100 instances', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <Alert key={i}>
              <AlertTitle>title-{i}</AlertTitle>
              <AlertDescription>desc-{i}</AlertDescription>
            </Alert>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles all 2 variants 100 times each', () => {
    const variants = ['default', 'destructive'] as const;
    variants.forEach(v => {
      for (let i = 0; i < 100; i++) {
        const { unmount } = render(<Alert variant={v}>x</Alert>);
        unmount();
      }
    });
  });
});
