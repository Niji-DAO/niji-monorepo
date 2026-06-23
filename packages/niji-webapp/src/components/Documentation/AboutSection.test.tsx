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
});
