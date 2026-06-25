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
});
