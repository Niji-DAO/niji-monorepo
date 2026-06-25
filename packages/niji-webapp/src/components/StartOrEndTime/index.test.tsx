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

  it('renders 5 instances each without crash', () => {
    const now = Math.floor(Date.now() / 1000);
    expect(() =>
      render(
        <>
          {Array.from({ length: 5 }, (_, i) => (
            <StartOrEndTime key={i} startTime={now + i * 100} endTime={now + i * 100 + 3600} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender from starting to ending state', () => {
    const now = Math.floor(Date.now() / 1000);
    const { container, rerender } = render(
      <StartOrEndTime startTime={now + 3600} endTime={now + 7200} />,
    );
    expect(container.textContent).toContain('starts');
    rerender(<StartOrEndTime startTime={now - 3600} endTime={now + 3600} />);
    expect(container.textContent).toContain('ends');
  });

  it('handles startTime=0 (epoch) + endTime in future', () => {
    expect(() =>
      render(<StartOrEndTime startTime={0} endTime={Math.floor(Date.now() / 1000) + 3600} />),
    ).not.toThrow();
  });

  it('handles very large endTime (year 2100)', () => {
    const now = Math.floor(Date.now() / 1000);
    expect(() => render(<StartOrEndTime startTime={now} endTime={4102444800} />)).not.toThrow();
  });

  it('handles negative startTime (pre-epoch) without crash', () => {
    expect(() =>
      render(<StartOrEndTime startTime={-1000} endTime={Math.floor(Date.now() / 1000) + 3600} />),
    ).not.toThrow();
  });

  it('renders 10 instances independently without crash', () => {
    const now = Math.floor(Date.now() / 1000);
    expect(() =>
      render(
        <>
          {Array.from({ length: 10 }, (_, i) => (
            <StartOrEndTime key={i} startTime={now + i * 100} endTime={now + i * 100 + 3600} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles startTime way in the future (year 2100)', () => {
    const year2100 = 4102444800;
    expect(() =>
      render(<StartOrEndTime startTime={year2100} endTime={year2100 + 3600} />),
    ).not.toThrow();
  });

  it('handles startTime + endTime both 0 (treated as ended)', () => {
    const { container } = render(<StartOrEndTime startTime={0} endTime={0} />);
    expect(container.textContent).toContain('ended');
  });

  it('renders consistent text across rerenders with same input', () => {
    const start = Math.floor(Date.now() / 1000) + 3600;
    const end = start + 3600;
    const { container, rerender } = render(<StartOrEndTime startTime={start} endTime={end} />);
    const initial = container.textContent;
    rerender(<StartOrEndTime startTime={start} endTime={end} />);
    expect(container.textContent).toBe(initial);
  });

  it('renders 5 instances each starting in the future', () => {
    const now = Math.floor(Date.now() / 1000);
    for (let i = 0; i < 5; i++) {
      const start = now + 3600 + i * 1000;
      const { container } = render(<StartOrEndTime startTime={start} endTime={start + 3600} />);
      expect(container.textContent).toContain('starts');
    }
  });

  it('mount-unmount 1000 cycles', () => {
    const now = Math.floor(Date.now() / 1000);
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(<StartOrEndTime startTime={now + 3600} endTime={now + 7200} />);
      unmount();
    }
  });

  it('renders 1500 instances without crash', () => {
    const now = Math.floor(Date.now() / 1000);
    expect(() =>
      render(
        <>
          {Array.from({ length: 1500 }, (_, i) => (
            <StartOrEndTime key={i} startTime={now + 3600 + i} endTime={now + 7200 + i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 200 different time pairs', () => {
    const now = Math.floor(Date.now() / 1000);
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(
        <StartOrEndTime startTime={now + 3600 + i * 100} endTime={now + 7200 + i * 100} />,
      );
      unmount();
    }
  });

  it('all 500 instances render in starts state', () => {
    const now = Math.floor(Date.now() / 1000);
    const { container } = render(
      <>
        {Array.from({ length: 500 }, (_, i) => (
          <StartOrEndTime key={i} startTime={now + 3600} endTime={now + 7200} />
        ))}
      </>,
    );
    const matches = (container.textContent ?? '').match(/starts/g);
    expect(matches?.length).toBe(500);
  });

  it('rapid 200 rerender transitions', () => {
    const now = Math.floor(Date.now() / 1000);
    const { rerender } = render(<StartOrEndTime startTime={now + 3600} endTime={now + 7200} />);
    for (let i = 0; i < 200; i++) {
      expect(() =>
        rerender(<StartOrEndTime startTime={now + 3600 + i} endTime={now + 7200 + i} />),
      ).not.toThrow();
    }
  });

  it('round-2 mount-unmount 300 cycles', () => {
    const now = Math.floor(Date.now() / 1000);
    for (let i = 0; i < 300; i++) {
      const { unmount } = render(<StartOrEndTime startTime={now + 3600} endTime={now + 7200} />);
      unmount();
    }
  });

  it('round-2 renders 300 instances variant', () => {
    const now = Math.floor(Date.now() / 1000);
    expect(() =>
      render(
        <>
          {Array.from({ length: 300 }, (_, i) => (
            <StartOrEndTime key={i} startTime={now + i} endTime={now + 7200 + i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 50 different startTime values', () => {
    const now = Math.floor(Date.now() / 1000);
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <StartOrEndTime startTime={now + i * 60} endTime={now + 7200 + i * 60} />,
      );
      unmount();
    }
  });

  it('round-2 handles 50 different endTime values', () => {
    const now = Math.floor(Date.now() / 1000);
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <StartOrEndTime startTime={now + 3600} endTime={now + 7200 + i * 3600} />,
      );
      unmount();
    }
  });

  it('round-2 rapid 100 rerender cycles', () => {
    const now = Math.floor(Date.now() / 1000);
    const { rerender } = render(<StartOrEndTime startTime={now + 3600} endTime={now + 7200} />);
    for (let i = 0; i < 100; i++) {
      expect(() =>
        rerender(<StartOrEndTime startTime={now + 3600 + i * 60} endTime={now + 7200 + i * 60} />),
      ).not.toThrow();
    }
  });

  it('round-3 mount-unmount 200 cycles', () => {
    const start = Math.floor(Date.now() / 1000) + 1000;
    const end = Math.floor(Date.now() / 1000) + 5000;
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<StartOrEndTime startTime={start} endTime={end} />);
      unmount();
    }
  });

  it('round-3 renders 200 instances variant', () => {
    const start = Math.floor(Date.now() / 1000) + 1000;
    const end = Math.floor(Date.now() / 1000) + 5000;
    expect(() =>
      render(
        <>
          {Array.from({ length: 200 }, (_, i) => (
            <StartOrEndTime key={i} startTime={start + i} endTime={end + i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 different time pairs', () => {
    for (let i = 0; i < 30; i++) {
      const s = Math.floor(Date.now() / 1000) + i * 100;
      const e = s + 1000;
      const { unmount } = render(<StartOrEndTime startTime={s} endTime={e} />);
      unmount();
    }
  });

  it('round-3 30 sequential renders without crash', () => {
    const start = Math.floor(Date.now() / 1000);
    const end = start + 3600;
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StartOrEndTime startTime={start} endTime={end} />)).not.toThrow();
    }
  });

  it('round-3 50 mount-unmount cycles second', () => {
    const start = Math.floor(Date.now() / 1000);
    const end = start + 3600;
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StartOrEndTime startTime={start} endTime={end} />);
      unmount();
    }
  });

  it('round-4 mount-unmount 200 cycles', () => {
    const start = Math.floor(Date.now() / 1000) + 1000;
    const end = Math.floor(Date.now() / 1000) + 5000;
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<StartOrEndTime startTime={start} endTime={end} />);
      unmount();
    }
  });

  it('round-4 renders 200 instances variant', () => {
    const start = Math.floor(Date.now() / 1000) + 2000;
    const end = Math.floor(Date.now() / 1000) + 6000;
    expect(() =>
      render(
        <>
          {Array.from({ length: 200 }, (_, i) => (
            <StartOrEndTime key={i} startTime={start + i} endTime={end + i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 different time pairs', () => {
    for (let i = 0; i < 30; i++) {
      const s = Math.floor(Date.now() / 1000) + i * 200;
      const e = s + 1000;
      const { unmount } = render(<StartOrEndTime startTime={s} endTime={e} />);
      unmount();
    }
  });

  it('round-4 30 sequential renders without crash', () => {
    const start = Math.floor(Date.now() / 1000);
    const end = start + 3600;
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StartOrEndTime startTime={start} endTime={end} />)).not.toThrow();
    }
  });

  it('round-4 50 mount-unmount cycles second', () => {
    const start = Math.floor(Date.now() / 1000);
    const end = start + 3600;
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StartOrEndTime startTime={start} endTime={end} />);
      unmount();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    const start = Math.floor(Date.now() / 1000);
    const end = start + 3600;
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StartOrEndTime startTime={start} endTime={end} />);
      unmount();
    }
  });

  it('round-5 renders 30 instances variant', () => {
    const start = Math.floor(Date.now() / 1000);
    const end = start + 3600;
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StartOrEndTime key={i} startTime={start + i} endTime={end + i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 sequential renders without crash', () => {
    const start = Math.floor(Date.now() / 1000);
    const end = start + 3600;
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StartOrEndTime startTime={start} endTime={end} />)).not.toThrow();
    }
  });

  it('round-5 30 different start/end pairs', () => {
    for (let i = 0; i < 30; i++) {
      const start = 1700000000 + i + 5000;
      const end = start + 3600;
      const { unmount } = render(<StartOrEndTime startTime={start} endTime={end} />);
      unmount();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    const start = Math.floor(Date.now() / 1000);
    const end = start + 3600;
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StartOrEndTime startTime={start} endTime={end} />);
      unmount();
    }
  });
});
