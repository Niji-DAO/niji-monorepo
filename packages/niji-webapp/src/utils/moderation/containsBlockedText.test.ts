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
});
