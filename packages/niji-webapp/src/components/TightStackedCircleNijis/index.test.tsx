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

  it('handles 0 nounId without crash', () => {
    const { container } = render(<TightStackedCircleNijis nounIds={[0]} />);
    expect(container.querySelector('circle')?.getAttribute('data-niji')).toBe('0');
  });

  it('rerender from [1] to [1,2,3] increases circle count', () => {
    const { container, rerender } = render(<TightStackedCircleNijis nounIds={[1]} />);
    expect(container.querySelectorAll('circle').length).toBe(1);
    rerender(<TightStackedCircleNijis nounIds={[1, 2, 3]} />);
    expect(container.querySelectorAll('circle').length).toBe(3);
  });

  it('exactly 3 nounIds == 3 circles (boundary)', () => {
    const { container } = render(<TightStackedCircleNijis nounIds={[1, 2, 3]} />);
    expect(container.querySelectorAll('circle').length).toBe(3);
  });

  it('100 nounIds still caps at 3', () => {
    const ids = Array.from({ length: 100 }, (_, i) => i + 1);
    const { container } = render(<TightStackedCircleNijis nounIds={ids} />);
    expect(container.querySelectorAll('circle').length).toBe(3);
  });

  it('outermost element is single svg', () => {
    const { container } = render(<TightStackedCircleNijis nounIds={[1]} />);
    expect(container.children.length).toBe(1);
    expect(container.firstElementChild?.tagName.toLowerCase()).toBe('svg');
  });

  it('rerender from [1,2,3] to [] removes all circles', () => {
    const { container, rerender } = render(<TightStackedCircleNijis nounIds={[1, 2, 3]} />);
    expect(container.querySelectorAll('circle').length).toBe(3);
    rerender(<TightStackedCircleNijis nounIds={[]} />);
    expect(container.querySelectorAll('circle').length).toBe(0);
  });

  it('rerender from [1,2,3,4,5] to [10] reduces to 1 circle', () => {
    const { container, rerender } = render(<TightStackedCircleNijis nounIds={[1, 2, 3, 4, 5]} />);
    expect(container.querySelectorAll('circle').length).toBe(3);
    rerender(<TightStackedCircleNijis nounIds={[10]} />);
    expect(container.querySelectorAll('circle').length).toBe(1);
    expect(container.querySelector('circle')?.getAttribute('data-niji')).toBe('10');
  });

  it('multiple instances each render correctly', () => {
    const { container } = render(
      <>
        <TightStackedCircleNijis nounIds={[1]} />
        <TightStackedCircleNijis nounIds={[2, 3]} />
      </>,
    );
    expect(container.querySelectorAll('svg').length).toBe(2);
    expect(container.querySelectorAll('circle').length).toBe(3);
  });

  it('svg always has 55x55 dimensions regardless of nounIds count', () => {
    const { container: c1 } = render(<TightStackedCircleNijis nounIds={[]} />);
    const { container: c2 } = render(<TightStackedCircleNijis nounIds={[1, 2, 3, 4, 5]} />);
    expect(c1.querySelector('svg')?.getAttribute('width')).toBe('55');
    expect(c2.querySelector('svg')?.getAttribute('width')).toBe('55');
  });

  it('takes first 3 in reverse order for 5 inputs', () => {
    const { container } = render(<TightStackedCircleNijis nounIds={[10, 20, 30, 40, 50]} />);
    const circles = container.querySelectorAll('circle');
    expect(circles[0].getAttribute('data-niji')).toBe('30');
    expect(circles[1].getAttribute('data-niji')).toBe('20');
    expect(circles[2].getAttribute('data-niji')).toBe('10');
  });

  it('negative nounId renders as string', () => {
    const { container } = render(<TightStackedCircleNijis nounIds={[-5]} />);
    expect(container.querySelector('circle')?.getAttribute('data-niji')).toBe('-5');
  });

  it('exactly 2 nounIds renders 2 circles in reverse', () => {
    const { container } = render(<TightStackedCircleNijis nounIds={[10, 20]} />);
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(2);
    expect(circles[0].getAttribute('data-niji')).toBe('20');
    expect(circles[1].getAttribute('data-niji')).toBe('10');
  });

  it('5 instances each render with own svg', () => {
    const { container } = render(
      <>
        <TightStackedCircleNijis nounIds={[1]} />
        <TightStackedCircleNijis nounIds={[2]} />
        <TightStackedCircleNijis nounIds={[3]} />
        <TightStackedCircleNijis nounIds={[4]} />
        <TightStackedCircleNijis nounIds={[5]} />
      </>,
    );
    expect(container.querySelectorAll('svg').length).toBe(5);
  });

  it('rerender preserves SVG dimensions across multiple updates', () => {
    const { container, rerender } = render(<TightStackedCircleNijis nounIds={[1]} />);
    expect(container.querySelector('svg')?.getAttribute('width')).toBe('55');
    rerender(<TightStackedCircleNijis nounIds={[1, 2]} />);
    expect(container.querySelector('svg')?.getAttribute('width')).toBe('55');
    rerender(<TightStackedCircleNijis nounIds={[1, 2, 3]} />);
    expect(container.querySelector('svg')?.getAttribute('width')).toBe('55');
  });

  it('large nounId (MAX_SAFE_INTEGER) renders as string', () => {
    const huge = Number.MAX_SAFE_INTEGER;
    const { container } = render(<TightStackedCircleNijis nounIds={[huge]} />);
    expect(container.querySelector('circle')?.getAttribute('data-niji')).toBe(String(huge));
  });

  it('SVG outer element renders 1 instance per component', () => {
    const { container } = render(<TightStackedCircleNijis nounIds={[1, 2, 3]} />);
    expect(container.children.length).toBe(1);
  });

  it('handles 100 IDs caps at 3', () => {
    const ids = Array.from({ length: 100 }, (_, i) => i + 1);
    const { container } = render(<TightStackedCircleNijis nounIds={ids} />);
    expect(container.querySelectorAll('circle').length).toBe(3);
  });

  it('rerender from 0 to 3 IDs adds circles', () => {
    const { container, rerender } = render(<TightStackedCircleNijis nounIds={[]} />);
    expect(container.querySelectorAll('circle').length).toBe(0);
    rerender(<TightStackedCircleNijis nounIds={[1, 2, 3]} />);
    expect(container.querySelectorAll('circle').length).toBe(3);
  });

  it('renders 5 instances independently', () => {
    const { container } = render(
      <>
        <TightStackedCircleNijis nounIds={[1]} />
        <TightStackedCircleNijis nounIds={[1, 2]} />
        <TightStackedCircleNijis nounIds={[1, 2, 3]} />
        <TightStackedCircleNijis nounIds={[1, 2, 3, 4]} />
        <TightStackedCircleNijis nounIds={[]} />
      </>,
    );
    expect(container.querySelectorAll('svg').length).toBe(5);
  });

  it('renders without crash for very large nounId value', () => {
    expect(() => render(<TightStackedCircleNijis nounIds={[9007199254740991]} />)).not.toThrow();
  });

  it('handles negative nounId values without crash', () => {
    expect(() => render(<TightStackedCircleNijis nounIds={[-1, -2, -3]} />)).not.toThrow();
  });

  it('renders 20 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 20 }, (_, i) => (
          <TightStackedCircleNijis key={i} nounIds={[i, i + 1, i + 2]} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('svg').length).toBe(20);
  });

  it('renders 1 noun id with 1 circle', () => {
    const { container } = render(<TightStackedCircleNijis nounIds={[1]} />);
    expect(container.querySelectorAll('circle').length).toBe(1);
  });

  it('renders 4 ids caps at 3 (MAX 3)', () => {
    const { container } = render(<TightStackedCircleNijis nounIds={[1, 2, 3, 4]} />);
    expect(container.querySelectorAll('circle').length).toBe(3);
  });

  it('renders 2 ids with 2 circles', () => {
    const { container } = render(<TightStackedCircleNijis nounIds={[10, 20]} />);
    expect(container.querySelectorAll('circle').length).toBe(2);
  });

  it('renders without crash for 50 ids', () => {
    const ids = Array.from({ length: 50 }, (_, i) => i);
    expect(() => render(<TightStackedCircleNijis nounIds={ids} />)).not.toThrow();
  });

  it('renders 30 TightStackedCircleNijis independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 30 }, (_, i) => (
          <TightStackedCircleNijis key={i} nounIds={[i, i + 1, i + 2]} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('svg').length).toBe(30);
  });

  it('handles 0 ids renders 0 circles', () => {
    const { container } = render(<TightStackedCircleNijis nounIds={[]} />);
    expect(container.querySelectorAll('circle').length).toBe(0);
  });

  it('handles only 1 id renders 1 circle', () => {
    const { container } = render(<TightStackedCircleNijis nounIds={[42]} />);
    expect(container.querySelectorAll('circle').length).toBe(1);
  });

  it('cap at 3 for 3+ ids (boundary)', () => {
    const { container } = render(<TightStackedCircleNijis nounIds={[1, 2, 3]} />);
    expect(container.querySelectorAll('circle').length).toBe(3);
  });

  it('rerender from empty to 3 ids increases circles', () => {
    const { container, rerender } = render(<TightStackedCircleNijis nounIds={[]} />);
    expect(container.querySelectorAll('circle').length).toBe(0);
    rerender(<TightStackedCircleNijis nounIds={[10, 20, 30]} />);
    expect(container.querySelectorAll('circle').length).toBe(3);
  });

  it('renders 50 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 50 }, (_, i) => (
          <TightStackedCircleNijis key={i} nounIds={[i, i + 1, i + 2]} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('svg').length).toBe(50);
  });

  it('rerender 30 times preserves SVG count', () => {
    const { container, rerender } = render(<TightStackedCircleNijis nounIds={[1, 2, 3]} />);
    for (let i = 0; i < 30; i++) {
      rerender(<TightStackedCircleNijis nounIds={[i, i + 1, i + 2]} />);
      expect(container.querySelectorAll('svg').length).toBe(1);
    }
  });

  it('handles 1000 IDs caps at 3', () => {
    const ids = Array.from({ length: 1000 }, (_, i) => i);
    const { container } = render(<TightStackedCircleNijis nounIds={ids} />);
    expect(container.querySelectorAll('circle').length).toBe(3);
  });

  it('handles very large nounId values', () => {
    expect(() =>
      render(<TightStackedCircleNijis nounIds={[Number.MAX_SAFE_INTEGER, 0, -1]} />),
    ).not.toThrow();
  });

  it('handles 0 ID + svg has 55 width', () => {
    const { container } = render(<TightStackedCircleNijis nounIds={[]} />);
    expect(container.querySelector('svg')?.getAttribute('width')).toBe('55');
  });
});
