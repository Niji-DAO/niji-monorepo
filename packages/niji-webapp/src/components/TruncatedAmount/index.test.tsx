import { render } from '@testing-library/react';
import { parseEther } from 'viem';
import { describe, expect, it } from 'vitest';

import TruncatedAmount from './index';

/**
 * TruncatedAmount 仕様 (2026-07-23 更新):
 *   ethNum === 0        → "Ξ 0.00"
 *   ethNum >= 0.01      → "Ξ {toFixed(2)}"
 *   0 < ethNum < 0.01   → 「最初の非零桁 + 1 桁」 有効数字を確保、 trailing zero 除去
 *
 * 旧仕様 (toFixed(2) 固定) は 0.001 が「Ξ 0.00」 に潰れて実額を判別できず、 min bid が
 * 0.001 等の低 reservePrice (Base Sepolia) で入札履歴 / 現在値が全部 0 に見える問題を起こした。
 */

describe('TruncatedAmount', () => {
  it('formats 0 ETH to "Ξ 0.00"', () => {
    const { container } = render(<TruncatedAmount amount={0n} />);
    expect(container.textContent).toBe('Ξ 0.00');
  });

  it('formats 1 ETH to "Ξ 1.00"', () => {
    const { container } = render(<TruncatedAmount amount={parseEther('1')} />);
    expect(container.textContent).toBe('Ξ 1.00');
  });

  it('formats 1.05 ETH to "Ξ 1.05"', () => {
    const { container } = render(<TruncatedAmount amount={parseEther('1.05')} />);
    expect(container.textContent).toBe('Ξ 1.05');
  });

  it('truncates 1.2345 ETH to "Ξ 1.23" (2 decimal places for >= 0.01)', () => {
    const { container } = render(<TruncatedAmount amount={parseEther('1.2345')} />);
    expect(container.textContent).toBe('Ξ 1.23');
  });

  it('formats 0.1 ETH to "Ξ 0.10"', () => {
    const { container } = render(<TruncatedAmount amount={parseEther('0.1')} />);
    expect(container.textContent).toBe('Ξ 0.10');
  });

  it('formats 0.05 ETH to "Ξ 0.05"', () => {
    const { container } = render(<TruncatedAmount amount={parseEther('0.05')} />);
    expect(container.textContent).toBe('Ξ 0.05');
  });

  it('formats 0.01 ETH to "Ξ 0.01" (boundary)', () => {
    const { container } = render(<TruncatedAmount amount={parseEther('0.01')} />);
    expect(container.textContent).toBe('Ξ 0.01');
  });

  it('formats 0.001 ETH to "Ξ 0.001" (旧仕様の "Ξ 0.00" 潰れを回避)', () => {
    const { container } = render(<TruncatedAmount amount={parseEther('0.001')} />);
    expect(container.textContent).toBe('Ξ 0.001');
  });

  it('formats 0.0012 ETH to "Ξ 0.0012"', () => {
    const { container } = render(<TruncatedAmount amount={parseEther('0.0012')} />);
    expect(container.textContent).toBe('Ξ 0.0012');
  });

  it('formats 0.0001 ETH to "Ξ 0.0001"', () => {
    const { container } = render(<TruncatedAmount amount={parseEther('0.0001')} />);
    expect(container.textContent).toBe('Ξ 0.0001');
  });

  it('formats 0.00012 ETH to "Ξ 0.00012"', () => {
    const { container } = render(<TruncatedAmount amount={parseEther('0.00012')} />);
    expect(container.textContent).toBe('Ξ 0.00012');
  });

  it('formats 100 ETH to "Ξ 100.00"', () => {
    const { container } = render(<TruncatedAmount amount={parseEther('100')} />);
    expect(container.textContent).toBe('Ξ 100.00');
  });

  it('formats 1000 ETH to "Ξ 1000.00"', () => {
    const { container } = render(<TruncatedAmount amount={parseEther('1000')} />);
    expect(container.textContent).toBe('Ξ 1000.00');
  });

  it('formats 0.999 ETH to "Ξ 1.00" (toFixed half-up)', () => {
    const { container } = render(<TruncatedAmount amount={parseEther('0.999')} />);
    expect(container.textContent).toBe('Ξ 1.00');
  });

  it('formats 0.005 ETH to "Ξ 0.01" (toFixed half-up for >= 0.01 branch is not hit、 0.005 < 0.01)', () => {
    // 0.005 < 0.01 なので小額 branch、 magnitude=3 → toFixed(4)="0.0050" → parseFloat → "0.005"
    const { container } = render(<TruncatedAmount amount={parseEther('0.005')} />);
    expect(container.textContent).toBe('Ξ 0.005');
  });

  it('output always starts with "Ξ" prefix', () => {
    const cases = [0n, parseEther('0.001'), parseEther('0.5'), parseEther('1'), parseEther('1000')];
    cases.forEach(amount => {
      const { container } = render(<TruncatedAmount amount={amount} />);
      expect(container.textContent?.startsWith('Ξ')).toBe(true);
    });
  });
});
