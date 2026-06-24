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
});
