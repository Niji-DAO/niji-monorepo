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
});
