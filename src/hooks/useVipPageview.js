import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { API_URL } from '../config/api';

// Component-lifetime navigation guard: effect replay in StrictMode must not
// double-count. A real remount/back navigation counts again; no persistent ID.
export function sendVipPageviewOnce(navigationRef, navigationKey, send, apiUrl) {
  if (navigationRef.current === navigationKey) return;
  navigationRef.current = navigationKey;
  try {
    // No JSON/body, browser cookies, referrer, search params or marketing SDK.
    Promise.resolve(send(`${apiUrl}/api/vip/pageview`, {
      method: 'POST', credentials: 'omit', referrerPolicy: 'no-referrer',
      cache: 'no-store', keepalive: true,
    })).catch(() => {});
  } catch {
    // Best effort only: this hook must never prevent form submission.
  }
}

export default function useVipPageview() {
  const { key, pathname } = useLocation();
  const navigationRef = useRef(null);
  useEffect(() => {
    if (pathname === '/vip') {
      sendVipPageviewOnce(navigationRef, key, (...args) => fetch(...args), API_URL);
    }
  }, [key, pathname]);
}
