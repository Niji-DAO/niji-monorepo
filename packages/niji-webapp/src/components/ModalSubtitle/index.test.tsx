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
});
