/**
 * i18n Configuration for Sampark
 * Internationalization support for multiple Indian languages
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enSurvey from './locales/en/survey.json';
import enModules from './locales/en/modules.json';
import enSettings from './locales/en/settings.json';

import hiCommon from './locales/hi/common.json';
import hiAuth from './locales/hi/auth.json';
import hiSurvey from './locales/hi/survey.json';
import hiModules from './locales/hi/modules.json';
import hiSettings from './locales/hi/settings.json';

// Add more languages as needed
// import paCommon from './locales/pa/common.json';
// import bnCommon from './locales/bn/common.json';

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    survey: enSurvey,
    modules: enModules,
    settings: enSettings,
  },
  hi: {
    common: hiCommon,
    auth: hiAuth,
    survey: hiSurvey,
    modules: hiModules,
    settings: hiSettings,
  },
  // Add more languages here
};

// RTL (Right-to-Left) languages
const rtlLanguages = ['ur', 'ar'];

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    
    // Fallback language if translation not found
    fallbackLng: 'en',
    
    // Default namespace
    defaultNS: 'common',
    
    // Language detection options
    detection: {
      // Order and from where user language should be detected
      order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
      
      // Keys or params to lookup language from
      lookupLocalStorage: 'i18nextLng',
      lookupSessionStorage: 'i18nextLng',
      
      // Cache user language in localStorage
      caches: ['localStorage'],
      
      // Optional expire time in ms for the cache
      cookieMinutes: 10080, // 7 days
    },
    
    // Interpolation options
    interpolation: {
      escapeValue: false, // React already safes from XSS
      
      // Format numbers according to locale
      format: (value, format, lng) => {
        if (format === 'number') {
          return new Intl.NumberFormat(lng).format(value);
        }
        if (format === 'currency') {
          return new Intl.NumberFormat(lng, {
            style: 'currency',
            currency: 'INR',
          }).format(value);
        }
        if (value instanceof Date) {
          return new Intl.DateTimeFormat(lng).format(value);
        }
        return value;
      },
    },
    
    // React options
    react: {
      // Wait for translations to load before rendering
      useSuspense: false,
      
      // Bind i18n to component lifecycle
      bindI18n: 'languageChanged',
      bindI18nStore: '',
      
      // Use React.createElement instead of html string
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p'],
    },
    
    // Debug mode (set to false in production)
    debug: false,
    
    // Return empty string instead of key if translation is missing
    returnEmptyString: false,
    
    // Load namespace on demand
    ns: ['common', 'auth', 'survey', 'modules'],
    
    // Allow keys to be phrases having ':'
    nsSeparator: ':',
    
    // Allow keys to be phrases having '.'
    keySeparator: '.',
  });

// Listen for language changes and update document direction
i18n.on('languageChanged', (lng) => {
  // Set RTL direction for appropriate languages
  const dir = rtlLanguages.includes(lng) ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
  
  // Store preference
  localStorage.setItem('language', lng);
  
  console.log(`Language changed to: ${lng}`);
});

// Store translations in IndexedDB for offline use
i18n.on('loaded', async (loaded) => {
  try {
    // Import indexedDBService (assuming it's available)
    const { default: indexedDBService } = await import('../services/indexedDBService');
    
    for (const [language, namespaces] of Object.entries(loaded)) {
      await indexedDBService.saveTranslations(language, namespaces);
    }
    
    console.log('Translations cached for offline use');
  } catch (error) {
    console.warn('Failed to cache translations offline:', error);
  }
});

export default i18n;
