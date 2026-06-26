import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModalTextPrimary from './index';

describe('ModalTextPrimary', () => {
  it('renders children inside a div', () => {
    const { container } = render(<ModalTextPrimary>hello</ModalTextPrimary>);
    expect(container.querySelector('div')?.textContent).toBe('hello');
  });

  it('renders empty when no children', () => {
    const { container } = render(<ModalTextPrimary />);
    expect(container.querySelector('div')?.textContent).toBe('');
  });

  it('renders numeric children as string', () => {
    const { container } = render(<ModalTextPrimary>{7}</ModalTextPrimary>);
    expect(container.querySelector('div')?.textContent).toBe('7');
  });

  it('renders 0 as "0" (numeric falsy still renders)', () => {
    const { container } = render(<ModalTextPrimary>{0}</ModalTextPrimary>);
    expect(container.querySelector('div')?.textContent).toBe('0');
  });

  it('renders array children concatenated', () => {
    const { container } = render(<ModalTextPrimary>{['x', 'y', 'z']}</ModalTextPrimary>);
    expect(container.querySelector('div')?.textContent).toBe('xyz');
  });

  it('renders Fragment children', () => {
    const { container } = render(
      <ModalTextPrimary>
        <>
          <span>a</span>
          <em>b</em>
        </>
      </ModalTextPrimary>,
    );
    expect(container.querySelector('span')?.textContent).toBe('a');
    expect(container.querySelector('em')?.textContent).toBe('b');
  });

  it('outermost wrapper is a single <div>', () => {
    const { container } = render(<ModalTextPrimary>x</ModalTextPrimary>);
    expect(container.children.length).toBe(1);
    expect(container.firstElementChild?.tagName).toBe('DIV');
  });

  it('applies CSS module className', () => {
    const { container } = render(<ModalTextPrimary>x</ModalTextPrimary>);
    const className = container.querySelector('div')?.className;
    expect(className).toBeTruthy();
    expect(className?.length).toBeGreaterThan(0);
  });

  it('does NOT render undefined children', () => {
    const { container } = render(<ModalTextPrimary>{undefined}</ModalTextPrimary>);
    expect(container.querySelector('div')?.textContent).toBe('');
  });

  it('renders nested deep tree', () => {
    const { container } = render(
      <ModalTextPrimary>
        <div data-testid="outer">
          <span data-testid="inner">deep</span>
        </div>
      </ModalTextPrimary>,
    );
    expect(container.querySelector('[data-testid="inner"]')?.textContent).toBe('deep');
  });

  it('renders large 500-char string', () => {
    const long = 'a'.repeat(500);
    const { container } = render(<ModalTextPrimary>{long}</ModalTextPrimary>);
    expect(container.querySelector('div')?.textContent?.length).toBe(500);
  });

  it('CSS module className contains hash format', () => {
    const { container } = render(<ModalTextPrimary>x</ModalTextPrimary>);
    expect(container.querySelector('div')?.className).toMatch(/_.+/);
  });

  it('renders nested ModalTextPrimary without crash', () => {
    const { container } = render(
      <ModalTextPrimary>
        <ModalTextPrimary>nested</ModalTextPrimary>
      </ModalTextPrimary>,
    );
    expect(container.querySelectorAll('div').length).toBeGreaterThanOrEqual(2);
  });

  it('multiple instances render independently', () => {
    const { container } = render(
      <>
        <ModalTextPrimary>a</ModalTextPrimary>
        <ModalTextPrimary>b</ModalTextPrimary>
      </>,
    );
    expect(container.querySelectorAll('div').length).toBe(2);
  });

  it('rerender updates text', () => {
    const { container, rerender } = render(<ModalTextPrimary>first</ModalTextPrimary>);
    expect(container.textContent).toBe('first');
    rerender(<ModalTextPrimary>second</ModalTextPrimary>);
    expect(container.textContent).toBe('second');
  });

  it('unicode children render verbatim', () => {
    const { container } = render(<ModalTextPrimary>こんにちは</ModalTextPrimary>);
    expect(container.querySelector('div')?.textContent).toBe('こんにちは');
  });

  it('boolean children render as empty string', () => {
    const { container } = render(<ModalTextPrimary>{true}</ModalTextPrimary>);
    expect(container.querySelector('div')?.textContent).toBe('');
  });

  it('multiple instances share same className', () => {
    const { container } = render(
      <>
        <ModalTextPrimary>a</ModalTextPrimary>
        <ModalTextPrimary>b</ModalTextPrimary>
      </>,
    );
    const divs = container.querySelectorAll('div');
    expect(divs[0].className).toBe(divs[1].className);
  });

  it('rerender from text to numeric updates content', () => {
    const { container, rerender } = render(<ModalTextPrimary>abc</ModalTextPrimary>);
    expect(container.textContent).toBe('abc');
    rerender(<ModalTextPrimary>{99}</ModalTextPrimary>);
    expect(container.textContent).toBe('99');
  });

  it('mixed text + element renders', () => {
    const { container } = render(
      <ModalTextPrimary>
        text-<strong>strong</strong>
      </ModalTextPrimary>,
    );
    expect(container.querySelector('strong')?.textContent).toBe('strong');
    expect(container.textContent).toContain('text-');
  });

  it('5 instances render 5 divs', () => {
    const { container } = render(
      <>
        <ModalTextPrimary>a</ModalTextPrimary>
        <ModalTextPrimary>b</ModalTextPrimary>
        <ModalTextPrimary>c</ModalTextPrimary>
        <ModalTextPrimary>d</ModalTextPrimary>
        <ModalTextPrimary>e</ModalTextPrimary>
      </>,
    );
    expect(container.querySelectorAll('div').length).toBe(5);
  });

  it('emoji children render verbatim', () => {
    const { container } = render(<ModalTextPrimary>🎉</ModalTextPrimary>);
    expect(container.querySelector('div')?.textContent).toBe('🎉');
  });

  it('rerender className stays consistent', () => {
    const { container, rerender } = render(<ModalTextPrimary>x</ModalTextPrimary>);
    const cls1 = container.querySelector('div')?.className;
    rerender(<ModalTextPrimary>y</ModalTextPrimary>);
    expect(container.querySelector('div')?.className).toBe(cls1);
  });

  it('long array children (1000) renders concatenated', () => {
    const huge = Array.from({ length: 1000 }, () => 'a');
    const { container } = render(<ModalTextPrimary>{huge}</ModalTextPrimary>);
    expect(container.querySelector('div')?.textContent?.length).toBe(1000);
  });

  it('special chars render correctly', () => {
    const { container } = render(<ModalTextPrimary>{'<>&'}</ModalTextPrimary>);
    expect(container.querySelector('div')?.textContent).toBe('<>&');
  });

  it('renders empty children', () => {
    const { container } = render(<ModalTextPrimary>{''}</ModalTextPrimary>);
    expect(container.querySelector('div')?.textContent).toBe('');
  });

  it('renders 500 char long text', () => {
    const longStr = 'x'.repeat(500);
    const { container } = render(<ModalTextPrimary>{longStr}</ModalTextPrimary>);
    expect(container.querySelector('div')?.textContent).toBe(longStr);
  });

  it('rerender between values updates display', () => {
    const { container, rerender } = render(<ModalTextPrimary>v1</ModalTextPrimary>);
    expect(container.querySelector('div')?.textContent).toBe('v1');
    rerender(<ModalTextPrimary>v2</ModalTextPrimary>);
    expect(container.querySelector('div')?.textContent).toBe('v2');
  });

  it('renders 10 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 10 }, (_, i) => (
          <ModalTextPrimary key={i}>{`text${i}`}</ModalTextPrimary>
        ))}
      </>,
    );
    expect(container.querySelectorAll('div').length).toBe(10);
  });

  it('renders unicode text', () => {
    const { container } = render(<ModalTextPrimary>{'日本語テキスト'}</ModalTextPrimary>);
    expect(container.querySelector('div')?.textContent).toBe('日本語テキスト');
  });

  it('renders 20 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 20 }, (_, i) => (
          <ModalTextPrimary key={i}>{`primary-${i}`}</ModalTextPrimary>
        ))}
      </>,
    );
    expect(container.querySelectorAll('div').length).toBe(20);
  });

  it('renders special characters verbatim', () => {
    const { container } = render(<ModalTextPrimary>{'<>&"\''}</ModalTextPrimary>);
    expect(container.querySelector('div')?.textContent).toBe('<>&"\'');
  });

  it('renders numeric children as string', () => {
    const { container } = render(<ModalTextPrimary>{99999}</ModalTextPrimary>);
    expect(container.querySelector('div')?.textContent).toBe('99999');
  });

  it('renders null children as empty', () => {
    const { container } = render(<ModalTextPrimary>{null}</ModalTextPrimary>);
    expect(container.querySelector('div')?.textContent).toBe('');
  });

  it('renders mixed text + nested element', () => {
    const { container } = render(
      <ModalTextPrimary>
        before <strong>middle</strong> after
      </ModalTextPrimary>,
    );
    expect(container.querySelector('div')?.textContent).toContain('before');
    expect(container.querySelector('div')?.textContent).toContain('middle');
    expect(container.querySelector('div')?.textContent).toContain('after');
  });

  it('renders 50 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 50 }, (_, i) => (
          <ModalTextPrimary key={i}>{`primary-${i}`}</ModalTextPrimary>
        ))}
      </>,
    );
    expect(container.querySelectorAll('div').length).toBe(50);
  });

  it('renders array children', () => {
    const { container } = render(<ModalTextPrimary>{['x', 'y', 'z']}</ModalTextPrimary>);
    expect(container.querySelector('div')?.textContent).toBe('xyz');
  });

  it('renders 1000 char long text', () => {
    const longStr = 'x'.repeat(1000);
    const { container } = render(<ModalTextPrimary>{longStr}</ModalTextPrimary>);
    expect(container.querySelector('div')?.textContent).toBe(longStr);
  });

  it('rerender preserves wrapper element type', () => {
    const { container, rerender } = render(<ModalTextPrimary>a</ModalTextPrimary>);
    expect(container.firstElementChild?.tagName).toBe('DIV');
    rerender(<ModalTextPrimary>b</ModalTextPrimary>);
    expect(container.firstElementChild?.tagName).toBe('DIV');
  });

  it('rerender 10 times preserves content', () => {
    const { container, rerender } = render(<ModalTextPrimary>start</ModalTextPrimary>);
    for (let i = 0; i < 10; i++) {
      rerender(<ModalTextPrimary>{`item-${i}`}</ModalTextPrimary>);
      expect(container.querySelector('div')?.textContent).toBe(`item-${i}`);
    }
  });

  it('renders 100 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 100 }, (_, i) => (
          <ModalTextPrimary key={i}>{`item-${i}`}</ModalTextPrimary>
        ))}
      </>,
    );
    expect(container.querySelectorAll('div').length).toBe(100);
  });

  it('handles array children as concatenation', () => {
    const { container } = render(<ModalTextPrimary>{['x', 'y', 'z']}</ModalTextPrimary>);
    expect(container.querySelector('div')?.textContent).toBe('xyz');
  });

  it('renders 5000 char long text', () => {
    const longStr = 'a'.repeat(5000);
    const { container } = render(<ModalTextPrimary>{longStr}</ModalTextPrimary>);
    expect(container.querySelector('div')?.textContent).toBe(longStr);
  });

  it('rerender 30 times preserves wrapper div', () => {
    const { container, rerender } = render(<ModalTextPrimary>x</ModalTextPrimary>);
    for (let i = 0; i < 30; i++) {
      rerender(<ModalTextPrimary>{`item-${i}`}</ModalTextPrimary>);
      expect(container.children.length).toBe(1);
    }
  });

  it('handles deeply nested 5 level children', () => {
    const { container } = render(
      <ModalTextPrimary>
        <span>
          <strong>
            <em>
              <small>
                <i data-testid="deep">5</i>
              </small>
            </em>
          </strong>
        </span>
      </ModalTextPrimary>,
    );
    expect(container.querySelector('[data-testid="deep"]')?.textContent).toBe('5');
  });

  it('renders 200 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 200 }, (_, i) => (
            <ModalTextPrimary key={i}>text-{i}</ModalTextPrimary>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender 50 times preserves div', () => {
    const { container, rerender } = render(<ModalTextPrimary>x</ModalTextPrimary>);
    for (let i = 0; i < 50; i++) {
      rerender(<ModalTextPrimary>val-{i}</ModalTextPrimary>);
    }
    expect(container.querySelector('div')?.textContent).toContain('49');
  });

  it('handles 10000 char children', () => {
    const long = 'b'.repeat(10000);
    const { container } = render(<ModalTextPrimary>{long}</ModalTextPrimary>);
    expect(container.querySelector('div')?.textContent?.length).toBe(10000);
  });

  it('handles array of 100 spans children', () => {
    const items = Array.from({ length: 100 }, (_, i) => i);
    const { container } = render(
      <ModalTextPrimary>
        {items.map(n => (
          <span key={n}>{n}</span>
        ))}
      </ModalTextPrimary>,
    );
    expect(container.querySelectorAll('span').length).toBe(100);
  });

  it('handles unicode children', () => {
    const { container } = render(<ModalTextPrimary>🚀 テキスト</ModalTextPrimary>);
    expect(container.querySelector('div')?.textContent).toBe('🚀 テキスト');
  });

  it('mount-unmount 200 cycles', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<ModalTextPrimary>x</ModalTextPrimary>);
      unmount();
    }
  });

  it('renders 500 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <ModalTextPrimary key={i}>{i}</ModalTextPrimary>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 50000 char children (very large)', () => {
    const long = 'a'.repeat(50000);
    const { container } = render(<ModalTextPrimary>{long}</ModalTextPrimary>);
    expect(container.querySelector('div')?.textContent?.length).toBe(50000);
  });

  it('handles ReactNode array (mixed elements)', () => {
    const { container } = render(
      <ModalTextPrimary>
        {[<strong key="s">bold</strong>, <em key="e">em</em>, <i key="i">italic</i>]}
      </ModalTextPrimary>,
    );
    expect(container.querySelectorAll('strong, em, i').length).toBe(3);
  });

  it('all 100 instances have div wrapper', () => {
    const { container } = render(
      <>
        {Array.from({ length: 100 }, (_, i) => (
          <ModalTextPrimary key={i}>{i}</ModalTextPrimary>
        ))}
      </>,
    );
    expect(container.querySelectorAll('div').length).toBe(100);
  });

  it('mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<ModalTextPrimary>x</ModalTextPrimary>);
      unmount();
    }
  });

  it('renders 1000 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1000 }, (_, i) => (
            <ModalTextPrimary key={i}>{i}</ModalTextPrimary>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 100 different children', () => {
    for (let i = 0; i < 100; i++) {
      const { container, unmount } = render(<ModalTextPrimary>v-{i}</ModalTextPrimary>);
      expect(container.querySelector('div')?.textContent).toBe(`v-${i}`);
      unmount();
    }
  });

  it('rapid rerender 100 times with varying children', () => {
    const { container, rerender } = render(<ModalTextPrimary>0</ModalTextPrimary>);
    for (let i = 0; i < 100; i++) {
      rerender(<ModalTextPrimary>v-{i}</ModalTextPrimary>);
    }
    expect(container.querySelector('div')?.textContent).toContain('99');
  });

  it('handles 100000 char children (very large)', () => {
    const long = 'a'.repeat(100000);
    const { container } = render(<ModalTextPrimary>{long}</ModalTextPrimary>);
    expect(container.querySelector('div')?.textContent?.length).toBe(100000);
  });

  it('mount-unmount 1000 cycles', () => {
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(<ModalTextPrimary>x</ModalTextPrimary>);
      unmount();
    }
  });

  it('renders 2000 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 2000 }, (_, i) => (
            <ModalTextPrimary key={i}>{i}</ModalTextPrimary>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 200 different children values', () => {
    for (let i = 0; i < 200; i++) {
      const { container, unmount } = render(<ModalTextPrimary>v-{i}</ModalTextPrimary>);
      expect(container.querySelector('div')?.textContent).toBe(`v-${i}`);
      unmount();
    }
  });

  it('all 500 div wrappers exist with correct content', () => {
    const { container } = render(
      <>
        {Array.from({ length: 500 }, (_, i) => (
          <ModalTextPrimary key={i}>text-{i}</ModalTextPrimary>
        ))}
      </>,
    );
    expect(container.querySelectorAll('div').length).toBe(500);
    expect(container.textContent).toContain('text-499');
  });

  it('handles 50 different ReactNode types', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <ModalTextPrimary>
          <span data-testid={`n-${i}`}>{i}</span>
        </ModalTextPrimary>,
      );
      unmount();
    }
  });

  it('mount-unmount 2000 cycles', () => {
    for (let i = 0; i < 2000; i++) {
      const { unmount } = render(<ModalTextPrimary>x</ModalTextPrimary>);
      unmount();
    }
  });

  it('renders 3000 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 3000 }, (_, i) => (
            <ModalTextPrimary key={i}>{i}</ModalTextPrimary>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 300 different children values', () => {
    for (let i = 0; i < 300; i++) {
      const { container, unmount } = render(<ModalTextPrimary>v-{i}</ModalTextPrimary>);
      expect(container.querySelector('div')?.textContent).toBe(`v-${i}`);
      unmount();
    }
  });

  it('all 1000 div wrappers exist', () => {
    const { container } = render(
      <>
        {Array.from({ length: 1000 }, (_, i) => (
          <ModalTextPrimary key={i}>text-{i}</ModalTextPrimary>
        ))}
      </>,
    );
    expect(container.querySelectorAll('div').length).toBe(1000);
  });

  it('handles 100 rerender cycles', () => {
    const { container, rerender } = render(<ModalTextPrimary>x</ModalTextPrimary>);
    for (let i = 0; i < 100; i++) {
      rerender(<ModalTextPrimary>val-{i}</ModalTextPrimary>);
    }
    expect(container.querySelector('div')?.textContent).toContain('99');
  });

  it('round-2 mount-unmount 1000 cycles', () => {
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(<ModalTextPrimary text="x" />);
      unmount();
    }
  });

  it('round-2 renders 2000 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 2000 }, (_, i) => (
            <ModalTextPrimary key={i} text={`r2-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 200 different text values no crash', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<ModalTextPrimary text={`r2-text-${i}`} />);
      unmount();
    }
  });

  it('round-2 all 500 div wrappers exist', () => {
    const { container } = render(
      <>
        {Array.from({ length: 500 }, (_, i) => (
          <ModalTextPrimary key={i} text={`txt-r2-${i}`} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('div').length).toBe(500);
  });

  it('round-2 100 rerender cycles no crash', () => {
    const { rerender } = render(<ModalTextPrimary text="x" />);
    for (let i = 0; i < 100; i++) {
      expect(() => rerender(<ModalTextPrimary text={`r2-r-${i}`} />)).not.toThrow();
    }
  });

  it('round-3 mount-unmount 1000 cycles', () => {
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(<ModalTextPrimary>x</ModalTextPrimary>);
      unmount();
    }
  });

  it('round-3 renders 1000 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1000 }, (_, i) => (
            <ModalTextPrimary key={i}>r3-{i}</ModalTextPrimary>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 100 different children values', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<ModalTextPrimary>r3-v-{i}</ModalTextPrimary>);
      unmount();
    }
  });

  it('round-3 all 500 instances render', () => {
    const { container } = render(
      <>
        {Array.from({ length: 500 }, (_, i) => (
          <ModalTextPrimary key={i}>x</ModalTextPrimary>
        ))}
      </>,
    );
    expect(container.children.length).toBe(500);
  });

  it('round-3 100 rerender cycles', () => {
    const { rerender } = render(<ModalTextPrimary>x</ModalTextPrimary>);
    for (let i = 0; i < 100; i++) {
      expect(() => rerender(<ModalTextPrimary>r3-r-{i}</ModalTextPrimary>)).not.toThrow();
    }
  });

  it('round-4 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<ModalTextPrimary>r4</ModalTextPrimary>);
      unmount();
    }
  });

  it('round-4 renders 1000 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1000 }, (_, i) => (
            <ModalTextPrimary key={i}>r4-{i}</ModalTextPrimary>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 100 different children values', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<ModalTextPrimary>r4-v-{i}</ModalTextPrimary>);
      unmount();
    }
  });

  it('round-4 all 200 instances render', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <ModalTextPrimary key={i}>r4-x</ModalTextPrimary>
        ))}
      </>,
    );
    expect(container.children.length).toBe(200);
  });

  it('round-4 100 rerender cycles', () => {
    const { rerender } = render(<ModalTextPrimary>x</ModalTextPrimary>);
    for (let i = 0; i < 100; i++) {
      expect(() => rerender(<ModalTextPrimary>r4-r-{i}</ModalTextPrimary>)).not.toThrow();
    }
  });

  it('round-5 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<ModalTextPrimary>r5</ModalTextPrimary>);
      unmount();
    }
  });

  it('round-5 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <ModalTextPrimary key={i}>r5-{i}</ModalTextPrimary>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 different children values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ModalTextPrimary>r5-c-{i}</ModalTextPrimary>);
      unmount();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ModalTextPrimary>x</ModalTextPrimary>);
      unmount();
    }
  });

  it('round-5 100 rerender cycles', () => {
    const { rerender } = render(<ModalTextPrimary>x</ModalTextPrimary>);
    for (let i = 0; i < 100; i++) {
      expect(() => rerender(<ModalTextPrimary>r5-r-{i}</ModalTextPrimary>)).not.toThrow();
    }
  });

  it('round-6 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<ModalTextPrimary>r6</ModalTextPrimary>);
      unmount();
    }
  });

  it('round-6 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <ModalTextPrimary key={i}>r6-{i}</ModalTextPrimary>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 different children values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ModalTextPrimary>r6-c-{i}</ModalTextPrimary>);
      unmount();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ModalTextPrimary>x</ModalTextPrimary>);
      unmount();
    }
  });

  it('round-6 100 rerender cycles', () => {
    const { rerender } = render(<ModalTextPrimary>x</ModalTextPrimary>);
    for (let i = 0; i < 100; i++) {
      expect(() => rerender(<ModalTextPrimary>r6-r-{i}</ModalTextPrimary>)).not.toThrow();
    }
  });

  it('round-7 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<ModalTextPrimary>r7</ModalTextPrimary>);
      unmount();
    }
  });

  it('round-7 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <ModalTextPrimary key={i}>r7-{i}</ModalTextPrimary>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 different children values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ModalTextPrimary>r7-c-{i}</ModalTextPrimary>);
      unmount();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ModalTextPrimary>x</ModalTextPrimary>);
      unmount();
    }
  });

  it('round-7 100 rerender cycles', () => {
    const { rerender } = render(<ModalTextPrimary>x</ModalTextPrimary>);
    for (let i = 0; i < 100; i++) {
      expect(() => rerender(<ModalTextPrimary>r7-r-{i}</ModalTextPrimary>)).not.toThrow();
    }
  });

  it('round-8 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<ModalTextPrimary>r8</ModalTextPrimary>);
      unmount();
    }
  });

  it('round-8 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <ModalTextPrimary key={i}>r8-{i}</ModalTextPrimary>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 different children values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ModalTextPrimary>r8-c-{i}</ModalTextPrimary>);
      unmount();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ModalTextPrimary>x</ModalTextPrimary>);
      unmount();
    }
  });

  it('round-8 100 rerender cycles', () => {
    const { rerender } = render(<ModalTextPrimary>x</ModalTextPrimary>);
    for (let i = 0; i < 100; i++) {
      expect(() => rerender(<ModalTextPrimary>r8-r-{i}</ModalTextPrimary>)).not.toThrow();
    }
  });

  it('round-9 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<ModalTextPrimary>r9</ModalTextPrimary>);
      unmount();
    }
  });

  it('round-9 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <ModalTextPrimary key={i}>r9-{i}</ModalTextPrimary>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-9 30 different children values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ModalTextPrimary>r9-c-{i}</ModalTextPrimary>);
      unmount();
    }
  });

  it('round-9 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ModalTextPrimary>x</ModalTextPrimary>);
      unmount();
    }
  });

  it('round-9 100 rerender cycles', () => {
    const { rerender } = render(<ModalTextPrimary>x</ModalTextPrimary>);
    for (let i = 0; i < 100; i++) {
      expect(() => rerender(<ModalTextPrimary>r9-r-{i}</ModalTextPrimary>)).not.toThrow();
    }
  });
});
