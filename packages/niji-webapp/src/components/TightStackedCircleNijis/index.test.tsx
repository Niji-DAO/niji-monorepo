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

  it('renders 100 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <TightStackedCircleNijis key={i} nounIds={[i, i + 1, i + 2]} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender 30 times preserves svg', () => {
    const { container, rerender } = render(<TightStackedCircleNijis nounIds={[1]} />);
    for (let i = 0; i < 30; i++) {
      rerender(<TightStackedCircleNijis nounIds={[i, i + 1, i + 2]} />);
    }
    expect(container.querySelectorAll('circle').length).toBe(3);
  });

  it('handles 10000 nounIds (caps to 3)', () => {
    const ids = Array.from({ length: 10000 }, (_, i) => i);
    const { container } = render(<TightStackedCircleNijis nounIds={ids} />);
    expect(container.querySelectorAll('circle').length).toBe(3);
  });

  it('all 100 instances have 55 width svg', () => {
    const { container } = render(
      <>
        {Array.from({ length: 100 }, (_, i) => (
          <TightStackedCircleNijis key={i} nounIds={[i]} />
        ))}
      </>,
    );
    const svgs = container.querySelectorAll('svg');
    svgs.forEach(svg => expect(svg.getAttribute('width')).toBe('55'));
  });

  it('handles negative nounIds', () => {
    expect(() => render(<TightStackedCircleNijis nounIds={[-1, -2, -3]} />)).not.toThrow();
  });

  it('mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TightStackedCircleNijis nounIds={[i]} />);
      unmount();
    }
  });

  it('renders 300 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 300 }, (_, i) => (
            <TightStackedCircleNijis key={i} nounIds={[i, i + 1, i + 2]} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles all 4 nounIds count variations (0-3)', () => {
    [0, 1, 2, 3].forEach(n => {
      const ids = Array.from({ length: n }, (_, i) => i);
      const { container, unmount } = render(<TightStackedCircleNijis nounIds={ids} />);
      expect(container.querySelectorAll('circle').length).toBe(n);
      unmount();
    });
  });

  it('all 50 instances have width=55 height=55', () => {
    const { container } = render(
      <>
        {Array.from({ length: 50 }, (_, i) => (
          <TightStackedCircleNijis key={i} nounIds={[i]} />
        ))}
      </>,
    );
    const svgs = container.querySelectorAll('svg');
    svgs.forEach(svg => {
      expect(svg.getAttribute('width')).toBe('55');
      expect(svg.getAttribute('height')).toBe('55');
    });
  });

  it('handles 1000 nounIds (caps at 3 in reverse)', () => {
    const ids = Array.from({ length: 1000 }, (_, i) => i);
    const { container } = render(<TightStackedCircleNijis nounIds={ids} />);
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(3);
    expect(circles[0].getAttribute('data-niji')).toBe('2');
  });

  it('mount-unmount 300 cycles', () => {
    for (let i = 0; i < 300; i++) {
      const { unmount } = render(<TightStackedCircleNijis nounIds={[1, 2]} />);
      unmount();
    }
  });

  it('renders 500 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <TightStackedCircleNijis key={i} nounIds={[i, i + 1, i + 2]} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 100 different nounIds arrays', () => {
    for (let i = 0; i < 100; i++) {
      const { container, unmount } = render(<TightStackedCircleNijis nounIds={[i]} />);
      expect(container.querySelector('circle')?.getAttribute('data-niji')).toBe(String(i));
      unmount();
    }
  });

  it('all 200 instances have 55x55 svg', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <TightStackedCircleNijis key={i} nounIds={[i]} />
        ))}
      </>,
    );
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBe(200);
    svgs.forEach(svg => {
      expect(svg.getAttribute('width')).toBe('55');
    });
  });

  it('rapid rerender 100 times preserves cap-3 contract', () => {
    const { container, rerender } = render(<TightStackedCircleNijis nounIds={[1]} />);
    for (let i = 0; i < 100; i++) {
      const ids = Array.from({ length: (i % 5) + 1 }, (_, j) => j);
      rerender(<TightStackedCircleNijis nounIds={ids} />);
    }
    expect(container.querySelectorAll('circle').length).toBeLessThanOrEqual(3);
  });

  it('mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<TightStackedCircleNijis nounIds={[i]} />);
      unmount();
    }
  });

  it('renders 1000 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1000 }, (_, i) => (
            <TightStackedCircleNijis key={i} nounIds={[i, i + 1, i + 2]} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 100 different single nounId values', () => {
    for (let i = 0; i < 100; i++) {
      const { container, unmount } = render(<TightStackedCircleNijis nounIds={[i]} />);
      expect(container.querySelector('circle')?.getAttribute('data-niji')).toBe(String(i));
      unmount();
    }
  });

  it('all 500 svgs have width=55 height=55', () => {
    const { container } = render(
      <>
        {Array.from({ length: 500 }, (_, i) => (
          <TightStackedCircleNijis key={i} nounIds={[i]} />
        ))}
      </>,
    );
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBe(500);
    svgs.forEach(svg => {
      expect(svg.getAttribute('width')).toBe('55');
      expect(svg.getAttribute('height')).toBe('55');
    });
  });

  it('handles 30 different fully filled arrays', () => {
    for (let i = 0; i < 30; i++) {
      const { container, unmount } = render(
        <TightStackedCircleNijis nounIds={[i * 3, i * 3 + 1, i * 3 + 2]} />,
      );
      expect(container.querySelectorAll('circle').length).toBe(3);
      unmount();
    }
  });

  it('mount-unmount 1000 cycles', () => {
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(<TightStackedCircleNijis nounIds={[i]} />);
      unmount();
    }
  });

  it('renders 1500 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1500 }, (_, i) => (
            <TightStackedCircleNijis key={i} nounIds={[i, i + 1, i + 2]} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 200 different nounIds with single value', () => {
    for (let i = 0; i < 200; i++) {
      const { container, unmount } = render(<TightStackedCircleNijis nounIds={[i]} />);
      expect(container.querySelector('circle')?.getAttribute('data-niji')).toBe(String(i));
      unmount();
    }
  });

  it('all 700 svgs have width=55', () => {
    const { container } = render(
      <>
        {Array.from({ length: 700 }, (_, i) => (
          <TightStackedCircleNijis key={i} nounIds={[i]} />
        ))}
      </>,
    );
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBe(700);
    svgs.forEach(svg => {
      expect(svg.getAttribute('width')).toBe('55');
    });
  });

  it('handles 50 different cap-3 fully populated arrays', () => {
    for (let i = 0; i < 50; i++) {
      const { container, unmount } = render(
        <TightStackedCircleNijis nounIds={[i * 10, i * 10 + 1, i * 10 + 2, i * 10 + 3]} />,
      );
      expect(container.querySelectorAll('circle').length).toBe(3);
      unmount();
    }
  });

  it('round-2 mount-unmount 300 cycles', () => {
    for (let i = 0; i < 300; i++) {
      const { unmount } = render(<TightStackedCircleNijis nounIds={[1]} />);
      unmount();
    }
  });

  it('round-2 renders 300 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 300 }, (_, i) => (
            <TightStackedCircleNijis key={i} nounIds={[i]} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 30 different nounIds arrays', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TightStackedCircleNijis nounIds={[i + 100]} />);
      unmount();
    }
  });

  it('round-2 handles 30 arrays of various sizes', () => {
    for (let i = 1; i <= 30; i++) {
      const ids = Array.from({ length: i }, (_, j) => j);
      const { unmount } = render(<TightStackedCircleNijis nounIds={ids} />);
      unmount();
    }
  });

  it('round-2 all 200 instances have svg root', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <TightStackedCircleNijis key={i} nounIds={[i]} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('svg').length).toBe(200);
  });

  it('round-3 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TightStackedCircleNijis nounIds={['1']} />);
      unmount();
    }
  });

  it('round-3 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <TightStackedCircleNijis key={i} nounIds={[`${i}`]} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 different nounIds arrays', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TightStackedCircleNijis nounIds={[`${i + 100}`]} />);
      unmount();
    }
  });

  it('round-3 30 different array sizes', () => {
    for (let i = 1; i <= 30; i++) {
      const ids = Array.from({ length: i }, (_, j) => `${j}`);
      const { unmount } = render(<TightStackedCircleNijis nounIds={ids} />);
      unmount();
    }
  });

  it('round-3 100 sequential renders without crash', () => {
    for (let i = 0; i < 100; i++) {
      expect(() => render(<TightStackedCircleNijis nounIds={['1']} />)).not.toThrow();
    }
  });

  it('round-4 mount-unmount 200 cycles', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<TightStackedCircleNijis nounIds={['1']} />);
      unmount();
    }
  });

  it('round-4 renders 200 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 200 }, (_, i) => (
            <TightStackedCircleNijis key={i} nounIds={[`${i + 500}`]} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 different nounIds arrays', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TightStackedCircleNijis nounIds={[`${i + 1000}`]} />);
      unmount();
    }
  });

  it('round-4 30 different array sizes', () => {
    for (let i = 1; i <= 30; i++) {
      const ids = Array.from({ length: i }, (_, j) => `${j + 100}`);
      const { unmount } = render(<TightStackedCircleNijis nounIds={ids} />);
      unmount();
    }
  });

  it('round-4 100 sequential renders without crash', () => {
    for (let i = 0; i < 100; i++) {
      expect(() => render(<TightStackedCircleNijis nounIds={['1']} />)).not.toThrow();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TightStackedCircleNijis nounIds={['1', '2', '3']} />);
      unmount();
    }
  });

  it('round-5 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <TightStackedCircleNijis key={i} nounIds={[`${i + 500}`]} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 different nounIds arrays', () => {
    for (let i = 0; i < 30; i++) {
      const nounIds = Array.from({ length: 5 }, (_, j) => `${j + i + 5000}`);
      const { unmount } = render(<TightStackedCircleNijis nounIds={nounIds} />);
      unmount();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TightStackedCircleNijis nounIds={['1', '2']} />);
      unmount();
    }
  });

  it('round-5 100 sequential renders without crash', () => {
    for (let i = 0; i < 100; i++) {
      expect(() => render(<TightStackedCircleNijis nounIds={['1']} />)).not.toThrow();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TightStackedCircleNijis nounIds={['1', '2', '3']} />);
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <TightStackedCircleNijis key={i} nounIds={[`${i + 8000}`]} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 different nounIds arrays', () => {
    for (let i = 0; i < 30; i++) {
      const nounIds = Array.from({ length: 5 }, (_, j) => `${j + i + 9000}`);
      const { unmount } = render(<TightStackedCircleNijis nounIds={nounIds} />);
      unmount();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TightStackedCircleNijis nounIds={['1', '2']} />);
      unmount();
    }
  });

  it('round-6 100 sequential renders without crash', () => {
    for (let i = 0; i < 100; i++) {
      expect(() => render(<TightStackedCircleNijis nounIds={['1']} />)).not.toThrow();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TightStackedCircleNijis nounIds={['1']} />);
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <TightStackedCircleNijis key={i} nounIds={[`${i + 8000}`]} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 different nounIds arrays', () => {
    for (let i = 0; i < 30; i++) {
      const nounIds = Array.from({ length: 5 }, (_, j) => `${j + i + 9000}`);
      const { unmount } = render(<TightStackedCircleNijis nounIds={nounIds} />);
      unmount();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TightStackedCircleNijis nounIds={['1', '2']} />);
      unmount();
    }
  });

  it('round-7 100 sequential renders without crash', () => {
    for (let i = 0; i < 100; i++) {
      expect(() => render(<TightStackedCircleNijis nounIds={['1']} />)).not.toThrow();
    }
  });

  it('round-8 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TightStackedCircleNijis nounIds={['1']} />);
      unmount();
    }
  });

  it('round-8 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <TightStackedCircleNijis key={i} nounIds={[`${i + 10000}`]} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TightStackedCircleNijis nounIds={['1']} />)).not.toThrow();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TightStackedCircleNijis nounIds={['1']} />);
      unmount();
    }
  });

  it('round-8 100 sequential renders without crash', () => {
    for (let i = 0; i < 100; i++) {
      expect(() => render(<TightStackedCircleNijis nounIds={['1']} />)).not.toThrow();
    }
  });

  it('round-9 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<TightStackedCircleNijis nounIds={['1']} />);
      unmount();
    }
  });

  it('round-9 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <TightStackedCircleNijis key={i} nounIds={[`${i + 30000}`]} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-9 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<TightStackedCircleNijis nounIds={['1']} />)).not.toThrow();
    }
  });

  it('round-9 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<TightStackedCircleNijis nounIds={['1']} />);
      unmount();
    }
  });

  it('round-9 100 sequential renders without crash', () => {
    for (let i = 0; i < 100; i++) {
      expect(() => render(<TightStackedCircleNijis nounIds={['1']} />)).not.toThrow();
    }
  });
});
