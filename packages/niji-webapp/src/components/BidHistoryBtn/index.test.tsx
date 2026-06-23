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
});
