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
});
