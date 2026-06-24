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
});
