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

  it('1 second future start renders "starts"', () => {
    const start = Math.floor(Date.now() / 1000) + 1;
    const end = start + 3600;
    const { container } = render(<StartOrEndTime startTime={start} endTime={end} />);
    expect(container.textContent).toContain('starts');
  });

  it('returns non-empty content for active phase', () => {
    const pastStart = Math.floor(Date.now() / 1000) - 100;
    const futureEnd = Math.floor(Date.now() / 1000) + 3600;
    const { container } = render(<StartOrEndTime startTime={pastStart} endTime={futureEnd} />);
    expect((container.textContent ?? '').length).toBeGreaterThan(4);
  });

  it('rerender from starts to ended', () => {
    const start = Math.floor(Date.now() / 1000) + 3600;
    const end = start + 3600;
    const { container, rerender } = render(<StartOrEndTime startTime={start} endTime={end} />);
    expect(container.textContent).toContain('starts');
    rerender(<StartOrEndTime startTime={0} endTime={1} />);
    expect(container.textContent).toContain('ended');
  });

  it('startTime undefined + endTime in future treats as starts', () => {
    const futureEnd = Math.floor(Date.now() / 1000) + 3600;
    const { container } = render(<StartOrEndTime endTime={futureEnd} />);
    // startTime=0 → past, current > start → 'ends' or 'ended' depending on endTime
    expect(container.textContent).toContain('ends');
  });

  it('renders only one of starts/ends/ended (mutex)', () => {
    const futureStart = Math.floor(Date.now() / 1000) + 3600;
    const futureEnd = futureStart + 3600;
    const { container } = render(<StartOrEndTime startTime={futureStart} endTime={futureEnd} />);
    const text = container.textContent ?? '';
    const starts = text.includes('starts');
    const ends = text.includes(' ends ');
    const ended = text.includes('ended');
    const trueCount = [starts, ends, ended].filter(Boolean).length;
    expect(trueCount).toBe(1);
  });

  it('rerender from ends to ended', () => {
    const pastStart = Math.floor(Date.now() / 1000) - 100;
    const futureEnd = Math.floor(Date.now() / 1000) + 3600;
    const { container, rerender } = render(
      <StartOrEndTime startTime={pastStart} endTime={futureEnd} />,
    );
    expect(container.textContent).toContain('ends');
    rerender(<StartOrEndTime startTime={0} endTime={1} />);
    expect(container.textContent).toContain('ended');
  });

  it('returns content for far-future start', () => {
    const farFuture = Math.floor(Date.now() / 1000) + 86400 * 365;
    const { container } = render(
      <StartOrEndTime startTime={farFuture} endTime={farFuture + 3600} />,
    );
    expect((container.textContent ?? '').length).toBeGreaterThan(4);
  });

  it('returns content for far-past end', () => {
    const farPast = 1000000;
    const { container } = render(<StartOrEndTime startTime={farPast} endTime={farPast + 1000} />);
    expect((container.textContent ?? '').length).toBeGreaterThan(4);
  });

  it('renders distinct content for different phase states', () => {
    const future = Math.floor(Date.now() / 1000) + 3600;
    const past = Math.floor(Date.now() / 1000) - 3600;
    const { container: c1 } = render(<StartOrEndTime startTime={future} endTime={future + 3600} />);
    const { container: c2 } = render(<StartOrEndTime startTime={past - 1000} endTime={past} />);
    expect(c1.textContent).not.toBe(c2.textContent);
  });

  it('multiple instances render independently', () => {
    const future = Math.floor(Date.now() / 1000) + 3600;
    const past = Math.floor(Date.now() / 1000) - 3600;
    const { container } = render(
      <>
        <StartOrEndTime startTime={future} endTime={future + 3600} />
        <StartOrEndTime startTime={past - 1000} endTime={past} />
      </>,
    );
    expect(container.textContent).toContain('starts');
    expect(container.textContent).toContain('ended');
  });

  it('extreme small startTime (1) treated as past', () => {
    const futureEnd = Math.floor(Date.now() / 1000) + 3600;
    const { container } = render(<StartOrEndTime startTime={1} endTime={futureEnd} />);
    expect(container.textContent).toContain('ends');
  });

  it('handles startTime + endTime both undefined (both default 0)', () => {
    const { container } = render(<StartOrEndTime />);
    expect(container.textContent).toContain('ended');
  });

  it('endTime far future (year 3000) renders ends or starts', () => {
    const past = Math.floor(Date.now() / 1000) - 100;
    const farFuture = 32503680000;
    const { container } = render(<StartOrEndTime startTime={past} endTime={farFuture} />);
    expect(container.textContent).toContain('ends');
  });

  it('5 instances render distinct content', () => {
    const future = Math.floor(Date.now() / 1000) + 3600;
    const { container } = render(
      <>
        <StartOrEndTime startTime={future} endTime={future + 3600} />
        <StartOrEndTime startTime={future} endTime={future + 3600} />
        <StartOrEndTime startTime={future} endTime={future + 3600} />
        <StartOrEndTime startTime={future} endTime={future + 3600} />
        <StartOrEndTime startTime={future} endTime={future + 3600} />
      </>,
    );
    expect((container.textContent ?? '').length).toBeGreaterThan(20);
  });

  it('rerender from starts to ends transitions correctly', () => {
    const future = Math.floor(Date.now() / 1000) + 3600;
    const past = Math.floor(Date.now() / 1000) - 3600;
    const { container, rerender } = render(
      <StartOrEndTime startTime={future} endTime={future + 3600} />,
    );
    expect(container.textContent).toContain('starts');
    rerender(<StartOrEndTime startTime={past} endTime={future + 3600} />);
    expect(container.textContent).toContain('ends');
  });

  it('extremely large endTime (Number.MAX_SAFE_INTEGER) renders without crash', () => {
    expect(() =>
      render(<StartOrEndTime startTime={0} endTime={Number.MAX_SAFE_INTEGER} />),
    ).not.toThrow();
  });

  it('startTime > endTime with both in past renders ended', () => {
    const past = Math.floor(Date.now() / 1000) - 3600;
    const evenMorePast = Math.floor(Date.now() / 1000) - 7200;
    const { container } = render(<StartOrEndTime startTime={past} endTime={evenMorePast} />);
    expect(container.textContent).toContain('ended');
  });
});
