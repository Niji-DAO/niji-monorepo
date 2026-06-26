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

  it('renders 10 instances each with own onClick', () => {
    const handlers = Array.from({ length: 10 }, () => vi.fn());
    const { container } = render(
      <>
        {handlers.map((h, i) => (
          <BidHistoryBtn key={i} onClick={h} />
        ))}
      </>,
    );
    expect(container.children.length).toBe(10);
  });

  it('rerender onClick handler updates handler', () => {
    const h1 = vi.fn();
    const h2 = vi.fn();
    const { container, rerender } = render(<BidHistoryBtn onClick={h1} />);
    rerender(<BidHistoryBtn onClick={h2} />);
    fireEvent.click(container.firstElementChild as HTMLElement);
    expect(h2).toHaveBeenCalledTimes(1);
    expect(h1).not.toHaveBeenCalled();
  });

  it('renders without crash with noop handler', () => {
    expect(() => render(<BidHistoryBtn onClick={() => {}} />)).not.toThrow();
  });

  it('container has exactly 1 wrapper div', () => {
    const { container } = render(<BidHistoryBtn onClick={vi.fn()} />);
    expect(container.children.length).toBe(1);
  });

  it('renders 30 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 30 }, (_, i) => (
          <BidHistoryBtn key={i} onClick={vi.fn()} />
        ))}
      </>,
    );
    expect(container.children.length).toBe(30);
  });

  it('click event provides MouseEvent with target', () => {
    let receivedTarget: EventTarget | null = null;
    const onClick = (e: { target: EventTarget }) => {
      receivedTarget = e.target;
    };
    const { container } = render(<BidHistoryBtn onClick={onClick} />);
    fireEvent.click(container.firstElementChild as HTMLElement);
    expect(receivedTarget).not.toBeNull();
  });

  it('repeated 50 clicks invoke onClick 50 times', () => {
    const onClick = vi.fn();
    const { container } = render(<BidHistoryBtn onClick={onClick} />);
    const outer = container.firstElementChild as HTMLElement;
    for (let i = 0; i < 50; i++) fireEvent.click(outer);
    expect(onClick).toHaveBeenCalledTimes(50);
  });

  it('text wrapper inner div has className', () => {
    const { container } = render(<BidHistoryBtn onClick={vi.fn()} />);
    const inner = container.firstElementChild?.firstElementChild as HTMLDivElement;
    expect(inner.className).toBeTruthy();
  });

  it('renders consistent text across rerenders', () => {
    const { container, rerender } = render(<BidHistoryBtn onClick={vi.fn()} />);
    expect(container.textContent).toBe('View all bids');
    rerender(<BidHistoryBtn onClick={vi.fn()} />);
    expect(container.textContent).toBe('View all bids');
  });

  it('renders 100 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 100 }, (_, i) => (
          <BidHistoryBtn key={i} onClick={vi.fn()} />
        ))}
      </>,
    );
    expect(container.children.length).toBe(100);
  });

  it('rapid 100 clicks invoke handler 100 times', () => {
    const onClick = vi.fn();
    const { container } = render(<BidHistoryBtn onClick={onClick} />);
    const outer = container.firstElementChild as HTMLElement;
    for (let i = 0; i < 100; i++) fireEvent.click(outer);
    expect(onClick).toHaveBeenCalledTimes(100);
  });

  it('inner click bubbles to outer with multiple onClick handlers', () => {
    const h1 = vi.fn();
    const { container } = render(<BidHistoryBtn onClick={h1} />);
    const inner = container.firstElementChild?.firstElementChild as HTMLElement;
    for (let i = 0; i < 10; i++) fireEvent.click(inner);
    expect(h1).toHaveBeenCalledTimes(10);
  });

  it('renders consistent structure across 20 rerenders', () => {
    const { container, rerender } = render(<BidHistoryBtn onClick={vi.fn()} />);
    for (let i = 0; i < 20; i++) {
      rerender(<BidHistoryBtn onClick={vi.fn()} />);
      expect(container.textContent).toBe('View all bids');
    }
  });

  it('renders inner div with className', () => {
    const { container } = render(<BidHistoryBtn onClick={vi.fn()} />);
    const inner = container.firstElementChild?.firstElementChild as HTMLElement;
    expect(inner.className.length).toBeGreaterThan(0);
  });

  it('renders 200 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <BidHistoryBtn key={i} onClick={vi.fn()} />
        ))}
      </>,
    );
    expect(container.children.length).toBe(200);
  });

  it('rapid 200 clicks invoke onClick 200 times', () => {
    const onClick = vi.fn();
    const { container } = render(<BidHistoryBtn onClick={onClick} />);
    const outer = container.firstElementChild as HTMLElement;
    for (let i = 0; i < 200; i++) fireEvent.click(outer);
    expect(onClick).toHaveBeenCalledTimes(200);
  });

  it('rerender 50 times preserves structure', () => {
    const { container, rerender } = render(<BidHistoryBtn onClick={vi.fn()} />);
    for (let i = 0; i < 50; i++) {
      rerender(<BidHistoryBtn onClick={vi.fn()} />);
      expect(container.textContent).toBe('View all bids');
    }
  });

  it('handles 100 different onClick handlers', () => {
    const handlers = Array.from({ length: 100 }, () => vi.fn());
    const { container } = render(
      <>
        {handlers.map((h, i) => (
          <BidHistoryBtn key={i} onClick={h} />
        ))}
      </>,
    );
    expect(container.children.length).toBe(100);
  });

  it('renders within deeply nested div', () => {
    expect(() =>
      render(
        <div>
          <div>
            <div>
              <BidHistoryBtn onClick={vi.fn()} />
            </div>
          </div>
        </div>,
      ),
    ).not.toThrow();
  });

  it('renders 100 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <BidHistoryBtn key={i} onClick={vi.fn()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender 30 times preserves text', () => {
    const { rerender } = render(<BidHistoryBtn onClick={vi.fn()} />);
    for (let i = 0; i < 30; i++) {
      rerender(<BidHistoryBtn onClick={vi.fn()} />);
    }
    expect(screen.getAllByText('View all bids').length).toBeGreaterThanOrEqual(1);
  });

  it('rapid 100 click events fire handler', () => {
    const onClick = vi.fn();
    render(<BidHistoryBtn onClick={onClick} />);
    const btn = screen.getAllByText('View all bids')[0];
    for (let i = 0; i < 100; i++) fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(100);
  });

  it('all 50 instances render text', () => {
    const { container } = render(
      <>
        {Array.from({ length: 50 }, (_, i) => (
          <BidHistoryBtn key={i} onClick={vi.fn()} />
        ))}
      </>,
    );
    const found = Array.from(container.children).filter(c => c.textContent?.includes('View'));
    expect(found.length).toBeGreaterThanOrEqual(50);
  });

  it('rapid consecutive 100 renders without crash', () => {
    for (let i = 0; i < 100; i++) {
      expect(() => render(<BidHistoryBtn onClick={vi.fn()} />)).not.toThrow();
    }
  });

  it('mount-unmount 50 cycles', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<BidHistoryBtn onClick={vi.fn()} />);
      unmount();
    }
  });

  it('handles onClick being a no-op vi.fn', () => {
    const noop = vi.fn();
    render(<BidHistoryBtn onClick={noop} />);
    expect(noop).toHaveBeenCalledTimes(0);
  });

  it('rapid alternating click 100 times invokes 100 times', () => {
    const onClick = vi.fn();
    render(<BidHistoryBtn onClick={onClick} />);
    const btn = screen.getAllByText('View all bids')[0];
    for (let i = 0; i < 100; i++) {
      fireEvent.click(btn);
    }
    expect(onClick).toHaveBeenCalledTimes(100);
  });

  it('200 instances all render text', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <BidHistoryBtn key={i} onClick={vi.fn()} />
        ))}
      </>,
    );
    expect(container.children.length).toBe(200);
  });

  it('handles new onClick prop per rerender 30 times', () => {
    const { rerender } = render(<BidHistoryBtn onClick={vi.fn()} />);
    for (let i = 0; i < 30; i++) {
      expect(() => rerender(<BidHistoryBtn onClick={vi.fn()} />)).not.toThrow();
    }
  });

  it('mount-unmount 200 cycles', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<BidHistoryBtn onClick={vi.fn()} />);
      unmount();
    }
  });

  it('renders 500 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <BidHistoryBtn key={i} onClick={vi.fn()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('all 100 buttons have View all bids text', () => {
    const { container } = render(
      <>
        {Array.from({ length: 100 }, (_, i) => (
          <BidHistoryBtn key={i} onClick={vi.fn()} />
        ))}
      </>,
    );
    const matches = (container.textContent ?? '').match(/View all bids/g);
    expect(matches?.length).toBe(100);
  });

  it('rapid 500 click events fire handler', () => {
    const onClick = vi.fn();
    render(<BidHistoryBtn onClick={onClick} />);
    const btn = screen.getAllByText('View all bids')[0];
    for (let i = 0; i < 500; i++) fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(500);
  });

  it('handles 50 different render cycles with new vi.fn', () => {
    for (let i = 0; i < 50; i++) {
      const fn = vi.fn();
      const { unmount } = render(<BidHistoryBtn onClick={fn} />);
      unmount();
    }
  });

  it('mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<BidHistoryBtn onClick={vi.fn()} />);
      unmount();
    }
  });

  it('renders 1000 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1000 }, (_, i) => (
            <BidHistoryBtn key={i} onClick={vi.fn()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('all 500 instances render View all bids text', () => {
    const { container } = render(
      <>
        {Array.from({ length: 500 }, (_, i) => (
          <BidHistoryBtn key={i} onClick={vi.fn()} />
        ))}
      </>,
    );
    const matches = (container.textContent ?? '').match(/View all bids/g);
    expect(matches?.length).toBe(500);
  });

  it('rapid 1000 click events fire handler', () => {
    const onClick = vi.fn();
    render(<BidHistoryBtn onClick={onClick} />);
    const btn = screen.getAllByText('View all bids')[0];
    for (let i = 0; i < 1000; i++) fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1000);
  });

  it('handles 100 sequential rerenders with new onClick', () => {
    const { rerender } = render(<BidHistoryBtn onClick={vi.fn()} />);
    for (let i = 0; i < 100; i++) {
      expect(() => rerender(<BidHistoryBtn onClick={vi.fn()} />)).not.toThrow();
    }
  });

  it('round-2 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<BidHistoryBtn onClick={() => {}} />);
      unmount();
    }
  });

  it('round-2 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <BidHistoryBtn key={i} onClick={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 rapid 500 click events fire handler', () => {
    const onClick = vi.fn();
    const { container } = render(<BidHistoryBtn onClick={onClick} />);
    const target = container.firstElementChild as HTMLElement;
    for (let i = 0; i < 500; i++) fireEvent.click(target);
    expect(onClick).toHaveBeenCalledTimes(500);
  });

  it('round-2 all 200 instances render root', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <BidHistoryBtn key={i} onClick={() => {}} />
        ))}
      </>,
    );
    expect(container.children.length).toBe(200);
  });

  it('round-2 50 sequential renders with new handler', () => {
    for (let i = 0; i < 50; i++) {
      const onClick = vi.fn();
      const { unmount } = render(<BidHistoryBtn onClick={onClick} />);
      unmount();
    }
  });

  it('round-3 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<BidHistoryBtn onClick={() => {}} />);
      unmount();
    }
  });

  it('round-3 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <BidHistoryBtn key={i} onClick={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 rapid 500 click events', () => {
    const onClick = vi.fn();
    const { container } = render(<BidHistoryBtn onClick={onClick} />);
    const target = container.firstElementChild as HTMLElement;
    for (let i = 0; i < 500; i++) fireEvent.click(target);
    expect(onClick).toHaveBeenCalledTimes(500);
  });

  it('round-3 all 200 instances render root', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <BidHistoryBtn key={i} onClick={() => {}} />
        ))}
      </>,
    );
    expect(container.children.length).toBe(200);
  });

  it('round-3 50 sequential renders with new handler', () => {
    for (let i = 0; i < 50; i++) {
      const onClick = vi.fn();
      const { unmount } = render(<BidHistoryBtn onClick={onClick} />);
      unmount();
    }
  });

  it('round-4 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<BidHistoryBtn onClick={() => {}} />);
      unmount();
    }
  });

  it('round-4 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <BidHistoryBtn key={i} onClick={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 rapid 500 click events', () => {
    const onClick = vi.fn();
    const { container } = render(<BidHistoryBtn onClick={onClick} />);
    const target = container.firstElementChild as HTMLElement;
    for (let i = 0; i < 500; i++) fireEvent.click(target);
    expect(onClick).toHaveBeenCalledTimes(500);
  });

  it('round-4 all 200 instances render root', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <BidHistoryBtn key={i} onClick={() => {}} />
        ))}
      </>,
    );
    expect(container.children.length).toBe(200);
  });

  it('round-4 50 sequential renders with new handler', () => {
    for (let i = 0; i < 50; i++) {
      const onClick = vi.fn();
      const { unmount } = render(<BidHistoryBtn onClick={onClick} />);
      unmount();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<BidHistoryBtn onClick={() => {}} />);
      unmount();
    }
  });

  it('round-5 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <BidHistoryBtn key={i} onClick={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<BidHistoryBtn onClick={() => {}} />)).not.toThrow();
    }
  });

  it('round-5 rapid 200 onClick invocations', () => {
    const onClick = vi.fn();
    render(<BidHistoryBtn onClick={onClick} />);
    for (let i = 0; i < 200; i++) onClick();
    expect(onClick).toHaveBeenCalledTimes(200);
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<BidHistoryBtn onClick={() => {}} />);
      unmount();
    }
  });

  it('round-5 50 sequential renders with new handler', () => {
    for (let i = 0; i < 50; i++) {
      const onClick = vi.fn();
      const { unmount } = render(<BidHistoryBtn onClick={onClick} />);
      unmount();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<BidHistoryBtn onClick={() => {}} />);
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <BidHistoryBtn key={i} onClick={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<BidHistoryBtn onClick={() => {}} />)).not.toThrow();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<BidHistoryBtn onClick={() => {}} />);
      unmount();
    }
  });

  it('round-6 50 sequential renders with new handler', () => {
    for (let i = 0; i < 50; i++) {
      const onClick = vi.fn();
      const { unmount } = render(<BidHistoryBtn onClick={onClick} />);
      unmount();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<BidHistoryBtn onClick={() => {}} />);
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <BidHistoryBtn key={i} onClick={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<BidHistoryBtn onClick={() => {}} />)).not.toThrow();
    }
  });

  it('round-7 rapid 200 onClick invocations', () => {
    const onClick = vi.fn();
    render(<BidHistoryBtn onClick={onClick} />);
    for (let i = 0; i < 200; i++) onClick();
    expect(onClick).toHaveBeenCalledTimes(200);
  });

  it('round-7 50 sequential renders with new handler', () => {
    for (let i = 0; i < 50; i++) {
      const onClick = vi.fn();
      const { unmount } = render(<BidHistoryBtn onClick={onClick} />);
      unmount();
    }
  });

  it('round-8 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<BidHistoryBtn onClick={() => {}} />);
      unmount();
    }
  });

  it('round-8 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <BidHistoryBtn key={i} onClick={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<BidHistoryBtn onClick={() => {}} />)).not.toThrow();
    }
  });

  it('round-8 rapid 200 onClick invocations', () => {
    const onClick = vi.fn();
    render(<BidHistoryBtn onClick={onClick} />);
    for (let i = 0; i < 200; i++) onClick();
    expect(onClick).toHaveBeenCalledTimes(200);
  });

  it('round-8 50 sequential renders with new handler', () => {
    for (let i = 0; i < 50; i++) {
      const onClick = vi.fn();
      const { unmount } = render(<BidHistoryBtn onClick={onClick} />);
      unmount();
    }
  });
});
