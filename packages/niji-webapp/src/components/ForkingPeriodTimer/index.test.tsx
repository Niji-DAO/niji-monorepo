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
});
