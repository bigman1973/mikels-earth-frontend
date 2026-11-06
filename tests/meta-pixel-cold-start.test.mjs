import assert from 'node:assert/strict';
import test from 'node:test';
import { runtime, proofFixture as proof, drain } from './helpers/vip-conversion-harness.mjs';

const plain = value => JSON.parse(JSON.stringify(value));
const vipEvent = ['trackCustom', 'VIPSignupConfirmed', { content_name: 'Black Friday VIP 2026' }, { eventID: proof.event_id }];

async function coldPixel({ fastSdk = false, ...options } = {}) {
  const state = await runtime(options);
  delete state.window.fbq;
  const scripts = [];
  const consumed = [];
  const direct = [];
  const transports = [];
  const inits = [];
  let locked = false;
  let attached = false;

  // Model the public fbevents.js consent lock, not a stub that drains blindly:
  // at() shifts only while !isLocked(); revoke locks; a direct consent call
  // bypasses the lock; grant releases it and onUnlocked() resumes at().
  // Non-consent direct calls while locked go back onto the same queue.
  // Config/plugin loading and actual transports are deliberately not executed.
  const consume = args => {
    if (locked && args[0] !== 'consent') {
      state.window.fbq.queue.push(args);
      return;
    }
    consumed.push(plain(args));
    if (args[0] === 'consent') {
      if (args[1] === 'revoke') locked = true;
      if (args[1] === 'grant' && locked) {
        locked = false;
        drainQueue();
      }
    } else if (args[0] === 'init') {
      inits.push(args[1]);
    } else if (args[0] === 'trackCustom' || args[0] === 'track') {
      assert.equal(inits.length, 1, 'Transport needs the existing single init');
      transports.push(plain(args));
    }
  };
  const drainQueue = () => {
    const queue = state.window.fbq.queue;
    while (queue.length && !locked) consume(queue.shift());
  };
  const attachSdk = () => {
    assert.equal(attached, false, 'Only one SDK is installed');
    attached = true;
    state.window.fbq.callMethod = (...args) => {
      direct.push(plain(args));
      consume(args);
    };
    drainQueue();
  };
  state.window.document = {
    createElement(tag) {
      assert.equal(tag, 'script');
      const listeners = new Map();
      return {
        dataset: {},
        addEventListener(name, listener) {
          if (!listeners.has(name)) listeners.set(name, new Set());
          listeners.get(name).add(listener);
        },
        fire(name) { for (const listener of listeners.get(name) || []) listener(); },
        listenerCount(name) { return listeners.get(name)?.size || 0; },
      };
    },
    head: {
      appendChild(script) {
        scripts.push(script);
        if (fastSdk) attachSdk();
        return script;
      },
    },
  };
  return Object.assign(state, {
    scripts, consumed, direct, transports, inits, attachSdk,
    locked: () => locked,
    fireLoad() {
      assert.equal(attached, true, 'SDK executes before its load event');
      assert.equal(scripts.length, 1);
      scripts[0].fire('load');
    },
    grants: () => consumed.filter(args => args[0] === 'consent' && args[1] === 'grant'),
    vipTransports: () => transports.filter(args => args[0] === 'trackCustom'),
  });
}

const finish = async (...stops) => { stops.forEach(stop => stop()); await drain(); };

// Negative control: this state matches the observed HTTP-200/callMethod-ready
// failure. No network or saved SDK execution is needed to reproduce it.
test('realistic SDK model stops at queued revoke even with callMethod ready and a grant still in queue', async () => {
  const s = await coldPixel();
  assert.equal(s.meta.trackMetaVipSignupConfirmed(proof.event_id), true);
  assert.deepEqual(plain(s.window.fbq.queue), [
    ['consent', 'revoke'], ['init', 'offline-pixel'], ['consent', 'grant'], vipEvent,
  ]);
  s.attachSdk();
  assert.equal(typeof s.window.fbq.callMethod, 'function');
  assert.equal(s.window.fbq.loaded, false);
  assert.equal(s.locked(), true);
  assert.deepEqual(s.consumed, [['consent', 'revoke']]);
  assert.deepEqual(plain(s.window.fbq.queue), [['init', 'offline-pixel'], ['consent', 'grant'], vipEvent]);
  assert.deepEqual(s.transports, []);
  assert.deepEqual(s.inits, []);
});

test('cold SDK load grants directly and drains one prequeued VIP with the unchanged server event ID', async () => {
  const s = await coldPixel();
  assert.equal(s.meta.trackMetaVipSignupConfirmed(proof.event_id), true);
  assert.equal(s.scripts.length, 1);
  assert.equal(s.scripts[0].src, 'https://connect.facebook.net/en_US/fbevents.js');
  assert.equal(s.scripts[0].async, true);
  assert.equal(s.scripts[0].dataset.mikelsMetaPixel, 'true');
  assert.equal(s.scripts[0].listenerCount('load'), 1);
  s.attachSdk();
  assert.equal(s.transports.length, 0);
  s.fireLoad();
  assert.deepEqual(s.direct, [['consent', 'grant']]);
  assert.deepEqual(s.vipTransports(), [vipEvent]);
  assert.deepEqual(s.inits, ['offline-pixel']);
  assert.equal(s.window.fbq.queue.length, 0);
  assert.equal(s.locked(), false);
  assert.equal(s.window.fbq.loaded, false, 'The fix must not depend on changing loaded');
  for (let i = 0; i < 5; i++) { s.fireLoad(); s.meta.syncMetaPixelConsent(); }
  assert.deepEqual(s.vipTransports(), [vipEvent]);
  assert.deepEqual(s.inits, ['offline-pixel']);
  assert.equal(s.scripts.length, 1);
  assert.equal(s.requests.length, 0);
});

test('fast SDK before bootstrapping completes preserves revoke/init/grant and one VIP transport', async () => {
  const s = await coldPixel({ fastSdk: true });
  assert.equal(s.meta.trackMetaVipSignupConfirmed(proof.event_id), true);
  assert.deepEqual(s.direct, [['consent', 'revoke'], ['init', 'offline-pixel'], ['consent', 'grant'], vipEvent]);
  assert.deepEqual(s.consumed, [['consent', 'revoke'], ['consent', 'grant'], ['init', 'offline-pixel'], vipEvent]);
  assert.deepEqual(s.vipTransports(), [vipEvent]);
  s.fireLoad(); s.meta.syncMetaPixelConsent();
  assert.deepEqual(s.vipTransports(), [vipEvent]);
  assert.deepEqual(s.inits, ['offline-pixel']);
  assert.equal(s.window.fbq.queue.length, 0);
  assert.equal(s.scripts.length, 1);
});

test('SDK load before the VIP interaction initializes once and sends the later event exactly once', async () => {
  const s = await coldPixel();
  const stop = s.meta.registerMetaConsentListeners();
  s.attachSdk(); s.fireLoad();
  assert.deepEqual(s.transports, []);
  assert.equal(s.meta.trackMetaVipSignupConfirmed(proof.event_id), true);
  assert.deepEqual(s.vipTransports(), [vipEvent]);
  assert.deepEqual(s.inits, ['offline-pixel']);
  stop();
});

test('withdrawal before load rechecks current state, directly revokes and never consumes queued grants or VIP', async () => {
  for (const consent of [
    { method: 'explicit', marketing: false },
    { method: 'implied', marketing: true },
    { method: 'explicit', marketing: 'true' },
    {},
    null,
  ]) {
    // Deliberately no Cookiebot notification: load must read live consent,
    // not a captured true value or the historical bootstrapped flag.
    const s = await coldPixel();
    assert.equal(s.meta.trackMetaVipSignupConfirmed(proof.event_id), true);
    s.window.Cookiebot.consent = consent;
    s.attachSdk(); s.fireLoad();
    assert.deepEqual(s.direct, [['consent', 'revoke']]);
    assert.equal(s.grants().length, 0);
    assert.equal(s.transports.length, 0);
    assert.equal(s.inits.length, 0);
    assert.equal(s.locked(), true);
    assert.equal(s.meta.trackMetaVipSignupConfirmed(proof.event_id), false);
    s.fireLoad();
    assert.equal(s.grants().length, 0);
    assert.equal(s.transports.length, 0);
  }
});

test('decline notification before load keeps SDK locked and reacceptance drains once without a new init', async () => {
  const s = await coldPixel();
  const stop = s.meta.registerMetaConsentListeners();
  assert.equal(s.meta.trackMetaVipSignupConfirmed(proof.event_id), true);
  s.window.Cookiebot.consent.marketing = false;
  s.fire('CookiebotOnDecline');
  s.attachSdk(); s.fireLoad();
  assert.deepEqual(s.direct, [['consent', 'revoke']]);
  assert.equal(s.grants().length, 0);
  assert.equal(s.transports.length, 0);
  assert.equal(s.meta.trackMetaPageView(), false);
  s.window.Cookiebot.consent.marketing = true;
  s.fire('CookiebotOnAccept');
  assert.deepEqual(s.vipTransports(), [vipEvent]);
  for (let i = 0; i < 5; i++) { s.fire('CookiebotOnConsentReady'); s.fireLoad(); }
  assert.deepEqual(s.vipTransports(), [vipEvent]);
  assert.deepEqual(s.inits, ['offline-pixel']);
  assert.equal(s.meta.trackMetaPageView(), true);
  assert.equal(s.transports.filter(args => args[1] === 'PageView').length, 1);
  assert.equal(s.window.fbq.queue.length, 0);
  assert.equal(s.scripts.length, 1);
  stop();
});

test('implied, false, missing and nonboolean consent or missing configuration never install an SDK', async () => {
  for (const options of [
    { consent: { method: 'implied', marketing: true } },
    { consent: { method: 'explicit', marketing: false } },
    { consent: { method: 'explicit', marketing: 'true' } },
    { consent: { marketing: true } },
    { consent: {} },
    { consent: null },
    { pixel: '' },
  ]) {
    const s = await coldPixel(options);
    const stop = s.meta.registerMetaConsentListeners();
    assert.equal(s.meta.syncMetaPixelConsent(), false);
    assert.equal(s.meta.trackMetaVipSignupConfirmed(proof.event_id), false);
    assert.equal(s.meta.trackMetaPageView(), false);
    s.fire(); s.fire('CookiebotOnConsentReady'); s.fire('CookiebotOnDecline');
    assert.equal(s.scripts.length, 0);
    assert.equal(typeof s.window.fbq, 'undefined');
    assert.equal(s.requests.length, 0);
    assert.equal(s.transports.length, 0);
    assert.equal(s.grants().length, 0);
    stop();
  }
  const s = await coldPixel();
  delete s.window.Cookiebot;
  assert.equal(s.meta.trackMetaVipSignupConfirmed(proof.event_id), false);
  assert.equal(s.scripts.length, 0);
});

test('post-load decline revokes transport; explicit reacceptance reuses the existing SDK and init', async () => {
  const s = await coldPixel({ consent: { method: 'explicit', marketing: false } });
  const stop = s.meta.registerMetaConsentListeners();
  assert.equal(s.scripts.length, 0);
  s.window.Cookiebot.consent.marketing = true; s.fire();
  s.attachSdk(); s.fireLoad();
  assert.deepEqual(s.inits, ['offline-pixel']);
  s.window.Cookiebot.consent.marketing = false; s.fire('CookiebotOnDecline');
  assert.equal(s.locked(), true);
  assert.equal(s.meta.trackMetaVipSignupConfirmed(proof.event_id), false);
  assert.equal(s.transports.length, 0);
  s.window.Cookiebot.consent.marketing = true; s.fire();
  assert.equal(s.meta.trackMetaVipSignupConfirmed(proof.event_id), true);
  assert.deepEqual(s.vipTransports(), [vipEvent]);
  assert.deepEqual(s.inits, ['offline-pixel']);
  assert.equal(s.scripts.length, 1);
  stop();
});

test('existing VIP coordinator deduplicates callbacks/remounts around a cold SDK using one mocked confirmation and the same event ID', async () => {
  const s = await coldPixel();
  s.marker(); assert.equal(s.store(), true);
  const stopConsent = s.meta.registerMetaConsentListeners();
  const first = s.watch(); first(); const second = s.watch(); const third = s.watch();
  s.fire(); s.fire('CookiebotOnConsentReady'); await drain();
  assert.equal(s.requests.length, 1, 'Confirmation is local mocked fetch, never a provider request');
  assert.deepEqual(JSON.parse(s.requests[0][1].body), { token: proof.token, meta_marketing_consent: true });
  assert.equal(s.storage.get(`mikels:meta-vip-confirmed:${proof.event_id}`), '1');
  assert.equal(s.window.fbq.queue.filter(args => args[0] === 'trackCustom').length, 1);
  s.attachSdk();
  assert.equal(s.transports.length, 0);
  s.fireLoad();
  assert.deepEqual(s.vipTransports(), [vipEvent]);
  for (let i = 0; i < 5; i++) { s.fireLoad(); s.fire(); }
  await finish(second, third);
  const remount = s.watch(); await drain();
  assert.equal(s.requests.length, 1);
  assert.deepEqual(s.vipTransports(), [vipEvent]);
  assert.deepEqual(s.inits, ['offline-pixel']);
  assert.equal(s.scripts.length, 1);
  await finish(remount, stopConsent);
  assert.equal(s.listenerCount(), 0);
  assert.equal(s.timers.size, 0);
});
