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
});
