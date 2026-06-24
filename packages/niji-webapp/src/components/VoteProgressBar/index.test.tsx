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

  it('handles 1% (small but non-zero)', () => {
    const { container } = render(<VoteProgressBar variant={VoteCardVariant.FOR} percentage={1} />);
    const inner = container.querySelectorAll('div')[1];
    expect(inner?.getAttribute('style')).toContain('width: 1%');
  });

  it('handles 99% (boundary just below 100)', () => {
    const { container } = render(<VoteProgressBar variant={VoteCardVariant.FOR} percentage={99} />);
    const inner = container.querySelectorAll('div')[1];
    expect(inner?.getAttribute('style')).toContain('width: 99%');
  });

  it('renders exactly 1 outer + 1 inner div', () => {
    const { container } = render(<VoteProgressBar variant={VoteCardVariant.FOR} percentage={50} />);
    expect(container.querySelectorAll('div').length).toBe(2);
  });

  it('handles 50% (midpoint)', () => {
    const { container } = render(
      <VoteProgressBar variant={VoteCardVariant.AGAINST} percentage={50} />,
    );
    const inner = container.querySelectorAll('div')[1];
    expect(inner?.getAttribute('style')).toContain('width: 50%');
    expect(inner?.className).toMatch(/against/i);
  });

  it('handles 25% with ABSTAIN variant', () => {
    const { container } = render(
      <VoteProgressBar variant={VoteCardVariant.ABSTAIN} percentage={25} />,
    );
    const inner = container.querySelectorAll('div')[1];
    expect(inner?.getAttribute('style')).toContain('width: 25%');
    expect(inner?.className).toMatch(/abstain/i);
  });

  it('handles fractional percentage (33.33)', () => {
    const { container } = render(
      <VoteProgressBar variant={VoteCardVariant.FOR} percentage={33.33} />,
    );
    const inner = container.querySelectorAll('div')[1];
    expect(inner?.getAttribute('style')).toContain('width: 33.33%');
  });

  it('outer div renders 1 element regardless of variant', () => {
    const { container } = render(<VoteProgressBar variant={VoteCardVariant.FOR} percentage={50} />);
    expect(container.querySelectorAll('div').length).toBe(2);
  });

  it('FOR + 100% renders full-width "for" bar', () => {
    const { container } = render(
      <VoteProgressBar variant={VoteCardVariant.FOR} percentage={100} />,
    );
    const inner = container.querySelectorAll('div')[1];
    expect(inner?.className).toMatch(/for/i);
    expect(inner?.getAttribute('style')).toContain('width: 100%');
  });

  it('AGAINST + 0% renders empty against bar', () => {
    const { container } = render(
      <VoteProgressBar variant={VoteCardVariant.AGAINST} percentage={0} />,
    );
    const inner = container.querySelectorAll('div')[1];
    expect(inner?.className).toMatch(/against/i);
    expect(inner?.getAttribute('style')).toContain('width: 0%');
  });

  it('ABSTAIN + 75% renders 75 width abstain bar', () => {
    const { container } = render(
      <VoteProgressBar variant={VoteCardVariant.ABSTAIN} percentage={75} />,
    );
    const inner = container.querySelectorAll('div')[1];
    expect(inner?.getAttribute('style')).toContain('width: 75%');
    expect(inner?.className).toMatch(/abstain/i);
  });
});
