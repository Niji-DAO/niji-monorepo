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

  it('rerender updates children text', () => {
    const { container, rerender } = render(<AuctionActivityWrapper>first</AuctionActivityWrapper>);
    expect(container.textContent).toBe('first');
    rerender(<AuctionActivityWrapper>second</AuctionActivityWrapper>);
    expect(container.textContent).toBe('second');
  });

  it('multiple instances render independently', () => {
    const { container } = render(
      <>
        <AuctionActivityWrapper>a</AuctionActivityWrapper>
        <AuctionActivityWrapper>b</AuctionActivityWrapper>
      </>,
    );
    expect(container.querySelectorAll('div').length).toBe(2);
    expect(container.textContent).toContain('a');
    expect(container.textContent).toContain('b');
  });

  it('unicode children render verbatim', () => {
    const { container } = render(<AuctionActivityWrapper>こんにちは</AuctionActivityWrapper>);
    expect(container.querySelector('div')?.textContent).toBe('こんにちは');
  });

  it('0 children renders as "0"', () => {
    const { container } = render(<AuctionActivityWrapper>{0}</AuctionActivityWrapper>);
    expect(container.querySelector('div')?.textContent).toBe('0');
  });

  it('mixed text + element children render', () => {
    const { container } = render(
      <AuctionActivityWrapper>
        text-<strong>strong</strong>
      </AuctionActivityWrapper>,
    );
    expect(container.querySelector('strong')?.textContent).toBe('strong');
    expect(container.textContent).toContain('text-');
  });

  it('all instances share same className', () => {
    const { container } = render(
      <>
        <AuctionActivityWrapper>a</AuctionActivityWrapper>
        <AuctionActivityWrapper>b</AuctionActivityWrapper>
      </>,
    );
    const divs = container.querySelectorAll('div');
    expect(divs[0].className).toBe(divs[1].className);
  });

  it('emoji children render verbatim', () => {
    const { container } = render(<AuctionActivityWrapper>🎉</AuctionActivityWrapper>);
    expect(container.querySelector('div')?.textContent).toBe('🎉');
  });

  it('5 instances render 5 divs', () => {
    const { container } = render(
      <>
        <AuctionActivityWrapper>1</AuctionActivityWrapper>
        <AuctionActivityWrapper>2</AuctionActivityWrapper>
        <AuctionActivityWrapper>3</AuctionActivityWrapper>
        <AuctionActivityWrapper>4</AuctionActivityWrapper>
        <AuctionActivityWrapper>5</AuctionActivityWrapper>
      </>,
    );
    expect(container.querySelectorAll('div').length).toBe(5);
  });

  it('rerender children type from string to number updates content', () => {
    const { container, rerender } = render(<AuctionActivityWrapper>text</AuctionActivityWrapper>);
    expect(container.textContent).toBe('text');
    rerender(<AuctionActivityWrapper>{42}</AuctionActivityWrapper>);
    expect(container.textContent).toBe('42');
  });

  it('children with special chars (HTML entities)', () => {
    const { container } = render(<AuctionActivityWrapper>{'<>&'}</AuctionActivityWrapper>);
    expect(container.textContent).toBe('<>&');
  });

  it('children renders without errors when only single ReactNode element', () => {
    const { container } = render(
      <AuctionActivityWrapper>
        <span>solo</span>
      </AuctionActivityWrapper>,
    );
    expect(container.querySelector('span')?.textContent).toBe('solo');
  });

  it('renders empty string children', () => {
    const { container } = render(<AuctionActivityWrapper>{''}</AuctionActivityWrapper>);
    expect(container.querySelector('div')?.textContent).toBe('');
  });

  it('renders nested deeply (3 levels)', () => {
    const { container } = render(
      <AuctionActivityWrapper>
        <span>
          <span>
            <span data-testid="deep">deep</span>
          </span>
        </span>
      </AuctionActivityWrapper>,
    );
    expect(container.querySelector('[data-testid="deep"]')?.textContent).toBe('deep');
  });

  it('rerender from text to nested children', () => {
    const { container, rerender } = render(<AuctionActivityWrapper>simple</AuctionActivityWrapper>);
    expect(container.querySelector('div')?.textContent).toBe('simple');
    rerender(
      <AuctionActivityWrapper>
        <span>nested</span>
      </AuctionActivityWrapper>,
    );
    expect(container.querySelector('span')?.textContent).toBe('nested');
  });

  it('renders multiple sibling children', () => {
    const { container } = render(
      <AuctionActivityWrapper>
        <span>A</span>
        <span>B</span>
        <span>C</span>
      </AuctionActivityWrapper>,
    );
    expect(container.querySelectorAll('span').length).toBe(3);
  });

  it('renders 200 char long text content', () => {
    const longStr = 'x'.repeat(200);
    const { container } = render(<AuctionActivityWrapper>{longStr}</AuctionActivityWrapper>);
    expect(container.querySelector('div')?.textContent).toBe(longStr);
  });

  it('renders 10 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 10 }, (_, i) => (
          <AuctionActivityWrapper key={i}>{`item-${i}`}</AuctionActivityWrapper>
        ))}
      </>,
    );
    expect(container.querySelectorAll('div').length).toBe(10);
  });

  it('renders unicode children', () => {
    const { container } = render(<AuctionActivityWrapper>{'日本語テスト'}</AuctionActivityWrapper>);
    expect(container.querySelector('div')?.textContent).toBe('日本語テスト');
  });

  it('renders 1000 char long content', () => {
    const longStr = 'x'.repeat(1000);
    const { container } = render(<AuctionActivityWrapper>{longStr}</AuctionActivityWrapper>);
    expect(container.querySelector('div')?.textContent).toBe(longStr);
  });

  it('rerender same content idempotent', () => {
    const { container, rerender } = render(<AuctionActivityWrapper>same</AuctionActivityWrapper>);
    const initial = container.innerHTML;
    rerender(<AuctionActivityWrapper>same</AuctionActivityWrapper>);
    expect(container.innerHTML).toBe(initial);
  });

  it('renders deeply nested 4 levels', () => {
    const { container } = render(
      <AuctionActivityWrapper>
        <div>
          <span>
            <strong>
              <em data-testid="deep">deep</em>
            </strong>
          </span>
        </div>
      </AuctionActivityWrapper>,
    );
    expect(container.querySelector('[data-testid="deep"]')?.textContent).toBe('deep');
  });

  it('renders 50 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 50 }, (_, i) => (
          <AuctionActivityWrapper key={i}>{`item-${i}`}</AuctionActivityWrapper>
        ))}
      </>,
    );
    expect(container.querySelectorAll('div').length).toBe(50);
  });

  it('handles boolean children (renders empty)', () => {
    const { container } = render(<AuctionActivityWrapper>{true as never}</AuctionActivityWrapper>);
    expect(container.querySelector('div')?.textContent).toBe('');
  });

  it('handles null children', () => {
    const { container } = render(<AuctionActivityWrapper>{null}</AuctionActivityWrapper>);
    expect(container.querySelector('div')?.textContent).toBe('');
  });

  it('renders 2000 char long content', () => {
    const longStr = 'a'.repeat(2000);
    const { container } = render(<AuctionActivityWrapper>{longStr}</AuctionActivityWrapper>);
    expect(container.querySelector('div')?.textContent).toBe(longStr);
  });

  it('rerender preserves max-lg:mx-4 class', () => {
    const { container, rerender } = render(<AuctionActivityWrapper>a</AuctionActivityWrapper>);
    expect(container.querySelector('div')?.className).toContain('max-lg:mx-4');
    rerender(<AuctionActivityWrapper>b</AuctionActivityWrapper>);
    expect(container.querySelector('div')?.className).toContain('max-lg:mx-4');
  });
});
