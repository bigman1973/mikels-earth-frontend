import { useCallback, useEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { VIP_ACCESS_START } from '../config/vipSchedule';
import VipSignup from './VipSignup';
import {
  MARKETING_POPUP_CHANGE_EVENT, claimMarketingPopup, dismissVipPopup,
  isVipPopupAllowedPath, isVipPopupBeforeAccess, isVipPopupSuppressed, releaseMarketingPopup,
} from '../utils/marketingPopup';
const PREVIEW_BYPASS = import.meta.env.VITE_COOKIEBOT_PREVIEW_BYPASS === 'true';
const consentResolved = () => {
  const api = window.Cookiebot || window.CookieConsent;
  return api?.hasResponse === true || (PREVIEW_BYPASS && api?.settingsLoaded === true
    && api?.dialog === null && api?.hasResponse === false);
};
const VipEntryPopup = () => {
  const { pathname } = useLocation();
  const { isCartOpen } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [beforeAccess, setBeforeAccess] = useState(isVipPopupBeforeAccess);
  const [resolved, setResolved] = useState(false);
  const shownRef = useRef(false);
  const mountedRef = useRef(false);
  const allowed = isVipPopupAllowedPath(pathname) && !isCartOpen && beforeAccess;
  const close = useCallback(() => {
    dismissVipPopup();
    setIsOpen(false);
    releaseMarketingPopup('vip');
  }, []);
  useEffect(() => {
    let timer;
    const update = () => {
      window.clearTimeout(timer);
      const remaining = VIP_ACCESS_START - Date.now();
      setBeforeAccess(isVipPopupBeforeAccess());
      if (remaining > 0) timer = window.setTimeout(update, Math.min(remaining, 2_147_483_647));
    };
    update();
    window.addEventListener('focus', update);
    const onVisibility = () => { window.clearTimeout(timer); update(); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('focus', update);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);
  useEffect(() => {
    const update = () => { if (consentResolved()) setResolved(true); };
    update();
    const names = ['CookiebotOnConsentReady', 'CookiebotOnAccept', 'CookiebotOnDecline'];
    names.forEach(name => window.addEventListener(name, update));
    const poll = window.setInterval(update, 500);
    const stop = window.setTimeout(() => window.clearInterval(poll), 30_000);
    return () => {
      names.forEach(name => window.removeEventListener(name, update));
      window.clearInterval(poll);
      window.clearTimeout(stop);
    };
  }, []);
  useEffect(() => {
    if (!allowed) {
      setIsOpen(false);
      releaseMarketingPopup('vip');
      return undefined;
    }
    const open = () => {
      if (!resolved || shownRef.current || !isVipPopupBeforeAccess() || isVipPopupSuppressed()) return;
      // Set the guard before claiming: notification is synchronous.
      shownRef.current = true;
      if (!claimMarketingPopup('vip')) { shownRef.current = false; return; }
      setIsOpen(true);
    };
    open();
    window.addEventListener(MARKETING_POPUP_CHANGE_EVENT, open);
    return () => window.removeEventListener(MARKETING_POPUP_CHANGE_EVENT, open);
  }, [allowed, resolved]);
  useEffect(() => {
    mountedRef.current = true;
    const onStorage = () => { if (isVipPopupSuppressed()) { setIsOpen(false); releaseMarketingPopup('vip'); } };
    window.addEventListener('storage', onStorage);
    return () => {
      mountedRef.current = false;
      window.removeEventListener('storage', onStorage);
      queueMicrotask(() => { if (!mountedRef.current) releaseMarketingPopup('vip'); });
    };
  }, []);
  if (!allowed) return null;
  return (
    <Dialog.Root open={isOpen} onOpenChange={open => { if (!open) close(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/50" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-1/2 z-[61] max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white shadow-2xl focus:outline-none"
          onPointerDownOutside={event => event.preventDefault()}
          onEscapeKeyDown={close}
        >
          <Dialog.Title className="sr-only">Lista VIP Black Friday</Dialog.Title>
          <div className="sticky top-0 z-10 flex justify-end border-b border-stone-200 bg-white px-3 py-1">
            <Dialog.Close className="flex min-h-11 items-center gap-1 rounded-lg px-3 text-sm font-medium text-[#1a1a1a] hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7f1d2d]">
              Cerrar <X className="h-5 w-5" aria-hidden="true" />
            </Dialog.Close>
          </div>
          <VipSignup
            compact
            popupHeader={
              <>
                <h2 className="text-center text-[26px] font-bold leading-tight text-[#7f1d2d] sm:text-3xl">
                  HASTA EL 50 % DE DESCUENTO
                </h2>
                <p className="mt-4 text-center text-base leading-6 text-stone-700">
                  El 26 de noviembre, un día antes que nadie.
                </p>
                <p className="mt-2 text-center text-base leading-6 text-stone-700">
                  Y un tarro de mermelada de regalo con cualquier pack.
                </p>
              </>
            }
            submitLabel="QUIERO ENTRAR EN LA LISTA"
            footerText="Hasta agotar existencias."
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
export default VipEntryPopup;
