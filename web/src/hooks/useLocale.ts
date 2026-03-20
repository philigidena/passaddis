import { useState, useEffect, useCallback } from 'react';
import { getLocale, setLocale as setI18nLocale, t, getSupportedLocales, type Locale } from '@/lib/i18n';

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(getLocale());

  useEffect(() => {
    const handleLocaleChange = (e: Event) => {
      setLocaleState((e as CustomEvent).detail as Locale);
    };
    window.addEventListener('locale-change', handleLocaleChange);
    return () => window.removeEventListener('locale-change', handleLocaleChange);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setI18nLocale(newLocale);
    setLocaleState(newLocale);
  }, []);

  return {
    locale,
    setLocale,
    t,
    locales: getSupportedLocales(),
    isAmharic: locale === 'am',
  };
}
