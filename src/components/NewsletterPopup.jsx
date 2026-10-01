import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Mail, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { API_URL } from '../config/api';
import { useCart } from '../context/CartContext';
import { isNewsletterPopupAllowedPath } from '../utils/newsletterPopupPaths';

const POPUP_STORAGE_KEY = 'mikels_newsletter_popup_v2';
const POPUP_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const NEWSLETTER_POPUP_REQUEST_EVENT = 'mikels:open-newsletter-popup';
const MotionAside = motion.aside;
const COOKIEBOT_PREVIEW_BYPASS_ENABLED = import.meta.env.VITE_COOKIEBOT_PREVIEW_BYPASS === 'true';

const hasResolvedCookieConsent = () => {
  const consentApi = window.Cookiebot || window.CookieConsent;
  return consentApi?.hasResponse === true;
};

const isVercelPreviewWithoutCookieBanner = () => {
  const consentApi = window.Cookiebot || window.CookieConsent;
  return COOKIEBOT_PREVIEW_BYPASS_ENABLED
    && consentApi?.settingsLoaded === true
    && consentApi?.dialog === null
    && consentApi?.hasResponse === false;
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
  const { isCartOpen } = useCart();
  const [isCookieConsentResolved, setIsCookieConsentResolved] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [privacyPolicyAccepted, setPrivacyPolicyAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const shownRef = useRef(false);
  const manuallyRequestedRef = useRef(false);

  const allowedContext = isNewsletterPopupAllowedPath(location.pathname) && !isCartOpen;

  useEffect(() => {
    const markConsentResolved = () => {
      if (hasResolvedCookieConsent() || isVercelPreviewWithoutCookieBanner()) {
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
    const openRequestedPopup = () => {
      if (!allowedContext || hasValidPopupRecord()) return;
      if (isCookieConsentResolved) showPopup();
      else manuallyRequestedRef.current = true;
    };
    window.addEventListener(NEWSLETTER_POPUP_REQUEST_EVENT, openRequestedPopup);
    return () => window.removeEventListener(NEWSLETTER_POPUP_REQUEST_EVENT, openRequestedPopup);
  }, [allowedContext, isCookieConsentResolved, showPopup]);

  useEffect(() => {
    if (manuallyRequestedRef.current && isCookieConsentResolved && allowedContext) {
      manuallyRequestedRef.current = false;
      showPopup();
    }
  }, [allowedContext, isCookieConsentResolved, showPopup]);

  useEffect(() => {
    if (!isCookieConsentResolved || !allowedContext || hasValidPopupRecord()) return undefined;
    const timer = window.setTimeout(showPopup, 25_000);
    const onScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 0 && window.scrollY / maxScroll >= 0.5) showPopup();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, [allowedContext, isCookieConsentResolved, showPopup]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!privacyPolicyAccepted) {
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
          email,
          privacy_policy_accepted: true,
          whatsapp_marketing_accepted: false,
          source: 'popup',
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        persistPopupRecord();
        setMessage({
          text: data.already_subscribed ? t('newsletter_popup.already_subscribed') : t('newsletter_popup.success'),
          type: 'success',
        });
        return;
      }
      setMessage({ text: data.message || data.error || t('newsletter_popup.error_generic'), type: 'error' });
    } catch {
      setMessage({ text: t('newsletter_popup.error_generic'), type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!allowedContext) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <MotionAside
          aria-label={t('newsletter_popup.title')}
          aria-live="polite"
          className="fixed bottom-0 right-0 z-50 w-full border border-stone-200 bg-white p-4 shadow-2xl sm:bottom-5 sm:right-5 sm:max-w-[360px] sm:rounded-2xl sm:p-5"
          initial={{ opacity: 0, x: 400 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 400 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        >
          <button type="button" onClick={() => { persistPopupRecord(); setIsOpen(false); }} className="absolute right-3 top-3 rounded-full p-2 text-stone-500 hover:bg-stone-100" aria-label={t('newsletter_popup.close')}>
            <X className="h-5 w-5" />
          </button>
          <div className="mb-4 pr-8">
            <Mail className="mb-2 hidden h-5 w-5 text-primary sm:block" aria-hidden="true" />
            <h2 className="font-serif text-xl font-semibold text-[#1a1a1a] sm:text-2xl">{t('newsletter_popup.title')}</h2>
            <p className="mt-1 text-sm text-stone-600">{t('newsletter_popup.subtitle')}</p>
          </div>

          {message.type === 'success' ? (
            <div className="space-y-4">
              <p className="rounded-lg border border-stone-200 bg-[#f5efe4] p-3 text-sm text-[#1a1a1a]">{message.text}</p>
              <button type="button" onClick={() => { persistPopupRecord(); setIsOpen(false); }} className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-white hover:bg-primary/90">
                {t('newsletter_popup.close')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <label className="sr-only" htmlFor="newsletter-email">{t('newsletter_popup.email')}</label>
              <input
                id="newsletter-email"
                type="email"
                name="email"
                value={email}
                onChange={(event) => { setEmail(event.target.value); setMessage({ text: '', type: '' }); }}
                placeholder={t('newsletter_popup.email')}
                autoComplete="email"
                required
                disabled={isSubmitting}
                className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-stone-100"
              />
              <label className="flex cursor-pointer items-start gap-2 text-xs leading-5 text-stone-700">
                <input
                  type="checkbox"
                  name="privacyPolicyAccepted"
                  checked={privacyPolicyAccepted}
                  onChange={(event) => { setPrivacyPolicyAccepted(event.target.checked); setMessage({ text: '', type: '' }); }}
                  required
                  disabled={isSubmitting}
                  className="mt-1 h-4 w-4 shrink-0 accent-primary"
                />
                <span>
                  {t('newsletter_popup.privacy_prefix')}{' '}
                  <Link className="font-semibold text-primary underline underline-offset-2" to="/politica-privacidad">{t('newsletter_popup.privacy_link')}</Link>
                </span>
              </label>
              {message.text && <p role="alert" className="rounded-lg border border-stone-300 bg-[#f5efe4] p-3 text-sm text-[#1a1a1a]">{message.text}</p>}
              <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60">
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
