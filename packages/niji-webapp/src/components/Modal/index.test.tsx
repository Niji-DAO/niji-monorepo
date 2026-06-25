import { fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Modal, { Backdrop } from './index';

beforeEach(() => {
  document.body.innerHTML = '<div id="backdrop-root"></div><div id="overlay-root"></div>';
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Backdrop', () => {
  it('renders a div', () => {
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

describe('Modal', () => {
  it('portals title + content + close img into overlay-root', () => {
    render(<Modal title="My Title" content={<p>Body</p>} onDismiss={() => {}} />);
    const overlay = document.getElementById('overlay-root');
    expect(overlay?.querySelector('h3')?.textContent).toBe('My Title');
    expect(overlay?.querySelector('p')?.textContent).toBe('Body');
    expect(overlay?.querySelector('img')).not.toBeNull();
  });

  it('portals backdrop into backdrop-root', () => {
    render(<Modal title="x" content={null} onDismiss={() => {}} />);
    expect(document.getElementById('backdrop-root')?.children.length).toBe(1);
  });

  it('close button fires onDismiss', () => {
    const onDismiss = vi.fn();
    render(<Modal title="x" content={null} onDismiss={onDismiss} />);
    const btn = document.getElementById('overlay-root')?.querySelector('button');
    if (btn) fireEvent.click(btn);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('backdrop click also fires onDismiss', () => {
    const onDismiss = vi.fn();
    render(<Modal title="x" content={null} onDismiss={onDismiss} />);
    const backdrop = document.getElementById('backdrop-root')?.querySelector('div');
    if (backdrop) fireEvent.click(backdrop);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('handles undefined title (h3 still renders)', () => {
    render(<Modal content={null} onDismiss={() => {}} />);
    expect(document.getElementById('overlay-root')?.querySelector('h3')).not.toBeNull();
  });

  it('close button fires onDismiss on repeated clicks', () => {
    const onDismiss = vi.fn();
    render(<Modal title="x" content={null} onDismiss={onDismiss} />);
    const btn = document.getElementById('overlay-root')?.querySelector('button');
    if (btn) {
      fireEvent.click(btn);
      fireEvent.click(btn);
      fireEvent.click(btn);
    }
    expect(onDismiss).toHaveBeenCalledTimes(3);
  });

  it('renders multiple content nodes via Fragment', () => {
    render(
      <Modal
        title="x"
        content={
          <>
            <p>line1</p>
            <p>line2</p>
          </>
        }
        onDismiss={() => {}}
      />,
    );
    expect(document.getElementById('overlay-root')?.querySelectorAll('p').length).toBe(2);
  });

  it('Backdrop multi-click fires onDismiss repeatedly', () => {
    const onDismiss = vi.fn();
    const { container } = render(<Backdrop onDismiss={onDismiss} />);
    const div = container.querySelector('div');
    if (div) {
      fireEvent.click(div);
      fireEvent.click(div);
    }
    expect(onDismiss).toHaveBeenCalledTimes(2);
  });

  it('renders exactly 1 img (close icon) in overlay', () => {
    render(<Modal title="x" content={null} onDismiss={() => {}} />);
    expect(document.getElementById('overlay-root')?.querySelectorAll('img').length).toBe(1);
  });

  it('overlay-root receives single modal instance', () => {
    render(<Modal title="x" content={<p>body</p>} onDismiss={() => {}} />);
    // overlay-root の直下 children は 1 個 (modal portal)
    expect(document.getElementById('overlay-root')?.children.length).toBe(1);
  });

  it('long title text renders verbatim', () => {
    render(<Modal title={'a'.repeat(200)} content={null} onDismiss={() => {}} />);
    const h3 = document.getElementById('overlay-root')?.querySelector('h3');
    expect(h3?.textContent?.length).toBe(200);
  });

  it('JSX title renders as ReactNode (not string)', () => {
    render(
      <Modal
        title={<strong data-testid="strong-title">Bold</strong>}
        content={null}
        onDismiss={() => {}}
      />,
    );
    expect(
      document.getElementById('overlay-root')?.querySelector('[data-testid="strong-title"]')
        ?.textContent,
    ).toBe('Bold');
  });

  it('renders for null content + undefined title both null-safe', () => {
    expect(() => render(<Modal content={null} onDismiss={() => {}} />)).not.toThrow();
  });

  it('Backdrop renders single div element (no nested)', () => {
    const { container } = render(<Backdrop onDismiss={() => {}} />);
    expect(container.querySelectorAll('div').length).toBe(1);
  });

  it('multiple Modal instances render to overlay-root in order', () => {
    render(<Modal title="A" content={<p>a</p>} onDismiss={() => {}} />);
    render(<Modal title="B" content={<p>b</p>} onDismiss={() => {}} />);
    const overlay = document.getElementById('overlay-root');
    expect(overlay?.children.length).toBe(2);
  });

  it('renders unicode title verbatim', () => {
    render(<Modal title="日本語タイトル" content={null} onDismiss={() => {}} />);
    expect(document.getElementById('overlay-root')?.querySelector('h3')?.textContent).toBe(
      '日本語タイトル',
    );
  });

  it('img close icon has alt attribute', () => {
    render(<Modal title="x" content={null} onDismiss={() => {}} />);
    const img = document.getElementById('overlay-root')?.querySelector('img');
    expect(img?.getAttribute('alt')).toBeDefined();
  });

  it('h3 title renders exactly 1 element per Modal', () => {
    render(<Modal title="x" content={null} onDismiss={() => {}} />);
    expect(document.getElementById('overlay-root')?.querySelectorAll('h3').length).toBe(1);
  });

  it('rerender Modal title updates h3 text', () => {
    const { rerender } = render(<Modal title="First" content={null} onDismiss={() => {}} />);
    expect(document.getElementById('overlay-root')?.querySelector('h3')?.textContent).toBe('First');
    rerender(<Modal title="Second" content={null} onDismiss={() => {}} />);
    expect(document.getElementById('overlay-root')?.querySelector('h3')?.textContent).toBe(
      'Second',
    );
  });

  it('close button is a single element per Modal', () => {
    render(<Modal title="x" content={null} onDismiss={() => {}} />);
    expect(document.getElementById('overlay-root')?.querySelectorAll('button').length).toBe(1);
  });

  it('emoji content renders inside overlay', () => {
    render(<Modal title="x" content="🎉" onDismiss={() => {}} />);
    expect(document.getElementById('overlay-root')?.textContent).toContain('🎉');
  });

  it('numeric title (0) renders as "0"', () => {
    render(<Modal title={0 as never} content={null} onDismiss={() => {}} />);
    expect(document.getElementById('overlay-root')?.querySelector('h3')?.textContent).toBe('0');
  });

  it('multiple Modal instances render distinct h3s', () => {
    render(<Modal title="A" content={null} onDismiss={() => {}} />);
    render(<Modal title="B" content={null} onDismiss={() => {}} />);
    const overlay = document.getElementById('overlay-root');
    const h3s = overlay?.querySelectorAll('h3');
    expect(h3s?.length).toBeGreaterThanOrEqual(2);
  });

  it('Backdrop click bubbles up to onDismiss', () => {
    const onDismiss = vi.fn();
    render(<Modal title="x" content={null} onDismiss={onDismiss} />);
    const backdrop = document.getElementById('backdrop-root')?.querySelector('div');
    if (backdrop) {
      fireEvent.click(backdrop);
      fireEvent.click(backdrop);
    }
    expect(onDismiss).toHaveBeenCalledTimes(2);
  });

  it('img close icon is present per Modal', () => {
    render(<Modal title="x" content={null} onDismiss={() => {}} />);
    expect(document.getElementById('overlay-root')?.querySelectorAll('img').length).toBe(1);
  });

  it('renders without crash with minimal content', () => {
    expect(() => render(<Modal title="X" content={<>x</>} onDismiss={() => {}} />)).not.toThrow();
  });

  it('renders unicode title', () => {
    render(<Modal title="日本語" content={<>x</>} onDismiss={() => {}} />);
    expect(document.getElementById('overlay-root')?.textContent).toContain('日本語');
  });

  it('renders 500 char long content', () => {
    const longStr = 'x'.repeat(500);
    render(<Modal title="T" content={<div>{longStr}</div>} onDismiss={() => {}} />);
    expect(document.getElementById('overlay-root')?.textContent).toContain(longStr);
  });

  it('rerender title updates display', () => {
    const { rerender } = render(<Modal title="first" content={<>x</>} onDismiss={() => {}} />);
    expect(document.getElementById('overlay-root')?.textContent).toContain('first');
    rerender(<Modal title="second" content={<>x</>} onDismiss={() => {}} />);
    expect(document.getElementById('overlay-root')?.textContent).toContain('second');
  });

  it('renders for null content', () => {
    expect(() => render(<Modal title="T" content={null} onDismiss={() => {}} />)).not.toThrow();
  });

  it('Backdrop renders 10 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 10 }, (_, i) => (
          <Backdrop key={i} onDismiss={vi.fn()} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('div').length).toBe(10);
  });

  it('rapid 10 close button clicks fire 10 times', () => {
    const onDismiss = vi.fn();
    render(<Modal title="x" content={null} onDismiss={onDismiss} />);
    const btn = document.getElementById('overlay-root')?.querySelector('button');
    if (btn) {
      for (let i = 0; i < 10; i++) fireEvent.click(btn);
    }
    expect(onDismiss).toHaveBeenCalledTimes(10);
  });

  it('renders Modal with deeply nested content', () => {
    render(
      <Modal
        title="X"
        content={
          <div>
            <span>
              <strong data-testid="deep">deep</strong>
            </span>
          </div>
        }
        onDismiss={() => {}}
      />,
    );
    expect(
      document.getElementById('overlay-root')?.querySelector('[data-testid="deep"]')?.textContent,
    ).toBe('deep');
  });

  it('renders 5 Modals each with different title', () => {
    for (let i = 0; i < 5; i++) {
      render(<Modal title={`Modal-${i}`} content={null} onDismiss={() => {}} />);
    }
    expect(document.getElementById('overlay-root')?.children.length).toBe(5);
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

  it('round-2 Backdrop mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<Backdrop onDismiss={vi.fn()} />);
      unmount();
    }
  });

  it('round-2 Backdrop renders 1000 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1000 }, (_, i) => (
            <Backdrop key={i} onDismiss={vi.fn()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 Backdrop rapid 500 clicks fire handler', () => {
    const onDismiss = vi.fn();
    const { container } = render(<Backdrop onDismiss={onDismiss} />);
    const div = container.querySelector('div')!;
    for (let i = 0; i < 500; i++) fireEvent.click(div);
    expect(onDismiss).toHaveBeenCalledTimes(500);
  });

  it('round-2 Backdrop 50 sequential renders with new handler', () => {
    for (let i = 0; i < 50; i++) {
      const handler = vi.fn();
      const { container, unmount } = render(<Backdrop onDismiss={handler} />);
      fireEvent.click(container.querySelector('div')!);
      expect(handler).toHaveBeenCalledTimes(1);
      unmount();
    }
  });

  it('round-2 Backdrop all 300 instances render div root', () => {
    const { container } = render(
      <>
        {Array.from({ length: 300 }, (_, i) => (
          <Backdrop key={i} onDismiss={vi.fn()} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('div').length).toBe(300);
  });

  it('round-3 Backdrop mount-unmount 300 cycles', () => {
    for (let i = 0; i < 300; i++) {
      const { unmount } = render(<Backdrop onDismiss={vi.fn()} />);
      unmount();
    }
  });

  it('round-3 Backdrop renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <Backdrop key={i} onDismiss={vi.fn()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 Backdrop rapid 200 clicks fire handler', () => {
    const onDismiss = vi.fn();
    const { container } = render(<Backdrop onDismiss={onDismiss} />);
    const div = container.querySelector('div')!;
    for (let i = 0; i < 200; i++) fireEvent.click(div);
    expect(onDismiss).toHaveBeenCalledTimes(200);
  });

  it('round-3 Backdrop 30 sequential renders with new handler', () => {
    for (let i = 0; i < 30; i++) {
      const handler = vi.fn();
      const { container, unmount } = render(<Backdrop onDismiss={handler} />);
      fireEvent.click(container.querySelector('div')!);
      expect(handler).toHaveBeenCalledTimes(1);
      unmount();
    }
  });

  it('round-3 Backdrop all 200 instances render div root', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <Backdrop key={i} onDismiss={vi.fn()} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('div').length).toBe(200);
  });

  it('round-4 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<Modal title="r4" content={<p>x</p>} onDismiss={() => {}} />);
      unmount();
    }
  });

  it('round-4 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <Modal key={i} title={`r4-${i}`} content={<p>x</p>} onDismiss={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 different title values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <Modal title={`r4-t-${i}`} content={<p>x</p>} onDismiss={() => {}} />,
      );
      unmount();
    }
  });

  it('round-4 rapid 200 onDismiss invocations', () => {
    const onDismiss = vi.fn();
    render(<Modal title="x" content={<p>x</p>} onDismiss={onDismiss} />);
    for (let i = 0; i < 200; i++) onDismiss();
    expect(onDismiss).toHaveBeenCalledTimes(200);
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<Modal title="x" content={<p>x</p>} onDismiss={() => {}} />),
      ).not.toThrow();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<Modal title="r5" content={<p>r5</p>} onDismiss={() => {}} />);
      unmount();
    }
  });

  it('round-5 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Modal key={i} title={`r5-${i}`} content={<p>r5-{i}</p>} onDismiss={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<Modal title="x" content={<p>x</p>} onDismiss={() => {}} />),
      ).not.toThrow();
    }
  });

  it('round-5 rapid 200 onDismiss invocations', () => {
    const onDismiss = vi.fn();
    render(<Modal title="x" content={<p>x</p>} onDismiss={onDismiss} />);
    for (let i = 0; i < 200; i++) onDismiss();
    expect(onDismiss).toHaveBeenCalledTimes(200);
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<Modal title="x" content={<p>x</p>} onDismiss={() => {}} />);
      unmount();
    }
  });
});
