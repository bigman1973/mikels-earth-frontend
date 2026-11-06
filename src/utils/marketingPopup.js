import { VIP_ACCESS_START } from '../config/vipSchedule.js';
export const VIP_POPUP_DISMISSED_KEY = 'mikels:vip-popup-dismissed:2026';
export const VIP_POPUP_KNOWN_KEY = 'mikels:vip-known:2026';
export const MARKETING_POPUP_CHANGE_EVENT = 'mikels:marketing-popup-change';
const ENTRY_PATHS = new Set([
  '/', '/tienda', '/productos', '/la-familia', '/nuestra-tierra',
  '/como-se-hace', '/nuestras-joyas', '/recetario', '/blog', '/opiniones',
]);
export const isVipPopupAllowedPath = (pathname) => {
  const path = pathname.replace(/\/+$/, '') || '/';
  return ENTRY_PATHS.has(path) || /^\/(?:producto|blog)\/[^/]+$/.test(path);
};
export const isVipPopupBeforeAccess = (now = Date.now()) => Number.isFinite(now) && now < VIP_ACCESS_START;
let dismissed = false;
let known = false;
let owner = null;
export const getMarketingPopupOwner = () => owner;
const notify = () => window.dispatchEvent(new Event(MARKETING_POPUP_CHANGE_EVENT));
export const claimMarketingPopup = (name) => {
  if (owner && owner !== name) return false;
  owner = name;
  notify();
  return true;
};
export const releaseMarketingPopup = (name) => {
  if (owner !== name) return;
  owner = null;
  notify();
};
// Only boolean campaign markers, never email, IP, token or profile data.
export const dismissVipPopup = () => {
  dismissed = true;
  try { window.localStorage.setItem(VIP_POPUP_DISMISSED_KEY, '1'); } catch { /* memory fallback */ }
};
export const markKnownVipSignup = () => {
  known = true;
  try { window.localStorage.setItem(VIP_POPUP_KNOWN_KEY, '1'); } catch { /* memory fallback */ }
};
export const isVipPopupSuppressed = () => {
  if (dismissed || known) return true;
  try {
    if (window.localStorage.getItem(VIP_POPUP_DISMISSED_KEY) === '1'
        || window.localStorage.getItem(VIP_POPUP_KNOWN_KEY) === '1') return true;
    // Recognize existing accepted signup markers from the original /vip flow.
    for (let index = 0; index < window.sessionStorage.length; index += 1) {
      const key = window.sessionStorage.key(index);
      if (key?.startsWith('mikels:vip-signup:') && window.sessionStorage.getItem(key) === '1') return true;
    }
    return false;
  } catch {
    // If persistence cannot be inspected, do not risk repeatedly interrupting.
    return true;
  }
};
export const isDesktopTopExit = (event, width) => event.relatedTarget === null
  && event.clientY <= 0 && event.clientX >= 0 && event.clientX <= width;
