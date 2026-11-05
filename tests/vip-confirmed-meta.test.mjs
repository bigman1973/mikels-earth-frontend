import assert from 'node:assert/strict';
import test from 'node:test';
import { runtime, proofFixture as proof, jsonResponse, drain } from './helpers/vip-conversion-harness.mjs';

const confirmed = (extra = {}) => ({ confirmed: true, event_name: proof.event_name, event_id: proof.event_id, capi_sent: true, ...extra });
const ready = async options => { const state = await runtime(options); state.marker(); state.store(); return state; };
const plain = value => JSON.parse(JSON.stringify(value));
const finish = async stop => { stop(); await drain(); };

test('VIP custom Pixel uses exactly trackCustom, the fixed content name and fourth-argument server eventID', async () => {
  const s = await runtime();
  assert.equal(s.meta.trackMetaVipSignupConfirmed(proof.event_id), true);
  assert.deepEqual(plain(s.customEvents()), [['trackCustom', 'VIPSignupConfirmed', { content_name: 'Black Friday VIP 2026' }, { eventID: proof.event_id }]]);
  assert.equal(s.meta.trackMetaVipSignupConfirmed(42), false);
  assert.equal(s.meta.trackMetaVipSignupConfirmed('bad@id'), false);
});

test('VIP helper rejects absent/denied/implied marketing and missing Pixel configuration', async () => {
  for (const options of [
    { consent: {} }, { consent: { marketing: true, method: 'implied' } },
    { consent: { marketing: false, method: 'explicit' } }, { pixel: '' },
  ]) {
    const s = await runtime(options);
    assert.equal(s.meta.trackMetaVipSignupConfirmed(proof.event_id), false);
    assert.equal(s.customEvents().length, 0);
  }
});

test('201 stores only the fixed opaque proof alongside the existing marker, without PII', async () => {
  const s = await runtime(); s.marker();
  assert.equal(s.store('42', { ...proof, email: 'not-to-be-stored@example.invalid', first_name: 'Private' }), true);
  assert.deepEqual(JSON.parse(s.storage.get('mikels:vip-conversion:42')), proof);
  assert.equal(s.storage.get('mikels:vip-signup:42'), '1');
  assert.doesNotMatch(JSON.stringify([...s.storage]), /example|Private|email|first_name/);
});

test('neutral/non-201 responses and malformed/absent proof cannot persist a conversion', async () => {
  const s = await runtime();
  for (const status of [200, 202, 400, 500]) assert.equal(s.store('42', proof, status), false);
  for (const invalid of [null, {}, 42, { ...proof, token: '' }, { ...proof, token: 'space token' }, { ...proof, event_name: 'Lead' }, { ...proof, event_id: 42 }]) {
    assert.equal(s.store('42', invalid), false);
  }
  assert.equal(s.storage.size, 0);
});

test('direct thanks, arbitrary signup number, marker-only or proof-only never request or emit Meta', async () => {
  for (const type of ['direct', 'number', 'marker', 'proof', 'corrupt']) {
    const s = await runtime();
    if (type === 'marker' || type === 'corrupt') s.marker();
    if (type === 'proof') s.store();
    if (type === 'corrupt') s.storage.set('mikels:vip-conversion:42', '{');
    const stop = s.watch(type === 'direct' ? '' : '42'); await drain();
    assert.equal(s.requests.length, 0, type); assert.equal(s.customEvents().length, 0, type); await finish(stop);
  }
});

test('server confirmation is awaited: exact minimal POST with token only in the body and consent true', async () => {
  const s = await ready(); let resolve;
  s.fetch = () => new Promise(done => { resolve = done; });
  const stop = s.watch(); await drain();
  assert.equal(s.customEvents().length, 0);
  const [url, init] = s.requests[0];
  assert.equal(url, 'https://offline.invalid/api/vip/conversion');
  assert.equal(init.method, 'POST');
  assert.deepEqual(plain(init.headers), { 'Content-Type': 'application/json' });
  assert.deepEqual(JSON.parse(init.body), { token: proof.token, meta_marketing_consent: true });
  assert.doesNotMatch(url, /token|signup|@/);
  resolve(jsonResponse(confirmed())); await drain();
  assert.equal(s.customEvents().length, 1); await finish(stop);
});

test('capi_sent false is a transport failure, not a membership failure: confirmed Pixel still uses same ID', async () => {
  const s = await ready(); s.fetch = async () => jsonResponse(confirmed({ capi_sent: false }));
  const stop = s.watch(); await drain();
  assert.equal(s.customEvents().length, 1);
  assert.equal(s.customEvents()[0][3].eventID, proof.event_id); await finish(stop);
});

test('false/indeterminate/forged/malformed/mismatched confirmations permanently fail closed', async () => {
  for (const [body, status] of [
    [{ confirmed: false }, 200], [{}, 200], [confirmed({ confirmed: 'true' }), 200],
    [confirmed({ event_id: 'different-id' }), 200], [confirmed({ event_name: 'Lead' }), 200],
    [confirmed(), 500], [confirmed(), 202], [confirmed(), 201], [{ confirmed: false }, 403], [{ confirmed: false }, 401],
  ]) {
    const s = await ready(); s.fetch = async () => jsonResponse(body, status);
    const stop = s.watch(); await drain(); s.fire(); await s.advance(s.conversion.RETRY_WINDOW_MS);
    assert.equal(s.requests.length, 1, JSON.stringify(body));
    assert.equal(s.customEvents().length, 0); await finish(stop);
  }
  const s = await ready(); s.fetch = async () => new Response('not-json');
  const stop = s.watch(); await drain(); s.fire(); await s.advance(s.conversion.RETRY_WINDOW_MS);
  assert.equal(s.requests.length, 1); assert.equal(s.customEvents().length, 0); await finish(stop);
});

test('well-shaped forged token still needs server authorization and never emits on refusal', async () => {
  const s = await ready(); s.store('42', { ...proof, token: 'forged.token' });
  s.fetch = async () => jsonResponse({ confirmed: false }, 400);
  const stop = s.watch(); await drain();
  assert.equal(JSON.parse(s.requests[0][1].body).token, 'forged.token');
  assert.equal(s.customEvents().length, 0); await finish(stop);
});

test('no confirmation POST until Cookiebot explicit marketing true; repeated callbacks produce one request', async () => {
  const s = await ready({ consent: { method: 'implied', marketing: true, statistics: true } });
  const stop = s.watch(); s.fire(); await drain(); assert.equal(s.requests.length, 0);
  s.window.Cookiebot.consent.method = 'explicit';
  s.fire(); s.fire(); s.fire('CookiebotOnConsentReady'); await drain();
  assert.equal(s.requests.length, 1); assert.equal(s.customEvents().length, 1); await finish(stop);
});

test('StrictMode mount-cleanup-remount and concurrent watchers share one in-flight request', async () => {
  const s = await ready(); let resolve;
  s.fetch = () => new Promise(done => { resolve = done; });
  const first = s.watch(); first(); const second = s.watch(); const third = s.watch();
  s.fire(); await drain(); assert.equal(s.requests.length, 1);
  resolve(jsonResponse(confirmed())); await drain();
  assert.equal(s.customEvents().length, 1); await finish(second); await finish(third);
  assert.equal(s.listenerCount(), 0);
});

test('remount and simulated page refresh deduplicate with event ID, not signup number', async () => {
  const s = await ready(); const stop = s.watch(); await drain(); await finish(stop);
  s.marker('43'); s.store('43'); const again = s.watch('43'); await drain();
  assert.equal(s.requests.length, 1); await finish(again);
  const refreshed = await runtime({ storage: s.storage }); const stopRefresh = refreshed.watch(); await drain();
  assert.equal(refreshed.requests.length, 0); assert.equal(refreshed.customEvents().length, 0); await finish(stopRefresh);
});

test('temporary 202/408/425/429/5xx and network errors retry at most three times with same proof/event ID', async () => {
  for (const status of [202, 408, 425, 429, 503, 'network']) {
    const s = await ready();
    s.fetch = async () => { if (status === 'network') throw new Error('offline'); return jsonResponse({ confirmed: false }, status); };
    const stop = s.watch(); await drain(); s.fire();
    for (const delay of s.conversion.RETRY_DELAYS_MS) await s.advance(delay);
    s.fire(); await s.advance(s.conversion.RETRY_WINDOW_MS);
    assert.equal(s.requests.length, s.conversion.MAX_ATTEMPTS, String(status));
    assert.deepEqual(s.requests.map(([, init]) => JSON.parse(init.body).token), [proof.token, proof.token, proof.token]);
    assert.equal(s.customEvents().length, 0); await finish(stop);
    const refreshed = await runtime({ storage: s.storage, clockStart: s.clockNow() }); const stopRefresh = refreshed.watch(); await drain();
    assert.equal(refreshed.requests.length, 0); await finish(stopRefresh);
  }
});

test('temporary failure followed by confirmation emits once without treating false as success', async () => {
  const s = await ready(); let n = 0;
  s.fetch = async () => ++n === 1 ? jsonResponse({ confirmed: false }, 202) : jsonResponse(confirmed());
  const stop = s.watch(); await drain(); assert.equal(s.customEvents().length, 0);
  await s.advance(s.conversion.RETRY_DELAYS_MS[0]);
  assert.equal(s.requests.length, 2); assert.equal(s.customEvents().length, 1); await finish(stop);
});

test('real unmount aborts in-flight request and prevents late response or scheduled retry', async () => {
  const s = await ready(); let resolve;
  s.fetch = () => new Promise(done => { resolve = done; });
  const stop = s.watch(); await finish(stop);
  assert.equal(s.requests[0][1].signal.aborted, true);
  resolve(jsonResponse(confirmed())); await drain(); await s.advance(60000);
  assert.equal(s.customEvents().length, 0); assert.equal(s.requests.length, 1); assert.equal(s.timers.size, 0);
  const retry = await ready(); retry.fetch = async () => jsonResponse({ confirmed: false }, 503);
  const stopRetry = retry.watch(); await drain(); await finish(stopRetry); await retry.advance(60000);
  assert.equal(retry.requests.length, 1); assert.equal(retry.timers.size, 0);
});

test('consent withdrawal aborts request and forbids late Pixel; acceptance can retry within the same budget', async () => {
  const s = await ready(); let resolve;
  s.fetch = () => new Promise(done => { resolve = done; });
  const stop = s.watch(); await drain();
  s.window.Cookiebot.consent.marketing = false; s.fire('CookiebotOnDecline');
  assert.equal(s.requests[0][1].signal.aborted, true);
  resolve(jsonResponse(confirmed())); await drain(); assert.equal(s.customEvents().length, 0);
  s.fetch = async () => jsonResponse(confirmed());
  s.window.Cookiebot.consent.marketing = true; s.fire();
  const retryWait = s.conversion.REQUEST_TIMEOUT_MS + s.conversion.RETRY_DELAYS_MS[0];
  await s.advance(retryWait - 1); assert.equal(s.requests.length, 1); assert.equal(s.customEvents().length, 0);
  await s.advance(1);
  assert.equal(s.requests.length, 2); assert.equal(s.customEvents().length, 1); await finish(stop);
});

test('request timeout is bounded, retryable and cancelled on unmount', async () => {
  const s = await ready(); s.fetch = (_url, init) => new Promise((_resolve, reject) => {
    init.signal.addEventListener('abort', () => reject(new Error('aborted')));
  });
  const stop = s.watch(); await drain();
  await s.advance(s.conversion.REQUEST_TIMEOUT_MS - 1);
  assert.equal(s.requests.length, 1); assert.equal(s.requests[0][1].signal.aborted, false);
  await s.advance(1); assert.equal(s.requests[0][1].signal.aborted, true);
  await s.advance(s.conversion.RETRY_DELAYS_MS[0] - 1); assert.equal(s.requests.length, 1);
  await s.advance(1); assert.equal(s.requests.length, 2);
  await s.advance(s.conversion.RETRY_WINDOW_MS - s.conversion.REQUEST_TIMEOUT_MS - s.conversion.RETRY_DELAYS_MS[0]);
  assert.equal(s.requests[1][1].signal.aborted, true);
  assert.equal(s.requests.length, 2); assert.equal(s.customEvents().length, 0); assert.equal(s.timers.size, 0);
  s.fire(); await s.advance(s.conversion.RETRY_WINDOW_MS); assert.equal(s.requests.length, 2);
  await finish(stop);
  assert.equal(s.timers.size, 0);
});

test('retry deadline persists through refresh and refuses an expired attempt', async () => {
  const s = await ready({ consent: { method: 'explicit', marketing: false } });
  s.storage.set(`mikels:meta-vip-attempts:${proof.event_id}`, JSON.stringify({ attempts: 1, next_retry_at: 0, deadline: 100100, terminal: false }));
  const stop = s.watch(); await s.advance(1000);
  s.window.Cookiebot.consent.marketing = true; s.fire(); await drain(); assert.equal(s.requests.length, 0); await finish(stop);
});

test('storage failure is fail-closed and never emits from proof alone', async () => {
  const s = await ready(); s.window.sessionStorage.getItem = () => { throw new Error('blocked'); };
  const stop = s.watch(); await drain(); assert.equal(s.requests.length, 0); await finish(stop);
  s.window.sessionStorage.setItem = () => { throw new Error('blocked'); };
  assert.equal(s.store(), false);
});

test('an accepted signup with absent proof clears stale proof without changing its signup marker', async () => {
  const s = await ready(); assert.equal(s.storage.has('mikels:vip-conversion:42'), true);
  assert.equal(s.store('42', null), false); assert.equal(s.storage.has('mikels:vip-conversion:42'), false);
  assert.equal(s.storage.get('mikels:vip-signup:42'), '1');
  const stop = s.watch(); await drain(); assert.equal(s.requests.length, 0); await finish(stop);
});

test('missing Pixel configuration never repeats a confirmed CAPI request through Cookiebot callbacks', async () => {
  const s = await ready({ pixel: '' }); const stop = s.watch(); await drain();
  s.fire(); s.fire('CookiebotOnConsentReady'); await s.advance(10000);
  assert.equal(s.requests.length, 1); assert.equal(s.customEvents().length, 0); await finish(stop);
});

test('cleanup without StrictMode reattachment blocks even an immediately resolved confirmation', async () => {
  const s = await ready(); let resolve;
  s.fetch = () => new Promise(done => { resolve = done; });
  const stop = s.watch(); stop(); resolve(jsonResponse(confirmed())); await drain();
  assert.equal(s.customEvents().length, 0); assert.equal(s.listenerCount(), 0);
});

const budgetState = s => JSON.parse(s.storage.get(`mikels:meta-vip-attempts:${proof.event_id}`));
const timerTimes = s => [...s.timers.values()].map(timer => timer.at).sort((a, b) => a - b);
const abortablePending = (_url, init) => new Promise((_resolve, reject) => {
  init.signal.addEventListener('abort', () => reject(new Error('aborted')));
});

test('async contract fixes maximum three attempts, 25s timeout, 10s/20s backoff and a 60s total window', async () => {
  const s = await runtime();
  assert.equal(s.conversion.MAX_ATTEMPTS, 3);
  assert.equal(s.conversion.REQUEST_TIMEOUT_MS, 25000);
  assert.deepEqual(plain(s.conversion.RETRY_DELAYS_MS), [10000, 20000]);
  assert.equal(s.conversion.RETRY_WINDOW_MS, 60000);
});

test('201 candidate then 202 pending -> 202 pending -> 200 confirmed on third uses same token/ID, zero early Pixel and one final event', async () => {
  const s = await ready(); let resolveThird;
  s.fetch = () => s.requests.length < s.conversion.MAX_ATTEMPTS
    ? Promise.resolve(jsonResponse({ confirmed: false, pending: true }, 202))
    : new Promise(resolve => { resolveThird = resolve; });
  const started = s.clockNow();
  assert.equal(s.customEvents().length, 0, 'Storing a signup candidate is not proof of membership');
  const first = s.watch(); first(); const stop = s.watch(); await drain();
  assert.equal(s.requests.length, 1); assert.equal(s.customEvents().length, 0);
  assert.equal(s.listenerCount(), 3);
  for (const [index, delay] of s.conversion.RETRY_DELAYS_MS.entries()) {
    for (let i = 0; i < 10; i++) s.fire();
    await s.advance(delay - 1);
    assert.equal(s.requests.length, index + 1); assert.equal(s.customEvents().length, 0);
    await s.advance(1);
    assert.equal(s.requests.length, index + 2); assert.equal(s.customEvents().length, 0);
  }
  // Allow the backend's GET + CAPI + SQL latency, rather than aborting at the old 5s.
  await s.advance(22000);
  assert.equal(s.requests[2][1].signal.aborted, false); assert.equal(s.customEvents().length, 0);
  resolveThird(jsonResponse(confirmed())); await drain();
  assert.equal(s.clockNow() - started, s.conversion.RETRY_DELAYS_MS.reduce((sum, delay) => sum + delay, 0) + 22000);
  assert.deepEqual(s.requests.map(([, init]) => JSON.parse(init.body)), Array.from({ length: 3 }, () => ({ token: proof.token, meta_marketing_consent: true })));
  assert.equal(s.customEvents().length, 1); assert.equal(s.customEvents()[0][3].eventID, proof.event_id);
  assert.equal(s.storage.get(`mikels:meta-vip-confirmed:${proof.event_id}`), '1');
  assert.equal(budgetState(s).deadline, started + s.conversion.RETRY_WINDOW_MS);
  s.fire(); await s.advance(s.conversion.RETRY_WINDOW_MS);
  assert.equal(s.requests.length, 3); assert.equal(s.customEvents().length, 1);
  await finish(stop); assert.equal(s.listenerCount(), 0); assert.equal(s.timers.size, 0);
});

test('202 pending plus consent revocation cancels backoff and emits zero events through deadline', async () => {
  const s = await ready(); s.fetch = async () => jsonResponse({ confirmed: false, pending: true }, 202);
  const stop = s.watch(); await drain(); assert.equal(s.timers.size, 1);
  s.window.Cookiebot.consent.marketing = false; s.fire('CookiebotOnDecline');
  assert.equal(s.timers.size, 0);
  s.fire(); await s.advance(s.conversion.RETRY_WINDOW_MS);
  assert.equal(s.requests.length, 1); assert.equal(s.customEvents().length, 0);
  assert.equal(s.storage.has(`mikels:meta-vip-confirmed:${proof.event_id}`), false);
  await finish(stop); assert.equal(s.listenerCount(), 0);
});

test('202 pending then consent revoked during retry forbids a late confirmed response and further attempts', async () => {
  const s = await ready(); let resolve;
  s.fetch = () => s.requests.length === 1
    ? Promise.resolve(jsonResponse({ confirmed: false, pending: true }, 202))
    : new Promise(done => { resolve = done; });
  const stop = s.watch(); await drain(); await s.advance(s.conversion.RETRY_DELAYS_MS[0]);
  assert.equal(s.requests.length, 2); assert.equal(s.customEvents().length, 0);
  s.window.Cookiebot.consent.marketing = false; s.fire('CookiebotOnDecline');
  assert.equal(s.requests[1][1].signal.aborted, true);
  resolve(jsonResponse(confirmed())); await drain(); await s.advance(s.conversion.RETRY_WINDOW_MS);
  assert.equal(s.requests.length, 2); assert.equal(s.customEvents().length, 0); assert.equal(s.timers.size, 0);
  await finish(stop); assert.equal(s.listenerCount(), 0);
});

test('slow pending responses cap third request to the remaining 15s and abort exactly at the 60s deadline', async () => {
  const s = await ready(); let resolve;
  s.fetch = () => s.requests.length < s.conversion.MAX_ATTEMPTS
    ? new Promise(done => { resolve = done; }) : abortablePending(...s.requests.at(-1));
  const started = s.clockNow(); const stop = s.watch(); await drain();
  await s.advance(5000); resolve(jsonResponse({ confirmed: false, pending: true }, 202)); await drain();
  await s.advance(s.conversion.RETRY_DELAYS_MS[0]); assert.equal(s.requests.length, 2);
  await s.advance(10000); resolve(jsonResponse({ confirmed: false, pending: true }, 202)); await drain();
  await s.advance(s.conversion.RETRY_DELAYS_MS[1]); assert.equal(s.requests.length, 3);
  const deadline = started + s.conversion.RETRY_WINDOW_MS;
  assert.deepEqual(timerTimes(s), [deadline]); assert.equal(budgetState(s).next_retry_at, deadline);
  await s.advance(deadline - s.clockNow() - 1); assert.equal(s.requests[2][1].signal.aborted, false);
  await s.advance(1); assert.equal(s.clockNow(), deadline); assert.equal(s.requests[2][1].signal.aborted, true);
  assert.equal(s.customEvents().length, 0); assert.equal(s.timers.size, 0);
  s.fire(); await s.advance(s.conversion.RETRY_WINDOW_MS); assert.equal(s.requests.length, 3);
  await finish(stop);
});

test('refresh preserves token, attempts and deadline and caps a remaining third request to 8s', async () => {
  const s = await ready(); const started = s.clockNow();
  s.storage.set(`mikels:meta-vip-attempts:${proof.event_id}`, JSON.stringify({ attempts: 2, next_retry_at: started + 52000, deadline: started + s.conversion.RETRY_WINDOW_MS, terminal: false }));
  const refreshed = await runtime({ storage: s.storage, clockStart: started + 52000 });
  refreshed.fetch = abortablePending;
  const stop = refreshed.watch(); await drain();
  assert.equal(refreshed.requests.length, 1); assert.equal(budgetState(refreshed).attempts, s.conversion.MAX_ATTEMPTS);
  assert.equal(JSON.parse(refreshed.requests[0][1].body).token, proof.token);
  assert.deepEqual(timerTimes(refreshed), [started + s.conversion.RETRY_WINDOW_MS]);
  await refreshed.advance(7999); assert.equal(refreshed.requests[0][1].signal.aborted, false);
  await refreshed.advance(1); assert.equal(refreshed.requests[0][1].signal.aborted, true);
  assert.equal(refreshed.customEvents().length, 0); assert.equal(refreshed.timers.size, 0);
  assert.equal(budgetState(refreshed).deadline, started + s.conversion.RETRY_WINDOW_MS);
  await finish(stop);
  const expired = await runtime({ storage: refreshed.storage, clockStart: refreshed.clockNow() });
  const stopExpired = expired.watch(); expired.fire(); await drain();
  assert.equal(expired.requests.length, 0); assert.equal(expired.customEvents().length, 0); await finish(stopExpired);
});

test('refresh after unmount retains conservative in-flight retry time without restarting the 60s budget', async () => {
  const s = await ready(); s.fetch = abortablePending;
  const started = s.clockNow(); const stop = s.watch(); await drain(); await s.advance(2000); await finish(stop);
  assert.equal(s.requests[0][1].signal.aborted, true); assert.equal(s.timers.size, 0); assert.equal(s.listenerCount(), 0);
  const refreshed = await runtime({ storage: s.storage, clockStart: s.clockNow() }); refreshed.fetch = abortablePending;
  const stopRefresh = refreshed.watch(); refreshed.fire(); await drain(); assert.equal(refreshed.requests.length, 0);
  const nextRetry = started + s.conversion.REQUEST_TIMEOUT_MS + s.conversion.RETRY_DELAYS_MS[0];
  assert.equal(budgetState(refreshed).next_retry_at, nextRetry);
  await refreshed.advance(nextRetry - refreshed.clockNow() - 1); assert.equal(refreshed.requests.length, 0);
  await refreshed.advance(1); assert.equal(refreshed.requests.length, 1); assert.equal(budgetState(refreshed).attempts, 2);
  assert.deepEqual(timerTimes(refreshed), [started + s.conversion.RETRY_WINDOW_MS]);
  await refreshed.advance(s.conversion.RETRY_WINDOW_MS - (nextRetry - started));
  assert.equal(refreshed.requests[0][1].signal.aborted, true); assert.equal(refreshed.customEvents().length, 0);
  assert.equal(refreshed.timers.size, 0); assert.equal(budgetState(refreshed).deadline, started + s.conversion.RETRY_WINDOW_MS);
  await finish(stopRefresh);
});

test('a 20s pending backoff near expiry is capped to deadline and cannot leave timers or start another request', async () => {
  const s = await ready(); let resolve;
  s.fetch = () => new Promise(done => { resolve = done; });
  const started = s.clockNow(); const stop = s.watch(); await drain();
  await s.advance(s.conversion.REQUEST_TIMEOUT_MS - 1000);
  resolve(jsonResponse({ confirmed: false, pending: true }, 202)); await drain();
  await s.advance(s.conversion.RETRY_DELAYS_MS[0]); assert.equal(s.requests.length, 2);
  await s.advance(s.conversion.REQUEST_TIMEOUT_MS - 1000);
  resolve(jsonResponse({ confirmed: false, pending: true }, 202)); await drain();
  const deadline = started + s.conversion.RETRY_WINDOW_MS;
  assert.deepEqual(timerTimes(s), [deadline]); assert.equal(budgetState(s).next_retry_at, deadline);
  await s.advance(deadline - s.clockNow());
  assert.equal(s.requests.length, 2); assert.equal(s.timers.size, 0); assert.equal(s.customEvents().length, 0);
  s.fire(); await s.advance(s.conversion.RETRY_WINDOW_MS); assert.equal(s.requests.length, 2);
  await finish(stop);
});

test('remaining 26s still caps a request at 25s rather than expanding its timeout to the window remainder', async () => {
  const s = await ready(); const started = s.clockNow();
  s.storage.set(`mikels:meta-vip-attempts:${proof.event_id}`, JSON.stringify({ attempts: 1, next_retry_at: started + 34000, deadline: started + s.conversion.RETRY_WINDOW_MS, terminal: false }));
  const refreshed = await runtime({ storage: s.storage, clockStart: started + 34000 }); refreshed.fetch = abortablePending;
  const stop = refreshed.watch(); await drain();
  assert.deepEqual(timerTimes(refreshed), [refreshed.clockNow() + s.conversion.REQUEST_TIMEOUT_MS]);
  await refreshed.advance(s.conversion.REQUEST_TIMEOUT_MS - 1); assert.equal(refreshed.requests[0][1].signal.aborted, false);
  await refreshed.advance(1); assert.equal(refreshed.requests[0][1].signal.aborted, true);
  assert.deepEqual(timerTimes(refreshed), [started + s.conversion.RETRY_WINDOW_MS]);
  await refreshed.advance(1000); assert.equal(refreshed.requests.length, 1); assert.equal(refreshed.timers.size, 0);
  assert.equal(refreshed.customEvents().length, 0); await finish(stop);
});

test('unmount during the extended 25s request clears timer/listeners and never retries or emits a late confirmation', async () => {
  const s = await ready(); let resolve;
  s.fetch = () => new Promise(done => { resolve = done; });
  const stop = s.watch(); await drain(); await s.advance(s.conversion.REQUEST_TIMEOUT_MS - 1);
  assert.equal(s.requests[0][1].signal.aborted, false);
  await finish(stop); assert.equal(s.requests[0][1].signal.aborted, true);
  assert.equal(s.timers.size, 0); assert.equal(s.listenerCount(), 0);
  resolve(jsonResponse(confirmed())); await drain(); await s.advance(s.conversion.RETRY_WINDOW_MS);
  assert.equal(s.requests.length, 1); assert.equal(s.customEvents().length, 0); assert.equal(s.timers.size, 0);
});
