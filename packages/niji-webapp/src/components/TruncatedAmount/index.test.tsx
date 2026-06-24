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
});
