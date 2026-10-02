import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { rememberScrollPosition, scrollTargetForNavigation } from '../utils/navigationScroll';

const ScrollRestoration = () => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const returnedWithBrowserHistory = useRef(false);

  useEffect(() => {
    if (!('scrollRestoration' in window.history)) return undefined;

    const previousMode = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';

    return () => {
      window.history.scrollRestoration = previousMode;
    };
  }, []);

  useEffect(() => {
    const isHistoryNavigation = navigationType === 'POP' || returnedWithBrowserHistory.current;
    returnedWithBrowserHistory.current = false;
    const target = scrollTargetForNavigation(isHistoryNavigation, location.key);
    if (!target) return undefined;

    let frameId;
    let attempts = 0;
    let cancelled = false;

    const restore = () => {
      if (cancelled) return;

      // The site intentionally uses smooth scrolling for in-page reading.
      // A route transition must not inherit that animation, otherwise a user
      // briefly remains halfway down the next page on a phone.
      const root = document.documentElement;
      const originalInlineBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      window.scrollTo({ left: target.left, top: target.top, behavior: 'auto' });
      root.style.scrollBehavior = originalInlineBehavior;
      const maximumTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

      // A back navigation can initially render the lazy-route fallback. Retry
      // while the page grows so a mobile return lands at the saved position.
      if (isHistoryNavigation && maximumTop < target.top && attempts < 60) {
        attempts += 1;
        frameId = window.requestAnimationFrame(restore);
      }
    };

    restore();
    // Lazy route modules, product data, and responsive images can change the
    // document height after the first paint. Reassert the intended position
    // briefly so the new page never inherits the previous page's viewport.
    const delayedRestoreIds = [80, 250, 700].map((delay) => (
      window.setTimeout(restore, delay)
    ));

    return () => {
      cancelled = true;
      if (frameId) window.cancelAnimationFrame(frameId);
      delayedRestoreIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, [location.key, navigationType]);

  useEffect(() => {
    const markBrowserHistoryNavigation = () => {
      returnedWithBrowserHistory.current = true;
    };

    window.addEventListener('popstate', markBrowserHistoryNavigation);
    return () => window.removeEventListener('popstate', markBrowserHistoryNavigation);
  }, []);

  useEffect(() => {
    const remember = () => {
      rememberScrollPosition(location.key, {
        left: window.scrollX,
        top: window.scrollY,
      });
    };

    remember();
    window.addEventListener('scroll', remember, { passive: true });

    return () => {
      remember();
      window.removeEventListener('scroll', remember);
    };
  }, [location.key]);

  return null;
};

export default ScrollRestoration;
