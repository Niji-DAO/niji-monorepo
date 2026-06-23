import React from 'react';

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-themes', () => ({
  ThemeProvider: ({
    children,
    ...props
  }: { children: React.ReactNode } & Record<string, unknown>) => (
    <div data-testid="next-themes-provider" data-attribute={String(props.attribute ?? '')}>
      {children}
    </div>
  ),
}));

import { ThemeProvider } from './ThemeProvider';

describe('ThemeProvider', () => {
  it('renders NextThemesProvider with children', () => {
    const { container } = render(
      <ThemeProvider>
        <span>child</span>
      </ThemeProvider>,
    );
    expect(container.querySelector('[data-testid="next-themes-provider"]')).not.toBeNull();
    expect(container.querySelector('span')?.textContent).toBe('child');
  });

  it('forwards arbitrary props to NextThemesProvider', () => {
    const { container } = render(
      <ThemeProvider attribute="class">
        <span>x</span>
      </ThemeProvider>,
    );
    expect(
      container
        .querySelector('[data-testid="next-themes-provider"]')
        ?.getAttribute('data-attribute'),
    ).toBe('class');
  });

  it('renders multiple children inside provider', () => {
    const { container } = render(
      <ThemeProvider>
        <span>a</span>
        <span>b</span>
      </ThemeProvider>,
    );
    const spans = container.querySelectorAll('span');
    expect(spans.length).toBe(2);
    expect(spans[0].textContent).toBe('a');
    expect(spans[1].textContent).toBe('b');
  });
});
