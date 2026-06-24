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
});
