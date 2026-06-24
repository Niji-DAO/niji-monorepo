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
});
