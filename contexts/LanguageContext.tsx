'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { Lang, translations } from '@/lib/i18n/translations';

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'fr',
  setLang: () => {},
  t: (key: string) => key,
});

const STORAGE_KEY = 'app-language';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('fr');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (saved && (saved === 'fr' || saved === 'en' || saved === 'mg')) {
      setLangState(saved);
    }
  }, []);

  const setLang = (next: Lang) => {
    setLangState(next);
    localStorage.setItem(STORAGE_KEY, next);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = next;
    }
  };

  const t = (key: string): string => {
    return translations[lang]?.[key] ?? translations.fr[key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}