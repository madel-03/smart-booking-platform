// client/src/components/LanguageSwitcher.jsx
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export function LanguageSwitcher() {
  const { language, switchLanguage } = useLanguage();

  return (
    <div style={{ 
      display: 'flex', 
      gap: '8px',
      marginTop: '10px',
      justifyContent: 'center'
    }}>
      <button
        onClick={() => switchLanguage('ar')}
        style={{
          padding: '6px 16px',
          border: `2px solid ${language === 'ar' ? '#cca474' : '#3d332b'}`,
          background: language === 'ar' ? '#cca474' : 'transparent',
          color: language === 'ar' ? '#1a1613' : '#a89f96',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '14px',
          transition: 'all 0.3s ease'
        }}
      >
        🇸🇦 عربي
      </button>
      <button
        onClick={() => switchLanguage('en')}
        style={{
          padding: '6px 16px',
          border: `2px solid ${language === 'en' ? '#cca474' : '#3d332b'}`,
          background: language === 'en' ? '#cca474' : 'transparent',
          color: language === 'en' ? '#1a1613' : '#a89f96',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '14px',
          transition: 'all 0.3s ease'
        }}
      >
        🇬🇧 English
      </button>
    </div>
  );
}