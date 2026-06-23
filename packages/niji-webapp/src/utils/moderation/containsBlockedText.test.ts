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
});
