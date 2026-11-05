import { hasMarketingConsent, trackMetaVipSignupConfirmed } from './metaPixel';

export const VIP_CONVERSION_EVENT = 'VIPSignupConfirmed';
export const MAX_ATTEMPTS = 3;
export const REQUEST_TIMEOUT_MS = 25000;
export const RETRY_DELAYS_MS = [10000, 20000];
export const RETRY_WINDOW_MS = 60000;
const CONSENT_EVENTS = ['CookiebotOnConsentReady', 'CookiebotOnAccept', 'CookiebotOnDecline'];
// One coordinator per server event, not per render or Cookiebot callback.
const jobs = new Map();
const sentEvents = new Set();
const proofKey = (signupId) => `mikels:vip-conversion:${signupId}`;
const metaKey = (eventId) => `mikels:meta-vip-confirmed:${eventId}`;
const retryKey = (eventId) => `mikels:meta-vip-attempts:${eventId}`;

export const validVipConversionProof = (proof) => Boolean(
  proof && typeof proof === 'object'
  && proof.event_name === VIP_CONVERSION_EVENT
  && typeof proof.event_id === 'string' && /^[A-Za-z0-9_-]{1,200}$/.test(proof.event_id)
  && typeof proof.token === 'string' && proof.token.length > 0 && proof.token.length <= 8192
  && !/\s/.test(proof.token),
);

// Persist only the fixed server contract, never a profile or the signup body.
// Measurement/storage failure must not turn an accepted signup into a UI error.
export const storeVipConversionProof = (signupId, proof, status) => {
  try {
    if (status !== 201 || !validVipConversionProof(proof)) {
      window.sessionStorage.removeItem(proofKey(signupId));
      return false;
    }
    window.sessionStorage.setItem(proofKey(signupId), JSON.stringify({
      token: proof.token, event_id: proof.event_id, event_name: VIP_CONVERSION_EVENT,
    }));
    return true;
  } catch {
    return false;
  }
};

const readProof = (signupId) => {
  try {
    if (window.sessionStorage.getItem(`mikels:vip-signup:${signupId}`) !== '1') return null;
    const proof = JSON.parse(window.sessionStorage.getItem(proofKey(signupId)) || 'null');
    return validVipConversionProof(proof) ? proof : null;
  } catch {
    return null;
  }
};

// An opaque token is not authenticated in the browser. Even a well-shaped,
// forged proof must go to the server and can never emit from storage alone.
export const watchMetaVipSignupConfirmation = (signupId, apiUrl) => {
  if (typeof window === 'undefined' || !signupId) return () => {};
  const proof = readProof(signupId);
  if (!proof) return () => {};
  const eventId = proof.event_id;
  let job = jobs.get(eventId);
  if (job && job.token !== proof.token) return () => {};

  if (!job) {
    let state;
    try {
      if (sentEvents.has(eventId) || window.sessionStorage.getItem(metaKey(eventId)) === '1') return () => {};
      state = JSON.parse(window.sessionStorage.getItem(retryKey(eventId)) || 'null')
        || { attempts: 0, next_retry_at: 0, deadline: 0, terminal: false };
      // Corrupted retry state fails closed rather than resetting the budget.
      if (!Number.isInteger(state.attempts) || state.attempts < 0 || state.attempts > MAX_ATTEMPTS
          || !Number.isFinite(state.next_retry_at) || !Number.isFinite(state.deadline)
          || typeof state.terminal !== 'boolean') return () => {};
    } catch {
      return () => {};
    }

    job = { token: proof.token, subscribers: new Set(), cancelled: false, controller: null, timer: null, state };
    jobs.set(eventId, job);
    const saveState = () => {
      try {
        window.sessionStorage.setItem(retryKey(eventId), JSON.stringify(state));
        return true;
      } catch {
        state.terminal = true;
        return false;
      }
    };
    const stopTimer = () => {
      clearTimeout(job.timer);
      job.timer = null;
    };
    const terminal = () => {
      state.terminal = true;
      saveState();
    };
    const eligible = () => !job.cancelled && job.subscribers.size > 0 && hasMarketingConsent()
      && !state.terminal && state.attempts < MAX_ATTEMPTS
      && (!state.deadline || Date.now() < state.deadline);

    const run = async () => {
      if (!eligible() || job.controller || job.timer) return;
      const wait = state.next_retry_at - Date.now();
      if (wait > 0) {
        job.timer = setTimeout(() => { job.timer = null; run(); }, Math.min(wait, state.deadline - Date.now()));
        return;
      }
      state.deadline ||= Date.now() + RETRY_WINDOW_MS;
      const requestTimeout = Math.min(REQUEST_TIMEOUT_MS, state.deadline - Date.now());
      state.attempts += 1;
      state.next_retry_at = Math.min(state.deadline, Date.now() + requestTimeout + (RETRY_DELAYS_MS[state.attempts - 1] || 0));
      if (!saveState()) return;
      const controller = new AbortController();
      job.controller = controller;
      let timedOut = false;
      const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, requestTimeout);
      job.requestTimer = timeout;
      let temporary = false;
      try {
        const response = await fetch(`${apiUrl}/api/vip/conversion`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: proof.token, meta_marketing_consent: true }),
          signal: controller.signal,
        });
        const data = await response.json().catch(() => null);
        if (job.cancelled || !job.subscribers.size || controller.signal.aborted || Date.now() >= state.deadline) return;
        if (response.status === 200 && data?.confirmed === true
            && data.event_name === VIP_CONVERSION_EVENT && data.event_id === eventId) {
          // capi_sent reports transport, not membership. A CAPI send failure does
          // not invalidate a genuine confirmation or change the shared event ID.
          if (!hasMarketingConsent()) return;
          if (trackMetaVipSignupConfirmed(eventId)) {
            sentEvents.add(eventId);
            try { window.sessionStorage.setItem(metaKey(eventId), '1'); } catch { /* in-memory dedup remains */ }
            terminal();
          } else {
            // A missing Pixel configuration is not a temporary membership state.
            // Never repeat CAPI confirmations on each Cookiebot notification.
            terminal();
          }
          return;
        }
        // The fixed contract has no retry hint on a neutral 200. Never guess
        // that a refusal/malformed/mismatched confirmation means membership.
        temporary = data?.confirmed !== true && (
          response.status === 202 || [408, 425, 429].includes(response.status) || response.status >= 500
        );
        if (!temporary) terminal();
      } catch {
        // No token, API response, PII or provider credentials are logged.
        temporary = !controller.signal.aborted || timedOut;
      } finally {
        clearTimeout(timeout);
        job.requestTimer = null;
        job.controller = null;
        if (temporary && !job.cancelled) {
          state.next_retry_at = Math.min(state.deadline, Date.now() + (RETRY_DELAYS_MS[state.attempts - 1] || 0));
          saveState();
          run();
        }
      }
    };
    job.onConsent = () => {
      if (!hasMarketingConsent()) {
        stopTimer();
        job.controller?.abort();
      } else {
        run();
      }
    };
    job.dispose = () => {
      job.cancelled = true;
      stopTimer();
      clearTimeout(job.requestTimer);
      job.controller?.abort();
      CONSENT_EVENTS.forEach((name) => window.removeEventListener(name, job.onConsent));
      jobs.delete(eventId);
    };
    CONSENT_EVENTS.forEach((name) => window.addEventListener(name, job.onConsent));
  }

  const subscriber = {};
  job.subscribers.add(subscriber);
  job.onConsent();
  return () => {
    job.subscribers.delete(subscriber);
    // React StrictMode immediately reattaches the effect in the same turn.
    // Preserve its single in-flight request, but abort on a genuine unmount.
    queueMicrotask(() => { if (!job.subscribers.size && !job.cancelled) job.dispose(); });
  };
};
