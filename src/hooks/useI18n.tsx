import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { scopedStorage } from '@lark-apaas/client-toolkit-lite';
import { translations, type Locale } from '@/lib/translations';

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const STORAGE_KEY = 'locale';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const stored = scopedStorage.getItem(STORAGE_KEY);
    return stored === 'en' ? 'en' : 'zh';
  });

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    scopedStorage.setItem(STORAGE_KEY, l);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      let str =
        translations[locale]?.[key] ??
        translations.zh[key] ??
        key;
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        });
      }
      return str;
    },
    [locale],
  );

  const value = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Fallback for components outside I18nProvider (e.g. NotFoundPage)
    return {
      locale: 'zh' as Locale,
      setLocale: () => {},
      t: (key: string) => translations.zh[key] ?? key,
    };
  }
  return ctx;
}
