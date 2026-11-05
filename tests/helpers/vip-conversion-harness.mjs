import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { transformWithEsbuild } from 'vite';

export const proofFixture = { token: 'signed.fixture-token', event_id: 'vip-fixture-unique-id', event_name: 'VIPSignupConfirmed' };
export const jsonResponse = (data, status = 200) => new Response(JSON.stringify(data), { status });
export const drain = async () => { for (let i = 0; i < 20; i++) await new Promise(resolve => setImmediate(resolve)); };

export async function compiledModule(path, imports, globals = {}) {
  let source = await readFile(new URL(`../../${path}`, import.meta.url), 'utf8');
  source = source.replaceAll('import.meta.env', 'TEST_ENV');
  const code = (await transformWithEsbuild(source, path, { loader: path.endsWith('.jsx') ? 'jsx' : 'js', format: 'cjs', jsx: 'transform' })).code;
  const module = { exports: {} };
  runInNewContext(code, {
    module, exports: module.exports, console, Response, AbortController, URLSearchParams,
    queueMicrotask, setTimeout, clearTimeout, TEST_ENV: {},
    require: name => { assert.ok(name in imports, `Unexpected import ${name}`); return imports[name]; },
    ...globals,
  });
  return module.exports;
}

export async function runtime({ storage = new Map(), consent = { method: 'explicit', marketing: true, statistics: true }, pixel = 'offline-pixel', ga = 'offline-ga', clockStart = 100000 } = {}) {
  let now = clockStart;
  let serial = 0;
  const timers = new Map();
  const listeners = new Map();
  const requests = [];
  const metaCalls = [];
  const gaCalls = [];
  const state = {
    storage, requests, metaCalls, gaCalls, timers,
    fetch: async () => jsonResponse({ confirmed: true, event_id: proofFixture.event_id, event_name: proofFixture.event_name, capi_sent: true }),
  };
  const window = {
    Cookiebot: { consent }, fbq: (...args) => metaCalls.push(args), gtag: (...args) => gaCalls.push(args),
    sessionStorage: {
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, String(value)),
      removeItem: key => storage.delete(key),
    },
    addEventListener(name, fn) { if (!listeners.has(name)) listeners.set(name, new Set()); listeners.get(name).add(fn); },
    removeEventListener(name, fn) { listeners.get(name)?.delete(fn); },
    document: { createElement() { throw new Error('A real tracking script must never be loaded in a test'); } },
  };
  const globals = {
    window, TEST_ENV: { VITE_META_PIXEL_ID: pixel, VITE_GA_MEASUREMENT_ID: ga },
    Date: class extends Date { static now() { return now; } },
    setTimeout(fn, delay) { const id = ++serial; timers.set(id, { fn, at: now + delay }); return id; },
    clearTimeout(id) { timers.delete(id); },
    fetch: (...args) => { requests.push(args); return state.fetch(...args); },
  };
  const meta = await compiledModule('src/utils/metaPixel.js', {}, globals);
  const analytics = await compiledModule('src/utils/googleAnalytics.js', {}, globals);
  const conversion = await compiledModule('src/utils/vipMetaConversion.js', { './metaPixel': meta }, globals);
  Object.assign(state, {
    window, globals, meta, analytics, conversion,
    clockNow: () => now,
    customEvents: () => metaCalls.filter(args => args[0] === 'trackCustom'),
    gaEvents: () => gaCalls.filter(args => args[0] === 'event'),
    fire: (name = 'CookiebotOnAccept') => [...(listeners.get(name) || [])].forEach(fn => fn()),
    listenerCount: () => [...listeners.values()].reduce((total, set) => total + set.size, 0),
    marker: (signupId = '42') => storage.set(`mikels:vip-signup:${signupId}`, '1'),
    store: (signupId = '42', proof = proofFixture, status = 201) => conversion.storeVipConversionProof(signupId, proof, status),
    watch: (signupId = '42') => conversion.watchMetaVipSignupConfirmation(signupId, 'https://offline.invalid'),
    async advance(ms) {
      const end = now + ms;
      while (true) {
        const next = [...timers.entries()].filter(([, value]) => value.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
        if (!next) break;
        now = next[1].at; timers.delete(next[0]); next[1].fn(); await drain();
      }
      now = end; await drain();
    },
  });
  return state;
}
