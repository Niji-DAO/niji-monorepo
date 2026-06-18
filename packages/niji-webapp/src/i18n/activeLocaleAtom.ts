import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import { atom } from 'jotai/vanilla';
import { withAtomEffect } from 'jotai-effect';

import { DEFAULT_LOCALE, SUPPORTED_LOCALES, SupportedLocale } from '@/i18n/locales';
import { dynamicActivate } from '@/i18n/NijiI18nProvider';

export const pickSupportedLocale = (candidates: (string | undefined | null)[]): SupportedLocale => {
  const SUPPORTED_BASES = SUPPORTED_LOCALES.map(locale => locale.split('-')[0]);

  for (const candidate of candidates) {
    if (candidate == null) continue;
    if ((SUPPORTED_LOCALES as unknown as string[]).includes(candidate))
      return candidate as SupportedLocale;

    // match on base language (e.g. "en-US" → "en")
    const base = candidate.split('-')[0];
    if (SUPPORTED_BASES.includes(base)) {
      const localeIndex = SUPPORTED_BASES.indexOf(base);
      return SUPPORTED_LOCALES[localeIndex];
    }
  }

  return DEFAULT_LOCALE;
};

// Default locale は ja-JP に固定。 ユーザーが dropdown で別言語を選んだ場合のみ localStorage に保存され、 次回以降はそれを使う。
// navigator 検出は skip (初回訪問時は必ず ja-JP で表示するため)。
export const activeLocaleAtom = withAtomEffect(
  atom(
    get => {
      const storeLocale = get(activeLocaleStorageAtom);
      return pickSupportedLocale([storeLocale, DEFAULT_LOCALE]);
    },
    (_get, set, locale: SupportedLocale) => set(activeLocaleStorageAtom, locale),
  ),
  get => {
    const activeLocale = get(activeLocaleAtom);
    if (activeLocale != undefined) dynamicActivate(activeLocale);
  },
);

const activeLocaleStorageAtom = atomWithStorage<string | undefined>(
  'lang',
  undefined,
  createJSONStorage(() => localStorage),
  {
    getOnInit: true,
  },
);
