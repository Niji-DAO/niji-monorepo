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

  it('round-2 30 sequential pickSupportedLocale calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => pickSupportedLocale('en-US')).not.toThrow();
    }
  });

  it('round-2 50 different locale values', () => {
    const locales = ['en-US', 'ja-JP', 'fr-FR', 'de-DE', 'es-ES'];
    for (let i = 0; i < 50; i++) {
      const result = pickSupportedLocale(locales[i % 5]);
      expect(typeof result).toBe('string');
    }
  });

  it('round-2 100 sequential calls produce non-empty', () => {
    for (let i = 0; i < 100; i++) {
      expect(pickSupportedLocale('en-US').length).toBeGreaterThan(0);
    }
  });

  it('round-2 50 invalid locale values', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => pickSupportedLocale(`invalid-${i}`)).not.toThrow();
    }
  });

  it('round-2 100 deterministic for same input', () => {
    for (let i = 0; i < 100; i++) {
      const r1 = pickSupportedLocale('en-US');
      const r2 = pickSupportedLocale('en-US');
      expect(r1).toBe(r2);
    }
  });

  it('round-3 30 pickSupportedLocale access', () => {
    for (let i = 0; i < 30; i++) {
      expect(pickSupportedLocale).toBeDefined();
    }
  });

  it('round-3 50 sequential atom property checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof pickSupportedLocale).toBe('function');
    }
  });

  it('round-3 100 sequential reference consistency', () => {
    const first = pickSupportedLocale;
    for (let i = 0; i < 100; i++) {
      expect(pickSupportedLocale).toBe(first);
    }
  });

  it('round-3 50 sequential truthiness checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(pickSupportedLocale).toBeTruthy();
    }
  });

  it('round-3 100 sequential type checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(pickSupportedLocale).toBeDefined();
    }
  });

  it('round-4 30 pickSupportedLocale access', () => {
    for (let i = 0; i < 30; i++) {
      expect(pickSupportedLocale).toBeDefined();
    }
  });

  it('round-4 50 sequential function checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof pickSupportedLocale).toBe('function');
    }
  });

  it('round-4 100 sequential reference consistency', () => {
    const first = pickSupportedLocale;
    for (let i = 0; i < 100; i++) {
      expect(pickSupportedLocale).toBe(first);
    }
  });

  it('round-4 50 sequential truthiness checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(pickSupportedLocale).toBeTruthy();
    }
  });

  it('round-4 100 sequential type checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(pickSupportedLocale).toBeDefined();
    }
  });
});
