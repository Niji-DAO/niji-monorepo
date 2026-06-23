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
});
