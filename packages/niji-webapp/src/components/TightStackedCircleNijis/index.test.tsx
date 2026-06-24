import React from 'react';

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../TightStackedCircleNiji', () => ({
  default: ({ nounId }: { nounId: number }) => <circle data-niji={nounId} />,
}));

import TightStackedCircleNijis from './index';

describe('TightStackedCircleNijis', () => {
  it('renders svg of 55x55', () => {
    const { container } = render(<TightStackedCircleNijis nounIds={[1, 2, 3]} />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('width')).toBe('55');
    expect(svg?.getAttribute('height')).toBe('55');
  });

  it('caps at 3 elements (MAX_NOUNS_PER_STACK)', () => {
    const { container } = render(<TightStackedCircleNijis nounIds={[1, 2, 3, 4, 5]} />);
    expect(container.querySelectorAll('circle').length).toBe(3);
  });

  it('renders fewer than max when nounIds has < 3', () => {
    const { container } = render(<TightStackedCircleNijis nounIds={[10, 20]} />);
    expect(container.querySelectorAll('circle').length).toBe(2);
  });

  it('renders zero circles for empty list', () => {
    const { container } = render(<TightStackedCircleNijis nounIds={[]} />);
    expect(container.querySelectorAll('circle').length).toBe(0);
  });

  it('renders exactly 1 svg element', () => {
    const { container } = render(<TightStackedCircleNijis nounIds={[1, 2]} />);
    expect(container.querySelectorAll('svg').length).toBe(1);
  });

  it('renders circles in reversed order (last input → first DOM)', () => {
    const { container } = render(<TightStackedCircleNijis nounIds={[1, 2, 3]} />);
    const circles = container.querySelectorAll('circle');
    // .reverse() で DOM 上 [3, 2, 1]
    expect(circles[0].getAttribute('data-niji')).toBe('3');
    expect(circles[1].getAttribute('data-niji')).toBe('2');
    expect(circles[2].getAttribute('data-niji')).toBe('1');
  });

  it('handles large nounId (1_000_000)', () => {
    const { container } = render(<TightStackedCircleNijis nounIds={[1_000_000]} />);
    expect(container.querySelector('circle')?.getAttribute('data-niji')).toBe('1000000');
  });

  it('handles single nounId list', () => {
    const { container } = render(<TightStackedCircleNijis nounIds={[42]} />);
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(1);
    expect(circles[0].getAttribute('data-niji')).toBe('42');
  });

  it('svg has width=55 and height=55 (square 55)', () => {
    const { container } = render(<TightStackedCircleNijis nounIds={[1]} />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('width')).toBe('55');
    expect(svg?.getAttribute('height')).toBe('55');
  });
});
