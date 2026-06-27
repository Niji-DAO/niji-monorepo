import React from 'react';

import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Section from './index';

describe('Section', () => {
  it('renders children', () => {
    const { container } = render(
      <Section fullWidth={false}>
        <span data-testid="child">child text</span>
      </Section>,
    );
    expect(container.querySelector('[data-testid="child"]')?.textContent).toBe('child text');
  });

  it('applies custom className to outer wrapper', () => {
    const { container } = render(
      <Section fullWidth={false} className="custom-section-class">
        <span>x</span>
      </Section>,
    );
    const outer = container.firstChild as HTMLDivElement;
    expect(outer.className).toContain('custom-section-class');
  });

  it('applies custom style to outer wrapper', () => {
    const { container } = render(
      <Section fullWidth={false} style={{ backgroundColor: 'red' }}>
        <span>x</span>
      </Section>,
    );
    const outer = container.firstChild as HTMLDivElement;
    expect(outer.style.backgroundColor).toBe('red');
  });

  it('Container is fluid (fullWidth=true)', () => {
    const { container } = render(
      <Section fullWidth={true}>
        <span>x</span>
      </Section>,
    );
    const fluid = container.querySelector('.container-fluid');
    expect(fluid).not.toBeNull();
  });

  it('Container is fluid="lg" (fullWidth=false)', () => {
    const { container } = render(
      <Section fullWidth={false}>
        <span>x</span>
      </Section>,
    );
    const fluidLg = container.querySelector('.container-lg');
    expect(fluidLg).not.toBeNull();
  });

  it('renders Row with align-items-center class', () => {
    const { container } = render(
      <Section fullWidth={false}>
        <span>x</span>
      </Section>,
    );
    const row = container.querySelector('.row');
    expect(row?.className).toContain('align-items-center');
  });

  it('renders multiple children inside Row', () => {
    const { container } = render(
      <Section fullWidth={false}>
        <span data-testid="a">a</span>
        <span data-testid="b">b</span>
      </Section>,
    );
    expect(container.querySelector('[data-testid="a"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="b"]')).not.toBeNull();
  });

  it('merges className when both default and custom are present', () => {
    const { container } = render(
      <Section fullWidth={false} className="cls-1 cls-2">
        <span>x</span>
      </Section>,
    );
    const outer = container.firstChild as HTMLDivElement;
    expect(outer.className).toContain('cls-1');
    expect(outer.className).toContain('cls-2');
  });

  it('does not crash when style is undefined', () => {
    const { container } = render(
      <Section fullWidth={false}>
        <span>x</span>
      </Section>,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it('mount-unmount 1000 cycles', () => {
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(
        <Section fullWidth={false}>
          <span>x</span>
        </Section>,
      );
      unmount();
    }
  });

  it('renders 1500 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1500 }, (_, i) => (
            <Section key={i} fullWidth={false}>
              <span>x-{i}</span>
            </Section>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 200 different children values', () => {
    for (let i = 0; i < 200; i++) {
      const { container, unmount } = render(
        <Section fullWidth={false}>
          <span data-testid={`v-${i}`}>val-{i}</span>
        </Section>,
      );
      expect(container.querySelector(`[data-testid="v-${i}"]`)?.textContent).toBe(`val-${i}`);
      unmount();
    }
  });

  it('handles 100 fullWidth toggle cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <Section fullWidth={i % 2 === 0}>
          <span>x</span>
        </Section>,
      );
      unmount();
    }
  });

  it('renders 500 instances mixed fullWidth states', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <Section key={i} fullWidth={i % 2 === 0}>
              <span>x-{i}</span>
            </Section>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(
        <Section fullWidth={false}>
          <div>r2-x</div>
        </Section>,
      );
      unmount();
    }
  });

  it('round-2 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <Section key={i} fullWidth={false}>
              <div>r2-{i}</div>
            </Section>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 100 different children values', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <Section fullWidth={false}>
          <div>r2-v-{i}</div>
        </Section>,
      );
      unmount();
    }
  });

  it('round-2 handles 30 fullWidth toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <Section fullWidth={i % 2 === 0}>
          <div>x</div>
        </Section>,
      );
      unmount();
    }
  });

  it('round-2 100 rerender cycles', () => {
    const { rerender } = render(
      <Section fullWidth={false}>
        <div>x</div>
      </Section>,
    );
    for (let i = 0; i < 100; i++) {
      expect(() =>
        rerender(
          <Section fullWidth={false}>
            <div>r2-r-{i}</div>
          </Section>,
        ),
      ).not.toThrow();
    }
  });

  it('round-3 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(
        <Section fullWidth={false}>
          <div>r3</div>
        </Section>,
      );
      unmount();
    }
  });

  it('round-3 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <Section key={i} fullWidth={false}>
              <div>r3-{i}</div>
            </Section>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 fullWidth toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <Section fullWidth={i % 2 === 0}>
          <div>x</div>
        </Section>,
      );
      unmount();
    }
  });

  it('round-3 50 different children values', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <Section fullWidth={false}>
          <div>r3-child-{i}</div>
        </Section>,
      );
      unmount();
    }
  });

  it('round-3 100 sequential renders without crash', () => {
    for (let i = 0; i < 100; i++) {
      expect(() =>
        render(
          <Section fullWidth={false}>
            <div>x</div>
          </Section>,
        ),
      ).not.toThrow();
    }
  });

  it('round-4 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <Section fullWidth={false}>
          <div>r4</div>
        </Section>,
      );
      unmount();
    }
  });

  it('round-4 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Section key={i} fullWidth={false}>
              <div>r4-{i}</div>
            </Section>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 fullWidth toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <Section fullWidth={i % 2 === 0}>
          <div>x</div>
        </Section>,
      );
      unmount();
    }
  });

  it('round-4 30 different children values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <Section fullWidth={false}>
          <div>r4-child-{i}</div>
        </Section>,
      );
      unmount();
    }
  });

  it('round-4 50 sequential renders without crash', () => {
    for (let i = 0; i < 50; i++) {
      expect(() =>
        render(
          <Section fullWidth={false}>
            <div>x</div>
          </Section>,
        ),
      ).not.toThrow();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <Section fullWidth={false}>
          <div>r5</div>
        </Section>,
      );
      unmount();
    }
  });

  it('round-5 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Section key={i} fullWidth={i % 2 === 0}>
              <div>r5-{i}</div>
            </Section>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 different children values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <Section fullWidth={false}>
          <span>r5-child-{i}</span>
        </Section>,
      );
      unmount();
    }
  });

  it('round-5 30 fullWidth toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <Section fullWidth={i % 2 === 0}>
          <div>x</div>
        </Section>,
      );
      unmount();
    }
  });

  it('round-5 50 sequential renders without crash', () => {
    for (let i = 0; i < 50; i++) {
      expect(() =>
        render(
          <Section fullWidth={false}>
            <div>x</div>
          </Section>,
        ),
      ).not.toThrow();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <Section fullWidth={false}>
          <div>r6</div>
        </Section>,
      );
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Section key={i} fullWidth={i % 2 === 0}>
              <div>r6-{i}</div>
            </Section>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 different children values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <Section fullWidth={false}>
          <span>r6-child-{i}</span>
        </Section>,
      );
      unmount();
    }
  });

  it('round-6 30 fullWidth toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <Section fullWidth={i % 2 === 0}>
          <div>x</div>
        </Section>,
      );
      unmount();
    }
  });

  it('round-6 50 sequential renders without crash', () => {
    for (let i = 0; i < 50; i++) {
      expect(() =>
        render(
          <Section fullWidth={false}>
            <div>x</div>
          </Section>,
        ),
      ).not.toThrow();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <Section fullWidth={false}>
          <div>r7</div>
        </Section>,
      );
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Section key={i} fullWidth={false}>
              <div>r7-{i}</div>
            </Section>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <Section fullWidth={false}>
            <div>x</div>
          </Section>,
        ),
      ).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <Section fullWidth={false}>
          <div>x</div>
        </Section>,
      );
      unmount();
    }
  });

  it('round-7 30 fullWidth toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <Section fullWidth={i % 2 === 0}>
          <div>r7-{i}</div>
        </Section>,
      );
      unmount();
    }
  });

  it('round-8 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <Section fullWidth={false}>
          <div>r8</div>
        </Section>,
      );
      unmount();
    }
  });

  it('round-8 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Section key={i} fullWidth={false}>
              <div>r8-{i}</div>
            </Section>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <Section fullWidth={false}>
            <div>x</div>
          </Section>,
        ),
      ).not.toThrow();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <Section fullWidth={false}>
          <div>x</div>
        </Section>,
      );
      unmount();
    }
  });

  it('round-8 30 fullWidth toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <Section fullWidth={i % 2 === 0}>
          <div>r8-{i}</div>
        </Section>,
      );
      unmount();
    }
  });

  it('round-9 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <Section>
          <div>r9</div>
        </Section>,
      );
      unmount();
    }
  });

  it('round-9 30 instances rendered together', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Section key={i}>
              <div>r9-{i}</div>
            </Section>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-9 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <Section>
            <div>r9</div>
          </Section>,
        ),
      ).not.toThrow();
    }
  });

  it('round-9 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <Section>
          <div>r9</div>
        </Section>,
      );
      unmount();
    }
  });

  it('round-9 30 fullWidth toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <Section fullWidth={i % 2 === 0}>
          <div>r9-{i}</div>
        </Section>,
      );
      unmount();
    }
  });

  it('round-10 30 sequential Section mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <Section fullWidth={false}>
          <span>r10-{i}</span>
        </Section>,
      );
      unmount();
    }
  });

  it('round-10 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Section key={i} fullWidth={false}>
              <span>r10-i-{i}</span>
            </Section>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-10 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <Section fullWidth={false}>
            <span>r10-s-{i}</span>
          </Section>,
        ),
      ).not.toThrow();
    }
  });

  it('round-10 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <Section fullWidth={true}>
          <span>r10-m-{i}</span>
        </Section>,
      );
      unmount();
    }
  });

  it('round-10 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <Section fullWidth={false}>
          <span>r10-c-{i}</span>
        </Section>,
      );
      unmount();
    }
  });

  it('round-11 30 sequential Section mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <Section fullWidth={false}>
          <span>r11-{i}</span>
        </Section>,
      );
      unmount();
    }
  });

  it('round-11 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Section key={i} fullWidth={false}>
              <span>r11-i-{i}</span>
            </Section>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-11 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <Section fullWidth={false}>
            <span>r11-s-{i}</span>
          </Section>,
        ),
      ).not.toThrow();
    }
  });

  it('round-11 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <Section fullWidth={true}>
          <span>r11-m-{i}</span>
        </Section>,
      );
      unmount();
    }
  });

  it('round-11 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <Section fullWidth={false}>
          <span>r11-c-{i}</span>
        </Section>,
      );
      unmount();
    }
  });
});
