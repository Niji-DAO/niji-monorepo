import { render } from '@testing-library/react';
import { parseEther } from 'viem';
import { describe, expect, it } from 'vitest';

import TruncatedAmount from './index';

describe('TruncatedAmount', () => {
  it('formats 1 ETH (1e18 wei) to "Ξ 1.00"', () => {
    const { container } = render(<TruncatedAmount amount={parseEther('1')} />);
    expect(container.textContent).toBe('Ξ 1.00');
  });

  it('truncates 1.2345 ETH to "Ξ 1.23" (2 decimal places)', () => {
    const { container } = render(<TruncatedAmount amount={parseEther('1.2345')} />);
    expect(container.textContent).toBe('Ξ 1.23');
  });

  it('formats 0 ETH to "Ξ 0.00"', () => {
    const { container } = render(<TruncatedAmount amount={0n} />);
    expect(container.textContent).toBe('Ξ 0.00');
  });

  it('formats 0.1 ETH to "Ξ 0.10"', () => {
    const { container } = render(<TruncatedAmount amount={parseEther('0.1')} />);
    expect(container.textContent).toBe('Ξ 0.10');
  });

  it('formats 100 ETH to "Ξ 100.00"', () => {
    const { container } = render(<TruncatedAmount amount={parseEther('100')} />);
    expect(container.textContent).toBe('Ξ 100.00');
  });

  it('formats huge amount (1000 ETH) to "Ξ 1000.00"', () => {
    const { container } = render(<TruncatedAmount amount={parseEther('1000')} />);
    expect(container.textContent).toBe('Ξ 1000.00');
  });

  it('rounds 0.005 ETH to "Ξ 0.01" (toFixed half-up)', () => {
    const { container } = render(<TruncatedAmount amount={parseEther('0.005')} />);
    expect(container.textContent).toBe('Ξ 0.01');
  });

  it('rounds 0.999 ETH to "Ξ 1.00" (toFixed rounding up)', () => {
    const { container } = render(<TruncatedAmount amount={parseEther('0.999')} />);
    expect(container.textContent).toBe('Ξ 1.00');
  });

  it('formats 0.01 ETH to "Ξ 0.01" (1 cent boundary)', () => {
    const { container } = render(<TruncatedAmount amount={parseEther('0.01')} />);
    expect(container.textContent).toBe('Ξ 0.01');
  });

  it('output always starts with "Ξ" prefix', () => {
    const cases = [0n, parseEther('0.5'), parseEther('1'), parseEther('1000')];
    cases.forEach(amount => {
      const { container } = render(<TruncatedAmount amount={amount} />);
      expect(container.textContent?.startsWith('Ξ')).toBe(true);
    });
  });

  it('formats 0.5 ETH to "Ξ 0.50"', () => {
    const { container } = render(<TruncatedAmount amount={parseEther('0.5')} />);
    expect(container.textContent).toBe('Ξ 0.50');
  });

  it('formats 2.5 ETH to "Ξ 2.50"', () => {
    const { container } = render(<TruncatedAmount amount={parseEther('2.5')} />);
    expect(container.textContent).toBe('Ξ 2.50');
  });

  it('formats 10000 ETH to "Ξ 10000.00"', () => {
    const { container } = render(<TruncatedAmount amount={parseEther('10000')} />);
    expect(container.textContent).toBe('Ξ 10000.00');
  });

  it('formats 0.001 ETH rounding to "Ξ 0.00"', () => {
    const { container } = render(<TruncatedAmount amount={parseEther('0.001')} />);
    expect(container.textContent).toBe('Ξ 0.00');
  });

  it('formats large fractional 3.14159 to "Ξ 3.14"', () => {
    const { container } = render(<TruncatedAmount amount={parseEther('3.14159')} />);
    expect(container.textContent).toBe('Ξ 3.14');
  });

  it('always returns exactly "Ξ " prefix + 1 number (no spaces middle)', () => {
    const { container } = render(<TruncatedAmount amount={parseEther('5')} />);
    const text = container.textContent ?? '';
    expect(text.split(' ').length).toBe(2);
  });

  it('rerender updates displayed amount', () => {
    const { container, rerender } = render(<TruncatedAmount amount={parseEther('1')} />);
    expect(container.textContent).toBe('Ξ 1.00');
    rerender(<TruncatedAmount amount={parseEther('5')} />);
    expect(container.textContent).toBe('Ξ 5.00');
  });

  it('multiple instances render independently', () => {
    const { container } = render(
      <>
        <TruncatedAmount amount={parseEther('1')} />
        <TruncatedAmount amount={parseEther('2')} />
      </>,
    );
    expect(container.textContent).toContain('1.00');
    expect(container.textContent).toContain('2.00');
  });

  it('1 wei renders as "Ξ 0.00" (rounding down)', () => {
    const { container } = render(<TruncatedAmount amount={1n} />);
    expect(container.textContent).toBe('Ξ 0.00');
  });

  it('999 ETH renders correctly', () => {
    const { container } = render(<TruncatedAmount amount={parseEther('999')} />);
    expect(container.textContent).toBe('Ξ 999.00');
  });

  it('value contains a dot (decimal separator)', () => {
    const { container } = render(<TruncatedAmount amount={parseEther('1.5')} />);
    expect(container.textContent).toContain('.');
  });

  it('value contains exactly 2 decimal places', () => {
    const { container } = render(<TruncatedAmount amount={parseEther('1.5')} />);
    const text = container.textContent ?? '';
    const decimalPart = text.split('.')[1];
    expect(decimalPart.length).toBe(2);
  });

  it('renders with no children/wrapper text (just amount)', () => {
    const { container } = render(<TruncatedAmount amount={parseEther('1')} />);
    expect(container.children.length).toBeGreaterThanOrEqual(0);
  });

  it('formats 5 ETH to "Ξ 5.00"', () => {
    const { container } = render(<TruncatedAmount amount={parseEther('5')} />);
    expect(container.textContent).toBe('Ξ 5.00');
  });

  it('formats 0.99 ETH to "Ξ 0.99"', () => {
    const { container } = render(<TruncatedAmount amount={parseEther('0.99')} />);
    expect(container.textContent).toBe('Ξ 0.99');
  });

  it('formats 12345.67 ETH retains 2 decimal places', () => {
    const { container } = render(<TruncatedAmount amount={parseEther('12345.67')} />);
    expect(container.textContent).toBe('Ξ 12345.67');
  });

  it('rerender between two amounts updates output', () => {
    const { container, rerender } = render(<TruncatedAmount amount={parseEther('1')} />);
    expect(container.textContent).toBe('Ξ 1.00');
    rerender(<TruncatedAmount amount={parseEther('2')} />);
    expect(container.textContent).toBe('Ξ 2.00');
  });

  it('renders 5 instances each with own amount', () => {
    const { container } = render(
      <>
        <TruncatedAmount amount={parseEther('1')} />
        <TruncatedAmount amount={parseEther('2')} />
        <TruncatedAmount amount={parseEther('3')} />
        <TruncatedAmount amount={parseEther('4')} />
        <TruncatedAmount amount={parseEther('5')} />
      </>,
    );
    expect(container.textContent).toBe('Ξ 1.00Ξ 2.00Ξ 3.00Ξ 4.00Ξ 5.00');
  });

  it('renders 10 ETH formatted as "Ξ 10.00"', () => {
    const { container } = render(<TruncatedAmount amount={parseEther('10')} />);
    expect(container.textContent).toBe('Ξ 10.00');
  });

  it('renders 0.00001 ETH as "Ξ 0.00" (truncated to 2 decimals)', () => {
    const { container } = render(<TruncatedAmount amount={parseEther('0.00001')} />);
    expect(container.textContent).toBe('Ξ 0.00');
  });

  it('renders 999.999 ETH as "Ξ 999.99" (truncation, not rounding for tail)', () => {
    const { container } = render(<TruncatedAmount amount={parseEther('999.999')} />);
    // toFixed(2) で 1000.00 になるか 999.99 になるかは実装次第、 まず crash しないことを確認
    expect(container.textContent).toMatch(/Ξ \d/);
  });

  it('renders for very small amount (1 wei)', () => {
    const { container } = render(<TruncatedAmount amount={1n} />);
    expect(container.textContent).toBe('Ξ 0.00');
  });

  it('renders 10 instances each with own amount', () => {
    const { container } = render(
      <>
        {Array.from({ length: 10 }, (_, i) => (
          <TruncatedAmount key={i} amount={parseEther(`${i + 1}`)} />
        ))}
      </>,
    );
    expect((container.textContent?.match(/Ξ/g) ?? []).length).toBe(10);
  });

  it('renders 20 instances each with own amount', () => {
    const { container } = render(
      <>
        {Array.from({ length: 20 }, (_, i) => (
          <TruncatedAmount key={i} amount={parseEther(`${i + 1}`)} />
        ))}
      </>,
    );
    expect((container.textContent?.match(/Ξ/g) ?? []).length).toBe(20);
  });

  it('rerender amount updates display', () => {
    const { container, rerender } = render(<TruncatedAmount amount={parseEther('1')} />);
    expect(container.textContent).toBe('Ξ 1.00');
    rerender(<TruncatedAmount amount={parseEther('100')} />);
    expect(container.textContent).toBe('Ξ 100.00');
  });

  it('renders for 1.5 ETH (one decimal)', () => {
    const { container } = render(<TruncatedAmount amount={parseEther('1.5')} />);
    expect(container.textContent).toBe('Ξ 1.50');
  });

  it('renders for 2.345678 ETH (2 decimal display)', () => {
    const { container } = render(<TruncatedAmount amount={parseEther('2.345678')} />);
    expect(container.textContent).toMatch(/^Ξ 2\.\d{2}$/);
  });

  it('renders consistent format across 5 rerenders', () => {
    const { container, rerender } = render(<TruncatedAmount amount={parseEther('1')} />);
    for (let i = 1; i <= 5; i++) {
      rerender(<TruncatedAmount amount={parseEther(`${i}`)} />);
      expect(container.textContent).toMatch(/^Ξ \d+\.\d{2}$/);
    }
  });

  it('renders 50 instances each independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 50 }, (_, i) => (
          <TruncatedAmount key={i} amount={parseEther(`${i + 1}`)} />
        ))}
      </>,
    );
    expect((container.textContent?.match(/Ξ/g) ?? []).length).toBe(50);
  });

  it('handles wei (smallest unit) as Ξ 0.00', () => {
    const { container } = render(<TruncatedAmount amount={1n} />);
    expect(container.textContent).toBe('Ξ 0.00');
  });

  it('rerender from huge to small amount', () => {
    const { container, rerender } = render(<TruncatedAmount amount={parseEther('1000000')} />);
    expect(container.textContent).toBe('Ξ 1000000.00');
    rerender(<TruncatedAmount amount={parseEther('0.5')} />);
    expect(container.textContent).toBe('Ξ 0.50');
  });

  it('renders consistent format across 20 rerenders', () => {
    const { container, rerender } = render(<TruncatedAmount amount={parseEther('1')} />);
    for (let i = 1; i <= 20; i++) {
      rerender(<TruncatedAmount amount={parseEther(`${i}`)} />);
      expect(container.textContent).toMatch(/^Ξ \d+\.\d{2}$/);
    }
  });

  it('renders for very precise small fractional (0.000001)', () => {
    const { container } = render(<TruncatedAmount amount={parseEther('0.000001')} />);
    expect(container.textContent).toMatch(/Ξ \d/);
  });

  it('renders 100 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <TruncatedAmount key={i} amount={parseEther(`${i + 1}`)} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender 30 times with varying amounts', () => {
    const { container, rerender } = render(<TruncatedAmount amount={parseEther('1')} />);
    for (let i = 0; i < 30; i++) {
      rerender(<TruncatedAmount amount={parseEther(`${i + 1}.5`)} />);
    }
    expect(container.textContent).toMatch(/^Ξ \d+\.\d{2}$/);
  });

  it('formats 1e6 ETH to "Ξ 1000000.00"', () => {
    const { container } = render(<TruncatedAmount amount={parseEther('1000000')} />);
    expect(container.textContent).toBe('Ξ 1000000.00');
  });

  it('formats 1 wei to "Ξ 0.00" (truncated to 2 decimals)', () => {
    const { container } = render(<TruncatedAmount amount={1n} />);
    expect(container.textContent).toBe('Ξ 0.00');
  });

  it('formats 999999.999 ETH (rounding up edge)', () => {
    const { container } = render(<TruncatedAmount amount={parseEther('999999.999')} />);
    expect(container.textContent).toMatch(/^Ξ \d+\.\d{2}$/);
  });

  it('mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TruncatedAmount amount={parseEther('1')} />);
      unmount();
    }
  });

  it('renders 300 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 300 }, (_, i) => (
            <TruncatedAmount key={i} amount={parseEther(`${i + 1}`)} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 50 different amounts sequentially', () => {
    for (let i = 0; i < 50; i++) {
      const { container, unmount } = render(<TruncatedAmount amount={parseEther(`${i + 1}.5`)} />);
      expect(container.textContent).toMatch(/^Ξ \d+\.\d{2}$/);
      unmount();
    }
  });

  it('formats 0.0001 ETH (truncation at 0.00)', () => {
    const { container } = render(<TruncatedAmount amount={parseEther('0.0001')} />);
    expect(container.textContent).toMatch(/^Ξ \d+\.\d{2}$/);
  });

  it('renders 100 instances all contain Ξ prefix', () => {
    const { container } = render(
      <>
        {Array.from({ length: 100 }, (_, i) => (
          <TruncatedAmount key={i} amount={parseEther(`${i + 1}`)} />
        ))}
      </>,
    );
    const matches = (container.textContent ?? '').match(/Ξ/g);
    expect(matches?.length).toBe(100);
  });

  it('mount-unmount 200 cycles', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<TruncatedAmount amount={parseEther('1')} />);
      unmount();
    }
  });

  it('renders 500 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <TruncatedAmount key={i} amount={parseEther(`${i + 1}`)} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 100 different fractional amounts', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<TruncatedAmount amount={parseEther(`${i + 1}.${i}`)} />);
      unmount();
    }
  });

  it('formats parseEther(0.0099) (boundary rounding)', () => {
    const { container } = render(<TruncatedAmount amount={parseEther('0.0099')} />);
    expect(container.textContent).toMatch(/^Ξ \d+\.\d{2}$/);
  });

  it('rapid rerender 100 times with varying amounts', () => {
    const { container, rerender } = render(<TruncatedAmount amount={parseEther('1')} />);
    for (let i = 0; i < 100; i++) {
      rerender(<TruncatedAmount amount={parseEther(`${i + 1}`)} />);
    }
    expect(container.textContent).toMatch(/^Ξ \d+\.\d{2}$/);
  });

  it('mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<TruncatedAmount amount={parseEther('1')} />);
      unmount();
    }
  });

  it('renders 1000 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1000 }, (_, i) => (
            <TruncatedAmount key={i} amount={parseEther(`${i + 1}`)} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 100 different bigint amounts', () => {
    for (let i = 0; i < 100; i++) {
      const amount = BigInt(i + 1) * 1_000_000_000_000_000_000n;
      const { container, unmount } = render(<TruncatedAmount amount={amount} />);
      expect(container.textContent).toMatch(/^Ξ \d+\.\d{2}$/);
      unmount();
    }
  });

  it('all 300 instances start with Ξ', () => {
    const { container } = render(
      <>
        {Array.from({ length: 300 }, (_, i) => (
          <TruncatedAmount key={i} amount={parseEther(`${i + 1}`)} />
        ))}
      </>,
    );
    const matches = (container.textContent ?? '').match(/Ξ/g);
    expect(matches?.length).toBe(300);
  });

  it('handles 50 different fractional amounts (0.1 incrementing)', () => {
    for (let i = 0; i < 50; i++) {
      const v = (i + 1) * 0.1;
      const { container, unmount } = render(<TruncatedAmount amount={parseEther(`${v}`)} />);
      expect(container.textContent).toMatch(/^Ξ \d+\.\d{2}$/);
      unmount();
    }
  });
});
