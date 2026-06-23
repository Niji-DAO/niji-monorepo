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
});
