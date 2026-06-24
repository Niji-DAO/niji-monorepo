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
});
