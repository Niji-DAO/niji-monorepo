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
});
