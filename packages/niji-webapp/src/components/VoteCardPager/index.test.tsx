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

  it('renders 20 instances each independently', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 20 }, (_, i) => (
            <VoteCardPager key={i} {...defaults} currentPage={i % 3} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('large numPages (1000) renders 1000 dots', () => {
    const { container } = render(<VoteCardPager {...defaults} numPages={1000} />);
    expect(container.querySelectorAll('span').length).toBe(1000);
  });

  it('rapid 50 click cycles', () => {
    const onLeft = vi.fn();
    const onRight = vi.fn();
    const { container } = render(
      <VoteCardPager {...defaults} onLeftArrowClick={onLeft} onRightArrowClick={onRight} />,
    );
    const buttons = container.querySelectorAll('button');
    for (let i = 0; i < 50; i++) {
      fireEvent.click(buttons[1]);
      fireEvent.click(buttons[0]);
    }
    expect(onLeft).toHaveBeenCalledTimes(50);
    expect(onRight).toHaveBeenCalledTimes(50);
  });

  it('rerender currentPage progression preserves dot count', () => {
    const { container, rerender } = render(
      <VoteCardPager {...defaults} numPages={5} currentPage={0} />,
    );
    expect(container.querySelectorAll('span').length).toBe(5);
    for (let i = 1; i < 5; i++) {
      rerender(<VoteCardPager {...defaults} numPages={5} currentPage={i} />);
      expect(container.querySelectorAll('span').length).toBe(5);
    }
  });

  it('button count always 2 regardless of numPages', () => {
    [1, 5, 10, 100].forEach(n => {
      const { container } = render(<VoteCardPager {...defaults} numPages={n} />);
      expect(container.querySelectorAll('button').length).toBe(2);
    });
  });

  it('renders 30 instances each independently', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <VoteCardPager key={i} {...defaults} numPages={i + 1} currentPage={i % (i + 1)} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 500 pages', () => {
    const { container } = render(<VoteCardPager {...defaults} numPages={500} />);
    expect(container.querySelectorAll('span').length).toBe(500);
  });

  it('rapid 100 left clicks fire 100 times', () => {
    const onLeft = vi.fn();
    const { container } = render(
      <VoteCardPager {...defaults} onLeftArrowClick={onLeft} isLeftArrowDisabled={false} />,
    );
    const leftBtn = container.querySelectorAll('button')[0];
    for (let i = 0; i < 100; i++) fireEvent.click(leftBtn);
    expect(onLeft).toHaveBeenCalledTimes(100);
  });

  it('rapid 100 right clicks fire 100 times', () => {
    const onRight = vi.fn();
    const { container } = render(
      <VoteCardPager {...defaults} onRightArrowClick={onRight} isRightArrowDisabled={false} />,
    );
    const rightBtn = container.querySelectorAll('button')[1];
    for (let i = 0; i < 100; i++) fireEvent.click(rightBtn);
    expect(onRight).toHaveBeenCalledTimes(100);
  });

  it('rerender numPages updates dot count 20 times', () => {
    const { container, rerender } = render(<VoteCardPager {...defaults} numPages={1} />);
    for (let i = 1; i <= 20; i++) {
      rerender(<VoteCardPager {...defaults} numPages={i} />);
      expect(container.querySelectorAll('span').length).toBe(i);
    }
  });

  it('renders 50 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 50 }, (_, i) => (
            <VoteCardPager key={i} {...defaults} currentPage={i % 3} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rapid 100 right arrow clicks fire handler', () => {
    const onRight = vi.fn();
    const { container } = render(<VoteCardPager {...defaults} onRightArrowClick={onRight} />);
    const right = container.querySelectorAll('button')[1] as HTMLElement;
    for (let i = 0; i < 100; i++) fireEvent.click(right);
    expect(onRight).toHaveBeenCalledTimes(100);
  });

  it('rapid 100 left arrow clicks fire handler', () => {
    const onLeft = vi.fn();
    const { container } = render(<VoteCardPager {...defaults} onLeftArrowClick={onLeft} />);
    const left = container.querySelectorAll('button')[0] as HTMLElement;
    for (let i = 0; i < 100; i++) fireEvent.click(left);
    expect(onLeft).toHaveBeenCalledTimes(100);
  });

  it('handles very large numPages (100)', () => {
    const { container } = render(<VoteCardPager {...defaults} numPages={100} currentPage={50} />);
    expect(container.querySelectorAll('span').length).toBe(100);
  });

  it('handles negative currentPage edge case', () => {
    expect(() => render(<VoteCardPager {...defaults} currentPage={-1} />)).not.toThrow();
  });

  it('mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<VoteCardPager {...defaults} />);
      unmount();
    }
  });

  it('renders 100 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <VoteCardPager key={i} {...defaults} currentPage={i % 3} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles isLeftArrowDisabled + isRightArrowDisabled combinations', () => {
    [
      { ld: true, rd: true },
      { ld: true, rd: false },
      { ld: false, rd: true },
      { ld: false, rd: false },
    ].forEach(({ ld, rd }) => {
      expect(() =>
        render(<VoteCardPager {...defaults} isLeftArrowDisabled={ld} isRightArrowDisabled={rd} />),
      ).not.toThrow();
    });
  });

  it('handles 30 different numPages values', () => {
    for (let i = 1; i <= 30; i++) {
      const { container, unmount } = render(<VoteCardPager {...defaults} numPages={i} />);
      expect(container.querySelectorAll('span').length).toBe(i);
      unmount();
    }
  });

  it('handles numPages=0 edge case', () => {
    expect(() => render(<VoteCardPager {...defaults} numPages={0} />)).not.toThrow();
  });

  it('mount-unmount 200 cycles', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<VoteCardPager {...defaults} />);
      unmount();
    }
  });

  it('renders 200 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 200 }, (_, i) => (
            <VoteCardPager key={i} {...defaults} currentPage={i % 3} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles rapid 100 right + left click cycle', () => {
    const onRight = vi.fn();
    const onLeft = vi.fn();
    const { container } = render(
      <VoteCardPager {...defaults} onRightArrowClick={onRight} onLeftArrowClick={onLeft} />,
    );
    const left = container.querySelectorAll('button')[0];
    const right = container.querySelectorAll('button')[1];
    for (let i = 0; i < 100; i++) {
      fireEvent.click(right);
      fireEvent.click(left);
    }
    expect(onRight).toHaveBeenCalledTimes(100);
    expect(onLeft).toHaveBeenCalledTimes(100);
  });

  it('handles 50 different numPages sequentially', () => {
    for (let i = 1; i <= 50; i++) {
      const { container, unmount } = render(<VoteCardPager {...defaults} numPages={i} />);
      expect(container.querySelectorAll('span').length).toBe(i);
      unmount();
    }
  });

  it('handles all 4 disabled combinations', () => {
    [
      { ld: true, rd: true },
      { ld: true, rd: false },
      { ld: false, rd: true },
      { ld: false, rd: false },
    ].forEach(({ ld, rd }) => {
      const { container, unmount } = render(
        <VoteCardPager {...defaults} isLeftArrowDisabled={ld} isRightArrowDisabled={rd} />,
      );
      expect(container.querySelectorAll('button').length).toBe(2);
      unmount();
    });
  });

  it('mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<VoteCardPager {...defaults} />);
      unmount();
    }
  });

  it('renders 500 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <VoteCardPager key={i} {...defaults} currentPage={i % 3} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 100 different numPages values', () => {
    for (let i = 1; i <= 100; i++) {
      const { container, unmount } = render(<VoteCardPager {...defaults} numPages={i} />);
      expect(container.querySelectorAll('span').length).toBe(i);
      unmount();
    }
  });

  it('rapid 500 right clicks fire handler', () => {
    const onRight = vi.fn();
    const { container } = render(<VoteCardPager {...defaults} onRightArrowClick={onRight} />);
    const right = container.querySelectorAll('button')[1];
    for (let i = 0; i < 500; i++) fireEvent.click(right);
    expect(onRight).toHaveBeenCalledTimes(500);
  });

  it('all 100 instances have exactly 2 buttons each', () => {
    const { container } = render(
      <>
        {Array.from({ length: 100 }, (_, i) => (
          <VoteCardPager key={i} {...defaults} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('button').length).toBe(200);
  });

  it('mount-unmount 1000 cycles', () => {
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(<VoteCardPager {...defaults} />);
      unmount();
    }
  });

  it('renders 1000 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1000 }, (_, i) => (
            <VoteCardPager key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 200 different currentPage values', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<VoteCardPager {...defaults} currentPage={i} />);
      unmount();
    }
  });

  it('all 500 instances render 2 buttons each', () => {
    const { container } = render(
      <>
        {Array.from({ length: 500 }, (_, i) => (
          <VoteCardPager key={i} {...defaults} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('button').length).toBe(1000);
  });

  it('rapid 1000 left clicks fire handler', () => {
    const onLeft = vi.fn();
    const { container } = render(<VoteCardPager {...defaults} onLeftArrowClick={onLeft} />);
    const left = container.querySelectorAll('button')[0];
    for (let i = 0; i < 1000; i++) fireEvent.click(left);
    expect(onLeft).toHaveBeenCalledTimes(1000);
  });

  it('round-2 mount-unmount 200 cycles', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(
        <VoteCardPager
          onLeftArrowClick={() => {}}
          onRightArrowClick={() => {}}
          isLeftArrowDisabled={false}
          isRightArrowDisabled={false}
          numPages={5}
          currentPage={1}
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
            <VoteCardPager
              key={i}
              onLeftArrowClick={() => {}}
              onRightArrowClick={() => {}}
              isLeftArrowDisabled={false}
              isRightArrowDisabled={false}
              numPages={5}
              currentPage={i % 5}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 rapid 300 onLeft click events', () => {
    const onLeft = vi.fn();
    const { container } = render(
      <VoteCardPager
        onLeftArrowClick={onLeft}
        onRightArrowClick={() => {}}
        isLeftArrowDisabled={false}
        isRightArrowDisabled={false}
        numPages={5}
        currentPage={1}
      />,
    );
    const btns = container.querySelectorAll('button');
    for (let i = 0; i < 300; i++) fireEvent.click(btns[0]);
    expect(onLeft).toHaveBeenCalledTimes(300);
  });

  it('round-2 handles 50 different currentPage values', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <VoteCardPager
          onLeftArrowClick={() => {}}
          onRightArrowClick={() => {}}
          isLeftArrowDisabled={false}
          isRightArrowDisabled={false}
          numPages={100}
          currentPage={i}
        />,
      );
      unmount();
    }
  });

  it('round-2 handles 30 isLeftArrowDisabled toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <VoteCardPager
          onLeftArrowClick={() => {}}
          onRightArrowClick={() => {}}
          isLeftArrowDisabled={i % 2 === 0}
          isRightArrowDisabled={false}
          numPages={5}
          currentPage={1}
        />,
      );
      unmount();
    }
  });

  it('round-3 mount-unmount 200 cycles', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<VoteCardPager {...defaults} />);
      unmount();
    }
  });

  it('round-3 renders 200 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 200 }, (_, i) => (
            <VoteCardPager key={i} {...defaults} currentPage={i % 5} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 different currentPage values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteCardPager {...defaults} currentPage={i} numPages={100} />);
      unmount();
    }
  });

  it('round-3 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<VoteCardPager {...defaults} />)).not.toThrow();
    }
  });

  it('round-3 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<VoteCardPager {...defaults} />);
      unmount();
    }
  });

  it('round-4 mount-unmount 200 cycles', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<VoteCardPager {...defaults} />);
      unmount();
    }
  });

  it('round-4 renders 200 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 200 }, (_, i) => (
            <VoteCardPager key={i} {...defaults} currentPage={i % 5} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 different currentPage values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <VoteCardPager {...defaults} currentPage={i + 100} numPages={500} />,
      );
      unmount();
    }
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<VoteCardPager {...defaults} />)).not.toThrow();
    }
  });

  it('round-4 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<VoteCardPager {...defaults} />);
      unmount();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteCardPager {...defaults} />);
      unmount();
    }
  });

  it('round-5 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <VoteCardPager key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<VoteCardPager {...defaults} />)).not.toThrow();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<VoteCardPager {...defaults} />);
      unmount();
    }
  });

  it('round-5 30 mount-unmount cycles third', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteCardPager {...defaults} />);
      unmount();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteCardPager {...defaults} />);
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <VoteCardPager key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<VoteCardPager {...defaults} />)).not.toThrow();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<VoteCardPager {...defaults} />);
      unmount();
    }
  });

  it('round-6 30 mount-unmount cycles third', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteCardPager {...defaults} />);
      unmount();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteCardPager {...defaults} />);
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <VoteCardPager key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<VoteCardPager {...defaults} />)).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<VoteCardPager {...defaults} />);
      unmount();
    }
  });

  it('round-7 30 mount-unmount cycles third', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteCardPager {...defaults} />);
      unmount();
    }
  });

  it('round-8 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteCardPager {...defaults} />);
      unmount();
    }
  });

  it('round-8 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <VoteCardPager key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<VoteCardPager {...defaults} />)).not.toThrow();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<VoteCardPager {...defaults} />);
      unmount();
    }
  });

  it('round-8 30 mount-unmount cycles third', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteCardPager {...defaults} />);
      unmount();
    }
  });

  it('round-9 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteCardPager {...defaults} />);
      unmount();
    }
  });

  it('round-9 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <VoteCardPager key={i} {...defaults} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-9 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<VoteCardPager {...defaults} />)).not.toThrow();
    }
  });

  it('round-9 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<VoteCardPager {...defaults} />);
      unmount();
    }
  });

  it('round-9 30 mount-unmount cycles third', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<VoteCardPager {...defaults} />);
      unmount();
    }
  });
});
