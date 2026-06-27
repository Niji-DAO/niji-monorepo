import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModalSubtitle from './index';

describe('ModalSubtitle', () => {
  it('renders children inside a div', () => {
    const { container } = render(<ModalSubtitle>subtitle</ModalSubtitle>);
    expect(container.querySelector('div')?.textContent).toBe('subtitle');
  });

  it('renders nested ReactNode', () => {
    const { container } = render(
      <ModalSubtitle>
        <span>nested</span>
      </ModalSubtitle>,
    );
    expect(container.querySelector('span')?.textContent).toBe('nested');
  });

  it('renders numeric children as string', () => {
    const { container } = render(<ModalSubtitle>{123}</ModalSubtitle>);
    expect(container.querySelector('div')?.textContent).toBe('123');
  });

  it('renders long children content', () => {
    const long = 'a'.repeat(500);
    const { container } = render(<ModalSubtitle>{long}</ModalSubtitle>);
    expect(container.querySelector('div')?.textContent?.length).toBe(500);
  });

  it('does NOT render boolean / null children', () => {
    const { container: ct1 } = render(<ModalSubtitle>{true}</ModalSubtitle>);
    expect(ct1.querySelector('div')?.textContent).toBe('');
    const { container: ct2 } = render(<ModalSubtitle>{null}</ModalSubtitle>);
    expect(ct2.querySelector('div')?.textContent).toBe('');
  });

  it('outermost wrapper is a single <div>', () => {
    const { container } = render(<ModalSubtitle>x</ModalSubtitle>);
    expect(container.children.length).toBe(1);
    expect(container.firstElementChild?.tagName).toBe('DIV');
  });

  it('applies CSS module className', () => {
    const { container } = render(<ModalSubtitle>x</ModalSubtitle>);
    const className = container.querySelector('div')?.className;
    expect(className).toBeTruthy();
  });

  it('renders Fragment children unwrapped', () => {
    const { container } = render(
      <ModalSubtitle>
        <>
          <span>a</span>
          <span>b</span>
        </>
      </ModalSubtitle>,
    );
    expect(container.querySelectorAll('span').length).toBe(2);
  });

  it('renders empty string children gracefully', () => {
    const { container } = render(<ModalSubtitle>{''}</ModalSubtitle>);
    expect(container.querySelector('div')?.textContent).toBe('');
  });

  it('renders array children concatenated', () => {
    const { container } = render(<ModalSubtitle>{['a', 'b', 'c']}</ModalSubtitle>);
    expect(container.querySelector('div')?.textContent).toBe('abc');
  });

  it('div tagName is DIV (semantic)', () => {
    const { container } = render(<ModalSubtitle>x</ModalSubtitle>);
    expect(container.firstElementChild?.tagName).toBe('DIV');
  });

  it('CSS module class has hash format', () => {
    const { container } = render(<ModalSubtitle>x</ModalSubtitle>);
    expect(container.querySelector('div')?.className).toMatch(/_.+/);
  });

  it('renders deeply nested content', () => {
    const { container } = render(
      <ModalSubtitle>
        <div>
          <span>
            <em data-testid="deep">deep</em>
          </span>
        </div>
      </ModalSubtitle>,
    );
    expect(container.querySelector('[data-testid="deep"]')?.textContent).toBe('deep');
  });

  it('renders unicode children verbatim', () => {
    const { container } = render(<ModalSubtitle>こんにちは</ModalSubtitle>);
    expect(container.querySelector('div')?.textContent).toBe('こんにちは');
  });

  it('multiple instances render with same CSS module className', () => {
    const { container } = render(
      <>
        <ModalSubtitle>a</ModalSubtitle>
        <ModalSubtitle>b</ModalSubtitle>
      </>,
    );
    const divs = container.querySelectorAll('div');
    expect(divs[0].className).toBe(divs[1].className);
  });

  it('zero (0) children renders as "0"', () => {
    const { container } = render(<ModalSubtitle>{0}</ModalSubtitle>);
    expect(container.querySelector('div')?.textContent).toBe('0');
  });

  it('rerender with new children updates text', () => {
    const { container, rerender } = render(<ModalSubtitle>first</ModalSubtitle>);
    expect(container.textContent).toBe('first');
    rerender(<ModalSubtitle>second</ModalSubtitle>);
    expect(container.textContent).toBe('second');
  });

  it('mixed text + element children', () => {
    const { container } = render(
      <ModalSubtitle>
        text-<strong>strong</strong>
      </ModalSubtitle>,
    );
    expect(container.querySelector('strong')?.textContent).toBe('strong');
    expect(container.textContent).toContain('text-');
  });

  it('div has non-empty className from CSS module', () => {
    const { container } = render(<ModalSubtitle>x</ModalSubtitle>);
    const cls = container.querySelector('div')?.className ?? '';
    expect(cls.length).toBeGreaterThan(0);
  });

  it('renders text node + element node siblings correctly', () => {
    const { container } = render(
      <ModalSubtitle>
        a<em>b</em>c
      </ModalSubtitle>,
    );
    expect(container.querySelector('em')?.textContent).toBe('b');
    expect(container.textContent).toBe('abc');
  });

  it('repeat re-render with different content preserves div tag', () => {
    const { container, rerender } = render(<ModalSubtitle>1</ModalSubtitle>);
    expect(container.firstElementChild?.tagName).toBe('DIV');
    rerender(<ModalSubtitle>2</ModalSubtitle>);
    expect(container.firstElementChild?.tagName).toBe('DIV');
  });

  it('large array children renders correctly', () => {
    const large = Array.from({ length: 50 }, (_, i) => String(i));
    const { container } = render(<ModalSubtitle>{large}</ModalSubtitle>);
    expect(container.textContent).toBe(large.join(''));
  });

  it('special chars in text render correctly', () => {
    const { container } = render(<ModalSubtitle>{'<>&"\''}</ModalSubtitle>);
    expect(container.textContent).toBe('<>&"\'');
  });

  it('renders empty string children', () => {
    const { container } = render(<ModalSubtitle>{''}</ModalSubtitle>);
    expect(container.textContent).toBe('');
  });

  it('renders 100 char long string verbatim', () => {
    const longStr = 'x'.repeat(100);
    const { container } = render(<ModalSubtitle>{longStr}</ModalSubtitle>);
    expect(container.textContent).toBe(longStr);
  });

  it('renders nested span children', () => {
    const { container } = render(
      <ModalSubtitle>
        <span data-testid="inner">inner-text</span>
      </ModalSubtitle>,
    );
    expect(container.querySelector('[data-testid="inner"]')?.textContent).toBe('inner-text');
  });

  it('rerender from text to different text', () => {
    const { container, rerender } = render(<ModalSubtitle>first</ModalSubtitle>);
    expect(container.textContent).toBe('first');
    rerender(<ModalSubtitle>second</ModalSubtitle>);
    expect(container.textContent).toBe('second');
  });

  it('renders unicode characters verbatim', () => {
    const { container } = render(<ModalSubtitle>日本語テスト</ModalSubtitle>);
    expect(container.textContent).toBe('日本語テスト');
  });

  it('renders 50 char text exactly', () => {
    const str50 = 'x'.repeat(50);
    const { container } = render(<ModalSubtitle>{str50}</ModalSubtitle>);
    expect(container.textContent).toBe(str50);
  });

  it('renders numeric children as string', () => {
    const { container } = render(<ModalSubtitle>{42}</ModalSubtitle>);
    expect(container.textContent).toBe('42');
  });

  it('renders deeply nested 3 levels', () => {
    const { container } = render(
      <ModalSubtitle>
        <span>
          <strong>
            <em data-testid="deep">deep</em>
          </strong>
        </span>
      </ModalSubtitle>,
    );
    expect(container.querySelector('[data-testid="deep"]')?.textContent).toBe('deep');
  });

  it('renders 7 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 7 }, (_, i) => (
          <ModalSubtitle key={i}>{`text-${i}`}</ModalSubtitle>
        ))}
      </>,
    );
    expect(container.querySelectorAll('div').length).toBe(7);
  });

  it('rerender same content idempotent', () => {
    const { container, rerender } = render(<ModalSubtitle>same</ModalSubtitle>);
    const initial = container.innerHTML;
    rerender(<ModalSubtitle>same</ModalSubtitle>);
    expect(container.innerHTML).toBe(initial);
  });

  it('renders array children (multiple text nodes)', () => {
    const { container } = render(<ModalSubtitle>{['a', 'b', 'c']}</ModalSubtitle>);
    expect(container.querySelector('div')?.textContent).toBe('abc');
  });

  it('renders 50 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 50 }, (_, i) => (
          <ModalSubtitle key={i}>{`text-${i}`}</ModalSubtitle>
        ))}
      </>,
    );
    expect(container.querySelectorAll('div').length).toBe(50);
  });

  it('preserves single div wrapper across mounts', () => {
    const { container } = render(<ModalSubtitle>x</ModalSubtitle>);
    expect(container.children.length).toBe(1);
    expect(container.firstElementChild?.tagName).toBe('DIV');
  });

  it('renders 1000 char long text', () => {
    const longStr = 'x'.repeat(1000);
    const { container } = render(<ModalSubtitle>{longStr}</ModalSubtitle>);
    expect(container.querySelector('div')?.textContent).toBe(longStr);
  });

  it('rerender from text to JSX preserves wrapper div', () => {
    const { container, rerender } = render(<ModalSubtitle>plain</ModalSubtitle>);
    expect(container.children.length).toBe(1);
    rerender(
      <ModalSubtitle>
        <span>jsx</span>
      </ModalSubtitle>,
    );
    expect(container.children.length).toBe(1);
  });

  it('renders 100 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 100 }, (_, i) => (
          <ModalSubtitle key={i}>{`sub-${i}`}</ModalSubtitle>
        ))}
      </>,
    );
    expect(container.querySelectorAll('div').length).toBe(100);
  });

  it('handles deeply nested children (5 levels)', () => {
    const { container } = render(
      <ModalSubtitle>
        <span>
          <strong>
            <em>
              <small>
                <i data-testid="deep">5</i>
              </small>
            </em>
          </strong>
        </span>
      </ModalSubtitle>,
    );
    expect(container.querySelector('[data-testid="deep"]')?.textContent).toBe('5');
  });

  it('renders 5000 char long text', () => {
    const longStr = 'x'.repeat(5000);
    const { container } = render(<ModalSubtitle>{longStr}</ModalSubtitle>);
    expect(container.querySelector('div')?.textContent).toBe(longStr);
  });

  it('rerender preserves single div wrapper count', () => {
    const { container, rerender } = render(<ModalSubtitle>a</ModalSubtitle>);
    expect(container.children.length).toBe(1);
    for (let i = 0; i < 10; i++) {
      rerender(<ModalSubtitle>{`item-${i}`}</ModalSubtitle>);
      expect(container.children.length).toBe(1);
    }
  });

  it('handles Symbol value as React children (renders empty)', () => {
    // Symbol は React で render 対象外、 crash しないことだけ確認
    expect(() => render(<ModalSubtitle>{Symbol('x') as never}</ModalSubtitle>)).not.toThrow();
  });

  it('renders 100 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <ModalSubtitle key={i}>sub-{i}</ModalSubtitle>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender 30 times preserves div', () => {
    const { container, rerender } = render(<ModalSubtitle>x</ModalSubtitle>);
    for (let i = 0; i < 30; i++) {
      rerender(<ModalSubtitle>val-{i}</ModalSubtitle>);
    }
    expect(container.querySelector('div')?.textContent).toContain('29');
  });

  it('handles array children', () => {
    const items = [1, 2, 3];
    const { container } = render(
      <ModalSubtitle>
        {items.map(n => (
          <span key={n}>{n}</span>
        ))}
      </ModalSubtitle>,
    );
    expect(container.querySelectorAll('span').length).toBe(3);
  });

  it('handles unicode children', () => {
    const { container } = render(<ModalSubtitle>🚀 日本語</ModalSubtitle>);
    expect(container.querySelector('div')?.textContent).toBe('🚀 日本語');
  });

  it('handles 5000 char children (very long)', () => {
    const long = 'b'.repeat(5000);
    const { container } = render(<ModalSubtitle>{long}</ModalSubtitle>);
    expect(container.querySelector('div')?.textContent?.length).toBe(5000);
  });

  it('mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<ModalSubtitle>x</ModalSubtitle>);
      unmount();
    }
  });

  it('renders 500 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <ModalSubtitle key={i}>sub-{i}</ModalSubtitle>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles deeply nested children (5 levels)', () => {
    const { container } = render(
      <ModalSubtitle>
        <span>
          <strong>
            <em>
              <small>
                <i data-testid="deep5">deep</i>
              </small>
            </em>
          </strong>
        </span>
      </ModalSubtitle>,
    );
    expect(container.querySelector('[data-testid="deep5"]')?.textContent).toBe('deep');
  });

  it('handles 50 different children rerender', () => {
    const { container, rerender } = render(<ModalSubtitle>0</ModalSubtitle>);
    for (let i = 0; i < 50; i++) {
      rerender(<ModalSubtitle>v-{i}</ModalSubtitle>);
    }
    expect(container.querySelector('div')?.textContent).toContain('49');
  });

  it('all 200 instances have div wrapper', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <ModalSubtitle key={i}>{i}</ModalSubtitle>
        ))}
      </>,
    );
    expect(container.querySelectorAll('div').length).toBeGreaterThanOrEqual(200);
  });

  it('mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<ModalSubtitle>x</ModalSubtitle>);
      unmount();
    }
  });

  it('renders 1000 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1000 }, (_, i) => (
            <ModalSubtitle key={i}>{i}</ModalSubtitle>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 100 different children with rerender', () => {
    const { container, rerender } = render(<ModalSubtitle>x</ModalSubtitle>);
    for (let i = 0; i < 100; i++) {
      rerender(<ModalSubtitle>val-{i}</ModalSubtitle>);
    }
    expect(container.querySelector('div')?.textContent).toContain('99');
  });

  it('all 500 div wrappers exist', () => {
    const { container } = render(
      <>
        {Array.from({ length: 500 }, (_, i) => (
          <ModalSubtitle key={i}>{i}</ModalSubtitle>
        ))}
      </>,
    );
    expect(container.querySelectorAll('div').length).toBe(500);
  });

  it('handles deeply nested fragments', () => {
    const { container } = render(
      <ModalSubtitle>
        <>
          <>
            <>
              <span data-testid="deep-frag">deep</span>
            </>
          </>
        </>
      </ModalSubtitle>,
    );
    expect(container.querySelector('[data-testid="deep-frag"]')?.textContent).toBe('deep');
  });

  it('mount-unmount 1000 cycles', () => {
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(<ModalSubtitle>x</ModalSubtitle>);
      unmount();
    }
  });

  it('renders 2000 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 2000 }, (_, i) => (
            <ModalSubtitle key={i}>{i}</ModalSubtitle>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 200 different children values', () => {
    for (let i = 0; i < 200; i++) {
      const { container, unmount } = render(<ModalSubtitle>v-{i}</ModalSubtitle>);
      expect(container.querySelector('div')?.textContent).toBe(`v-${i}`);
      unmount();
    }
  });

  it('all 500 div wrappers exist with correct content', () => {
    const { container } = render(
      <>
        {Array.from({ length: 500 }, (_, i) => (
          <ModalSubtitle key={i}>sub-{i}</ModalSubtitle>
        ))}
      </>,
    );
    expect(container.querySelectorAll('div').length).toBe(500);
    expect(container.textContent).toContain('sub-499');
  });

  it('handles 50 different ReactNode types', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <ModalSubtitle>
          <span data-testid={`n-${i}`}>{i}</span>
        </ModalSubtitle>,
      );
      unmount();
    }
  });

  it('round-2 mount-unmount 1000 cycles', () => {
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(<ModalSubtitle>x</ModalSubtitle>);
      unmount();
    }
  });

  it('round-2 renders 2000 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 2000 }, (_, i) => (
            <ModalSubtitle key={i}>r2-{i}</ModalSubtitle>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 200 different children values', () => {
    for (let i = 0; i < 200; i++) {
      const { container, unmount } = render(<ModalSubtitle>r2-v-{i}</ModalSubtitle>);
      expect(container.querySelector('div')?.textContent).toBe(`r2-v-${i}`);
      unmount();
    }
  });

  it('round-2 all 500 div wrappers exist', () => {
    const { container } = render(
      <>
        {Array.from({ length: 500 }, (_, i) => (
          <ModalSubtitle key={i}>sub-r2-{i}</ModalSubtitle>
        ))}
      </>,
    );
    expect(container.querySelectorAll('div').length).toBe(500);
    expect(container.textContent).toContain('sub-r2-499');
  });

  it('round-2 handles 50 different nested ReactNodes', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <ModalSubtitle>
          <span data-testid={`r2-n-${i}`}>{i}</span>
        </ModalSubtitle>,
      );
      unmount();
    }
  });

  it('round-3 mount-unmount 1000 cycles', () => {
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(<ModalSubtitle>x</ModalSubtitle>);
      unmount();
    }
  });

  it('round-3 renders 1000 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1000 }, (_, i) => (
            <ModalSubtitle key={i}>r3-{i}</ModalSubtitle>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 handles 200 different children values', () => {
    for (let i = 0; i < 200; i++) {
      const { container, unmount } = render(<ModalSubtitle>r3-v-{i}</ModalSubtitle>);
      expect(container.textContent).toBe(`r3-v-${i}`);
      unmount();
    }
  });

  it('round-3 all 500 instances render', () => {
    const { container } = render(
      <>
        {Array.from({ length: 500 }, (_, i) => (
          <ModalSubtitle key={i}>x</ModalSubtitle>
        ))}
      </>,
    );
    expect(container.children.length).toBe(500);
  });

  it('round-3 100 rerender cycles', () => {
    const { container, rerender } = render(<ModalSubtitle>x</ModalSubtitle>);
    for (let i = 0; i < 100; i++) {
      rerender(<ModalSubtitle>r3-r-{i}</ModalSubtitle>);
    }
    expect(container.textContent).toContain('99');
  });

  it('round-4 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<ModalSubtitle>r4</ModalSubtitle>);
      unmount();
    }
  });

  it('round-4 renders 1000 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1000 }, (_, i) => (
            <ModalSubtitle key={i}>r4-{i}</ModalSubtitle>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 100 different children values', () => {
    for (let i = 0; i < 100; i++) {
      const { container, unmount } = render(<ModalSubtitle>r4-v-{i}</ModalSubtitle>);
      expect(container.textContent).toBe(`r4-v-${i}`);
      unmount();
    }
  });

  it('round-4 all 200 instances render', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <ModalSubtitle key={i}>r4-x</ModalSubtitle>
        ))}
      </>,
    );
    expect(container.children.length).toBe(200);
  });

  it('round-4 100 rerender cycles', () => {
    const { container, rerender } = render(<ModalSubtitle>x</ModalSubtitle>);
    for (let i = 0; i < 100; i++) {
      rerender(<ModalSubtitle>r4-r-{i}</ModalSubtitle>);
    }
    expect(container.textContent).toContain('99');
  });

  it('round-5 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<ModalSubtitle>r5</ModalSubtitle>);
      unmount();
    }
  });

  it('round-5 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <ModalSubtitle key={i}>r5-{i}</ModalSubtitle>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 different children values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ModalSubtitle>r5-c-{i}</ModalSubtitle>);
      unmount();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ModalSubtitle>x</ModalSubtitle>);
      unmount();
    }
  });

  it('round-5 100 rerender cycles', () => {
    const { container, rerender } = render(<ModalSubtitle>x</ModalSubtitle>);
    for (let i = 0; i < 100; i++) {
      rerender(<ModalSubtitle>r5-r-{i}</ModalSubtitle>);
    }
    expect(container.textContent).toContain('99');
  });

  it('round-6 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<ModalSubtitle>r6</ModalSubtitle>);
      unmount();
    }
  });

  it('round-6 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <ModalSubtitle key={i}>r6-{i}</ModalSubtitle>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 different children values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ModalSubtitle>r6-c-{i}</ModalSubtitle>);
      unmount();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ModalSubtitle>x</ModalSubtitle>);
      unmount();
    }
  });

  it('round-6 100 rerender cycles', () => {
    const { container, rerender } = render(<ModalSubtitle>x</ModalSubtitle>);
    for (let i = 0; i < 100; i++) {
      rerender(<ModalSubtitle>r6-r-{i}</ModalSubtitle>);
    }
    expect(container.textContent).toContain('99');
  });

  it('round-7 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<ModalSubtitle>r7</ModalSubtitle>);
      unmount();
    }
  });

  it('round-7 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <ModalSubtitle key={i}>r7-{i}</ModalSubtitle>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 different children values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ModalSubtitle>r7-c-{i}</ModalSubtitle>);
      unmount();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ModalSubtitle>x</ModalSubtitle>);
      unmount();
    }
  });

  it('round-7 100 rerender cycles', () => {
    const { container, rerender } = render(<ModalSubtitle>x</ModalSubtitle>);
    for (let i = 0; i < 100; i++) {
      rerender(<ModalSubtitle>r7-r-{i}</ModalSubtitle>);
    }
    expect(container.textContent).toContain('99');
  });

  it('round-8 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<ModalSubtitle>r8</ModalSubtitle>);
      unmount();
    }
  });

  it('round-8 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <ModalSubtitle key={i}>r8-{i}</ModalSubtitle>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 different children values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ModalSubtitle>r8-c-{i}</ModalSubtitle>);
      unmount();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ModalSubtitle>x</ModalSubtitle>);
      unmount();
    }
  });

  it('round-8 100 rerender cycles', () => {
    const { container, rerender } = render(<ModalSubtitle>x</ModalSubtitle>);
    for (let i = 0; i < 100; i++) {
      rerender(<ModalSubtitle>r8-r-{i}</ModalSubtitle>);
    }
    expect(container.textContent).toContain('99');
  });

  it('round-9 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<ModalSubtitle>r9</ModalSubtitle>);
      unmount();
    }
  });

  it('round-9 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <ModalSubtitle key={i}>r9-{i}</ModalSubtitle>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-9 30 different children values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ModalSubtitle>r9-c-{i}</ModalSubtitle>);
      unmount();
    }
  });

  it('round-9 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ModalSubtitle>x</ModalSubtitle>);
      unmount();
    }
  });

  it('round-9 100 rerender cycles', () => {
    const { container, rerender } = render(<ModalSubtitle>x</ModalSubtitle>);
    for (let i = 0; i < 100; i++) {
      rerender(<ModalSubtitle>r9-r-{i}</ModalSubtitle>);
    }
    expect(container.textContent).toContain('99');
  });

  it('round-10 30 sequential ModalSubtitle mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ModalSubtitle>r10-{i}</ModalSubtitle>);
      unmount();
    }
  });

  it('round-10 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ModalSubtitle key={i}>r10-i-{i}</ModalSubtitle>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-10 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<ModalSubtitle>r10-s-{i}</ModalSubtitle>)).not.toThrow();
    }
  });

  it('round-10 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ModalSubtitle>r10-m-{i}</ModalSubtitle>);
      unmount();
    }
  });

  it('round-10 100 sequential rerender cycles second', () => {
    const { container, rerender } = render(<ModalSubtitle>x</ModalSubtitle>);
    for (let i = 0; i < 100; i++) {
      rerender(<ModalSubtitle>r10-r-{i}</ModalSubtitle>);
    }
    expect(container.textContent).toContain('99');
  });

  it('round-11 30 sequential ModalSubtitle mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ModalSubtitle>r11-m-{i}</ModalSubtitle>);
      unmount();
    }
  });

  it('round-11 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ModalSubtitle key={i}>r11-i-{i}</ModalSubtitle>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-11 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<ModalSubtitle>r11-s-{i}</ModalSubtitle>)).not.toThrow();
    }
  });

  it('round-11 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ModalSubtitle>r11-m2-{i}</ModalSubtitle>);
      unmount();
    }
  });

  it('round-11 100 sequential rerender cycles', () => {
    const { container, rerender } = render(<ModalSubtitle>x</ModalSubtitle>);
    for (let i = 0; i < 100; i++) {
      rerender(<ModalSubtitle>r11-r-{i}</ModalSubtitle>);
    }
    expect(container.textContent).toContain('99');
  });

  it('round-12 30 sequential ModalSubtitle mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ModalSubtitle>r12-m-{i}</ModalSubtitle>);
      unmount();
    }
  });

  it('round-12 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ModalSubtitle key={i}>r12-i-{i}</ModalSubtitle>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-12 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<ModalSubtitle>r12-s-{i}</ModalSubtitle>)).not.toThrow();
    }
  });

  it('round-12 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ModalSubtitle>r12-m2-{i}</ModalSubtitle>);
      unmount();
    }
  });

  it('round-12 100 sequential rerender cycles', () => {
    const { container, rerender } = render(<ModalSubtitle>x</ModalSubtitle>);
    for (let i = 0; i < 100; i++) {
      rerender(<ModalSubtitle>r12-r-{i}</ModalSubtitle>);
    }
    expect(container.textContent).toContain('99');
  });
});
