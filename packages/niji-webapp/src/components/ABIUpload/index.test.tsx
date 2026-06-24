import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { default as ABIUpload } from './index';

describe('ABIUpload Component', () => {
  it('should render the correct default label when file name is not etherscan-abi-download.json', () => {
    render(
      <ABIUpload
        abiFileName="test-file.json"
        isValid={false}
        isInvalid={false}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByText('ABI')).toBeInTheDocument();
  });

  it('should render the correct label when file name is etherscan-abi-download.json', () => {
    render(
      <ABIUpload
        abiFileName="etherscan-abi-download.json"
        isValid={false}
        isInvalid={false}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByText('etherscan-abi-download.json')).toBeInTheDocument();
  });

  it('should pass the correct props to Form.Control', () => {
    render(
      <ABIUpload
        abiFileName="test-file.json"
        isValid={true}
        isInvalid={false}
        onChange={vi.fn()}
      />,
    );

    const input = screen.getByLabelText(/abi/i) as HTMLInputElement;
    expect(input).toHaveAttribute('type', 'file');
    expect(input).toHaveAttribute('accept', 'application/JSON');
    expect(input).toBeValid();
    expect(input).not.toBeInvalid();
  });

  it('should trigger onChange callback when file input changes', () => {
    const handleChange = vi.fn();
    render(
      <ABIUpload
        abiFileName="test-file.json"
        isValid={false}
        isInvalid={false}
        onChange={handleChange}
      />,
    );

    const input = screen.getByLabelText(/abi/i) as HTMLInputElement;
    fireEvent.change(input, {
      target: { files: [new File(['content'], 'test.json', { type: 'application/json' })] },
    });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('renders default "ABI" label when abiFileName is undefined', () => {
    render(<ABIUpload isValid={false} isInvalid={false} onChange={vi.fn()} />);
    expect(screen.getByText('ABI')).toBeInTheDocument();
  });

  it('applies is-invalid class when isInvalid=true (react-bootstrap convention)', () => {
    render(
      <ABIUpload
        abiFileName="test-file.json"
        isValid={false}
        isInvalid={true}
        onChange={vi.fn()}
      />,
    );
    const input = screen.getByLabelText(/abi/i) as HTMLInputElement;
    expect(input.className).toContain('is-invalid');
  });

  it('input accept attribute is application/JSON only', () => {
    render(
      <ABIUpload
        abiFileName="test-file.json"
        isValid={false}
        isInvalid={false}
        onChange={vi.fn()}
      />,
    );
    const input = screen.getByLabelText(/abi/i) as HTMLInputElement;
    expect(input.getAttribute('accept')).toBe('application/JSON');
  });

  it('label htmlFor matches input id (import-abi)', () => {
    const { container } = render(
      <ABIUpload
        abiFileName="test-file.json"
        isValid={false}
        isInvalid={false}
        onChange={vi.fn()}
      />,
    );
    expect(container.querySelector('label')?.getAttribute('for')).toBe('import-abi');
    expect(container.querySelector('input')?.getAttribute('id')).toBe('import-abi');
  });

  it('onChange receives ChangeEvent with target.files set', () => {
    let receivedTarget: HTMLInputElement | null = null;
    const handleChange = vi.fn((e: React.ChangeEvent<HTMLInputElement>) => {
      receivedTarget = e.target;
    });
    render(
      <ABIUpload
        abiFileName="test-file.json"
        isValid={false}
        isInvalid={false}
        onChange={handleChange}
      />,
    );
    const input = screen.getByLabelText(/abi/i) as HTMLInputElement;
    fireEvent.change(input, {
      target: { files: [new File(['c'], 'a.json', { type: 'application/json' })] },
    });
    expect(receivedTarget).not.toBeNull();
    expect((receivedTarget as unknown as HTMLInputElement).type).toBe('file');
  });
});
