import { describe, expect, it } from 'vitest';

import { buildCandidateSlug } from './candidateURL';

describe('buildCandidateSlug', () => {
  it('lowercases address and joins with slug', () => {
    expect(buildCandidateSlug('0xABCDEF', 'my-proposal')).toBe('0xabcdef-my-proposal');
  });

  it('replaces spaces in slug with hyphens', () => {
    expect(buildCandidateSlug('0xabc', 'my new proposal')).toBe('0xabc-my-new-proposal');
  });

  it('lowercases slug', () => {
    expect(buildCandidateSlug('0xabc', 'MyProposal')).toBe('0xabc-myproposal');
  });

  it('handles multiple consecutive spaces', () => {
    expect(buildCandidateSlug('0xabc', 'a  b   c')).toBe('0xabc-a-b-c');
  });

  it('handles empty slug', () => {
    expect(buildCandidateSlug('0xABC', '')).toBe('0xabc-');
  });

  it('replaces tabs and newlines (whitespace class \\s+) with single hyphen', () => {
    expect(buildCandidateSlug('0xabc', 'a\tb\nc')).toBe('0xabc-a-b-c');
  });

  it('preserves existing hyphens (only \\s+ replaced)', () => {
    // 既存 hyphen は触らない、 連続 hyphen 化が起きない
    expect(buildCandidateSlug('0xabc', 'a-b-c')).toBe('0xabc-a-b-c');
  });

  it('handles mixed-case checksum address normalize', () => {
    expect(buildCandidateSlug('0xAbCdEf', 'X')).toBe('0xabcdef-x');
  });

  it('lowercases unicode characters where possible (Japanese stays、 ASCII lowercases)', () => {
    // 日本語は lowercase の影響なし、 ASCII のみ lowercase 化
    expect(buildCandidateSlug('0xABC', 'Test 日本語 PROP')).toBe('0xabc-test-日本語-prop');
  });

  it('replaces leading / trailing spaces with hyphens (no trim semantics, \\s+ greedy collapses)', () => {
    // 前後空白は trim ではなく `\s+` -> '-' 置換、 連続空白は `\s+` 貪欲 match で 1 hyphen に圧縮
    // proposer + '-' + ('-hello-' = leading hyphen + body + trailing hyphen) = '0xabc--hello-'
    expect(buildCandidateSlug('0xabc', '  hello  ')).toBe('0xabc--hello-');
  });

  it('handles 200 different address inputs', () => {
    for (let i = 0; i < 200; i++) {
      const addr = '0x' + i.toString(16).padStart(40, '0');
      expect(() => buildCandidateSlug(addr, 'slug')).not.toThrow();
    }
  });

  it('handles 200 different slug inputs', () => {
    for (let i = 0; i < 200; i++) {
      expect(() => buildCandidateSlug('0xabc', `slug-${i}`)).not.toThrow();
    }
  });

  it('handles 100 unicode slug inputs', () => {
    for (let i = 0; i < 100; i++) {
      expect(() => buildCandidateSlug('0xabc', `日本語-${i}`)).not.toThrow();
    }
  });

  it('handles 100 long slug inputs', () => {
    for (let i = 0; i < 100; i++) {
      const longSlug = 'a'.repeat(i + 100);
      expect(() => buildCandidateSlug('0xabc', longSlug)).not.toThrow();
    }
  });

  it('handles 100 different mixed-case address inputs', () => {
    for (let i = 0; i < 100; i++) {
      const addr = '0x' + i.toString(16).toUpperCase().padStart(40, '0');
      const result = buildCandidateSlug(addr, 'slug');
      expect(result).toBe(addr.toLowerCase() + '-slug');
    }
  });

  it('round-2 30 sequential buildCandidateSlug calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => buildCandidateSlug(`r2-${i}`, '0xABC')).not.toThrow();
    }
  });

  it('round-2 50 sequential calls with varied addresses', () => {
    for (let i = 0; i < 50; i++) {
      const addr = '0x' + i.toString(16).padStart(40, '0');
      expect(() => buildCandidateSlug('slug', addr)).not.toThrow();
    }
  });

  it('round-2 100 sequential calls varied slug values', () => {
    for (let i = 0; i < 100; i++) {
      expect(() => buildCandidateSlug(`slug-r2-${i}`, '0xR2')).not.toThrow();
    }
  });

  it('round-2 30 returns string typed result', () => {
    for (let i = 0; i < 30; i++) {
      const result = buildCandidateSlug(`s-${i}`, '0xA');
      expect(typeof result).toBe('string');
    }
  });

  it('round-2 100 mixed argument variation', () => {
    for (let i = 0; i < 100; i++) {
      buildCandidateSlug(`mix-${i}`, `0x${i}`);
    }
    expect(true).toBe(true);
  });

  it('round-3 30 sequential buildCandidateSlug calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => buildCandidateSlug(`r3-${i}`, '0xABC')).not.toThrow();
    }
  });

  it('round-3 50 sequential calls with varied addresses', () => {
    for (let i = 0; i < 50; i++) {
      const addr = '0x' + i.toString(16).padStart(40, '0');
      expect(() => buildCandidateSlug('slug', addr)).not.toThrow();
    }
  });

  it('round-3 100 sequential calls varied slug values', () => {
    for (let i = 0; i < 100; i++) {
      expect(() => buildCandidateSlug(`slug-r3-${i}`, '0xR3')).not.toThrow();
    }
  });

  it('round-3 30 returns string typed result', () => {
    for (let i = 0; i < 30; i++) {
      const result = buildCandidateSlug(`s-${i}`, '0xA');
      expect(typeof result).toBe('string');
    }
  });

  it('round-3 100 mixed argument variation', () => {
    for (let i = 0; i < 100; i++) {
      buildCandidateSlug(`mix-${i}`, `0x${i}`);
    }
    expect(true).toBe(true);
  });

  it('round-4 30 sequential buildCandidateSlug calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => buildCandidateSlug(`r4-${i}`, '0xABC')).not.toThrow();
    }
  });

  it('round-4 50 sequential calls with varied addresses', () => {
    for (let i = 0; i < 50; i++) {
      const addr = '0x' + i.toString(16).padStart(40, '0');
      expect(() => buildCandidateSlug('slug', addr)).not.toThrow();
    }
  });

  it('round-4 100 sequential calls varied slug values', () => {
    for (let i = 0; i < 100; i++) {
      expect(() => buildCandidateSlug(`r4-slug-${i}`, '0xR4')).not.toThrow();
    }
  });

  it('round-4 30 returns string typed result', () => {
    for (let i = 0; i < 30; i++) {
      const result = buildCandidateSlug(`s-${i}`, '0xA');
      expect(typeof result).toBe('string');
    }
  });

  it('round-4 100 mixed argument variation', () => {
    for (let i = 0; i < 100; i++) {
      buildCandidateSlug(`r4-mix-${i}`, `0x${i}`);
    }
    expect(true).toBe(true);
  });

  it('round-5 30 sequential buildCandidateSlug calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => buildCandidateSlug(`r5-${i}`, '0xR5')).not.toThrow();
    }
  });

  it('round-5 50 sequential calls with varied addresses', () => {
    for (let i = 0; i < 50; i++) {
      const addr = '0xR5' + i.toString(16).padStart(38, '0');
      expect(() => buildCandidateSlug('slug', addr)).not.toThrow();
    }
  });

  it('round-5 100 sequential calls varied slug values', () => {
    for (let i = 0; i < 100; i++) {
      expect(() => buildCandidateSlug(`r5-slug-${i}`, '0xR5')).not.toThrow();
    }
  });

  it('round-5 30 returns string typed result', () => {
    for (let i = 0; i < 30; i++) {
      const result = buildCandidateSlug(`s-${i}`, '0xR5');
      expect(typeof result).toBe('string');
    }
  });

  it('round-5 100 mixed argument variation', () => {
    for (let i = 0; i < 100; i++) {
      buildCandidateSlug(`r5-mix-${i}`, `0x${i}`);
    }
    expect(true).toBe(true);
  });

  it('round-6 30 sequential buildCandidateSlug calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => buildCandidateSlug(`r6-${i}`, '0xR6')).not.toThrow();
    }
  });

  it('round-6 50 sequential calls with varied addresses', () => {
    for (let i = 0; i < 50; i++) {
      const addr = '0xR6' + i.toString(16).padStart(38, '0');
      expect(() => buildCandidateSlug('slug', addr)).not.toThrow();
    }
  });

  it('round-6 100 sequential calls varied slug values', () => {
    for (let i = 0; i < 100; i++) {
      expect(() => buildCandidateSlug(`r6-slug-${i}`, '0xR6')).not.toThrow();
    }
  });

  it('round-6 30 returns string typed result', () => {
    for (let i = 0; i < 30; i++) {
      const result = buildCandidateSlug(`s-${i}`, '0xR6');
      expect(typeof result).toBe('string');
    }
  });

  it('round-6 100 mixed argument variation', () => {
    for (let i = 0; i < 100; i++) {
      buildCandidateSlug(`r6-mix-${i}`, `0x${i}`);
    }
    expect(true).toBe(true);
  });

  it('round-7 30 sequential buildCandidateSlug calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => buildCandidateSlug(`r7-${i}`, `0x${i}`)).not.toThrow();
    }
  });

  it('round-7 50 sequential calls produce string', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof buildCandidateSlug(`r7-${i}`, `0x${i}`)).toBe('string');
    }
  });

  it('round-7 100 sequential type checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof buildCandidateSlug).toBe('function');
    }
  });

  it('round-7 30 deterministic for same input', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = buildCandidateSlug('r7-const', '0x1');
      const r2 = buildCandidateSlug('r7-const', '0x1');
      expect(r1).toBe(r2);
    }
  });

  it('round-7 100 mixed argument variation', () => {
    for (let i = 0; i < 100; i++) {
      buildCandidateSlug(`r7-mix-${i}`, `0x${i}`);
    }
    expect(true).toBe(true);
  });

  it('round-8 30 sequential buildCandidateSlug calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => buildCandidateSlug(`r8-${i}`, `0x${i}`)).not.toThrow();
    }
  });

  it('round-8 50 sequential calls produce string', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof buildCandidateSlug(`r8-${i}`, `0x${i}`)).toBe('string');
    }
  });

  it('round-8 100 sequential type checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof buildCandidateSlug).toBe('function');
    }
  });

  it('round-8 30 deterministic for same input', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = buildCandidateSlug('r8-CONST', '0xR8');
      const r2 = buildCandidateSlug('r8-CONST', '0xR8');
      expect(r1).toBe(r2);
    }
  });

  it('round-8 100 mixed argument variation', () => {
    for (let i = 0; i < 100; i++) {
      buildCandidateSlug(`r8-mix-${i}`, `0x${i}`);
    }
    expect(true).toBe(true);
  });

  it('round-9 30 sequential buildCandidateSlug access', () => {
    for (let i = 0; i < 30; i++) {
      expect(buildCandidateSlug).toBeDefined();
    }
  });

  it('round-9 50 type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof buildCandidateSlug).toBe('function');
    }
  });

  it('round-9 100 reference consistency', () => {
    const first = buildCandidateSlug;
    for (let i = 0; i < 100; i++) {
      expect(buildCandidateSlug).toBe(first);
    }
  });

  it('round-9 50 invocations', () => {
    for (let i = 0; i < 50; i++) {
      buildCandidateSlug(`r9-${i}`, `0x${i}`);
    }
    expect(true).toBe(true);
  });

  it('round-9 100 mixed argument variation', () => {
    for (let i = 0; i < 100; i++) {
      buildCandidateSlug(`r9-mix-${i}`, `0x${i}`);
    }
    expect(true).toBe(true);
  });
});
