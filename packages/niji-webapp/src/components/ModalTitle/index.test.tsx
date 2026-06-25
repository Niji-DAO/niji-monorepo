import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModalTitle from './index';

describe('ModalTitle', () => {
  it('wraps children in a <h1> inside a div', () => {
    const { container } = render(<ModalTitle>Hello Modal</ModalTitle>);
    expect(container.querySelector('h1')?.textContent).toBe('Hello Modal');
  });

  it('renders nested elements inside h1', () => {
    const { container } = render(
      <ModalTitle>
        <span>nested</span>
      </ModalTitle>,
    );
    expect(container.querySelector('h1 span')?.textContent).toBe('nested');
  });

  it('renders exactly 1 <h1> element', () => {
    const { container } = render(<ModalTitle>Title</ModalTitle>);
    expect(container.querySelectorAll('h1').length).toBe(1);
  });

  it('outermost wrapper is a single <div> containing <h1>', () => {
    const { container } = render(<ModalTitle>x</ModalTitle>);
    expect(container.firstElementChild?.tagName).toBe('DIV');
    expect(container.firstElementChild?.firstElementChild?.tagName).toBe('H1');
  });

  it('renders numeric children inside h1', () => {
    const { container } = render(<ModalTitle>{99}</ModalTitle>);
    expect(container.querySelector('h1')?.textContent).toBe('99');
  });

  it('applies CSS module className on wrapper div', () => {
    const { container } = render(<ModalTitle>x</ModalTitle>);
    const className = container.querySelector('div')?.className;
    expect(className).toBeTruthy();
    expect(className?.length).toBeGreaterThan(0);
  });

  it('h1 inherits default heading level 1 (a11y semantic)', () => {
    const { container } = render(<ModalTitle>Accessible</ModalTitle>);
    const h1 = container.querySelector('h1');
    expect(h1?.tagName).toBe('H1');
    expect(h1?.textContent).toBe('Accessible');
  });

  it('renders array of children inside h1', () => {
    const { container } = render(<ModalTitle>{['Hello', ' ', 'World']}</ModalTitle>);
    expect(container.querySelector('h1')?.textContent).toBe('Hello World');
  });

  it('renders null children gracefully (empty h1)', () => {
    const { container } = render(<ModalTitle>{null}</ModalTitle>);
    expect(container.querySelector('h1')?.textContent).toBe('');
  });

  it('renders boolean false as empty (React behavior)', () => {
    const { container } = render(<ModalTitle>{false}</ModalTitle>);
    expect(container.querySelector('h1')?.textContent).toBe('');
  });

  it('renders multiple nested elements', () => {
    const { container } = render(
      <ModalTitle>
        <span>a</span>
        <strong>b</strong>
      </ModalTitle>,
    );
    expect(container.querySelector('h1')?.textContent).toBe('ab');
  });

  it('renders long string children', () => {
    const long = 'a'.repeat(200);
    const { container } = render(<ModalTitle>{long}</ModalTitle>);
    expect(container.querySelector('h1')?.textContent?.length).toBe(200);
  });

  it('CSS module className has hash format', () => {
    const { container } = render(<ModalTitle>x</ModalTitle>);
    const className = container.querySelector('div')?.className ?? '';
    expect(className).toMatch(/_.+/);
  });

  it('renders unicode children inside h1', () => {
    const { container } = render(<ModalTitle>タイトル</ModalTitle>);
    expect(container.querySelector('h1')?.textContent).toBe('タイトル');
  });

  it('rerender updates h1 text', () => {
    const { container, rerender } = render(<ModalTitle>A</ModalTitle>);
    expect(container.querySelector('h1')?.textContent).toBe('A');
    rerender(<ModalTitle>B</ModalTitle>);
    expect(container.querySelector('h1')?.textContent).toBe('B');
  });

  it('renders empty string children as empty h1', () => {
    const { container } = render(<ModalTitle>{''}</ModalTitle>);
    expect(container.querySelector('h1')?.textContent).toBe('');
  });

  it('multiple ModalTitle instances render independently', () => {
    const { container } = render(
      <>
        <ModalTitle>first</ModalTitle>
        <ModalTitle>second</ModalTitle>
      </>,
    );
    const h1s = container.querySelectorAll('h1');
    expect(h1s[0].textContent).toBe('first');
    expect(h1s[1].textContent).toBe('second');
  });

  it('Fragment children render as inline content inside h1', () => {
    const { container } = render(
      <ModalTitle>
        <>
          <span>x</span>
          <span>y</span>
        </>
      </ModalTitle>,
    );
    expect(container.querySelectorAll('h1 span').length).toBe(2);
  });

  it('h1 element renders inside wrapper div', () => {
    const { container } = render(<ModalTitle>x</ModalTitle>);
    expect(container.querySelector('div h1')).not.toBeNull();
  });

  it('3 instances render 3 h1 elements', () => {
    const { container } = render(
      <>
        <ModalTitle>a</ModalTitle>
        <ModalTitle>b</ModalTitle>
        <ModalTitle>c</ModalTitle>
      </>,
    );
    expect(container.querySelectorAll('h1').length).toBe(3);
  });

  it('special chars in title render correctly', () => {
    const { container } = render(<ModalTitle>{'<>&'}</ModalTitle>);
    expect(container.querySelector('h1')?.textContent).toBe('<>&');
  });

  it('emoji title renders verbatim', () => {
    const { container } = render(<ModalTitle>🎉</ModalTitle>);
    expect(container.querySelector('h1')?.textContent).toBe('🎉');
  });

  it('div wrapper renders only 1 instance per ModalTitle', () => {
    const { container } = render(<ModalTitle>x</ModalTitle>);
    expect(container.querySelectorAll('div').length).toBe(1);
  });

  it('renders empty string children', () => {
    const { container } = render(<ModalTitle>{''}</ModalTitle>);
    expect(container.querySelector('h1')?.textContent).toBe('');
  });

  it('renders 200 char long title verbatim', () => {
    const longStr = 'x'.repeat(200);
    const { container } = render(<ModalTitle>{longStr}</ModalTitle>);
    expect(container.querySelector('h1')?.textContent).toBe(longStr);
  });

  it('renders nested span as h1 children', () => {
    const { container } = render(
      <ModalTitle>
        <span data-testid="inner">inner-text</span>
      </ModalTitle>,
    );
    expect(container.querySelector('h1 [data-testid="inner"]')?.textContent).toBe('inner-text');
  });

  it('rerender from "first" to "second" updates h1', () => {
    const { container, rerender } = render(<ModalTitle>first</ModalTitle>);
    expect(container.querySelector('h1')?.textContent).toBe('first');
    rerender(<ModalTitle>second</ModalTitle>);
    expect(container.querySelector('h1')?.textContent).toBe('second');
  });

  it('renders unicode title verbatim', () => {
    const { container } = render(<ModalTitle>日本語タイトル</ModalTitle>);
    expect(container.querySelector('h1')?.textContent).toBe('日本語タイトル');
  });

  it('renders 50 char title exactly', () => {
    const str50 = 'x'.repeat(50);
    const { container } = render(<ModalTitle>{str50}</ModalTitle>);
    expect(container.querySelector('h1')?.textContent).toBe(str50);
  });

  it('renders numeric children as string', () => {
    const { container } = render(<ModalTitle>{42}</ModalTitle>);
    expect(container.querySelector('h1')?.textContent).toBe('42');
  });

  it('renders deeply nested 3 levels in h1', () => {
    const { container } = render(
      <ModalTitle>
        <span>
          <strong>
            <em data-testid="deep">deep</em>
          </strong>
        </span>
      </ModalTitle>,
    );
    expect(container.querySelector('h1 [data-testid="deep"]')?.textContent).toBe('deep');
  });

  it('renders 7 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 7 }, (_, i) => (
          <ModalTitle key={i}>{`title-${i}`}</ModalTitle>
        ))}
      </>,
    );
    expect(container.querySelectorAll('h1').length).toBe(7);
  });

  it('rerender same content idempotent', () => {
    const { container, rerender } = render(<ModalTitle>same</ModalTitle>);
    const initial = container.innerHTML;
    rerender(<ModalTitle>same</ModalTitle>);
    expect(container.innerHTML).toBe(initial);
  });

  it('renders array children (multiple text nodes)', () => {
    const { container } = render(<ModalTitle>{['a', 'b', 'c']}</ModalTitle>);
    expect(container.querySelector('h1')?.textContent).toBe('abc');
  });

  it('renders 50 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 50 }, (_, i) => (
          <ModalTitle key={i}>{`title-${i}`}</ModalTitle>
        ))}
      </>,
    );
    expect(container.querySelectorAll('h1').length).toBe(50);
  });

  it('preserves h1 element type across mounts', () => {
    const { container } = render(<ModalTitle>x</ModalTitle>);
    expect(container.querySelector('h1')).not.toBeNull();
  });

  it('renders 1000 char long title', () => {
    const longStr = 'x'.repeat(1000);
    const { container } = render(<ModalTitle>{longStr}</ModalTitle>);
    expect(container.querySelector('h1')?.textContent).toBe(longStr);
  });

  it('rerender from text to JSX preserves h1', () => {
    const { container, rerender } = render(<ModalTitle>plain</ModalTitle>);
    expect(container.querySelector('h1')).not.toBeNull();
    rerender(
      <ModalTitle>
        <span>jsx</span>
      </ModalTitle>,
    );
    expect(container.querySelector('h1')).not.toBeNull();
  });

  it('renders 100 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 100 }, (_, i) => (
          <ModalTitle key={i}>{`title-${i}`}</ModalTitle>
        ))}
      </>,
    );
    expect(container.querySelectorAll('h1').length).toBe(100);
  });

  it('handles deeply nested children (5 levels)', () => {
    const { container } = render(
      <ModalTitle>
        <span>
          <strong>
            <em>
              <small>
                <i data-testid="deep">5</i>
              </small>
            </em>
          </strong>
        </span>
      </ModalTitle>,
    );
    expect(container.querySelector('h1 [data-testid="deep"]')?.textContent).toBe('5');
  });

  it('renders 5000 char long title', () => {
    const longStr = 'x'.repeat(5000);
    const { container } = render(<ModalTitle>{longStr}</ModalTitle>);
    expect(container.querySelector('h1')?.textContent).toBe(longStr);
  });

  it('rerender preserves h1 element type 10 times', () => {
    const { container, rerender } = render(<ModalTitle>a</ModalTitle>);
    for (let i = 0; i < 10; i++) {
      rerender(<ModalTitle>{`item-${i}`}</ModalTitle>);
      expect(container.querySelector('h1')).not.toBeNull();
    }
  });

  it('renders without crash with Symbol children', () => {
    expect(() => render(<ModalTitle>{Symbol('x') as never}</ModalTitle>)).not.toThrow();
  });

  it('renders 100 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <ModalTitle key={i}>title-{i}</ModalTitle>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender 30 times preserves h1', () => {
    const { container, rerender } = render(<ModalTitle>x</ModalTitle>);
    for (let i = 0; i < 30; i++) {
      rerender(<ModalTitle>title-{i}</ModalTitle>);
    }
    expect(container.querySelector('h1')?.textContent).toContain('29');
  });

  it('handles array children', () => {
    const arr = ['a', 'b', 'c'];
    const { container } = render(
      <ModalTitle>
        {arr.map(n => (
          <span key={n}>{n}</span>
        ))}
      </ModalTitle>,
    );
    expect(container.querySelectorAll('h1 span').length).toBe(3);
  });

  it('handles unicode children', () => {
    const { container } = render(<ModalTitle>🎉 タイトル</ModalTitle>);
    expect(container.querySelector('h1')?.textContent).toBe('🎉 タイトル');
  });

  it('handles 5000 char children (very long)', () => {
    const long = 'x'.repeat(5000);
    const { container } = render(<ModalTitle>{long}</ModalTitle>);
    expect(container.querySelector('h1')?.textContent?.length).toBe(5000);
  });

  it('mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<ModalTitle>x</ModalTitle>);
      unmount();
    }
  });

  it('renders 500 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <ModalTitle key={i}>title-{i}</ModalTitle>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles deeply nested children (5 levels)', () => {
    const { container } = render(
      <ModalTitle>
        <span>
          <strong>
            <em>
              <small>
                <i data-testid="deep5">deep</i>
              </small>
            </em>
          </strong>
        </span>
      </ModalTitle>,
    );
    expect(container.querySelector('[data-testid="deep5"]')?.textContent).toBe('deep');
  });

  it('handles 50 different children rerender', () => {
    const { container, rerender } = render(<ModalTitle>0</ModalTitle>);
    for (let i = 0; i < 50; i++) {
      rerender(<ModalTitle>v-{i}</ModalTitle>);
    }
    expect(container.querySelector('h1')?.textContent).toContain('49');
  });

  it('all 200 instances have h1 element', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <ModalTitle key={i}>{i}</ModalTitle>
        ))}
      </>,
    );
    expect(container.querySelectorAll('h1').length).toBe(200);
  });

  it('mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<ModalTitle>x</ModalTitle>);
      unmount();
    }
  });

  it('renders 1000 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1000 }, (_, i) => (
            <ModalTitle key={i}>{i}</ModalTitle>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 100 different children with rerender', () => {
    const { container, rerender } = render(<ModalTitle>x</ModalTitle>);
    for (let i = 0; i < 100; i++) {
      rerender(<ModalTitle>val-{i}</ModalTitle>);
    }
    expect(container.querySelector('h1')?.textContent).toContain('99');
  });

  it('all 500 h1 elements exist', () => {
    const { container } = render(
      <>
        {Array.from({ length: 500 }, (_, i) => (
          <ModalTitle key={i}>{i}</ModalTitle>
        ))}
      </>,
    );
    expect(container.querySelectorAll('h1').length).toBe(500);
  });

  it('handles deeply nested fragments', () => {
    const { container } = render(
      <ModalTitle>
        <>
          <>
            <>
              <span data-testid="deep-frag-title">deep</span>
            </>
          </>
        </>
      </ModalTitle>,
    );
    expect(container.querySelector('[data-testid="deep-frag-title"]')?.textContent).toBe('deep');
  });

  it('mount-unmount 1000 cycles', () => {
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(<ModalTitle>x</ModalTitle>);
      unmount();
    }
  });

  it('renders 2000 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 2000 }, (_, i) => (
            <ModalTitle key={i}>{i}</ModalTitle>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 200 different children values', () => {
    for (let i = 0; i < 200; i++) {
      const { container, unmount } = render(<ModalTitle>v-{i}</ModalTitle>);
      expect(container.querySelector('h1')?.textContent).toBe(`v-${i}`);
      unmount();
    }
  });

  it('all 500 h1 elements exist with correct content', () => {
    const { container } = render(
      <>
        {Array.from({ length: 500 }, (_, i) => (
          <ModalTitle key={i}>title-{i}</ModalTitle>
        ))}
      </>,
    );
    expect(container.querySelectorAll('h1').length).toBe(500);
    expect(container.textContent).toContain('title-499');
  });

  it('handles 50 different ReactNode types', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <ModalTitle>
          <span data-testid={`n-${i}`}>{i}</span>
        </ModalTitle>,
      );
      unmount();
    }
  });

  it('round-2 mount-unmount 1000 cycles', () => {
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(<ModalTitle>x</ModalTitle>);
      unmount();
    }
  });

  it('round-2 renders 2000 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 2000 }, (_, i) => (
            <ModalTitle key={i}>r2-{i}</ModalTitle>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 200 different children values', () => {
    for (let i = 0; i < 200; i++) {
      const { container, unmount } = render(<ModalTitle>r2-v-{i}</ModalTitle>);
      expect(container.querySelector('h1')?.textContent).toBe(`r2-v-${i}`);
      unmount();
    }
  });

  it('round-2 all 500 h1 elements exist', () => {
    const { container } = render(
      <>
        {Array.from({ length: 500 }, (_, i) => (
          <ModalTitle key={i}>title-r2-{i}</ModalTitle>
        ))}
      </>,
    );
    expect(container.querySelectorAll('h1').length).toBe(500);
    expect(container.textContent).toContain('title-r2-499');
  });

  it('round-2 handles 50 different ReactNode types', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <ModalTitle>
          <span data-testid={`r2-n-${i}`}>{i}</span>
        </ModalTitle>,
      );
      unmount();
    }
  });

  it('round-3 mount-unmount 1000 cycles', () => {
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(<ModalTitle>x</ModalTitle>);
      unmount();
    }
  });

  it('round-3 renders 1000 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1000 }, (_, i) => (
            <ModalTitle key={i}>r3-{i}</ModalTitle>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 handles 200 different children values', () => {
    for (let i = 0; i < 200; i++) {
      const { container, unmount } = render(<ModalTitle>r3-v-{i}</ModalTitle>);
      expect(container.textContent).toBe(`r3-v-${i}`);
      unmount();
    }
  });

  it('round-3 all 500 instances render', () => {
    const { container } = render(
      <>
        {Array.from({ length: 500 }, (_, i) => (
          <ModalTitle key={i}>x</ModalTitle>
        ))}
      </>,
    );
    expect(container.children.length).toBe(500);
  });

  it('round-3 100 rerender cycles', () => {
    const { container, rerender } = render(<ModalTitle>x</ModalTitle>);
    for (let i = 0; i < 100; i++) {
      rerender(<ModalTitle>r3-r-{i}</ModalTitle>);
    }
    expect(container.textContent).toContain('99');
  });

  it('round-4 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<ModalTitle>r4</ModalTitle>);
      unmount();
    }
  });

  it('round-4 renders 1000 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1000 }, (_, i) => (
            <ModalTitle key={i}>r4-{i}</ModalTitle>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 100 different children values', () => {
    for (let i = 0; i < 100; i++) {
      const { container, unmount } = render(<ModalTitle>r4-v-{i}</ModalTitle>);
      expect(container.textContent).toBe(`r4-v-${i}`);
      unmount();
    }
  });

  it('round-4 all 200 instances render', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <ModalTitle key={i}>r4-x</ModalTitle>
        ))}
      </>,
    );
    expect(container.children.length).toBe(200);
  });

  it('round-4 100 rerender cycles', () => {
    const { container, rerender } = render(<ModalTitle>x</ModalTitle>);
    for (let i = 0; i < 100; i++) {
      rerender(<ModalTitle>r4-r-{i}</ModalTitle>);
    }
    expect(container.textContent).toContain('99');
  });
});
