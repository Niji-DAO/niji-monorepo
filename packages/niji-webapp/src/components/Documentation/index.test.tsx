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

  it('renders exactly 1 section element', () => {
    const { container } = render(<Documentation />);
    expect(container.querySelectorAll('section').length).toBe(1);
  });

  it('renders 1 instance of each sub-section (no duplication)', () => {
    const { container } = render(<Documentation />);
    expect(container.querySelectorAll('[data-testid="about-header"]').length).toBe(1);
    expect(container.querySelectorAll('[data-testid="about-section"]').length).toBe(1);
    expect(container.querySelectorAll('[data-testid="gov-section"]').length).toBe(1);
    expect(container.querySelectorAll('[data-testid="art-section"]').length).toBe(1);
    expect(container.querySelectorAll('[data-testid="nijiders-section"]').length).toBe(1);
  });

  it('renders section without crashing when backgroundColor prop is absent', () => {
    // React JSX 経由で props undefined が渡るとき default param は適用されず、
    // section style は空 (background: undefined → style attribute 空 or 不在)
    expect(() => render(<Documentation />)).not.toThrow();
  });

  it('applies tailwind margin classes (-mb-10 sm:-mb-20)', () => {
    const { container } = render(<Documentation />);
    const sectionClass = container.querySelector('section')?.className ?? '';
    expect(sectionClass).toContain('-mb-10');
    expect(sectionClass).toContain('sm:-mb-20');
  });

  it('sub-sections render in expected order (about-header → about → gov → art → nijiders)', () => {
    const { container } = render(<Documentation />);
    const html = container.innerHTML;
    const idxHeader = html.indexOf('about-header');
    const idxAbout = html.indexOf('about-section');
    const idxGov = html.indexOf('gov-section');
    const idxArt = html.indexOf('art-section');
    const idxNijiders = html.indexOf('nijiders-section');
    expect(idxHeader).toBeLessThan(idxAbout);
    expect(idxAbout).toBeLessThan(idxGov);
    expect(idxGov).toBeLessThan(idxArt);
    expect(idxArt).toBeLessThan(idxNijiders);
  });

  it('renders without crash for transparent background', () => {
    expect(() => render(<Documentation backgroundColor="transparent" />)).not.toThrow();
  });

  it('applies green color via inline style', () => {
    const { container } = render(<Documentation backgroundColor="#00ff00" />);
    expect(container.querySelector('section')?.getAttribute('style')).toContain('rgb(0, 255, 0)');
  });

  it('renders multiple backgroundColors across rerenders', () => {
    const { rerender, container } = render(<Documentation backgroundColor="#ff0000" />);
    expect(container.querySelector('section')?.getAttribute('style')).toContain('rgb(255, 0, 0)');
    rerender(<Documentation backgroundColor="#0000ff" />);
    expect(container.querySelector('section')?.getAttribute('style')).toContain('rgb(0, 0, 255)');
  });

  it('renders all 4 sub-section + 1 header (total 5 sub-renders)', () => {
    const { container } = render(<Documentation />);
    const total =
      container.querySelectorAll('[data-testid="about-header"]').length +
      container.querySelectorAll('[data-testid="about-section"]').length +
      container.querySelectorAll('[data-testid="gov-section"]').length +
      container.querySelectorAll('[data-testid="art-section"]').length +
      container.querySelectorAll('[data-testid="nijiders-section"]').length;
    expect(total).toBe(5);
  });

  it('renders section className without errors when no bg', () => {
    const { container } = render(<Documentation />);
    expect(container.querySelector('section')?.className).toBeTruthy();
  });
});
