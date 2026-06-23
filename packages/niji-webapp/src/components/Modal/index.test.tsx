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
});
