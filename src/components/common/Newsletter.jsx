import { Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const NEWSLETTER_POPUP_REQUEST_EVENT = 'mikels:open-newsletter-popup';

const Newsletter = ({ variant = 'default' }) => {
  const { t } = useTranslation();

  const openConsentCompliantForm = () => {
    window.dispatchEvent(new CustomEvent(NEWSLETTER_POPUP_REQUEST_EVENT));
  };

  if (variant === 'footer') {
    return (
      <div className="rounded-lg bg-primary/5 p-6">
        <div className="mb-3 flex items-center gap-2">
          <Mail className="text-secondary" size={24} />
          <h3 className="text-lg font-bold text-primary">Newsletter</h3>
        </div>
        <p className="mb-4 text-sm text-gray-700">{t('newsletter.subtitle')}</p>
        <button
          type="button"
          onClick={openConsentCompliantForm}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2 font-bold text-white transition-colors hover:bg-secondary/90"
        >
          <Mail size={16} />
          {t('newsletter.subscribe_btn')}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-r from-primary to-accent p-8 text-center shadow-2xl md:p-12">
      <Mail className="mx-auto mb-4 text-secondary" size={48} />
      <h3 className="mb-4 text-3xl font-bold text-white md:text-4xl">
        {t('newsletter.join_title')}
      </h3>
      <p className="mb-6 text-lg text-white/90">{t('newsletter.join_description')}</p>
      <button
        type="button"
        onClick={openConsentCompliantForm}
        className="inline-flex items-center gap-2 rounded-lg bg-secondary px-6 py-3 font-bold text-white transition-colors hover:bg-secondary/90"
      >
        <Mail size={20} />
        {t('newsletter.subscribe_btn')}
      </button>
    </div>
  );
};

export default Newsletter;
