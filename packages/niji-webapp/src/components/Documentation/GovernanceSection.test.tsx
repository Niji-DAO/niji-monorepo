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
});
