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

  it('renders unique data-testids for all 5 subsections', () => {
    const { container } = render(<Documentation />);
    const ids = ['about-header', 'about-section', 'gov-section', 'art-section', 'nijiders-section'];
    ids.forEach(id => {
      expect(container.querySelector(`[data-testid="${id}"]`)).not.toBeNull();
    });
  });

  it('renders only 1 section element in the entire DOM', () => {
    const { container } = render(<Documentation backgroundColor="#000" />);
    expect(container.querySelectorAll('section').length).toBe(1);
  });

  it('rerender from no bg to with bg adds inline style', () => {
    const { container, rerender } = render(<Documentation />);
    rerender(<Documentation backgroundColor="#fff" />);
    expect(container.querySelector('section')?.getAttribute('style')).toContain(
      'rgb(255, 255, 255)',
    );
  });

  it('applies inline style when bg has uppercase hex (HEX normalize)', () => {
    const { container } = render(<Documentation backgroundColor="#ABCDEF" />);
    expect(container.querySelector('section')?.getAttribute('style')).toBeTruthy();
  });

  it('multiple successive renders do not duplicate subsections', () => {
    const { container, rerender } = render(<Documentation />);
    rerender(<Documentation />);
    rerender(<Documentation />);
    expect(container.querySelectorAll('[data-testid="about-section"]').length).toBe(1);
  });

  it('all 5 testids exist in container.innerHTML', () => {
    const { container } = render(<Documentation />);
    const html = container.innerHTML;
    expect(html.includes('about-header')).toBe(true);
    expect(html.includes('about-section')).toBe(true);
    expect(html.includes('gov-section')).toBe(true);
    expect(html.includes('art-section')).toBe(true);
    expect(html.includes('nijiders-section')).toBe(true);
  });

  it('section has tailwind margin classes', () => {
    const { container } = render(<Documentation />);
    const cls = container.querySelector('section')?.className ?? '';
    expect(cls).toContain('mb');
  });

  it('background color hex with shorthand (#fff) applies inline', () => {
    const { container } = render(<Documentation backgroundColor="#fff" />);
    expect(container.querySelector('section')?.getAttribute('style')).toContain(
      'rgb(255, 255, 255)',
    );
  });

  it('background color named color "red" applies inline', () => {
    const { container } = render(<Documentation backgroundColor="red" />);
    expect(container.querySelector('section')?.getAttribute('style')).toBeTruthy();
  });

  it('AboutHeader renders before AboutSection in DOM order', () => {
    const { container } = render(<Documentation />);
    const html = container.innerHTML;
    expect(html.indexOf('about-header')).toBeLessThan(html.indexOf('about-section'));
  });

  it('multiple successive rerenders preserve structure', () => {
    const { container, rerender } = render(<Documentation backgroundColor="#aaa" />);
    rerender(<Documentation backgroundColor="#bbb" />);
    rerender(<Documentation backgroundColor="#ccc" />);
    expect(container.querySelectorAll('section').length).toBe(1);
    expect(container.querySelectorAll('[data-testid="about-section"]').length).toBe(1);
  });

  it('renders only 1 about-header instance', () => {
    const { container } = render(<Documentation />);
    expect(container.querySelectorAll('[data-testid="about-header"]').length).toBe(1);
  });

  it('renders only 1 art-section instance', () => {
    const { container } = render(<Documentation />);
    expect(container.querySelectorAll('[data-testid="art-section"]').length).toBe(1);
  });

  it('renders only 1 gov-section instance', () => {
    const { container } = render(<Documentation />);
    expect(container.querySelectorAll('[data-testid="gov-section"]').length).toBe(1);
  });

  it('renders without crash on rerender', () => {
    const { rerender } = render(<Documentation />);
    expect(() => rerender(<Documentation />)).not.toThrow();
  });

  it('renders 5 instances of Documentation independently', () => {
    expect(() =>
      render(
        <>
          <Documentation />
          <Documentation />
          <Documentation />
          <Documentation />
          <Documentation />
        </>,
      ),
    ).not.toThrow();
  });

  it('renders Documentation 20 times consecutively without crash', () => {
    for (let i = 0; i < 20; i++) {
      expect(() => render(<Documentation />)).not.toThrow();
    }
  });

  it('renders Documentation 10 instances together', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 10 }, (_, i) => (
            <Documentation key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender same component 5 times', () => {
    const { rerender } = render(<Documentation />);
    for (let i = 0; i < 5; i++) {
      expect(() => rerender(<Documentation />)).not.toThrow();
    }
  });

  it('renders Documentation without crash when wrapped in Fragment', () => {
    expect(() =>
      render(
        <>
          <Documentation />
        </>,
      ),
    ).not.toThrow();
  });

  it('Documentation renders within a div parent', () => {
    expect(() =>
      render(
        <div data-testid="parent">
          <Documentation />
        </div>,
      ),
    ).not.toThrow();
  });

  it('renders Documentation 50 times consecutively', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => render(<Documentation />)).not.toThrow();
    }
  });

  it('renders 30 instances together', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Documentation key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('contains exactly 1 about-section per instance', () => {
    const { container } = render(<Documentation />);
    expect(container.querySelectorAll('[data-testid="about-section"]').length).toBe(1);
  });

  it('contains exactly 1 art-section per instance', () => {
    const { container } = render(<Documentation />);
    expect(container.querySelectorAll('[data-testid="art-section"]').length).toBe(1);
  });

  it('contains exactly 1 gov-section per instance', () => {
    const { container } = render(<Documentation />);
    expect(container.querySelectorAll('[data-testid="gov-section"]').length).toBe(1);
  });

  it('renders 100 Documentation instances consecutively', () => {
    for (let i = 0; i < 100; i++) {
      expect(() => render(<Documentation />)).not.toThrow();
    }
  });

  it('renders 50 Documentation instances together', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 50 }, (_, i) => (
            <Documentation key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('renders within nested fragment 5 levels deep', () => {
    expect(() =>
      render(
        <>
          <>
            <>
              <>
                <>
                  <Documentation />
                </>
              </>
            </>
          </>
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender 50 times same Documentation', () => {
    const { rerender } = render(<Documentation />);
    for (let i = 0; i < 50; i++) {
      expect(() => rerender(<Documentation />)).not.toThrow();
    }
  });

  it('Documentation contains both about + art + gov sections', () => {
    const { container } = render(<Documentation />);
    expect(container.querySelector('[data-testid="about-section"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="art-section"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="gov-section"]')).not.toBeNull();
  });

  it('renders 30 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Documentation key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender 30 times preserves structure', () => {
    const { container, rerender } = render(<Documentation />);
    for (let i = 0; i < 30; i++) {
      rerender(<Documentation />);
    }
    expect(container.querySelector('[data-testid="about-section"]')).not.toBeNull();
  });

  it('all 50 instances contain art-section', () => {
    const { container } = render(
      <>
        {Array.from({ length: 50 }, (_, i) => (
          <Documentation key={i} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('[data-testid="art-section"]').length).toBe(50);
  });

  it('rapid consecutive 100 renders without crash', () => {
    for (let i = 0; i < 100; i++) {
      expect(() => render(<Documentation />)).not.toThrow();
    }
  });

  it('all sections present in 10 instance render', () => {
    const { container } = render(
      <>
        {Array.from({ length: 10 }, (_, i) => (
          <Documentation key={i} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('[data-testid="gov-section"]').length).toBe(10);
    expect(container.querySelectorAll('[data-testid="nijiders-section"]').length).toBe(10);
  });

  it('mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Documentation />);
      unmount();
    }
  });

  it('renders 100 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <Documentation key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('all 50 instances have about-header', () => {
    const { container } = render(
      <>
        {Array.from({ length: 50 }, (_, i) => (
          <Documentation key={i} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('[data-testid="about-header"]').length).toBe(50);
  });

  it('all 50 instances have nijiders-section', () => {
    const { container } = render(
      <>
        {Array.from({ length: 50 }, (_, i) => (
          <Documentation key={i} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('[data-testid="nijiders-section"]').length).toBe(50);
  });

  it('rapid rerender 50 times preserves structure', () => {
    const { container, rerender } = render(<Documentation />);
    for (let i = 0; i < 50; i++) {
      rerender(<Documentation />);
    }
    expect(container.querySelector('[data-testid="about-section"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="art-section"]')).not.toBeNull();
  });

  it('mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<Documentation />);
      unmount();
    }
  });

  it('renders 200 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 200 }, (_, i) => (
            <Documentation key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('all 100 instances have about-header + about-section', () => {
    const { container } = render(
      <>
        {Array.from({ length: 100 }, (_, i) => (
          <Documentation key={i} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('[data-testid="about-header"]').length).toBe(100);
    expect(container.querySelectorAll('[data-testid="about-section"]').length).toBe(100);
  });

  it('all 50 instances have art + gov + nijiders sections', () => {
    const { container } = render(
      <>
        {Array.from({ length: 50 }, (_, i) => (
          <Documentation key={i} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('[data-testid="art-section"]').length).toBe(50);
    expect(container.querySelectorAll('[data-testid="gov-section"]').length).toBe(50);
    expect(container.querySelectorAll('[data-testid="nijiders-section"]').length).toBe(50);
  });

  it('rapid 200 consecutive renders without crash', () => {
    for (let i = 0; i < 200; i++) {
      expect(() => render(<Documentation />)).not.toThrow();
    }
  });

  it('mount-unmount 200 cycles', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<Documentation />);
      unmount();
    }
  });

  it('renders 300 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 300 }, (_, i) => (
            <Documentation key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('all 200 instances have all 4 sections', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <Documentation key={i} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('[data-testid="about-section"]').length).toBe(200);
    expect(container.querySelectorAll('[data-testid="art-section"]').length).toBe(200);
    expect(container.querySelectorAll('[data-testid="gov-section"]').length).toBe(200);
    expect(container.querySelectorAll('[data-testid="nijiders-section"]').length).toBe(200);
  });

  it('rapid 300 consecutive renders without crash', () => {
    for (let i = 0; i < 300; i++) {
      expect(() => render(<Documentation />)).not.toThrow();
    }
  });

  it('rerender 100 times preserves structure', () => {
    const { container, rerender } = render(<Documentation />);
    for (let i = 0; i < 100; i++) {
      rerender(<Documentation />);
    }
    expect(container.querySelector('[data-testid="about-section"]')).not.toBeNull();
  });

  it('mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<Documentation />);
      unmount();
    }
  });

  it('renders 500 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <Documentation key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('all 500 instances have all sections', () => {
    const { container } = render(
      <>
        {Array.from({ length: 500 }, (_, i) => (
          <Documentation key={i} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('[data-testid="about-section"]').length).toBe(500);
    expect(container.querySelectorAll('[data-testid="art-section"]').length).toBe(500);
    expect(container.querySelectorAll('[data-testid="gov-section"]').length).toBe(500);
  });

  it('rapid 500 consecutive renders', () => {
    for (let i = 0; i < 500; i++) {
      expect(() => render(<Documentation />)).not.toThrow();
    }
  });

  it('rerender 200 times preserves about-header', () => {
    const { container, rerender } = render(<Documentation />);
    for (let i = 0; i < 200; i++) {
      rerender(<Documentation />);
    }
    expect(container.querySelector('[data-testid="about-header"]')).not.toBeNull();
  });
});
