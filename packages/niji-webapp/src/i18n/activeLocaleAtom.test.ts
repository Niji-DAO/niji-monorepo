import { describe, expect, it, vi } from 'vitest';

vi.mock('jotai/utils', () => ({
  atomWithStorage: <T>(_key: string, init: T) => ({ tag: 'atomWithStorage', init }),
  createJSONStorage: () => ({}),
}));

vi.mock('jotai/vanilla', () => ({
  atom: (read: unknown, write: unknown) => ({ tag: 'atom', read, write }),
}));

vi.mock('jotai-effect', () => ({
  withAtomEffect: (a: unknown) => a,
}));

vi.mock('./NijiI18nProvider', () => ({
  dynamicActivate: vi.fn(),
}));

import { pickSupportedLocale } from './activeLocaleAtom';

describe('pickSupportedLocale', () => {
  it('returns exact match for ja-JP', () => {
    expect(pickSupportedLocale(['ja-JP'])).toBe('ja-JP');
  });

  it('returns exact match for en-US', () => {
    expect(pickSupportedLocale(['en-US'])).toBe('en-US');
  });

  it('returns exact match for zh-CN', () => {
    expect(pickSupportedLocale(['zh-CN'])).toBe('zh-CN');
  });

  it('returns ja-JP for base "ja" match (e.g. "ja-XX")', () => {
    expect(pickSupportedLocale(['ja-XX'])).toBe('ja-JP');
  });

  it('returns en-US for base "en" match (e.g. "en-GB")', () => {
    expect(pickSupportedLocale(['en-GB'])).toBe('en-US');
  });

  it('returns zh-CN for base "zh" match (e.g. "zh-TW")', () => {
    expect(pickSupportedLocale(['zh-TW'])).toBe('zh-CN');
  });

  it('skips null candidates and uses next', () => {
    expect(pickSupportedLocale([null, 'en-US'])).toBe('en-US');
  });

  it('skips undefined candidates and uses next', () => {
    expect(pickSupportedLocale([undefined, 'zh-CN'])).toBe('zh-CN');
  });

  it('returns DEFAULT_LOCALE (ja-JP) when no candidates match', () => {
    expect(pickSupportedLocale(['fr', 'de-DE', 'ko'])).toBe('ja-JP');
  });

  it('returns DEFAULT_LOCALE (ja-JP) for empty candidates array', () => {
    expect(pickSupportedLocale([])).toBe('ja-JP');
  });

  it('prefers first matching candidate over later matches', () => {
    expect(pickSupportedLocale(['en-US', 'zh-CN'])).toBe('en-US');
  });

  it('returns DEFAULT_LOCALE when all candidates are null/undefined', () => {
    expect(pickSupportedLocale([null, undefined, null])).toBe('ja-JP');
  });

  it('handles 100 different locale list inputs', () => {
    for (let i = 0; i < 100; i++) {
      expect(() => pickSupportedLocale([`lang-${i}`])).not.toThrow();
    }
  });

  it('handles 100 cycles of null defaulting to ja-JP', () => {
    for (let i = 0; i < 100; i++) {
      expect(pickSupportedLocale([null])).toBe('ja-JP');
    }
  });

  it('handles 100 cycles of empty list', () => {
    for (let i = 0; i < 100; i++) {
      expect(() => pickSupportedLocale([])).not.toThrow();
    }
  });

  it('handles 100 cycles of en-US', () => {
    for (let i = 0; i < 100; i++) {
      expect(pickSupportedLocale(['en-US'])).toBe('en-US');
    }
  });

  it('rapid 200 invocations', () => {
    for (let i = 0; i < 200; i++) {
      expect(() => pickSupportedLocale(['en-US', 'ja-JP'])).not.toThrow();
    }
  });
});
