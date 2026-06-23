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
});
