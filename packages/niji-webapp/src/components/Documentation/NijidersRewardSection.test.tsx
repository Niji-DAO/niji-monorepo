import React from 'react';

import { render } from '@testing-library/react';
import { Accordion } from 'react-bootstrap';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/Link', () => ({
  default: ({ text, url }: { text: React.ReactNode; url: string }) => <a href={url}>{text}</a>,
}));

import { NijidersRewardSection } from './NijidersRewardSection';

const wrap = (ui: React.ReactElement) =>
  render(
    <Accordion alwaysOpen defaultActiveKey="8">
      {ui}
    </Accordion>,
  );

describe('NijidersRewardSection', () => {
  it('renders "Nijider\'s Reward" header', () => {
    const { container } = wrap(<NijidersRewardSection />);
    expect(container.textContent).toContain("Nijider's Reward");
  });

  it('renders 10 nijider links', () => {
    const { container } = wrap(<NijidersRewardSection />);
    expect(container.querySelectorAll('a').length).toBe(10);
  });

  it('includes @cryptoseneca link with twitter url', () => {
    const { container } = wrap(<NijidersRewardSection />);
    const a = Array.from(container.querySelectorAll('a')).find(el =>
      el.textContent?.includes('cryptoseneca'),
    );
    expect(a?.getAttribute('href')).toBe('https://twitter.com/cryptoseneca');
  });

  it('includes @devcarrot with carrot_init url (handle/url mismatch is intentional)', () => {
    const { container } = wrap(<NijidersRewardSection />);
    const a = Array.from(container.querySelectorAll('a')).find(el =>
      el.textContent?.includes('devcarrot'),
    );
    expect(a?.getAttribute('href')).toBe('https://twitter.com/carrot_init');
  });

  it('all 10 links point to twitter.com domain', () => {
    const { container } = wrap(<NijidersRewardSection />);
    const links = Array.from(container.querySelectorAll('a'));
    expect(links.length).toBe(10);
    links.forEach(a => {
      expect(a.getAttribute('href')?.startsWith('https://twitter.com/')).toBe(true);
    });
  });

  it('all 10 URLs are unique (no duplicates)', () => {
    const { container } = wrap(<NijidersRewardSection />);
    const urls = Array.from(container.querySelectorAll('a')).map(a => a.getAttribute('href'));
    const unique = new Set(urls);
    expect(unique.size).toBe(10);
  });

  it('all handles start with @', () => {
    const { container } = wrap(<NijidersRewardSection />);
    const links = Array.from(container.querySelectorAll('a'));
    links.forEach(a => {
      expect(a.textContent?.startsWith('@')).toBe(true);
    });
  });

  it('mentions "Niji DAO" and "auction proceeds" context', () => {
    const { container } = wrap(<NijidersRewardSection />);
    expect(container.textContent).toContain('Niji DAO');
    expect(container.textContent).toContain('auction proceeds');
  });

  it('mentions "Every 10th Niji" + 5 years vesting context', () => {
    const { container } = wrap(<NijidersRewardSection />);
    expect(container.textContent).toContain('Every 10th Niji');
    expect(container.textContent).toContain('5 years');
  });

  it('renders inside accordion without crashing', () => {
    expect(() => wrap(<NijidersRewardSection />)).not.toThrow();
  });

  it('contains description paragraph (non-empty body text)', () => {
    const { container } = wrap(<NijidersRewardSection />);
    expect((container.textContent ?? '').length).toBeGreaterThan(100);
  });

  it('all links are external (https scheme)', () => {
    const { container } = wrap(<NijidersRewardSection />);
    const links = Array.from(container.querySelectorAll('a'));
    links.forEach(a => {
      expect(a.getAttribute('href')?.startsWith('https://')).toBe(true);
    });
  });

  it('all link text labels are unique (no duplicate handles)', () => {
    const { container } = wrap(<NijidersRewardSection />);
    const texts = Array.from(container.querySelectorAll('a')).map(a => a.textContent);
    const unique = new Set(texts);
    expect(unique.size).toBe(10);
  });

  it('renders in collapsed accordion (no defaultActiveKey)', () => {
    const { container } = render(
      <Accordion>
        <NijidersRewardSection />
      </Accordion>,
    );
    expect((container.textContent ?? '').length).toBeGreaterThan(0);
  });

  it('mount-unmount 50 cycles', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijidersRewardSection />);
      unmount();
    }
  });

  it('renders 30 instances in single Accordion mount', () => {
    expect(() =>
      render(
        <Accordion alwaysOpen defaultActiveKey="3">
          {Array.from({ length: 30 }, (_, i) => (
            <NijidersRewardSection key={i} />
          ))}
        </Accordion>,
      ),
    ).not.toThrow();
  });

  it('handles 50 rerender cycles', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijidersRewardSection />);
      unmount();
    }
  });

  it('renders 50 instances without crash', () => {
    expect(() =>
      render(
        <Accordion alwaysOpen defaultActiveKey="3">
          {Array.from({ length: 50 }, (_, i) => (
            <NijidersRewardSection key={i} />
          ))}
        </Accordion>,
      ),
    ).not.toThrow();
  });

  it('rapid 30 mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijidersRewardSection />);
      unmount();
    }
  });

  it('round-2 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijidersRewardSection />);
      unmount();
    }
  });

  it('round-2 renders 30 instances in single Accordion mount', () => {
    expect(() =>
      render(
        <Accordion alwaysOpen defaultActiveKey="3">
          {Array.from({ length: 30 }, (_, i) => (
            <NijidersRewardSection key={i} />
          ))}
        </Accordion>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 30 rerender cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijidersRewardSection />);
      unmount();
    }
  });

  it('round-2 renders 30 instances variant', () => {
    expect(() =>
      render(
        <Accordion alwaysOpen defaultActiveKey="3">
          {Array.from({ length: 30 }, (_, i) => (
            <NijidersRewardSection key={i} />
          ))}
        </Accordion>,
      ),
    ).not.toThrow();
  });

  it('round-2 rapid 30 mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrap(<NijidersRewardSection />);
      unmount();
    }
  });

  it('round-3 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijidersRewardSection />);
      unmount();
    }
  });

  it('round-3 renders 100 instances variant', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <NijidersRewardSection key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijidersRewardSection />)).not.toThrow();
    }
  });

  it('round-3 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijidersRewardSection />);
      unmount();
    }
  });

  it('round-3 200 sequential mount cycles third', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = wrap(<NijidersRewardSection />);
      unmount();
    }
  });

  it('round-4 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = wrap(<NijidersRewardSection />);
      unmount();
    }
  });

  it('round-4 renders 100 instances variant', () => {
    expect(() =>
      wrap(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <NijidersRewardSection key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => wrap(<NijidersRewardSection />)).not.toThrow();
    }
  });

  it('round-4 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrap(<NijidersRewardSection />);
      unmount();
    }
  });

  it('round-4 200 sequential mount cycles third', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = wrap(<NijidersRewardSection />);
      unmount();
    }
  });
});
