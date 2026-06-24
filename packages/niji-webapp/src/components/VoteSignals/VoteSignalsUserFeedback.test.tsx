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
});
