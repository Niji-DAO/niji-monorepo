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

  it('cool color differs from warm color', () => {
    const { container: cool } = render(<AuctionActivityNijiTitle nounId={1n} isCool={true} />);
    const { container: warm } = render(<AuctionActivityNijiTitle nounId={1n} isCool={false} />);
    expect(cool.querySelector('h1')?.getAttribute('style')).not.toBe(
      warm.querySelector('h1')?.getAttribute('style'),
    );
  });

  it('rerender with new nounId updates h1 text', () => {
    const { container, rerender } = render(<AuctionActivityNijiTitle nounId={1n} />);
    expect(container.querySelector('h1')?.textContent).toContain('1');
    rerender(<AuctionActivityNijiTitle nounId={999n} />);
    expect(container.querySelector('h1')?.textContent).toContain('999');
  });

  it('multiple instances render independently with different nounIds', () => {
    const { container } = render(
      <>
        <AuctionActivityNijiTitle nounId={1n} />
        <AuctionActivityNijiTitle nounId={2n} />
      </>,
    );
    const h1s = container.querySelectorAll('h1');
    expect(h1s.length).toBe(2);
    expect(h1s[0].textContent).toContain('1');
    expect(h1s[1].textContent).toContain('2');
  });

  it('handles 100n nounId', () => {
    const { container } = render(<AuctionActivityNijiTitle nounId={100n} />);
    expect(container.querySelector('h1')?.textContent).toContain('100');
  });

  it('isCool=true keeps Niji prefix text visible', () => {
    const { container } = render(<AuctionActivityNijiTitle nounId={42n} isCool={true} />);
    expect(container.querySelector('h1')?.textContent).toContain('Niji');
    expect(container.querySelector('h1')?.textContent).toContain('42');
  });

  it('rerender from isCool=true to false switches color', () => {
    const { container, rerender } = render(<AuctionActivityNijiTitle nounId={1n} isCool={true} />);
    expect(container.querySelector('h1')?.getAttribute('style')).toContain('cool');
    rerender(<AuctionActivityNijiTitle nounId={1n} isCool={false} />);
    expect(container.querySelector('h1')?.getAttribute('style')).toContain('warm');
  });

  it('5 instances render 5 h1 elements', () => {
    const { container } = render(
      <>
        <AuctionActivityNijiTitle nounId={1n} />
        <AuctionActivityNijiTitle nounId={2n} />
        <AuctionActivityNijiTitle nounId={3n} />
        <AuctionActivityNijiTitle nounId={4n} />
        <AuctionActivityNijiTitle nounId={5n} />
      </>,
    );
    expect(container.querySelectorAll('h1').length).toBe(5);
  });

  it('div wrapper renders only 1 element', () => {
    const { container } = render(<AuctionActivityNijiTitle nounId={1n} />);
    expect(container.querySelectorAll('div').length).toBe(1);
  });

  it('h1 className is non-empty', () => {
    const { container } = render(<AuctionActivityNijiTitle nounId={1n} />);
    expect(container.querySelector('h1')?.className).toBeTruthy();
  });

  it('rerender from large to small nounId reduces text', () => {
    const { container, rerender } = render(<AuctionActivityNijiTitle nounId={9999n} />);
    expect(container.querySelector('h1')?.textContent).toContain('9999');
    rerender(<AuctionActivityNijiTitle nounId={1n} />);
    expect(container.querySelector('h1')?.textContent).toContain('1');
    expect(container.querySelector('h1')?.textContent).not.toContain('9999');
  });

  it('1000n nounId renders as "1000"', () => {
    const { container } = render(<AuctionActivityNijiTitle nounId={1000n} />);
    expect(container.querySelector('h1')?.textContent).toContain('1000');
  });

  it('h1 style attribute always has color CSS variable reference', () => {
    const { container } = render(<AuctionActivityNijiTitle nounId={1n} isCool={true} />);
    expect(container.querySelector('h1')?.getAttribute('style')).toContain('color');
  });

  it('renders without crash for negative nounId (-1n)', () => {
    expect(() => render(<AuctionActivityNijiTitle nounId={-1n as never} />)).not.toThrow();
  });

  it('rerender preserves Niji prefix text', () => {
    const { container, rerender } = render(<AuctionActivityNijiTitle nounId={1n} />);
    expect(container.querySelector('h1')?.textContent).toContain('Niji');
    rerender(<AuctionActivityNijiTitle nounId={2n} />);
    expect(container.querySelector('h1')?.textContent).toContain('Niji');
  });

  it('isCool=undefined defaults to warm color', () => {
    const { container } = render(<AuctionActivityNijiTitle nounId={1n} />);
    expect(container.querySelector('h1')?.getAttribute('style')).toContain('warm');
  });

  it('rerender from large to 0 nounId updates text', () => {
    const { container, rerender } = render(<AuctionActivityNijiTitle nounId={999n} />);
    expect(container.querySelector('h1')?.textContent).toContain('999');
    rerender(<AuctionActivityNijiTitle nounId={0n} />);
    expect(container.querySelector('h1')?.textContent).toContain('0');
  });
});
