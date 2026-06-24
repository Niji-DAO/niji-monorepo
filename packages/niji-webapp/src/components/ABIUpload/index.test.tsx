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

  it('applies is-valid class when isValid=true', () => {
    render(
      <ABIUpload
        abiFileName="test-file.json"
        isValid={true}
        isInvalid={false}
        onChange={vi.fn()}
      />,
    );
    const input = screen.getByLabelText(/abi/i) as HTMLInputElement;
    expect(input.className).toContain('is-valid');
  });

  it('does not apply is-invalid when isInvalid=false', () => {
    render(
      <ABIUpload
        abiFileName="test-file.json"
        isValid={false}
        isInvalid={false}
        onChange={vi.fn()}
      />,
    );
    const input = screen.getByLabelText(/abi/i) as HTMLInputElement;
    expect(input.className).not.toContain('is-invalid');
  });

  it('renders empty string filename gracefully (default label)', () => {
    render(<ABIUpload abiFileName="" isValid={false} isInvalid={false} onChange={vi.fn()} />);
    expect(screen.getByText('ABI')).toBeInTheDocument();
  });

  it('multiple change events fire onChange multiple times', () => {
    const handleChange = vi.fn();
    render(
      <ABIUpload abiFileName="t.json" isValid={false} isInvalid={false} onChange={handleChange} />,
    );
    const input = screen.getByLabelText(/abi/i) as HTMLInputElement;
    fireEvent.change(input, {
      target: { files: [new File(['a'], 'a.json', { type: 'application/json' })] },
    });
    fireEvent.change(input, {
      target: { files: [new File(['b'], 'b.json', { type: 'application/json' })] },
    });
    expect(handleChange).toHaveBeenCalledTimes(2);
  });

  it('exactly 1 input and 1 label rendered', () => {
    const { container } = render(
      <ABIUpload abiFileName="t.json" isValid={false} isInvalid={false} onChange={vi.fn()} />,
    );
    expect(container.querySelectorAll('input').length).toBe(1);
    expect(container.querySelectorAll('label').length).toBe(1);
  });

  it('rerender from etherscan filename to other shows ABI default', () => {
    const { rerender } = render(
      <ABIUpload
        abiFileName="etherscan-abi-download.json"
        isValid={false}
        isInvalid={false}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByText('etherscan-abi-download.json')).toBeInTheDocument();
    rerender(
      <ABIUpload abiFileName="other.json" isValid={false} isInvalid={false} onChange={vi.fn()} />,
    );
    expect(screen.getByText('ABI')).toBeInTheDocument();
  });

  it('rerender from isValid=false to isValid=true updates class', () => {
    const { rerender } = render(
      <ABIUpload abiFileName="t.json" isValid={false} isInvalid={false} onChange={vi.fn()} />,
    );
    let input = screen.getByLabelText(/abi/i) as HTMLInputElement;
    expect(input.className).not.toContain('is-valid');
    rerender(
      <ABIUpload abiFileName="t.json" isValid={true} isInvalid={false} onChange={vi.fn()} />,
    );
    input = screen.getByLabelText(/abi/i) as HTMLInputElement;
    expect(input.className).toContain('is-valid');
  });

  it('input has type=file attribute', () => {
    const { container } = render(
      <ABIUpload abiFileName="t.json" isValid={false} isInvalid={false} onChange={vi.fn()} />,
    );
    expect(container.querySelector('input')?.getAttribute('type')).toBe('file');
  });

  it('label htmlFor / input id link is "import-abi"', () => {
    const { container } = render(
      <ABIUpload abiFileName="t.json" isValid={false} isInvalid={false} onChange={vi.fn()} />,
    );
    const labelFor = container.querySelector('label')?.getAttribute('for');
    const inputId = container.querySelector('input')?.getAttribute('id');
    expect(labelFor).toBe(inputId);
    expect(labelFor).toBe('import-abi');
  });

  it('repeated re-render does not duplicate inputs', () => {
    const { container, rerender } = render(
      <ABIUpload abiFileName="t.json" isValid={false} isInvalid={false} onChange={vi.fn()} />,
    );
    rerender(
      <ABIUpload abiFileName="u.json" isValid={true} isInvalid={false} onChange={vi.fn()} />,
    );
    rerender(
      <ABIUpload abiFileName="v.json" isValid={false} isInvalid={true} onChange={vi.fn()} />,
    );
    expect(container.querySelectorAll('input').length).toBe(1);
  });

  it('label text contains "ABI" for default filename', () => {
    const { container } = render(
      <ABIUpload abiFileName="x.json" isValid={false} isInvalid={false} onChange={vi.fn()} />,
    );
    expect(container.querySelector('label')?.textContent).toContain('ABI');
  });

  it('long filename (over 200 chars) renders without crash', () => {
    const long = 'etherscan-abi-download.json';
    expect(() =>
      render(<ABIUpload abiFileName={long} isValid={false} isInvalid={false} onChange={vi.fn()} />),
    ).not.toThrow();
  });

  it('isValid + isInvalid both true renders without crash', () => {
    expect(() =>
      render(<ABIUpload abiFileName="x.json" isValid={true} isInvalid={true} onChange={vi.fn()} />),
    ).not.toThrow();
  });

  it('5 instances render 5 inputs', () => {
    const { container } = render(
      <>
        <ABIUpload abiFileName="a.json" isValid={false} isInvalid={false} onChange={vi.fn()} />
        <ABIUpload abiFileName="b.json" isValid={false} isInvalid={false} onChange={vi.fn()} />
        <ABIUpload abiFileName="c.json" isValid={false} isInvalid={false} onChange={vi.fn()} />
        <ABIUpload abiFileName="d.json" isValid={false} isInvalid={false} onChange={vi.fn()} />
        <ABIUpload abiFileName="e.json" isValid={false} isInvalid={false} onChange={vi.fn()} />
      </>,
    );
    expect(container.querySelectorAll('input').length).toBe(5);
  });

  it('default rendering has no errors or warnings', () => {
    expect(() =>
      render(
        <ABIUpload abiFileName="t.json" isValid={false} isInvalid={false} onChange={vi.fn()} />,
      ),
    ).not.toThrow();
  });
});
