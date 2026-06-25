import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import CreateCandidateButton from './index';

describe('CreateCandidateButton', () => {
  it('renders "Create proposal candidate" by default', () => {
    const { container } = render(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.textContent).toContain('Create proposal candidate');
  });

  it('renders warning text when hasActiveOrPendingProposal=true', () => {
    const { container } = render(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={true}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.textContent).toContain('You already have an active or pending proposal');
  });

  it('renders react-bootstrap Spinner when isLoading=true', () => {
    const { container } = render(
      <CreateCandidateButton
        isLoading={true}
        hasActiveOrPendingProposal={false}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    // react-bootstrap Spinner は spinner-border class を付与
    expect(container.querySelector('.spinner-border')).not.toBeNull();
    // 通常テキストは isLoading 中は出ない
    expect(container.textContent).not.toContain('Create proposal candidate');
  });

  it('disables button when isFormInvalid=true', () => {
    const { container } = render(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        isFormInvalid={true}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.querySelector('button')?.disabled).toBe(true);
  });

  it('disables button when hasActiveOrPendingProposal=true', () => {
    const { container } = render(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={true}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.querySelector('button')?.disabled).toBe(true);
  });

  it('fires handleCreateProposal on click when enabled', () => {
    const handle = vi.fn();
    const { container } = render(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        isFormInvalid={false}
        handleCreateProposal={handle}
      />,
    );
    const btn = container.querySelector('button');
    if (btn) fireEvent.click(btn);
    expect(handle).toHaveBeenCalledTimes(1);
  });

  it('isLoading=true + isFormInvalid=true で spinner 表示 + disabled', () => {
    const { container } = render(
      <CreateCandidateButton
        isLoading={true}
        hasActiveOrPendingProposal={false}
        isFormInvalid={true}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.querySelector('.spinner-border')).not.toBeNull();
    expect(container.querySelector('button')?.disabled).toBe(true);
  });

  it('renders exactly 1 button element', () => {
    const { container } = render(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.querySelectorAll('button').length).toBe(1);
  });

  it('renders exactly 1 spinner when isLoading=true', () => {
    const { container } = render(
      <CreateCandidateButton
        isLoading={true}
        hasActiveOrPendingProposal={false}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.querySelectorAll('.spinner-border').length).toBe(1);
  });

  it('does NOT fire handleCreateProposal on click when disabled', () => {
    const handle = vi.fn();
    const { container } = render(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={true}
        isFormInvalid={false}
        handleCreateProposal={handle}
      />,
    );
    const btn = container.querySelector('button');
    if (btn) fireEvent.click(btn);
    // disabled button は click event を propagate しない
    expect(handle).toHaveBeenCalledTimes(0);
  });

  it('hasActiveOrPendingProposal=true takes precedence over default text', () => {
    const { container } = render(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={true}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    // warning text のみが render される
    expect(container.textContent).not.toContain('Create proposal candidate');
    expect(container.textContent).toContain('active or pending proposal');
  });

  it('isLoading=true でも button タグ自体は 1 つだけ存在', () => {
    const { container } = render(
      <CreateCandidateButton
        isLoading={true}
        hasActiveOrPendingProposal={false}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.querySelectorAll('button').length).toBe(1);
  });

  it('multi-click on enabled button fires handler N 回', () => {
    const handle = vi.fn();
    const { container } = render(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        isFormInvalid={false}
        handleCreateProposal={handle}
      />,
    );
    const btn = container.querySelector('button')!;
    fireEvent.click(btn);
    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(handle).toHaveBeenCalledTimes(3);
  });

  it('isFormInvalid=true で disable + click 時 handler 呼ばれない', () => {
    const handle = vi.fn();
    const { container } = render(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        isFormInvalid={true}
        handleCreateProposal={handle}
      />,
    );
    const btn = container.querySelector('button')!;
    fireEvent.click(btn);
    expect(handle).not.toHaveBeenCalled();
  });

  it('isLoading=true 単独では disabled にならない (Spinner 表示のみ、 click 可能)', () => {
    const handle = vi.fn();
    const { container } = render(
      <CreateCandidateButton
        isLoading={true}
        hasActiveOrPendingProposal={false}
        isFormInvalid={false}
        handleCreateProposal={handle}
      />,
    );
    const btn = container.querySelector('button')!;
    expect(btn.disabled).toBe(false);
    fireEvent.click(btn);
    expect(handle).toHaveBeenCalledTimes(1);
  });

  it('hasActiveOrPendingProposal=true 時に warning text + button disabled の両立', () => {
    const { container } = render(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={true}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.textContent).toContain('active or pending proposal');
    expect(container.querySelector('button')?.disabled).toBe(true);
  });

  it('button enabled by default (all good)', () => {
    const { container } = render(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.querySelector('button')?.disabled).toBe(false);
  });

  it('rerender from default to isLoading shows spinner', () => {
    const { container, rerender } = render(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.textContent).toContain('Create proposal candidate');
    rerender(
      <CreateCandidateButton
        isLoading={true}
        hasActiveOrPendingProposal={false}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.querySelector('.spinner-border')).not.toBeNull();
  });

  it('rerender from disabled to enabled allows handler', () => {
    const handle = vi.fn();
    const { container, rerender } = render(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={true}
        isFormInvalid={false}
        handleCreateProposal={handle}
      />,
    );
    expect(container.querySelector('button')?.disabled).toBe(true);
    rerender(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        isFormInvalid={false}
        handleCreateProposal={handle}
      />,
    );
    fireEvent.click(container.querySelector('button')!);
    expect(handle).toHaveBeenCalledTimes(1);
  });

  it('multiple instances render independently with own handlers', () => {
    const h1 = vi.fn();
    const h2 = vi.fn();
    const { container } = render(
      <>
        <CreateCandidateButton
          isLoading={false}
          hasActiveOrPendingProposal={false}
          isFormInvalid={false}
          handleCreateProposal={h1}
        />
        <CreateCandidateButton
          isLoading={false}
          hasActiveOrPendingProposal={false}
          isFormInvalid={false}
          handleCreateProposal={h2}
        />
      </>,
    );
    const btns = container.querySelectorAll('button');
    fireEvent.click(btns[0]);
    fireEvent.click(btns[1]);
    expect(h1).toHaveBeenCalledTimes(1);
    expect(h2).toHaveBeenCalledTimes(1);
  });

  it('isLoading=true + hasActive=true は spinner + disabled 両立', () => {
    const { container } = render(
      <CreateCandidateButton
        isLoading={true}
        hasActiveOrPendingProposal={true}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.querySelector('.spinner-border')).not.toBeNull();
    expect(container.querySelector('button')?.disabled).toBe(true);
  });

  it('isFormInvalid=false + isLoading=false で button text 残る', () => {
    const { container } = render(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.textContent).toContain('Create proposal candidate');
  });

  it('isLoading=true は単独で disabled にならない (click 可能)', () => {
    const { container } = render(
      <CreateCandidateButton
        isLoading={true}
        hasActiveOrPendingProposal={false}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.querySelector('button')?.disabled).toBe(false);
  });

  it('rapid 10 clicks invoke handler 10 times', () => {
    const handle = vi.fn();
    const { container } = render(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        isFormInvalid={false}
        handleCreateProposal={handle}
      />,
    );
    const btn = container.querySelector('button')!;
    for (let i = 0; i < 10; i++) fireEvent.click(btn);
    expect(handle).toHaveBeenCalledTimes(10);
  });

  it('isFormInvalid=true 単独で disabled (warning text なし)', () => {
    const { container } = render(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        isFormInvalid={true}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.querySelector('button')?.disabled).toBe(true);
    expect(container.textContent).not.toContain('active or pending');
  });

  it('rerender from disabled to enabled allows handler', () => {
    const handle = vi.fn();
    const { container, rerender } = render(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={true}
        isFormInvalid={false}
        handleCreateProposal={handle}
      />,
    );
    expect(container.querySelector('button')?.disabled).toBe(true);
    rerender(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        isFormInvalid={false}
        handleCreateProposal={handle}
      />,
    );
    fireEvent.click(container.querySelector('button')!);
    expect(handle).toHaveBeenCalledTimes(1);
  });

  it('all disabled flags combined render disabled button', () => {
    const { container } = render(
      <CreateCandidateButton
        isLoading={true}
        hasActiveOrPendingProposal={true}
        isFormInvalid={true}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.querySelector('button')?.disabled).toBe(true);
  });

  it('rerender from non-loading to loading toggles spinner', () => {
    const { container, rerender } = render(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.querySelector('.spinner-border')).toBeNull();
    rerender(
      <CreateCandidateButton
        isLoading={true}
        hasActiveOrPendingProposal={false}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.querySelector('.spinner-border')).not.toBeNull();
  });

  it('renders 5 instances each independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 5 }, (_, i) => (
          <CreateCandidateButton
            key={i}
            isLoading={false}
            hasActiveOrPendingProposal={false}
            isFormInvalid={false}
            handleCreateProposal={() => {}}
          />
        ))}
      </>,
    );
    expect(container.querySelectorAll('button').length).toBe(5);
  });

  it('rapid 10 clicks invoke handler 10 times', () => {
    const handle = vi.fn();
    const { container } = render(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        isFormInvalid={false}
        handleCreateProposal={handle}
      />,
    );
    const btn = container.querySelector('button')!;
    for (let i = 0; i < 10; i++) fireEvent.click(btn);
    expect(handle).toHaveBeenCalledTimes(10);
  });

  it('button is enabled when all flags false', () => {
    const { container } = render(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.querySelector('button')?.disabled).toBe(false);
  });

  it('button is disabled when isFormInvalid + hasActive both true', () => {
    const { container } = render(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={true}
        isFormInvalid={true}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.querySelector('button')?.disabled).toBe(true);
  });

  it('renders 10 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 10 }, (_, i) => (
          <CreateCandidateButton
            key={i}
            isLoading={false}
            hasActiveOrPendingProposal={false}
            isFormInvalid={false}
            handleCreateProposal={() => {}}
          />
        ))}
      </>,
    );
    expect(container.querySelectorAll('button').length).toBe(10);
  });

  it('rapid 20 clicks invoke handler 20 times', () => {
    const handle = vi.fn();
    const { container } = render(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        isFormInvalid={false}
        handleCreateProposal={handle}
      />,
    );
    const btn = container.querySelector('button')!;
    for (let i = 0; i < 20; i++) fireEvent.click(btn);
    expect(handle).toHaveBeenCalledTimes(20);
  });

  it('isLoading + isFormInvalid both true: button disabled', () => {
    const { container } = render(
      <CreateCandidateButton
        isLoading={true}
        hasActiveOrPendingProposal={false}
        isFormInvalid={true}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.querySelector('button')?.disabled).toBe(true);
  });

  it('hasActiveOrPendingProposal=true with isLoading=false', () => {
    const { container } = render(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={true}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.querySelector('button')?.disabled).toBe(true);
  });

  it('renders consistent text across rerenders', () => {
    const { container, rerender } = render(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.textContent).toContain('Create proposal candidate');
    rerender(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.textContent).toContain('Create proposal candidate');
  });

  it('renders 30 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 30 }, (_, i) => (
          <CreateCandidateButton
            key={i}
            isLoading={false}
            hasActiveOrPendingProposal={false}
            isFormInvalid={false}
            handleCreateProposal={() => {}}
          />
        ))}
      </>,
    );
    expect(container.querySelectorAll('button').length).toBe(30);
  });

  it('rapid 50 clicks fire 50 times', () => {
    const handle = vi.fn();
    const { container } = render(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        isFormInvalid={false}
        handleCreateProposal={handle}
      />,
    );
    const btn = container.querySelector('button')!;
    for (let i = 0; i < 50; i++) fireEvent.click(btn);
    expect(handle).toHaveBeenCalledTimes(50);
  });

  it('all 8 flag combinations render without crash', () => {
    const flags = [true, false];
    flags.forEach(isLoading => {
      flags.forEach(hasActive => {
        flags.forEach(isFormInvalid => {
          expect(() =>
            render(
              <CreateCandidateButton
                isLoading={isLoading}
                hasActiveOrPendingProposal={hasActive}
                isFormInvalid={isFormInvalid}
                handleCreateProposal={() => {}}
              />,
            ),
          ).not.toThrow();
        });
      });
    });
  });

  it('renders consistent text across 10 rerenders', () => {
    const { container, rerender } = render(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    for (let i = 0; i < 10; i++) {
      rerender(
        <CreateCandidateButton
          isLoading={false}
          hasActiveOrPendingProposal={false}
          isFormInvalid={false}
          handleCreateProposal={() => {}}
        />,
      );
      expect(container.textContent).toContain('Create proposal candidate');
    }
  });

  it('renders without spinner when isLoading=false', () => {
    const { container } = render(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.querySelector('.spinner-border')).toBeNull();
  });

  it('renders 100 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 100 }, (_, i) => (
          <CreateCandidateButton
            key={i}
            isLoading={false}
            hasActiveOrPendingProposal={false}
            isFormInvalid={false}
            handleCreateProposal={() => {}}
          />
        ))}
      </>,
    );
    expect(container.querySelectorAll('button').length).toBe(100);
  });

  it('rapid 200 clicks invoke handler 200 times', () => {
    const handle = vi.fn();
    const { container } = render(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        isFormInvalid={false}
        handleCreateProposal={handle}
      />,
    );
    const btn = container.querySelector('button')!;
    for (let i = 0; i < 200; i++) fireEvent.click(btn);
    expect(handle).toHaveBeenCalledTimes(200);
  });

  it('rerender 30 times preserves text content', () => {
    const { container, rerender } = render(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    for (let i = 0; i < 30; i++) {
      rerender(
        <CreateCandidateButton
          isLoading={false}
          hasActiveOrPendingProposal={false}
          isFormInvalid={false}
          handleCreateProposal={() => {}}
        />,
      );
      expect(container.textContent).toContain('Create proposal candidate');
    }
  });

  it('handles consecutive 50 renders without crash', () => {
    for (let i = 0; i < 50; i++) {
      expect(() =>
        render(
          <CreateCandidateButton
            isLoading={i % 2 === 0}
            hasActiveOrPendingProposal={false}
            isFormInvalid={false}
            handleCreateProposal={() => {}}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('handles isFormInvalid + hasActive both true', () => {
    expect(() =>
      render(
        <CreateCandidateButton
          isLoading={false}
          hasActiveOrPendingProposal={true}
          isFormInvalid={true}
          handleCreateProposal={() => {}}
        />,
      ),
    ).not.toThrow();
  });

  it('renders 100 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <CreateCandidateButton
              key={i}
              isLoading={false}
              hasActiveOrPendingProposal={false}
              isFormInvalid={false}
              handleCreateProposal={() => {}}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender 30 times preserves component', () => {
    const { rerender } = render(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    for (let i = 0; i < 30; i++) {
      expect(() =>
        rerender(
          <CreateCandidateButton
            isLoading={i % 2 === 0}
            hasActiveOrPendingProposal={false}
            isFormInvalid={false}
            handleCreateProposal={() => {}}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('rapid 100 button click events fire handler', () => {
    const handle = vi.fn();
    const { container } = render(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        isFormInvalid={false}
        handleCreateProposal={handle}
      />,
    );
    const btn = container.querySelector('button')!;
    for (let i = 0; i < 100; i++) fireEvent.click(btn);
    expect(handle).toHaveBeenCalledTimes(100);
  });

  it('isFormInvalid=true keeps button rendered', () => {
    const { container } = render(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        isFormInvalid={true}
        handleCreateProposal={() => {}}
      />,
    );
    expect(container.querySelector('button')).not.toBeNull();
  });

  it('rapid 50 prop switching without crash', () => {
    const { rerender } = render(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    for (let i = 0; i < 50; i++) {
      expect(() =>
        rerender(
          <CreateCandidateButton
            isLoading={false}
            hasActiveOrPendingProposal={i % 2 === 0}
            isFormInvalid={i % 3 === 0}
            handleCreateProposal={() => {}}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('renders 100 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <CreateCandidateButton
              key={i}
              isLoading={false}
              hasActiveOrPendingProposal={false}
              isFormInvalid={false}
              handleCreateProposal={() => {}}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('mount-unmount 50 cycles', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <CreateCandidateButton
          isLoading={false}
          hasActiveOrPendingProposal={false}
          isFormInvalid={false}
          handleCreateProposal={() => {}}
        />,
      );
      unmount();
    }
  });

  it('all 50 instances render button element', () => {
    const { container } = render(
      <>
        {Array.from({ length: 50 }, (_, i) => (
          <CreateCandidateButton
            key={i}
            isLoading={false}
            hasActiveOrPendingProposal={false}
            isFormInvalid={false}
            handleCreateProposal={() => {}}
          />
        ))}
      </>,
    );
    expect(container.querySelectorAll('button').length).toBe(50);
  });

  it('rapid click 200 times invokes handler 200 times', () => {
    const handle = vi.fn();
    const { container } = render(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        isFormInvalid={false}
        handleCreateProposal={handle}
      />,
    );
    const btn = container.querySelector('button')!;
    for (let i = 0; i < 200; i++) fireEvent.click(btn);
    expect(handle).toHaveBeenCalledTimes(200);
  });

  it('handles all 3 prop variants combinatorially', () => {
    [true, false].forEach(isLoading => {
      [true, false].forEach(hasActive => {
        [true, false].forEach(isInvalid => {
          expect(() =>
            render(
              <CreateCandidateButton
                isLoading={isLoading}
                hasActiveOrPendingProposal={hasActive}
                isFormInvalid={isInvalid}
                handleCreateProposal={() => {}}
              />,
            ),
          ).not.toThrow();
        });
      });
    });
  });

  it('mount-unmount 200 cycles', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(
        <CreateCandidateButton
          isLoading={false}
          hasActiveOrPendingProposal={false}
          isFormInvalid={false}
          handleCreateProposal={() => {}}
        />,
      );
      unmount();
    }
  });

  it('renders 500 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <CreateCandidateButton
              key={i}
              isLoading={false}
              hasActiveOrPendingProposal={false}
              isFormInvalid={false}
              handleCreateProposal={() => {}}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rapid 500 click events fire handler', () => {
    const handle = vi.fn();
    const { container } = render(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        isFormInvalid={false}
        handleCreateProposal={handle}
      />,
    );
    const btn = container.querySelector('button')!;
    for (let i = 0; i < 500; i++) fireEvent.click(btn);
    expect(handle).toHaveBeenCalledTimes(500);
  });

  it('all 100 instances render button', () => {
    const { container } = render(
      <>
        {Array.from({ length: 100 }, (_, i) => (
          <CreateCandidateButton
            key={i}
            isLoading={false}
            hasActiveOrPendingProposal={false}
            isFormInvalid={false}
            handleCreateProposal={() => {}}
          />
        ))}
      </>,
    );
    expect(container.querySelectorAll('button').length).toBe(100);
  });

  it('handles rapid 100 prop rerender', () => {
    const { rerender } = render(
      <CreateCandidateButton
        isLoading={false}
        hasActiveOrPendingProposal={false}
        isFormInvalid={false}
        handleCreateProposal={() => {}}
      />,
    );
    for (let i = 0; i < 100; i++) {
      expect(() =>
        rerender(
          <CreateCandidateButton
            isLoading={i % 2 === 0}
            hasActiveOrPendingProposal={i % 3 === 0}
            isFormInvalid={i % 5 === 0}
            handleCreateProposal={() => {}}
          />,
        ),
      ).not.toThrow();
    }
  });
});
