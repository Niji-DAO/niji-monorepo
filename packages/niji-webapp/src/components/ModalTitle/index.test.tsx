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
});
