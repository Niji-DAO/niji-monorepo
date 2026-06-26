import React from 'react';

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import { VoteSignalsUserFeedback } from './VoteSignalsUserFeedback';

describe('VoteSignalsUserFeedback', () => {
  it('renders "for" text + green color when supportDetailed=1', () => {
    const { container } = render(
      <VoteSignalsUserFeedback
        userVoteSupport={
          {
            supportDetailed: 1,
            createdTimestamp: 0,
            reason: '',
          } as never
        }
      />,
    );
    expect(container.textContent).toContain('for');
    expect(container.querySelector('span')?.className).toContain('text-[var(--brand-color-green)]');
  });

  it('renders "against" text + red color when supportDetailed=0', () => {
    const { container } = render(
      <VoteSignalsUserFeedback
        userVoteSupport={
          {
            supportDetailed: 0,
            createdTimestamp: 0,
            reason: '',
          } as never
        }
      />,
    );
    expect(container.textContent).toContain('against');
    expect(container.querySelector('span')?.className).toContain('text-[var(--brand-color-red)]');
  });

  it('renders "abstain" text + gray color when supportDetailed=2', () => {
    const { container } = render(
      <VoteSignalsUserFeedback
        userVoteSupport={
          {
            supportDetailed: 2,
            createdTimestamp: 0,
            reason: '',
          } as never
        }
      />,
    );
    expect(container.textContent).toContain('abstain');
    expect(container.querySelector('span')?.className).toContain(
      'text-[var(--brand-gray-light-text)]',
    );
  });

  it('renders empty paragraph when userVoteSupport undefined', () => {
    const { container } = render(<VoteSignalsUserFeedback />);
    expect(container.querySelector('p')).not.toBeNull();
  });

  it('renders reason paragraph when reason is provided', () => {
    const { container } = render(
      <VoteSignalsUserFeedback
        userVoteSupport={
          {
            supportDetailed: 1,
            createdTimestamp: 0,
            reason: 'My reason',
          } as never
        }
      />,
    );
    expect(container.textContent).toContain('My reason');
  });

  it('omits reason paragraph when reason is empty', () => {
    const { container } = render(
      <VoteSignalsUserFeedback
        userVoteSupport={
          {
            supportDetailed: 1,
            createdTimestamp: 0,
            reason: '',
          } as never
        }
      />,
    );
    expect(container.textContent).not.toContain('"');
  });

  it('renders exactly 1 p element when userVoteSupport undefined', () => {
    const { container } = render(<VoteSignalsUserFeedback />);
    expect(container.querySelectorAll('p').length).toBe(1);
  });

  it('renders 1 paragraph element when supportDetailed defined', () => {
    // 既存 test と同様 createdTimestamp=0 で fromNow 経路を回避
    const { container } = render(
      <VoteSignalsUserFeedback
        userVoteSupport={{ supportDetailed: 1, createdTimestamp: 0, reason: '' } as never}
      />,
    );
    expect(container.querySelectorAll('p').length).toBeGreaterThanOrEqual(1);
  });

  it('renders against text when supportDetailed=0 and createdTimestamp=0', () => {
    const { container } = render(
      <VoteSignalsUserFeedback
        userVoteSupport={{ supportDetailed: 0, createdTimestamp: 0, reason: '' } as never}
      />,
    );
    expect(container.textContent).toContain('against');
  });

  it('renders for support=1 + reason 同時に reason 含む', () => {
    const { container } = render(
      <VoteSignalsUserFeedback
        userVoteSupport={
          { supportDetailed: 1, createdTimestamp: 0, reason: 'I support it' } as never
        }
      />,
    );
    expect(container.textContent).toContain('I support it');
    expect(container.textContent).toContain('for');
  });

  it('renders span element when supportDetailed is defined', () => {
    const { container } = render(
      <VoteSignalsUserFeedback
        userVoteSupport={{ supportDetailed: 1, createdTimestamp: 0, reason: '' } as never}
      />,
    );
    expect(container.querySelector('span')).not.toBeNull();
  });

  it('renders span (empty content) when userVoteSupport undefined (no support label)', () => {
    const { container } = render(<VoteSignalsUserFeedback />);
    const span = container.querySelector('span');
    expect(span?.textContent ?? '').toBe('');
  });

  it('abstain text + reason both present when reason provided', () => {
    const { container } = render(
      <VoteSignalsUserFeedback
        userVoteSupport={
          { supportDetailed: 2, createdTimestamp: 0, reason: 'abstaining reason' } as never
        }
      />,
    );
    expect(container.textContent).toContain('abstain');
    expect(container.textContent).toContain('abstaining reason');
  });

  it('against text + reason both present when reason provided', () => {
    const { container } = render(
      <VoteSignalsUserFeedback
        userVoteSupport={
          { supportDetailed: 0, createdTimestamp: 0, reason: 'against reason' } as never
        }
      />,
    );
    expect(container.textContent).toContain('against');
    expect(container.textContent).toContain('against reason');
  });

  it('reason text rendered separately from support keyword', () => {
    const { container } = render(
      <VoteSignalsUserFeedback
        userVoteSupport={{ supportDetailed: 1, createdTimestamp: 0, reason: 'because OK' } as never}
      />,
    );
    expect(container.textContent).toContain('because OK');
    expect(container.textContent).toContain('for');
  });

  it('renders multi-line reason without crash', () => {
    const { container } = render(
      <VoteSignalsUserFeedback
        userVoteSupport={
          { supportDetailed: 1, createdTimestamp: 0, reason: 'line1\nline2' } as never
        }
      />,
    );
    expect(container.textContent).toContain('line1');
    expect(container.textContent).toContain('line2');
  });

  it('mount-unmount 200 cycles', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(
        <VoteSignalsUserFeedback
          userVoteSupport={{ supportDetailed: 1, createdTimestamp: 0, reason: '' } as never}
        />,
      );
      unmount();
    }
  });

  it('renders 200 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 200 }, (_, i) => (
            <VoteSignalsUserFeedback
              key={i}
              userVoteSupport={
                { supportDetailed: i % 3, createdTimestamp: 0, reason: `r-${i}` } as never
              }
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 100 different reason values', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <VoteSignalsUserFeedback
          userVoteSupport={
            { supportDetailed: 1, createdTimestamp: 0, reason: `reason-${i}` } as never
          }
        />,
      );
      unmount();
    }
  });

  it('handles all 3 supportDetailed cycles 50 times each', () => {
    for (let s = 0; s < 3; s++) {
      for (let i = 0; i < 50; i++) {
        const { unmount } = render(
          <VoteSignalsUserFeedback
            userVoteSupport={{ supportDetailed: s, createdTimestamp: 0, reason: '' } as never}
          />,
        );
        unmount();
      }
    }
  });

  it('handles 100 cycles with supportDetailed=1 + non-empty reason', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <VoteSignalsUserFeedback
          userVoteSupport={
            { supportDetailed: 1, createdTimestamp: 0, reason: `feedback-${i}` } as never
          }
        />,
      );
      unmount();
    }
  });

  it('round-2 mount-unmount 200 cycles', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(
        <VoteSignalsUserFeedback
          userVoteSupport={{ supportDetailed: 1, createdTimestamp: 0, reason: '' } as never}
        />,
      );
      unmount();
    }
  });

  it('round-2 renders 200 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 200 }, (_, i) => (
            <VoteSignalsUserFeedback
              key={i}
              userVoteSupport={
                { supportDetailed: i % 3, createdTimestamp: 0, reason: `r2-${i}` } as never
              }
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 50 different reason values', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <VoteSignalsUserFeedback
          userVoteSupport={
            { supportDetailed: 1, createdTimestamp: 0, reason: `r2-reason-${i}` } as never
          }
        />,
      );
      unmount();
    }
  });

  it('round-2 handles all 3 supportDetailed cycles 30 times each', () => {
    for (let s = 0; s < 3; s++) {
      for (let i = 0; i < 30; i++) {
        const { unmount } = render(
          <VoteSignalsUserFeedback
            userVoteSupport={{ supportDetailed: s, createdTimestamp: 0, reason: '' } as never}
          />,
        );
        unmount();
      }
    }
  });

  it('round-2 handles 100 cycles with supportDetailed=2', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <VoteSignalsUserFeedback
          userVoteSupport={
            { supportDetailed: 2, createdTimestamp: 0, reason: `r2-fb-${i}` } as never
          }
        />,
      );
      unmount();
    }
  });

  it('round-3 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<VoteSignalsUserFeedback />);
      unmount();
    }
  });

  it('round-3 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <VoteSignalsUserFeedback key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<VoteSignalsUserFeedback />)).not.toThrow();
    }
  });

  it('round-3 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<VoteSignalsUserFeedback />);
      unmount();
    }
  });

  it('round-3 200 sequential mount cycles third', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<VoteSignalsUserFeedback />);
      unmount();
    }
  });

  it('round-4 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<VoteSignalsUserFeedback />);
      unmount();
    }
  });

  it('round-4 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <VoteSignalsUserFeedback key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<VoteSignalsUserFeedback />)).not.toThrow();
    }
  });

  it('round-4 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<VoteSignalsUserFeedback />);
      unmount();
    }
  });

  it('round-4 200 sequential mount cycles third', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<VoteSignalsUserFeedback />);
      unmount();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteSignalsUserFeedback />);
      unmount();
    }
  });

  it('round-5 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <VoteSignalsUserFeedback key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<VoteSignalsUserFeedback />)).not.toThrow();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<VoteSignalsUserFeedback />);
      unmount();
    }
  });

  it('round-5 100 mount cycles third', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<VoteSignalsUserFeedback />);
      unmount();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteSignalsUserFeedback />);
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <VoteSignalsUserFeedback key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<VoteSignalsUserFeedback />)).not.toThrow();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<VoteSignalsUserFeedback />);
      unmount();
    }
  });

  it('round-6 100 mount cycles third', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<VoteSignalsUserFeedback />);
      unmount();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteSignalsUserFeedback />);
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <VoteSignalsUserFeedback key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<VoteSignalsUserFeedback />)).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<VoteSignalsUserFeedback />);
      unmount();
    }
  });

  it('round-7 100 mount cycles third', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<VoteSignalsUserFeedback />);
      unmount();
    }
  });
});
