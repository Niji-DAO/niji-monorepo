import React from 'react';

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/Link', () => ({
  default: ({ text, url }: { text: React.ReactNode; url: string }) => <a href={url}>{text}</a>,
}));

vi.mock('@/layout/Section', () => ({
  default: ({
    children,
    className,
    style,
  }: {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
  }) => (
    <section className={className} style={style}>
      {children}
    </section>
  ),
}));

vi.mock('./AboutSection', () => ({
  AboutHeader: () => <div data-testid="about-header" />,
  AboutSection: () => <div data-testid="about-section" />,
}));

vi.mock('./ArtAndTraitsSection', () => ({
  ArtAndTraitsSection: () => <div data-testid="art-section" />,
}));

vi.mock('./GovernanceSection', () => ({
  GovernanceSection: () => <div data-testid="gov-section" />,
}));

vi.mock('./NijidersRewardSection', () => ({
  NijidersRewardSection: () => <div data-testid="nijiders-section" />,
}));

import Documentation from './index';

describe('Documentation', () => {
  it('renders 5 sub-sections (AboutHeader + 4 Accordion items)', () => {
    const { container } = render(<Documentation />);
    expect(container.querySelector('[data-testid="about-header"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="about-section"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="gov-section"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="art-section"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="nijiders-section"]')).not.toBeNull();
  });

  it('applies background color when provided', () => {
    const { container } = render(<Documentation backgroundColor="#000" />);
    expect(container.querySelector('section')?.getAttribute('style')).toContain(
      'background: rgb(0, 0, 0)',
    );
  });

  it('forwards backgroundColor as inline style', () => {
    const { container } = render(<Documentation backgroundColor="#abc" />);
    expect(container.querySelector('section')?.getAttribute('style')).toBeTruthy();
  });

  it('renders documentation section class', () => {
    const { container } = render(<Documentation />);
    expect(container.querySelector('section')?.className).toMatch(/documentation/i);
  });
});
