import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSelector = ({ className = '', compact = false }) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.substring(0, 2) || 'es';

  const toggleLanguage = () => {
    const newLang = currentLang === 'es' ? 'en' : 'es';
    i18n.changeLanguage(newLang);
    // Guardar en localStorage para persistencia
    localStorage.setItem('mikels_language', newLang);
    // Actualizar el atributo lang del HTML
    document.documentElement.lang = newLang;
  };

  if (compact) {
    return (
      <button
        onClick={toggleLanguage}
        className={`inline-flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-lg px-2 text-xs font-medium hover:bg-white/10 hover:text-accent transition-colors uppercase tracking-wide ${className}`}
        aria-label={currentLang === 'es' ? 'Switch to English' : 'Cambiar a Español'}
        title={currentLang === 'es' ? 'Switch to English' : 'Cambiar a Español'}
      >
        <Globe size={14} />
        <span>{currentLang === 'es' ? 'EN' : 'ES'}</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleLanguage}
      className={`inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-medium hover:bg-white/10 hover:text-secondary transition-colors ${className}`}
      aria-label={currentLang === 'es' ? 'Switch to English' : 'Cambiar a Español'}
      title={currentLang === 'es' ? 'Switch to English' : 'Cambiar a Español'}
    >
      <Globe size={16} />
      <span>{currentLang === 'es' ? 'EN' : 'ES'}</span>
    </button>
  );
};

export default LanguageSelector;
