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
});
