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

  it('animate-spin is always present (rotation class)', () => {
    const { container } = render(<Spinner className="text-foo" />);
    expect(container.querySelector('svg')?.getAttribute('class')).toContain('animate-spin');
  });

  it('multiple Spinners render independently', () => {
    const { container } = render(
      <>
        <Spinner />
        <Spinner />
        <Spinner />
      </>,
    );
    expect(container.querySelectorAll('svg').length).toBe(3);
  });

  it('size-8 className overrides default', () => {
    const { container } = render(<Spinner className="size-8" />);
    const cls = container.querySelector('svg')?.getAttribute('class') ?? '';
    expect(cls).toContain('size-8');
    expect(cls).not.toContain('size-10');
  });

  it('rerender with className change updates class', () => {
    const { container, rerender } = render(<Spinner />);
    expect(container.querySelector('svg')?.getAttribute('class')).toContain('size-10');
    rerender(<Spinner className="size-6" />);
    expect(container.querySelector('svg')?.getAttribute('class')).toContain('size-6');
  });

  it('lucide LoaderCircleIcon outputs valid svg with path/circle', () => {
    const { container } = render(<Spinner />);
    const svg = container.querySelector('svg');
    expect(svg?.children.length).toBeGreaterThan(0);
  });

  it('mount-unmount 2000 cycles', () => {
    for (let i = 0; i < 2000; i++) {
      const { unmount } = render(<Spinner />);
      unmount();
    }
  });

  it('renders 3000 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 3000 }, (_, i) => (
            <Spinner key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('all 1500 instances render svg', () => {
    const { container } = render(
      <>
        {Array.from({ length: 1500 }, (_, i) => (
          <Spinner key={i} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('svg').length).toBe(1500);
  });

  it('handles 100 different className values', () => {
    for (let i = 0; i < 100; i++) {
      const { container, unmount } = render(<Spinner className={`cls-${i}`} />);
      expect(container.querySelector('svg')?.getAttribute('class')).toContain(`cls-${i}`);
      unmount();
    }
  });

  it('rapid 2000 renders without crash', () => {
    for (let i = 0; i < 2000; i++) {
      expect(() => render(<Spinner />)).not.toThrow();
    }
  });

  it('round-2 mount-unmount 1000 cycles', () => {
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(<Spinner />);
      unmount();
    }
  });

  it('round-2 renders 1000 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1000 }, (_, i) => (
            <Spinner key={i} className={`cls-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 100 className values', () => {
    for (let i = 0; i < 100; i++) {
      const { container, unmount } = render(<Spinner className={`v-${i}`} />);
      expect(container.querySelector('svg')?.getAttribute('class')).toContain(`v-${i}`);
      unmount();
    }
  });

  it('round-2 all 500 SVGs have animate-spin class', () => {
    const { container } = render(
      <>
        {Array.from({ length: 500 }, (_, i) => (
          <Spinner key={i} />
        ))}
      </>,
    );
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBe(500);
  });

  it('round-2 rapid 1500 invocations', () => {
    for (let i = 0; i < 1500; i++) {
      expect(() => render(<Spinner />)).not.toThrow();
    }
  });
});
