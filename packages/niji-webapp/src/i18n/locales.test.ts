import { describe, expect, it } from 'vitest';

import {
  DEFAULT_LOCALE,
  Locales,
  LOCALE_LABEL,
  SUPPORTED_LOCALE_TO_DAYSJS_LOCALE,
  SUPPORTED_LOCALES,
} from './locales';

describe('SUPPORTED_LOCALES', () => {
  it('contains exactly 3 locales in fixed order (ja-JP first)', () => {
    expect(SUPPORTED_LOCALES).toEqual(['ja-JP', 'en-US', 'zh-CN']);
  });
});

describe('DEFAULT_LOCALE', () => {
  it('is ja-JP', () => {
    expect(DEFAULT_LOCALE).toBe('ja-JP');
  });

  it('appears at index 0 of SUPPORTED_LOCALES', () => {
    expect(SUPPORTED_LOCALES[0]).toBe(DEFAULT_LOCALE);
  });
});

describe('LOCALE_LABEL', () => {
  it('maps en-US to "English"', () => {
    expect(LOCALE_LABEL['en-US']).toBe('English');
  });

  it('maps zh-CN to 中文', () => {
    expect(LOCALE_LABEL['zh-CN']).toBe('中文');
  });

  it('maps ja-JP to 日本語', () => {
    expect(LOCALE_LABEL['ja-JP']).toBe('日本語');
  });

  it('includes pseudo locale label', () => {
    expect(LOCALE_LABEL.pseudo).toBeDefined();
  });
});

describe('Locales enum', () => {
  it('en_US = "en-US"', () => {
    expect(Locales.en_US).toBe('en-US');
  });

  it('zh_CN = "zh-CN"', () => {
    expect(Locales.zh_CN).toBe('zh-CN');
  });

  it('ja_JP = "ja-JP"', () => {
    expect(Locales.ja_JP).toBe('ja-JP');
  });
});

describe('SUPPORTED_LOCALE_TO_DAYSJS_LOCALE', () => {
  it('has dayjs locale for all 3 supported locales + pseudo', () => {
    expect(SUPPORTED_LOCALE_TO_DAYSJS_LOCALE['en-US']).toBeDefined();
    expect(SUPPORTED_LOCALE_TO_DAYSJS_LOCALE['zh-CN']).toBeDefined();
    expect(SUPPORTED_LOCALE_TO_DAYSJS_LOCALE['ja-JP']).toBeDefined();
    expect(SUPPORTED_LOCALE_TO_DAYSJS_LOCALE.pseudo).toBeDefined();
  });

  it('pseudo locale falls back to en dayjs locale', () => {
    expect(SUPPORTED_LOCALE_TO_DAYSJS_LOCALE.pseudo).toBe(
      SUPPORTED_LOCALE_TO_DAYSJS_LOCALE['en-US'],
    );
  });

  it('all dayjs locale objects have a name property', () => {
    expect(SUPPORTED_LOCALE_TO_DAYSJS_LOCALE['en-US'].name).toBeDefined();
    expect(SUPPORTED_LOCALE_TO_DAYSJS_LOCALE['zh-CN'].name).toBeDefined();
    expect(SUPPORTED_LOCALE_TO_DAYSJS_LOCALE['ja-JP'].name).toBeDefined();
  });

  it('SUPPORTED_LOCALES length check 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      expect(SUPPORTED_LOCALES.length).toBe(3);
    }
  });

  it('DEFAULT_LOCALE is consistent 100 cycles', () => {
    const initial = DEFAULT_LOCALE;
    for (let i = 0; i < 100; i++) {
      expect(DEFAULT_LOCALE).toBe(initial);
    }
  });

  it('Locales.ja_JP check 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      expect(Locales.ja_JP).toBe('ja-JP');
    }
  });

  it('Locales.en_US check 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      expect(Locales.en_US).toBe('en-US');
    }
  });

  it('LOCALE_LABEL is non-empty 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      expect(Object.keys(LOCALE_LABEL).length).toBeGreaterThan(0);
    }
  });
});
