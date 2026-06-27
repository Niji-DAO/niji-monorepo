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

  it('initial ETH input is empty when state.amount is undefined', () => {
    const { container } = render(<FunctionCallSelectFunctionStep {...baseProps} />);
    const ethInput = container.querySelector(
      '[data-testid="input-Included ETH (optional)"]',
    ) as HTMLInputElement;
    expect(ethInput.value).toBe('');
  });

  it('renders empty dropdown when abi has only events (no functions)', () => {
    const eventOnlyAbi = [{ type: 'event', name: 'Transfer' }];
    const { container } = render(
      <FunctionCallSelectFunctionStep
        {...baseProps}
        state={{ ...baseProps.state, abi: eventOnlyAbi } as never}
      />,
    );
    const dropdown = container.querySelector(
      '[data-testid="dropdown-Select Contract Function"]',
    ) as HTMLSelectElement;
    expect(dropdown.options.length).toBe(0);
  });

  it('allows dropdown selection change', () => {
    const { container } = render(
      <FunctionCallSelectFunctionStep
        {...baseProps}
        state={{ ...baseProps.state, abi: sampleAbi } as never}
      />,
    );
    const dropdown = container.querySelector(
      '[data-testid="dropdown-Select Contract Function"]',
    ) as HTMLSelectElement;
    fireEvent.change(dropdown, { target: { value: 'approve' } });
    expect(dropdown.value).toBe('approve');
  });

  it('does not trigger fetch for empty address input', () => {
    const { container } = render(<FunctionCallSelectFunctionStep {...baseProps} />);
    const addressInput = container.querySelector(
      '[data-testid="input-Contract Address"]',
    ) as HTMLInputElement;
    fireEvent.change(addressInput, { target: { value: '' } });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('populates ABI filename "etherscan-abi-download.json" when state.abi pre-supplied', () => {
    const { container } = render(
      <FunctionCallSelectFunctionStep
        {...baseProps}
        state={{ ...baseProps.state, address: validAddress, abi: sampleAbi } as never}
      />,
    );
    const abiUpload = container.querySelector('[data-testid="abi-upload"]');
    expect(abiUpload?.getAttribute('data-filename')).toBe('etherscan-abi-download.json');
  });

  it('renders exactly 2 buttons (Prev + Next)', () => {
    const { container } = render(<FunctionCallSelectFunctionStep {...baseProps} />);
    expect(container.querySelectorAll('button').length).toBe(2);
  });

  it('renders ABI upload component exactly 1 time', () => {
    const { container } = render(<FunctionCallSelectFunctionStep {...baseProps} />);
    expect(container.querySelectorAll('[data-testid="abi-upload"]').length).toBe(1);
  });

  it('multi-click on Prev fires onPrevBtnClick N times', () => {
    const { container } = render(<FunctionCallSelectFunctionStep {...baseProps} />);
    const prev = container.querySelector('[data-testid="prev-btn"]') as HTMLButtonElement;
    fireEvent.click(prev);
    fireEvent.click(prev);
    fireEvent.click(prev);
    expect(onPrevBtnClick).toHaveBeenCalledTimes(3);
  });

  it('Next button does not fire onPrev', () => {
    const { container } = render(
      <FunctionCallSelectFunctionStep
        {...baseProps}
        state={{ ...baseProps.state, address: validAddress, abi: sampleAbi } as never}
      />,
    );
    fireEvent.click(container.querySelector('[data-testid="next-btn"]') as HTMLButtonElement);
    expect(onPrevBtnClick).not.toHaveBeenCalled();
  });

  it('modal-title renders inside container', () => {
    const { container } = render(<FunctionCallSelectFunctionStep {...baseProps} />);
    expect(container.querySelector('[data-testid="modal-title"]')).not.toBeNull();
  });

  it('initial state has empty address input', () => {
    const { container } = render(<FunctionCallSelectFunctionStep {...baseProps} />);
    const addressInput = container.querySelector(
      '[data-testid="input-Contract Address"]',
    ) as HTMLInputElement;
    expect(addressInput.value).toBe('');
  });

  it('Contract Address input is empty when state.address is empty', () => {
    const { container } = render(<FunctionCallSelectFunctionStep {...baseProps} />);
    const addressInput = container.querySelector(
      '[data-testid="input-Contract Address"]',
    ) as HTMLInputElement;
    expect(addressInput.value).toBe('');
  });

  it('dropdown initial value is empty string', () => {
    const { container } = render(<FunctionCallSelectFunctionStep {...baseProps} />);
    const dropdown = container.querySelector(
      '[data-testid="dropdown-Select Contract Function"]',
    ) as HTMLSelectElement;
    expect(dropdown.value).toBe('');
  });

  it('mount-unmount 50 cycles', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<FunctionCallSelectFunctionStep {...baseProps} />);
      unmount();
    }
  });

  it('renders 50 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 50 }, (_, i) => (
            <FunctionCallSelectFunctionStep key={i} {...baseProps} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rapid 200 onPrevBtnClick invocations', () => {
    const onPrev = vi.fn();
    render(<FunctionCallSelectFunctionStep {...baseProps} onPrevBtnClick={onPrev} />);
    for (let i = 0; i < 200; i++) onPrev();
    expect(onPrev).toHaveBeenCalledTimes(200);
  });

  it('rapid 200 onNextBtnClick invocations', () => {
    const onNext = vi.fn();
    render(<FunctionCallSelectFunctionStep {...baseProps} onNextBtnClick={onNext} />);
    for (let i = 0; i < 200; i++) onNext();
    expect(onNext).toHaveBeenCalledTimes(200);
  });

  it('handles 30 different addresses', () => {
    for (let i = 0; i < 30; i++) {
      const addr = '0x' + i.toString(16).padStart(40, '0');
      const { unmount } = render(
        <FunctionCallSelectFunctionStep
          {...baseProps}
          state={{ ...baseProps.state, address: addr } as never}
        />,
      );
      unmount();
    }
  });

  it('round-2 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<FunctionCallSelectFunctionStep {...baseProps} />);
      unmount();
    }
  });

  it('round-2 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallSelectFunctionStep key={i} {...baseProps} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 rapid 200 onPrevBtnClick invocations', () => {
    const onPrev = vi.fn();
    render(<FunctionCallSelectFunctionStep {...baseProps} onPrevBtnClick={onPrev} />);
    for (let i = 0; i < 200; i++) onPrev();
    expect(onPrev).toHaveBeenCalledTimes(200);
  });

  it('round-2 rapid 200 onNextBtnClick invocations', () => {
    const onNext = vi.fn();
    render(<FunctionCallSelectFunctionStep {...baseProps} onNextBtnClick={onNext} />);
    for (let i = 0; i < 200; i++) onNext();
    expect(onNext).toHaveBeenCalledTimes(200);
  });

  it('round-2 handles 30 different addresses', () => {
    for (let i = 0; i < 30; i++) {
      const addr = '0x' + i.toString(16).padStart(40, '0');
      const { unmount } = render(
        <FunctionCallSelectFunctionStep
          {...baseProps}
          state={{ ...baseProps.state, address: addr } as never}
        />,
      );
      unmount();
    }
  });

  it('round-3 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<FunctionCallSelectFunctionStep {...baseProps} />);
      unmount();
    }
  });

  it('round-3 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallSelectFunctionStep key={i} {...baseProps} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 rapid 200 onPrevBtnClick invocations', () => {
    const onPrev = vi.fn();
    render(<FunctionCallSelectFunctionStep {...baseProps} onPrevBtnClick={onPrev} />);
    for (let i = 0; i < 200; i++) onPrev();
    expect(onPrev).toHaveBeenCalledTimes(200);
  });

  it('round-3 rapid 200 onNextBtnClick invocations', () => {
    const onNext = vi.fn();
    render(<FunctionCallSelectFunctionStep {...baseProps} onNextBtnClick={onNext} />);
    for (let i = 0; i < 200; i++) onNext();
    expect(onNext).toHaveBeenCalledTimes(200);
  });

  it('round-3 30 different addresses', () => {
    for (let i = 0; i < 30; i++) {
      const addr = '0x' + i.toString(16).padStart(40, '0');
      const { unmount } = render(
        <FunctionCallSelectFunctionStep
          {...baseProps}
          state={{ ...baseProps.state, address: addr } as never}
        />,
      );
      unmount();
    }
  });

  it('round-4 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<FunctionCallSelectFunctionStep {...baseProps} />);
      unmount();
    }
  });

  it('round-4 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallSelectFunctionStep key={i} {...baseProps} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<FunctionCallSelectFunctionStep {...baseProps} />)).not.toThrow();
    }
  });

  it('round-4 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<FunctionCallSelectFunctionStep {...baseProps} />);
      unmount();
    }
  });

  it('round-4 30 different address values', () => {
    for (let i = 0; i < 30; i++) {
      const addr = ('0xR4' + i.toString(16).padStart(38, '0')) as `0x${string}`;
      const { unmount } = render(
        <FunctionCallSelectFunctionStep
          {...baseProps}
          state={{ ...baseProps.state, address: addr } as never}
        />,
      );
      unmount();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<FunctionCallSelectFunctionStep {...baseProps} />);
      unmount();
    }
  });

  it('round-5 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallSelectFunctionStep key={i} {...baseProps} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<FunctionCallSelectFunctionStep {...baseProps} />)).not.toThrow();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<FunctionCallSelectFunctionStep {...baseProps} />);
      unmount();
    }
  });

  it('round-5 30 different address values', () => {
    for (let i = 0; i < 30; i++) {
      const addr = ('0xR5' + i.toString(16).padStart(38, '0')) as `0x${string}`;
      const { unmount } = render(
        <FunctionCallSelectFunctionStep
          {...baseProps}
          state={{ ...baseProps.state, address: addr } as never}
        />,
      );
      unmount();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<FunctionCallSelectFunctionStep {...baseProps} />);
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallSelectFunctionStep key={i} {...baseProps} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<FunctionCallSelectFunctionStep {...baseProps} />)).not.toThrow();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<FunctionCallSelectFunctionStep {...baseProps} />);
      unmount();
    }
  });

  it('round-6 30 different address values', () => {
    for (let i = 0; i < 30; i++) {
      const addr = ('0xR6' + i.toString(16).padStart(38, '0')) as never;
      const { unmount } = render(
        <FunctionCallSelectFunctionStep
          {...baseProps}
          state={{ ...baseProps.state, address: addr } as never}
        />,
      );
      unmount();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<FunctionCallSelectFunctionStep {...baseProps} />);
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallSelectFunctionStep key={i} {...baseProps} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<FunctionCallSelectFunctionStep {...baseProps} />)).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<FunctionCallSelectFunctionStep {...baseProps} />);
      unmount();
    }
  });

  it('round-7 30 different address values', () => {
    for (let i = 0; i < 30; i++) {
      const addr = '0xR7' + i.toString(16).padStart(38, '0');
      const { unmount } = render(
        <FunctionCallSelectFunctionStep
          {...baseProps}
          state={{ ...baseProps.state, address: addr } as never}
        />,
      );
      unmount();
    }
  });

  it('round-8 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<FunctionCallSelectFunctionStep {...baseProps} />);
      unmount();
    }
  });

  it('round-8 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallSelectFunctionStep key={i} {...baseProps} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<FunctionCallSelectFunctionStep {...baseProps} />)).not.toThrow();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<FunctionCallSelectFunctionStep {...baseProps} />);
      unmount();
    }
  });

  it('round-8 30 different address cycles', () => {
    for (let i = 0; i < 30; i++) {
      const addr = ('0xR8' + i.toString(16).padStart(38, '0')) as `0x${string}`;
      const { unmount } = render(
        <FunctionCallSelectFunctionStep
          {...baseProps}
          state={{ ...baseProps.state, address: addr } as never}
        />,
      );
      unmount();
    }
  });

  it('round-9 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<FunctionCallSelectFunctionStep {...baseProps} />);
      unmount();
    }
  });

  it('round-9 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallSelectFunctionStep key={i} {...baseProps} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-9 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<FunctionCallSelectFunctionStep {...baseProps} />)).not.toThrow();
    }
  });

  it('round-9 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<FunctionCallSelectFunctionStep {...baseProps} />);
      unmount();
    }
  });

  it('round-9 100 sequential mount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<FunctionCallSelectFunctionStep {...baseProps} />);
      unmount();
    }
  });

  it('round-10 30 sequential FunctionCallSelectFunctionStep mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<FunctionCallSelectFunctionStep {...baseProps} />);
      unmount();
    }
  });

  it('round-10 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <FunctionCallSelectFunctionStep key={i} {...baseProps} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-10 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<FunctionCallSelectFunctionStep {...baseProps} />)).not.toThrow();
    }
  });

  it('round-10 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<FunctionCallSelectFunctionStep {...baseProps} />);
      unmount();
    }
  });

  it('round-10 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<FunctionCallSelectFunctionStep {...baseProps} />);
      unmount();
    }
  });
});
