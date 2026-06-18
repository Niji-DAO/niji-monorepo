/**
 * LanguageProvider.tsx is a modified version of https://github.com/Uniswap/interface/blob/main/src/lib/i18n.tsx
 */
import { ReactNode, useCallback } from 'react';

import { useActiveLocale } from '../hooks/useActivateLocale';

import { SupportedLocale } from './locales';
import { dynamicActivate, NijiI18nProvider } from './NijiI18nProvider';

export function LanguageProvider({ children }: Readonly<{ children: ReactNode }>) {
  const locale = useActiveLocale();

  const onActivate = useCallback((locale: SupportedLocale) => {
    dynamicActivate(locale);
  }, []);

  return (
    <NijiI18nProvider locale={locale} forceRenderAfterLocaleChange={true} onActivate={onActivate}>
      {children}
    </NijiI18nProvider>
  );
}
