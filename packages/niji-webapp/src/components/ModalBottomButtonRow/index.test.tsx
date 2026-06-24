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

  it('prev button uses DELEGATE_BACK style', () => {
    const { container } = render(
      <ModalBottomButtonRow
        onPrevBtnClick={() => {}}
        onNextBtnClick={() => {}}
        prevBtnText="x"
        nextBtnText="y"
      />,
    );
    expect(container.querySelectorAll('button')[0]?.getAttribute('data-style')).toBe('back');
  });

  it('connects multiple clicks on prev independently', () => {
    const onPrev = vi.fn();
    const { container } = render(
      <ModalBottomButtonRow
        onPrevBtnClick={onPrev}
        onNextBtnClick={() => {}}
        prevBtnText="x"
        nextBtnText="y"
      />,
    );
    const prev = container.querySelectorAll('button')[0];
    fireEvent.click(prev);
    fireEvent.click(prev);
    fireEvent.click(prev);
    expect(onPrev).toHaveBeenCalledTimes(3);
  });

  it('connects multiple clicks on next independently', () => {
    const onNext = vi.fn();
    const { container } = render(
      <ModalBottomButtonRow
        onPrevBtnClick={() => {}}
        onNextBtnClick={onNext}
        prevBtnText="x"
        nextBtnText="y"
      />,
    );
    const next = container.querySelectorAll('button')[1];
    fireEvent.click(next);
    fireEvent.click(next);
    expect(onNext).toHaveBeenCalledTimes(2);
  });

  it('renders exactly 2 buttons (no extras)', () => {
    const { container } = render(
      <ModalBottomButtonRow
        onPrevBtnClick={() => {}}
        onNextBtnClick={() => {}}
        prevBtnText="x"
        nextBtnText="y"
      />,
    );
    expect(container.querySelectorAll('button').length).toBe(2);
  });

  it('renders long button text (200 chars)', () => {
    const long = 'a'.repeat(200);
    const { container } = render(
      <ModalBottomButtonRow
        onPrevBtnClick={() => {}}
        onNextBtnClick={() => {}}
        prevBtnText={long}
        nextBtnText="y"
      />,
    );
    expect(container.querySelectorAll('button')[0]?.textContent?.length).toBe(200);
  });

  it('isNextBtnDisabled=false renders next as non-disabled', () => {
    const { container } = render(
      <ModalBottomButtonRow
        onPrevBtnClick={() => {}}
        onNextBtnClick={() => {}}
        prevBtnText="x"
        nextBtnText="y"
        isNextBtnDisabled={false}
      />,
    );
    expect(container.querySelectorAll('button')[1]?.disabled).toBe(false);
  });

  it('disabled next button does not call onNextBtnClick on click', () => {
    const onNext = vi.fn();
    const { container } = render(
      <ModalBottomButtonRow
        onPrevBtnClick={() => {}}
        onNextBtnClick={onNext}
        prevBtnText="x"
        nextBtnText="y"
        isNextBtnDisabled
      />,
    );
    fireEvent.click(container.querySelectorAll('button')[1]);
    expect(onNext).not.toHaveBeenCalled();
  });

  it('prev button is never disabled (no disabled prop)', () => {
    const { container } = render(
      <ModalBottomButtonRow
        onPrevBtnClick={() => {}}
        onNextBtnClick={() => {}}
        prevBtnText="x"
        nextBtnText="y"
        isNextBtnDisabled
      />,
    );
    expect(container.querySelectorAll('button')[0]?.disabled).toBe(false);
  });

  it('renders ReactNode (JSX) as prev button text', () => {
    const { container } = render(
      <ModalBottomButtonRow
        onPrevBtnClick={() => {}}
        onNextBtnClick={() => {}}
        prevBtnText={<span data-testid="custom-prev">Custom Back</span>}
        nextBtnText="y"
      />,
    );
    expect(container.querySelector('[data-testid="custom-prev"]')?.textContent).toBe('Custom Back');
  });

  it('renders ReactNode (JSX) as next button text', () => {
    const { container } = render(
      <ModalBottomButtonRow
        onPrevBtnClick={() => {}}
        onNextBtnClick={() => {}}
        prevBtnText="x"
        nextBtnText={<strong data-testid="custom-next">Go</strong>}
      />,
    );
    expect(container.querySelector('[data-testid="custom-next"]')?.textContent).toBe('Go');
  });

  it('rerender from disabled to enabled updates next state', () => {
    const { container, rerender } = render(
      <ModalBottomButtonRow
        onPrevBtnClick={() => {}}
        onNextBtnClick={() => {}}
        prevBtnText="x"
        nextBtnText="y"
        isNextBtnDisabled={true}
      />,
    );
    expect(container.querySelectorAll('button')[1]?.disabled).toBe(true);
    rerender(
      <ModalBottomButtonRow
        onPrevBtnClick={() => {}}
        onNextBtnClick={() => {}}
        prevBtnText="x"
        nextBtnText="y"
        isNextBtnDisabled={false}
      />,
    );
    expect(container.querySelectorAll('button')[1]?.disabled).toBe(false);
  });

  it('rerender updates prev button text', () => {
    const { container, rerender } = render(
      <ModalBottomButtonRow
        onPrevBtnClick={() => {}}
        onNextBtnClick={() => {}}
        prevBtnText="Back1"
        nextBtnText="Next"
      />,
    );
    expect(container.querySelectorAll('button')[0]?.textContent).toBe('Back1');
    rerender(
      <ModalBottomButtonRow
        onPrevBtnClick={() => {}}
        onNextBtnClick={() => {}}
        prevBtnText="Back2"
        nextBtnText="Next"
      />,
    );
    expect(container.querySelectorAll('button')[0]?.textContent).toBe('Back2');
  });

  it('unicode prev text renders verbatim', () => {
    const { container } = render(
      <ModalBottomButtonRow
        onPrevBtnClick={() => {}}
        onNextBtnClick={() => {}}
        prevBtnText="戻る"
        nextBtnText="次へ"
      />,
    );
    expect(container.querySelectorAll('button')[0]?.textContent).toBe('戻る');
    expect(container.querySelectorAll('button')[1]?.textContent).toBe('次へ');
  });

  it('numeric children render as string in button text', () => {
    const { container } = render(
      <ModalBottomButtonRow
        onPrevBtnClick={() => {}}
        onNextBtnClick={() => {}}
        prevBtnText={123 as never}
        nextBtnText={456 as never}
      />,
    );
    expect(container.querySelectorAll('button')[0]?.textContent).toBe('123');
    expect(container.querySelectorAll('button')[1]?.textContent).toBe('456');
  });

  it('multiple instances render independently', () => {
    const { container } = render(
      <>
        <ModalBottomButtonRow
          onPrevBtnClick={() => {}}
          onNextBtnClick={() => {}}
          prevBtnText="A"
          nextBtnText="B"
        />
        <ModalBottomButtonRow
          onPrevBtnClick={() => {}}
          onNextBtnClick={() => {}}
          prevBtnText="C"
          nextBtnText="D"
        />
      </>,
    );
    expect(container.querySelectorAll('button').length).toBe(4);
  });

  it('next disabled with style data-style="disabled"', () => {
    const { container } = render(
      <ModalBottomButtonRow
        onPrevBtnClick={() => {}}
        onNextBtnClick={() => {}}
        prevBtnText="x"
        nextBtnText="y"
        isNextBtnDisabled={true}
      />,
    );
    const next = container.querySelectorAll('button')[1];
    expect(next?.getAttribute('data-style')).toBe('disabled');
  });

  it('isNextBtnDisabled=undefined defaults to enabled secondary', () => {
    const { container } = render(
      <ModalBottomButtonRow
        onPrevBtnClick={() => {}}
        onNextBtnClick={() => {}}
        prevBtnText="x"
        nextBtnText="y"
      />,
    );
    const next = container.querySelectorAll('button')[1];
    expect(next?.disabled).toBe(false);
    expect(next?.getAttribute('data-style')).toBe('secondary');
  });

  it('prev button data-style is back regardless of isNextBtnDisabled', () => {
    const { container } = render(
      <ModalBottomButtonRow
        onPrevBtnClick={() => {}}
        onNextBtnClick={() => {}}
        prevBtnText="x"
        nextBtnText="y"
        isNextBtnDisabled={true}
      />,
    );
    expect(container.querySelectorAll('button')[0]?.getAttribute('data-style')).toBe('back');
  });

  it('Fragment children in prevBtnText render correctly', () => {
    const { container } = render(
      <ModalBottomButtonRow
        onPrevBtnClick={() => {}}
        onNextBtnClick={() => {}}
        prevBtnText={
          <>
            <span data-testid="frag-a">A</span>
            <span data-testid="frag-b">B</span>
          </>
        }
        nextBtnText="y"
      />,
    );
    expect(container.querySelector('[data-testid="frag-a"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="frag-b"]')).not.toBeNull();
  });

  it('null prevBtnText renders empty button', () => {
    const { container } = render(
      <ModalBottomButtonRow
        onPrevBtnClick={() => {}}
        onNextBtnClick={() => {}}
        prevBtnText={null as never}
        nextBtnText="y"
      />,
    );
    expect(container.querySelectorAll('button')[0]?.textContent).toBe('');
  });

  it('long nextBtnText (200 chars) renders verbatim', () => {
    const long = 'b'.repeat(200);
    const { container } = render(
      <ModalBottomButtonRow
        onPrevBtnClick={() => {}}
        onNextBtnClick={() => {}}
        prevBtnText="x"
        nextBtnText={long}
      />,
    );
    expect(container.querySelectorAll('button')[1]?.textContent?.length).toBe(200);
  });
});
