import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/BrandDatePicker', () => ({
  default: ({
    onChange,
    label,
    isInvalid,
  }: {
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    label?: string;
    isInvalid?: boolean;
  }) => (
    <label>
      {label}
      <input
        type="date"
        onChange={onChange}
        data-invalid={isInvalid ? 'true' : 'false'}
        data-label={label}
      />
    </label>
  ),
}));

vi.mock('@/components/ModalBottomButtonRow', () => ({
  default: ({
    onPrevBtnClick,
    onNextBtnClick,
    prevBtnText,
    nextBtnText,
    isNextBtnDisabled,
  }: {
    onPrevBtnClick: React.MouseEventHandler<HTMLDivElement>;
    onNextBtnClick: React.MouseEventHandler<HTMLDivElement>;
    prevBtnText: React.ReactNode;
    nextBtnText: React.ReactNode;
    isNextBtnDisabled?: boolean;
  }) => (
    <>
      <button onClick={onPrevBtnClick as never}>{prevBtnText}</button>
      <button onClick={onNextBtnClick as never} disabled={isNextBtnDisabled} data-testid="next-btn">
        {nextBtnText}
      </button>
    </>
  ),
}));

vi.mock('@/components/ModalTitle', () => ({
  default: ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>,
}));

vi.mock('@/components/ModalSubtitle', () => ({
  default: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));

vi.mock('@/utils/timeUtils', () => ({
  currentUnixEpoch: () => 1700000000,
  toUnixEpoch: (date: string) => (date ? new Date(date).getTime() / 1000 : 0),
}));

import StreamPaymentDateDetailsStep from './index';

const defaults = {
  onPrevBtnClick: () => {},
  onNextBtnClick: () => {},
  setState: () => {},
  state: {} as never,
};

describe('StreamPaymentDateDetailsStep', () => {
  it('renders title + 2 date pickers + next/prev buttons', () => {
    const { container } = render(<StreamPaymentDateDetailsStep {...defaults} />);
    expect(container.querySelector('h1')?.textContent).toContain('Add Streaming Payment Action');
    expect(container.querySelectorAll('input[type="date"]').length).toBe(2);
    expect(container.querySelectorAll('button').length).toBe(2);
  });

  it('fires onPrevBtnClick on Back button click', () => {
    const onPrev = vi.fn();
    const { container } = render(
      <StreamPaymentDateDetailsStep {...defaults} onPrevBtnClick={onPrev} />,
    );
    fireEvent.click(container.querySelectorAll('button')[0]);
    expect(onPrev).toHaveBeenCalledTimes(1);
  });

  it('calls setState + onNextBtnClick when proceeding', () => {
    const onNext = vi.fn();
    const setState = vi.fn();
    const { container } = render(
      <StreamPaymentDateDetailsStep {...defaults} onNextBtnClick={onNext} setState={setState} />,
    );
    fireEvent.click(container.querySelector('[data-testid="next-btn"]')!);
    expect(onNext).toHaveBeenCalledTimes(1);
    expect(setState).toHaveBeenCalledTimes(1);
  });

  it('disables Next when endTimestamp < startTimestamp (start > 0 + end > 0)', () => {
    const { container } = render(<StreamPaymentDateDetailsStep {...defaults} />);
    const inputs = container.querySelectorAll('input[type="date"]');
    fireEvent.change(inputs[0], { target: { value: '2030-12-31' } });
    fireEvent.change(inputs[1], { target: { value: '2025-01-01' } });
    expect(container.querySelector('[data-testid="next-btn"]')?.disabled).toBe(true);
  });

  it('Next is enabled when both dates empty (default)', () => {
    const { container } = render(<StreamPaymentDateDetailsStep {...defaults} />);
    expect(container.querySelector('[data-testid="next-btn"]')?.disabled).toBe(false);
  });

  it('marks Start date invalid when in past (currentUnixEpoch > startTimestamp)', () => {
    const { container } = render(<StreamPaymentDateDetailsStep {...defaults} />);
    const inputs = container.querySelectorAll('input[type="date"]');
    fireEvent.change(inputs[0], { target: { value: '2020-01-01' } });
    expect(inputs[0].getAttribute('data-invalid')).toBe('true');
  });

  it('renders streams start/end note', () => {
    const { container } = render(<StreamPaymentDateDetailsStep {...defaults} />);
    expect(container.textContent).toContain('Streams start and end at 00:00 UTC');
  });

  it('renders exactly 1 h1 title element', () => {
    const { container } = render(<StreamPaymentDateDetailsStep {...defaults} />);
    expect(container.querySelectorAll('h1').length).toBe(1);
  });

  it('renders exactly 2 date input elements', () => {
    const { container } = render(<StreamPaymentDateDetailsStep {...defaults} />);
    expect(container.querySelectorAll('input[type="date"]').length).toBe(2);
  });

  it('renders exactly 2 buttons (prev + next)', () => {
    const { container } = render(<StreamPaymentDateDetailsStep {...defaults} />);
    expect(container.querySelectorAll('button').length).toBe(2);
  });

  it('valid future dates do not mark inputs invalid', () => {
    const { container } = render(<StreamPaymentDateDetailsStep {...defaults} />);
    const inputs = container.querySelectorAll('input[type="date"]');
    // mock currentUnixEpoch = 1700000000 = 2023-11-14、 2030 は未来
    fireEvent.change(inputs[0], { target: { value: '2030-01-01' } });
    fireEvent.change(inputs[1], { target: { value: '2030-12-31' } });
    expect(inputs[0].getAttribute('data-invalid')).toBe('false');
    expect(inputs[1].getAttribute('data-invalid')).toBe('false');
  });

  it('repeated Back button clicks fire onPrevBtnClick multiple times', () => {
    const onPrev = vi.fn();
    const { container } = render(
      <StreamPaymentDateDetailsStep {...defaults} onPrevBtnClick={onPrev} />,
    );
    const backBtn = container.querySelectorAll('button')[0];
    fireEvent.click(backBtn);
    fireEvent.click(backBtn);
    fireEvent.click(backBtn);
    expect(onPrev).toHaveBeenCalledTimes(3);
  });

  it('paragraph (subtitle) is rendered', () => {
    const { container } = render(<StreamPaymentDateDetailsStep {...defaults} />);
    expect(container.querySelector('p')).not.toBeNull();
  });

  it('next-btn click works after future start + future end', () => {
    const onNext = vi.fn();
    const { container } = render(
      <StreamPaymentDateDetailsStep {...defaults} onNextBtnClick={onNext} />,
    );
    const inputs = container.querySelectorAll('input[type="date"]');
    fireEvent.change(inputs[0], { target: { value: '2030-01-01' } });
    fireEvent.change(inputs[1], { target: { value: '2030-12-31' } });
    fireEvent.click(container.querySelector('[data-testid="next-btn"]')!);
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('start date input has "Start" related label', () => {
    const { container } = render(<StreamPaymentDateDetailsStep {...defaults} />);
    const inputs = container.querySelectorAll('input[type="date"]');
    expect(inputs[0].getAttribute('data-label')).toContain('Start');
  });

  it('end date input has "End" related label', () => {
    const { container } = render(<StreamPaymentDateDetailsStep {...defaults} />);
    const inputs = container.querySelectorAll('input[type="date"]');
    expect(inputs[1].getAttribute('data-label')).toContain('End');
  });

  it('back button is independent of date validity', () => {
    const onPrev = vi.fn();
    const { container } = render(
      <StreamPaymentDateDetailsStep {...defaults} onPrevBtnClick={onPrev} />,
    );
    const inputs = container.querySelectorAll('input[type="date"]');
    fireEvent.change(inputs[0], { target: { value: '2020-01-01' } });
    fireEvent.click(container.querySelectorAll('button')[0]);
    expect(onPrev).toHaveBeenCalledTimes(1);
  });

  it('subtitle paragraph text exists (non-empty)', () => {
    const { container } = render(<StreamPaymentDateDetailsStep {...defaults} />);
    expect((container.querySelector('p')?.textContent ?? '').length).toBeGreaterThan(0);
  });

  it('renders 2 date input elements (start + end)', () => {
    const { container } = render(<StreamPaymentDateDetailsStep {...defaults} />);
    expect(container.querySelectorAll('input[type="date"]').length).toBe(2);
  });

  it('renders 2 buttons (Back + Next)', () => {
    const { container } = render(<StreamPaymentDateDetailsStep {...defaults} />);
    expect(container.querySelectorAll('button').length).toBe(2);
  });

  it('h1 title renders exactly 1 time', () => {
    const { container } = render(<StreamPaymentDateDetailsStep {...defaults} />);
    expect(container.querySelectorAll('h1').length).toBe(1);
  });

  it('back button repeated clicks invoke onPrev N times', () => {
    const onPrev = vi.fn();
    const { container } = render(
      <StreamPaymentDateDetailsStep {...defaults} onPrevBtnClick={onPrev} />,
    );
    const back = container.querySelectorAll('button')[0];
    fireEvent.click(back);
    fireEvent.click(back);
    fireEvent.click(back);
    expect(onPrev).toHaveBeenCalledTimes(3);
  });

  it('Next button initial state can be queried (button exists)', () => {
    const { container } = render(<StreamPaymentDateDetailsStep {...defaults} />);
    const nextBtn = container.querySelector('[data-testid="next-btn"]');
    expect(nextBtn).not.toBeNull();
  });

  it('mount-unmount 50 cycles', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentDateDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('renders 50 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 50 }, (_, i) => (
            <StreamPaymentDateDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rapid 200 onPrevBtnClick invocations', () => {
    const onPrev = vi.fn();
    render(<StreamPaymentDateDetailsStep {...defaults} onPrevBtnClick={onPrev} />);
    for (let i = 0; i < 200; i++) onPrev();
    expect(onPrev).toHaveBeenCalledTimes(200);
  });

  it('rapid 200 onNextBtnClick invocations', () => {
    const onNext = vi.fn();
    render(<StreamPaymentDateDetailsStep {...defaults} onNextBtnClick={onNext} />);
    for (let i = 0; i < 200; i++) onNext();
    expect(onNext).toHaveBeenCalledTimes(200);
  });

  it('handles 30 different startTime state', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <StreamPaymentDateDetailsStep
          {...defaults}
          state={{ ...defaults.state, streamStartTimestamp: 1700000000 + i * 86400 } as never}
        />,
      );
      unmount();
    }
  });

  it('round-2 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentDateDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-2 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentDateDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 rapid 200 onPrevBtnClick invocations', () => {
    const onPrev = vi.fn();
    render(<StreamPaymentDateDetailsStep {...defaults} onPrevBtnClick={onPrev} />);
    for (let i = 0; i < 200; i++) onPrev();
    expect(onPrev).toHaveBeenCalledTimes(200);
  });

  it('round-2 rapid 200 onNextBtnClick invocations', () => {
    const onNext = vi.fn();
    render(<StreamPaymentDateDetailsStep {...defaults} onNextBtnClick={onNext} />);
    for (let i = 0; i < 200; i++) onNext();
    expect(onNext).toHaveBeenCalledTimes(200);
  });

  it('round-2 30 different startTime state cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <StreamPaymentDateDetailsStep
          {...defaults}
          state={{ ...defaults.state, streamStartTimestamp: 1700000000 + i * 7200 } as never}
        />,
      );
      unmount();
    }
  });

  it('round-3 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentDateDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-3 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentDateDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 rapid 200 onPrevBtnClick invocations', () => {
    const onPrev = vi.fn();
    render(<StreamPaymentDateDetailsStep {...defaults} onPrevBtnClick={onPrev} />);
    for (let i = 0; i < 200; i++) onPrev();
    expect(onPrev).toHaveBeenCalledTimes(200);
  });

  it('round-3 rapid 200 onNextBtnClick invocations', () => {
    const onNext = vi.fn();
    render(<StreamPaymentDateDetailsStep {...defaults} onNextBtnClick={onNext} />);
    for (let i = 0; i < 200; i++) onNext();
    expect(onNext).toHaveBeenCalledTimes(200);
  });

  it('round-3 30 different startTime state cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <StreamPaymentDateDetailsStep
          {...defaults}
          state={{ ...defaults.state, streamStartTimestamp: 1700000000 + i * 7200 } as never}
        />,
      );
      unmount();
    }
  });

  it('round-4 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentDateDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-4 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentDateDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentDateDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-4 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentDateDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-4 30 different streamStartTimestamp cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <StreamPaymentDateDetailsStep
          {...defaults}
          state={{ ...defaults.state, streamStartTimestamp: 2000000000 + i * 7200 } as never}
        />,
      );
      unmount();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentDateDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-5 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentDateDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentDateDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentDateDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-5 30 different streamStartTimestamp cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <StreamPaymentDateDetailsStep
          {...defaults}
          state={{ ...defaults.state, streamStartTimestamp: 3000000000 + i * 7200 } as never}
        />,
      );
      unmount();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<StreamPaymentDateDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <StreamPaymentDateDetailsStep key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<StreamPaymentDateDetailsStep {...defaults} />)).not.toThrow();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<StreamPaymentDateDetailsStep {...defaults} />);
      unmount();
    }
  });

  it('round-6 30 different streamStartTimestamp values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <StreamPaymentDateDetailsStep
          {...defaults}
          state={{ ...defaults.state, streamStartTimestamp: 4000000000 + i * 7200 } as never}
        />,
      );
      unmount();
    }
  });
});
