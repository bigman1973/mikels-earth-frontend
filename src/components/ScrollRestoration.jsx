import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { rememberScrollPosition, scrollTargetForNavigation } from '../utils/navigationScroll';

const ScrollRestoration = () => {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (!('scrollRestoration' in window.history)) return undefined;

    const previousMode = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';

    return () => {
      window.history.scrollRestoration = previousMode;
    };
  }, []);

  useEffect(() => {
    const target = scrollTargetForNavigation(navigationType, location.key);
    if (!target) return undefined;

    let frameId;
    let attempts = 0;
    let cancelled = false;

    const restore = () => {
      if (cancelled) return;

      window.scrollTo(target.left, target.top);
      const maximumTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

      // A back navigation can initially render the lazy-route fallback. Retry
      // while the page grows so a mobile return lands at the saved position.
      if (navigationType === 'POP' && maximumTop < target.top && attempts < 60) {
        attempts += 1;
        frameId = window.requestAnimationFrame(restore);
      }
    };

    restore();

    return () => {
      cancelled = true;
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [location.key, navigationType]);

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
