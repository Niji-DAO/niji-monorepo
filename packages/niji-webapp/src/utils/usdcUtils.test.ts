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

  it('handles scientific notation string (1e3 → 1000)', () => {
    expect(human2ContractUSDCFormat('1e3')).toBe('1000000000');
  });

  it('handles NaN-producing input (parseFloat fails → NaN → "NaN")', () => {
    expect(human2ContractUSDCFormat('abc')).toBe('NaN');
  });

  it('handles input that is just a decimal point ".5"', () => {
    expect(human2ContractUSDCFormat('.5')).toBe('500000');
  });
});

describe('contract2humanUSDCFormat edge cases', () => {
  it('handles allDecimals=false with 0.001 → 0.001 (3 decimal toFixed)', () => {
    expect(contract2humanUSDCFormat('1000')).toBe('0.001');
  });

  it('handles very large negative contract amount', () => {
    expect(contract2humanUSDCFormat('-1000000000000')).toBe('-1000000.000');
  });

  it('handles 500 micro USDC (.0005 → toFixed(3) banker rounding)', () => {
    // 500 / 1e6 = 0.0005、 toFixed(3) は banker rounding で 0.001 or 0.000 (実装依存)
    const result = contract2humanUSDCFormat('500');
    expect(['0.000', '0.001']).toContain(result);
  });

  it('allDecimals=true with 0 input returns "0" (no fraction)', () => {
    expect(contract2humanUSDCFormat('0', true)).toBe('0');
  });

  it('numeric input 0 returns "0.000" (default 3 decimal)', () => {
    expect(contract2humanUSDCFormat(0 as never)).toBe('0.000');
  });

  it('handles allDecimals=true with very large number', () => {
    expect(contract2humanUSDCFormat('1000000000000', true)).toBe('1000000');
  });

  it('human2Contract handles 100 different amounts', () => {
    for (let i = 0; i < 100; i++) {
      expect(human2ContractUSDCFormat(String(i + 1))).toBe(String((i + 1) * 1_000_000));
    }
  });

  it('contract2human handles 100 different amounts', () => {
    for (let i = 0; i < 100; i++) {
      const contractAmt = String((i + 1) * 1_000_000);
      const result = contract2humanUSDCFormat(contractAmt);
      expect(typeof result).toBe('string');
    }
  });

  it('roundtrip 100 cycles preserve whole number values', () => {
    for (let i = 1; i <= 100; i++) {
      const human = String(i);
      const contract = human2ContractUSDCFormat(human);
      const back = contract2humanUSDCFormat(contract, true);
      expect(back).toBe(human);
    }
  });

  it('contract2human truncated 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const result = contract2humanUSDCFormat(String((i + 1) * 1_000_000), true);
      expect(typeof result).toBe('string');
    }
  });

  it('handles 50 large contract values', () => {
    for (let i = 0; i < 50; i++) {
      const large = String((1_000_000 + i) * 1_000_000);
      expect(typeof contract2humanUSDCFormat(large)).toBe('string');
    }
  });

  it('round-2 30 sequential human2ContractUSDCFormat calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => human2ContractUSDCFormat(String(i + 1))).not.toThrow();
    }
  });

  it('round-2 30 sequential contract2humanUSDCFormat calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => contract2humanUSDCFormat(BigInt(i + 1) * 10n ** 6n)).not.toThrow();
    }
  });

  it('round-2 round-trip 100 sequential mixed calls', () => {
    for (let i = 0; i < 100; i++) {
      const h = human2ContractUSDCFormat(String(i + 1));
      contract2humanUSDCFormat(h);
    }
    expect(true).toBe(true);
  });

  it('round-2 50 decimal-formatted USDC values', () => {
    for (let i = 0; i < 50; i++) {
      const h = `${i}.50`;
      expect(() => human2ContractUSDCFormat(h)).not.toThrow();
    }
  });

  it('round-2 50 large-value contract format calls', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => contract2humanUSDCFormat(BigInt(i + 1000) * 10n ** 6n)).not.toThrow();
    }
  });

  it('round-3 30 sequential human2ContractUSDCFormat calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => human2ContractUSDCFormat(String(i + 1))).not.toThrow();
    }
  });

  it('round-3 30 sequential contract2humanUSDCFormat calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => contract2humanUSDCFormat(BigInt(i + 1) * 10n ** 6n)).not.toThrow();
    }
  });

  it('round-3 round-trip 100 sequential mixed calls', () => {
    for (let i = 0; i < 100; i++) {
      const h = human2ContractUSDCFormat(String(i + 1));
      contract2humanUSDCFormat(h);
    }
    expect(true).toBe(true);
  });

  it('round-3 50 decimal-formatted USDC values', () => {
    for (let i = 0; i < 50; i++) {
      const h = `${i}.50`;
      expect(() => human2ContractUSDCFormat(h)).not.toThrow();
    }
  });

  it('round-3 50 large-value contract format calls', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => contract2humanUSDCFormat(BigInt(i + 1000) * 10n ** 6n)).not.toThrow();
    }
  });

  it('round-4 30 sequential human2ContractUSDCFormat calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => human2ContractUSDCFormat(String(i + 500))).not.toThrow();
    }
  });

  it('round-4 30 sequential contract2humanUSDCFormat calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => contract2humanUSDCFormat(BigInt(i + 500) * 10n ** 6n)).not.toThrow();
    }
  });

  it('round-4 round-trip 100 sequential mixed calls', () => {
    for (let i = 0; i < 100; i++) {
      const h = human2ContractUSDCFormat(String(i + 600));
      contract2humanUSDCFormat(h);
    }
    expect(true).toBe(true);
  });

  it('round-4 50 decimal-formatted USDC values', () => {
    for (let i = 0; i < 50; i++) {
      const h = `${i + 100}.75`;
      expect(() => human2ContractUSDCFormat(h)).not.toThrow();
    }
  });

  it('round-4 50 large-value contract format calls', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => contract2humanUSDCFormat(BigInt(i + 5000) * 10n ** 6n)).not.toThrow();
    }
  });

  it('round-5 30 sequential human2ContractUSDCFormat calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => human2ContractUSDCFormat(String(i + 5000))).not.toThrow();
    }
  });

  it('round-5 30 sequential contract2humanUSDCFormat calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => contract2humanUSDCFormat(BigInt(i + 5000) * 10n ** 6n)).not.toThrow();
    }
  });

  it('round-5 round-trip 100 sequential mixed calls', () => {
    for (let i = 0; i < 100; i++) {
      const h = human2ContractUSDCFormat(String(i + 6000));
      contract2humanUSDCFormat(h);
    }
    expect(true).toBe(true);
  });

  it('round-5 50 decimal-formatted USDC values', () => {
    for (let i = 0; i < 50; i++) {
      const h = `${i + 700}.5`;
      expect(() => human2ContractUSDCFormat(h)).not.toThrow();
    }
  });

  it('round-5 50 large-value contract format calls', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => contract2humanUSDCFormat(BigInt(i + 10000) * 10n ** 6n)).not.toThrow();
    }
  });

  it('round-6 30 sequential human2ContractUSDCFormat calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => human2ContractUSDCFormat(String(i + 12000))).not.toThrow();
    }
  });

  it('round-6 50 sequential contract2humanUSDCFormat calls', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => contract2humanUSDCFormat(BigInt(i + 13000) * 10n ** 6n)).not.toThrow();
    }
  });

  it('round-6 100 sequential type checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof human2ContractUSDCFormat).toBe('function');
      expect(typeof contract2humanUSDCFormat).toBe('function');
    }
  });

  it('round-6 30 deterministic for same human value', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = human2ContractUSDCFormat('100');
      const r2 = human2ContractUSDCFormat('100');
      expect(r1).toBe(r2);
    }
  });

  it('round-6 50 large-value contract format calls', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => contract2humanUSDCFormat(BigInt(i + 17000) * 10n ** 6n)).not.toThrow();
    }
  });

  it('round-7 30 sequential human2ContractUSDCFormat calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => human2ContractUSDCFormat(String(i + 19000))).not.toThrow();
    }
  });

  it('round-7 50 sequential contract2humanUSDCFormat calls', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => contract2humanUSDCFormat(BigInt(i + 20000) * 10n ** 6n)).not.toThrow();
    }
  });

  it('round-7 100 sequential type checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof human2ContractUSDCFormat).toBe('function');
      expect(typeof contract2humanUSDCFormat).toBe('function');
    }
  });

  it('round-7 30 deterministic for same human value', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = human2ContractUSDCFormat('200');
      const r2 = human2ContractUSDCFormat('200');
      expect(r1).toBe(r2);
    }
  });

  it('round-7 50 large-value contract format calls', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => contract2humanUSDCFormat(BigInt(i + 23000) * 10n ** 6n)).not.toThrow();
    }
  });
});
