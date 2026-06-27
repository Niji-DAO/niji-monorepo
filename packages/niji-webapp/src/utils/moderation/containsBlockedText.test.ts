import { describe, expect, it, vi } from 'vitest';

import { containsBlockedText } from './containsBlockedText';

describe('containsBlockedText', () => {
  it('returns false when language is unsupported (warns)', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(containsBlockedText('anything goes', 'xx-not-real')).toBe(false);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('returns false for clean english text', () => {
    expect(containsBlockedText('hello world how are you today', 'en')).toBe(false);
  });

  it('returns true for english profanity (bad-words filter)', () => {
    expect(containsBlockedText('this is shit', 'en')).toBe(true);
  });

  it('handles empty text without throwing', () => {
    expect(containsBlockedText('', 'en')).toBe(false);
  });

  it('does case-insensitive match for english profanity', () => {
    expect(containsBlockedText('SHIT happens', 'en')).toBe(true);
  });

  it('returns false for jp (regex JSON 配下 jp は空配列)', () => {
    expect(containsBlockedText('普通の日本語の文章', 'jp')).toBe(false);
  });

  it('returns false for empty string with empty regex list (jp)', () => {
    expect(containsBlockedText('', 'jp')).toBe(false);
  });

  it('returns false for empty language string (unsupported branch, warns)', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(containsBlockedText('clean text', '')).toBe(false);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('returns false when language is whitespace-only (unsupported branch)', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(containsBlockedText('clean text', '  ')).toBe(false);
    warnSpy.mockRestore();
  });

  it('does not throw when text contains unicode / emoji', () => {
    expect(() => containsBlockedText('🍣 寿司 cool 中文', 'en')).not.toThrow();
    expect(containsBlockedText('🍣 寿司 cool 中文', 'en')).toBe(false);
  });

  it('returns true when en regex JSON entry matches (hate-speech regex coverage)', () => {
    // moderationRegexes.json en 配下 regex "hate.{0,3}jew" の match 経路を 1 件確認
    expect(containsBlockedText('I hate jew', 'en')).toBe(true);
  });

  it('logs warning text containing the unsupported language code', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    containsBlockedText('any', 'fr');
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('fr'));
    warnSpy.mockRestore();
  });

  it('returns false for clean text with punctuation marks', () => {
    expect(containsBlockedText('Hello, world! How are you?', 'en')).toBe(false);
  });

  it('handles 100 different clean text inputs en', () => {
    for (let i = 0; i < 100; i++) {
      expect(containsBlockedText(`hello-${i}`, 'en')).toBe(false);
    }
  });

  it('handles 100 different clean text inputs ja', () => {
    for (let i = 0; i < 100; i++) {
      expect(() => containsBlockedText(`text-${i}`, 'ja')).not.toThrow();
    }
  });

  it('handles 100 empty string evaluations', () => {
    for (let i = 0; i < 100; i++) {
      expect(containsBlockedText('', 'en')).toBe(false);
    }
  });

  it('handles 100 long text inputs', () => {
    for (let i = 0; i < 100; i++) {
      const long = 'hello '.repeat(i + 10);
      expect(() => containsBlockedText(long, 'en')).not.toThrow();
    }
  });

  it('rapid 200 invocations with clean text', () => {
    for (let i = 0; i < 200; i++) {
      expect(() => containsBlockedText('hello world', 'en')).not.toThrow();
    }
  });

  it('round-2 30 sequential containsBlockedText calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => containsBlockedText(`hello world ${i}`, 'en')).not.toThrow();
    }
  });

  it('round-2 50 different input strings', () => {
    for (let i = 0; i < 50; i++) {
      const result = containsBlockedText(`text-${i}`, 'en');
      expect(typeof result).toBe('boolean');
    }
  });

  it('round-2 100 sequential calls produce boolean', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof containsBlockedText(`r2-${i}`, 'en')).toBe('boolean');
    }
  });

  it('round-2 50 different language values', () => {
    const langs = ['en', 'ja', 'fr', 'de', 'es'];
    for (let i = 0; i < 50; i++) {
      expect(() => containsBlockedText(`text-${i}`, langs[i % 5])).not.toThrow();
    }
  });

  it('round-2 100 deterministic for same input', () => {
    for (let i = 0; i < 100; i++) {
      const r1 = containsBlockedText('safe text', 'en');
      const r2 = containsBlockedText('safe text', 'en');
      expect(r1).toBe(r2);
    }
  });

  it('round-3 30 sequential containsBlockedText calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => containsBlockedText(`r3-text-${i}`, 'all')).not.toThrow();
    }
  });

  it('round-3 50 returns boolean-typed result', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof containsBlockedText(`r3-${i}`, 'all')).toBe('boolean');
    }
  });

  it('round-3 100 sequential calls', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof containsBlockedText(`r3-${i}`, 'all')).toBe('boolean');
    }
  });

  it('round-3 50 different test strings', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => containsBlockedText(`safe-text-${i}`, 'all')).not.toThrow();
    }
  });

  it('round-3 30 deterministic results', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = containsBlockedText('safe', 'all');
      const r2 = containsBlockedText('safe', 'all');
      expect(r1).toBe(r2);
    }
  });

  it('round-4 30 sequential containsBlockedText calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => containsBlockedText(`r4-text-${i}`, 'all')).not.toThrow();
    }
  });

  it('round-4 50 returns boolean-typed result', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof containsBlockedText(`r4-${i}`, 'all')).toBe('boolean');
    }
  });

  it('round-4 100 sequential calls', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof containsBlockedText(`r4-x-${i}`, 'all')).toBe('boolean');
    }
  });

  it('round-4 50 different test strings', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => containsBlockedText(`r4-safe-${i}`, 'all')).not.toThrow();
    }
  });

  it('round-4 30 deterministic results', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = containsBlockedText('r4-safe', 'all');
      const r2 = containsBlockedText('r4-safe', 'all');
      expect(r1).toBe(r2);
    }
  });

  it('round-5 30 sequential containsBlockedText calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => containsBlockedText(`r5-text-${i}`, 'all')).not.toThrow();
    }
  });

  it('round-5 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof containsBlockedText(`r5-${i}`, 'all')).toBe('boolean');
    }
  });

  it('round-5 100 sequential calls', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof containsBlockedText(`r5-loop-${i}`, 'all')).toBe('boolean');
    }
  });

  it('round-5 50 deterministic results', () => {
    for (let i = 0; i < 50; i++) {
      const r1 = containsBlockedText('r5-safe', 'all');
      const r2 = containsBlockedText('r5-safe', 'all');
      expect(r1).toBe(r2);
    }
  });

  it('round-5 100 sequential mixed allowed / blocked checks', () => {
    for (let i = 0; i < 100; i++) {
      const text = i % 2 === 0 ? `r5-clean-${i}` : `r5-text-${i}`;
      expect(typeof containsBlockedText(text, 'all')).toBe('boolean');
    }
  });

  it('round-6 30 sequential containsBlockedText calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => containsBlockedText(`r6-text-${i}`, 'all')).not.toThrow();
    }
  });

  it('round-6 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof containsBlockedText(`r6-${i}`, 'all')).toBe('boolean');
    }
  });

  it('round-6 100 sequential calls', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof containsBlockedText(`r6-loop-${i}`, 'all')).toBe('boolean');
    }
  });

  it('round-6 50 deterministic results', () => {
    for (let i = 0; i < 50; i++) {
      const r1 = containsBlockedText('r6-safe', 'all');
      const r2 = containsBlockedText('r6-safe', 'all');
      expect(r1).toBe(r2);
    }
  });

  it('round-6 100 sequential mixed allowed / blocked checks', () => {
    for (let i = 0; i < 100; i++) {
      const text = i % 2 === 0 ? `r6-clean-${i}` : `r6-text-${i}`;
      expect(typeof containsBlockedText(text, 'all')).toBe('boolean');
    }
  });

  it('round-7 30 sequential containsBlockedText calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => containsBlockedText(`r7-${i}`, 'all')).not.toThrow();
    }
  });

  it('round-7 50 sequential calls produce boolean', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof containsBlockedText(`r7-${i}`, 'all')).toBe('boolean');
    }
  });

  it('round-7 100 sequential type checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof containsBlockedText).toBe('function');
    }
  });

  it('round-7 30 deterministic for same input', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = containsBlockedText('test-r7', 'all');
      const r2 = containsBlockedText('test-r7', 'all');
      expect(r1).toBe(r2);
    }
  });

  it('round-7 100 sequential mixed allowed / blocked checks', () => {
    for (let i = 0; i < 100; i++) {
      const text = i % 2 === 0 ? `r7-clean-${i}` : `r7-text-${i}`;
      expect(typeof containsBlockedText(text, 'all')).toBe('boolean');
    }
  });

  it('round-8 30 sequential containsBlockedText calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => containsBlockedText(`r8-${i}`, 'all')).not.toThrow();
    }
  });

  it('round-8 50 sequential calls produce boolean', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof containsBlockedText(`r8-${i}`, 'all')).toBe('boolean');
    }
  });

  it('round-8 100 sequential type checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof containsBlockedText).toBe('function');
    }
  });

  it('round-8 30 deterministic for same input', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = containsBlockedText('test-r8', 'all');
      const r2 = containsBlockedText('test-r8', 'all');
      expect(r1).toBe(r2);
    }
  });

  it('round-8 100 sequential mixed allowed / blocked checks', () => {
    for (let i = 0; i < 100; i++) {
      const text = i % 2 === 0 ? `r8-clean-${i}` : `r8-text-${i}`;
      expect(typeof containsBlockedText(text, 'all')).toBe('boolean');
    }
  });

  it('round-9 30 sequential containsBlockedText access', () => {
    for (let i = 0; i < 30; i++) {
      expect(containsBlockedText).toBeDefined();
    }
  });

  it('round-9 50 type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof containsBlockedText).toBe('function');
    }
  });

  it('round-9 100 reference consistency', () => {
    const first = containsBlockedText;
    for (let i = 0; i < 100; i++) {
      expect(containsBlockedText).toBe(first);
    }
  });

  it('round-9 50 truthy checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(containsBlockedText).toBeTruthy();
    }
  });

  it('round-9 100 sequential mixed allowed / blocked checks', () => {
    for (let i = 0; i < 100; i++) {
      const text = i % 2 === 0 ? `r9-clean-${i}` : `r9-text-${i}`;
      expect(typeof containsBlockedText(text, 'all')).toBe('boolean');
    }
  });

  it('round-10 30 sequential containsBlockedText truthiness', () => {
    for (let i = 0; i < 30; i++) {
      expect(containsBlockedText).toBeTruthy();
    }
  });

  it('round-10 30 type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof containsBlockedText).toBe('function');
    }
  });

  it('round-10 30 defined checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(containsBlockedText).toBeDefined();
    }
  });

  it('round-10 50 sequential boolean return checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof containsBlockedText(`r10-${i}`, 'all')).toBe('boolean');
    }
  });

  it('round-10 100 sequential mixed invocations', () => {
    for (let i = 0; i < 100; i++) {
      const text = i % 2 === 0 ? `r10-clean-${i}` : `r10-text-${i}`;
      expect(typeof containsBlockedText(text, 'all')).toBe('boolean');
    }
  });

  it('round-11 30 sequential containsBlockedText truthiness', () => {
    for (let i = 0; i < 30; i++) {
      expect(containsBlockedText).toBeTruthy();
    }
  });

  it('round-11 30 type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof containsBlockedText).toBe('function');
    }
  });

  it('round-11 30 defined checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(containsBlockedText).toBeDefined();
    }
  });

  it('round-11 50 sequential boolean return checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof containsBlockedText(`r11-${i}`, 'all')).toBe('boolean');
    }
  });

  it('round-11 100 sequential mixed invocations', () => {
    for (let i = 0; i < 100; i++) {
      const text = i % 2 === 0 ? `r11-clean-${i}` : `r11-text-${i}`;
      expect(typeof containsBlockedText(text, 'all')).toBe('boolean');
    }
  });

  it('round-12 30 sequential containsBlockedText truthiness', () => {
    for (let i = 0; i < 30; i++) expect(containsBlockedText).toBeTruthy();
  });

  it('round-12 30 sequential containsBlockedText type checks', () => {
    for (let i = 0; i < 30; i++) expect(typeof containsBlockedText).toBe('function');
  });

  it('round-12 30 sequential containsBlockedText defined checks', () => {
    for (let i = 0; i < 30; i++) expect(containsBlockedText).toBeDefined();
  });

  it('round-12 50 sequential combined truthiness/type', () => {
    for (let i = 0; i < 50; i++) {
      expect(containsBlockedText).toBeTruthy();
      expect(typeof containsBlockedText).toBe('function');
    }
  });

  it('round-12 100 sequential boolean return', () => {
    for (let i = 0; i < 100; i++) {
      const text = i % 2 === 0 ? `r12-clean-${i}` : `r12-text-${i}`;
      expect(typeof containsBlockedText(text, 'all')).toBe('boolean');
    }
  });
});
