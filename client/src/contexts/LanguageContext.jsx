import React, { createContext, useState, useContext, useEffect } from 'react';
import ar from '../locales/ar.json';
import en from '../locales/en.json';

const translations = { ar, en };

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('appLang') || 'ar';
  });

  useEffect(() => {
    localStorage.setItem('appLang', language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key) => {
    const keys = key.split('.');
    let result = translations[language];
    for (const k of keys) {
      if (result && result[k] !== undefined) {
        result = result[k];
      } else {
        return key;
      }
    }
    return result;
  };

  const switchLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, t, switchLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}