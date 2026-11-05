import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import test from 'node:test';
import { chromium } from '/home/ubuntu/work/farmsplanet-web/node_modules/playwright-core/index.mjs';
import { NONINDEX_STATIC_ROUTE_SEO } from '../src/seo/metadata.js';

const { build } = createRequire(import.meta.resolve('vite'))('esbuild');
const root = resolve(new URL('..', import.meta.url).pathname);
const bundle = await build({
  stdin: {
    resolveDir: root, loader: 'jsx', contents: `
      import React from 'react';
      import { createRoot } from 'react-dom/client';
      import { HelmetProvider } from 'react-helmet-async';
      import { MemoryRouter } from 'react-router-dom';
      import VipThanks from './src/pages/VipThanks.jsx';
      import VipLanding from './src/pages/VipLanding.jsx';
      const root = createRoot(document.getElementById('root'));
      window.mount = (path, landing = false) => root.render(
        <React.StrictMode><HelmetProvider><MemoryRouter key={path} initialEntries={[path]}>
          {landing ? <VipLanding /> : <VipThanks />}
        </MemoryRouter></HelmetProvider></React.StrictMode>
      );
      window.unmount = () => root.render(null);
    `,
  },
  bundle: true, format: 'iife', write: false, jsx: 'automatic',
  define: { 'import.meta.env': JSON.stringify({ VITE_META_PIXEL_ID: 'offline-pixel', VITE_GA_MEASUREMENT_ID: 'offline-ga', VITE_API_URL: 'https://offline.invalid' }) },
});
const script = bundle.outputFiles[0].text;
const proof = { token: 'local.mock-signed-proof', event_id: 'vip-local-browser-event-id', event_name: 'VIPSignupConfirmed' };

test('Playwright local-only VIP contract with real React StrictMode, mocked network and isolated Chromium', async t => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox', '--disable-background-networking', '--disable-component-update', '--disable-sync'] });
  const context = await browser.newContext({ serviceWorkers: 'block' });
  const page = await context.newPage();
  page.setDefaultTimeout(5000);
  const errors = [];
  page.on('pageerror', error => { errors.push(error.message); console.error('Local harness error:', error.message); });
  const requests = [];
  const unexpected = [];
  let status = 200;
  let body = { confirmed: true, event_id: proof.event_id, event_name: proof.event_name, capi_sent: false };
  let holdResponse;
  await context.route('**/*', async route => {
    const request = route.request();
    if (request.url() === 'https://offline.invalid/vip-test') {
      // Production VIP pages already have a generated static noindex head.
      // Real Helmet SSR output is checked independently in the React suite.
      const robots = NONINDEX_STATIC_ROUTE_SEO['/vip/gracias'].robots;
      return route.fulfill({ status: 200, contentType: 'text/html', body: `<!doctype html><html><head><meta name="robots" content="${robots}"></head><body><div id="root"></div></body></html>` });
    }
    if (request.url() === 'https://offline.invalid/api/vip/pageview') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' });
    }
    if (request.url() === 'https://offline.invalid/api/vip/conversion') {
      requests.push({ url: request.url(), method: request.method(), body: request.postDataJSON() });
      if (holdResponse) await holdResponse;
      try { return await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) }); } catch { return; }
    }
    unexpected.push(request.url()); await route.abort('blockedbyclient');
  });
  await page.goto('https://offline.invalid/vip-test');
  await page.evaluate(() => {
    window.metaCalls = []; window.gaCalls = [];
    window.fbq = (...args) => window.metaCalls.push(args);
    window.gtag = (...args) => window.gaCalls.push(args);
    window.Cookiebot = { consent: { method: 'explicit', statistics: true, marketing: false } };
  });
  await page.addScriptTag({ content: script });
  const customCount = () => page.evaluate(() => window.metaCalls.filter(args => args[0] === 'trackCustom').length);
  const gaCount = () => page.evaluate(() => window.gaCalls.filter(args => args[0] === 'event' && args[1] === 'generate_lead').length);
  const seed = async (id = '42', value = proof) => page.evaluate(({ id, value }) => {
    sessionStorage.setItem(`mikels:vip-signup:${id}`, '1'); sessionStorage.setItem(`mikels:vip-conversion:${id}`, JSON.stringify(value));
  }, { id, value });
  try {
    await t.test('landing and arbitrary direct thanks do not emit a signup conversion', async () => {
      await page.evaluate(() => window.mount('/vip', true));
      await page.getByRole('heading', { name: /Acceso anticipado al Black Friday/ }).waitFor();
      assert.equal(await customCount(), 0); assert.equal(requests.length, 0);
      await page.evaluate(() => window.mount('/vip/gracias?signup=12345'));
      await page.getByRole('heading', { name: 'Ya estás dentro.' }).waitFor();
      assert.equal(await customCount(), 0); assert.equal(requests.length, 0); assert.equal(await gaCount(), 0);
      assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex, nofollow');
      assert.equal(await page.getByRole('link', { name: 'Ver la tienda' }).getAttribute('href'), '/tienda');
    });
    await t.test('GA4-first then Cookiebot marketing leads to one minimal confirmation and one event despite StrictMode/callbacks', async () => {
      await seed(); await page.evaluate(() => window.mount('/vip/gracias?signup=42'));
      await page.waitForFunction(() => window.gaCalls.some(args => args[1] === 'generate_lead'));
      assert.equal(requests.length, 0); assert.equal(await customCount(), 0); assert.equal(await gaCount(), 1);
      await page.evaluate(() => {
        window.Cookiebot.consent.marketing = true;
        for (let i = 0; i < 5; i++) window.dispatchEvent(new Event('CookiebotOnAccept'));
      });
      await page.waitForFunction(() => window.metaCalls.some(args => args[0] === 'trackCustom'));
      assert.equal(requests.length, 1); assert.equal(await customCount(), 1); assert.equal(await gaCount(), 1);
      assert.deepEqual(requests[0], { url: 'https://offline.invalid/api/vip/conversion', method: 'POST', body: { token: proof.token, meta_marketing_consent: true } });
      assert.deepEqual(await page.evaluate(() => window.metaCalls.find(args => args[0] === 'trackCustom')), ['trackCustom', proof.event_name, { content_name: 'Black Friday VIP 2026' }, { eventID: proof.event_id }]);
    });
    await t.test('true browser reload keeps session event dedup and does not reemit or re-confirm', async () => {
      await page.reload();
      await page.evaluate(() => {
        window.metaCalls = []; window.gaCalls = [];
        window.fbq = (...args) => window.metaCalls.push(args); window.gtag = (...args) => window.gaCalls.push(args);
        window.Cookiebot = { consent: { method: 'explicit', statistics: true, marketing: true } };
      });
      await page.addScriptTag({ content: script }); await page.evaluate(() => window.mount('/vip/gracias?signup=42'));
      await page.getByRole('heading', { name: 'Ya estás dentro.' }).waitFor();
      assert.equal(requests.length, 1); assert.equal(await customCount(), 0); assert.equal(await gaCount(), 0);
    });
    await t.test('forged proof server refusal cannot emit, and mismatch cannot count', async () => {
      for (const [id, response] of [['43', { confirmed: false }], ['44', { confirmed: true, event_name: 'VIPSignupConfirmed', event_id: 'mismatch', capi_sent: true }]]) {
        const value = { ...proof, token: 'forged.mock-token', event_id: `vip-browser-${id}` }; await seed(id, value);
        body = response; status = 200;
        await page.evaluate(id => window.mount(`/vip/gracias?signup=${id}`), id);
        await page.waitForFunction(id => JSON.parse(sessionStorage.getItem(`mikels:meta-vip-attempts:vip-browser-${id}`) || '{}').terminal === true, id);
        assert.equal(await customCount(), 0);
      }
      assert.equal(requests.length, 3);
    });
    await t.test('real unmount cancels an in-flight confirmation and ignores a late confirmed response', async () => {
      let release; holdResponse = new Promise(resolve => { release = resolve; });
      const value = { ...proof, event_id: 'vip-browser-unmount' }; await seed('45', value);
      body = { confirmed: true, event_name: proof.event_name, event_id: value.event_id, capi_sent: true };
      await page.evaluate(() => window.mount('/vip/gracias?signup=45'));
      await page.waitForFunction(() => JSON.parse(sessionStorage.getItem('mikels:meta-vip-attempts:vip-browser-unmount') || '{}').attempts >= 1);
      assert.equal(requests.length, 4);
      await page.evaluate(() => window.unmount()); await page.waitForFunction(() => !document.querySelector('main'));
      release(); holdResponse = null;
      await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 50)));
      assert.equal(await customCount(), 0); assert.equal(requests.length, 4);
    });
    assert.deepEqual(unexpected, [], 'All browser network requests must be explicitly mocked');
    assert.deepEqual(errors, [], 'Real React must run without page exceptions');
  } finally {
    await context.close(); await browser.close();
  }
});
