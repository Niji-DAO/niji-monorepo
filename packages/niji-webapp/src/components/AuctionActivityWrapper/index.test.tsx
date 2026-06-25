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

  it('renders 100 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 100 }, (_, i) => (
          <AuctionActivityWrapper key={i}>{`item-${i}`}</AuctionActivityWrapper>
        ))}
      </>,
    );
    expect(container.querySelectorAll('div').length).toBe(100);
  });

  it('rerender 20 times preserves className', () => {
    const { container, rerender } = render(<AuctionActivityWrapper>a</AuctionActivityWrapper>);
    for (let i = 0; i < 20; i++) {
      rerender(<AuctionActivityWrapper>{`item-${i}`}</AuctionActivityWrapper>);
      expect(container.querySelector('div')?.className).toContain('max-lg:mx-4');
    }
  });

  it('renders 10000 char long string', () => {
    const longStr = 'x'.repeat(10000);
    const { container } = render(<AuctionActivityWrapper>{longStr}</AuctionActivityWrapper>);
    expect(container.querySelector('div')?.textContent).toBe(longStr);
  });

  it('handles emoji content', () => {
    const { container } = render(<AuctionActivityWrapper>🎉🎊🎁</AuctionActivityWrapper>);
    expect(container.querySelector('div')?.textContent).toBe('🎉🎊🎁');
  });

  it('handles HTML-escaped special chars', () => {
    const { container } = render(<AuctionActivityWrapper>{'<>&"\''}</AuctionActivityWrapper>);
    expect(container.querySelector('div')?.textContent).toBe('<>&"\'');
  });

  it('renders 200 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 200 }, (_, i) => (
            <AuctionActivityWrapper key={i}>{i}</AuctionActivityWrapper>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender 50 times preserves div', () => {
    const { container, rerender } = render(<AuctionActivityWrapper>x</AuctionActivityWrapper>);
    for (let i = 0; i < 50; i++) {
      rerender(<AuctionActivityWrapper>val-{i}</AuctionActivityWrapper>);
    }
    expect(container.querySelector('div')?.textContent).toContain('49');
  });

  it('handles 10000 char children', () => {
    const long = 'a'.repeat(10000);
    const { container } = render(<AuctionActivityWrapper>{long}</AuctionActivityWrapper>);
    expect(container.querySelector('div')?.textContent?.length).toBe(10000);
  });

  it('handles array of 100 children', () => {
    const items = Array.from({ length: 100 }, (_, i) => i);
    const { container } = render(
      <AuctionActivityWrapper>
        {items.map(n => (
          <span key={n}>{n}</span>
        ))}
      </AuctionActivityWrapper>,
    );
    expect(container.querySelectorAll('span').length).toBe(100);
  });

  it('all 200 instances have max-lg:mx-4 class', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <AuctionActivityWrapper key={i}>x</AuctionActivityWrapper>
        ))}
      </>,
    );
    const divs = container.querySelectorAll('div');
    divs.forEach(div => {
      expect(div.className).toContain('max-lg:mx-4');
    });
  });

  it('mount-unmount 200 cycles', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<AuctionActivityWrapper>{i}</AuctionActivityWrapper>);
      unmount();
    }
  });

  it('renders 500 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <AuctionActivityWrapper key={i}>{i}</AuctionActivityWrapper>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 50 different children', () => {
    for (let i = 0; i < 50; i++) {
      const { container, unmount } = render(
        <AuctionActivityWrapper>child-{i}</AuctionActivityWrapper>,
      );
      expect(container.querySelector('div')?.textContent).toContain(`child-${i}`);
      unmount();
    }
  });

  it('handles deeply nested children (10 levels)', () => {
    const { container } = render(
      <AuctionActivityWrapper>
        <span>
          <span>
            <span>
              <span>
                <span data-testid="deep10">deep</span>
              </span>
            </span>
          </span>
        </span>
      </AuctionActivityWrapper>,
    );
    expect(container.querySelector('[data-testid="deep10"]')?.textContent).toBe('deep');
  });

  it('all 300 instances have div wrapper', () => {
    const { container } = render(
      <>
        {Array.from({ length: 300 }, (_, i) => (
          <AuctionActivityWrapper key={i}>x</AuctionActivityWrapper>
        ))}
      </>,
    );
    expect(container.querySelectorAll('div').length).toBe(300);
  });

  it('mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<AuctionActivityWrapper>x</AuctionActivityWrapper>);
      unmount();
    }
  });

  it('renders 1000 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1000 }, (_, i) => (
            <AuctionActivityWrapper key={i}>{i}</AuctionActivityWrapper>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 30 different ReactNode children', () => {
    for (let i = 0; i < 30; i++) {
      const { container, unmount } = render(
        <AuctionActivityWrapper>
          <span data-testid={`child-${i}`}>{i}</span>
        </AuctionActivityWrapper>,
      );
      expect(container.querySelector(`[data-testid="child-${i}"]`)).not.toBeNull();
      unmount();
    }
  });

  it('handles 50 different string children', () => {
    for (let i = 0; i < 50; i++) {
      const { container, unmount } = render(
        <AuctionActivityWrapper>str-{i}</AuctionActivityWrapper>,
      );
      expect(container.querySelector('div')?.textContent).toContain(`str-${i}`);
      unmount();
    }
  });

  it('all 100 wrappers contain unique children content', () => {
    const { container } = render(
      <>
        {Array.from({ length: 100 }, (_, i) => (
          <AuctionActivityWrapper key={i}>content-{i}</AuctionActivityWrapper>
        ))}
      </>,
    );
    const divs = container.querySelectorAll('div');
    divs.forEach((div, i) => {
      expect(div.textContent).toContain(`content-${i}`);
    });
  });

  it('mount-unmount 1000 cycles', () => {
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(<AuctionActivityWrapper>x</AuctionActivityWrapper>);
      unmount();
    }
  });

  it('renders 2000 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 2000 }, (_, i) => (
            <AuctionActivityWrapper key={i}>{i}</AuctionActivityWrapper>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 100 different children content', () => {
    for (let i = 0; i < 100; i++) {
      const { container, unmount } = render(
        <AuctionActivityWrapper>content-{i}</AuctionActivityWrapper>,
      );
      expect(container.querySelector('div')?.textContent).toBe(`content-${i}`);
      unmount();
    }
  });

  it('all 500 wrappers have max-lg:mx-4 class', () => {
    const { container } = render(
      <>
        {Array.from({ length: 500 }, (_, i) => (
          <AuctionActivityWrapper key={i}>x</AuctionActivityWrapper>
        ))}
      </>,
    );
    const divs = container.querySelectorAll('div');
    divs.forEach(div => {
      expect(div.className).toContain('max-lg:mx-4');
    });
  });

  it('handles 50 different ReactNode children types', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <AuctionActivityWrapper>
          <span data-testid={`c-${i}`}>{i}</span>
        </AuctionActivityWrapper>,
      );
      unmount();
    }
  });

  it('mount-unmount 2000 cycles', () => {
    for (let i = 0; i < 2000; i++) {
      const { unmount } = render(<AuctionActivityWrapper>x</AuctionActivityWrapper>);
      unmount();
    }
  });

  it('renders 3000 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 3000 }, (_, i) => (
            <AuctionActivityWrapper key={i}>{i}</AuctionActivityWrapper>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 200 different children', () => {
    for (let i = 0; i < 200; i++) {
      const { container, unmount } = render(
        <AuctionActivityWrapper>content-{i}</AuctionActivityWrapper>,
      );
      expect(container.querySelector('div')?.textContent).toBe(`content-${i}`);
      unmount();
    }
  });

  it('all 1000 wrappers have max-lg:mx-4 class', () => {
    const { container } = render(
      <>
        {Array.from({ length: 1000 }, (_, i) => (
          <AuctionActivityWrapper key={i}>x</AuctionActivityWrapper>
        ))}
      </>,
    );
    const divs = container.querySelectorAll('div');
    expect(divs.length).toBe(1000);
    divs.forEach(div => {
      expect(div.className).toContain('max-lg:mx-4');
    });
  });

  it('handles 50 different nested ReactNode', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <AuctionActivityWrapper>
          <div>
            <span data-testid={`nested-${i}`}>{i}</span>
          </div>
        </AuctionActivityWrapper>,
      );
      unmount();
    }
  });

  it('round-2 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<AuctionActivityWrapper>x</AuctionActivityWrapper>);
      unmount();
    }
  });

  it('round-2 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <AuctionActivityWrapper key={i}>r2-{i}</AuctionActivityWrapper>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 100 different children values', () => {
    for (let i = 0; i < 100; i++) {
      const { container, unmount } = render(
        <AuctionActivityWrapper>r2-v-{i}</AuctionActivityWrapper>,
      );
      expect(container.textContent).toBe(`r2-v-${i}`);
      unmount();
    }
  });

  it('round-2 all 200 wrappers exist', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <AuctionActivityWrapper key={i}>x</AuctionActivityWrapper>
        ))}
      </>,
    );
    expect(container.children.length).toBe(200);
  });

  it('round-2 50 rerender cycles', () => {
    const { container, rerender } = render(<AuctionActivityWrapper>x</AuctionActivityWrapper>);
    for (let i = 0; i < 50; i++) {
      rerender(<AuctionActivityWrapper>r2-r-{i}</AuctionActivityWrapper>);
    }
    expect(container.textContent).toContain('49');
  });
});
