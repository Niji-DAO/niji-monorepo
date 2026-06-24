import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../SolidColorBackgroundModal', () => ({
  default: ({ show, content }: { show: boolean; content: React.ReactNode }) =>
    show ? <div data-testid="solid-modal">{content}</div> : null,
}));

const makeStepMock = (testId: string) =>
  vi.fn(
    ({
      onNextBtnClick,
      onPrevBtnClick,
    }: {
      onNextBtnClick: (e?: number | { hash: string }) => void;
      onPrevBtnClick: () => void;
    }) => (
      <div data-testid={testId}>
        <button data-testid={`${testId}-next`} onClick={() => onNextBtnClick()} />
        <button data-testid={`${testId}-prev`} onClick={onPrevBtnClick} />
        <button data-testid={`${testId}-next-with-num`} onClick={() => onNextBtnClick(1)} />
        <button
          data-testid={`${testId}-next-with-tx`}
          onClick={() => onNextBtnClick({ hash: '0xtx' })}
        />
      </div>
    ),
  );

const selectStepMock = makeStepMock('select-action');
vi.mock('./steps/SelectProposalActionStep', () => ({
  default: (props: Parameters<typeof selectStepMock>[0]) => selectStepMock(props),
}));

const transferDetailsMock = makeStepMock('transfer-details');
vi.mock('./steps/TransferFundsDetailsStep', () => ({
  default: (props: Parameters<typeof transferDetailsMock>[0]) => transferDetailsMock(props),
  SupportedCurrency: { USDC: 'USDC', WETH: 'WETH' },
}));

const transferReviewMock = makeStepMock('transfer-review');
vi.mock('./steps/TransferFundsReviewStep', () => ({
  default: (props: Parameters<typeof transferReviewMock>[0]) => transferReviewMock(props),
}));

const functionSelectMock = makeStepMock('function-select');
vi.mock('./steps/FunctionCallSelectFunctionStep', () => ({
  default: (props: Parameters<typeof functionSelectMock>[0]) => functionSelectMock(props),
}));

const functionArgsMock = makeStepMock('function-args');
vi.mock('./steps/FunctionCallEnterArgsStep', () => ({
  default: (props: Parameters<typeof functionArgsMock>[0]) => functionArgsMock(props),
}));

const functionReviewMock = makeStepMock('function-review');
vi.mock('./steps/FunctionCallReviewStep', () => ({
  default: (props: Parameters<typeof functionReviewMock>[0]) => functionReviewMock(props),
}));

const streamPaymentMock = makeStepMock('stream-payment');
vi.mock('./steps/StreamPaymentsPaymentDetailsStep', () => ({
  default: (props: Parameters<typeof streamPaymentMock>[0]) => streamPaymentMock(props),
}));

const streamDateMock = makeStepMock('stream-date');
vi.mock('./steps/StreamPaymentsDateDetailsStep', () => ({
  default: (props: Parameters<typeof streamDateMock>[0]) => streamDateMock(props),
}));

const streamReviewMock = makeStepMock('stream-review');
vi.mock('./steps/StreamPaymentsReviewStep', () => ({
  default: (props: Parameters<typeof streamReviewMock>[0]) => streamReviewMock(props),
}));

import ProposalActionModal, { ProposalActionCreationStep } from './index';

const onActionAddMock = vi.fn();
const onDismissMock = vi.fn();

const baseProps = {
  onActionAdd: onActionAddMock,
  show: true,
  onDismiss: onDismissMock,
};

const resetState = () => {
  onActionAddMock.mockReset();
  onDismissMock.mockReset();
  [
    selectStepMock,
    transferDetailsMock,
    transferReviewMock,
    functionSelectMock,
    functionArgsMock,
    functionReviewMock,
    streamPaymentMock,
    streamDateMock,
    streamReviewMock,
  ].forEach(m => m.mockClear());
};

const advanceTo = (container: HTMLElement, step: ProposalActionCreationStep) => {
  const selectBtn = container.querySelector(
    '[data-testid="select-action-next-with-num"]',
  ) as HTMLButtonElement;
  selectStepMock.mockImplementationOnce(
    ({ onNextBtnClick }: { onNextBtnClick: (e?: number) => void }) => (
      <div data-testid="select-action">
        <button data-testid="advance" onClick={() => onNextBtnClick(step)} />
      </div>
    ),
  );
  return selectBtn;
};

beforeEach(() => {
  resetState();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('ProposalActionModal', () => {
  it('hides modal content when show=false', () => {
    const { container } = render(<ProposalActionModal {...baseProps} show={false} />);
    expect(container.querySelector('[data-testid="solid-modal"]')).toBeNull();
  });

  it('renders SelectProposalActionStep initially', () => {
    const { container } = render(<ProposalActionModal {...baseProps} />);
    expect(container.querySelector('[data-testid="select-action"]')).not.toBeNull();
  });

  it('SelectProposalActionStep onPrevBtnClick invokes onDismiss', () => {
    const { container } = render(<ProposalActionModal {...baseProps} />);
    const prevBtn = container.querySelector(
      '[data-testid="select-action-prev"]',
    ) as HTMLButtonElement;
    fireEvent.click(prevBtn);
    expect(onDismissMock).toHaveBeenCalled();
  });

  it('transitions to LUMP_SUM_DETAILS when numeric step passed', () => {
    selectStepMock.mockImplementationOnce(
      ({ onNextBtnClick }: { onNextBtnClick: (e?: number) => void }) => (
        <div data-testid="select-action">
          <button
            data-testid="goto-lump"
            onClick={() => onNextBtnClick(ProposalActionCreationStep.LUMP_SUM_DETAILS)}
          />
        </div>
      ),
    );
    const { container } = render(<ProposalActionModal {...baseProps} />);
    fireEvent.click(container.querySelector('[data-testid="goto-lump"]') as HTMLButtonElement);
    expect(container.querySelector('[data-testid="transfer-details"]')).not.toBeNull();
  });

  it('LUMP_SUM_REVIEW onNextBtnClick with tx calls onActionAdd', () => {
    selectStepMock.mockImplementationOnce(
      ({ onNextBtnClick }: { onNextBtnClick: (e?: number) => void }) => (
        <div data-testid="select-action">
          <button
            data-testid="goto-lump-review"
            onClick={() => onNextBtnClick(ProposalActionCreationStep.LUMP_SUM_REVIEW)}
          />
        </div>
      ),
    );
    const { container } = render(<ProposalActionModal {...baseProps} />);
    fireEvent.click(
      container.querySelector('[data-testid="goto-lump-review"]') as HTMLButtonElement,
    );
    const tx = container.querySelector(
      '[data-testid="transfer-review-next-with-tx"]',
    ) as HTMLButtonElement;
    fireEvent.click(tx);
    expect(onActionAddMock).toHaveBeenCalledWith({ hash: '0xtx' });
  });

  it('transitions to FUNCTION_CALL_SELECT_FUNCTION', () => {
    selectStepMock.mockImplementationOnce(
      ({ onNextBtnClick }: { onNextBtnClick: (e?: number) => void }) => (
        <div data-testid="select-action">
          <button
            data-testid="goto-fn"
            onClick={() => onNextBtnClick(ProposalActionCreationStep.FUNCTION_CALL_SELECT_FUNCTION)}
          />
        </div>
      ),
    );
    const { container } = render(<ProposalActionModal {...baseProps} />);
    fireEvent.click(container.querySelector('[data-testid="goto-fn"]') as HTMLButtonElement);
    expect(container.querySelector('[data-testid="function-select"]')).not.toBeNull();
  });

  it('FUNCTION_CALL_REVIEW onNextBtnClick with tx calls onActionAdd', () => {
    selectStepMock.mockImplementationOnce(
      ({ onNextBtnClick }: { onNextBtnClick: (e?: number) => void }) => (
        <div data-testid="select-action">
          <button
            data-testid="goto-fn-review"
            onClick={() => onNextBtnClick(ProposalActionCreationStep.FUNCTION_CALL_REVIEW)}
          />
        </div>
      ),
    );
    const { container } = render(<ProposalActionModal {...baseProps} />);
    fireEvent.click(container.querySelector('[data-testid="goto-fn-review"]') as HTMLButtonElement);
    fireEvent.click(
      container.querySelector('[data-testid="function-review-next-with-tx"]') as HTMLButtonElement,
    );
    expect(onActionAddMock).toHaveBeenCalledWith({ hash: '0xtx' });
  });

  it('transitions to STREAM_PAYMENT_PAYMENT_DETAILS', () => {
    selectStepMock.mockImplementationOnce(
      ({ onNextBtnClick }: { onNextBtnClick: (e?: number) => void }) => (
        <div data-testid="select-action">
          <button
            data-testid="goto-stream"
            onClick={() =>
              onNextBtnClick(ProposalActionCreationStep.STREAM_PAYMENT_PAYMENT_DETAILS)
            }
          />
        </div>
      ),
    );
    const { container } = render(<ProposalActionModal {...baseProps} />);
    fireEvent.click(container.querySelector('[data-testid="goto-stream"]') as HTMLButtonElement);
    expect(container.querySelector('[data-testid="stream-payment"]')).not.toBeNull();
  });

  it('STREAM_PAYMENT_REVIEW onNextBtnClick with tx calls onActionAdd', () => {
    selectStepMock.mockImplementationOnce(
      ({ onNextBtnClick }: { onNextBtnClick: (e?: number) => void }) => (
        <div data-testid="select-action">
          <button
            data-testid="goto-stream-review"
            onClick={() => onNextBtnClick(ProposalActionCreationStep.STREAM_PAYMENT_REVIEW)}
          />
        </div>
      ),
    );
    const { container } = render(<ProposalActionModal {...baseProps} />);
    fireEvent.click(
      container.querySelector('[data-testid="goto-stream-review"]') as HTMLButtonElement,
    );
    fireEvent.click(
      container.querySelector('[data-testid="stream-review-next-with-tx"]') as HTMLButtonElement,
    );
    expect(onActionAddMock).toHaveBeenCalledWith({ hash: '0xtx' });
  });

  it('LUMP_SUM_DETAILS prev returns to SELECT_ACTION_TYPE', () => {
    selectStepMock.mockImplementationOnce(
      ({ onNextBtnClick }: { onNextBtnClick: (e?: number) => void }) => (
        <div data-testid="select-action">
          <button
            data-testid="goto-lump"
            onClick={() => onNextBtnClick(ProposalActionCreationStep.LUMP_SUM_DETAILS)}
          />
        </div>
      ),
    );
    const { container } = render(<ProposalActionModal {...baseProps} />);
    fireEvent.click(container.querySelector('[data-testid="goto-lump"]') as HTMLButtonElement);
    fireEvent.click(
      container.querySelector('[data-testid="transfer-details-prev"]') as HTMLButtonElement,
    );
    expect(container.querySelector('[data-testid="select-action"]')).not.toBeNull();
  });

  it('LUMP_SUM_REVIEW onNextBtnClick with non-tx does not call onActionAdd', () => {
    selectStepMock.mockImplementationOnce(
      ({ onNextBtnClick }: { onNextBtnClick: (e?: number) => void }) => (
        <div data-testid="select-action">
          <button
            data-testid="goto-lump-review"
            onClick={() => onNextBtnClick(ProposalActionCreationStep.LUMP_SUM_REVIEW)}
          />
        </div>
      ),
    );
    const { container } = render(<ProposalActionModal {...baseProps} />);
    fireEvent.click(
      container.querySelector('[data-testid="goto-lump-review"]') as HTMLButtonElement,
    );
    fireEvent.click(
      container.querySelector('[data-testid="transfer-review-next-with-num"]') as HTMLButtonElement,
    );
    expect(onActionAddMock).not.toHaveBeenCalled();
  });

  it('FUNCTION_CALL_SELECT next transitions to ADD_ARGUMENTS', () => {
    selectStepMock.mockImplementationOnce(
      ({ onNextBtnClick }: { onNextBtnClick: (e?: number) => void }) => (
        <div data-testid="select-action">
          <button
            data-testid="goto-fn"
            onClick={() => onNextBtnClick(ProposalActionCreationStep.FUNCTION_CALL_SELECT_FUNCTION)}
          />
        </div>
      ),
    );
    const { container } = render(<ProposalActionModal {...baseProps} />);
    fireEvent.click(container.querySelector('[data-testid="goto-fn"]') as HTMLButtonElement);
    fireEvent.click(
      container.querySelector('[data-testid="function-select-next"]') as HTMLButtonElement,
    );
    expect(container.querySelector('[data-testid="function-args"]')).not.toBeNull();
  });

  it('FUNCTION_CALL_SELECT prev returns to SELECT_ACTION_TYPE', () => {
    selectStepMock.mockImplementationOnce(
      ({ onNextBtnClick }: { onNextBtnClick: (e?: number) => void }) => (
        <div data-testid="select-action">
          <button
            data-testid="goto-fn"
            onClick={() => onNextBtnClick(ProposalActionCreationStep.FUNCTION_CALL_SELECT_FUNCTION)}
          />
        </div>
      ),
    );
    const { container } = render(<ProposalActionModal {...baseProps} />);
    fireEvent.click(container.querySelector('[data-testid="goto-fn"]') as HTMLButtonElement);
    fireEvent.click(
      container.querySelector('[data-testid="function-select-prev"]') as HTMLButtonElement,
    );
    expect(container.querySelector('[data-testid="select-action"]')).not.toBeNull();
  });

  it('STREAM_PAYMENT_PAYMENT_DETAILS prev returns to SELECT_ACTION_TYPE', () => {
    selectStepMock.mockImplementationOnce(
      ({ onNextBtnClick }: { onNextBtnClick: (e?: number) => void }) => (
        <div data-testid="select-action">
          <button
            data-testid="goto-stream"
            onClick={() =>
              onNextBtnClick(ProposalActionCreationStep.STREAM_PAYMENT_PAYMENT_DETAILS)
            }
          />
        </div>
      ),
    );
    const { container } = render(<ProposalActionModal {...baseProps} />);
    fireEvent.click(container.querySelector('[data-testid="goto-stream"]') as HTMLButtonElement);
    fireEvent.click(
      container.querySelector('[data-testid="stream-payment-prev"]') as HTMLButtonElement,
    );
    expect(container.querySelector('[data-testid="select-action"]')).not.toBeNull();
  });

  it('FUNCTION_CALL_REVIEW non-tx (numeric) does not call onActionAdd', () => {
    selectStepMock.mockImplementationOnce(
      ({ onNextBtnClick }: { onNextBtnClick: (e?: number) => void }) => (
        <div data-testid="select-action">
          <button
            data-testid="goto-fn-review"
            onClick={() => onNextBtnClick(ProposalActionCreationStep.FUNCTION_CALL_REVIEW)}
          />
        </div>
      ),
    );
    const { container } = render(<ProposalActionModal {...baseProps} />);
    fireEvent.click(container.querySelector('[data-testid="goto-fn-review"]') as HTMLButtonElement);
    fireEvent.click(
      container.querySelector('[data-testid="function-review-next-with-num"]') as HTMLButtonElement,
    );
    expect(onActionAddMock).not.toHaveBeenCalled();
  });

  it('STREAM_PAYMENT_REVIEW non-tx (numeric) does not call onActionAdd', () => {
    selectStepMock.mockImplementationOnce(
      ({ onNextBtnClick }: { onNextBtnClick: (e?: number) => void }) => (
        <div data-testid="select-action">
          <button
            data-testid="goto-stream-review"
            onClick={() => onNextBtnClick(ProposalActionCreationStep.STREAM_PAYMENT_REVIEW)}
          />
        </div>
      ),
    );
    const { container } = render(<ProposalActionModal {...baseProps} />);
    fireEvent.click(
      container.querySelector('[data-testid="goto-stream-review"]') as HTMLButtonElement,
    );
    fireEvent.click(
      container.querySelector('[data-testid="stream-review-next-with-num"]') as HTMLButtonElement,
    );
    expect(onActionAddMock).not.toHaveBeenCalled();
  });

  it('renders nothing harmful when show toggles false then true (re-mount)', () => {
    const { container, rerender } = render(<ProposalActionModal {...baseProps} show={false} />);
    expect(container.querySelector('[data-testid="solid-modal"]')).toBeNull();
    rerender(<ProposalActionModal {...baseProps} show={true} />);
    expect(container.querySelector('[data-testid="solid-modal"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="select-action"]')).not.toBeNull();
  });

  it('initial state shows select-action step', () => {
    const { container } = render(<ProposalActionModal {...baseProps} />);
    expect(container.querySelector('[data-testid="select-action"]')).not.toBeNull();
  });

  it('show=false hides modal', () => {
    const { container } = render(<ProposalActionModal {...baseProps} show={false} />);
    expect(container.querySelector('[data-testid="solid-modal"]')).toBeNull();
  });

  it('show=true displays solid-modal wrapper', () => {
    const { container } = render(<ProposalActionModal {...baseProps} />);
    expect(container.querySelector('[data-testid="solid-modal"]')).not.toBeNull();
  });

  it('rerender from show=true to show=false hides modal', () => {
    const { container, rerender } = render(<ProposalActionModal {...baseProps} />);
    expect(container.querySelector('[data-testid="solid-modal"]')).not.toBeNull();
    rerender(<ProposalActionModal {...baseProps} show={false} />);
    expect(container.querySelector('[data-testid="solid-modal"]')).toBeNull();
  });

  it('initial step shows only select-action (not other steps)', () => {
    const { container } = render(<ProposalActionModal {...baseProps} />);
    expect(container.querySelector('[data-testid="transfer-details"]')).toBeNull();
    expect(container.querySelector('[data-testid="function-select"]')).toBeNull();
    expect(container.querySelector('[data-testid="stream-payment"]')).toBeNull();
  });
});

// dummy reference to silence unused warning
void advanceTo;
