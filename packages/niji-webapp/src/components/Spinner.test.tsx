import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('renders an SVG element (lucide LoaderCircleIcon)', () => {
    const { container } = render(<Spinner />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
  });

  it('applies default size + animate-spin classes', () => {
    const { container } = render(<Spinner />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('class')).toContain('size-10');
    expect(svg?.getAttribute('class')).toContain('animate-spin');
  });

  it('merges custom className (preserves defaults + appends)', () => {
    const { container } = render(<Spinner className="text-red-500" />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('class')).toContain('animate-spin');
    expect(svg?.getAttribute('class')).toContain('text-red-500');
  });

  it('overrides size when className contains size-*', () => {
    const { container } = render(<Spinner className="size-4" />);
    const svg = container.querySelector('svg');
    // tailwind-merge: size-4 wins over size-10
    expect(svg?.getAttribute('class')).toContain('size-4');
    expect(svg?.getAttribute('class')).not.toContain('size-10');
  });

  it('renders default size-10 when className is undefined', () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector('svg')?.getAttribute('class')).toContain('size-10');
  });

  it('handles empty className (default classes preserved)', () => {
    const { container } = render(<Spinner className="" />);
    const cls = container.querySelector('svg')?.getAttribute('class') ?? '';
    expect(cls).toContain('animate-spin');
    expect(cls).toContain('size-10');
  });

  it('merges multiple custom classes (text-* + m-*)', () => {
    const { container } = render(<Spinner className="m-2 text-blue-500" />);
    const cls = container.querySelector('svg')?.getAttribute('class') ?? '';
    expect(cls).toContain('text-blue-500');
    expect(cls).toContain('m-2');
  });

  it('overrides size-* with size-2', () => {
    const { container } = render(<Spinner className="size-2" />);
    const cls = container.querySelector('svg')?.getAttribute('class') ?? '';
    expect(cls).toContain('size-2');
    expect(cls).not.toContain('size-10');
  });

  it('overrides size-* with size-16', () => {
    const { container } = render(<Spinner className="size-16" />);
    const cls = container.querySelector('svg')?.getAttribute('class') ?? '';
    expect(cls).toContain('size-16');
    expect(cls).not.toContain('size-10');
  });

  it('renders exactly 1 svg (single instance contract)', () => {
    const { container } = render(<Spinner />);
    expect(container.querySelectorAll('svg').length).toBe(1);
  });
});
