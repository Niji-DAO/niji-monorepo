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

  it('renders numeric children as string', () => {
    const { container } = render(<AuctionActivityWrapper>{42}</AuctionActivityWrapper>);
    expect(container.querySelector('div')?.textContent).toBe('42');
  });

  it('renders array children concatenated', () => {
    const { container } = render(
      <AuctionActivityWrapper>{['a', 'b', 'c']}</AuctionActivityWrapper>,
    );
    expect(container.querySelector('div')?.textContent).toBe('abc');
  });

  it('renders Fragment children unwrapped', () => {
    const { container } = render(
      <AuctionActivityWrapper>
        <>
          <span>x</span>
          <span>y</span>
        </>
      </AuctionActivityWrapper>,
    );
    expect(container.querySelectorAll('span').length).toBe(2);
  });

  it('outermost wrapper is a single <div>', () => {
    const { container } = render(<AuctionActivityWrapper>x</AuctionActivityWrapper>);
    expect(container.children.length).toBe(1);
    expect(container.firstElementChild?.tagName).toBe('DIV');
  });

  it('className matches Tailwind utility exactly (max-lg:mx-4, no extras)', () => {
    const { container } = render(<AuctionActivityWrapper>x</AuctionActivityWrapper>);
    expect(container.querySelector('div')?.className).toBe('max-lg:mx-4');
  });

  it('renders null children as empty content (no crash)', () => {
    const { container } = render(<AuctionActivityWrapper>{null}</AuctionActivityWrapper>);
    expect(container.querySelector('div')?.textContent).toBe('');
  });

  it('renders empty string children gracefully', () => {
    const { container } = render(<AuctionActivityWrapper>{''}</AuctionActivityWrapper>);
    expect(container.querySelector('div')?.textContent).toBe('');
  });

  it('renders boolean false as empty (React behavior)', () => {
    const { container } = render(<AuctionActivityWrapper>{false}</AuctionActivityWrapper>);
    expect(container.querySelector('div')?.textContent).toBe('');
  });

  it('renders large 1000-char string content', () => {
    const long = 'a'.repeat(1000);
    const { container } = render(<AuctionActivityWrapper>{long}</AuctionActivityWrapper>);
    expect(container.querySelector('div')?.textContent?.length).toBe(1000);
  });

  it('renders multiple sibling children correctly', () => {
    const { container } = render(
      <AuctionActivityWrapper>
        <p>a</p>
        <p>b</p>
        <p>c</p>
      </AuctionActivityWrapper>,
    );
    expect(container.querySelectorAll('p').length).toBe(3);
  });

  it('renders deeply nested element tree', () => {
    const { container } = render(
      <AuctionActivityWrapper>
        <div data-testid="outer">
          <div>
            <span data-testid="inner">deep</span>
          </div>
        </div>
      </AuctionActivityWrapper>,
    );
    expect(container.querySelector('[data-testid="inner"]')?.textContent).toBe('deep');
  });
});
