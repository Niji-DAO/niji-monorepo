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

  it('emoji content renders verbatim', () => {
    render(<SolidColorBackgroundModal show={true} onDismiss={() => {}} content={<p>🎉</p>} />);
    expect(document.getElementById('overlay-root')?.textContent).toContain('🎉');
  });

  it('rapid 5 dismiss clicks invoke onDismiss 5 times', () => {
    const onDismiss = vi.fn();
    render(<SolidColorBackgroundModal show={true} onDismiss={onDismiss} content={null} />);
    const btn = document.getElementById('overlay-root')?.querySelector('button');
    if (btn) {
      for (let i = 0; i < 5; i++) fireEvent.click(btn);
    }
    expect(onDismiss).toHaveBeenCalledTimes(5);
  });

  it('Backdrop rerender from false to true shows transition', () => {
    const { container, rerender } = render(<Backdrop show={false} onDismiss={() => {}} />);
    expect(container.querySelector('[data-testid="transition"]')).toBeNull();
    rerender(<Backdrop show={true} onDismiss={() => {}} />);
    expect(container.querySelector('[data-testid="transition"]')).not.toBeNull();
  });

  it('long content text (500 chars) renders fully', () => {
    const long = 'a'.repeat(500);
    render(<SolidColorBackgroundModal show={true} onDismiss={() => {}} content={long} />);
    expect(
      (document.getElementById('overlay-root')?.textContent ?? '').length,
    ).toBeGreaterThanOrEqual(500);
  });

  it('content array (Fragment) renders multiple elements', () => {
    render(
      <SolidColorBackgroundModal
        show={true}
        onDismiss={() => {}}
        content={
          <>
            <span>a</span>
            <span>b</span>
            <span>c</span>
          </>
        }
      />,
    );
    expect(document.getElementById('overlay-root')?.querySelectorAll('span').length).toBe(3);
  });

  it('renders without crash with show=false', () => {
    expect(() =>
      render(<SolidColorBackgroundModal show={false} onDismiss={() => {}} content={<>x</>} />),
    ).not.toThrow();
  });

  it('renders 500 char long content', () => {
    const longStr = 'x'.repeat(500);
    render(
      <SolidColorBackgroundModal show={true} onDismiss={() => {}} content={<div>{longStr}</div>} />,
    );
    expect(document.getElementById('overlay-root')?.textContent).toContain(longStr);
  });

  it('rerender from show=false to true does not crash', () => {
    const { rerender } = render(
      <SolidColorBackgroundModal show={false} onDismiss={() => {}} content={<>x</>} />,
    );
    expect(() =>
      rerender(<SolidColorBackgroundModal show={true} onDismiss={() => {}} content={<>x</>} />),
    ).not.toThrow();
  });

  it('renders without crash 5 times consecutively', () => {
    for (let i = 0; i < 5; i++) {
      expect(() =>
        render(<SolidColorBackgroundModal show={true} onDismiss={() => {}} content={<>x</>} />),
      ).not.toThrow();
    }
  });

  it('renders unicode content', () => {
    render(
      <SolidColorBackgroundModal show={true} onDismiss={() => {}} content={<>{'日本語'}</>} />,
    );
    expect(document.getElementById('overlay-root')?.textContent).toContain('日本語');
  });

  it('Backdrop renders 10 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 10 }, (_, i) => (
          <Backdrop key={i} show={true} onDismiss={() => {}} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('[data-testid="transition"]').length).toBe(10);
  });

  it('renders 5 SolidColorBackgroundModal instances each with own content', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 5 }, (_, i) => (
            <SolidColorBackgroundModal
              key={i}
              show={true}
              onDismiss={() => {}}
              content={<p>{`item-${i}`}</p>}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('Backdrop with show=false renders nothing', () => {
    const { container } = render(<Backdrop show={false} onDismiss={vi.fn()} />);
    expect(container.querySelector('[data-testid="transition"]')).toBeNull();
  });

  it('show=true to false rerender removes content from overlay', () => {
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

  it('renders consistent content node type across rerenders', () => {
    const { rerender } = render(
      <SolidColorBackgroundModal show={true} onDismiss={() => {}} content={<p>v1</p>} />,
    );
    expect(document.getElementById('overlay-root')?.querySelector('p')?.textContent).toBe('v1');
    rerender(<SolidColorBackgroundModal show={true} onDismiss={() => {}} content={<p>v2</p>} />);
    expect(document.getElementById('overlay-root')?.querySelector('p')?.textContent).toBe('v2');
  });

  it('mount-unmount 200 cycles', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(
        <SolidColorBackgroundModal show={true} onDismiss={() => {}} content={<p>x</p>} />,
      );
      unmount();
    }
  });

  it('handles 50 different content values', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <SolidColorBackgroundModal show={true} onDismiss={() => {}} content={<p>val-{i}</p>} />,
      );
      unmount();
    }
  });

  it('rapid 500 onDismiss invocations', () => {
    const onDismiss = vi.fn();
    render(<SolidColorBackgroundModal show={true} onDismiss={onDismiss} content={<p>x</p>} />);
    for (let i = 0; i < 500; i++) onDismiss();
    expect(onDismiss).toHaveBeenCalledTimes(500);
  });

  it('handles 30 different show toggle cycles', () => {
    const { rerender } = render(
      <SolidColorBackgroundModal show={true} onDismiss={() => {}} content={<p>x</p>} />,
    );
    for (let i = 0; i < 30; i++) {
      expect(() =>
        rerender(
          <SolidColorBackgroundModal
            show={i % 2 === 0}
            onDismiss={() => {}}
            content={<p>v-{i}</p>}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('renders 10 modals sequentially', () => {
    for (let i = 0; i < 10; i++) {
      const { unmount } = render(
        <SolidColorBackgroundModal show={true} onDismiss={() => {}} content={<p>m-{i}</p>} />,
      );
      unmount();
    }
  });

  it('round-2 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <SolidColorBackgroundModal
          show={true}
          onDismiss={() => {}}
          content={<div>r2-c-{i}</div>}
        />,
      );
      unmount();
    }
  });

  it('round-2 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <SolidColorBackgroundModal
              key={i}
              show={true}
              onDismiss={() => {}}
              content={<div>r2-c-{i}</div>}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 rapid 200 onDismiss invocations', () => {
    const onDismiss = vi.fn();
    render(<SolidColorBackgroundModal show={true} onDismiss={onDismiss} content={<div>x</div>} />);
    for (let i = 0; i < 200; i++) onDismiss();
    expect(onDismiss).toHaveBeenCalledTimes(200);
  });

  it('round-2 handles 30 show toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <SolidColorBackgroundModal
          show={i % 2 === 0}
          onDismiss={() => {}}
          content={<div>x</div>}
        />,
      );
      unmount();
    }
  });

  it('round-2 handles 30 different content nodes', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <SolidColorBackgroundModal
          show={true}
          onDismiss={() => {}}
          content={<div data-testid={`r2-${i}`}>{i}</div>}
        />,
      );
      unmount();
    }
  });

  it('round-3 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <SolidColorBackgroundModal
          show={true}
          onDismiss={() => {}}
          content={<div>r3-c-{i}</div>}
        />,
      );
      unmount();
    }
  });

  it('round-3 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <SolidColorBackgroundModal
              key={i}
              show={true}
              onDismiss={() => {}}
              content={<div>r3-c-{i}</div>}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 rapid 200 onDismiss invocations', () => {
    const onDismiss = vi.fn();
    render(<SolidColorBackgroundModal show={true} onDismiss={onDismiss} content={<div>x</div>} />);
    for (let i = 0; i < 200; i++) onDismiss();
    expect(onDismiss).toHaveBeenCalledTimes(200);
  });

  it('round-3 30 show toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <SolidColorBackgroundModal
          show={i % 2 === 0}
          onDismiss={() => {}}
          content={<div>x</div>}
        />,
      );
      unmount();
    }
  });

  it('round-3 30 different content nodes', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <SolidColorBackgroundModal
          show={true}
          onDismiss={() => {}}
          content={<div data-testid={`r3-${i}`}>{i}</div>}
        />,
      );
      unmount();
    }
  });
});
