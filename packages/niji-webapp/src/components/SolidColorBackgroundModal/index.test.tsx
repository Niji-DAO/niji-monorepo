import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/components/NijisTransition', () => ({
  default: ({
    show,
    children,
    className,
  }: {
    show: boolean;
    children?: React.ReactNode;
    className?: string;
  }) =>
    show ? (
      <div className={className} data-testid="transition">
        {children}
      </div>
    ) : null,
}));

vi.mock('@/utils/cssTransitionUtils', () => ({
  basicFadeInOut: {},
  desktopModalSlideInFromTopAndGrow: {},
  mobileModalSlideInFromBottm: {},
}));

vi.mock('@/utils/isMobile', () => ({
  isMobileScreen: () => false,
}));

import SolidColorBackgroundModal, { Backdrop } from './index';

beforeEach(() => {
  document.body.innerHTML =
    '<div id="root"></div><div id="backdrop-root"></div><div id="overlay-root"></div>';
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Backdrop', () => {
  it('does not render when show=false', () => {
    const { container } = render(<Backdrop show={false} onDismiss={() => {}} />);
    expect(container.querySelector('[data-testid="transition"]')).toBeNull();
  });

  it('renders when show=true', () => {
    const { container } = render(<Backdrop show={true} onDismiss={() => {}} />);
    expect(container.querySelector('[data-testid="transition"]')).not.toBeNull();
  });
});

describe('SolidColorBackgroundModal', () => {
  it('portals into backdrop-root + overlay-root', () => {
    render(<SolidColorBackgroundModal show={true} onDismiss={() => {}} content={<p>x</p>} />);
    expect(document.getElementById('backdrop-root')?.children.length).toBe(1);
    expect((document.getElementById('overlay-root')?.children.length ?? 0) > 0).toBe(true);
  });

  it('does not show content when show=false', () => {
    render(<SolidColorBackgroundModal show={false} onDismiss={() => {}} content={<p>x</p>} />);
    // NijisTransition mock で show=false は null を返すので overlay-root.children は空
    expect(document.getElementById('overlay-root')?.querySelector('p')).toBeNull();
  });

  it('renders content when show=true', () => {
    render(
      <SolidColorBackgroundModal show={true} onDismiss={() => {}} content={<p>my content</p>} />,
    );
    expect(document.getElementById('overlay-root')?.querySelector('p')?.textContent).toBe(
      'my content',
    );
  });

  it('fires onDismiss on close button click', () => {
    const onDismiss = vi.fn();
    render(<SolidColorBackgroundModal show={true} onDismiss={onDismiss} content={null} />);
    const btn = document.getElementById('overlay-root')?.querySelector('button');
    if (btn) fireEvent.click(btn);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('fires onDismiss on repeated close clicks', () => {
    const onDismiss = vi.fn();
    render(<SolidColorBackgroundModal show={true} onDismiss={onDismiss} content={null} />);
    const btn = document.getElementById('overlay-root')?.querySelector('button');
    if (btn) {
      fireEvent.click(btn);
      fireEvent.click(btn);
      fireEvent.click(btn);
    }
    expect(onDismiss).toHaveBeenCalledTimes(3);
  });

  it('renders multiple children content within overlay-root', () => {
    render(
      <SolidColorBackgroundModal
        show={true}
        onDismiss={() => {}}
        content={
          <>
            <p>line1</p>
            <p>line2</p>
          </>
        }
      />,
    );
    expect(document.getElementById('overlay-root')?.querySelectorAll('p').length).toBe(2);
  });

  it('renders numeric content node', () => {
    render(<SolidColorBackgroundModal show={true} onDismiss={() => {}} content={42 as never} />);
    expect(document.getElementById('overlay-root')?.textContent).toContain('42');
  });

  it('renders exactly 1 close button (single dismiss handler)', () => {
    render(<SolidColorBackgroundModal show={true} onDismiss={() => {}} content={<p>x</p>} />);
    const buttons = document.getElementById('overlay-root')?.querySelectorAll('button');
    expect(buttons?.length).toBe(1);
  });

  it('show toggle false → true rerender re-mounts content', () => {
    const { rerender } = render(
      <SolidColorBackgroundModal
        show={false}
        onDismiss={() => {}}
        content={<p data-testid="x">a</p>}
      />,
    );
    expect(document.getElementById('overlay-root')?.querySelector('[data-testid="x"]')).toBeNull();
    rerender(
      <SolidColorBackgroundModal
        show={true}
        onDismiss={() => {}}
        content={<p data-testid="x">a</p>}
      />,
    );
    expect(
      document.getElementById('overlay-root')?.querySelector('[data-testid="x"]'),
    ).not.toBeNull();
  });

  it('Backdrop transition wrapper renders when show=true', () => {
    const { container } = render(<Backdrop show={true} onDismiss={() => {}} />);
    expect(container.querySelector('[data-testid="transition"]')).not.toBeNull();
  });

  it('Backdrop rerender to show=false hides element', () => {
    const { rerender, container } = render(<Backdrop show={true} onDismiss={() => {}} />);
    expect(container.querySelector('[data-testid="transition"]')).not.toBeNull();
    rerender(<Backdrop show={false} onDismiss={() => {}} />);
    expect(container.querySelector('[data-testid="transition"]')).toBeNull();
  });

  it('renders null content gracefully', () => {
    render(<SolidColorBackgroundModal show={true} onDismiss={() => {}} content={null} />);
    expect(document.getElementById('overlay-root')?.querySelector('p')).toBeNull();
  });

  it('renders string content directly', () => {
    render(
      <SolidColorBackgroundModal show={true} onDismiss={() => {}} content={'hello' as never} />,
    );
    expect(document.getElementById('overlay-root')?.textContent).toContain('hello');
  });

  it('renders content within overlay-root not backdrop-root', () => {
    render(
      <SolidColorBackgroundModal
        show={true}
        onDismiss={() => {}}
        content={<p data-testid="content">v</p>}
      />,
    );
    expect(
      document.getElementById('overlay-root')?.querySelector('[data-testid="content"]'),
    ).not.toBeNull();
    expect(
      document.getElementById('backdrop-root')?.querySelector('[data-testid="content"]'),
    ).toBeNull();
  });

  it('Backdrop renders transition wrapper with show=true (no crash on construct)', () => {
    const onDismiss = vi.fn();
    const { container } = render(<Backdrop show={true} onDismiss={onDismiss} />);
    expect(container.querySelector('[data-testid="transition"]')).not.toBeNull();
  });

  it('multiple modals render independently in same DOM', () => {
    render(
      <>
        <SolidColorBackgroundModal show={true} onDismiss={() => {}} content={<p>A</p>} />
        <SolidColorBackgroundModal show={true} onDismiss={() => {}} content={<p>B</p>} />
      </>,
    );
    expect(document.getElementById('overlay-root')?.textContent).toContain('A');
    expect(document.getElementById('overlay-root')?.textContent).toContain('B');
  });

  it('show=true → false rerender removes content', () => {
    const { rerender } = render(
      <SolidColorBackgroundModal
        show={true}
        onDismiss={() => {}}
        content={<p data-testid="x">a</p>}
      />,
    );
    expect(
      document.getElementById('overlay-root')?.querySelector('[data-testid="x"]'),
    ).not.toBeNull();
    rerender(
      <SolidColorBackgroundModal
        show={false}
        onDismiss={() => {}}
        content={<p data-testid="x">a</p>}
      />,
    );
    expect(document.getElementById('overlay-root')?.querySelector('[data-testid="x"]')).toBeNull();
  });

  it('content rerender updates text', () => {
    const { rerender } = render(
      <SolidColorBackgroundModal show={true} onDismiss={() => {}} content={<p>First</p>} />,
    );
    expect(document.getElementById('overlay-root')?.textContent).toContain('First');
    rerender(
      <SolidColorBackgroundModal show={true} onDismiss={() => {}} content={<p>Second</p>} />,
    );
    expect(document.getElementById('overlay-root')?.textContent).toContain('Second');
  });

  it('unicode content renders verbatim', () => {
    render(
      <SolidColorBackgroundModal show={true} onDismiss={() => {}} content={<p>こんにちは</p>} />,
    );
    expect(document.getElementById('overlay-root')?.textContent).toContain('こんにちは');
  });

  it('Backdrop renders no transition when show=false', () => {
    const { container } = render(<Backdrop show={false} onDismiss={() => {}} />);
    expect(container.querySelector('[data-testid="transition"]')).toBeNull();
  });
});
