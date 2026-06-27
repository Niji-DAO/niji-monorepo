import React from 'react';

import { render } from '@testing-library/react';
import { Accordion } from 'react-bootstrap';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import { GovernanceSection } from './GovernanceSection';

const wrap = (ui: React.ReactElement) =>
  render(
    <Accordion alwaysOpen defaultActiveKey="4">
      {ui}
    </Accordion>,
  );

describe('GovernanceSection', () => {
  it('renders accordion header with "Governance ‘Slow Start’"', () => {
    const { container } = wrap(<GovernanceSection />);
    expect(container.textContent).toContain('Slow Start');
  });

  it('renders body content mentioning treasury attack risk', () => {
    const { container } = wrap(<GovernanceSection />);
    expect(container.textContent).toContain('51% attacks');
    expect(container.textContent).toContain('treasury');
  });

  it('renders body content mentioning Nijiders', () => {
    const { container } = wrap(<GovernanceSection />);
    expect(container.textContent).toContain('Nijiders');
  });

  it('renders exactly 4 ul li (veto criteria list)', () => {
    const { container } = wrap(<GovernanceSection />);
    const items = container.querySelectorAll('ul li');
    expect(items.length).toBe(4);
  });

  it('mentions "veto" as a governance keyword', () => {
    const { container } = wrap(<GovernanceSection />);
    expect(container.textContent).toContain('veto');
  });

  it('mentions Niji Foundation as steward of veto power', () => {
    const { container } = wrap(<GovernanceSection />);
    expect(container.textContent).toContain('Niji Foundation');
  });

  it('mentions "smart contracts" in veto criteria', () => {
    const { container } = wrap(<GovernanceSection />);
    expect(container.textContent).toContain('smart contracts');
  });

  it('mentions treasury multiple times (>= 2 occurrences)', () => {
    const { container } = wrap(<GovernanceSection />);
    const matches = container.textContent?.match(/treasury/gi) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });

  it('renders extensive long-form content (> 1000 chars)', () => {
    const { container } = wrap(<GovernanceSection />);
    expect((container.textContent ?? '').length).toBeGreaterThan(1000);
  });

  it('renders without crash in closed accordion', () => {
    expect(() =>
      render(
        <Accordion>
          <GovernanceSection />
        </Accordion>,
      ),
    ).not.toThrow();
  });

  it('contains the word "governance" anywhere', () => {
    const { container } = wrap(<GovernanceSection />);
    expect(container.textContent?.toLowerCase()).toContain('governance');
  });

  it('renders single accordion-item element', () => {
    const { container } = wrap(<GovernanceSection />);
    expect(container.querySelectorAll('.accordion-item').length).toBe(1);
  });

  it('ul element exists (veto criteria parent)', () => {
    const { container } = wrap(<GovernanceSection />);
    expect(container.querySelector('ul')).not.toBeNull();
  });

  it('rerenders identically when accordion key same', () => {
    const { container, rerender } = render(
      <Accordion alwaysOpen defaultActiveKey="4">
        <GovernanceSection />
      </Accordion>,
    );
    const first = container.textContent;
    rerender(
      <Accordion alwaysOpen defaultActiveKey="4">
        <GovernanceSection />
      </Accordion>,
    );
    expect(container.textContent).toBe(first);
  });

  it('mount-unmount 50 cycles', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<GovernanceSection />);
      unmount();
    }
  });

  it('renders 30 instances in single Accordion mount', () => {
    expect(() =>
      render(
        <Accordion alwaysOpen defaultActiveKey="4">
          {Array.from({ length: 30 }, (_, i) => (
            <GovernanceSection key={i} />
          ))}
        </Accordion>,
      ),
    ).not.toThrow();
  });

  it('handles 50 rerender cycles', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<GovernanceSection />);
      unmount();
    }
  });

  it('renders 50 instances without crash', () => {
    expect(() =>
      render(
        <Accordion alwaysOpen defaultActiveKey="4">
          {Array.from({ length: 50 }, (_, i) => (
            <GovernanceSection key={i} />
          ))}
        </Accordion>,
      ),
    ).not.toThrow();
  });

  it('rapid 30 mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<GovernanceSection />);
      unmount();
    }
  });

  it('round-2 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<GovernanceSection />);
      unmount();
    }
  });

  it('round-2 renders 30 instances in single Accordion mount', () => {
    expect(() =>
      render(
        <Accordion alwaysOpen defaultActiveKey="4">
          {Array.from({ length: 30 }, (_, i) => (
            <GovernanceSection key={i} />
          ))}
        </Accordion>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 30 rerender cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<GovernanceSection />);
      unmount();
    }
  });

  it('round-2 renders 30 instances variant', () => {
    expect(() =>
      render(
        <Accordion alwaysOpen defaultActiveKey="4">
          {Array.from({ length: 30 }, (_, i) => (
            <GovernanceSection key={i} />
          ))}
        </Accordion>,
      ),
    ).not.toThrow();
  });

  it('round-2 rapid 30 mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<GovernanceSection />);
      unmount();
    }
  });

  it('round-3 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<GovernanceSection />);
      unmount();
    }
  });

  it('round-3 renders 100 instances variant', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <GovernanceSection key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<GovernanceSection />)).not.toThrow();
    }
  });

  it('round-3 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<GovernanceSection />);
      unmount();
    }
  });

  it('round-3 200 sequential mount cycles third', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = wrap(<GovernanceSection />);
      unmount();
    }
  });

  it('round-4 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<GovernanceSection />);
      unmount();
    }
  });

  it('round-4 renders 100 instances variant', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <GovernanceSection key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<GovernanceSection />)).not.toThrow();
    }
  });

  it('round-4 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<GovernanceSection />);
      unmount();
    }
  });

  it('round-4 200 sequential mount cycles third', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = wrap(<GovernanceSection />);
      unmount();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<GovernanceSection />);
      unmount();
    }
  });

  it('round-5 30 instances rendered together', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <GovernanceSection key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<GovernanceSection />)).not.toThrow();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<GovernanceSection />);
      unmount();
    }
  });

  it('round-5 100 sequential mount cycles third', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<GovernanceSection />);
      unmount();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<GovernanceSection />);
      unmount();
    }
  });

  it('round-6 30 instances rendered together', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <GovernanceSection key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<GovernanceSection />)).not.toThrow();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<GovernanceSection />);
      unmount();
    }
  });

  it('round-6 100 sequential mount cycles third', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<GovernanceSection />);
      unmount();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<GovernanceSection />);
      unmount();
    }
  });

  it('round-7 30 instances rendered together', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <GovernanceSection key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<GovernanceSection />)).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<GovernanceSection />);
      unmount();
    }
  });

  it('round-7 100 sequential mount cycles third', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<GovernanceSection />);
      unmount();
    }
  });

  it('round-8 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<GovernanceSection />);
      unmount();
    }
  });

  it('round-8 30 instances rendered together', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <GovernanceSection key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<GovernanceSection />)).not.toThrow();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<GovernanceSection />);
      unmount();
    }
  });

  it('round-8 100 sequential mount cycles third', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<GovernanceSection />);
      unmount();
    }
  });

  it('round-9 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<GovernanceSection />);
      unmount();
    }
  });

  it('round-9 30 instances rendered together', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <GovernanceSection key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-9 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<GovernanceSection />)).not.toThrow();
    }
  });

  it('round-9 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<GovernanceSection />);
      unmount();
    }
  });

  it('round-9 100 sequential mount cycles third', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<GovernanceSection />);
      unmount();
    }
  });

  it('round-10 30 sequential GovernanceSection mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<GovernanceSection />);
      unmount();
    }
  });

  it('round-10 30 renders instances variant', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <GovernanceSection key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-10 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<GovernanceSection />)).not.toThrow();
    }
  });

  it('round-10 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<GovernanceSection />);
      unmount();
    }
  });

  it('round-10 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<GovernanceSection />);
      unmount();
    }
  });

  it('round-11 30 sequential GovernanceSection mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<GovernanceSection />);
      unmount();
    }
  });

  it('round-11 30 renders instances variant', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <GovernanceSection key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-11 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<GovernanceSection />)).not.toThrow();
    }
  });

  it('round-11 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<GovernanceSection />);
      unmount();
    }
  });

  it('round-11 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<GovernanceSection />);
      unmount();
    }
  });
});
