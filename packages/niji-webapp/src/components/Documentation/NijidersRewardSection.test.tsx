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
});
