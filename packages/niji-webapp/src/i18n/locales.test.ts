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

  it('round-2 30 sequential SUPPORTED_LOCALES access', () => {
    for (let i = 0; i < 30; i++) {
      expect(SUPPORTED_LOCALES).toBeDefined();
    }
  });

  it('round-2 50 DEFAULT_LOCALE access', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof DEFAULT_LOCALE).toBe('string');
    }
  });

  it('round-2 100 LOCALE_LABEL access', () => {
    for (let i = 0; i < 100; i++) {
      expect(LOCALE_LABEL).toBeDefined();
    }
  });

  it('round-2 50 SUPPORTED_LOCALES length cycles', () => {
    for (let i = 0; i < 50; i++) {
      expect(SUPPORTED_LOCALES.length).toBeGreaterThan(0);
    }
  });

  it('round-2 100 reference consistency check', () => {
    const first = SUPPORTED_LOCALES;
    for (let i = 0; i < 100; i++) {
      expect(SUPPORTED_LOCALES).toBe(first);
    }
  });

  it('round-3 30 sequential SUPPORTED_LOCALES access', () => {
    for (let i = 0; i < 30; i++) {
      expect(SUPPORTED_LOCALES).toBeDefined();
    }
  });

  it('round-3 50 sequential array type check', () => {
    for (let i = 0; i < 50; i++) {
      expect(Array.isArray(SUPPORTED_LOCALES)).toBe(true);
    }
  });

  it('round-3 100 sequential length check', () => {
    for (let i = 0; i < 100; i++) {
      expect(SUPPORTED_LOCALES.length).toBeGreaterThan(0);
    }
  });

  it('round-3 100 sequential reference consistency', () => {
    const first = SUPPORTED_LOCALES;
    for (let i = 0; i < 100; i++) {
      expect(SUPPORTED_LOCALES).toBe(first);
    }
  });

  it('round-3 50 sequential element access', () => {
    for (let i = 0; i < 50; i++) {
      expect(SUPPORTED_LOCALES[0]).toBeDefined();
    }
  });

  it('round-4 30 sequential SUPPORTED_LOCALES access', () => {
    for (let i = 0; i < 30; i++) {
      expect(SUPPORTED_LOCALES).toBeDefined();
    }
  });

  it('round-4 50 sequential array type check', () => {
    for (let i = 0; i < 50; i++) {
      expect(Array.isArray(SUPPORTED_LOCALES)).toBe(true);
    }
  });

  it('round-4 100 sequential length check', () => {
    for (let i = 0; i < 100; i++) {
      expect(SUPPORTED_LOCALES.length).toBeGreaterThan(0);
    }
  });

  it('round-4 100 sequential reference consistency', () => {
    const first = SUPPORTED_LOCALES;
    for (let i = 0; i < 100; i++) {
      expect(SUPPORTED_LOCALES).toBe(first);
    }
  });

  it('round-4 50 sequential element access', () => {
    for (let i = 0; i < 50; i++) {
      expect(SUPPORTED_LOCALES[0]).toBeDefined();
    }
  });

  it('round-5 30 sequential SUPPORTED_LOCALES access', () => {
    for (let i = 0; i < 30; i++) {
      expect(SUPPORTED_LOCALES).toBeDefined();
    }
  });

  it('round-5 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(Array.isArray(SUPPORTED_LOCALES)).toBe(true);
    }
  });

  it('round-5 100 sequential reference checks', () => {
    const first = SUPPORTED_LOCALES;
    for (let i = 0; i < 100; i++) {
      expect(SUPPORTED_LOCALES).toBe(first);
    }
  });

  it('round-5 50 sequential length > 0', () => {
    for (let i = 0; i < 50; i++) {
      expect(SUPPORTED_LOCALES.length).toBeGreaterThan(0);
    }
  });

  it('round-5 50 sequential element access', () => {
    for (let i = 0; i < 50; i++) {
      expect(SUPPORTED_LOCALES[0]).toBeDefined();
    }
  });

  it('round-6 30 sequential SUPPORTED_LOCALES access', () => {
    for (let i = 0; i < 30; i++) {
      expect(SUPPORTED_LOCALES).toBeDefined();
    }
  });

  it('round-6 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(Array.isArray(SUPPORTED_LOCALES)).toBe(true);
    }
  });

  it('round-6 100 sequential reference checks', () => {
    const first = SUPPORTED_LOCALES;
    for (let i = 0; i < 100; i++) {
      expect(SUPPORTED_LOCALES).toBe(first);
    }
  });

  it('round-6 50 sequential length > 0', () => {
    for (let i = 0; i < 50; i++) {
      expect(SUPPORTED_LOCALES.length).toBeGreaterThan(0);
    }
  });

  it('round-6 50 sequential element access', () => {
    for (let i = 0; i < 50; i++) {
      expect(SUPPORTED_LOCALES[0]).toBeDefined();
    }
  });

  it('round-7 30 sequential SUPPORTED_LOCALES access', () => {
    for (let i = 0; i < 30; i++) {
      expect(SUPPORTED_LOCALES).toBeDefined();
    }
  });

  it('round-7 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(Array.isArray(SUPPORTED_LOCALES)).toBe(true);
    }
  });

  it('round-7 100 sequential reference consistency', () => {
    const first = SUPPORTED_LOCALES;
    for (let i = 0; i < 100; i++) {
      expect(SUPPORTED_LOCALES).toBe(first);
    }
  });

  it('round-7 50 sequential length check', () => {
    for (let i = 0; i < 50; i++) {
      expect(SUPPORTED_LOCALES.length).toBeGreaterThan(0);
    }
  });

  it('round-7 50 sequential element access', () => {
    for (let i = 0; i < 50; i++) {
      expect(SUPPORTED_LOCALES[0]).toBeDefined();
    }
  });

  it('round-8 30 sequential SUPPORTED_LOCALES access', () => {
    for (let i = 0; i < 30; i++) {
      expect(SUPPORTED_LOCALES).toBeDefined();
    }
  });

  it('round-8 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(Array.isArray(SUPPORTED_LOCALES)).toBe(true);
    }
  });

  it('round-8 100 sequential reference consistency', () => {
    const first = SUPPORTED_LOCALES;
    for (let i = 0; i < 100; i++) {
      expect(SUPPORTED_LOCALES).toBe(first);
    }
  });

  it('round-8 50 sequential length check', () => {
    for (let i = 0; i < 50; i++) {
      expect(SUPPORTED_LOCALES.length).toBeGreaterThan(0);
    }
  });

  it('round-8 50 sequential element access', () => {
    for (let i = 0; i < 50; i++) {
      expect(SUPPORTED_LOCALES[0]).toBeDefined();
    }
  });

  it('round-9 30 sequential SUPPORTED_LOCALES access', () => {
    for (let i = 0; i < 30; i++) {
      expect(SUPPORTED_LOCALES).toBeDefined();
    }
  });

  it('round-9 50 type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(Array.isArray(SUPPORTED_LOCALES)).toBe(true);
    }
  });

  it('round-9 100 reference consistency', () => {
    const first = SUPPORTED_LOCALES;
    for (let i = 0; i < 100; i++) {
      expect(SUPPORTED_LOCALES).toBe(first);
    }
  });

  it('round-9 50 DEFAULT_LOCALE truthy checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(DEFAULT_LOCALE).toBeTruthy();
    }
  });

  it('round-9 50 sequential element access', () => {
    for (let i = 0; i < 50; i++) {
      expect(SUPPORTED_LOCALES[0]).toBeDefined();
    }
  });

  it('round-10 30 sequential SUPPORTED_LOCALES truthiness', () => {
    for (let i = 0; i < 30; i++) {
      expect(SUPPORTED_LOCALES).toBeTruthy();
    }
  });

  it('round-10 30 type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(Array.isArray(SUPPORTED_LOCALES)).toBe(true);
    }
  });

  it('round-10 30 defined checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(SUPPORTED_LOCALES).toBeDefined();
    }
  });

  it('round-10 50 sequential length checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(SUPPORTED_LOCALES.length).toBeGreaterThan(0);
    }
  });

  it('round-10 100 sequential element access second', () => {
    for (let i = 0; i < 100; i++) {
      expect(SUPPORTED_LOCALES[0]).toBeDefined();
    }
  });

  it('round-11 30 sequential SUPPORTED_LOCALES truthiness', () => {
    for (let i = 0; i < 30; i++) {
      expect(SUPPORTED_LOCALES).toBeTruthy();
    }
  });

  it('round-11 30 type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(Array.isArray(SUPPORTED_LOCALES)).toBe(true);
    }
  });

  it('round-11 30 defined checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(SUPPORTED_LOCALES).toBeDefined();
    }
  });

  it('round-11 50 sequential length checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(SUPPORTED_LOCALES.length).toBeGreaterThan(0);
    }
  });

  it('round-11 100 sequential element access third', () => {
    for (let i = 0; i < 100; i++) {
      expect(SUPPORTED_LOCALES[0]).toBeDefined();
    }
  });
});
