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
});
