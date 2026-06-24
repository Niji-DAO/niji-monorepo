import { describe, expect, it } from 'vitest';

import { contract2humanUSDCFormat, human2ContractUSDCFormat } from './usdcUtils';

describe('human2ContractUSDCFormat', () => {
  it('converts whole number to 6 decimal places contract format', () => {
    expect(human2ContractUSDCFormat('100')).toBe('100000000');
    expect(human2ContractUSDCFormat(100)).toBe('100000000');
  });

  it('handles decimal input', () => {
    expect(human2ContractUSDCFormat('1.5')).toBe('1500000');
    expect(human2ContractUSDCFormat('0.001')).toBe('1000');
  });

  it('handles zero', () => {
    expect(human2ContractUSDCFormat('0')).toBe('0');
  });

  it('rounds fractional contract micro-USDC', () => {
    expect(human2ContractUSDCFormat('1.0000001')).toBe('1000000');
  });
});

describe('contract2humanUSDCFormat', () => {
  it('converts contract format to human format with 3 decimal default', () => {
    expect(contract2humanUSDCFormat('100000000')).toBe('100.000');
    expect(contract2humanUSDCFormat('1500000')).toBe('1.500');
  });

  it('returns all decimals when allDecimals=true', () => {
    expect(contract2humanUSDCFormat('1000001', true)).toBe('1.000001');
  });

  it('handles zero', () => {
    expect(contract2humanUSDCFormat('0')).toBe('0.000');
  });

  it('handles zero with allDecimals=true', () => {
    expect(contract2humanUSDCFormat('0', true)).toBe('0');
  });

  it('rounds .toFixed(3) at boundary (1500 micro USDC = 0.0015 → 0.002)', () => {
    expect(contract2humanUSDCFormat('1500')).toBe('0.002');
  });

  it('handles negative contract amount', () => {
    expect(contract2humanUSDCFormat('-1500000')).toBe('-1.500');
  });

  it('large contract amount produces correct human format', () => {
    expect(contract2humanUSDCFormat('1000000000000')).toBe('1000000.000');
  });

  it('numeric input (not string) is also supported', () => {
    expect(contract2humanUSDCFormat(2000000 as never)).toBe('2.000');
  });
});

describe('human2ContractUSDCFormat edge cases', () => {
  it('handles negative human amount', () => {
    expect(human2ContractUSDCFormat('-1.5')).toBe('-1500000');
  });

  it('handles very large number', () => {
    expect(human2ContractUSDCFormat('1000000')).toBe('1000000000000');
  });

  it('handles 6-decimal precision exactly', () => {
    expect(human2ContractUSDCFormat('0.000001')).toBe('1');
  });

  it('rounds tiny sub-micro USDC to 0', () => {
    expect(human2ContractUSDCFormat('0.0000001')).toBe('0');
  });
});
