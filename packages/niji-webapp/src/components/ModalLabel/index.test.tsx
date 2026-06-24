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
});
