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
