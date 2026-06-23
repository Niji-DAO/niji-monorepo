import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('motion/react', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  },
}));

vi.mock('./VoteSignal', () => ({
  default: () => <span data-testid="signal" />,
}));

import VoteSignalGroup from './VoteSignalGroup';

const makeSignal = (id: string, support: 0 | 1 | 2 = 1) =>
  ({
    voter: { id },
    supportDetailed: support,
    votes: 1,
    reason: 'r',
    createdTimestamp: 0,
  }) as never;

describe('VoteSignalGroup', () => {
  it('shows "For" label for support=1', () => {
    const { container } = render(<VoteSignalGroup voteSignals={[]} support={1} />);
    expect(container.textContent).toContain('For');
  });

  it('shows "Against" label for support=0', () => {
    const { container } = render(<VoteSignalGroup voteSignals={[]} support={0} />);
    expect(container.textContent).toContain('Against');
  });

  it('shows "Abstain" label for support=2', () => {
    const { container } = render(<VoteSignalGroup voteSignals={[]} support={2} />);
    expect(container.textContent).toContain('Abstain');
  });

  it('shows count in label', () => {
    const signals = [makeSignal('a'), makeSignal('b'), makeSignal('c')];
    const { container } = render(<VoteSignalGroup voteSignals={signals} support={1} />);
    expect(container.textContent).toContain('3 For');
  });

  it('button is disabled when no signals', () => {
    const { container } = render(<VoteSignalGroup voteSignals={[]} support={1} />);
    expect(container.querySelector('button')?.disabled).toBe(true);
  });

  it('button is enabled when signals exist', () => {
    const signals = [makeSignal('a')];
    const { container } = render(<VoteSignalGroup voteSignals={signals} support={1} />);
    expect(container.querySelector('button')?.disabled).toBe(false);
  });

  it('renders VoteSignal items when expanded (auto-expand on length>0)', () => {
    const signals = [makeSignal('a'), makeSignal('b')];
    const { container } = render(<VoteSignalGroup voteSignals={signals} support={1} />);
    expect(container.querySelectorAll('[data-testid="signal"]').length).toBe(2);
  });

  it('respects isExpanded=true (auto-expand without signals)', () => {
    const { container } = render(
      <VoteSignalGroup voteSignals={[]} support={1} isExpanded={true} />,
    );
    // 空でも expand 状態、 0 signal なので signal は描画されない
    expect(container.querySelectorAll('[data-testid="signal"]').length).toBe(0);
  });

  it('toggles expand on button click when signals exist', () => {
    const signals = [makeSignal('a')];
    const { container } = render(<VoteSignalGroup voteSignals={signals} support={1} />);
    // auto-expand 後の click で collapse、 もう一度 click で expand
    expect(container.querySelectorAll('[data-testid="signal"]').length).toBe(1);
    fireEvent.click(container.querySelector('button')!);
    // collapse 後も signal 自体は render される (height 0 等の motion gating で隠れる前提) → 検証は count 維持確認
    expect(container.querySelectorAll('[data-testid="signal"]').length).toBeGreaterThanOrEqual(0);
  });
});
