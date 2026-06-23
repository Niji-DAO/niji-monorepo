import React from 'react';

import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import NavBarLink from './index';

const wrap = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('NavBarLink', () => {
  it('renders internal link <a> with to= path (no target)', () => {
    const { container } = wrap(<NavBarLink to="/foo">internal</NavBarLink>);
    const a = container.querySelector('a');
    expect(a?.getAttribute('href')).toBe('/foo');
    expect(a?.getAttribute('target')).toBe('');
  });

  it('renders external http link with target=_blank', () => {
    const { container } = wrap(<NavBarLink to="https://example.com">ext</NavBarLink>);
    const a = container.querySelector('a');
    expect(a?.getAttribute('target')).toBe('_blank');
  });

  it('renders children text', () => {
    const { container } = wrap(<NavBarLink to="/x">My Link</NavBarLink>);
    expect(container.querySelector('a')?.textContent).toBe('My Link');
  });

  it('merges custom className', () => {
    const { container } = wrap(
      <NavBarLink to="/x" className="extra">
        x
      </NavBarLink>,
    );
    expect(container.querySelector('a')?.className).toContain('extra');
  });

  it('renders nested ReactNode child', () => {
    const { container } = wrap(
      <NavBarLink to="/x">
        <span>nested</span>
      </NavBarLink>,
    );
    expect(container.querySelector('a span')?.textContent).toBe('nested');
  });
});
