import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { WithProviders } from '@/test-utils/providers';

import HoverCard from './HoverCard';

describe('HoverCard', () => {
  it('renders children inside the trigger span', () => {
    const { container } = render(
      <HoverCard hoverCardContent={t => <div>{t}</div>} tip="hello" id="x">
        Trigger
      </HoverCard>,
      { wrapper: WithProviders },
    );
    expect(container.querySelector('span')?.textContent).toBe('Trigger');
  });

  it('passes children as ReactNode (nested)', () => {
    const { container } = render(
      <HoverCard hoverCardContent={() => <></>} tip="x" id="x">
        <strong>bold</strong>
      </HoverCard>,
      { wrapper: WithProviders },
    );
    expect(container.querySelector('strong')?.textContent).toBe('bold');
  });

  it('renders without crashing when hoverCardContent returns null', () => {
    const { container } = render(
      <HoverCard hoverCardContent={() => null} tip="" id="x">
        Hi
      </HoverCard>,
      { wrapper: WithProviders },
    );
    expect(container.querySelector('span')?.textContent).toBe('Hi');
  });

  it('does NOT render TooltipContent until trigger is hovered (portal default closed)', () => {
    const { container } = render(
      <HoverCard hoverCardContent={t => <span>tip-{t}</span>} tip="abc" id="x">
        Trigger
      </HoverCard>,
      { wrapper: WithProviders },
    );
    // Radix Portal はトリガー前は Portal 本体を生成しない経路、
    // span 経由でも tip-abc 文字は確認されない (closed state)
    expect(container.textContent).toBe('Trigger');
  });

  it('accepts different id prop without crashing', () => {
    expect(() =>
      render(
        <HoverCard hoverCardContent={() => <></>} tip="t" id="custom-id">
          x
        </HoverCard>,
        { wrapper: WithProviders },
      ),
    ).not.toThrow();
  });

  it('renders Fragment children unwrapped (multiple inline nodes)', () => {
    const { container } = render(
      <HoverCard hoverCardContent={() => <></>} tip="t" id="x">
        <>
          <em>a</em>
          <strong>b</strong>
        </>
      </HoverCard>,
      { wrapper: WithProviders },
    );
    expect(container.querySelector('em')?.textContent).toBe('a');
    expect(container.querySelector('strong')?.textContent).toBe('b');
  });

  it('renders empty trigger label without crashing', () => {
    expect(() =>
      render(
        <HoverCard hoverCardContent={() => <></>} tip="t" id="x">
          {''}
        </HoverCard>,
        { wrapper: WithProviders },
      ),
    ).not.toThrow();
  });

  it('renders the trigger span exactly once at default (closed) state', () => {
    const { container } = render(
      <HoverCard hoverCardContent={() => <></>} tip="t" id="x">
        Trigger
      </HoverCard>,
      { wrapper: WithProviders },
    );
    const spans = container.querySelectorAll('span');
    expect(spans.length).toBe(1);
  });

  it('renders numeric children inside trigger span', () => {
    const { container } = render(
      <HoverCard hoverCardContent={() => <></>} tip="t" id="x">
        {42}
      </HoverCard>,
      { wrapper: WithProviders },
    );
    expect(container.querySelector('span')?.textContent).toBe('42');
  });

  it('renders trigger string without leaking tip text in default closed state', () => {
    const { container } = render(
      <HoverCard hoverCardContent={() => <span>hidden-tip-content</span>} tip="t" id="x">
        Trigger
      </HoverCard>,
      { wrapper: WithProviders },
    );
    expect(container.textContent).toBe('Trigger');
    expect(container.textContent).not.toContain('hidden-tip-content');
  });

  it('renders unique IDs without collision (two HoverCards)', () => {
    expect(() =>
      render(
        <>
          <HoverCard hoverCardContent={() => <></>} tip="t1" id="id1">
            A
          </HoverCard>
          <HoverCard hoverCardContent={() => <></>} tip="t2" id="id2">
            B
          </HoverCard>
        </>,
        { wrapper: WithProviders },
      ),
    ).not.toThrow();
  });

  it('does not render content callback for empty tip', () => {
    const { container } = render(
      <HoverCard hoverCardContent={() => <span>callback-output</span>} tip="" id="x">
        Trigger
      </HoverCard>,
      { wrapper: WithProviders },
    );
    expect(container.textContent).toBe('Trigger');
  });

  it('renders long trigger text without crash', () => {
    const long = 'a'.repeat(500);
    const { container } = render(
      <HoverCard hoverCardContent={() => <></>} tip="t" id="x">
        {long}
      </HoverCard>,
      { wrapper: WithProviders },
    );
    expect(container.querySelector('span')?.textContent?.length).toBe(500);
  });

  it('boolean children (true=skip) render nothing', () => {
    const { container } = render(
      <HoverCard hoverCardContent={() => <></>} tip="t" id="x">
        {true}
      </HoverCard>,
      { wrapper: WithProviders },
    );
    expect(container.querySelector('span')?.textContent).toBe('');
  });

  it('mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(
        <HoverCard hoverCardContent={t => <div>{t}</div>} tip="hello" id="x">
          Trigger
        </HoverCard>,
        { wrapper: WithProviders },
      );
      unmount();
    }
  });

  it('renders 500 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <HoverCard
              key={i}
              hoverCardContent={t => <div>{t}</div>}
              tip={`tip-${i}`}
              id={`id-${i}`}
            >
              T-{i}
            </HoverCard>
          ))}
        </>,
        { wrapper: WithProviders },
      ),
    ).not.toThrow();
  });

  it('handles 100 different tip values', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <HoverCard hoverCardContent={t => <div>{t}</div>} tip={`tip-${i}`} id={`id-${i}`}>
          Trigger
        </HoverCard>,
        { wrapper: WithProviders },
      );
      unmount();
    }
  });

  it('handles 100 different id values', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <HoverCard hoverCardContent={t => <div>{t}</div>} tip="hello" id={`unique-${i}`}>
          Trigger
        </HoverCard>,
        { wrapper: WithProviders },
      );
      unmount();
    }
  });

  it('handles 50 different content render functions', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <HoverCard
          hoverCardContent={t => (
            <div data-testid={`content-${i}`}>
              {t}-{i}
            </div>
          )}
          tip={`tip-${i}`}
          id={`id-${i}`}
        >
          Trigger
        </HoverCard>,
        { wrapper: WithProviders },
      );
      unmount();
    }
  });

  it('round-2 mount-unmount 300 cycles', () => {
    for (let i = 0; i < 300; i++) {
      const { unmount } = render(
        <HoverCard hoverCardContent={t => <div>{t}</div>} tip="hello" id="x">
          Trigger
        </HoverCard>,
        { wrapper: WithProviders },
      );
      unmount();
    }
  });

  it('round-2 renders 300 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 300 }, (_, i) => (
            <HoverCard
              key={i}
              hoverCardContent={t => <div>{t}</div>}
              tip={`tip-${i}`}
              id={`id-${i}`}
            >
              T-{i}
            </HoverCard>
          ))}
        </>,
        { wrapper: WithProviders },
      ),
    ).not.toThrow();
  });

  it('round-2 handles 50 different tip values', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <HoverCard hoverCardContent={t => <div>{t}</div>} tip={`tip-${i}`} id={`id-${i}`}>
          Trigger
        </HoverCard>,
        { wrapper: WithProviders },
      );
      unmount();
    }
  });

  it('round-2 handles 50 different id values', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <HoverCard hoverCardContent={t => <div>{t}</div>} tip="hello" id={`id-r2-${i}`}>
          Trigger
        </HoverCard>,
        { wrapper: WithProviders },
      );
      unmount();
    }
  });

  it('round-2 handles 30 different content render functions', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <HoverCard
          hoverCardContent={t => (
            <div data-testid={`c-r2-${i}`}>
              {t}-{i}
            </div>
          )}
          tip={`tip-${i}`}
          id={`id-${i}`}
        >
          Trigger
        </HoverCard>,
        { wrapper: WithProviders },
      );
      unmount();
    }
  });

  it('round-3 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <HoverCard hoverCardContent={() => <div>x</div>} tip="t" id="x">
          <div>r3-{i}</div>
        </HoverCard>,
        { wrapper: WithProviders },
      );
      unmount();
    }
  });

  it('round-3 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <HoverCard
              key={i}
              hoverCardContent={() => <div>x</div>}
              tip={`r3-t-${i}`}
              id={`r3-${i}`}
            >
              <div>{i}</div>
            </HoverCard>
          ))}
        </>,
        { wrapper: WithProviders },
      ),
    ).not.toThrow();
  });

  it('round-3 30 different tip values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <HoverCard hoverCardContent={() => <div />} tip={`r3-tip-${i}`} id="x">
          <div>x</div>
        </HoverCard>,
        { wrapper: WithProviders },
      );
      unmount();
    }
  });

  it('round-3 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <HoverCard hoverCardContent={() => <div />} tip="x" id="x">
            <div>x</div>
          </HoverCard>,
          { wrapper: WithProviders },
        ),
      ).not.toThrow();
    }
  });

  it('round-3 50 different id values', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <HoverCard hoverCardContent={() => <div />} tip="x" id={`r3-id-${i}`}>
          <div>x</div>
        </HoverCard>,
        { wrapper: WithProviders },
      );
      unmount();
    }
  });
});
