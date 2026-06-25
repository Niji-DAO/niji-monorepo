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
});
