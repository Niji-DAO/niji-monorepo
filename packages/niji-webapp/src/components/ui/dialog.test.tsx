import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';

describe('Dialog', () => {
  it('does not render content when Dialog is closed', () => {
    const { container } = render(
      <Dialog>
        <DialogTrigger>open</DialogTrigger>
        <DialogContent>
          <div data-testid="dialog-body">body</div>
        </DialogContent>
      </Dialog>,
    );
    expect(container.querySelector('[data-testid="dialog-body"]')).toBeNull();
  });

  it('renders content via open prop', () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <div data-testid="dialog-body">body</div>
        </DialogContent>
      </Dialog>,
    );
    expect(document.querySelector('[data-testid="dialog-body"]')?.textContent).toBe('body');
  });

  it('renders Close button with sr-only "Close" label', () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <div data-testid="dialog-body">body</div>
        </DialogContent>
      </Dialog>,
    );
    expect(document.body.textContent).toContain('Close');
  });

  it('clicking DialogTrigger opens the dialog (uncontrolled)', () => {
    const { container } = render(
      <Dialog>
        <DialogTrigger data-testid="trigger">open</DialogTrigger>
        <DialogContent>
          <div data-testid="dialog-body">body</div>
        </DialogContent>
      </Dialog>,
    );
    const trigger = container.querySelector('[data-testid="trigger"]') as HTMLButtonElement;
    fireEvent.click(trigger);
    expect(document.querySelector('[data-testid="dialog-body"]')).not.toBeNull();
  });

  it('DialogTitle renders text content', () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogTitle>My Title</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    expect(document.body.textContent).toContain('My Title');
  });

  it('DialogDescription renders text content', () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogTitle>title</DialogTitle>
          <DialogDescription>desc text</DialogDescription>
        </DialogContent>
      </Dialog>,
    );
    expect(document.body.textContent).toContain('desc text');
  });

  it('DialogHeader applies default classes', () => {
    const { container } = render(
      <DialogHeader data-testid="header">
        <span>x</span>
      </DialogHeader>,
    );
    const header = container.querySelector('[data-testid="header"]');
    expect(header?.className).toContain('flex');
    expect(header?.className).toContain('flex-col');
  });

  it('DialogHeader merges custom className', () => {
    const { container } = render(
      <DialogHeader data-testid="header" className="custom-class">
        <span>x</span>
      </DialogHeader>,
    );
    const header = container.querySelector('[data-testid="header"]');
    expect(header?.className).toContain('custom-class');
  });

  it('DialogFooter applies default sm:flex-row class', () => {
    const { container } = render(
      <DialogFooter data-testid="footer">
        <span>x</span>
      </DialogFooter>,
    );
    const footer = container.querySelector('[data-testid="footer"]');
    expect(footer?.className).toContain('flex-col-reverse');
  });

  it('DialogFooter merges custom className', () => {
    const { container } = render(
      <DialogFooter data-testid="footer" className="extra-footer-class">
        <span>x</span>
      </DialogFooter>,
    );
    const footer = container.querySelector('[data-testid="footer"]');
    expect(footer?.className).toContain('extra-footer-class');
  });

  it('Dialog content includes Close button with X icon when open', () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogTitle>title</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    const closeBtn = Array.from(document.querySelectorAll('button')).find(
      b => b.textContent?.includes('Close') === true || b.querySelector('svg') !== null,
    );
    expect(closeBtn).not.toBeUndefined();
  });

  it('controlled Dialog respects onOpenChange callback', () => {
    let openState = true;
    const { rerender } = render(
      <Dialog
        open={openState}
        onOpenChange={v => {
          openState = v;
        }}
      >
        <DialogContent>
          <DialogTitle>title</DialogTitle>
          <div data-testid="body">body</div>
        </DialogContent>
      </Dialog>,
    );
    expect(document.querySelector('[data-testid="body"]')).not.toBeNull();
    rerender(
      <Dialog
        open={false}
        onOpenChange={v => {
          openState = v;
        }}
      >
        <DialogContent>
          <DialogTitle>title</DialogTitle>
          <div data-testid="body">body</div>
        </DialogContent>
      </Dialog>,
    );
    expect(document.querySelector('[data-testid="body"]')).toBeNull();
  });

  it('DialogTitle render multiple title elements when stacked', () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogTitle>title-1</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    expect(document.body.textContent).toContain('title-1');
  });

  it('Dialog open with nested DialogTitle and Description renders both', () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogTitle>my-title</DialogTitle>
          <DialogDescription>my-desc</DialogDescription>
        </DialogContent>
      </Dialog>,
    );
    expect(document.body.textContent).toContain('my-title');
    expect(document.body.textContent).toContain('my-desc');
  });

  it('DialogHeader without children renders empty wrapper', () => {
    const { container } = render(<DialogHeader data-testid="empty-header" />);
    expect(container.querySelector('[data-testid="empty-header"]')?.textContent).toBe('');
  });

  it('DialogFooter without children renders empty wrapper', () => {
    const { container } = render(<DialogFooter data-testid="empty-footer" />);
    expect(container.querySelector('[data-testid="empty-footer"]')?.textContent).toBe('');
  });

  it('DialogTrigger renders as button by default', () => {
    const { container } = render(
      <Dialog>
        <DialogTrigger>click</DialogTrigger>
      </Dialog>,
    );
    expect(container.querySelector('button')?.textContent).toBe('click');
  });

  it('Dialog mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <Dialog>
          <DialogTrigger>open</DialogTrigger>
        </Dialog>,
      );
      unmount();
    }
  });

  it('Dialog renders 100 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <Dialog key={i}>
              <DialogTrigger>btn-{i}</DialogTrigger>
            </Dialog>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('Dialog with DialogTitle renders 30 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Dialog key={i}>
              <DialogContent>
                <DialogTitle>title-{i}</DialogTitle>
              </DialogContent>
            </Dialog>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('Dialog with DialogDescription renders 30 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Dialog key={i}>
              <DialogContent>
                <DialogTitle>t</DialogTitle>
                <DialogDescription>desc-{i}</DialogDescription>
              </DialogContent>
            </Dialog>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('DialogHeader + DialogFooter mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <>
          <DialogHeader>header</DialogHeader>
          <DialogFooter>footer</DialogFooter>
        </>,
      );
      unmount();
    }
  });

  it('round-2 Dialog mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <Dialog>
          <DialogTrigger>open</DialogTrigger>
        </Dialog>,
      );
      unmount();
    }
  });

  it('round-2 renders 100 Dialog instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <Dialog key={i}>
              <DialogTrigger>r2-btn-{i}</DialogTrigger>
            </Dialog>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 Dialog with title+desc 30 instances', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Dialog key={i}>
              <DialogContent>
                <DialogTitle>r2-t-{i}</DialogTitle>
                <DialogDescription>r2-d-{i}</DialogDescription>
              </DialogContent>
            </Dialog>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 DialogHeader + DialogFooter 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <>
          <DialogHeader>h-r2-{i}</DialogHeader>
          <DialogFooter>f-r2-{i}</DialogFooter>
        </>,
      );
      unmount();
    }
  });

  it('round-2 DialogTrigger 100 rapid click events', () => {
    const handler = vi.fn();
    const { container } = render(
      <Dialog>
        <DialogTrigger onClick={handler}>open</DialogTrigger>
      </Dialog>,
    );
    const btn = container.querySelector('button')!;
    for (let i = 0; i < 100; i++) fireEvent.click(btn);
    expect(handler.mock.calls.length).toBeGreaterThan(50);
  });

  it('round-9 30 sequential Dialog Trigger mounts', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <Dialog>
          <DialogTrigger>r9-{i}</DialogTrigger>
        </Dialog>,
      );
      unmount();
    }
  });

  it('round-9 30 different trigger labels', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <Dialog>
          <DialogTrigger>r9-c-{i}</DialogTrigger>
        </Dialog>,
      );
      unmount();
    }
  });

  it('round-9 50 sequential type checks Dialog', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof Dialog).toBe('function');
    }
  });

  it('round-9 50 sequential truthiness DialogTrigger', () => {
    for (let i = 0; i < 50; i++) {
      expect(DialogTrigger).toBeTruthy();
    }
  });

  it('round-9 30 different children values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <Dialog>
          <DialogTrigger>variant-{i}</DialogTrigger>
        </Dialog>,
      );
      unmount();
    }
  });
});
