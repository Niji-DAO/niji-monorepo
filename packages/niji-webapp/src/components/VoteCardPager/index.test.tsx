import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import VoteCardPager from './index';

const defaults = {
  onRightArrowClick: () => {},
  onLeftArrowClick: () => {},
  isRightArrowDisabled: false,
  isLeftArrowDisabled: false,
  numPages: 3,
  currentPage: 0,
};

describe('VoteCardPager', () => {
  it('renders numPages dots', () => {
    const { container } = render(<VoteCardPager {...defaults} numPages={5} currentPage={0} />);
    const spans = container.querySelectorAll('span');
    expect(spans.length).toBe(5);
  });

  it('renders left + right arrow buttons', () => {
    const { container } = render(<VoteCardPager {...defaults} />);
    expect(container.querySelectorAll('button').length).toBe(2);
  });

  it('disables both arrows when numPages=1 (isOnePage)', () => {
    const { container } = render(<VoteCardPager {...defaults} numPages={1} />);
    const buttons = container.querySelectorAll('button');
    expect(buttons[0]?.disabled).toBe(true);
    expect(buttons[1]?.disabled).toBe(true);
  });

  it('disables left arrow when isLeftArrowDisabled=true', () => {
    const { container } = render(<VoteCardPager {...defaults} isLeftArrowDisabled />);
    expect(container.querySelectorAll('button')[0]?.disabled).toBe(true);
  });

  it('disables right arrow when isRightArrowDisabled=true', () => {
    const { container } = render(<VoteCardPager {...defaults} isRightArrowDisabled />);
    expect(container.querySelectorAll('button')[1]?.disabled).toBe(true);
  });

  it('fires onLeftArrowClick on left button click', () => {
    const onLeft = vi.fn();
    const { container } = render(<VoteCardPager {...defaults} onLeftArrowClick={onLeft} />);
    fireEvent.click(container.querySelectorAll('button')[0]);
    expect(onLeft).toHaveBeenCalledTimes(1);
  });

  it('fires onRightArrowClick on right button click', () => {
    const onRight = vi.fn();
    const { container } = render(<VoteCardPager {...defaults} onRightArrowClick={onRight} />);
    fireEvent.click(container.querySelectorAll('button')[1]);
    expect(onRight).toHaveBeenCalledTimes(1);
  });

  it('highlights current page dot (no disabledPageDot class)', () => {
    const { container } = render(<VoteCardPager {...defaults} currentPage={1} numPages={3} />);
    const spans = container.querySelectorAll('span');
    expect(spans[0]?.className).toMatch(/disabledPageDot/);
    expect(spans[1]?.className).toBe('');
    expect(spans[2]?.className).toMatch(/disabledPageDot/);
  });
});
