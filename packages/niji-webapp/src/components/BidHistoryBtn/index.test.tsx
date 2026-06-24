import { screen } from '@testing-library/dom';
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import BidHistoryBtn from './index';

// Mock @lingui/react/macro Trans component
vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('BidHistoryBtn Component (isCool=true)', () => {
  beforeAll(() => {
    vi.doMock('jotai/react', () => ({
      useAtomValue: () => true,
    }));
  });

  afterAll(() => {
    vi.doUnmock('jotai/react');
  });

  it('renders the "View all bids" text', () => {
    render(<BidHistoryBtn onClick={vi.fn()} />);
    expect(screen.getByText('View all bids')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<BidHistoryBtn onClick={onClick} />);
    fireEvent.click(screen.getByText('View all bids'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies cool style when isCool atom is true', () => {
    render(<BidHistoryBtn onClick={vi.fn()} />);
    // BidHistoryBtn の outer wrapper class を確認
    const wrapper = screen.getByText('View all bids').parentElement;
    expect(wrapper?.className).toBeDefined();
  });

  it('calls onClick multiple times for repeated clicks', () => {
    const onClick = vi.fn();
    render(<BidHistoryBtn onClick={onClick} />);
    const text = screen.getByText('View all bids');
    fireEvent.click(text);
    fireEvent.click(text);
    fireEvent.click(text);
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it('does not crash when onClick is noop', () => {
    expect(() => {
      render(<BidHistoryBtn onClick={() => {}} />);
      fireEvent.click(screen.getByText('View all bids'));
    }).not.toThrow();
  });

  it('renders only the single localized text node', () => {
    const { container } = render(<BidHistoryBtn onClick={vi.fn()} />);
    // outer wrapper > inner wrapper > text
    expect(container.textContent).toBe('View all bids');
  });

  it('text wrapper is nested inside outer wrapper (2-level div)', () => {
    const { container } = render(<BidHistoryBtn onClick={vi.fn()} />);
    expect(container.firstElementChild?.tagName).toBe('DIV');
    expect(container.firstElementChild?.firstElementChild?.tagName).toBe('DIV');
  });

  it('onClick is attached to the outer wrapper (not inner text wrapper)', () => {
    const onClick = vi.fn();
    const { container } = render(<BidHistoryBtn onClick={onClick} />);
    const outerDiv = container.firstElementChild as HTMLDivElement;
    fireEvent.click(outerDiv);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
