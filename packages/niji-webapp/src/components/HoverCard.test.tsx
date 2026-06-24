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
});
