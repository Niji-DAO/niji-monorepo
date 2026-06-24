import React from 'react';

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import StartOrEndTime from './index';

describe('StartOrEndTime', () => {
  it('renders "starts ..." when current time is before startTime', () => {
    const futureStart = Math.floor(Date.now() / 1000) + 3600;
    const futureEnd = futureStart + 3600;
    const { container } = render(<StartOrEndTime startTime={futureStart} endTime={futureEnd} />);
    expect(container.textContent).toContain('starts');
  });

  it('renders "ends ..." when between start and end', () => {
    const pastStart = Math.floor(Date.now() / 1000) - 3600;
    const futureEnd = Math.floor(Date.now() / 1000) + 3600;
    const { container } = render(<StartOrEndTime startTime={pastStart} endTime={futureEnd} />);
    expect(container.textContent).toContain('ends');
  });

  it('renders "ended ..." when current time is after endTime', () => {
    const pastStart = Math.floor(Date.now() / 1000) - 7200;
    const pastEnd = Math.floor(Date.now() / 1000) - 3600;
    const { container } = render(<StartOrEndTime startTime={pastStart} endTime={pastEnd} />);
    expect(container.textContent).toContain('ended');
  });

  it('handles missing startTime (defaults to 0, treated as past)', () => {
    const pastEnd = Math.floor(Date.now() / 1000) - 100;
    const { container } = render(<StartOrEndTime endTime={pastEnd} />);
    expect(container.textContent).toContain('ended');
  });

  it('handles missing endTime (defaults to 0)', () => {
    const { container } = render(
      <StartOrEndTime startTime={Math.floor(Date.now() / 1000) - 100} />,
    );
    // start in past, end = 0 → in past too → ended
    expect(container.textContent).toContain('ended');
  });

  it('handles startTime === endTime (both in future, treated as starts)', () => {
    const ts = Math.floor(Date.now() / 1000) + 3600;
    const { container } = render(<StartOrEndTime startTime={ts} endTime={ts} />);
    // start = end = future、 まだ始まっていない → starts
    expect(container.textContent).toContain('starts');
  });

  it('handles very large timestamps (year 2100)', () => {
    const year2100 = 4102444800; // 2100-01-01 UTC
    const { container } = render(<StartOrEndTime startTime={year2100} endTime={year2100 + 3600} />);
    expect(container.textContent).toContain('starts');
  });

  it('handles both 0 (epoch 1970, in past)', () => {
    const { container } = render(<StartOrEndTime startTime={0} endTime={0} />);
    expect(container.textContent).toContain('ended');
  });

  it('handles negative startTime (before epoch, in past)', () => {
    const pastEnd = Math.floor(Date.now() / 1000) - 100;
    const { container } = render(<StartOrEndTime startTime={-1000} endTime={pastEnd} />);
    expect(container.textContent).toContain('ended');
  });

  it('does not crash when startTime > endTime (anomaly)', () => {
    const future = Math.floor(Date.now() / 1000) + 3600;
    const past = Math.floor(Date.now() / 1000) - 3600;
    expect(() => render(<StartOrEndTime startTime={future} endTime={past} />)).not.toThrow();
  });
});
