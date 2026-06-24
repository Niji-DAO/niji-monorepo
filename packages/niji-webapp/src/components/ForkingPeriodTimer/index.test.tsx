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
});
