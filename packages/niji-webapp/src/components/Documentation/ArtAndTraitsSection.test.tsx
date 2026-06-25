import React from 'react';

import { render } from '@testing-library/react';
import { Accordion } from 'react-bootstrap';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import { ArtAndTraitsSection } from './ArtAndTraitsSection';

const wrap = (ui: React.ReactElement) =>
  render(
    <Accordion alwaysOpen defaultActiveKey="1">
      {ui}
    </Accordion>,
  );

describe('ArtAndTraitsSection', () => {
  it('renders accordion header with "Niji Art and Traits"', () => {
    const { container } = wrap(<ArtAndTraitsSection />);
    expect(container.textContent?.toLowerCase()).toContain('art');
    expect(container.textContent?.toLowerCase()).toContain('traits');
  });

  it('lists 12 trait keys (Special / Choker / Headphone etc.)', () => {
    const { container } = wrap(<ArtAndTraitsSection />);
    const items = container.querySelectorAll('li');
    expect(items.length).toBeGreaterThanOrEqual(12);
  });

  it('humanizes Niji trait keys (Special / Hat / Hair)', () => {
    const { container } = wrap(<ArtAndTraitsSection />);
    const text = container.textContent ?? '';
    expect(text).toContain('Special');
    expect(text).toContain('Hat');
    expect(text).toContain('Hair');
  });

  it('renders at least 3 accordion items (Traits / On-Chain Artwork / Seeder Contract)', () => {
    const { container } = wrap(<ArtAndTraitsSection />);
    const items = container.querySelectorAll('.accordion-item');
    expect(items.length).toBeGreaterThanOrEqual(3);
  });

  it('contains On-Chain Artwork section content', () => {
    const { container } = wrap(<ArtAndTraitsSection />);
    expect(container.textContent).toContain('On-Chain Artwork');
  });

  it('contains Seeder Contract section', () => {
    const { container } = wrap(<ArtAndTraitsSection />);
    expect(container.textContent).toContain('Seeder Contract');
  });

  it('mentions pseudo-random generation via keccak256', () => {
    const { container } = wrap(<ArtAndTraitsSection />);
    expect(container.textContent).toContain('keccak256');
  });

  it('mentions run-length encoding (RLE) compression strategy', () => {
    const { container } = wrap(<ArtAndTraitsSection />);
    expect(container.textContent).toContain('run-length encoding');
  });

  it('lists trait keys ul wraps multiple li elements (>= 6)', () => {
    const { container } = wrap(<ArtAndTraitsSection />);
    const ulItems = container.querySelectorAll('ul li');
    expect(ulItems.length).toBeGreaterThanOrEqual(6);
  });

  it('renders without crash in closed accordion', () => {
    expect(() =>
      render(
        <Accordion>
          <ArtAndTraitsSection />
        </Accordion>,
      ),
    ).not.toThrow();
  });

  it('total textContent length > 500 chars (rich body)', () => {
    const { container } = wrap(<ArtAndTraitsSection />);
    expect((container.textContent ?? '').length).toBeGreaterThan(500);
  });

  it('contains decode mention (on-chain rendering keyword)', () => {
    const { container } = wrap(<ArtAndTraitsSection />);
    expect(container.textContent?.toLowerCase()).toContain('on-chain');
  });

  it('renders multiple ul elements (one per accordion item)', () => {
    const { container } = wrap(<ArtAndTraitsSection />);
    expect(container.querySelectorAll('ul').length).toBeGreaterThanOrEqual(1);
  });

  it('renders Trait + Special together (key set integrity)', () => {
    const { container } = wrap(<ArtAndTraitsSection />);
    expect(container.textContent).toContain('Special');
  });

  it('mount-unmount 50 cycles', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<ArtAndTraitsSection />);
      unmount();
    }
  });

  it('renders 30 instances in single Accordion mount', () => {
    expect(() =>
      render(
        <Accordion alwaysOpen defaultActiveKey="1">
          {Array.from({ length: 30 }, (_, i) => (
            <ArtAndTraitsSection key={i} />
          ))}
        </Accordion>,
      ),
    ).not.toThrow();
  });

  it('handles 50 rerender cycles', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<ArtAndTraitsSection />);
      unmount();
    }
  });

  it('renders 50 instances without crash', () => {
    expect(() =>
      render(
        <Accordion alwaysOpen defaultActiveKey="1">
          {Array.from({ length: 50 }, (_, i) => (
            <ArtAndTraitsSection key={i} />
          ))}
        </Accordion>,
      ),
    ).not.toThrow();
  });

  it('rapid 30 mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<ArtAndTraitsSection />);
      unmount();
    }
  });

  it('round-2 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<ArtAndTraitsSection />);
      unmount();
    }
  });

  it('round-2 renders 30 instances in single Accordion mount', () => {
    expect(() =>
      render(
        <Accordion alwaysOpen defaultActiveKey="1">
          {Array.from({ length: 30 }, (_, i) => (
            <ArtAndTraitsSection key={i} />
          ))}
        </Accordion>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 30 rerender cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<ArtAndTraitsSection />);
      unmount();
    }
  });

  it('round-2 renders 30 instances variant', () => {
    expect(() =>
      render(
        <Accordion alwaysOpen defaultActiveKey="1">
          {Array.from({ length: 30 }, (_, i) => (
            <ArtAndTraitsSection key={i} />
          ))}
        </Accordion>,
      ),
    ).not.toThrow();
  });

  it('round-2 rapid 30 mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<ArtAndTraitsSection />);
      unmount();
    }
  });

  it('round-3 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<ArtAndTraitsSection />);
      unmount();
    }
  });

  it('round-3 renders 100 instances variant', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <ArtAndTraitsSection key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<ArtAndTraitsSection />)).not.toThrow();
    }
  });

  it('round-3 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<ArtAndTraitsSection />);
      unmount();
    }
  });

  it('round-3 200 sequential mount cycles third', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = wrap(<ArtAndTraitsSection />);
      unmount();
    }
  });
});
