// 경로: src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ko from './locales/ko.json';
import en from './locales/en.json';
import vi from './locales/vi.json';
import zh from './locales/zh.json';

i18n.use(initReactI18next).init({
  resources: { ko, en, vi, zh },
  lng: localStorage.getItem('settle_lang') || 'ko',
  fallbackLng: 'ko',
  interpolation: { escapeValue: false },
  defaultNS: 'common',
});

export default i18n;