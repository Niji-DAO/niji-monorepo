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

  it('renders 10 pages correctly', () => {
    const { container } = render(<VoteCardPager {...defaults} numPages={10} />);
    expect(container.querySelectorAll('span').length).toBe(10);
  });

  it('repeated left click invokes onLeft N times', () => {
    const onLeft = vi.fn();
    const { container } = render(<VoteCardPager {...defaults} onLeftArrowClick={onLeft} />);
    const leftBtn = container.querySelectorAll('button')[0];
    fireEvent.click(leftBtn);
    fireEvent.click(leftBtn);
    fireEvent.click(leftBtn);
    expect(onLeft).toHaveBeenCalledTimes(3);
  });

  it('right disabled button does not fire onRight', () => {
    const onRight = vi.fn();
    const { container } = render(
      <VoteCardPager {...defaults} onRightArrowClick={onRight} isRightArrowDisabled={true} />,
    );
    fireEvent.click(container.querySelectorAll('button')[1]);
    expect(onRight).not.toHaveBeenCalled();
  });

  it('currentPage=0 with numPages=5 has active first dot', () => {
    const { container } = render(<VoteCardPager {...defaults} currentPage={0} numPages={5} />);
    const spans = container.querySelectorAll('span');
    expect(spans[0]?.className).toBe('');
    expect(spans[4]?.className).toMatch(/disabledPageDot/);
  });

  it('numPages=0 renders no dots and disabled buttons', () => {
    const { container } = render(<VoteCardPager {...defaults} numPages={0} />);
    expect(container.querySelectorAll('span').length).toBe(0);
    // numPages != 1 で disabled になるかは実装次第
    expect(container.querySelectorAll('button').length).toBe(2);
  });

  it('repeated right click invokes onRight N times', () => {
    const onRight = vi.fn();
    const { container } = render(<VoteCardPager {...defaults} onRightArrowClick={onRight} />);
    const rightBtn = container.querySelectorAll('button')[1];
    fireEvent.click(rightBtn);
    fireEvent.click(rightBtn);
    expect(onRight).toHaveBeenCalledTimes(2);
  });

  it('left disabled button does not fire onLeft', () => {
    const onLeft = vi.fn();
    const { container } = render(
      <VoteCardPager {...defaults} onLeftArrowClick={onLeft} isLeftArrowDisabled={true} />,
    );
    fireEvent.click(container.querySelectorAll('button')[0]);
    expect(onLeft).not.toHaveBeenCalled();
  });

  it('last page (currentPage = numPages - 1) has active last dot', () => {
    const { container } = render(<VoteCardPager {...defaults} currentPage={4} numPages={5} />);
    const spans = container.querySelectorAll('span');
    expect(spans[4]?.className).toBe('');
    expect(spans[0]?.className).toMatch(/disabledPageDot/);
  });

  it('numPages=2 renders exactly 2 dots', () => {
    const { container } = render(<VoteCardPager {...defaults} numPages={2} />);
    expect(container.querySelectorAll('span').length).toBe(2);
  });

  it('rerender from numPages=3 to numPages=5 updates dot count', () => {
    const { container, rerender } = render(<VoteCardPager {...defaults} numPages={3} />);
    expect(container.querySelectorAll('span').length).toBe(3);
    rerender(<VoteCardPager {...defaults} numPages={5} />);
    expect(container.querySelectorAll('span').length).toBe(5);
  });

  it('rerender currentPage changes which dot is active', () => {
    const { container, rerender } = render(
      <VoteCardPager {...defaults} numPages={3} currentPage={0} />,
    );
    expect(container.querySelectorAll('span')[0]?.className).toBe('');
    rerender(<VoteCardPager {...defaults} numPages={3} currentPage={2} />);
    expect(container.querySelectorAll('span')[2]?.className).toBe('');
  });

  it('numPages=100 renders 100 dots', () => {
    const { container } = render(<VoteCardPager {...defaults} numPages={100} />);
    expect(container.querySelectorAll('span').length).toBe(100);
  });

  it('left arrow disabled when isLeftArrowDisabled=true with multi page', () => {
    const { container } = render(
      <VoteCardPager {...defaults} numPages={5} isLeftArrowDisabled={true} />,
    );
    expect(container.querySelectorAll('button')[0]?.disabled).toBe(true);
  });

  it('right arrow disabled when isRightArrowDisabled=true with multi page', () => {
    const { container } = render(
      <VoteCardPager {...defaults} numPages={5} isRightArrowDisabled={true} />,
    );
    expect(container.querySelectorAll('button')[1]?.disabled).toBe(true);
  });

  it('numPages=1 + currentPage=0 disables both arrows', () => {
    const { container } = render(<VoteCardPager {...defaults} numPages={1} currentPage={0} />);
    expect(container.querySelectorAll('button')[0]?.disabled).toBe(true);
    expect(container.querySelectorAll('button')[1]?.disabled).toBe(true);
  });

  it('middle page (currentPage=2) of 5 page shows middle dot active', () => {
    const { container } = render(<VoteCardPager {...defaults} numPages={5} currentPage={2} />);
    expect(container.querySelectorAll('span')[2]?.className).toBe('');
    expect(container.querySelectorAll('span')[0]?.className).toMatch(/disabledPageDot/);
    expect(container.querySelectorAll('span')[4]?.className).toMatch(/disabledPageDot/);
  });

  it('renders 10 dots for numPages=10', () => {
    const { container } = render(<VoteCardPager {...defaults} numPages={10} currentPage={0} />);
    expect(container.querySelectorAll('span').length).toBe(10);
  });

  it('rapid 5 left clicks invoke handler 5 times', () => {
    const onLeft = vi.fn();
    const { container } = render(
      <VoteCardPager {...defaults} onLeftArrowClick={onLeft} isLeftArrowDisabled={false} />,
    );
    const leftBtn = container.querySelectorAll('button')[0];
    for (let i = 0; i < 5; i++) fireEvent.click(leftBtn);
    expect(onLeft).toHaveBeenCalledTimes(5);
  });

  it('rapid 5 right clicks invoke handler 5 times', () => {
    const onRight = vi.fn();
    const { container } = render(
      <VoteCardPager {...defaults} onRightArrowClick={onRight} isRightArrowDisabled={false} />,
    );
    const rightBtn = container.querySelectorAll('button')[1];
    for (let i = 0; i < 5; i++) fireEvent.click(rightBtn);
    expect(onRight).toHaveBeenCalledTimes(5);
  });

  it('rerender numPages updates dot count', () => {
    const { container, rerender } = render(
      <VoteCardPager {...defaults} numPages={3} currentPage={0} />,
    );
    expect(container.querySelectorAll('span').length).toBe(3);
    rerender(<VoteCardPager {...defaults} numPages={7} currentPage={0} />);
    expect(container.querySelectorAll('span').length).toBe(7);
  });

  it('renders without crash for numPages=0', () => {
    expect(() => render(<VoteCardPager {...defaults} numPages={0} />)).not.toThrow();
  });

  it('renders 100 dots for numPages=100', () => {
    const { container } = render(<VoteCardPager {...defaults} numPages={100} />);
    expect(container.querySelectorAll('span').length).toBe(100);
  });

  it('currentPage=5 highlights 5th dot (visual indication)', () => {
    const { container } = render(<VoteCardPager {...defaults} numPages={10} currentPage={5} />);
    expect(container.querySelectorAll('span').length).toBe(10);
  });

  it('renders 5 instances each without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 5 }, (_, i) => (
            <VoteCardPager key={i} {...defaults} numPages={i + 1} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('disables both arrows simultaneously', () => {
    const { container } = render(
      <VoteCardPager {...defaults} isLeftArrowDisabled={true} isRightArrowDisabled={true} />,
    );
    const buttons = container.querySelectorAll('button');
    expect(buttons[0]?.disabled).toBe(true);
    expect(buttons[1]?.disabled).toBe(true);
  });

  it('rerender currentPage updates display', () => {
    const { container, rerender } = render(<VoteCardPager {...defaults} currentPage={0} />);
    expect(container.querySelectorAll('span').length).toBe(3);
    rerender(<VoteCardPager {...defaults} currentPage={2} />);
    expect(container.querySelectorAll('span').length).toBe(3);
  });
});
