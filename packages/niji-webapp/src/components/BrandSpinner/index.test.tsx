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
});
