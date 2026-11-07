import { VIP_ACCESS_START } from '../config/vipSchedule.js';

export const BF26_TOP_BAND_DISMISSED_KEY = 'mikels:bf26-top-band-dismissed';
export const BF26_TOP_BAND_CHANGE_EVENT = 'mikels:bf26-top-band-change';
let dismissed = false;

export const isTopBandAllowedPath = (pathname = '/') => {
  const path = pathname.replace(/\/+$/, '') || '/';
  return path !== '/vip' && path !== '/vip/gracias'
    && path !== '/admin' && !path.startsWith('/admin/');
};

export const isTopBandBeforeAccess = (now = Date.now()) => Number.isFinite(now) && now < VIP_ACCESS_START;

export const isTopBandDismissed = () => {
  if (dismissed) return true;
  if (typeof window === 'undefined') return false;
  try {
    // A malformed marker also suppresses the band: never risk reopening it.
    return window.localStorage.getItem(BF26_TOP_BAND_DISMISSED_KEY) !== null;
  } catch {
    // Without readable persistence, do not repeatedly interrupt this browser.
    return true;
  }
};

export const dismissTopBand = () => {
  dismissed = true;
  if (typeof window === 'undefined') return;
  // Only a boolean UI preference; no email, IP, customer or analytics data.
  try { window.localStorage.setItem(BF26_TOP_BAND_DISMISSED_KEY, '1'); } catch { /* memory fallback */ }
  window.dispatchEvent(new Event(BF26_TOP_BAND_CHANGE_EVENT));
};
