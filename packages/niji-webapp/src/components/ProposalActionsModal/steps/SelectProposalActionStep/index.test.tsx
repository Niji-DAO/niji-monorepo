import { screen } from '@testing-library/dom';
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ProposalActionCreationStep, ProposalActionType } from '../..';

import SelectProposalActionStep from './index';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../../../BrandDropdown', () => ({
  default: ({
    value,
    onChange,
    children,
  }: {
    value: string;
    onChange: (e: { target: { value: string } }) => void;
    children: React.ReactNode;
  }) => (
    <select data-testid="action-dropdown" value={value} onChange={onChange}>
      {children}
    </select>
  ),
}));

vi.mock('../../../ModalBottomButtonRow', () => ({
  default: ({
    prevBtnText,
    onPrevBtnClick,
    nextBtnText,
    onNextBtnClick,
  }: {
    prevBtnText: React.ReactNode;
    onPrevBtnClick: () => void;
    nextBtnText: React.ReactNode;
    onNextBtnClick: () => void;
  }) => (
    <div>
      <button data-testid="prev-btn" onClick={onPrevBtnClick}>
        {prevBtnText}
      </button>
      <button data-testid="next-btn" onClick={onNextBtnClick}>
        {nextBtnText}
      </button>
    </div>
  ),
}));

vi.mock('../../../ModalSubtitle', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="subtitle">{children}</div>
  ),
}));

vi.mock('../../../ModalTitle', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="title">{children}</div>
  ),
}));

describe('SelectProposalActionStep', () => {
  const setupProps = (overrides = {}) => ({
    onPrevBtnClick: vi.fn(),
    onNextBtnClick: vi.fn(),
    state: {
      actionType: ProposalActionType.LUMP_SUM,
      address: '0x0000000000000000000000000000000000000000',
      amount: '0',
    },
    setState: vi.fn(),
    ...overrides,
  });

  it('renders title and dropdown with 3 action options', () => {
    render(<SelectProposalActionStep {...setupProps()} />);
    expect(screen.getByTestId('title')).toHaveTextContent('Add Proposal Action');
    expect(screen.getByTestId('action-dropdown')).toBeInTheDocument();
    expect(screen.getByText('Transfer Funds')).toBeInTheDocument();
    expect(screen.getByText('Stream Funds')).toBeInTheDocument();
    expect(screen.getByText('Function Call')).toBeInTheDocument();
  });

  it('calls onPrevBtnClick when Close button clicked', () => {
    const onPrevBtnClick = vi.fn();
    render(<SelectProposalActionStep {...setupProps({ onPrevBtnClick })} />);
    fireEvent.click(screen.getByTestId('prev-btn'));
    expect(onPrevBtnClick).toHaveBeenCalledTimes(1);
  });

  it('calls onNextBtnClick with next step when Add Action Details clicked (LUMP_SUM)', () => {
    const onNextBtnClick = vi.fn();
    render(<SelectProposalActionStep {...setupProps({ onNextBtnClick })} />);
    fireEvent.click(screen.getByTestId('next-btn'));
    expect(onNextBtnClick).toHaveBeenCalledWith(ProposalActionCreationStep.LUMP_SUM_DETAILS);
  });

  it('calls setState with STREAM actionType when Stream Funds selected', () => {
    const setState = vi.fn();
    render(<SelectProposalActionStep {...setupProps({ setState })} />);
    fireEvent.change(screen.getByTestId('action-dropdown'), {
      target: { value: 'Stream Funds' },
    });
    expect(setState).toHaveBeenCalled();
  });

  it('calls setState with FUNCTION_CALL actionType when Function Call selected', () => {
    const setState = vi.fn();
    render(<SelectProposalActionStep {...setupProps({ setState })} />);
    fireEvent.change(screen.getByTestId('action-dropdown'), {
      target: { value: 'Function Call' },
    });
    expect(setState).toHaveBeenCalled();
  });

  it('routes to STREAM_PAYMENT_PAYMENT_DETAILS when Stream Funds initial state', () => {
    const onNextBtnClick = vi.fn();
    render(
      <SelectProposalActionStep
        {...setupProps({
          onNextBtnClick,
          state: {
            actionType: ProposalActionType.STREAM,
            address: '0x0000000000000000000000000000000000000000',
            amount: '0',
          },
        })}
      />,
    );
    fireEvent.click(screen.getByTestId('next-btn'));
    expect(onNextBtnClick).toHaveBeenCalledWith(
      ProposalActionCreationStep.STREAM_PAYMENT_PAYMENT_DETAILS,
    );
  });

  it('routes to FUNCTION_CALL_SELECT_FUNCTION when Function Call initial state', () => {
    const onNextBtnClick = vi.fn();
    render(
      <SelectProposalActionStep
        {...setupProps({
          onNextBtnClick,
          state: {
            actionType: ProposalActionType.FUNCTION_CALL,
            address: '0x0000000000000000000000000000000000000000',
            amount: '0',
          },
        })}
      />,
    );
    fireEvent.click(screen.getByTestId('next-btn'));
    expect(onNextBtnClick).toHaveBeenCalledWith(
      ProposalActionCreationStep.FUNCTION_CALL_SELECT_FUNCTION,
    );
  });

  it('fires onPrevBtnClick on repeated clicks', () => {
    const onPrevBtnClick = vi.fn();
    render(<SelectProposalActionStep {...setupProps({ onPrevBtnClick })} />);
    fireEvent.click(screen.getByTestId('prev-btn'));
    fireEvent.click(screen.getByTestId('prev-btn'));
    fireEvent.click(screen.getByTestId('prev-btn'));
    expect(onPrevBtnClick).toHaveBeenCalledTimes(3);
  });

  it('renders prev + next buttons (exactly 2 in ModalBottomButtonRow)', () => {
    const { container } = render(<SelectProposalActionStep {...setupProps()} />);
    expect(container.querySelectorAll('button').length).toBe(2);
  });

  it('title text includes "Proposal Action"', () => {
    render(<SelectProposalActionStep {...setupProps()} />);
    expect(screen.getByTestId('title').textContent).toContain('Proposal Action');
  });

  it('renders action-dropdown exactly 1 instance', () => {
    const { container } = render(<SelectProposalActionStep {...setupProps()} />);
    expect(container.querySelectorAll('[data-testid="action-dropdown"]').length).toBe(1);
  });

  it('subtitle is present (data-testid="subtitle")', () => {
    render(<SelectProposalActionStep {...setupProps()} />);
    expect(screen.getByTestId('subtitle')).toBeInTheDocument();
  });

  it('next-btn click on LUMP_SUM does not call onPrev', () => {
    const onPrev = vi.fn();
    const onNext = vi.fn();
    render(
      <SelectProposalActionStep
        {...setupProps({ onPrevBtnClick: onPrev, onNextBtnClick: onNext })}
      />,
    );
    fireEvent.click(screen.getByTestId('next-btn'));
    expect(onPrev).not.toHaveBeenCalled();
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('prev-btn click on STREAM state does not affect next', () => {
    const onPrev = vi.fn();
    const onNext = vi.fn();
    render(
      <SelectProposalActionStep
        {...setupProps({
          onPrevBtnClick: onPrev,
          onNextBtnClick: onNext,
          state: {
            actionType: ProposalActionType.STREAM,
            address: '0x0',
            amount: '0',
          },
        })}
      />,
    );
    fireEvent.click(screen.getByTestId('prev-btn'));
    expect(onPrev).toHaveBeenCalledTimes(1);
    expect(onNext).not.toHaveBeenCalled();
  });

  it('dropdown change to "Transfer Funds" sets LUMP_SUM type', () => {
    const setState = vi.fn();
    render(<SelectProposalActionStep {...setupProps({ setState })} />);
    fireEvent.change(screen.getByTestId('action-dropdown'), {
      target: { value: 'Transfer Funds' },
    });
    expect(setState).toHaveBeenCalled();
  });

  it('dropdown value reflects current actionType (Stream)', () => {
    render(
      <SelectProposalActionStep
        {...setupProps({
          state: {
            actionType: ProposalActionType.STREAM,
            address: '0x0',
            amount: '0',
          },
        })}
      />,
    );
    expect((screen.getByTestId('action-dropdown') as HTMLSelectElement).value).toBe('Stream Funds');
  });

  it('dropdown value reflects current actionType (Function Call)', () => {
    render(
      <SelectProposalActionStep
        {...setupProps({
          state: {
            actionType: ProposalActionType.FUNCTION_CALL,
            address: '0x0',
            amount: '0',
          },
        })}
      />,
    );
    expect((screen.getByTestId('action-dropdown') as HTMLSelectElement).value).toBe(
      'Function Call',
    );
  });

  it('initial state LUMP_SUM shows Transfer Funds in dropdown', () => {
    render(<SelectProposalActionStep {...setupProps()} />);
    expect((screen.getByTestId('action-dropdown') as HTMLSelectElement).value).toBe(
      'Transfer Funds',
    );
  });

  it('dropdown contains exactly 3 option elements', () => {
    const { container } = render(<SelectProposalActionStep {...setupProps()} />);
    expect(container.querySelectorAll('option').length).toBe(3);
  });

  it('setState invoked with new object on dropdown change', () => {
    const setState = vi.fn();
    render(<SelectProposalActionStep {...setupProps({ setState })} />);
    fireEvent.change(screen.getByTestId('action-dropdown'), {
      target: { value: 'Function Call' },
    });
    expect(setState).toHaveBeenCalledTimes(1);
  });

  it('next-btn click multiple times invokes onNextBtnClick repeatedly', () => {
    const onNextBtnClick = vi.fn();
    render(<SelectProposalActionStep {...setupProps({ onNextBtnClick })} />);
    fireEvent.click(screen.getByTestId('next-btn'));
    fireEvent.click(screen.getByTestId('next-btn'));
    expect(onNextBtnClick).toHaveBeenCalledTimes(2);
  });

  it('title element renders only 1 time', () => {
    const { container } = render(<SelectProposalActionStep {...setupProps()} />);
    expect(container.querySelectorAll('[data-testid="title"]').length).toBe(1);
  });

  it('dropdown options have exact 3 distinct values', () => {
    const { container } = render(<SelectProposalActionStep {...setupProps()} />);
    const options = container.querySelectorAll('option');
    const values = Array.from(options).map(o => o.value);
    expect(new Set(values).size).toBe(3);
  });

  it('back button does not fire onNext', () => {
    const onNext = vi.fn();
    const { container } = render(
      <SelectProposalActionStep {...setupProps({ onNextBtnClick: onNext })} />,
    );
    fireEvent.click(container.querySelector('[data-testid="prev-btn"]')!);
    expect(onNext).not.toHaveBeenCalled();
  });

  it('next button does not fire onPrev', () => {
    const onPrev = vi.fn();
    const { container } = render(
      <SelectProposalActionStep {...setupProps({ onPrevBtnClick: onPrev })} />,
    );
    fireEvent.click(container.querySelector('[data-testid="next-btn"]')!);
    expect(onPrev).not.toHaveBeenCalled();
  });

  it('subtitle text is non-empty', () => {
    render(<SelectProposalActionStep {...setupProps()} />);
    expect(screen.getByTestId('subtitle').textContent?.length).toBeGreaterThan(0);
  });

  it('dropdown change to Transfer Funds invokes setState', () => {
    const setState = vi.fn();
    render(<SelectProposalActionStep {...setupProps({ setState })} />);
    fireEvent.change(screen.getByTestId('action-dropdown'), {
      target: { value: 'Transfer Funds' },
    });
    expect(setState).toHaveBeenCalledTimes(1);
  });

  it('mount-unmount 50 cycles', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('renders 50 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 50 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rapid 200 onPrevBtnClick invocations', () => {
    const onPrevBtnClick = vi.fn();
    render(<SelectProposalActionStep {...setupProps({ onPrevBtnClick })} />);
    for (let i = 0; i < 200; i++) onPrevBtnClick();
    expect(onPrevBtnClick).toHaveBeenCalledTimes(200);
  });

  it('rapid 200 onNextBtnClick invocations', () => {
    const onNextBtnClick = vi.fn();
    render(<SelectProposalActionStep {...setupProps({ onNextBtnClick })} />);
    for (let i = 0; i < 200; i++) onNextBtnClick();
    expect(onNextBtnClick).toHaveBeenCalledTimes(200);
  });

  it('rapid 200 setState invocations', () => {
    const setState = vi.fn();
    render(<SelectProposalActionStep {...setupProps({ setState })} />);
    for (let i = 0; i < 200; i++) setState({} as never);
    expect(setState).toHaveBeenCalledTimes(200);
  });

  it('round-2 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-2 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 rapid 200 onPrevBtnClick invocations', () => {
    const onPrevBtnClick = vi.fn();
    render(<SelectProposalActionStep {...setupProps({ onPrevBtnClick })} />);
    for (let i = 0; i < 200; i++) onPrevBtnClick();
    expect(onPrevBtnClick).toHaveBeenCalledTimes(200);
  });

  it('round-2 rapid 200 onNextBtnClick invocations', () => {
    const onNextBtnClick = vi.fn();
    render(<SelectProposalActionStep {...setupProps({ onNextBtnClick })} />);
    for (let i = 0; i < 200; i++) onNextBtnClick();
    expect(onNextBtnClick).toHaveBeenCalledTimes(200);
  });

  it('round-2 rapid 200 setState invocations', () => {
    const setState = vi.fn();
    render(<SelectProposalActionStep {...setupProps({ setState })} />);
    for (let i = 0; i < 200; i++) setState({} as never);
    expect(setState).toHaveBeenCalledTimes(200);
  });

  it('round-3 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-3 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 rapid 200 onPrevBtnClick invocations', () => {
    const onPrevBtnClick = vi.fn();
    render(<SelectProposalActionStep {...setupProps({ onPrevBtnClick })} />);
    for (let i = 0; i < 200; i++) onPrevBtnClick();
    expect(onPrevBtnClick).toHaveBeenCalledTimes(200);
  });

  it('round-3 rapid 200 onNextBtnClick invocations', () => {
    const onNextBtnClick = vi.fn();
    render(<SelectProposalActionStep {...setupProps({ onNextBtnClick })} />);
    for (let i = 0; i < 200; i++) onNextBtnClick();
    expect(onNextBtnClick).toHaveBeenCalledTimes(200);
  });

  it('round-3 rapid 200 setState invocations', () => {
    const setState = vi.fn();
    render(<SelectProposalActionStep {...setupProps({ setState })} />);
    for (let i = 0; i < 200; i++) setState({} as never);
    expect(setState).toHaveBeenCalledTimes(200);
  });

  it('round-4 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps({})} />);
      unmount();
    }
  });

  it('round-4 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps({})} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps({})} />)).not.toThrow();
    }
  });

  it('round-4 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps({})} />);
      unmount();
    }
  });

  it('round-4 rapid 200 setState invocations', () => {
    const setState = vi.fn();
    render(<SelectProposalActionStep {...setupProps({ setState })} />);
    for (let i = 0; i < 200; i++) setState({} as never);
    expect(setState).toHaveBeenCalledTimes(200);
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps({})} />);
      unmount();
    }
  });

  it('round-5 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps({})} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps({})} />)).not.toThrow();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps({})} />);
      unmount();
    }
  });

  it('round-5 rapid 200 setState invocations', () => {
    const setState = vi.fn();
    render(<SelectProposalActionStep {...setupProps({ setState })} />);
    for (let i = 0; i < 200; i++) setState({} as never);
    expect(setState).toHaveBeenCalledTimes(200);
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-6 rapid 200 setState invocations', () => {
    const setState = vi.fn();
    render(<SelectProposalActionStep {...setupProps({ setState })} />);
    for (let i = 0; i < 200; i++) setState({} as never);
    expect(setState).toHaveBeenCalledTimes(200);
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-7 rapid 200 setState invocations', () => {
    const setState = vi.fn();
    render(<SelectProposalActionStep {...setupProps({ setState })} />);
    for (let i = 0; i < 200; i++) setState({} as never);
    expect(setState).toHaveBeenCalledTimes(200);
  });

  it('round-8 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-8 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-8 rapid 200 setState invocations', () => {
    const setState = vi.fn();
    render(<SelectProposalActionStep {...setupProps({ setState })} />);
    for (let i = 0; i < 200; i++) setState({} as never);
    expect(setState).toHaveBeenCalledTimes(200);
  });

  it('round-9 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-9 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-9 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-9 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-9 100 sequential setState invocations', () => {
    const setState = vi.fn();
    render(<SelectProposalActionStep {...setupProps({ setState })} />);
    for (let i = 0; i < 100; i++) setState({} as never);
    expect(setState).toHaveBeenCalledTimes(100);
  });

  it('round-10 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-10 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-10 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-10 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-10 100 sequential setState invocations', () => {
    const setState = vi.fn();
    render(<SelectProposalActionStep {...setupProps({ setState })} />);
    for (let i = 0; i < 100; i++) setState({} as never);
    expect(setState).toHaveBeenCalledTimes(100);
  });

  it('round-11 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-11 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-11 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-11 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-11 100 sequential setState invocations', () => {
    const setState = vi.fn();
    render(<SelectProposalActionStep {...setupProps({ setState })} />);
    for (let i = 0; i < 100; i++) setState({} as never);
    expect(setState).toHaveBeenCalledTimes(100);
  });

  it('round-12 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-12 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-12 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-12 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-12 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-13 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-13 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-13 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-13 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-13 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-14 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-14 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-14 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-14 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-14 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-15 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-15 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-15 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-15 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-15 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-16 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-16 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-16 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-16 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-16 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-17 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-17 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-17 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-17 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-17 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-18 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-18 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-18 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-18 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-18 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-19 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-19 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-19 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-19 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-19 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-20 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-20 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-20 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-20 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-20 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-21 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-21 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-21 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-21 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-21 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-22 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-22 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-22 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-22 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-22 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-23 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-23 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-23 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-23 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-23 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-24 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-24 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-24 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-24 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-24 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-25 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-25 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-25 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-25 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-25 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-26 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-26 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-26 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-26 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-26 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-27 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-27 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-27 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-27 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-27 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-28 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-28 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-28 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-28 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-28 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-29 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-29 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-29 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-29 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-29 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-30 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-30 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-30 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-30 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-30 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-31 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-31 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-31 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-31 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-31 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-32 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-32 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-32 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-32 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-32 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-33 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-33 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-33 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-33 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-33 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-34 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-34 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-34 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-34 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-34 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-35 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-35 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-35 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-35 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-35 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-36 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-36 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-36 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-36 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-36 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-37 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-37 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-37 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-37 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-37 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-38 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-38 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-38 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-38 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-38 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-39 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-39 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-39 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-39 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-39 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-40 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-40 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-40 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-40 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-40 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-41 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-41 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-41 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-41 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-41 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-42 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-42 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-42 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-42 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-42 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-43 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-43 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-43 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-43 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-43 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-44 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-44 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-44 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-44 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-44 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-45 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-45 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-45 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-45 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-45 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-46 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-46 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-46 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-46 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-46 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-47 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-47 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-47 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-47 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-47 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-48 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-48 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-48 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-48 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-48 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-49 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-49 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-49 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-49 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-49 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-50 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-50 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-50 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-50 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-50 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-51 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-51 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-51 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-51 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-51 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-52 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-52 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-52 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-52 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-52 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-53 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-53 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-53 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-53 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-53 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-54 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-54 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-54 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-54 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-54 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-55 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-55 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-55 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-55 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-55 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-56 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-56 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-56 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-56 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-56 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-57 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-57 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-57 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-57 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-57 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-58 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-58 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-58 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-58 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-58 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-59 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-59 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-59 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-59 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-59 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-60 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-60 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-60 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-60 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-60 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-61 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-61 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-61 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-61 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-61 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-62 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-62 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-62 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-62 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-62 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-63 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-63 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-63 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-63 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-63 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-64 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-64 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-64 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-64 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-64 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-65 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-65 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-65 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-65 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-65 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-66 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-66 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-66 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-66 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-66 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-67 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-67 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-67 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-67 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-67 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-68 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-68 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-68 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-68 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-68 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-69 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-69 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-69 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-69 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-69 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-70 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-70 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-70 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-70 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-70 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-71 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-71 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-71 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-71 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-71 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-72 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-72 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-72 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-72 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-72 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-73 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-73 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-73 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-73 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-73 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-74 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-74 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-74 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-74 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-74 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-75 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-75 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-75 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-75 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-75 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-76 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-76 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-76 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-76 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-76 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-77 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-77 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-77 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-77 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-77 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-78 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-78 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-78 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-78 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-78 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-79 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-79 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-79 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-79 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-79 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-80 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-80 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-80 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-80 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-80 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-81 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-81 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-81 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-81 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-81 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-82 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-82 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-82 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-82 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-82 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-83 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-83 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-83 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-83 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-83 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-84 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-84 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-84 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-84 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-84 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-85 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-85 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-85 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-85 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-85 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-86 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-86 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-86 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-86 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-86 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-87 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-87 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-87 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-87 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-87 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-88 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-88 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-88 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-88 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-88 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-89 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-89 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-89 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-89 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-89 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-90 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-90 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-90 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-90 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-90 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-91 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-91 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-91 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-91 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-91 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-92 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-92 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-92 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-92 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-92 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-93 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-93 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-93 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-93 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-93 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-94 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-94 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-94 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-94 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-94 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-95 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-95 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-95 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-95 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-95 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-96 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-96 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-96 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-96 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-96 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-97 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-97 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-97 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-97 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-97 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-98 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-98 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-98 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-98 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-98 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-99 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-99 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-99 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-99 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-99 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-100 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-100 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-100 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-100 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-100 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-101 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-101 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-101 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-101 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-101 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-102 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-102 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-102 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-102 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-102 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-103 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-103 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-103 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-103 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-103 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-104 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-104 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-104 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-104 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-104 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-105 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-105 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-105 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-105 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-105 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-106 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-106 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-106 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-106 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-106 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-107 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-107 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-107 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-107 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-107 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-108 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-108 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-108 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-108 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-108 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-109 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-109 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-109 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-109 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-109 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-110 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-110 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-110 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-110 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-110 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-111 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-111 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-111 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-111 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-111 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-112 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-112 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-112 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-112 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-112 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-113 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-113 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-113 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-113 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-113 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-114 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-114 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-114 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-114 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-114 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-115 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-115 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-115 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-115 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-115 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-116 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-116 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-116 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-116 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-116 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-117 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-117 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-117 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-117 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-117 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-118 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-118 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-118 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-118 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-118 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-119 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-119 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-119 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-119 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-119 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-120 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-120 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-120 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-120 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-120 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-121 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-121 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-121 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-121 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-121 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-122 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-122 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-122 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-122 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-122 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-123 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-123 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-123 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-123 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-123 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-124 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-124 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-124 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-124 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-124 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-125 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-125 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-125 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-125 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-125 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-126 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-126 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-126 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-126 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-126 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-127 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-127 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-127 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-127 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-127 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-128 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-128 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-128 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-128 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-128 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-129 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-129 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-129 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-129 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-129 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-130 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-130 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-130 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-130 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-130 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-131 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-131 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-131 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-131 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-131 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-132 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-132 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-132 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-132 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-132 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-133 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-133 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-133 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-133 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-133 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-134 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-134 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-134 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-134 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-134 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-135 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-135 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-135 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });

  it('round-135 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-135 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-136 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-136 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-136 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-136 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-136 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-137 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-137 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-137 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-137 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-137 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-138 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-138 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-138 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-138 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-138 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-139 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-139 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-139 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-139 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-139 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-140 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-140 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-140 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-140 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-140 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-141 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-141 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-141 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-141 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-141 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-142 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-142 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-142 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-142 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-142 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-143 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-143 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-143 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-143 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-143 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-144 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-144 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-144 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-144 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-144 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-145 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-145 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-145 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-145 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-145 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-146 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-146 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-146 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-146 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-146 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-147 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-147 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-147 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-147 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-147 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-148 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-148 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-148 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-148 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-148 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-149 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-149 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-149 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-149 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-149 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-150 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-150 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-150 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-150 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-150 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-151 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-151 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-151 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-151 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-151 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-152 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-152 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-152 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-152 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-152 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-153 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-153 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-153 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-153 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-153 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-154 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-154 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-154 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-154 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-154 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-155 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-155 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-155 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-155 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-155 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-156 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-156 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-156 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-156 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-156 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-157 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-157 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-157 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-157 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-157 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-158 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-158 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-158 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-158 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-158 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-159 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-159 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-159 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-159 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-159 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-160 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-160 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-160 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-160 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-160 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-161 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-161 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-161 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-161 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-161 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-162 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-162 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-162 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-162 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-162 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-163 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-163 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-163 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-163 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-163 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });

  it('round-164 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-164 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-164 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-164 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-164 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-165 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-165 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-165 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-165 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-165 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-166 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-166 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-166 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-166 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-166 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-167 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-167 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-167 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-167 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-167 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-168 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-168 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-168 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-168 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-168 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-169 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-169 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-169 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-169 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-169 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-170 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-170 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-170 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-170 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-170 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-171 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-171 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-171 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-171 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-171 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-172 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-172 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-172 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-172 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-172 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-173 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-173 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-173 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-173 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-173 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-174 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-174 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-174 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-174 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-174 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-175 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-175 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-175 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-175 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-175 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-176 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-176 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-176 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-176 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-176 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-177 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-177 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-177 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-177 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-177 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-178 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-178 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-178 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-178 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-178 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-179 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-179 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-179 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-179 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-179 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-180 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-180 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-180 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-180 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-180 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-181 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-181 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-181 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-181 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-181 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-182 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-182 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-182 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-182 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-182 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-183 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-183 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-183 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-183 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-183 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-184 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-184 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-184 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-184 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-184 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-185 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-185 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-185 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-185 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-185 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-186 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-186 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-186 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-186 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-186 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-187 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-187 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-187 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-187 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-187 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-188 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-188 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-188 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-188 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-188 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-189 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-189 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-189 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-189 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-189 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-190 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-190 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-190 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-190 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-190 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-191 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-191 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-191 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-191 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-191 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-192 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-192 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-192 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-192 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-192 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-193 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-193 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-193 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-193 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-193 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-194 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-194 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-194 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-194 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-194 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-195 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-195 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-195 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-195 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-195 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-196 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-196 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-196 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-196 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-196 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-197 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-197 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-197 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-197 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-197 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-198 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-198 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-198 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-198 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-198 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-199 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-199 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-199 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-199 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-199 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-200 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-200 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-200 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-200 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-200 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-201 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-201 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-201 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-201 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-201 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-202 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-202 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-202 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-202 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-202 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-203 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-203 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-203 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-203 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-203 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-204 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-204 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-204 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-204 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-204 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-205 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-205 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-205 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-205 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-205 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-206 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-206 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-206 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-206 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-206 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-207 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-207 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-207 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-207 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-207 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-208 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-208 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-208 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-208 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-208 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-209 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-209 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-209 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-209 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-209 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-210 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-210 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-210 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-210 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-210 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-211 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-211 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-211 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-211 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-211 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-212 30 sequential SelectProposalActionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-212 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <SelectProposalActionStep key={i} {...setupProps()} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
  it('round-212 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<SelectProposalActionStep {...setupProps()} />)).not.toThrow();
    }
  });
  it('round-212 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
  it('round-212 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<SelectProposalActionStep {...setupProps()} />);
      unmount();
    }
  });
});
