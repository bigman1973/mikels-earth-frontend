import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { rememberScrollPosition, scrollTargetForNavigation } from '../utils/navigationScroll';

const ScrollRestoration = () => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const returnedWithBrowserHistory = useRef(false);
  const routeTransitioning = useRef(false);
  const currentLocationKey = useRef(location.key);
  const pointerStartScroll = useRef(null);
  currentLocationKey.current = location.key;

  const scrollImmediately = (target) => {
    const root = document.documentElement;
    const originalInlineBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo({ left: target.left, top: target.top, behavior: 'auto' });
    root.style.scrollBehavior = originalInlineBehavior;
  };

  useEffect(() => {
    // The previous location's persistence cleanup has now run. The new route
    // can resume recording its own position normally.
    routeTransitioning.current = false;
    const isHistoryNavigation = navigationType === 'POP' || returnedWithBrowserHistory.current;
    returnedWithBrowserHistory.current = false;
    // Back/Forward is deliberately left to the browser. It owns the history
    // entry and restores the exact reading position more reliably than a SPA
    // can while lazy content and responsive images are still loading.
    if (isHistoryNavigation) return undefined;
    const target = scrollTargetForNavigation(false, location.key);
    if (!target) return undefined;

    let frameId;
    let attempts = 0;
    let cancelled = false;

    const restore = () => {
      if (cancelled) return;

      // The site intentionally uses smooth scrolling for in-page reading.
      // A route transition must not inherit that animation, otherwise a user
      // briefly remains halfway down the next page on a phone.
      scrollImmediately(target);
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
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    const wrapHistoryWrite = (originalWrite) => function writeRouteState(...args) {
      const result = originalWrite.apply(window.history, args);
      // BrowserRouter updates the URL before a lazy route is ready. Reset here
      // rather than waiting for the route component so navigation is immediate.
      scrollImmediately({ left: 0, top: 0 });
      return result;
    };

    window.history.pushState = wrapHistoryWrite(originalPushState);
    window.history.replaceState = wrapHistoryWrite(originalReplaceState);

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  useEffect(() => {
    const internalAnchorForEvent = (event) => {
      if (
        event.defaultPrevented
        || event.button !== 0
        || event.metaKey
        || event.ctrlKey
        || event.shiftKey
        || event.altKey
        || !(event.target instanceof Element)
      ) return null;

      const anchor = event.target.closest('a[href]');
      const href = anchor?.getAttribute('href');
      return href && href.startsWith('/') && !href.startsWith('//') && !anchor.target && !anchor.hasAttribute('download')
        ? anchor
        : null;
    };

    const rememberPointerStart = (event) => {
      if (!internalAnchorForEvent(event)) return;
      pointerStartScroll.current = {
        key: currentLocationKey.current,
        left: window.scrollX,
        top: window.scrollY,
      };
    };

    const resetForInternalLink = (event) => {
      if (!internalAnchorForEvent(event)) return;

      // Capture the click before React Router waits for a lazy page module.
      // Back/Forward never raises a click, so their saved position is intact.
      const savedPosition = pointerStartScroll.current?.key === currentLocationKey.current
        ? pointerStartScroll.current
        : { left: window.scrollX, top: window.scrollY };
      rememberScrollPosition(currentLocationKey.current, {
        left: savedPosition.left,
        top: savedPosition.top,
      });
      routeTransitioning.current = true;
      window.history.replaceState({
        ...(window.history.state || {}),
        mikelsScrollPosition: { left: savedPosition.left, top: savedPosition.top },
      }, document.title);
      pointerStartScroll.current = null;
      scrollImmediately({ left: 0, top: 0 });
    };

    document.addEventListener('pointerdown', rememberPointerStart, true);
    document.addEventListener('mousedown', rememberPointerStart, true);
    document.addEventListener('click', resetForInternalLink, true);
    return () => {
      document.removeEventListener('pointerdown', rememberPointerStart, true);
      document.removeEventListener('mousedown', rememberPointerStart, true);
      document.removeEventListener('click', resetForInternalLink, true);
    };
  }, []);

  useEffect(() => {
    const markBrowserHistoryNavigation = () => {
      returnedWithBrowserHistory.current = true;
    };

    window.addEventListener('popstate', markBrowserHistoryNavigation);
    return () => window.removeEventListener('popstate', markBrowserHistoryNavigation);
  }, []);

  useEffect(() => {
    const remember = () => {
      if (routeTransitioning.current) return;
      rememberScrollPosition(location.key, {
        left: window.scrollX,
        top: window.scrollY,
      });
    };

    remember();
    window.addEventListener('scroll', remember, { passive: true });

    return () => {
      if (!routeTransitioning.current) remember();
      window.removeEventListener('scroll', remember);
    };
  }, [location.key]);

  return null;
};

export default ScrollRestoration;
