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
});
