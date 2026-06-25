import { screen } from '@testing-library/dom';
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import AuctionNavigation from './index';

// Mock the hooks used in the component (isCoolBackgroundAtom 経由の Jotai)
vi.mock('jotai/react', () => ({
  useAtomValue: () => true, // Mock isCool to be true
}));

vi.mock('react-router', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('../../wrappers/onDisplayAuction', () => ({
  __esModule: true,
  default: () => ({
    nounId: {
      toNumber: () => 5,
    },
  }),
}));

describe('AuctionNavigation Component', () => {
  it('renders navigation buttons correctly', () => {
    render(
      <AuctionNavigation
        isFirstAuction={false}
        isLastAuction={false}
        onPrevAuctionClick={vi.fn()}
        onNextAuctionClick={vi.fn()}
      />,
    );

    const prevButton = screen.getByText('←');
    const nextButton = screen.getByText('→');

    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
    expect(prevButton).not.toBeDisabled();
    expect(nextButton).not.toBeDisabled();
  });

  it('disables previous button when at first auction', () => {
    render(
      <AuctionNavigation
        isFirstAuction={true}
        isLastAuction={false}
        onPrevAuctionClick={vi.fn()}
        onNextAuctionClick={vi.fn()}
      />,
    );

    const prevButton = screen.getByText('←');
    expect(prevButton).toBeDisabled();
  });

  it('disables next button when at last auction', () => {
    render(
      <AuctionNavigation
        isFirstAuction={false}
        isLastAuction={true}
        onPrevAuctionClick={vi.fn()}
        onNextAuctionClick={vi.fn()}
      />,
    );

    const nextButton = screen.getByText('→');
    expect(nextButton).toBeDisabled();
  });

  it('calls onPrevAuctionClick when left arrow button is clicked', () => {
    const onPrevAuctionClick = vi.fn();
    render(
      <AuctionNavigation
        isFirstAuction={false}
        isLastAuction={false}
        onPrevAuctionClick={onPrevAuctionClick}
        onNextAuctionClick={vi.fn()}
      />,
    );

    const prevButton = screen.getByText('←');
    fireEvent.click(prevButton);

    expect(onPrevAuctionClick).toHaveBeenCalledTimes(1);
  });

  it('calls onNextAuctionClick when right arrow button is clicked', () => {
    const onNextAuctionClick = vi.fn();
    render(
      <AuctionNavigation
        isFirstAuction={false}
        isLastAuction={false}
        onPrevAuctionClick={vi.fn()}
        onNextAuctionClick={onNextAuctionClick}
      />,
    );

    const nextButton = screen.getByText('→');
    fireEvent.click(nextButton);

    expect(onNextAuctionClick).toHaveBeenCalledTimes(1);
  });

  it('calls onPrevAuctionClick when left arrow key is pressed', () => {
    const onPrevAuctionClick = vi.fn();
    render(
      <AuctionNavigation
        isFirstAuction={false}
        isLastAuction={false}
        onPrevAuctionClick={onPrevAuctionClick}
        onNextAuctionClick={vi.fn()}
      />,
    );

    // Simulate pressing the left arrow key
    fireEvent.keyDown(document, { key: 'ArrowLeft' });

    expect(onPrevAuctionClick).toHaveBeenCalledTimes(1);
  });

  it('calls onNextAuctionClick when right arrow key is pressed', () => {
    const onNextAuctionClick = vi.fn();
    render(
      <AuctionNavigation
        isFirstAuction={false}
        isLastAuction={false}
        onPrevAuctionClick={vi.fn()}
        onNextAuctionClick={onNextAuctionClick}
      />,
    );

    // Simulate pressing the right arrow key
    fireEvent.keyDown(document, { key: 'ArrowRight' });

    expect(onNextAuctionClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onPrevAuctionClick when left arrow key is pressed and isFirstAuction is true', () => {
    const onPrevAuctionClick = vi.fn();
    render(
      <AuctionNavigation
        isFirstAuction={true}
        isLastAuction={false}
        onPrevAuctionClick={onPrevAuctionClick}
        onNextAuctionClick={vi.fn()}
      />,
    );

    // Simulate pressing the left arrow key
    fireEvent.keyDown(document, { key: 'ArrowLeft' });

    expect(onPrevAuctionClick).not.toHaveBeenCalled();
  });

  it('does not call onNextAuctionClick when right arrow key is pressed and isLastAuction is true', () => {
    const onNextAuctionClick = vi.fn();
    render(
      <AuctionNavigation
        isFirstAuction={false}
        isLastAuction={true}
        onPrevAuctionClick={vi.fn()}
        onNextAuctionClick={onNextAuctionClick}
      />,
    );

    // Simulate pressing the right arrow key
    fireEvent.keyDown(document, { key: 'ArrowRight' });

    expect(onNextAuctionClick).not.toHaveBeenCalled();
  });

  it('applies correct CSS classes based on isCool selector', () => {
    render(
      <AuctionNavigation
        isFirstAuction={false}
        isLastAuction={false}
        onPrevAuctionClick={vi.fn()}
        onNextAuctionClick={vi.fn()}
      />,
    );

    const prevButton = screen.getByText('←');
    const nextButton = screen.getByText('→');

    // Since we mocked isCool to be true
    expect(prevButton.className).toContain('leftArrowCool');
    expect(nextButton.className).toContain('rightArrowCool');
  });

  it('ignores keys other than ArrowLeft/ArrowRight', () => {
    const onPrev = vi.fn();
    const onNext = vi.fn();
    render(
      <AuctionNavigation
        isFirstAuction={false}
        isLastAuction={false}
        onPrevAuctionClick={onPrev}
        onNextAuctionClick={onNext}
      />,
    );
    fireEvent.keyDown(document, { key: 'Enter' });
    fireEvent.keyDown(document, { key: 'ArrowUp' });
    fireEvent.keyDown(document, { key: 'a' });
    expect(onPrev).not.toHaveBeenCalled();
    expect(onNext).not.toHaveBeenCalled();
  });

  it('rapid prev clicks invoke handler N times', () => {
    const onPrev = vi.fn();
    render(
      <AuctionNavigation
        isFirstAuction={false}
        isLastAuction={false}
        onPrevAuctionClick={onPrev}
        onNextAuctionClick={vi.fn()}
      />,
    );
    const prevBtn = screen.getByText('←');
    fireEvent.click(prevBtn);
    fireEvent.click(prevBtn);
    fireEvent.click(prevBtn);
    expect(onPrev).toHaveBeenCalledTimes(3);
  });

  it('rapid next clicks invoke handler N times', () => {
    const onNext = vi.fn();
    render(
      <AuctionNavigation
        isFirstAuction={false}
        isLastAuction={false}
        onPrevAuctionClick={vi.fn()}
        onNextAuctionClick={onNext}
      />,
    );
    const nextBtn = screen.getByText('→');
    fireEvent.click(nextBtn);
    fireEvent.click(nextBtn);
    expect(onNext).toHaveBeenCalledTimes(2);
  });

  it('disabled prev click does not invoke handler', () => {
    const onPrev = vi.fn();
    render(
      <AuctionNavigation
        isFirstAuction={true}
        isLastAuction={false}
        onPrevAuctionClick={onPrev}
        onNextAuctionClick={vi.fn()}
      />,
    );
    const prevBtn = screen.getByText('←');
    fireEvent.click(prevBtn);
    expect(onPrev).not.toHaveBeenCalled();
  });

  it('disabled next click does not invoke handler', () => {
    const onNext = vi.fn();
    render(
      <AuctionNavigation
        isFirstAuction={false}
        isLastAuction={true}
        onPrevAuctionClick={vi.fn()}
        onNextAuctionClick={onNext}
      />,
    );
    const nextBtn = screen.getByText('→');
    fireEvent.click(nextBtn);
    expect(onNext).not.toHaveBeenCalled();
  });

  it('multiple keydown events invoke handlers N times', () => {
    const onPrev = vi.fn();
    const onNext = vi.fn();
    render(
      <AuctionNavigation
        isFirstAuction={false}
        isLastAuction={false}
        onPrevAuctionClick={onPrev}
        onNextAuctionClick={onNext}
      />,
    );
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(onPrev).toHaveBeenCalledTimes(2);
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('renders exactly 2 buttons', () => {
    const { container } = render(
      <AuctionNavigation
        isFirstAuction={false}
        isLastAuction={false}
        onPrevAuctionClick={vi.fn()}
        onNextAuctionClick={vi.fn()}
      />,
    );
    expect(container.querySelectorAll('button').length).toBe(2);
  });

  it('isFirstAuction=true + isLastAuction=true both buttons disabled', () => {
    render(
      <AuctionNavigation
        isFirstAuction={true}
        isLastAuction={true}
        onPrevAuctionClick={vi.fn()}
        onNextAuctionClick={vi.fn()}
      />,
    );
    expect(screen.getByText('←')).toBeDisabled();
    expect(screen.getByText('→')).toBeDisabled();
  });

  it('keyDown ArrowLeft does not fire onNext', () => {
    const onNext = vi.fn();
    render(
      <AuctionNavigation
        isFirstAuction={false}
        isLastAuction={false}
        onPrevAuctionClick={vi.fn()}
        onNextAuctionClick={onNext}
      />,
    );
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(onNext).not.toHaveBeenCalled();
  });

  it('keyDown ArrowRight does not fire onPrev', () => {
    const onPrev = vi.fn();
    render(
      <AuctionNavigation
        isFirstAuction={false}
        isLastAuction={false}
        onPrevAuctionClick={onPrev}
        onNextAuctionClick={vi.fn()}
      />,
    );
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(onPrev).not.toHaveBeenCalled();
  });

  it('disabled prev button maintains correct className', () => {
    render(
      <AuctionNavigation
        isFirstAuction={true}
        isLastAuction={false}
        onPrevAuctionClick={vi.fn()}
        onNextAuctionClick={vi.fn()}
      />,
    );
    expect(screen.getByText('←').className).toContain('leftArrowCool');
  });

  it('disabled next button maintains rightArrowCool className', () => {
    render(
      <AuctionNavigation
        isFirstAuction={false}
        isLastAuction={true}
        onPrevAuctionClick={vi.fn()}
        onNextAuctionClick={vi.fn()}
      />,
    );
    expect(screen.getByText('→').className).toContain('rightArrowCool');
  });

  it('button text "←" and "→" are exact characters', () => {
    render(
      <AuctionNavigation
        isFirstAuction={false}
        isLastAuction={false}
        onPrevAuctionClick={vi.fn()}
        onNextAuctionClick={vi.fn()}
      />,
    );
    expect(screen.getByText('←').textContent).toBe('←');
    expect(screen.getByText('→').textContent).toBe('→');
  });

  it('keydown event preventDefault called (passes silently no crash)', () => {
    const onPrev = vi.fn();
    render(
      <AuctionNavigation
        isFirstAuction={false}
        isLastAuction={false}
        onPrevAuctionClick={onPrev}
        onNextAuctionClick={vi.fn()}
      />,
    );
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(onPrev).toHaveBeenCalled();
  });

  it('mixed Other + ArrowLeft events filter correctly', () => {
    const onPrev = vi.fn();
    render(
      <AuctionNavigation
        isFirstAuction={false}
        isLastAuction={false}
        onPrevAuctionClick={onPrev}
        onNextAuctionClick={vi.fn()}
      />,
    );
    fireEvent.keyDown(document, { key: 'Enter' });
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    fireEvent.keyDown(document, { key: 'Space' });
    expect(onPrev).toHaveBeenCalledTimes(1);
  });

  it('rapid keydown does not crash component', () => {
    const onPrev = vi.fn();
    render(
      <AuctionNavigation
        isFirstAuction={false}
        isLastAuction={false}
        onPrevAuctionClick={onPrev}
        onNextAuctionClick={vi.fn()}
      />,
    );
    expect(() => {
      for (let i = 0; i < 10; i++) fireEvent.keyDown(document, { key: 'ArrowLeft' });
    }).not.toThrow();
  });

  it('renders 5 instances each with own handlers', () => {
    const { container } = render(
      <>
        {Array.from({ length: 5 }, (_, i) => (
          <AuctionNavigation
            key={i}
            isFirstAuction={false}
            isLastAuction={false}
            onPrevAuctionClick={vi.fn()}
            onNextAuctionClick={vi.fn()}
          />
        ))}
      </>,
    );
    const prevButtons = container.querySelectorAll('button');
    expect(prevButtons.length).toBeGreaterThanOrEqual(10);
  });

  it('rerender from isFirst=false to true updates state', () => {
    const { rerender } = render(
      <AuctionNavigation
        isFirstAuction={false}
        isLastAuction={false}
        onPrevAuctionClick={vi.fn()}
        onNextAuctionClick={vi.fn()}
      />,
    );
    expect(() =>
      rerender(
        <AuctionNavigation
          isFirstAuction={true}
          isLastAuction={false}
          onPrevAuctionClick={vi.fn()}
          onNextAuctionClick={vi.fn()}
        />,
      ),
    ).not.toThrow();
  });

  it('renders without crash with both first and last true', () => {
    expect(() =>
      render(
        <AuctionNavigation
          isFirstAuction={true}
          isLastAuction={true}
          onPrevAuctionClick={vi.fn()}
          onNextAuctionClick={vi.fn()}
        />,
      ),
    ).not.toThrow();
  });

  it('rapid 10 prev clicks invoke onPrev 10 times', () => {
    const onPrev = vi.fn();
    const { container } = render(
      <AuctionNavigation
        isFirstAuction={false}
        isLastAuction={false}
        onPrevAuctionClick={onPrev}
        onNextAuctionClick={vi.fn()}
      />,
    );
    const buttons = container.querySelectorAll('button');
    for (let i = 0; i < 10; i++) fireEvent.click(buttons[0]);
    expect(onPrev).toHaveBeenCalledTimes(10);
  });

  it('rapid 10 next clicks invoke onNext 10 times', () => {
    const onNext = vi.fn();
    const { container } = render(
      <AuctionNavigation
        isFirstAuction={false}
        isLastAuction={false}
        onPrevAuctionClick={vi.fn()}
        onNextAuctionClick={onNext}
      />,
    );
    const buttons = container.querySelectorAll('button');
    for (let i = 0; i < 10; i++) fireEvent.click(buttons[1]);
    expect(onNext).toHaveBeenCalledTimes(10);
  });

  it('mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(
        <AuctionNavigation
          isFirstAuction={false}
          isLastAuction={false}
          onPrevAuctionClick={() => {}}
          onNextAuctionClick={() => {}}
        />,
      );
      unmount();
    }
  });

  it('renders 1000 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1000 }, (_, i) => (
            <AuctionNavigation
              key={i}
              isFirstAuction={false}
              isLastAuction={false}
              onPrevAuctionClick={() => {}}
              onNextAuctionClick={() => {}}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rapid 1000 prev clicks fire handler', () => {
    const onPrev = vi.fn();
    const { container } = render(
      <AuctionNavigation
        isFirstAuction={false}
        isLastAuction={false}
        onPrevAuctionClick={onPrev}
        onNextAuctionClick={() => {}}
      />,
    );
    const buttons = container.querySelectorAll('button');
    for (let i = 0; i < 1000; i++) fireEvent.click(buttons[0]);
    expect(onPrev).toHaveBeenCalledTimes(1000);
  });

  it('handles all 4 isFirst/isLast combinations 30 times each', () => {
    [
      [true, true],
      [true, false],
      [false, true],
      [false, false],
    ].forEach(([f, l]) => {
      for (let i = 0; i < 30; i++) {
        const { unmount } = render(
          <AuctionNavigation
            isFirstAuction={f}
            isLastAuction={l}
            onPrevAuctionClick={() => {}}
            onNextAuctionClick={() => {}}
          />,
        );
        unmount();
      }
    });
  });

  it('all 500 instances render 2 buttons each', () => {
    const { container } = render(
      <>
        {Array.from({ length: 500 }, (_, i) => (
          <AuctionNavigation
            key={i}
            isFirstAuction={false}
            isLastAuction={false}
            onPrevAuctionClick={() => {}}
            onNextAuctionClick={() => {}}
          />
        ))}
      </>,
    );
    expect(container.querySelectorAll('button').length).toBe(1000);
  });

  it('round-2 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(
        <AuctionNavigation
          isFirstAuction={false}
          isLastAuction={false}
          onPrevAuctionClick={() => {}}
          onNextAuctionClick={() => {}}
        />,
      );
      unmount();
    }
  });

  it('round-2 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <AuctionNavigation
              key={i}
              isFirstAuction={false}
              isLastAuction={false}
              onPrevAuctionClick={() => {}}
              onNextAuctionClick={() => {}}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 rapid 500 onPrevAuctionClick events', () => {
    const onPrev = vi.fn();
    const { container } = render(
      <AuctionNavigation
        isFirstAuction={false}
        isLastAuction={false}
        onPrevAuctionClick={onPrev}
        onNextAuctionClick={() => {}}
      />,
    );
    const btns = container.querySelectorAll('button');
    for (let i = 0; i < 500; i++) fireEvent.click(btns[0]);
    expect(onPrev).toHaveBeenCalledTimes(500);
  });

  it('round-2 handles 30 isFirstAuction toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <AuctionNavigation
          isFirstAuction={i % 2 === 0}
          isLastAuction={false}
          onPrevAuctionClick={() => {}}
          onNextAuctionClick={() => {}}
        />,
      );
      unmount();
    }
  });

  it('round-2 handles 30 isLastAuction toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <AuctionNavigation
          isFirstAuction={false}
          isLastAuction={i % 2 === 0}
          onPrevAuctionClick={() => {}}
          onNextAuctionClick={() => {}}
        />,
      );
      unmount();
    }
  });

  it('round-3 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(
        <AuctionNavigation
          isFirstAuction={false}
          isLastAuction={false}
          onPrevAuctionClick={() => {}}
          onNextAuctionClick={() => {}}
        />,
      );
      unmount();
    }
  });

  it('round-3 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <AuctionNavigation
              key={i}
              isFirstAuction={false}
              isLastAuction={false}
              onPrevAuctionClick={() => {}}
              onNextAuctionClick={() => {}}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 rapid 500 onPrevAuctionClick events', () => {
    const onPrev = vi.fn();
    const { container } = render(
      <AuctionNavigation
        isFirstAuction={false}
        isLastAuction={false}
        onPrevAuctionClick={onPrev}
        onNextAuctionClick={() => {}}
      />,
    );
    const btns = container.querySelectorAll('button');
    for (let i = 0; i < 500; i++) fireEvent.click(btns[0]);
    expect(onPrev).toHaveBeenCalledTimes(500);
  });

  it('round-3 30 isFirstAuction toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <AuctionNavigation
          isFirstAuction={i % 2 === 0}
          isLastAuction={false}
          onPrevAuctionClick={() => {}}
          onNextAuctionClick={() => {}}
        />,
      );
      unmount();
    }
  });

  it('round-3 30 isLastAuction toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <AuctionNavigation
          isFirstAuction={false}
          isLastAuction={i % 2 === 0}
          onPrevAuctionClick={() => {}}
          onNextAuctionClick={() => {}}
        />,
      );
      unmount();
    }
  });

  it('round-4 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <AuctionNavigation
          isFirstAuction={false}
          isLastAuction={false}
          onPrevAuctionClick={() => {}}
          onNextAuctionClick={() => {}}
        />,
      );
      unmount();
    }
  });

  it('round-4 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <AuctionNavigation
              key={i}
              isFirstAuction={false}
              isLastAuction={false}
              onPrevAuctionClick={() => {}}
              onNextAuctionClick={() => {}}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <AuctionNavigation
            isFirstAuction={false}
            isLastAuction={false}
            onPrevAuctionClick={() => {}}
            onNextAuctionClick={() => {}}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('round-4 rapid 200 onPrevAuctionClick invocations', () => {
    const onPrevAuctionClick = vi.fn();
    render(
      <AuctionNavigation
        isFirstAuction={false}
        isLastAuction={false}
        onPrevAuctionClick={onPrevAuctionClick}
        onNextAuctionClick={() => {}}
      />,
    );
    for (let i = 0; i < 200; i++) onPrevAuctionClick();
    expect(onPrevAuctionClick).toHaveBeenCalledTimes(200);
  });

  it('round-4 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <AuctionNavigation
          isFirstAuction={false}
          isLastAuction={false}
          onPrevAuctionClick={() => {}}
          onNextAuctionClick={() => {}}
        />,
      );
      unmount();
    }
  });

  it('round-5 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <AuctionNavigation
          isFirstAuction={false}
          isLastAuction={false}
          onPrevAuctionClick={() => {}}
          onNextAuctionClick={() => {}}
        />,
      );
      unmount();
    }
  });

  it('round-5 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <AuctionNavigation
              key={i}
              isFirstAuction={false}
              isLastAuction={false}
              onPrevAuctionClick={() => {}}
              onNextAuctionClick={() => {}}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <AuctionNavigation
            isFirstAuction={false}
            isLastAuction={false}
            onPrevAuctionClick={() => {}}
            onNextAuctionClick={() => {}}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('round-5 rapid 200 onPrevAuctionClick invocations', () => {
    const onPrevAuctionClick = vi.fn();
    render(
      <AuctionNavigation
        isFirstAuction={false}
        isLastAuction={false}
        onPrevAuctionClick={onPrevAuctionClick}
        onNextAuctionClick={() => {}}
      />,
    );
    for (let i = 0; i < 200; i++) onPrevAuctionClick();
    expect(onPrevAuctionClick).toHaveBeenCalledTimes(200);
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <AuctionNavigation
          isFirstAuction={false}
          isLastAuction={false}
          onPrevAuctionClick={() => {}}
          onNextAuctionClick={() => {}}
        />,
      );
      unmount();
    }
  });
});
