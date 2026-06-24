import { fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../ChangeDelegatePanel', () => ({
  default: ({ delegateTo }: { delegateTo?: string }) => (
    <div data-testid="change-panel">change-{delegateTo ?? 'none'}</div>
  ),
}));

vi.mock('../CurrentDelegatePannel', () => ({
  default: ({
    onPrimaryBtnClick,
    onSecondaryBtnClick,
  }: {
    onPrimaryBtnClick: () => void;
    onSecondaryBtnClick: () => void;
  }) => (
    <div data-testid="current-panel">
      <button onClick={onPrimaryBtnClick}>primary</button>
      <button onClick={onSecondaryBtnClick}>secondary</button>
    </div>
  ),
}));

import DelegationModal, { Backdrop } from './index';

beforeEach(() => {
  document.body.innerHTML = '<div id="backdrop-root"></div><div id="overlay-root"></div>';
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Backdrop', () => {
  it('renders div', () => {
    const { container } = render(<Backdrop onDismiss={() => {}} />);
    expect(container.querySelector('div')).not.toBeNull();
  });

  it('fires onDismiss on click', () => {
    const onDismiss = vi.fn();
    const { container } = render(<Backdrop onDismiss={onDismiss} />);
    const div = container.querySelector('div');
    if (div) fireEvent.click(div);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});

describe('DelegationModal', () => {
  it('portals backdrop into backdrop-root + overlay into overlay-root', () => {
    render(<DelegationModal onDismiss={() => {}} />);
    expect(document.getElementById('backdrop-root')?.children.length).toBe(1);
    expect((document.getElementById('overlay-root')?.children.length ?? 0) > 0).toBe(true);
    expect(document.getElementById('overlay-root')?.querySelector('button')).not.toBeNull();
  });

  it('renders CurrentDelegatePannel by default (no delegateTo)', () => {
    render(<DelegationModal onDismiss={() => {}} />);
    expect(
      document.getElementById('overlay-root')?.querySelector('[data-testid="current-panel"]'),
    ).not.toBeNull();
  });

  it('renders ChangeDelegatePanel when delegateTo provided', () => {
    render(<DelegationModal onDismiss={() => {}} delegateTo="0xABCD" />);
    expect(
      document.getElementById('overlay-root')?.querySelector('[data-testid="change-panel"]'),
    ).not.toBeNull();
  });

  it('switches to Change panel when primary clicked', () => {
    render(<DelegationModal onDismiss={() => {}} />);
    const buttons = document.getElementById('overlay-root')?.querySelectorAll('button');
    // 0=close, 1=primary, 2=secondary
    const primary = Array.from(buttons ?? []).find(b => b.textContent === 'primary');
    if (primary) fireEvent.click(primary);
    expect(
      document.getElementById('overlay-root')?.querySelector('[data-testid="change-panel"]'),
    ).not.toBeNull();
  });

  it('fires onDismiss on close button click', () => {
    const onDismiss = vi.fn();
    render(<DelegationModal onDismiss={onDismiss} />);
    const closeBtn = document.getElementById('overlay-root')?.querySelector('button:first-of-type');
    if (closeBtn) fireEvent.click(closeBtn);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('fires onDismiss on backdrop click', () => {
    const onDismiss = vi.fn();
    render(<DelegationModal onDismiss={onDismiss} />);
    const backdrop = document.getElementById('backdrop-root')?.querySelector('div');
    if (backdrop) fireEvent.click(backdrop);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('secondary button click fires onDismiss', () => {
    const onDismiss = vi.fn();
    render(<DelegationModal onDismiss={onDismiss} />);
    const buttons = document.getElementById('overlay-root')?.querySelectorAll('button');
    const secondary = Array.from(buttons ?? []).find(b => b.textContent === 'secondary');
    if (secondary) fireEvent.click(secondary);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('delegateTo verbatim passed to ChangeDelegatePanel', () => {
    render(<DelegationModal onDismiss={() => {}} delegateTo="0xDEAD" />);
    expect(
      document.getElementById('overlay-root')?.querySelector('[data-testid="change-panel"]')
        ?.textContent,
    ).toBe('change-0xDEAD');
  });

  it('backdrop multi-click invokes onDismiss multiple times', () => {
    const onDismiss = vi.fn();
    render(<DelegationModal onDismiss={onDismiss} />);
    const backdrop = document.getElementById('backdrop-root')?.querySelector('div');
    if (backdrop) {
      fireEvent.click(backdrop);
      fireEvent.click(backdrop);
    }
    expect(onDismiss).toHaveBeenCalledTimes(2);
  });

  it('primary click switches to change-none (no delegateTo)', () => {
    render(<DelegationModal onDismiss={() => {}} />);
    const primary = Array.from(
      document.getElementById('overlay-root')?.querySelectorAll('button') ?? [],
    ).find(b => b.textContent === 'primary');
    if (primary) fireEvent.click(primary);
    expect(
      document.getElementById('overlay-root')?.querySelector('[data-testid="change-panel"]')
        ?.textContent,
    ).toBe('change-none');
  });

  it('Backdrop renders single div element', () => {
    const { container } = render(<Backdrop onDismiss={() => {}} />);
    expect(container.querySelectorAll('div').length).toBe(1);
  });

  it('Backdrop multi-click invokes onDismiss multiple times', () => {
    const onDismiss = vi.fn();
    const { container } = render(<Backdrop onDismiss={onDismiss} />);
    const div = container.querySelector('div');
    if (div) {
      fireEvent.click(div);
      fireEvent.click(div);
      fireEvent.click(div);
    }
    expect(onDismiss).toHaveBeenCalledTimes(3);
  });

  it('overlay renders at least 3 buttons (close + primary + secondary)', () => {
    render(<DelegationModal onDismiss={() => {}} />);
    const buttons = document.getElementById('overlay-root')?.querySelectorAll('button');
    expect((buttons?.length ?? 0) >= 3).toBe(true);
  });

  it('initial state shows current-panel (not change-panel) with no delegateTo', () => {
    render(<DelegationModal onDismiss={() => {}} />);
    expect(
      document.getElementById('overlay-root')?.querySelector('[data-testid="current-panel"]'),
    ).not.toBeNull();
    expect(
      document.getElementById('overlay-root')?.querySelector('[data-testid="change-panel"]'),
    ).toBeNull();
  });

  it('initial state with delegateTo shows ONLY change-panel', () => {
    render(<DelegationModal onDismiss={() => {}} delegateTo="0xFEED" />);
    expect(
      document.getElementById('overlay-root')?.querySelector('[data-testid="current-panel"]'),
    ).toBeNull();
    expect(
      document.getElementById('overlay-root')?.querySelector('[data-testid="change-panel"]'),
    ).not.toBeNull();
  });

  it('change panel after primary click renders change-none text', () => {
    render(<DelegationModal onDismiss={() => {}} />);
    const primary = Array.from(
      document.getElementById('overlay-root')?.querySelectorAll('button') ?? [],
    ).find(b => b.textContent === 'primary');
    if (primary) fireEvent.click(primary);
    const changePanel = document
      .getElementById('overlay-root')
      ?.querySelector('[data-testid="change-panel"]');
    expect(changePanel).not.toBeNull();
    expect(changePanel?.textContent).toBe('change-none');
  });

  it('overlay-root receives at least 1 child (portal-mounted modal)', () => {
    render(<DelegationModal onDismiss={() => {}} />);
    expect((document.getElementById('overlay-root')?.children.length ?? 0) >= 1).toBe(true);
  });

  it('backdrop-root receives 1 child (portal-mounted backdrop)', () => {
    render(<DelegationModal onDismiss={() => {}} />);
    expect(document.getElementById('backdrop-root')?.children.length).toBe(1);
  });

  it('delegateTo with mixed-case address passes through', () => {
    render(<DelegationModal onDismiss={() => {}} delegateTo="0xAbCdEf" />);
    const panel = document
      .getElementById('overlay-root')
      ?.querySelector('[data-testid="change-panel"]');
    expect(panel?.textContent).toBe('change-0xAbCdEf');
  });

  it('Backdrop component renders div alone without children', () => {
    const { container } = render(<Backdrop onDismiss={() => {}} />);
    expect(container.querySelectorAll('div').length).toBe(1);
  });

  it('change-panel exists when delegateTo prop is provided', () => {
    render(<DelegationModal onDismiss={() => {}} delegateTo="0xDEAD" />);
    expect(
      document.getElementById('overlay-root')?.querySelector('[data-testid="change-panel"]'),
    ).not.toBeNull();
  });
});
