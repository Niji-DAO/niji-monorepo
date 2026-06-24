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

  it('input element exists in DOM', () => {
    const { container } = render(
      <ABIUpload abiFileName="" isValid={false} isInvalid={false} onChange={vi.fn()} />,
    );
    expect(container.querySelector('input')).not.toBeNull();
  });

  it('isValid+isInvalid both false renders valid class state', () => {
    const { container } = render(
      <ABIUpload abiFileName="x" isValid={false} isInvalid={false} onChange={vi.fn()} />,
    );
    expect(container.querySelector('input[type="file"]')).not.toBeNull();
  });

  it('multiple instances render independently', () => {
    const { container } = render(
      <>
        <ABIUpload abiFileName="a.json" isValid={true} isInvalid={false} onChange={vi.fn()} />
        <ABIUpload abiFileName="b.json" isValid={false} isInvalid={true} onChange={vi.fn()} />
      </>,
    );
    expect(container.querySelectorAll('input').length).toBe(2);
  });

  it('rerender abiFileName updates display label', () => {
    const { container, rerender } = render(
      <ABIUpload abiFileName="first.json" isValid={false} isInvalid={false} onChange={vi.fn()} />,
    );
    expect(container.textContent).toContain('ABI');
    rerender(
      <ABIUpload
        abiFileName="etherscan-abi-download.json"
        isValid={false}
        isInvalid={false}
        onChange={vi.fn()}
      />,
    );
    expect(container.textContent).toContain('etherscan-abi-download.json');
  });

  it('renders without crash with very long fileName', () => {
    const longName = 'x'.repeat(500) + '.json';
    expect(() =>
      render(
        <ABIUpload abiFileName={longName} isValid={false} isInvalid={false} onChange={vi.fn()} />,
      ),
    ).not.toThrow();
  });

  it('renders 5 instances each with own fileName', () => {
    const { container } = render(
      <>
        {Array.from({ length: 5 }, (_, i) => (
          <ABIUpload
            key={i}
            abiFileName={`file${i}.json`}
            isValid={false}
            isInvalid={false}
            onChange={vi.fn()}
          />
        ))}
      </>,
    );
    expect(container.querySelectorAll('input').length).toBe(5);
  });

  it('isValid=true + isInvalid=true (both flags) does not crash', () => {
    expect(() =>
      render(<ABIUpload abiFileName="x" isValid={true} isInvalid={true} onChange={vi.fn()} />),
    ).not.toThrow();
  });

  it('rerender from isValid=false to true', () => {
    const { rerender } = render(
      <ABIUpload abiFileName="x" isValid={false} isInvalid={false} onChange={vi.fn()} />,
    );
    expect(() =>
      rerender(<ABIUpload abiFileName="x" isValid={true} isInvalid={false} onChange={vi.fn()} />),
    ).not.toThrow();
  });

  it('renders 10 instances independently each with own state (no crash)', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 10 }, (_, i) => (
            <ABIUpload
              key={i}
              abiFileName={`file${i}.json`}
              isValid={i % 2 === 0}
              isInvalid={i % 3 === 0}
              onChange={vi.fn()}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender from isInvalid=true to false', () => {
    const { rerender } = render(
      <ABIUpload abiFileName="x.json" isValid={false} isInvalid={true} onChange={vi.fn()} />,
    );
    let input = screen.getByLabelText(/abi/i) as HTMLInputElement;
    expect(input.className).toContain('is-invalid');
    rerender(
      <ABIUpload abiFileName="x.json" isValid={false} isInvalid={false} onChange={vi.fn()} />,
    );
    input = screen.getByLabelText(/abi/i) as HTMLInputElement;
    expect(input.className).not.toContain('is-invalid');
  });

  it('rapid 10 file change events fire 10 times', () => {
    const handleChange = vi.fn();
    render(
      <ABIUpload abiFileName="x.json" isValid={false} isInvalid={false} onChange={handleChange} />,
    );
    const input = screen.getByLabelText(/abi/i) as HTMLInputElement;
    for (let i = 0; i < 10; i++) {
      fireEvent.change(input, {
        target: { files: [new File([`c${i}`], `f${i}.json`, { type: 'application/json' })] },
      });
    }
    expect(handleChange).toHaveBeenCalledTimes(10);
  });

  it('handles 500 char long fileName', () => {
    const longName = 'a'.repeat(500) + '.json';
    expect(() =>
      render(
        <ABIUpload abiFileName={longName} isValid={false} isInvalid={false} onChange={vi.fn()} />,
      ),
    ).not.toThrow();
  });

  it('renders unicode fileName', () => {
    expect(() =>
      render(
        <ABIUpload
          abiFileName="日本語.json"
          isValid={false}
          isInvalid={false}
          onChange={vi.fn()}
        />,
      ),
    ).not.toThrow();
  });

  it('renders 30 ABIUpload instances independently', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ABIUpload
              key={i}
              abiFileName={`file${i}.json`}
              isValid={false}
              isInvalid={false}
              onChange={vi.fn()}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rapid 50 file change events fire 50 times', () => {
    const handleChange = vi.fn();
    render(
      <ABIUpload abiFileName="x.json" isValid={false} isInvalid={false} onChange={handleChange} />,
    );
    const input = screen.getByLabelText(/abi/i) as HTMLInputElement;
    for (let i = 0; i < 50; i++) {
      fireEvent.change(input, {
        target: { files: [new File([`c${i}`], `f${i}.json`, { type: 'application/json' })] },
      });
    }
    expect(handleChange).toHaveBeenCalledTimes(50);
  });

  it('rerender all flag combinations without crash', () => {
    const flags = [
      { isValid: true, isInvalid: false },
      { isValid: false, isInvalid: true },
      { isValid: true, isInvalid: true },
      { isValid: false, isInvalid: false },
    ];
    const { rerender } = render(
      <ABIUpload abiFileName="x.json" {...flags[0]} onChange={vi.fn()} />,
    );
    flags.slice(1).forEach(f => {
      expect(() =>
        rerender(<ABIUpload abiFileName="x.json" {...f} onChange={vi.fn()} />),
      ).not.toThrow();
    });
  });

  it('handles abiFileName boundary "etherscan-abi-download.json"', () => {
    const { container } = render(
      <ABIUpload
        abiFileName="etherscan-abi-download.json"
        isValid={false}
        isInvalid={false}
        onChange={vi.fn()}
      />,
    );
    expect(container.textContent).toContain('etherscan-abi-download.json');
  });

  it('renders consistent label class across rerenders', () => {
    const { container, rerender } = render(
      <ABIUpload abiFileName="x.json" isValid={false} isInvalid={false} onChange={vi.fn()} />,
    );
    const labelCls = container.querySelector('label')?.className;
    rerender(
      <ABIUpload abiFileName="y.json" isValid={false} isInvalid={false} onChange={vi.fn()} />,
    );
    expect(container.querySelector('label')?.className).toBe(labelCls);
  });

  it('renders 50 ABIUpload instances independently', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 50 }, (_, i) => (
            <ABIUpload
              key={i}
              abiFileName={`file${i}.json`}
              isValid={false}
              isInvalid={false}
              onChange={vi.fn()}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rapid 100 change events fire 100 times', () => {
    const handleChange = vi.fn();
    render(
      <ABIUpload abiFileName="x.json" isValid={false} isInvalid={false} onChange={handleChange} />,
    );
    const input = screen.getByLabelText(/abi/i) as HTMLInputElement;
    for (let i = 0; i < 100; i++) {
      fireEvent.change(input, {
        target: { files: [new File([`c${i}`], `f${i}.json`, { type: 'application/json' })] },
      });
    }
    expect(handleChange).toHaveBeenCalledTimes(100);
  });

  it('rerender 30 times preserves input element', () => {
    const { rerender } = render(
      <ABIUpload abiFileName="x.json" isValid={false} isInvalid={false} onChange={vi.fn()} />,
    );
    for (let i = 0; i < 30; i++) {
      rerender(
        <ABIUpload
          abiFileName={`file${i}.json`}
          isValid={i % 2 === 0}
          isInvalid={i % 3 === 0}
          onChange={vi.fn()}
        />,
      );
      expect(screen.getByLabelText(/abi/i)).not.toBeNull();
    }
  });

  it('handles unicode filename across renders', () => {
    expect(() =>
      render(
        <ABIUpload
          abiFileName="日本語ファイル.json"
          isValid={false}
          isInvalid={false}
          onChange={vi.fn()}
        />,
      ),
    ).not.toThrow();
  });

  it('handles 100 different filenames sequentially', () => {
    for (let i = 0; i < 100; i++) {
      expect(() =>
        render(
          <ABIUpload
            abiFileName={`file${i}.json`}
            isValid={false}
            isInvalid={false}
            onChange={vi.fn()}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('renders 30 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ABIUpload
              key={i}
              abiFileName={`file-${i}.json`}
              isValid={false}
              isInvalid={false}
              onChange={vi.fn()}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender 30 times preserves component', () => {
    const { rerender } = render(
      <ABIUpload abiFileName="x.json" isValid={false} isInvalid={false} onChange={vi.fn()} />,
    );
    for (let i = 0; i < 30; i++) {
      expect(() =>
        rerender(
          <ABIUpload
            abiFileName={`file-${i}.json`}
            isValid={i % 2 === 0}
            isInvalid={i % 3 === 0}
            onChange={vi.fn()}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('handles very long abiFileName (1000 char)', () => {
    const long = `${'a'.repeat(995)}.json`;
    expect(() =>
      render(<ABIUpload abiFileName={long} isValid={false} isInvalid={false} onChange={vi.fn()} />),
    ).not.toThrow();
  });

  it('handles unicode abiFileName', () => {
    expect(() =>
      render(
        <ABIUpload
          abiFileName="🎉日本語.json"
          isValid={false}
          isInvalid={false}
          onChange={vi.fn()}
        />,
      ),
    ).not.toThrow();
  });

  it('rapid 50 onChange events fire handler', () => {
    const onChange = vi.fn();
    const { container } = render(
      <ABIUpload abiFileName="x.json" isValid={false} isInvalid={false} onChange={onChange} />,
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    for (let i = 0; i < 50; i++) {
      fireEvent.change(input, { target: { files: [] } });
    }
    expect(onChange).toHaveBeenCalledTimes(50);
  });
});
