

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { strings, StringCollection } from '../localization/strings';

export const supportedUiLanguages = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'ar', label: 'العربية' },
  { code: 'fr', label: 'Français' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ja', label: '日本語' },
];

type LanguageContextType = {
  language: string;
  setLanguage: (lang: string) => void;
  t: StringCollection;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    
  const getInitialLanguage = () => {
    if (typeof window !== 'undefined' && window.navigator) {
        const browserLang = navigator.language.split('-')[0];
        return supportedUiLanguages.some(l => l.code === browserLang) ? browserLang : 'en';
    }
    return 'en';
  };

  const [language, setLanguage] = useState(getInitialLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);
  
  const t = strings[language] || strings.en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};