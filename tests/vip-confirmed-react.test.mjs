import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToString } from 'react-dom/server';
import helmetModule from 'react-helmet-async';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { runtime, compiledModule, proofFixture, jsonResponse, drain } from './helpers/vip-conversion-harness.mjs';

const { Helmet, HelmetProvider } = helmetModule;
const landingSource = await readFile(new URL('../src/pages/VipLanding.jsx', import.meta.url), 'utf8');
async function thanks(state, signup = '42', captureEffects = true) {
  const effects = [];
  const imports = {
    react: captureEffects ? { ...React, useEffect: fn => effects.push(fn) } : React,
    'react-helmet-async': { Helmet },
    'react-router-dom': {
      Link: ({ to, children, ...props }) => React.createElement('a', { href: to, ...props }, children),
      useSearchParams: () => [new URLSearchParams(signup ? `signup=${signup}` : '')],
    },
    '../utils/googleAnalytics': state.analytics,
    '../config/api': { API_URL: 'https://offline.invalid' },
    '../utils/vipMetaConversion': state.conversion,
  };
  const page = (await compiledModule('src/pages/VipThanks.jsx', imports, { ...state.globals, React })).default;
  const context = {};
  const html = renderToString(React.createElement(HelmetProvider, { context }, React.createElement(page)));
  return { html, context, mount: () => effects.map(fn => fn()).filter(Boolean) };
}
const cleanup = async stops => { stops.forEach(stop => stop()); await drain(); };

function submit(state, body, status = 201, overrides = {}) {
  const calls = [];
  const navigations = [];
  const alerts = [];
  const handler = landingSource.match(/const handleSubmit = async[\s\S]*?\n  };/)[0];
  const fn = runInNewContext(`${handler}\nhandleSubmit;`, {
    ...state.globals, email: 'fixture@example.invalid', firstName: 'Fixture', website: '', marketingConsent: true,
    API_URL: 'https://offline.invalid', setStatus: value => alerts.push(value), setIsSubmitting() {},
    navigate: (...args) => navigations.push(args), storeVipConversionProof: state.conversion.storeVipConversionProof,
    fetch: async (...args) => { calls.push(args); return jsonResponse(body, status); }, ...overrides,
  });
  return { run: () => fn({ preventDefault() {} }), calls, navigations, alerts };
}

test('real React SSR renders identical thanks copy/noindex/shop link and performs no tracking/fetch', async () => {
  const s = await runtime(); s.marker(); s.store();
  const page = await thanks(s, '42', false);
  assert.match(page.html, /Ya estás dentro\./); assert.match(page.html, /Revisa tu correo\./);
  assert.match(page.html, /href="\/tienda"/); assert.match(page.context.helmet.meta.toString(), /noindex, nofollow/);
  assert.equal(s.requests.length, 0); assert.equal(s.customEvents().length, 0); assert.equal(s.gaEvents().length, 0);
});

test('GA4-first statistics consent cannot consume Meta dedup; later explicit marketing confirms Meta once', async () => {
  const s = await runtime({ consent: { method: 'explicit', statistics: true, marketing: false } }); s.marker(); s.store();
  const page = await thanks(s); const stops = page.mount(); await drain();
  assert.equal(s.gaEvents().length, 1); assert.equal(s.requests.length, 0);
  assert.equal(s.storage.get('mikels:ga4-vip-lead:42'), '1');
  assert.equal(s.storage.has(`mikels:meta-vip-confirmed:${proofFixture.event_id}`), false);
  s.window.Cookiebot.consent.marketing = true; s.fire(); s.fire(); await drain();
  assert.equal(s.customEvents().length, 1); assert.equal(s.gaEvents().length, 1); assert.equal(s.requests.length, 1);
  await cleanup(stops);
});

test('Meta confirmation/refusal does not consume or suppress independent GA4 late statistics consent', async () => {
  for (const confirmed of [true, false]) {
    const s = await runtime({ consent: { method: 'explicit', statistics: false, marketing: true } }); s.marker(); s.store();
    s.fetch = async () => jsonResponse({ confirmed, event_id: proofFixture.event_id, event_name: proofFixture.event_name, capi_sent: false });
    const page = await thanks(s); const stops = page.mount(); await drain();
    assert.equal(s.gaEvents().length, 0); assert.equal(s.customEvents().length, confirmed ? 1 : 0);
    s.window.Cookiebot.consent.statistics = true; s.fire(); await drain();
    assert.equal(s.gaEvents().length, 1); assert.equal(s.requests.length, 1); await cleanup(stops);
  }
});

test('GA4 marker semantics remain even with absent proof, while arbitrary direct thanks emits neither', async () => {
  for (const marker of [true, false]) {
    const s = await runtime(); if (marker) s.marker();
    const page = await thanks(s); const stops = page.mount(); await drain();
    assert.equal(s.gaEvents().length, marker ? 1 : 0); assert.equal(s.requests.length, 0); assert.equal(s.customEvents().length, 0);
    await cleanup(stops);
  }
});

test('real thanks effect StrictMode replay, cleanup and remount deduplicate GA4 and Meta separately', async () => {
  const s = await runtime(); s.marker(); s.store();
  const page = await thanks(s); const first = page.mount(); first.forEach(stop => stop()); const second = page.mount();
  await drain(); assert.equal(s.requests.length, 1); assert.equal(s.customEvents().length, 1); assert.equal(s.gaEvents().length, 1);
  await cleanup(second); assert.equal(s.listenerCount(), 0);
  const third = page.mount(); await drain(); assert.equal(s.requests.length, 1); assert.equal(s.gaEvents().length, 1); await cleanup(third);
});

test('real submit saves only 201 proof, keeps marker and original URL, emits nothing at submit', async () => {
  for (const status of [201, 200]) {
    const s = await runtime();
    const form = submit(s, { success: true, signup_id: 42, conversion: { ...proofFixture, email: 'must-not-store@example.invalid' } }, status);
    await form.run();
    assert.equal(s.storage.get('mikels:vip-signup:42'), '1');
    assert.equal(s.storage.has('mikels:vip-conversion:42'), status === 201);
    assert.equal(form.navigations[0][0], '/vip/gracias?signup=42');
    assert.doesNotMatch(form.navigations[0][0], /token|event_id|@/);
    assert.equal(s.customEvents().length, 0); assert.equal(s.gaEvents().length, 0); assert.equal(s.requests.length, 0);
    assert.deepEqual(JSON.parse(form.calls[0][1].body), { email: 'fixture@example.invalid', first_name: 'Fixture', website: '', marketing_consent: true });
  }
});

test('real submit never creates proof/marker for honeypot neutral, refusal or unchecked email consent', async () => {
  for (const [body, status, overrides] of [
    [{ success: true, conversion: proofFixture }, 200, { website: 'trap' }],
    [{ success: false, error: 'Rechazado', conversion: proofFixture }, 400, {}],
    [{ success: true, signup_id: 42, conversion: proofFixture }, 201, { marketingConsent: false }],
  ]) {
    const s = await runtime(); const form = submit(s, body, status, overrides); await form.run();
    assert.equal(s.storage.size, 0); assert.equal(s.customEvents().length, 0);
    if (status === 200) assert.equal(form.navigations[0][0], '/vip/gracias');
    if (overrides.marketingConsent === false) assert.equal(form.calls.length, 0);
  }
});

test('existing ecommerce/old Lead helpers remain exported and their payloads unchanged', async () => {
  const s = await runtime();
  s.meta.trackMetaAddToCart({ sku: 'LOCAL-SKU', price: 19.9 }, 2);
  s.meta.trackMetaInitiateCheckout([{ sku: 'LOCAL-SKU', price: 19.9, quantity: 2 }], 39.8);
  s.meta.trackMetaLead('legacy-fixture');
  assert.deepEqual(s.metaCalls.filter(args => args[0] === 'track').map(args => args[1]), ['AddToCart', 'InitiateCheckout', 'Lead']);
  assert.equal(s.metaCalls.find(args => args[1] === 'AddToCart')[2].value, 39.8);
  assert.equal(s.metaCalls.find(args => args[1] === 'InitiateCheckout')[2].currency, 'EUR');
  assert.equal(s.customEvents().length, 0);
});
