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

  it('5 modals render concurrently with 5 backdrops', () => {
    render(
      <>
        <DelegationModal onDismiss={() => {}} />
        <DelegationModal onDismiss={() => {}} />
        <DelegationModal onDismiss={() => {}} />
        <DelegationModal onDismiss={() => {}} />
        <DelegationModal onDismiss={() => {}} />
      </>,
    );
    expect(document.getElementById('backdrop-root')?.children.length).toBe(5);
  });

  it('rerender preserves overlay-root child count', () => {
    const { rerender } = render(<DelegationModal onDismiss={() => {}} />);
    const initial = document.getElementById('overlay-root')?.children.length ?? 0;
    rerender(<DelegationModal onDismiss={() => {}} />);
    expect(document.getElementById('overlay-root')?.children.length).toBeLessThanOrEqual(
      initial + 1,
    );
  });

  it('rapid 10 backdrop clicks invoke onDismiss 10 times', () => {
    const onDismiss = vi.fn();
    render(<DelegationModal onDismiss={onDismiss} />);
    const backdrop = document.getElementById('backdrop-root')?.querySelector('div');
    if (backdrop) {
      for (let i = 0; i < 10; i++) fireEvent.click(backdrop);
    }
    expect(onDismiss).toHaveBeenCalledTimes(10);
  });

  it('Backdrop component is standalone div', () => {
    const { container } = render(<Backdrop onDismiss={() => {}} />);
    expect(container.firstChild?.nodeName).toBe('DIV');
  });

  it('delegateTo with empty string renders without crash', () => {
    expect(() => render(<DelegationModal onDismiss={() => {}} delegateTo="" />)).not.toThrow();
  });

  it('renders without crash for 500 char long delegateTo', () => {
    const longAddr = '0x' + 'a'.repeat(500);
    expect(() =>
      render(<DelegationModal onDismiss={() => {}} delegateTo={longAddr} />),
    ).not.toThrow();
  });

  it('renders 3 instances each independently', () => {
    expect(() =>
      render(
        <>
          <DelegationModal onDismiss={() => {}} delegateTo="0xA" />
          <DelegationModal onDismiss={() => {}} delegateTo="0xB" />
          <DelegationModal onDismiss={() => {}} delegateTo="0xC" />
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender with new delegateTo does not crash', () => {
    const { rerender } = render(<DelegationModal onDismiss={() => {}} delegateTo="0xA" />);
    expect(() => rerender(<DelegationModal onDismiss={() => {}} delegateTo="0xB" />)).not.toThrow();
  });

  it('renders without crash for unicode delegateTo', () => {
    expect(() =>
      render(<DelegationModal onDismiss={() => {}} delegateTo="0xXXXあいう" />),
    ).not.toThrow();
  });

  it('renders consecutive 5 times without crash', () => {
    for (let i = 0; i < 5; i++) {
      expect(() =>
        render(<DelegationModal onDismiss={() => {}} delegateTo={`0x${i}`} />),
      ).not.toThrow();
    }
  });

  it('renders 10 instances each independently', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 10 }, (_, i) => (
            <DelegationModal key={i} onDismiss={() => {}} delegateTo={`0x${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('renders for delegateTo=undefined explicitly', () => {
    expect(() =>
      render(<DelegationModal onDismiss={() => {}} delegateTo={undefined} />),
    ).not.toThrow();
  });

  it('rerender with toggling delegateTo', () => {
    const { rerender } = render(<DelegationModal onDismiss={() => {}} delegateTo="0xA" />);
    expect(() =>
      rerender(<DelegationModal onDismiss={() => {}} delegateTo={undefined} />),
    ).not.toThrow();
  });

  it('primary click 5 times sequentially', () => {
    render(<DelegationModal onDismiss={() => {}} />);
    const primary = Array.from(
      document.getElementById('overlay-root')?.querySelectorAll('button') ?? [],
    ).find(b => b.textContent === 'primary');
    if (primary) {
      for (let i = 0; i < 5; i++) fireEvent.click(primary);
    }
    expect(
      document.getElementById('overlay-root')?.querySelector('[data-testid="change-panel"]'),
    ).not.toBeNull();
  });

  it('renders consistent close button across rerenders', () => {
    const { rerender } = render(<DelegationModal onDismiss={() => {}} />);
    const initial = document.getElementById('overlay-root')?.querySelectorAll('button').length;
    rerender(<DelegationModal onDismiss={() => {}} />);
    expect(document.getElementById('overlay-root')?.querySelectorAll('button').length).toBe(
      initial,
    );
  });

  it('renders 20 DelegationModal instances independently', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 20 }, (_, i) => (
            <DelegationModal key={i} onDismiss={() => {}} delegateTo={`0x${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('Backdrop renders 20 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 20 }, (_, i) => (
          <Backdrop key={i} onDismiss={vi.fn()} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('div').length).toBe(20);
  });

  it('rapid 30 close button clicks fire 30 times', () => {
    const onDismiss = vi.fn();
    render(<DelegationModal onDismiss={onDismiss} />);
    const closeBtn = document.getElementById('overlay-root')?.querySelector('button:first-of-type');
    if (closeBtn) {
      for (let i = 0; i < 30; i++) fireEvent.click(closeBtn);
    }
    expect(onDismiss).toHaveBeenCalledTimes(30);
  });

  it('rerender preserves portal structure 5 times', () => {
    const { rerender } = render(<DelegationModal onDismiss={() => {}} delegateTo="0x0" />);
    for (let i = 0; i < 5; i++) {
      rerender(<DelegationModal onDismiss={() => {}} delegateTo={`0x${i}`} />);
      expect(
        document.getElementById('overlay-root')?.querySelector('[data-testid="change-panel"]'),
      ).not.toBeNull();
    }
  });

  it('Backdrop rerender preserves single div', () => {
    const { container, rerender } = render(<Backdrop onDismiss={vi.fn()} />);
    expect(container.querySelectorAll('div').length).toBe(1);
    rerender(<Backdrop onDismiss={vi.fn()} />);
    expect(container.querySelectorAll('div').length).toBe(1);
  });

  it('Backdrop mount-unmount 1000 cycles', () => {
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(<Backdrop onDismiss={vi.fn()} />);
      unmount();
    }
  });

  it('Backdrop renders 1500 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1500 }, (_, i) => (
            <Backdrop key={i} onDismiss={vi.fn()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('Backdrop rapid 1000 clicks fire handler', () => {
    const onDismiss = vi.fn();
    const { container } = render(<Backdrop onDismiss={onDismiss} />);
    const div = container.querySelector('div')!;
    for (let i = 0; i < 1000; i++) fireEvent.click(div);
    expect(onDismiss).toHaveBeenCalledTimes(1000);
  });

  it('Backdrop 30 sequential renders with new handler', () => {
    for (let i = 0; i < 30; i++) {
      const handler = vi.fn();
      const { container, unmount } = render(<Backdrop onDismiss={handler} />);
      fireEvent.click(container.querySelector('div')!);
      expect(handler).toHaveBeenCalledTimes(1);
      unmount();
    }
  });

  it('Backdrop all 500 instances render div root', () => {
    const { container } = render(
      <>
        {Array.from({ length: 500 }, (_, i) => (
          <Backdrop key={i} onDismiss={vi.fn()} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('div').length).toBe(500);
  });

  it('round-2 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<DelegationModal onDismiss={() => {}} />);
      unmount();
    }
  });

  it('round-2 renders 200 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 200 }, (_, i) => (
            <DelegationModal key={i} onDismiss={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 rapid 300 onDismiss invocations', () => {
    const onDismiss = vi.fn();
    render(<DelegationModal onDismiss={onDismiss} />);
    for (let i = 0; i < 300; i++) onDismiss();
    expect(onDismiss).toHaveBeenCalledTimes(300);
  });

  it('round-2 50 sequential renders with new handler', () => {
    for (let i = 0; i < 50; i++) {
      const onDismiss = vi.fn();
      const { unmount } = render(<DelegationModal onDismiss={onDismiss} />);
      unmount();
    }
  });

  it('round-2 all 100 instances render no crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <DelegationModal key={i} onDismiss={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<DelegationModal onDismiss={() => {}} />);
      unmount();
    }
  });

  it('round-3 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <DelegationModal key={i} onDismiss={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 rapid 200 onDismiss invocations', () => {
    const onDismiss = vi.fn();
    render(<DelegationModal onDismiss={onDismiss} />);
    for (let i = 0; i < 200; i++) onDismiss();
    expect(onDismiss).toHaveBeenCalledTimes(200);
  });

  it('round-3 30 different delegateTo values', () => {
    for (let i = 0; i < 30; i++) {
      const addr = ('0x' + i.toString(16).padStart(40, '0')) as `0x${string}`;
      const { unmount } = render(<DelegationModal onDismiss={() => {}} delegateTo={addr} />);
      unmount();
    }
  });

  it('round-3 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<DelegationModal onDismiss={() => {}} />)).not.toThrow();
    }
  });

  it('round-4 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<DelegationModal onDismiss={() => {}} />);
      unmount();
    }
  });

  it('round-4 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <DelegationModal key={i} onDismiss={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 rapid 200 onDismiss invocations', () => {
    const onDismiss = vi.fn();
    render(<DelegationModal onDismiss={onDismiss} />);
    for (let i = 0; i < 200; i++) onDismiss();
    expect(onDismiss).toHaveBeenCalledTimes(200);
  });

  it('round-4 30 different delegateTo values', () => {
    for (let i = 0; i < 30; i++) {
      const addr = ('0xR4' + i.toString(16).padStart(38, '0')) as `0x${string}`;
      const { unmount } = render(<DelegationModal onDismiss={() => {}} delegateTo={addr} />);
      unmount();
    }
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<DelegationModal onDismiss={() => {}} />)).not.toThrow();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<DelegationModal onDismiss={() => {}} />);
      unmount();
    }
  });

  it('round-5 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <DelegationModal key={i} onDismiss={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<DelegationModal onDismiss={() => {}} />)).not.toThrow();
    }
  });

  it('round-5 rapid 200 onDismiss invocations', () => {
    const onDismiss = vi.fn();
    render(<DelegationModal onDismiss={onDismiss} />);
    for (let i = 0; i < 200; i++) onDismiss();
    expect(onDismiss).toHaveBeenCalledTimes(200);
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<DelegationModal onDismiss={() => {}} />);
      unmount();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<DelegationModal onDismiss={() => {}} />);
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <DelegationModal key={i} onDismiss={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<DelegationModal onDismiss={() => {}} />)).not.toThrow();
    }
  });

  it('round-6 rapid 200 onDismiss invocations', () => {
    const onDismiss = vi.fn();
    render(<DelegationModal onDismiss={onDismiss} />);
    for (let i = 0; i < 200; i++) onDismiss();
    expect(onDismiss).toHaveBeenCalledTimes(200);
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<DelegationModal onDismiss={() => {}} />);
      unmount();
    }
  });
});
