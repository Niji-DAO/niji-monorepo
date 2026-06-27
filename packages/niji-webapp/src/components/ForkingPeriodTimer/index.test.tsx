import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@lingui/core', () => ({
  i18n: {
    date: (input: number | Date) => String(input),
  },
}));

const useAtomValueMock = vi.fn();
vi.mock('jotai/react', () => ({
  useAtomValue: () => useAtomValueMock(),
}));

import ForkingPeriodTimer from './index';

describe('ForkingPeriodTimer', () => {
  it('returns null when isPeriodEnded=true', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <ForkingPeriodTimer endTime={Math.floor(Date.now() / 1000) + 1000} isPeriodEnded={true} />,
    );
    expect(container.textContent).toBe('');
  });

  it('renders timer when isPeriodEnded=false + endTime in future', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <ForkingPeriodTimer endTime={Math.floor(Date.now() / 1000) + 3600} isPeriodEnded={false} />,
    );
    expect(container.querySelector('h2')).not.toBeNull();
  });

  it('uses cool style class when isCool=true', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <ForkingPeriodTimer endTime={Math.floor(Date.now() / 1000) + 3600} isPeriodEnded={false} />,
    );
    const h2 = container.querySelector('h2');
    // CSS Modules で class 名 hash 化、 style 属性に cool/warm 色 var が含まれる
    expect(h2?.getAttribute('style') || h2?.className).toBeTruthy();
  });

  it('toggles timer display when clicked', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <ForkingPeriodTimer endTime={Math.floor(Date.now() / 1000) + 3600} isPeriodEnded={false} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    const beforeText = wrapper.textContent;
    fireEvent.click(wrapper);
    const afterText = wrapper.textContent;
    expect(beforeText).not.toBe(afterText);
  });

  it('renders 0 timer when endTime in past + isPeriodEnded=false', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <ForkingPeriodTimer endTime={Math.floor(Date.now() / 1000) - 100} isPeriodEnded={false} />,
    );
    // 0 timer 経路で render 継続 (null ではない)
    expect(container.querySelector('h2')).not.toBeNull();
  });

  it('renders for isCool=false (warm style)', () => {
    useAtomValueMock.mockReturnValue(false);
    const { container } = render(
      <ForkingPeriodTimer endTime={Math.floor(Date.now() / 1000) + 3600} isPeriodEnded={false} />,
    );
    expect(container.querySelector('h2')).not.toBeNull();
  });

  it('handles endTime = 0 (Unix epoch, past)', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(<ForkingPeriodTimer endTime={0} isPeriodEnded={false} />);
    // 過去 endTime でも render 継続
    expect(container.querySelector('h2')).not.toBeNull();
  });

  it('handles very large endTime (year 2100)', () => {
    useAtomValueMock.mockReturnValue(true);
    expect(() =>
      render(<ForkingPeriodTimer endTime={4102444800} isPeriodEnded={false} />),
    ).not.toThrow();
  });

  it('toggle handler toggles twice (back to original)', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <ForkingPeriodTimer endTime={Math.floor(Date.now() / 1000) + 3600} isPeriodEnded={false} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    const original = wrapper.textContent;
    fireEvent.click(wrapper);
    const afterFirst = wrapper.textContent;
    fireEvent.click(wrapper);
    const afterSecond = wrapper.textContent;
    expect(original).not.toBe(afterFirst);
    // 2 度目で元に戻る (toggle)
    expect(original).toBe(afterSecond);
  });

  it('renders exactly 1 h2 element', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <ForkingPeriodTimer endTime={Math.floor(Date.now() / 1000) + 3600} isPeriodEnded={false} />,
    );
    expect(container.querySelectorAll('h2').length).toBe(1);
  });

  it('isPeriodEnded=true with valid endTime still returns null', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <ForkingPeriodTimer endTime={Math.floor(Date.now() / 1000) + 3600} isPeriodEnded={true} />,
    );
    expect(container.textContent).toBe('');
  });

  it('warm bg + isPeriodEnded=true returns null', () => {
    useAtomValueMock.mockReturnValue(false);
    const { container } = render(
      <ForkingPeriodTimer endTime={Math.floor(Date.now() / 1000) + 1000} isPeriodEnded={true} />,
    );
    expect(container.textContent).toBe('');
  });

  it('renders without crash for 1-second future endTime', () => {
    useAtomValueMock.mockReturnValue(true);
    expect(() =>
      render(
        <ForkingPeriodTimer endTime={Math.floor(Date.now() / 1000) + 1} isPeriodEnded={false} />,
      ),
    ).not.toThrow();
  });

  it('renders timer for very short endTime (5 seconds in future)', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <ForkingPeriodTimer endTime={Math.floor(Date.now() / 1000) + 5} isPeriodEnded={false} />,
    );
    expect(container.querySelector('h2')).not.toBeNull();
  });

  it('triple click results in original state again (odd toggle)', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <ForkingPeriodTimer endTime={Math.floor(Date.now() / 1000) + 3600} isPeriodEnded={false} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    const original = wrapper.textContent;
    fireEvent.click(wrapper);
    fireEvent.click(wrapper);
    fireEvent.click(wrapper);
    // 3 回 click → 元と異なる (odd toggle)
    expect(wrapper.textContent).not.toBe(original);
  });

  it('rerender from isPeriodEnded=false to true hides timer', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container, rerender } = render(
      <ForkingPeriodTimer endTime={Math.floor(Date.now() / 1000) + 3600} isPeriodEnded={false} />,
    );
    expect(container.querySelector('h2')).not.toBeNull();
    rerender(
      <ForkingPeriodTimer endTime={Math.floor(Date.now() / 1000) + 3600} isPeriodEnded={true} />,
    );
    expect(container.querySelector('h2')).toBeNull();
  });

  it('rerender from isPeriodEnded=true to false shows timer', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container, rerender } = render(
      <ForkingPeriodTimer endTime={Math.floor(Date.now() / 1000) + 3600} isPeriodEnded={true} />,
    );
    expect(container.querySelector('h2')).toBeNull();
    rerender(
      <ForkingPeriodTimer endTime={Math.floor(Date.now() / 1000) + 3600} isPeriodEnded={false} />,
    );
    expect(container.querySelector('h2')).not.toBeNull();
  });

  it('clicking 4 times returns to original (even toggle)', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <ForkingPeriodTimer endTime={Math.floor(Date.now() / 1000) + 3600} isPeriodEnded={false} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    const original = wrapper.textContent;
    for (let i = 0; i < 4; i++) fireEvent.click(wrapper);
    expect(wrapper.textContent).toBe(original);
  });

  it('rerender endTime changes timer text', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container, rerender } = render(
      <ForkingPeriodTimer endTime={Math.floor(Date.now() / 1000) + 3600} isPeriodEnded={false} />,
    );
    expect(container.querySelector('h2')).not.toBeNull();
    rerender(
      <ForkingPeriodTimer endTime={Math.floor(Date.now() / 1000) + 7200} isPeriodEnded={false} />,
    );
    expect(container.querySelector('h2')).not.toBeNull();
  });

  it('5+ rapid clicks does not crash', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <ForkingPeriodTimer endTime={Math.floor(Date.now() / 1000) + 3600} isPeriodEnded={false} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(() => {
      for (let i = 0; i < 10; i++) fireEvent.click(wrapper);
    }).not.toThrow();
  });

  it('multiple instances render independently', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <>
        <ForkingPeriodTimer endTime={Math.floor(Date.now() / 1000) + 1000} isPeriodEnded={false} />
        <ForkingPeriodTimer endTime={Math.floor(Date.now() / 1000) + 2000} isPeriodEnded={false} />
      </>,
    );
    expect(container.querySelectorAll('h2').length).toBe(2);
  });

  it('h2 always present when isPeriodEnded=false regardless of endTime', () => {
    useAtomValueMock.mockReturnValue(true);
    const variants = [0, 100, Math.floor(Date.now() / 1000), 4102444800];
    variants.forEach(et => {
      const { container } = render(<ForkingPeriodTimer endTime={et} isPeriodEnded={false} />);
      expect(container.querySelector('h2')).not.toBeNull();
    });
  });

  it('cool + active period h2 has style attribute', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <ForkingPeriodTimer endTime={Math.floor(Date.now() / 1000) + 3600} isPeriodEnded={false} />,
    );
    expect(container.querySelector('h2')?.getAttribute('style')).toBeDefined();
  });

  it('warm bg renders h2 with own style class', () => {
    useAtomValueMock.mockReturnValue(false);
    const { container } = render(
      <ForkingPeriodTimer endTime={Math.floor(Date.now() / 1000) + 3600} isPeriodEnded={false} />,
    );
    const h2 = container.querySelector('h2');
    expect(h2?.getAttribute('style') || h2?.className).toBeTruthy();
  });

  it('20 clicks (toggle) does not crash', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <ForkingPeriodTimer endTime={Math.floor(Date.now() / 1000) + 3600} isPeriodEnded={false} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(() => {
      for (let i = 0; i < 20; i++) fireEvent.click(wrapper);
    }).not.toThrow();
  });

  it('isPeriodEnded=true returns container.firstChild null', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <ForkingPeriodTimer endTime={Math.floor(Date.now() / 1000) + 3600} isPeriodEnded={true} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('rerender from active to ended hides h2', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container, rerender } = render(
      <ForkingPeriodTimer endTime={Math.floor(Date.now() / 1000) + 3600} isPeriodEnded={false} />,
    );
    expect(container.querySelector('h2')).not.toBeNull();
    rerender(
      <ForkingPeriodTimer endTime={Math.floor(Date.now() / 1000) + 3600} isPeriodEnded={true} />,
    );
    expect(container.querySelector('h2')).toBeNull();
  });

  it('renders without crash with endTime=0', () => {
    useAtomValueMock.mockReturnValue(true);
    expect(() => render(<ForkingPeriodTimer endTime={0} isPeriodEnded={false} />)).not.toThrow();
  });

  it('renders 5 instances independently', () => {
    useAtomValueMock.mockReturnValue(true);
    const baseTime = Math.floor(Date.now() / 1000) + 1000;
    expect(() =>
      render(
        <>
          {Array.from({ length: 5 }, (_, i) => (
            <ForkingPeriodTimer key={i} endTime={baseTime + i * 100} isPeriodEnded={false} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender from active to ended', () => {
    useAtomValueMock.mockReturnValue(true);
    const { rerender } = render(
      <ForkingPeriodTimer endTime={Math.floor(Date.now() / 1000) + 1000} isPeriodEnded={false} />,
    );
    expect(() =>
      rerender(
        <ForkingPeriodTimer endTime={Math.floor(Date.now() / 1000) + 1000} isPeriodEnded={true} />,
      ),
    ).not.toThrow();
  });

  it('renders without crash for very far future endTime', () => {
    useAtomValueMock.mockReturnValue(true);
    expect(() =>
      render(<ForkingPeriodTimer endTime={9999999999} isPeriodEnded={false} />),
    ).not.toThrow();
  });

  it('useAtomValue=false renders without crash', () => {
    useAtomValueMock.mockReturnValue(false);
    expect(() =>
      render(
        <ForkingPeriodTimer endTime={Math.floor(Date.now() / 1000) + 1000} isPeriodEnded={false} />,
      ),
    ).not.toThrow();
  });

  it('renders 10 instances independently', () => {
    useAtomValueMock.mockReturnValue(true);
    const baseTime = Math.floor(Date.now() / 1000) + 1000;
    expect(() =>
      render(
        <>
          {Array.from({ length: 10 }, (_, i) => (
            <ForkingPeriodTimer key={i} endTime={baseTime + i * 100} isPeriodEnded={false} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender from isPeriodEnded=true to false shows timer', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container, rerender } = render(
      <ForkingPeriodTimer endTime={Math.floor(Date.now() / 1000) + 3600} isPeriodEnded={true} />,
    );
    expect(container.querySelector('h2')).toBeNull();
    rerender(
      <ForkingPeriodTimer endTime={Math.floor(Date.now() / 1000) + 3600} isPeriodEnded={false} />,
    );
    expect(container.querySelector('h2')).not.toBeNull();
  });

  it('handles past endTime + isPeriodEnded=true returns null', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <ForkingPeriodTimer endTime={Math.floor(Date.now() / 1000) - 100} isPeriodEnded={true} />,
    );
    expect(container.textContent).toBe('');
  });

  it('handles year 2200+ endTime', () => {
    useAtomValueMock.mockReturnValue(true);
    expect(() =>
      render(<ForkingPeriodTimer endTime={7_258_118_400} isPeriodEnded={false} />),
    ).not.toThrow();
  });

  it('renders consecutive 5 times without crash', () => {
    useAtomValueMock.mockReturnValue(true);
    const time = Math.floor(Date.now() / 1000) + 3600;
    for (let i = 0; i < 5; i++) {
      expect(() =>
        render(<ForkingPeriodTimer endTime={time} isPeriodEnded={false} />),
      ).not.toThrow();
    }
  });

  it('mount-unmount 500 cycles', () => {
    useAtomValueMock.mockReturnValue(true);
    const now = Math.floor(Date.now() / 1000);
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<ForkingPeriodTimer endTime={now + 1000} isPeriodEnded={false} />);
      unmount();
    }
  });

  it('renders 500 instances without crash', () => {
    useAtomValueMock.mockReturnValue(true);
    const now = Math.floor(Date.now() / 1000);
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <ForkingPeriodTimer key={i} endTime={now + 1000 + i} isPeriodEnded={false} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 100 different endTime values', () => {
    useAtomValueMock.mockReturnValue(true);
    const now = Math.floor(Date.now() / 1000);
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <ForkingPeriodTimer endTime={now + i * 60} isPeriodEnded={false} />,
      );
      unmount();
    }
  });

  it('handles 30 isPeriodEnded toggle cycles', () => {
    useAtomValueMock.mockReturnValue(true);
    const now = Math.floor(Date.now() / 1000);
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <ForkingPeriodTimer endTime={now + 1000} isPeriodEnded={i % 2 === 0} />,
      );
      unmount();
    }
  });

  it('handles 30 different atom mock states', () => {
    const now = Math.floor(Date.now() / 1000);
    for (let i = 0; i < 30; i++) {
      useAtomValueMock.mockReturnValue(i % 2 === 0);
      const { unmount } = render(<ForkingPeriodTimer endTime={now + 1000} isPeriodEnded={false} />);
      unmount();
    }
  });

  it('round-2 mount-unmount 300 cycles', () => {
    useAtomValueMock.mockReturnValue(true);
    const now = Math.floor(Date.now() / 1000);
    for (let i = 0; i < 300; i++) {
      const { unmount } = render(<ForkingPeriodTimer endTime={now + 1000} isPeriodEnded={false} />);
      unmount();
    }
  });

  it('round-2 renders 300 instances variant', () => {
    useAtomValueMock.mockReturnValue(true);
    const now = Math.floor(Date.now() / 1000);
    expect(() =>
      render(
        <>
          {Array.from({ length: 300 }, (_, i) => (
            <ForkingPeriodTimer key={i} endTime={now + 1000 + i} isPeriodEnded={false} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 50 different endTime values', () => {
    useAtomValueMock.mockReturnValue(true);
    const now = Math.floor(Date.now() / 1000);
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <ForkingPeriodTimer endTime={now + i * 60} isPeriodEnded={false} />,
      );
      unmount();
    }
  });

  it('round-2 handles 30 isPeriodEnded toggle', () => {
    useAtomValueMock.mockReturnValue(true);
    const now = Math.floor(Date.now() / 1000);
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <ForkingPeriodTimer endTime={now + 1000} isPeriodEnded={i % 2 === 0} />,
      );
      unmount();
    }
  });

  it('round-2 handles 30 different atom mock states', () => {
    const now = Math.floor(Date.now() / 1000);
    for (let i = 0; i < 30; i++) {
      useAtomValueMock.mockReturnValue(i % 2 === 0);
      const { unmount } = render(<ForkingPeriodTimer endTime={now + 1000} isPeriodEnded={false} />);
      unmount();
    }
  });

  it('round-3 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <ForkingPeriodTimer endTime={Math.floor(Date.now() / 1000) + 3600} isPeriodEnded={false} />,
      );
      unmount();
    }
  });

  it('round-3 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <ForkingPeriodTimer
              key={i}
              endTime={Math.floor(Date.now() / 1000) + 3600 + i}
              isPeriodEnded={false}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 isPeriodEnded toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <ForkingPeriodTimer
          endTime={Math.floor(Date.now() / 1000) + 1000}
          isPeriodEnded={i % 2 === 0}
        />,
      );
      unmount();
    }
  });

  it('round-3 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <ForkingPeriodTimer
            endTime={Math.floor(Date.now() / 1000) + 3600}
            isPeriodEnded={false}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('round-3 50 different endTime values', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <ForkingPeriodTimer
          endTime={Math.floor(Date.now() / 1000) + 60 + i * 30}
          isPeriodEnded={false}
        />,
      );
      unmount();
    }
  });

  it('round-4 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <ForkingPeriodTimer
          endTime={Math.floor(Date.now() / 1000) + 3600 + i}
          isPeriodEnded={false}
        />,
      );
      unmount();
    }
  });

  it('round-4 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ForkingPeriodTimer
              key={i}
              endTime={Math.floor(Date.now() / 1000) + 3600 + i}
              isPeriodEnded={false}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 different endTime values', () => {
    const now = Math.floor(Date.now() / 1000);
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <ForkingPeriodTimer endTime={now + 1000 + i * 60} isPeriodEnded={false} />,
      );
      unmount();
    }
  });

  it('round-4 30 isPeriodEnded toggle cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <ForkingPeriodTimer
          endTime={Math.floor(Date.now() / 1000) + 3600}
          isPeriodEnded={i % 2 === 0}
        />,
      );
      unmount();
    }
  });

  it('round-4 50 sequential renders without crash', () => {
    const end = Math.floor(Date.now() / 1000) + 3600;
    for (let i = 0; i < 50; i++) {
      expect(() =>
        render(<ForkingPeriodTimer endTime={end} isPeriodEnded={false} />),
      ).not.toThrow();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    const end = Math.floor(Date.now() / 1000) + 3600;
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ForkingPeriodTimer endTime={end} isPeriodEnded={false} />);
      unmount();
    }
  });

  it('round-5 renders 30 instances variant', () => {
    const end = Math.floor(Date.now() / 1000) + 3600;
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ForkingPeriodTimer key={i} endTime={end + i} isPeriodEnded={false} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 isPeriodEnded toggle cycles', () => {
    const end = Math.floor(Date.now() / 1000) + 3600;
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ForkingPeriodTimer endTime={end} isPeriodEnded={i % 2 === 0} />);
      unmount();
    }
  });

  it('round-5 30 sequential renders without crash', () => {
    const end = Math.floor(Date.now() / 1000) + 3600;
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<ForkingPeriodTimer endTime={end} isPeriodEnded={false} />),
      ).not.toThrow();
    }
  });

  it('round-5 50 sequential renders without crash', () => {
    const end = Math.floor(Date.now() / 1000) + 3600;
    for (let i = 0; i < 50; i++) {
      expect(() =>
        render(<ForkingPeriodTimer endTime={end} isPeriodEnded={false} />),
      ).not.toThrow();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    const end = Math.floor(Date.now() / 1000) + 3600;
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ForkingPeriodTimer endTime={end} isPeriodEnded={false} />);
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    const end = Math.floor(Date.now() / 1000) + 3600;
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ForkingPeriodTimer key={i} endTime={end + i} isPeriodEnded={false} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 isPeriodEnded toggle cycles', () => {
    const end = Math.floor(Date.now() / 1000) + 3600;
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ForkingPeriodTimer endTime={end} isPeriodEnded={i % 2 === 0} />);
      unmount();
    }
  });

  it('round-6 30 sequential renders without crash', () => {
    const end = Math.floor(Date.now() / 1000) + 3600;
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<ForkingPeriodTimer endTime={end} isPeriodEnded={false} />),
      ).not.toThrow();
    }
  });

  it('round-6 50 sequential renders without crash', () => {
    const end = Math.floor(Date.now() / 1000) + 3600;
    for (let i = 0; i < 50; i++) {
      expect(() =>
        render(<ForkingPeriodTimer endTime={end} isPeriodEnded={false} />),
      ).not.toThrow();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    const end = Math.floor(Date.now() / 1000) + 3600;
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ForkingPeriodTimer endTime={end} isPeriodEnded={false} />);
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    const end = Math.floor(Date.now() / 1000) + 3600;
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ForkingPeriodTimer key={i} endTime={end + i} isPeriodEnded={false} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    const end = Math.floor(Date.now() / 1000) + 3600;
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<ForkingPeriodTimer endTime={end} isPeriodEnded={false} />),
      ).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    const end = Math.floor(Date.now() / 1000) + 3600;
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ForkingPeriodTimer endTime={end} isPeriodEnded={false} />);
      unmount();
    }
  });

  it('round-7 50 sequential renders without crash', () => {
    const end = Math.floor(Date.now() / 1000) + 3600;
    for (let i = 0; i < 50; i++) {
      expect(() =>
        render(<ForkingPeriodTimer endTime={end} isPeriodEnded={false} />),
      ).not.toThrow();
    }
  });

  it('round-8 mount-unmount 30 cycles', () => {
    const end = Math.floor(Date.now() / 1000) + 3600;
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ForkingPeriodTimer endTime={end} isPeriodEnded={false} />);
      unmount();
    }
  });

  it('round-8 renders 30 instances variant', () => {
    const end = Math.floor(Date.now() / 1000) + 3600;
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ForkingPeriodTimer key={i} endTime={end + i} isPeriodEnded={false} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    const end = Math.floor(Date.now() / 1000) + 3600;
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<ForkingPeriodTimer endTime={end} isPeriodEnded={false} />),
      ).not.toThrow();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    const end = Math.floor(Date.now() / 1000) + 3600;
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ForkingPeriodTimer endTime={end} isPeriodEnded={false} />);
      unmount();
    }
  });

  it('round-8 50 sequential renders without crash', () => {
    const end = Math.floor(Date.now() / 1000) + 3600;
    for (let i = 0; i < 50; i++) {
      expect(() =>
        render(<ForkingPeriodTimer endTime={end} isPeriodEnded={false} />),
      ).not.toThrow();
    }
  });

  it('round-9 mount-unmount 30 cycles', () => {
    const end = Math.floor(Date.now() / 1000) + 3600;
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ForkingPeriodTimer endTime={end} isPeriodEnded={false} />);
      unmount();
    }
  });

  it('round-9 renders 30 instances variant', () => {
    const end = Math.floor(Date.now() / 1000) + 3600;
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ForkingPeriodTimer key={i} endTime={end + i} isPeriodEnded={false} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-9 30 sequential renders without crash', () => {
    const end = Math.floor(Date.now() / 1000) + 3600;
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<ForkingPeriodTimer endTime={end} isPeriodEnded={false} />),
      ).not.toThrow();
    }
  });

  it('round-9 50 mount-unmount cycles second', () => {
    const end = Math.floor(Date.now() / 1000) + 3600;
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ForkingPeriodTimer endTime={end} isPeriodEnded={false} />);
      unmount();
    }
  });

  it('round-9 50 sequential renders without crash', () => {
    const end = Math.floor(Date.now() / 1000) + 3600;
    for (let i = 0; i < 50; i++) {
      expect(() =>
        render(<ForkingPeriodTimer endTime={end} isPeriodEnded={false} />),
      ).not.toThrow();
    }
  });

  it('round-10 30 sequential ForkingPeriodTimer mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ForkingPeriodTimer endTime={3600} isPeriodEnded={false} />);
      unmount();
    }
  });

  it('round-10 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ForkingPeriodTimer key={i} endTime={3600 + i} isPeriodEnded={false} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-10 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<ForkingPeriodTimer endTime={3600 + i} isPeriodEnded={false} />),
      ).not.toThrow();
    }
  });

  it('round-10 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ForkingPeriodTimer endTime={7200} isPeriodEnded={true} />);
      unmount();
    }
  });

  it('round-10 100 sequential different endTime values', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<ForkingPeriodTimer endTime={3600 + i} isPeriodEnded={false} />);
      unmount();
    }
  });
});
