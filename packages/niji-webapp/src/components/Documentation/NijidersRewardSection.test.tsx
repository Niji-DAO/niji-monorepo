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
});
