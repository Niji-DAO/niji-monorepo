import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModalLabel from './index';

describe('ModalLabel', () => {
  it('renders children inside a div', () => {
    const { container } = render(<ModalLabel>label-text</ModalLabel>);
    expect(container.querySelector('div')?.textContent).toBe('label-text');
  });

  it('renders empty when no children', () => {
    const { container } = render(<ModalLabel />);
    expect(container.querySelector('div')?.textContent).toBe('');
  });

  it('renders numeric children as string', () => {
    const { container } = render(<ModalLabel>{42}</ModalLabel>);
    expect(container.querySelector('div')?.textContent).toBe('42');
  });

  it('renders falsy 0 as "0" (numeric children quirk in React)', () => {
    const { container } = render(<ModalLabel>{0}</ModalLabel>);
    expect(container.querySelector('div')?.textContent).toBe('0');
  });

  it('does NOT render boolean children (true / false → empty)', () => {
    const { container: ct1 } = render(<ModalLabel>{true}</ModalLabel>);
    expect(ct1.querySelector('div')?.textContent).toBe('');
    const { container: ct2 } = render(<ModalLabel>{false}</ModalLabel>);
    expect(ct2.querySelector('div')?.textContent).toBe('');
  });

  it('does NOT render null children', () => {
    const { container } = render(<ModalLabel>{null}</ModalLabel>);
    expect(container.querySelector('div')?.textContent).toBe('');
  });

  it('renders array of children concatenated', () => {
    const { container } = render(<ModalLabel>{['a', 'b', 'c']}</ModalLabel>);
    expect(container.querySelector('div')?.textContent).toBe('abc');
  });

  it('outermost wrapper is a single <div>', () => {
    const { container } = render(<ModalLabel>x</ModalLabel>);
    expect(container.children.length).toBe(1);
    expect(container.firstElementChild?.tagName).toBe('DIV');
  });

  it('applies CSS module className (non-empty class string)', () => {
    const { container } = render(<ModalLabel>x</ModalLabel>);
    const className = container.querySelector('div')?.className;
    expect(className).toBeTruthy();
    expect(className?.length).toBeGreaterThan(0);
  });

  it('renders empty string children', () => {
    const { container } = render(<ModalLabel>{''}</ModalLabel>);
    expect(container.querySelector('div')?.textContent).toBe('');
  });

  it('renders nested elements correctly', () => {
    const { container } = render(
      <ModalLabel>
        <span data-testid="nested">deep</span>
      </ModalLabel>,
    );
    expect(container.querySelector('[data-testid="nested"]')?.textContent).toBe('deep');
  });

  it('renders Fragment children unwrapped', () => {
    const { container } = render(
      <ModalLabel>
        <>
          <span>a</span>
          <span>b</span>
        </>
      </ModalLabel>,
    );
    expect(container.querySelectorAll('span').length).toBe(2);
  });

  it('renders 200-char long string', () => {
    const long = 'a'.repeat(200);
    const { container } = render(<ModalLabel>{long}</ModalLabel>);
    expect(container.querySelector('div')?.textContent?.length).toBe(200);
  });

  it('CSS module class has hash format', () => {
    const { container } = render(<ModalLabel>x</ModalLabel>);
    expect(container.querySelector('div')?.className).toMatch(/_.+/);
  });

  it('rerender updates text', () => {
    const { container, rerender } = render(<ModalLabel>first</ModalLabel>);
    expect(container.querySelector('div')?.textContent).toBe('first');
    rerender(<ModalLabel>second</ModalLabel>);
    expect(container.querySelector('div')?.textContent).toBe('second');
  });

  it('multiple instances share same className', () => {
    const { container } = render(
      <>
        <ModalLabel>a</ModalLabel>
        <ModalLabel>b</ModalLabel>
      </>,
    );
    const divs = container.querySelectorAll('div');
    expect(divs[0].className).toBe(divs[1].className);
  });

  it('unicode children render verbatim', () => {
    const { container } = render(<ModalLabel>テスト</ModalLabel>);
    expect(container.querySelector('div')?.textContent).toBe('テスト');
  });

  it('mixed text + element children', () => {
    const { container } = render(
      <ModalLabel>
        prefix-<em>em</em>
      </ModalLabel>,
    );
    expect(container.querySelector('em')?.textContent).toBe('em');
    expect(container.textContent).toContain('prefix-');
  });

  it('exact div tag name (DIV)', () => {
    const { container } = render(<ModalLabel>x</ModalLabel>);
    expect(container.firstElementChild?.tagName).toBe('DIV');
  });

  it('large 1000-char string renders without crash', () => {
    const huge = 'b'.repeat(1000);
    const { container } = render(<ModalLabel>{huge}</ModalLabel>);
    expect(container.querySelector('div')?.textContent?.length).toBe(1000);
  });

  it('renders 0 (zero) numeric children verbatim', () => {
    const { container } = render(<ModalLabel>{0}</ModalLabel>);
    expect(container.querySelector('div')?.textContent).toBe('0');
  });

  it('renders 5 instances independently', () => {
    const { container } = render(
      <>
        <ModalLabel>a</ModalLabel>
        <ModalLabel>b</ModalLabel>
        <ModalLabel>c</ModalLabel>
        <ModalLabel>d</ModalLabel>
        <ModalLabel>e</ModalLabel>
      </>,
    );
    expect(container.querySelectorAll('div').length).toBe(5);
  });

  it('emoji children render verbatim', () => {
    const { container } = render(<ModalLabel>🎉🎊</ModalLabel>);
    expect(container.querySelector('div')?.textContent).toBe('🎉🎊');
  });

  it('special characters render correctly', () => {
    const { container } = render(<ModalLabel>{'<>&"'}</ModalLabel>);
    expect(container.querySelector('div')?.textContent).toBe('<>&"');
  });

  it('rerender className stays consistent', () => {
    const { container, rerender } = render(<ModalLabel>x</ModalLabel>);
    const cls1 = container.querySelector('div')?.className;
    rerender(<ModalLabel>y</ModalLabel>);
    expect(container.querySelector('div')?.className).toBe(cls1);
  });

  it('renders nested span children', () => {
    const { container } = render(
      <ModalLabel>
        <span data-testid="inner">inner</span>
      </ModalLabel>,
    );
    expect(container.querySelector('[data-testid="inner"]')?.textContent).toBe('inner');
  });

  it('renders 300 char long text', () => {
    const longStr = 'x'.repeat(300);
    const { container } = render(<ModalLabel>{longStr}</ModalLabel>);
    expect(container.querySelector('div')?.textContent).toBe(longStr);
  });

  it('rerender from "a" to "b" updates label', () => {
    const { container, rerender } = render(<ModalLabel>a</ModalLabel>);
    expect(container.querySelector('div')?.textContent).toBe('a');
    rerender(<ModalLabel>b</ModalLabel>);
    expect(container.querySelector('div')?.textContent).toBe('b');
  });

  it('renders 5 instances independently', () => {
    const { container } = render(
      <>
        <ModalLabel>A</ModalLabel>
        <ModalLabel>B</ModalLabel>
        <ModalLabel>C</ModalLabel>
        <ModalLabel>D</ModalLabel>
        <ModalLabel>E</ModalLabel>
      </>,
    );
    expect(container.querySelectorAll('div').length).toBe(5);
  });

  it('renders unicode label verbatim', () => {
    const { container } = render(<ModalLabel>{'絵文字-日本語'}</ModalLabel>);
    expect(container.querySelector('div')?.textContent).toBe('絵文字-日本語');
  });

  it('renders boolean false children as empty', () => {
    const { container } = render(<ModalLabel>{false}</ModalLabel>);
    expect(container.querySelector('div')?.textContent).toBe('');
  });

  it('renders null children as empty', () => {
    const { container } = render(<ModalLabel>{null}</ModalLabel>);
    expect(container.querySelector('div')?.textContent).toBe('');
  });

  it('renders 20 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 20 }, (_, i) => (
          <ModalLabel key={i}>{`label-${i}`}</ModalLabel>
        ))}
      </>,
    );
    expect(container.querySelectorAll('div').length).toBe(20);
  });

  it('renders special characters', () => {
    const { container } = render(<ModalLabel>{'<>&"\''}</ModalLabel>);
    expect(container.querySelector('div')?.textContent).toBe('<>&"\'');
  });

  it('renders mixed text + nested element', () => {
    const { container } = render(
      <ModalLabel>
        prefix-<span>inner</span>-suffix
      </ModalLabel>,
    );
    expect(container.querySelector('div')?.textContent).toContain('prefix');
    expect(container.querySelector('div')?.textContent).toContain('inner');
    expect(container.querySelector('div')?.textContent).toContain('suffix');
  });
});
