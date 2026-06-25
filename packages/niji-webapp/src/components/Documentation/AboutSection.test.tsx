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

import { AboutHeader, AboutSection } from './AboutSection';

const links = {
  cryptopunksLink: <a href="https://cryptopunks.app/">CryptoPunks</a>,
  playgroundLink: <a href="/playground">Playground</a>,
  publicDomainLink: <a href="https://creativecommons.org/publicdomain/zero/1.0/">public domain</a>,
  compoundGovLink: <a href="https://compound.finance/governance">Compound Governance</a>,
};

describe('AboutHeader', () => {
  it('renders "WTF?" heading', () => {
    const { container } = render(
      <AboutHeader cryptopunksLink={links.cryptopunksLink} playgroundLink={links.playgroundLink} />,
    );
    expect(container.querySelector('h1')?.textContent).toBe('WTF?');
  });

  it('includes CryptoPunks reference in the about text', () => {
    const { container } = render(
      <AboutHeader cryptopunksLink={links.cryptopunksLink} playgroundLink={links.playgroundLink} />,
    );
    expect(container.textContent).toContain('CryptoPunks');
  });

  it('includes Playground reference', () => {
    const { container } = render(
      <AboutHeader cryptopunksLink={links.cryptopunksLink} playgroundLink={links.playgroundLink} />,
    );
    expect(container.textContent).toContain('Playground');
  });

  it('mentions on-chain avatar communities', () => {
    const { container } = render(
      <AboutHeader cryptopunksLink={links.cryptopunksLink} playgroundLink={links.playgroundLink} />,
    );
    expect(container.textContent).toContain('on-chain avatar communities');
  });
});

const wrapAccordion = (ui: React.ReactElement) =>
  render(
    <Accordion alwaysOpen defaultActiveKey="0">
      {ui}
    </Accordion>,
  );

describe('AboutSection', () => {
  it('renders inside accordion item', () => {
    const { container } = wrapAccordion(<AboutSection {...links} />);
    expect(container.textContent?.length).toBeGreaterThan(0);
  });

  it('references compound governance link', () => {
    const { container } = wrapAccordion(<AboutSection {...links} />);
    expect(container.textContent).toContain('Compound Governance');
  });

  it('references public domain link', () => {
    const { container } = wrapAccordion(<AboutSection {...links} />);
    expect(container.textContent).toContain('public domain');
  });

  it('renders exactly 1 h1 in AboutHeader', () => {
    const { container } = render(
      <AboutHeader cryptopunksLink={links.cryptopunksLink} playgroundLink={links.playgroundLink} />,
    );
    expect(container.querySelectorAll('h1').length).toBe(1);
  });

  it('AboutHeader renders 2 link injections', () => {
    const { container } = render(
      <AboutHeader cryptopunksLink={links.cryptopunksLink} playgroundLink={links.playgroundLink} />,
    );
    expect(container.querySelectorAll('a').length).toBe(2);
  });

  it('AboutSection contains both publicDomain + compoundGov links', () => {
    const { container } = wrapAccordion(<AboutSection {...links} />);
    const anchors = Array.from(container.querySelectorAll('a'));
    const hrefs = anchors.map(a => a.getAttribute('href'));
    expect(hrefs).toContain('https://creativecommons.org/publicdomain/zero/1.0/');
    expect(hrefs).toContain('https://compound.finance/governance');
  });

  it('AboutSection renders extensive body (> 500 chars)', () => {
    const { container } = wrapAccordion(<AboutSection {...links} />);
    expect((container.textContent ?? '').length).toBeGreaterThan(500);
  });

  it('AboutSection link hrefs are all https://', () => {
    const { container } = wrapAccordion(<AboutSection {...links} />);
    const anchors = Array.from(container.querySelectorAll('a'));
    anchors.forEach(a => {
      const href = a.getAttribute('href') ?? '';
      expect(href.startsWith('https://')).toBe(true);
    });
  });

  it('AboutHeader renders cryptopunks anchor with correct href', () => {
    const { container } = render(
      <AboutHeader cryptopunksLink={links.cryptopunksLink} playgroundLink={links.playgroundLink} />,
    );
    const anchors = Array.from(container.querySelectorAll('a'));
    expect(anchors.some(a => a.getAttribute('href') === 'https://cryptopunks.app/')).toBe(true);
  });

  it('AboutHeader renders playground anchor with /playground href', () => {
    const { container } = render(
      <AboutHeader cryptopunksLink={links.cryptopunksLink} playgroundLink={links.playgroundLink} />,
    );
    const anchors = Array.from(container.querySelectorAll('a'));
    expect(anchors.some(a => a.getAttribute('href') === '/playground')).toBe(true);
  });

  it('AboutSection accepts only 2 of the 4 prop links variant', () => {
    const minimal = {
      ...links,
      cryptopunksLink: <span />,
      playgroundLink: <span />,
    };
    expect(() => wrapAccordion(<AboutSection {...minimal} />)).not.toThrow();
  });

  it('AboutSection renders without crash when accordion is closed', () => {
    const { container } = render(
      <Accordion>
        <AboutSection {...links} />
      </Accordion>,
    );
    expect(container.textContent?.length).toBeGreaterThan(0);
  });

  it('AboutHeader does not include unused link types', () => {
    const { container } = render(
      <AboutHeader cryptopunksLink={links.cryptopunksLink} playgroundLink={links.playgroundLink} />,
    );
    expect(container.textContent).not.toContain('Compound');
    expect(container.textContent).not.toContain('public domain');
  });

  it('mount-unmount 50 cycles', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = wrapAccordion(<AboutSection {...links} />);
      unmount();
    }
  });

  it('renders 30 instances in single Accordion mount', () => {
    expect(() =>
      render(
        <Accordion alwaysOpen defaultActiveKey="0">
          {Array.from({ length: 30 }, (_, i) => (
            <AboutSection key={i} {...links} />
          ))}
        </Accordion>,
      ),
    ).not.toThrow();
  });

  it('AboutHeader mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<AboutHeader />);
      unmount();
    }
  });

  it('AboutHeader renders 200 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 200 }, (_, i) => (
            <AboutHeader key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rapid 30 mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrapAccordion(<AboutSection {...links} />);
      unmount();
    }
  });

  it('round-2 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrapAccordion(<AboutSection {...links} />);
      unmount();
    }
  });

  it('round-2 renders 30 instances in single Accordion mount', () => {
    expect(() =>
      render(
        <Accordion alwaysOpen defaultActiveKey="0">
          {Array.from({ length: 30 }, (_, i) => (
            <AboutSection key={i} {...links} />
          ))}
        </Accordion>,
      ),
    ).not.toThrow();
  });

  it('round-2 AboutHeader mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<AboutHeader />);
      unmount();
    }
  });

  it('round-2 AboutHeader renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <AboutHeader key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 rapid 30 mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = wrapAccordion(<AboutSection {...links} />);
      unmount();
    }
  });
});
