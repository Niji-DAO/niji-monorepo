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
});
