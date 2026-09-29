import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Mail, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { API_URL } from '../config/api';

const POPUP_STORAGE_KEY = 'mikels_newsletter_popup_v2';
const POPUP_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const EXCLUDED_PATHS = new Set(['/carrito', '/checkout']);
const MotionAside = motion.aside;

const hasResolvedCookieConsent = () => {
  const consentApi = window.Cookiebot || window.CookieConsent;
  return consentApi?.hasResponse === true;
};

const hasValidPopupRecord = () => {
  try {
    const record = JSON.parse(localStorage.getItem(POPUP_STORAGE_KEY));
    return Number.isFinite(record?.expiresAt) && record.expiresAt > Date.now();
  } catch {
    return false;
  }
};

const persistPopupRecord = () => {
  localStorage.setItem(POPUP_STORAGE_KEY, JSON.stringify({
    shownAt: Date.now(),
    expiresAt: Date.now() + POPUP_TTL_MS,
  }));
};

const NewsletterPopup = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isCookieConsentResolved, setIsCookieConsentResolved] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    privacyPolicyAccepted: false,
    whatsappMarketingAccepted: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const shownRef = useRef(false);

  const excludedPath = EXCLUDED_PATHS.has(location.pathname);

  useEffect(() => {
    const markConsentResolved = () => {
      if (hasResolvedCookieConsent()) {
        setIsCookieConsentResolved(true);
      }
    };

    markConsentResolved();
    window.addEventListener('CookiebotOnConsentReady', markConsentResolved);
    window.addEventListener('CookiebotOnAccept', markConsentResolved);
    window.addEventListener('CookiebotOnDecline', markConsentResolved);

    const consentPoll = window.setInterval(markConsentResolved, 500);
    const stopPolling = window.setTimeout(() => window.clearInterval(consentPoll), 30_000);

    return () => {
      window.removeEventListener('CookiebotOnConsentReady', markConsentResolved);
      window.removeEventListener('CookiebotOnAccept', markConsentResolved);
      window.removeEventListener('CookiebotOnDecline', markConsentResolved);
      window.clearInterval(consentPoll);
      window.clearTimeout(stopPolling);
    };
  }, []);

  const showPopup = useCallback(() => {
    if (shownRef.current || hasValidPopupRecord()) return;

    shownRef.current = true;
    persistPopupRecord();
    setIsOpen(true);
  }, []);

  useEffect(() => {
    if (!isCookieConsentResolved || excludedPath || hasValidPopupRecord()) return undefined;

    const timer = window.setTimeout(showPopup, 25_000);
    const onScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 0 && window.scrollY / maxScroll >= 0.5) {
        showPopup();
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, [excludedPath, isCookieConsentResolved, showPopup]);

  const handleClose = () => {
    persistPopupRecord();
    setIsOpen(false);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setMessage({ text: '', type: '' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.privacyPolicyAccepted) {
      setMessage({ text: t('newsletter_popup.privacy_required'), type: 'error' });
      return;
    }

    setIsSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await fetch(`${API_URL}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone || undefined,
          privacy_policy_accepted: formData.privacyPolicyAccepted,
          whatsapp_marketing_accepted: formData.whatsappMarketingAccepted,
          source: 'popup',
        }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        persistPopupRecord();
        setMessage({ text: t('newsletter_popup.success'), type: 'success' });
        return;
      }

      setMessage({
        text: data.message || data.error || t('newsletter_popup.error_generic'),
        type: 'error',
      });
    } catch {
      setMessage({ text: t('newsletter_popup.error_generic'), type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (excludedPath) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <MotionAside
          aria-label={t('newsletter_popup.title')}
          aria-live="polite"
          className="fixed bottom-0 right-0 z-50 w-full border border-stone-200 bg-white p-5 shadow-2xl sm:bottom-5 sm:right-5 sm:max-w-[360px] sm:rounded-2xl"
          initial={{ opacity: 0, x: 400 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 400 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        >
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-3 top-3 rounded-full p-2 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-800"
            aria-label={t('newsletter_popup.close')}
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mb-4 pr-8">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-primary">
              {t('newsletter_popup.title')}
            </h2>
            <p className="mt-1 text-sm leading-5 text-stone-600">
              {t('newsletter_popup.subtitle')}
            </p>
          </div>

          {message.type === 'success' ? (
            <div className="space-y-4">
              <p className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                {message.text}
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-white transition-colors hover:bg-primary/90"
              >
                {t('newsletter_popup.close')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="sr-only" htmlFor="newsletter-first-name">
                  {t('newsletter_popup.first_name')}
                </label>
                <input
                  id="newsletter-first-name"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder={t('newsletter_popup.first_name')}
                  autoComplete="given-name"
                  required
                  disabled={isSubmitting}
                  className="min-w-0 rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-stone-100"
                />
                <label className="sr-only" htmlFor="newsletter-last-name">
                  {t('newsletter_popup.last_name')}
                </label>
                <input
                  id="newsletter-last-name"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder={t('newsletter_popup.last_name')}
                  autoComplete="family-name"
                  required
                  disabled={isSubmitting}
                  className="min-w-0 rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-stone-100"
                />
              </div>

              <label className="sr-only" htmlFor="newsletter-email">
                {t('newsletter_popup.email')}
              </label>
              <input
                id="newsletter-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t('newsletter_popup.email')}
                autoComplete="email"
                required
                disabled={isSubmitting}
                className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-stone-100"
              />

              <div>
                <label className="sr-only" htmlFor="newsletter-phone">
                  {t('newsletter_popup.phone')}
                </label>
                <input
                  id="newsletter-phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t('newsletter_popup.phone')}
                  autoComplete="tel"
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-stone-100"
                />
                <p className="mt-1.5 text-xs leading-4 text-stone-500">
                  {t('newsletter_popup.phone_help')}
                </p>
              </div>

              <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-5 text-stone-700">
                <input
                  type="checkbox"
                  name="privacyPolicyAccepted"
                  checked={formData.privacyPolicyAccepted}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="mt-1 h-4 w-4 shrink-0 accent-primary"
                />
                <span>
                  {t('newsletter_popup.privacy_prefix')}{' '}
                  <Link className="font-semibold text-primary underline underline-offset-2" to="/politica-privacidad">
                    {t('newsletter_popup.privacy_link')}
                  </Link>
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-5 text-stone-700">
                <input
                  type="checkbox"
                  name="whatsappMarketingAccepted"
                  checked={formData.whatsappMarketingAccepted}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="mt-1 h-4 w-4 shrink-0 accent-primary"
                />
                <span>{t('newsletter_popup.whatsapp_consent')}</span>
              </label>

              {message.text && (
                <p
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  {message.text}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? t('newsletter_popup.submitting') : t('newsletter_popup.submit')}
              </button>
            </form>
          )}
        </MotionAside>
      )}
    </AnimatePresence>
  );
};

export default NewsletterPopup;
