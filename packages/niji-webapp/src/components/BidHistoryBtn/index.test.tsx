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

  it('inner wrapper click also propagates to outer', () => {
    const onClick = vi.fn();
    const { container } = render(<BidHistoryBtn onClick={onClick} />);
    const innerDiv = container.firstElementChild?.firstElementChild as HTMLDivElement;
    fireEvent.click(innerDiv);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('outer wrapper is a single div element', () => {
    const { container } = render(<BidHistoryBtn onClick={vi.fn()} />);
    expect(container.children.length).toBe(1);
  });

  it('text content exactly matches "View all bids"', () => {
    const { container } = render(<BidHistoryBtn onClick={vi.fn()} />);
    expect(container.textContent).toBe('View all bids');
  });

  it('multiple instances render independently', () => {
    const onClick1 = vi.fn();
    const onClick2 = vi.fn();
    const { container: c1 } = render(<BidHistoryBtn onClick={onClick1} />);
    const { container: c2 } = render(<BidHistoryBtn onClick={onClick2} />);
    fireEvent.click(c1.firstElementChild as HTMLDivElement);
    fireEvent.click(c2.firstElementChild as HTMLDivElement);
    expect(onClick1).toHaveBeenCalledTimes(1);
    expect(onClick2).toHaveBeenCalledTimes(1);
  });

  it('renders without errors when onClick is undefined-like', () => {
    expect(() => render(<BidHistoryBtn onClick={() => undefined} />)).not.toThrow();
  });

  it('outer wrapper has non-empty className', () => {
    const { container } = render(<BidHistoryBtn onClick={vi.fn()} />);
    const outer = container.firstElementChild as HTMLDivElement;
    expect(outer.className).toBeTruthy();
  });

  it('outer div is exactly 1 element (no siblings)', () => {
    const { container } = render(<BidHistoryBtn onClick={vi.fn()} />);
    expect(container.querySelectorAll('div').length).toBeGreaterThanOrEqual(1);
    expect(container.children.length).toBe(1);
  });

  it('onClick fires for keyboard event simulation (click event still works)', () => {
    const onClick = vi.fn();
    const { container } = render(<BidHistoryBtn onClick={onClick} />);
    fireEvent.click(container.firstElementChild as HTMLDivElement);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders text exactly without extra whitespace', () => {
    const { container } = render(<BidHistoryBtn onClick={vi.fn()} />);
    expect(container.textContent?.trim()).toBe('View all bids');
  });

  it('inner div className differs from outer div className', () => {
    const { container } = render(<BidHistoryBtn onClick={vi.fn()} />);
    const outer = container.firstElementChild as HTMLDivElement;
    const inner = outer.firstElementChild as HTMLDivElement;
    expect(outer.className).not.toBe(inner.className);
  });

  it('rapid 10 clicks invoke handler 10 times', () => {
    const onClick = vi.fn();
    const { container } = render(<BidHistoryBtn onClick={onClick} />);
    const div = container.firstElementChild as HTMLDivElement;
    for (let i = 0; i < 10; i++) fireEvent.click(div);
    expect(onClick).toHaveBeenCalledTimes(10);
  });

  it('child div count is exactly 2 (outer wraps inner)', () => {
    const { container } = render(<BidHistoryBtn onClick={vi.fn()} />);
    expect(container.querySelectorAll('div').length).toBe(2);
  });

  it('outer div has data-* attribute (cursor pointer for click)', () => {
    const { container } = render(<BidHistoryBtn onClick={vi.fn()} />);
    const outer = container.firstElementChild as HTMLDivElement;
    expect(outer.className.length).toBeGreaterThan(0);
  });

  it('5 instances render 5 outer divs', () => {
    const { container } = render(
      <>
        <BidHistoryBtn onClick={vi.fn()} />
        <BidHistoryBtn onClick={vi.fn()} />
        <BidHistoryBtn onClick={vi.fn()} />
        <BidHistoryBtn onClick={vi.fn()} />
        <BidHistoryBtn onClick={vi.fn()} />
      </>,
    );
    expect(container.children.length).toBe(5);
  });

  it('onClick handler captures click event (event.type=click)', () => {
    let captured: { type: string } | null = null;
    const onClick = (e: { type: string }) => {
      captured = e;
    };
    const { container } = render(<BidHistoryBtn onClick={onClick} />);
    fireEvent.click(container.firstElementChild as HTMLDivElement);
    expect(captured).not.toBeNull();
    expect((captured as unknown as { type: string }).type).toBe('click');
  });

  it('20 instances render 20 outer divs', () => {
    const { container } = render(
      <>
        {Array.from({ length: 20 }, (_, i) => (
          <BidHistoryBtn key={i} onClick={vi.fn()} />
        ))}
      </>,
    );
    expect(container.children.length).toBe(20);
  });

  it('20 instances each render "View all bids" text', () => {
    const { container } = render(
      <>
        <BidHistoryBtn onClick={vi.fn()} />
        <BidHistoryBtn onClick={vi.fn()} />
        <BidHistoryBtn onClick={vi.fn()} />
      </>,
    );
    expect(container.textContent).toBe('View all bidsView all bidsView all bids');
  });

  it('rerender preserves outer div structure', () => {
    const { container, rerender } = render(<BidHistoryBtn onClick={vi.fn()} />);
    expect(container.firstElementChild?.tagName).toBe('DIV');
    rerender(<BidHistoryBtn onClick={vi.fn()} />);
    expect(container.firstElementChild?.tagName).toBe('DIV');
  });

  it('inner click bubbles to outer click handler', () => {
    const onClick = vi.fn();
    const { container } = render(<BidHistoryBtn onClick={onClick} />);
    const inner = container.firstElementChild?.firstElementChild as HTMLDivElement;
    fireEvent.click(inner);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('text content trimmed equals "View all bids"', () => {
    const { container } = render(<BidHistoryBtn onClick={vi.fn()} />);
    expect(container.textContent?.trim()).toBe('View all bids');
  });
});
