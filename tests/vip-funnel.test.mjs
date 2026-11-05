import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const hookSource = read('src/hooks/useVipPageview.js');

function mockHook(send) {
  let navigation = { key: 'initial', pathname: '/vip' };
  const ref = { current: null };
  let effect;
  const runnable = hookSource.replace(/^import .*;\n/gm, '').replace(/export default /g, '').replace(/export /g, '');
  const hook = runInNewContext(`${runnable}\nuseVipPageview`, {
    useEffect: (setup) => { effect = setup; }, useRef: () => ref,
    useLocation: () => navigation, fetch: send, API_URL: 'https://fixture.invalid', Promise,
  });
  return {
    render: () => { hook(); effect(); },
    replayStrictModeEffect: () => effect(),
    navigate: (value) => { navigation = value; hook(); effect(); },
  };
}

test('StrictMode setup replay emits one pageview and rerenders do not duplicate', () => {
  const calls = [];
  const mock = mockHook((...args) => { calls.push(args); return Promise.resolve({ ok: true }); });
  mock.render();
  mock.replayStrictModeEffect(); // setup -> cleanup -> setup with the same React ref
  mock.render();
  assert.equal(calls.length, 1);
  mock.navigate({ key: 'next-navigation', pathname: '/vip' });
  assert.equal(calls.length, 2);
  mock.navigate({ key: 'not-vip', pathname: '/vip/gracias' });
  assert.equal(calls.length, 2);
  const options = calls[0][1];
  assert.equal(options.method, 'POST');
  assert.equal(options.credentials, 'omit');
  assert.equal(options.referrerPolicy, 'no-referrer');
  assert.equal(options.cache, 'no-store');
  assert.equal(options.keepalive, true);
  assert.equal(options.body, undefined);
  assert.equal(options.headers, undefined);
  assert.equal(calls[0][0], 'https://fixture.invalid/api/vip/pageview');
});

test('A real component remount records a new pageview without persistent visitor identity', () => {
  const calls = [];
  const send = (...args) => { calls.push(args); return Promise.resolve({ ok: true }); };
  mockHook(send).render();
  mockHook(send).render();
  assert.equal(calls.length, 2);
  assert.doesNotMatch(hookSource, /sessionStorage|localStorage|document\.cookie|userAgent|fingerprint|location\.search|URLSearchParams|trackMeta|trackGA/);
});

test('Rejected or synchronously failed telemetry is swallowed with no signup dependency or retry', async () => {
  let calls = 0;
  const rejected = mockHook(() => { calls++; return Promise.reject(new Error('blocked network')); });
  assert.doesNotThrow(() => rejected.render());
  rejected.replayStrictModeEffect();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(calls, 1);
  const synchronous = mockHook(() => { throw new Error('unavailable'); });
  assert.doesNotThrow(() => synchronous.render());
  const landing = read('src/pages/VipLanding.jsx');
  assert.match(landing, /useVipPageview\(\)/);
  assert.doesNotMatch(landing, /await useVipPageview|await sendVipPageview|api\/vip\/pageview/);
  assert.match(landing, /fetch\(`\$\{API_URL\}\/api\/vip\/signup`/);
});

test('Minimal mobile page reuses private admin auth, no secrets in query, no public marketing calls', () => {
  const page = read('src/pages/admin/AdminVipFunnel.jsx');
  const app = read('src/App.jsx');
  assert.match(app, /path="\/admin\/vip\/embudo" element={<AdminVipFunnel \/>}/);
  assert.match(page, /useAdminAuth/);
  assert.match(page, /if \(!user\) return <Navigate to="\/admin\/login" replace \/>/);
  assert.match(page, /authFetch\(`\$\{API_URL\}\/api\/admin\/vip\/funnel\?/);
  assert.match(page, /new URLSearchParams\(\{ start, end \}\)/);
  assert.match(page, /cache: 'no-store'/);
  assert.doesNotMatch(page, /token=|localStorage|Authorization|trackMeta|trackGA|AdminLayout/);
  assert.match(page, /value == null \? 'No medido \/ no disponible'/);
  assert.match(page, /coverage_start/);
  assert.match(page, /pageviews_coverage_start/);
  assert.match(page, /Europe\/Madrid/);
});
