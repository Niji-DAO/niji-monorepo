import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../NavBarButton', () => {
  const NavBarButtonStyle = {
    DELEGATE_BACK: 'back',
    DELEGATE_SECONDARY: 'secondary',
    DELEGATE_DISABLED: 'disabled',
  };
  const NavBarButton = ({
    buttonText,
    buttonStyle,
    onClick,
    disabled,
  }: {
    buttonText: React.ReactNode;
    buttonStyle: string;
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    disabled?: boolean;
  }) => (
    <button data-style={buttonStyle} disabled={disabled} onClick={onClick}>
      {buttonText}
    </button>
  );
  return {
    default: NavBarButton,
    NavBarButtonStyle,
  };
});

import ModalBottomButtonRow from './index';

describe('ModalBottomButtonRow', () => {
  it('renders prev + next button text', () => {
    const { container } = render(
      <ModalBottomButtonRow
        onPrevBtnClick={() => {}}
        onNextBtnClick={() => {}}
        prevBtnText="Back"
        nextBtnText="Next"
      />,
    );
    const buttons = container.querySelectorAll('button');
    expect(buttons[0]?.textContent).toBe('Back');
    expect(buttons[1]?.textContent).toBe('Next');
  });

  it('next button uses DELEGATE_SECONDARY by default', () => {
    const { container } = render(
      <ModalBottomButtonRow
        onPrevBtnClick={() => {}}
        onNextBtnClick={() => {}}
        prevBtnText="x"
        nextBtnText="y"
      />,
    );
    expect(container.querySelectorAll('button')[1]?.getAttribute('data-style')).toBe('secondary');
  });

  it('next button uses DELEGATE_DISABLED when isNextBtnDisabled=true', () => {
    const { container } = render(
      <ModalBottomButtonRow
        onPrevBtnClick={() => {}}
        onNextBtnClick={() => {}}
        prevBtnText="x"
        nextBtnText="y"
        isNextBtnDisabled
      />,
    );
    const next = container.querySelectorAll('button')[1];
    expect(next?.getAttribute('data-style')).toBe('disabled');
    expect(next?.disabled).toBe(true);
  });

  it('fires onPrevBtnClick when prev is clicked', () => {
    const onPrev = vi.fn();
    const { container } = render(
      <ModalBottomButtonRow
        onPrevBtnClick={onPrev}
        onNextBtnClick={() => {}}
        prevBtnText="x"
        nextBtnText="y"
      />,
    );
    fireEvent.click(container.querySelectorAll('button')[0]);
    expect(onPrev).toHaveBeenCalledTimes(1);
  });

  it('fires onNextBtnClick when next is clicked', () => {
    const onNext = vi.fn();
    const { container } = render(
      <ModalBottomButtonRow
        onPrevBtnClick={() => {}}
        onNextBtnClick={onNext}
        prevBtnText="x"
        nextBtnText="y"
      />,
    );
    fireEvent.click(container.querySelectorAll('button')[1]);
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});
