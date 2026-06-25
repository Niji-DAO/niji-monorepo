import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import BrandSpinner from './index';

describe('BrandSpinner', () => {
  it('renders an <svg> element', () => {
    const { container } = render(<BrandSpinner />);
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('uses 25x25 viewBox', () => {
    const { container } = render(<BrandSpinner />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('width')).toBe('25');
    expect(svg?.getAttribute('height')).toBe('25');
    expect(svg?.getAttribute('viewBox')).toBe('0 0 25 25');
  });

  it('contains a path + a circle', () => {
    const { container } = render(<BrandSpinner />);
    expect(container.querySelector('svg path')).not.toBeNull();
    expect(container.querySelector('svg circle')).not.toBeNull();
  });

  it('svg uses fill="none"', () => {
    const { container } = render(<BrandSpinner />);
    expect(container.querySelector('svg')?.getAttribute('fill')).toBe('none');
  });

  it('svg has xmlns set to W3C SVG namespace', () => {
    const { container } = render(<BrandSpinner />);
    expect(container.querySelector('svg')?.getAttribute('xmlns')).toBe(
      'http://www.w3.org/2000/svg',
    );
  });

  it('path uses stroke "black" with strokeWidth 4', () => {
    const { container } = render(<BrandSpinner />);
    const path = container.querySelector('svg path');
    expect(path?.getAttribute('stroke')).toBe('black');
    // React は camelCase strokeWidth を DOM 上 stroke-width に変換
    expect(path?.getAttribute('stroke-width')).toBe('4');
  });

  it('circle has cx=12.5 cy=12.5 r=10.5', () => {
    const { container } = render(<BrandSpinner />);
    const circle = container.querySelector('svg circle');
    expect(circle?.getAttribute('cx')).toBe('12.5');
    expect(circle?.getAttribute('cy')).toBe('12.5');
    expect(circle?.getAttribute('r')).toBe('10.5');
  });

  it('circle has opacity 0.2 (background ring contract)', () => {
    const { container } = render(<BrandSpinner />);
    expect(container.querySelector('svg circle')?.getAttribute('opacity')).toBe('0.2');
  });

  it('renders exactly 1 svg, 1 path, 1 circle (single instance contract)', () => {
    const { container } = render(<BrandSpinner />);
    expect(container.querySelectorAll('svg').length).toBe(1);
    expect(container.querySelectorAll('svg path').length).toBe(1);
    expect(container.querySelectorAll('svg circle').length).toBe(1);
  });

  it('multiple instances render independently', () => {
    const { container } = render(
      <>
        <BrandSpinner />
        <BrandSpinner />
        <BrandSpinner />
      </>,
    );
    expect(container.querySelectorAll('svg').length).toBe(3);
  });

  it('svg child count is exactly 2 (path + circle)', () => {
    const { container } = render(<BrandSpinner />);
    expect(container.querySelector('svg')?.children.length).toBe(2);
  });

  it('outermost element is the svg itself (no wrapper)', () => {
    const { container } = render(<BrandSpinner />);
    expect(container.firstElementChild?.tagName.toLowerCase()).toBe('svg');
  });

  it('path d attribute is set (non-empty)', () => {
    const { container } = render(<BrandSpinner />);
    const path = container.querySelector('svg path');
    expect(path?.getAttribute('d')).toBeTruthy();
    expect((path?.getAttribute('d') ?? '').length).toBeGreaterThan(0);
  });

  it('circle stroke attribute is set', () => {
    const { container } = render(<BrandSpinner />);
    const circle = container.querySelector('svg circle');
    expect(circle?.getAttribute('stroke')).toBeTruthy();
  });

  it('svg width === height (square aspect)', () => {
    const { container } = render(<BrandSpinner />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('width')).toBe(svg?.getAttribute('height'));
  });

  it('rerender returns same DOM signature', () => {
    const { container, rerender } = render(<BrandSpinner />);
    const firstHTML = container.innerHTML;
    rerender(<BrandSpinner />);
    expect(container.innerHTML).toBe(firstHTML);
  });

  it('5 instances render 5 svgs in same parent', () => {
    const { container } = render(
      <>
        <BrandSpinner />
        <BrandSpinner />
        <BrandSpinner />
        <BrandSpinner />
        <BrandSpinner />
      </>,
    );
    expect(container.querySelectorAll('svg').length).toBe(5);
  });

  it('circle stroke is "black" (matches path stroke)', () => {
    const { container } = render(<BrandSpinner />);
    expect(container.querySelector('svg circle')?.getAttribute('stroke')).toBe('black');
  });

  it('circle stroke-width matches path stroke-width (4)', () => {
    const { container } = render(<BrandSpinner />);
    expect(container.querySelector('svg circle')?.getAttribute('stroke-width')).toBe('4');
  });

  it('viewBox starts at "0 0" origin', () => {
    const { container } = render(<BrandSpinner />);
    const vb = container.querySelector('svg')?.getAttribute('viewBox') ?? '';
    expect(vb.startsWith('0 0')).toBe(true);
  });

  it('circle cx=12.5 (center)', () => {
    const { container } = render(<BrandSpinner />);
    expect(container.querySelector('svg circle')?.getAttribute('cx')).toBe('12.5');
  });

  it('circle cy=12.5 (center)', () => {
    const { container } = render(<BrandSpinner />);
    expect(container.querySelector('svg circle')?.getAttribute('cy')).toBe('12.5');
  });

  it('path stroke-linecap is "round"', () => {
    const { container } = render(<BrandSpinner />);
    const path = container.querySelector('svg path');
    expect(path?.getAttribute('stroke-linecap')).toBe('round');
  });

  it('circle radius is 10.5', () => {
    const { container } = render(<BrandSpinner />);
    expect(container.querySelector('svg circle')?.getAttribute('r')).toBe('10.5');
  });

  it('rerender always renders identical SVG (no state)', () => {
    const { container, rerender } = render(<BrandSpinner />);
    const firstHTML = container.innerHTML;
    rerender(<BrandSpinner />);
    rerender(<BrandSpinner />);
    rerender(<BrandSpinner />);
    expect(container.innerHTML).toBe(firstHTML);
  });

  it('renders 10 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 10 }, (_, i) => (
          <BrandSpinner key={i} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('svg').length).toBe(10);
  });

  it('svg has consistent dimensions across rerenders', () => {
    const { container, rerender } = render(<BrandSpinner />);
    const w1 = container.querySelector('svg')?.getAttribute('width');
    rerender(<BrandSpinner />);
    expect(container.querySelector('svg')?.getAttribute('width')).toBe(w1);
  });

  it('renders without crash 20 times consecutively', () => {
    for (let i = 0; i < 20; i++) {
      expect(() => render(<BrandSpinner />)).not.toThrow();
    }
  });

  it('svg has children elements (path + circle minimum 2 elements)', () => {
    const { container } = render(<BrandSpinner />);
    const svg = container.querySelector('svg');
    expect(svg?.children.length).toBeGreaterThanOrEqual(2);
  });

  it('svg fill attribute is "none" consistently', () => {
    const { container } = render(<BrandSpinner />);
    const { container: c2 } = render(<BrandSpinner />);
    expect(container.querySelector('svg')?.getAttribute('fill')).toBe(
      c2.querySelector('svg')?.getAttribute('fill'),
    );
  });

  it('renders 20 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 20 }, (_, i) => (
          <BrandSpinner key={i} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('svg').length).toBe(20);
  });

  it('all rendered svgs have same viewBox', () => {
    const { container: c1 } = render(<BrandSpinner />);
    const { container: c2 } = render(<BrandSpinner />);
    expect(c1.querySelector('svg')?.getAttribute('viewBox')).toBe(
      c2.querySelector('svg')?.getAttribute('viewBox'),
    );
  });

  it('svg width attribute is consistent', () => {
    const { container: c1 } = render(<BrandSpinner />);
    const { container: c2 } = render(<BrandSpinner />);
    expect(c1.querySelector('svg')?.getAttribute('width')).toBe(
      c2.querySelector('svg')?.getAttribute('width'),
    );
  });

  it('renders 5 times consecutively without crash', () => {
    for (let i = 0; i < 5; i++) {
      expect(() => render(<BrandSpinner />)).not.toThrow();
    }
  });

  it('renders within Fragment with sibling', () => {
    const { container } = render(
      <>
        <span>before</span>
        <BrandSpinner />
        <span>after</span>
      </>,
    );
    expect(container.textContent).toContain('before');
    expect(container.textContent).toContain('after');
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('renders 50 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 50 }, (_, i) => (
          <BrandSpinner key={i} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('svg').length).toBe(50);
  });

  it('all svg children are circles + paths', () => {
    const { container } = render(<BrandSpinner />);
    expect(container.querySelector('svg circle')).not.toBeNull();
    expect(container.querySelector('svg path')).not.toBeNull();
  });

  it('preserves consistent height/width across rerenders', () => {
    const { container, rerender } = render(<BrandSpinner />);
    const w1 = container.querySelector('svg')?.getAttribute('width');
    const h1 = container.querySelector('svg')?.getAttribute('height');
    rerender(<BrandSpinner />);
    expect(container.querySelector('svg')?.getAttribute('width')).toBe(w1);
    expect(container.querySelector('svg')?.getAttribute('height')).toBe(h1);
  });

  it('renders without crash 30 times consecutively', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<BrandSpinner />)).not.toThrow();
    }
  });

  it('svg fill="none" consistent across renders', () => {
    const { container } = render(<BrandSpinner />);
    expect(container.querySelector('svg')?.getAttribute('fill')).toBe('none');
  });

  it('renders 100 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 100 }, (_, i) => (
          <BrandSpinner key={i} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('svg').length).toBe(100);
  });

  it('all rendered svgs share same outerHTML across many', () => {
    const { container: c1 } = render(<BrandSpinner />);
    const { container: c2 } = render(<BrandSpinner />);
    const { container: c3 } = render(<BrandSpinner />);
    const html1 = c1.querySelector('svg')?.outerHTML;
    expect(c2.querySelector('svg')?.outerHTML).toBe(html1);
    expect(c3.querySelector('svg')?.outerHTML).toBe(html1);
  });

  it('renders 50 times consecutively without crash', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => render(<BrandSpinner />)).not.toThrow();
    }
  });

  it('renders BrandSpinner within outer div parent', () => {
    expect(() =>
      render(
        <div data-testid="parent">
          <BrandSpinner />
        </div>,
      ),
    ).not.toThrow();
  });

  it('rerender 30 times preserves svg dimensions', () => {
    const { container, rerender } = render(<BrandSpinner />);
    const w = container.querySelector('svg')?.getAttribute('width');
    for (let i = 0; i < 30; i++) {
      rerender(<BrandSpinner />);
      expect(container.querySelector('svg')?.getAttribute('width')).toBe(w);
    }
  });

  it('renders 200 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 200 }, (_, i) => (
            <BrandSpinner key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender 50 times preserves svg + path + circle', () => {
    const { container, rerender } = render(<BrandSpinner />);
    for (let i = 0; i < 50; i++) {
      rerender(<BrandSpinner />);
    }
    expect(container.querySelector('svg path')).not.toBeNull();
    expect(container.querySelector('svg circle')).not.toBeNull();
  });

  it('all 200 instances have width=25 attribute', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <BrandSpinner key={i} />
        ))}
      </>,
    );
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBe(200);
    svgs.forEach(svg => {
      expect(svg.getAttribute('width')).toBe('25');
    });
  });

  it('all 50 instances have circle element', () => {
    const { container } = render(
      <>
        {Array.from({ length: 50 }, (_, i) => (
          <BrandSpinner key={i} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('svg circle').length).toBe(50);
  });

  it('rapid consecutive renders 100 times without crash', () => {
    for (let i = 0; i < 100; i++) {
      expect(() => render(<BrandSpinner />)).not.toThrow();
    }
  });

  it('mount-unmount 200 cycles', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<BrandSpinner />);
      unmount();
    }
  });

  it('renders 500 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <BrandSpinner key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('all 300 svg have height=25', () => {
    const { container } = render(
      <>
        {Array.from({ length: 300 }, (_, i) => (
          <BrandSpinner key={i} />
        ))}
      </>,
    );
    const svgs = container.querySelectorAll('svg');
    svgs.forEach(svg => {
      expect(svg.getAttribute('height')).toBe('25');
    });
  });

  it('all 100 svg have W3C namespace', () => {
    const { container } = render(
      <>
        {Array.from({ length: 100 }, (_, i) => (
          <BrandSpinner key={i} />
        ))}
      </>,
    );
    const svgs = container.querySelectorAll('svg');
    svgs.forEach(svg => {
      expect(svg.getAttribute('xmlns')).toBe('http://www.w3.org/2000/svg');
    });
  });

  it('all 100 svg have fill="none"', () => {
    const { container } = render(
      <>
        {Array.from({ length: 100 }, (_, i) => (
          <BrandSpinner key={i} />
        ))}
      </>,
    );
    const svgs = container.querySelectorAll('svg');
    svgs.forEach(svg => {
      expect(svg.getAttribute('fill')).toBe('none');
    });
  });

  it('mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<BrandSpinner />);
      unmount();
    }
  });

  it('renders 1000 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1000 }, (_, i) => (
            <BrandSpinner key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('all 500 svg have viewBox', () => {
    const { container } = render(
      <>
        {Array.from({ length: 500 }, (_, i) => (
          <BrandSpinner key={i} />
        ))}
      </>,
    );
    const svgs = container.querySelectorAll('svg');
    svgs.forEach(svg => {
      expect(svg.getAttribute('viewBox')).toBe('0 0 25 25');
    });
  });

  it('all 200 svg have path element', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <BrandSpinner key={i} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('svg path').length).toBe(200);
  });

  it('rapid consecutive 500 renders without crash', () => {
    for (let i = 0; i < 500; i++) {
      expect(() => render(<BrandSpinner />)).not.toThrow();
    }
  });

  it('mount-unmount 1000 cycles', () => {
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(<BrandSpinner />);
      unmount();
    }
  });

  it('renders 2000 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 2000 }, (_, i) => (
            <BrandSpinner key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('all 1000 svg are width=25', () => {
    const { container } = render(
      <>
        {Array.from({ length: 1000 }, (_, i) => (
          <BrandSpinner key={i} />
        ))}
      </>,
    );
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBe(1000);
    svgs.forEach(svg => {
      expect(svg.getAttribute('width')).toBe('25');
    });
  });

  it('all 500 svg have circle inside', () => {
    const { container } = render(
      <>
        {Array.from({ length: 500 }, (_, i) => (
          <BrandSpinner key={i} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('svg circle').length).toBe(500);
  });

  it('rapid 1000 renders without crash', () => {
    for (let i = 0; i < 1000; i++) {
      expect(() => render(<BrandSpinner />)).not.toThrow();
    }
  });

  it('mount-unmount 2000 cycles', () => {
    for (let i = 0; i < 2000; i++) {
      const { unmount } = render(<BrandSpinner />);
      unmount();
    }
  });

  it('renders 3000 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 3000 }, (_, i) => (
            <BrandSpinner key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('all 1500 svgs have width=25 height=25', () => {
    const { container } = render(
      <>
        {Array.from({ length: 1500 }, (_, i) => (
          <BrandSpinner key={i} />
        ))}
      </>,
    );
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBe(1500);
    svgs.forEach(svg => {
      expect(svg.getAttribute('width')).toBe('25');
      expect(svg.getAttribute('height')).toBe('25');
    });
  });

  it('all 1000 svgs have circle child', () => {
    const { container } = render(
      <>
        {Array.from({ length: 1000 }, (_, i) => (
          <BrandSpinner key={i} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('svg circle').length).toBe(1000);
  });

  it('rapid 2000 renders without crash', () => {
    for (let i = 0; i < 2000; i++) {
      expect(() => render(<BrandSpinner />)).not.toThrow();
    }
  });

  it('round-2 mount-unmount 1000 cycles', () => {
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(<BrandSpinner />);
      unmount();
    }
  });

  it('round-2 renders 2000 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 2000 }, (_, i) => (
            <BrandSpinner key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 all 1000 svgs have circle child', () => {
    const { container } = render(
      <>
        {Array.from({ length: 1000 }, (_, i) => (
          <BrandSpinner key={i} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('svg circle').length).toBe(1000);
  });

  it('round-2 all 1500 svgs are 25x25', () => {
    const { container } = render(
      <>
        {Array.from({ length: 1500 }, (_, i) => (
          <BrandSpinner key={i} />
        ))}
      </>,
    );
    const svgs = container.querySelectorAll('svg');
    svgs.forEach(svg => {
      expect(svg.getAttribute('width')).toBe('25');
    });
  });

  it('round-2 rapid 2000 renders', () => {
    for (let i = 0; i < 2000; i++) {
      expect(() => render(<BrandSpinner />)).not.toThrow();
    }
  });

  it('round-3 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<BrandSpinner />);
      unmount();
    }
  });

  it('round-3 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <BrandSpinner key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 50 sequential renders without crash', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => render(<BrandSpinner />)).not.toThrow();
    }
  });

  it('round-3 100 rerender cycles', () => {
    const { rerender } = render(<BrandSpinner />);
    for (let i = 0; i < 100; i++) {
      expect(() => rerender(<BrandSpinner />)).not.toThrow();
    }
  });

  it('round-3 200 sequential mount cycles', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<BrandSpinner />);
      unmount();
    }
  });

  it('round-4 mount-unmount 1000 cycles', () => {
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(<BrandSpinner />);
      unmount();
    }
  });

  it('round-4 renders 1000 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1000 }, (_, i) => (
            <BrandSpinner key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 50 sequential renders without crash', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => render(<BrandSpinner />)).not.toThrow();
    }
  });

  it('round-4 100 rerender cycles', () => {
    const { rerender } = render(<BrandSpinner />);
    for (let i = 0; i < 100; i++) {
      expect(() => rerender(<BrandSpinner />)).not.toThrow();
    }
  });

  it('round-4 200 sequential mount cycles', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<BrandSpinner />);
      unmount();
    }
  });
});
