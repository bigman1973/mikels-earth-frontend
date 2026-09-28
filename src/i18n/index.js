import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Importar traducciones
import es from './locales/es.json';
import en from './locales/en.json';

const supportedLanguages = ['es', 'en'];

const detectInitialLanguage = () => {
  if (typeof window === 'undefined') return 'es';

  try {
    const savedLanguage = window.localStorage.getItem('mikels_language');
    if (supportedLanguages.includes(savedLanguage)) return savedLanguage;
  } catch {
    // La preferencia puede estar bloqueada; el español sigue siendo el inicio canónico.
  }

  // La tienda opera con español como idioma inicial y canónico. El inglés se
  // conserva únicamente como una elección manual persistida del visitante.
  return 'es';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en }
    },
    lng: detectInitialLanguage(),
    fallbackLng: 'es',
    supportedLngs: supportedLanguages,
    interpolation: {
      escapeValue: false // React ya escapa por defecto
    }
  });

i18n.on('languageChanged', (language) => {
  const normalizedLanguage = language?.split('-')[0];
  if (!supportedLanguages.includes(normalizedLanguage)) return;

  if (typeof document !== 'undefined') {
    document.documentElement.lang = normalizedLanguage;
  }

  try {
    window.localStorage.setItem('mikels_language', normalizedLanguage);
  } catch {
    // La preferencia no se persiste si el navegador bloquea localStorage.
  }
});

export default i18n;
