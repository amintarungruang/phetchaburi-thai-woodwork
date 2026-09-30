'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Language, Translations, translations } from '@/i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: Translations;
  isEn: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'th',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: translations.th,
  isEn: false,
});

export const useLanguage = () => useContext(LanguageContext);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('th');

  // Load language preference from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('woodwork_factory_lang') as Language;
      if (saved === 'th' || saved === 'en') {
        setLanguageState(saved);
        if (typeof document !== 'undefined') {
          document.documentElement.lang = saved;
        }
      }
    } catch {
      // localStorage may be disabled or unavailable
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('woodwork_factory_lang', lang);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = lang;
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => {
      const next: Language = prev === 'th' ? 'en' : 'th';
      try {
        localStorage.setItem('woodwork_factory_lang', next);
        if (typeof document !== 'undefined') {
          document.documentElement.lang = next;
        }
      } catch {}
      return next;
    });
  }, []);

  const t = translations[language] || translations.th;
  const isEn = language === 'en';

  const value = useMemo(
    () => ({ language, setLanguage, toggleLanguage, t, isEn }),
    [language, setLanguage, toggleLanguage, t, isEn]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
