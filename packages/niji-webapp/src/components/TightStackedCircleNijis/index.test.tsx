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
});
