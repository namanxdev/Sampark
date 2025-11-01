/**
 * Language Switcher Component
 * Allows users to change the application language
 */

import { useTranslation } from 'react-i18next';
import { FaGlobe } from 'react-icons/fa';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  // Add more languages as needed
  // { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  // { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  // { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  // { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  // { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  // { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  // { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  // { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
];

function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  
  const changeLanguage = async (langCode) => {
    try {
      await i18n.changeLanguage(langCode);
      
      // Optionally save to backend
      // await api.put('/api/auth/me/language', { language: langCode });
      
      console.log(`Language changed to: ${langCode}`);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };
  
  const currentLanguage = languages.find(l => l.code === i18n.language) || languages[0];
  
  return (
    <div className="dropdown dropdown-end">
      <label 
        tabIndex={0} 
        className="btn btn-ghost btn-circle"
        aria-label={t('accessibility.language_menu')}
      >
        <span className="text-xl" role="img" aria-label={currentLanguage.name}>
          {currentLanguage.flag}
        </span>
      </label>
      
      <ul 
        tabIndex={0} 
        className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-64 mt-4 max-h-96 overflow-y-auto"
      >
        {languages.map((lang) => (
          <li key={lang.code}>
            <button
              onClick={() => changeLanguage(lang.code)}
              className={`flex items-center justify-between ${
                i18n.language === lang.code ? 'active' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl" role="img" aria-label={lang.name}>
                  {lang.flag}
                </span>
                <div className="text-left">
                  <div className="font-medium">{lang.nativeName}</div>
                  <div className="text-xs text-base-content/60">{lang.name}</div>
                </div>
              </div>
              {i18n.language === lang.code && (
                <span className="text-success">✓</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default LanguageSwitcher;
