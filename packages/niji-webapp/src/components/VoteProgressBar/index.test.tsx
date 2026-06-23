import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { VoteCardVariant } from '@/components/VoteCard';

import VoteProgressBar from './index';

describe('VoteProgressBar', () => {
  it('renders FOR variant with forProgressBar class', () => {
    const { container } = render(<VoteProgressBar variant={VoteCardVariant.FOR} percentage={50} />);
    const inner = container.querySelectorAll('div')[1];
    expect(inner?.className).toMatch(/for/i);
  });

  it('renders AGAINST variant with againstProgressBar class', () => {
    const { container } = render(
      <VoteProgressBar variant={VoteCardVariant.AGAINST} percentage={30} />,
    );
    const inner = container.querySelectorAll('div')[1];
    expect(inner?.className).toMatch(/against/i);
  });

  it('renders ABSTAIN (default) variant with abstainProgressBar class', () => {
    const { container } = render(
      <VoteProgressBar variant={VoteCardVariant.ABSTAIN} percentage={20} />,
    );
    const inner = container.querySelectorAll('div')[1];
    expect(inner?.className).toMatch(/abstain/i);
  });

  it('sets width style from percentage', () => {
    const { container } = render(<VoteProgressBar variant={VoteCardVariant.FOR} percentage={75} />);
    const inner = container.querySelectorAll('div')[1];
    expect(inner?.getAttribute('style')).toContain('width: 75%');
  });

  it('handles 0%', () => {
    const { container } = render(<VoteProgressBar variant={VoteCardVariant.FOR} percentage={0} />);
    const inner = container.querySelectorAll('div')[1];
    expect(inner?.getAttribute('style')).toContain('width: 0%');
  });

  it('handles 100%', () => {
    const { container } = render(
      <VoteProgressBar variant={VoteCardVariant.FOR} percentage={100} />,
    );
    const inner = container.querySelectorAll('div')[1];
    expect(inner?.getAttribute('style')).toContain('width: 100%');
  });
});
