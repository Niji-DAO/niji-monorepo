import React from 'react';

import { fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/ABIUpload', () => ({
  default: ({
    abiFileName,
    isValid,
    isInvalid,
    onChange,
  }: {
    abiFileName?: string;
    isValid?: boolean;
    isInvalid?: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) => (
    <div
      data-testid="abi-upload"
      data-filename={abiFileName ?? ''}
      data-valid={String(isValid ?? '')}
      data-invalid={String(isInvalid ?? '')}
    >
      <input data-testid="abi-upload-input" type="file" onChange={onChange} />
    </div>
  ),
}));

vi.mock('@/components/BrandDropdown', () => ({
  default: ({
    value,
    onChange,
    children,
    label,
  }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    children: React.ReactNode;
    label: string;
  }) => (
    <select data-testid={`dropdown-${label}`} value={value} onChange={onChange}>
      {children}
    </select>
  ),
}));

vi.mock('@/components/BrandTextEntry', () => ({
  default: ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) => (
    <input data-testid={`input-${label}`} value={value} onChange={onChange} placeholder={label} />
  ),
}));

vi.mock('@/components/ModalBottomButtonRow', () => ({
  default: ({
    prevBtnText,
    onPrevBtnClick,
    nextBtnText,
    onNextBtnClick,
    isNextBtnDisabled,
  }: {
    prevBtnText: React.ReactNode;
    onPrevBtnClick: () => void;
    nextBtnText: React.ReactNode;
    onNextBtnClick: () => void;
    isNextBtnDisabled: boolean;
  }) => (
    <div>
      <button data-testid="prev-btn" onClick={onPrevBtnClick}>
        {prevBtnText}
      </button>
      <button data-testid="next-btn" onClick={onNextBtnClick} disabled={isNextBtnDisabled}>
        {nextBtnText}
      </button>
    </div>
  ),
}));

vi.mock('@/components/ModalTitle', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <h1 data-testid="modal-title">{children}</h1>
  ),
}));

vi.mock('@/utils/etherscan', () => ({
  buildEtherscanApiQuery: (a: string) => `https://api.etherscan.io/${a}`,
}));

import FunctionCallSelectFunctionStep from './index';

const validAddress = '0x1234567890123456789012345678901234567890';
const sampleAbi = [
  { type: 'function', name: 'transfer', inputs: [] },
  { type: 'function', name: 'approve', inputs: [] },
  { type: 'event', name: 'Transfer' },
];

const onNextBtnClick = vi.fn();
const onPrevBtnClick = vi.fn();
const setState = vi.fn();

const baseProps = {
  onNextBtnClick,
  onPrevBtnClick,
  state: {
    actionType: 'Function Call',
    address: '' as `0x${string}`,
  } as never,
  setState,
};

beforeEach(() => {
  onNextBtnClick.mockReset();
  onPrevBtnClick.mockReset();
  setState.mockReset();
  global.fetch = vi.fn().mockResolvedValue({
    json: () =>
      Promise.resolve({
        result: [{ ABI: JSON.stringify(sampleAbi), Proxy: '0' }],
      }),
  }) as never;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('FunctionCallSelectFunctionStep', () => {
  it('renders initial inputs and labels', () => {
    const { container } = render(<FunctionCallSelectFunctionStep {...baseProps} />);
    expect(container.querySelector('[data-testid="modal-title"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="input-Contract Address"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="input-Included ETH (optional)"]')).not.toBeNull();
    expect(
      container.querySelector('[data-testid="dropdown-Select Contract Function"]'),
    ).not.toBeNull();
    expect(container.querySelector('[data-testid="abi-upload"]')).not.toBeNull();
  });

  it('updates address state on input change', () => {
    const { container } = render(<FunctionCallSelectFunctionStep {...baseProps} />);
    const addressInput = container.querySelector(
      '[data-testid="input-Contract Address"]',
    ) as HTMLInputElement;
    fireEvent.change(addressInput, { target: { value: '0xABC' } });
    expect(addressInput.value).toBe('0xABC');
  });

  it('triggers fetch when valid address entered', async () => {
    const { container } = render(<FunctionCallSelectFunctionStep {...baseProps} />);
    const addressInput = container.querySelector(
      '[data-testid="input-Contract Address"]',
    ) as HTMLInputElement;
    fireEvent.change(addressInput, { target: { value: validAddress } });
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(`https://api.etherscan.io/${validAddress}`);
    });
  });

  it('does not trigger fetch for invalid address', () => {
    const { container } = render(<FunctionCallSelectFunctionStep {...baseProps} />);
    const addressInput = container.querySelector(
      '[data-testid="input-Contract Address"]',
    ) as HTMLInputElement;
    fireEvent.change(addressInput, { target: { value: 'not-an-address' } });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('updates ETH amount on input change', () => {
    const { container } = render(<FunctionCallSelectFunctionStep {...baseProps} />);
    const ethInput = container.querySelector(
      '[data-testid="input-Included ETH (optional)"]',
    ) as HTMLInputElement;
    fireEvent.change(ethInput, { target: { value: '1.5' } });
    expect(ethInput.value).toBe('1.5');
  });

  it('Next button is disabled initially', () => {
    const { container } = render(<FunctionCallSelectFunctionStep {...baseProps} />);
    const nextBtn = container.querySelector('[data-testid="next-btn"]') as HTMLButtonElement;
    expect(nextBtn.disabled).toBe(true);
  });

  it('Next button calls setState + onNextBtnClick when clicked', () => {
    const { container } = render(
      <FunctionCallSelectFunctionStep
        {...baseProps}
        state={{ ...baseProps.state, address: validAddress, abi: sampleAbi } as never}
      />,
    );
    const nextBtn = container.querySelector('[data-testid="next-btn"]') as HTMLButtonElement;
    expect(nextBtn.disabled).toBe(false);
    fireEvent.click(nextBtn);
    expect(setState).toHaveBeenCalled();
    expect(onNextBtnClick).toHaveBeenCalled();
  });

  it('Prev button calls onPrevBtnClick when clicked', () => {
    const { container } = render(<FunctionCallSelectFunctionStep {...baseProps} />);
    const prevBtn = container.querySelector('[data-testid="prev-btn"]') as HTMLButtonElement;
    fireEvent.click(prevBtn);
    expect(onPrevBtnClick).toHaveBeenCalled();
  });

  it('populates ABI when state.abi provided', () => {
    const { container } = render(
      <FunctionCallSelectFunctionStep
        {...baseProps}
        state={{ ...baseProps.state, abi: sampleAbi } as never}
      />,
    );
    const abiUpload = container.querySelector('[data-testid="abi-upload"]');
    expect(abiUpload?.getAttribute('data-filename')).toBe('etherscan-abi-download.json');
  });

  it('enables Next button when state has valid address + abi', () => {
    const { container } = render(
      <FunctionCallSelectFunctionStep
        {...baseProps}
        state={{ ...baseProps.state, address: validAddress, abi: sampleAbi } as never}
      />,
    );
    const nextBtn = container.querySelector('[data-testid="next-btn"]') as HTMLButtonElement;
    expect(nextBtn.disabled).toBe(false);
  });

  it('lists ABI function names as dropdown options when abi loaded', () => {
    const { container } = render(
      <FunctionCallSelectFunctionStep
        {...baseProps}
        state={{ ...baseProps.state, abi: sampleAbi } as never}
      />,
    );
    const dropdown = container.querySelector(
      '[data-testid="dropdown-Select Contract Function"]',
    ) as HTMLSelectElement;
    const options = Array.from(dropdown.options).map(o => o.value);
    expect(options).toContain('transfer');
    expect(options).toContain('approve');
    expect(options).not.toContain('Transfer');
  });
});
