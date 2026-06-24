import React from 'react';

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import AuctionActivityNijiTitle from './index';

describe('AuctionActivityNijiTitle', () => {
  it('renders Niji id in h1', () => {
    const { container } = render(<AuctionActivityNijiTitle nounId={42n} />);
    expect(container.querySelector('h1')?.textContent).toContain('42');
  });

  it('renders Niji prefix text', () => {
    const { container } = render(<AuctionActivityNijiTitle nounId={1n} />);
    expect(container.querySelector('h1')?.textContent).toContain('Niji');
  });

  it('uses cool color when isCool=true', () => {
    const { container } = render(<AuctionActivityNijiTitle nounId={1n} isCool={true} />);
    expect(container.querySelector('h1')?.getAttribute('style')).toContain('brand-cool-dark-text');
  });

  it('uses warm color when isCool=false', () => {
    const { container } = render(<AuctionActivityNijiTitle nounId={1n} isCool={false} />);
    expect(container.querySelector('h1')?.getAttribute('style')).toContain('brand-warm-dark-text');
  });

  it('defaults to warm color when isCool undefined', () => {
    const { container } = render(<AuctionActivityNijiTitle nounId={1n} />);
    expect(container.querySelector('h1')?.getAttribute('style')).toContain('brand-warm-dark-text');
  });

  it('handles 0n nounId', () => {
    const { container } = render(<AuctionActivityNijiTitle nounId={0n} />);
    expect(container.querySelector('h1')?.textContent).toContain('0');
  });

  it('handles MAX_SAFE_INTEGER bigint', () => {
    const huge = 9_007_199_254_740_991n;
    const { container } = render(<AuctionActivityNijiTitle nounId={huge} />);
    expect(container.querySelector('h1')?.textContent).toContain(huge.toString());
  });

  it('renders exactly 1 h1 element', () => {
    const { container } = render(<AuctionActivityNijiTitle nounId={1n} />);
    expect(container.querySelectorAll('h1').length).toBe(1);
  });

  it('outermost wrapper is a single <div>', () => {
    const { container } = render(<AuctionActivityNijiTitle nounId={1n} />);
    expect(container.children.length).toBe(1);
    expect(container.firstElementChild?.tagName).toBe('DIV');
  });

  it('h1 always has style attribute with color property', () => {
    const { container: cool } = render(<AuctionActivityNijiTitle nounId={1n} isCool={true} />);
    const { container: warm } = render(<AuctionActivityNijiTitle nounId={1n} isCool={false} />);
    expect(cool.querySelector('h1')?.getAttribute('style')).toContain('color');
    expect(warm.querySelector('h1')?.getAttribute('style')).toContain('color');
  });
});
