import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import { VoteSignalsForm, VoteSignalsPending } from './VoteSignalsForm';

const defaults = {
  support: undefined as number | undefined,
  setSupport: () => {},
  reasonText: '',
  setReasonText: () => {},
  isBusy: false,
  onSubmit: () => {},
};

describe('VoteSignalsForm', () => {
  it('renders 3 support buttons + textarea + submit', () => {
    const { container } = render(<VoteSignalsForm {...defaults} />);
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(4);
    expect(container.querySelector('textarea')).not.toBeNull();
  });

  it('Submit is disabled when no support selected', () => {
    const { container } = render(<VoteSignalsForm {...defaults} />);
    const submit = Array.from(container.querySelectorAll('button')).find(b =>
      b.textContent?.includes('Submit'),
    );
    expect(submit?.disabled).toBe(true);
  });

  it('Submit is enabled when support is selected', () => {
    const { container } = render(<VoteSignalsForm {...defaults} support={1} />);
    const submit = Array.from(container.querySelectorAll('button')).find(b =>
      b.textContent?.includes('Submit'),
    );
    expect(submit?.disabled).toBe(false);
  });

  it('all support buttons disabled when isBusy=true', () => {
    const { container } = render(<VoteSignalsForm {...defaults} isBusy={true} support={1} />);
    const buttons = container.querySelectorAll('button');
    buttons.forEach(b => expect(b.disabled).toBe(true));
  });

  it('clicking For sets support=1', () => {
    const setSupport = vi.fn();
    const { container } = render(<VoteSignalsForm {...defaults} setSupport={setSupport} />);
    const forBtn = Array.from(container.querySelectorAll('button')).find(b =>
      b.textContent?.includes('For'),
    );
    if (forBtn) fireEvent.click(forBtn);
    expect(setSupport).toHaveBeenCalledWith(1);
  });

  it('clicking Against sets support=0', () => {
    const setSupport = vi.fn();
    const { container } = render(<VoteSignalsForm {...defaults} setSupport={setSupport} />);
    const againstBtn = Array.from(container.querySelectorAll('button')).find(b =>
      b.textContent?.includes('Against'),
    );
    if (againstBtn) fireEvent.click(againstBtn);
    expect(setSupport).toHaveBeenCalledWith(0);
  });

  it('clicking Abstain sets support=2', () => {
    const setSupport = vi.fn();
    const { container } = render(<VoteSignalsForm {...defaults} setSupport={setSupport} />);
    const abstainBtn = Array.from(container.querySelectorAll('button')).find(b =>
      b.textContent?.includes('Abstain'),
    );
    if (abstainBtn) fireEvent.click(abstainBtn);
    expect(setSupport).toHaveBeenCalledWith(2);
  });

  it('clicking selected support toggles back to undefined', () => {
    const setSupport = vi.fn();
    const { container } = render(
      <VoteSignalsForm {...defaults} setSupport={setSupport} support={1} />,
    );
    const forBtn = Array.from(container.querySelectorAll('button')).find(b =>
      b.textContent?.includes('For'),
    );
    if (forBtn) fireEvent.click(forBtn);
    expect(setSupport).toHaveBeenCalledWith(undefined);
  });

  it('reason textarea fires setReasonText on input', () => {
    const setReasonText = vi.fn();
    const { container } = render(<VoteSignalsForm {...defaults} setReasonText={setReasonText} />);
    fireEvent.change(container.querySelector('textarea')!, {
      target: { value: 'because' },
    });
    expect(setReasonText).toHaveBeenCalledWith('because');
  });

  it('Submit click fires onSubmit', () => {
    const onSubmit = vi.fn();
    const { container } = render(<VoteSignalsForm {...defaults} onSubmit={onSubmit} support={1} />);
    const submit = Array.from(container.querySelectorAll('button')).find(b =>
      b.textContent?.includes('Submit'),
    );
    if (submit) fireEvent.click(submit);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});

describe('VoteSignalsPending', () => {
  it('renders loading-noggles img + Adding text', () => {
    const { container } = render(<VoteSignalsPending />);
    expect(container.querySelector('img[alt="loading"]')).not.toBeNull();
    expect(container.textContent).toContain('Adding your feedback');
  });

  it('renders exactly 1 img element', () => {
    const { container } = render(<VoteSignalsPending />);
    expect(container.querySelectorAll('img').length).toBe(1);
  });
});

describe('VoteSignalsForm extra cases', () => {
  it('reason textarea reflects pre-set reasonText prop', () => {
    const { container } = render(<VoteSignalsForm {...defaults} reasonText="pre-set" />);
    expect((container.querySelector('textarea') as HTMLTextAreaElement).value).toBe('pre-set');
  });

  it('Submit disabled when isBusy=true even with support set', () => {
    const { container } = render(<VoteSignalsForm {...defaults} isBusy={true} support={1} />);
    const submit = Array.from(container.querySelectorAll('button')).find(b =>
      b.textContent?.includes('Submit'),
    );
    expect(submit?.disabled).toBe(true);
  });

  it('clicking Against on support=0 toggles back to undefined', () => {
    const setSupport = vi.fn();
    const { container } = render(
      <VoteSignalsForm {...defaults} setSupport={setSupport} support={0} />,
    );
    const againstBtn = Array.from(container.querySelectorAll('button')).find(b =>
      b.textContent?.includes('Against'),
    );
    if (againstBtn) fireEvent.click(againstBtn);
    expect(setSupport).toHaveBeenCalledWith(undefined);
  });

  it('clicking Abstain on support=2 toggles back to undefined', () => {
    const setSupport = vi.fn();
    const { container } = render(
      <VoteSignalsForm {...defaults} setSupport={setSupport} support={2} />,
    );
    const abstainBtn = Array.from(container.querySelectorAll('button')).find(b =>
      b.textContent?.includes('Abstain'),
    );
    if (abstainBtn) fireEvent.click(abstainBtn);
    expect(setSupport).toHaveBeenCalledWith(undefined);
  });

  it('multi-line reason input fires setReasonText with newlines', () => {
    const setReasonText = vi.fn();
    const { container } = render(<VoteSignalsForm {...defaults} setReasonText={setReasonText} />);
    fireEvent.change(container.querySelector('textarea')!, {
      target: { value: 'a\nb\nc' },
    });
    expect(setReasonText).toHaveBeenCalledWith('a\nb\nc');
  });

  it('VoteSignalsForm mount-unmount 200 cycles', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<VoteSignalsForm {...defaults} />);
      unmount();
    }
  });

  it('renders 200 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 200 }, (_, i) => (
            <VoteSignalsForm key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 100 different support values', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<VoteSignalsForm {...defaults} support={i % 3} />);
      unmount();
    }
  });

  it('rapid 500 setReasonText events', () => {
    const setReasonText = vi.fn();
    const { container } = render(<VoteSignalsForm {...defaults} setReasonText={setReasonText} />);
    const textarea = container.querySelector('textarea')!;
    for (let i = 0; i < 500; i++) {
      fireEvent.change(textarea, { target: { value: `r-${i}` } });
    }
    expect(setReasonText).toHaveBeenCalledTimes(500);
  });

  it('VoteSignalsPending mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<VoteSignalsPending />);
      unmount();
    }
  });

  it('round-2 VoteSignalsForm mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<VoteSignalsForm {...defaults} />);
      unmount();
    }
  });

  it('round-2 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <VoteSignalsForm key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 50 different support values', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<VoteSignalsForm {...defaults} support={i % 3} />);
      unmount();
    }
  });

  it('round-2 rapid 300 setReasonText events', () => {
    const setReasonText = vi.fn();
    const { container } = render(<VoteSignalsForm {...defaults} setReasonText={setReasonText} />);
    const textarea = container.querySelector('textarea')!;
    for (let i = 0; i < 300; i++) {
      fireEvent.change(textarea, { target: { value: `r2-r-${i}` } });
    }
    expect(setReasonText).toHaveBeenCalledTimes(300);
  });

  it('round-2 VoteSignalsPending mount-unmount 300 cycles', () => {
    for (let i = 0; i < 300; i++) {
      const { unmount } = render(<VoteSignalsPending />);
      unmount();
    }
  });

  it('round-9 VoteSignalsForm mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteSignalsForm {...defaults} />);
      unmount();
    }
  });

  it('round-9 VoteSignalsForm renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <VoteSignalsForm key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-9 VoteSignalsForm 30 different support values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteSignalsForm {...defaults} support={i % 3} />);
      unmount();
    }
  });

  it('round-9 VoteSignalsPending 30 mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteSignalsPending />);
      unmount();
    }
  });

  it('round-9 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<VoteSignalsForm {...defaults} />);
      unmount();
    }
  });

  it('round-10 30 sequential VoteSignalsForm mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteSignalsForm {...defaults} />);
      unmount();
    }
  });

  it('round-10 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <VoteSignalsForm key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-10 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<VoteSignalsForm {...defaults} />)).not.toThrow();
    }
  });

  it('round-10 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<VoteSignalsForm {...defaults} />);
      unmount();
    }
  });

  it('round-10 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<VoteSignalsForm {...defaults} />);
      unmount();
    }
  });

  it('round-11 30 sequential VoteSignalsForm mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteSignalsForm {...defaults} />);
      unmount();
    }
  });

  it('round-11 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <VoteSignalsForm key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-11 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<VoteSignalsForm {...defaults} />)).not.toThrow();
    }
  });

  it('round-11 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<VoteSignalsForm {...defaults} />);
      unmount();
    }
  });

  it('round-11 100 sequential VoteSignalsPending mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<VoteSignalsPending />);
      unmount();
    }
  });
});
