import { useEffect, useRef } from 'react';

const TURNSTILE_SCRIPT_ID = 'cloudflare-turnstile-script';
const TURNSTILE_SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

const loadTurnstile = () => new Promise((resolve, reject) => {
  if (window.turnstile) {
    resolve(window.turnstile);
    return;
  }

  const existing = document.getElementById(TURNSTILE_SCRIPT_ID);
  if (existing) {
    existing.addEventListener('load', () => resolve(window.turnstile), { once: true });
    existing.addEventListener('error', reject, { once: true });
    return;
  }

  const script = document.createElement('script');
  script.id = TURNSTILE_SCRIPT_ID;
  script.src = TURNSTILE_SCRIPT_URL;
  script.async = true;
  script.defer = true;
  script.addEventListener('load', () => resolve(window.turnstile), { once: true });
  script.addEventListener('error', reject, { once: true });
  document.head.appendChild(script);
});

const Turnstile = ({ action, onVerify, onError, resetKey = 0 }) => {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  useEffect(() => {
    let cancelled = false;

    if (!siteKey) {
      onError?.('not_configured');
      return undefined;
    }

    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !turnstile || !containerRef.current) return;
        widgetIdRef.current = turnstile.render(containerRef.current, {
          sitekey: siteKey,
          action,
          callback: (token) => onVerify(token),
          'expired-callback': () => onVerify(''),
          'error-callback': () => onError?.('verification_failed'),
        });
      })
      .catch(() => onError?.('verification_failed'));

    return () => {
      cancelled = true;
      if (widgetIdRef.current !== null && window.turnstile?.remove) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = null;
    };
  }, [action, onError, onVerify, resetKey, siteKey]);

  if (!siteKey) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800" role="alert">
        El formulario no está disponible temporalmente. Inténtalo más tarde.
      </p>
    );
  }

  return <div ref={containerRef} className="min-h-[65px]" aria-label="Verificación anti-spam" />;
};

export default Turnstile;
