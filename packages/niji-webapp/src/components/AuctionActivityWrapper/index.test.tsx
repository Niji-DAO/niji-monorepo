import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import AuctionActivityWrapper from './index';

describe('AuctionActivityWrapper', () => {
  it('renders children inside a div', () => {
    const { container } = render(<AuctionActivityWrapper>hi</AuctionActivityWrapper>);
    const div = container.querySelector('div');
    expect(div?.textContent).toBe('hi');
  });

  it('applies max-lg:mx-4 class', () => {
    const { container } = render(<AuctionActivityWrapper>x</AuctionActivityWrapper>);
    const div = container.querySelector('div');
    expect(div?.className).toContain('max-lg:mx-4');
  });

  it('renders nested elements', () => {
    const { container } = render(
      <AuctionActivityWrapper>
        <span>nested</span>
      </AuctionActivityWrapper>,
    );
    expect(container.querySelector('span')?.textContent).toBe('nested');
  });
});
