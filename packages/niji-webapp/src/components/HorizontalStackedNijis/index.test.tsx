import React from 'react';

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/components/Niji', () => ({
  NijiCircular: ({ nounId }: { nounId: bigint }) => (
    <span data-testid="niji-circular">{nounId.toString()}</span>
  ),
}));

import HorizontalStackedNijis from './index';

describe('HorizontalStackedNijis', () => {
  it('renders nothing for empty array', () => {
    const { container } = render(<HorizontalStackedNijis nounIds={[]} />);
    expect(container.querySelectorAll('[data-testid="niji-circular"]').length).toBe(0);
  });

  it('renders all nounIds up to 6', () => {
    const ids = ['1', '2', '3'];
    const { container } = render(<HorizontalStackedNijis nounIds={ids} />);
    expect(container.querySelectorAll('[data-testid="niji-circular"]').length).toBe(3);
  });

  it('caps at 6 elements (slice(0,6))', () => {
    const ids = ['1', '2', '3', '4', '5', '6', '7', '8'];
    const { container } = render(<HorizontalStackedNijis nounIds={ids} />);
    expect(container.querySelectorAll('[data-testid="niji-circular"]').length).toBe(6);
  });

  it('wraps in a div with classes.wrapper', () => {
    const { container } = render(<HorizontalStackedNijis nounIds={['1']} />);
    expect(container.querySelector('div')).not.toBeNull();
  });
});
