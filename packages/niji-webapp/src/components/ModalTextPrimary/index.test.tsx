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
});
