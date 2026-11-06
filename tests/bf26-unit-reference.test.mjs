import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { chromium } from '/home/ubuntu/work/farmsplanet-web/node_modules/playwright-core/index.mjs';
import { getCampaignUnitReference, CAMPAIGN_DISCOUNT_HEADLINE } from '../src/utils/campaignUnitReference.js';
import { getVolumeDiscountedUnitPrice } from '../src/utils/volumePricing.js';
import { applyEditorialOverrides } from '../src/utils/productEditorialOverrides.js';
import { formatEuro } from '../src/utils/formatMoney.js';

const require = createRequire(import.meta.url);
const { build } = createRequire(require.resolve('vite'))('esbuild');
const root = resolve(new URL('..', import.meta.url).pathname);
const fixture = JSON.parse(readFileSync(join(root, 'tests/fixtures/bf26-unit-reference-backend.json'), 'utf8'));
const approved = [
  ['BF26-TEMP6', 9.95, 19.90, 50, 'botella', 59.70],
  ['BF26-TEMP12', 9.95, 19.90, 50, 'botella', 119.40],
  ['BF26-ECO6', 11.90, 19.90, 40, 'botella', 71.40],
  ['BF26-PARA3', 10.30, 17.15, 40, 'tarro', 30.90],
  ['BF26-PARA6', 10.28, 17.15, 40, 'tarro', 61.70],
  ['BF26-5L3', 32.25, 43.00, 25, 'garrafa', 96.75],
];

const cardBuild = await build({
  entryPoints: [join(root, 'src/components/products/ProductCard.jsx')], bundle: true,
  platform: 'node', format: 'cjs', write: false, jsx: 'automatic',
  external: ['react', 'react/jsx-runtime'],
  plugins: [{ name: 'ssr-only-contexts', setup(build) {
    build.onResolve({ filter: /CartContext|react-i18next|framer-motion|react-router-dom/ }, args => ({ path: args.path, namespace: 'ssr-mock' }));
    build.onLoad({ filter: /.*/, namespace: 'ssr-mock' }, args => ({ loader: 'jsx', contents:
      args.path.includes('CartContext') ? 'export const useCart=()=>({addToCart(){},setIsCartOpen(){}});'
      : args.path === 'react-i18next' ? 'export const useTranslation=()=>({t:(key,fallback)=>fallback||key});'
      : args.path === 'framer-motion' ? 'import React from "react"; export const motion={article:({initial,animate,transition,...props})=><article {...props}/>};'
      : 'import React from "react"; export const Link=({to,...props})=><a href={to} {...props}/>;' }));
  } }],
});
const mod = { exports: {} };
new Function('require', 'module', 'exports', cardBuild.outputFiles[0].text)(require, mod, mod.exports);
const Card = mod.exports.default;

test('authentic backend metadata survives normalization and cannot alter pack pricing', () => {
  assert.equal(fixture.preview_only, true);
  assert.deepEqual(fixture.inactive_pack_http_statuses, [404, 404, 404, 404, 404, 404]);
  for (const [sku, unitPrice, usualUnitPrice, discountPercent, unitLabel, price] of approved) {
    const original = fixture.products.find(p => p.sku === sku);
    const copy = structuredClone(original);
    const normalized = applyEditorialOverrides(original);
    assert.deepEqual(getCampaignUnitReference(normalized), { unitPrice, usualUnitPrice, discountPercent, unitLabel });
    assert.equal(normalized.price, price);
    assert.equal(getVolumeDiscountedUnitPrice({ ...normalized, quantity: 6 }, 6), price);
    assert.deepEqual(original, copy);
    assert.equal(normalized.available, false);
    assert.equal(normalized.visibleInStore, false);
    assert.equal('originalPrice' in normalized, false);
    assert.equal('stock' in original, false);
  }
});

test('real React SSR cards show only unit strike-through; exact pack totals have no comparison', () => {
  for (const [sku, unit, usual, percent, label, price] of approved) {
    const product = applyEditorialOverrides(fixture.products.find(p => p.sku === sku));
    const html = renderToStaticMarkup(React.createElement(Card, { product }));
    const strike = [...html.matchAll(/<s>(.*?)<\/s>/g)].map(match => match[1]);
    assert.deepEqual(strike, [`${formatEuro(usual)} por ${label}`]);
    assert.ok(html.includes(`${formatEuro(unit)} `));
    assert.ok(html.includes(`−${percent} % por ${label}`));
    assert.ok(html.includes(`Pack completo: ${formatEuro(price)}`));
    assert.doesNotMatch(html, /<del|antes|ahora|999/i);
  }
  const current = renderToStaticMarkup(React.createElement(Card, { product: applyEditorialOverrides(fixture.current_harvest) }));
  assert.ok(current.includes(formatEuro(19.90)));
  assert.doesNotMatch(current, /<s>|<del|habitual|%|comparaci/i);
});

test('missing, malformed or non-BF metadata cannot create a discount or a master comparison', () => {
  const pack = fixture.products[0];
  for (const data of [undefined, { ...pack.pricingData, basis: 'pack' }, { ...pack.pricingData, unitPrice: 'NaN' }, { ...pack.pricingData, discountPercent: 99 }]) {
    assert.equal(getCampaignUnitReference({ ...pack, pricingData: data }), null);
  }
  for (const sku of ['MIKVET500', 'MIKVET5002526', 'BF26-TEMP6-EXTRA']) {
    assert.equal(getCampaignUnitReference({ ...pack, sku }), null);
  }
  assert.equal(getCampaignUnitReference({ ...pack, sku: undefined }), null);
});

const browserBuild = await build({
  stdin: { resolveDir: root, loader: 'jsx', contents: `
    import React from 'react';
    import { createRoot } from 'react-dom/client';
    import { HelmetProvider } from 'react-helmet-async';
    import { MemoryRouter, Routes, Route } from 'react-router-dom';
    import { CartProvider } from './src/context/CartContext.jsx';
    import ProductDetail from './src/pages/ProductDetail.jsx';
    import Products from './src/pages/Products.jsx';
    import './src/i18n/index.js';
    const root=createRoot(document.getElementById('root'));
    window.mount=(path)=>root.render(<React.StrictMode><HelmetProvider><MemoryRouter key={path} initialEntries={[path]}><CartProvider><Routes><Route path="/producto/:slug" element={<ProductDetail/>}/><Route path="/tienda" element={<Products/>}/></Routes></CartProvider></MemoryRouter></HelmetProvider></React.StrictMode>);
  ` }, bundle: true, format: 'iife', write: false, jsx: 'automatic',
  define: { 'import.meta.env': JSON.stringify({ VITE_API_URL: 'https://offline.invalid' }) },
});

test('real React mobile six details, current-harvest exclusion, grid scope and local-only captures', async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox', '--disable-background-networking', '--disable-component-update', '--disable-sync'] });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, serviceWorkers: 'block' });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  const errors = [], unexpected = [];
  page.on('pageerror', e => errors.push(e.message));
  let previewGrid = false;
  let css = '';
  const buildOutput = process.env.FRONTEND_BUILD_OUTDIR;
  if (buildOutput) {
    const assets = join(buildOutput, 'assets');
    css = readdirSync(assets).filter(name => name.endsWith('.css')).map(name => readFileSync(join(assets, name), 'utf8')).join('\n');
  }
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (route.request().method() !== 'GET' || url.origin !== 'https://offline.invalid') {
      unexpected.push(route.request().method() + ' ' + url.pathname); return route.abort('blockedbyclient');
    }
    if (url.pathname === '/preview') return route.fulfill({ contentType: 'text/html', body: '<!doctype html><html lang="es"><head><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow"></head><body><div id="root"></div></body></html>' });
    if (url.pathname.startsWith('/images/')) return route.fulfill({ path: join(root, 'public', url.pathname) });
    if (url.pathname.startsWith('/fonts/')) return route.fulfill({ path: join(root, 'public', url.pathname) });
    if (url.pathname === '/api/products') {
      const payload = previewGrid ? { ...fixture.listing_response, products: fixture.products.map(p => ({ ...p, visibleInStore: true })) } : fixture.listing_response;
      return route.fulfill({ contentType: 'application/json', body: JSON.stringify(payload) });
    }
    if (url.pathname.startsWith('/api/products/')) {
      const product = [...fixture.products, fixture.current_harvest].find(p => url.pathname.endsWith('/' + p.slug));
      return route.fulfill({ status: product ? 200 : 404, contentType: 'application/json', body: JSON.stringify(product || { error: 'local unavailable' }) });
    }
    if (url.pathname === '/api/reviews/stats') return route.fulfill({ contentType: 'application/json', body: '{"average_rating":0,"total_reviews":0}' });
    if (url.pathname === '/api/reviews') return route.fulfill({ contentType: 'application/json', body: '{"reviews":[]}' });
    unexpected.push(route.request().method() + ' ' + url.pathname); return route.abort('blockedbyclient');
  });
  const captureDir = process.env.BF26_REFERENCE_SCREENSHOT_DIR;
  try {
    await page.goto('https://offline.invalid/preview');
    if (css) await page.addStyleTag({ content: css });
    await page.addScriptTag({ content: browserBuild.outputFiles[0].text });
    for (const [sku, unit, usual, percent, label, price] of approved) {
      const product = fixture.products.find(p => p.sku === sku);
      await page.evaluate(path => window.mount(path), '/producto/' + product.slug);
      const reference = page.locator('[data-campaign-unit-reference]');
      await reference.waitFor();
      assert.equal(await reference.locator('s').innerText(), `${formatEuro(usual)} por ${label}`);
      assert.ok((await reference.innerText()).includes(formatEuro(unit)));
      assert.ok((await reference.innerText()).includes(`−${percent} % por ${label}`));
      assert.ok((await page.locator('body').innerText()).includes(`Pack completo: ${formatEuro(price)}`));
      assert.equal(await page.locator('h2', { hasText: CAMPAIGN_DISCOUNT_HEADLINE }).count(), 0);
      assert.equal(await page.locator('meta[name="robots"]').last().getAttribute('content'), 'noindex, nofollow');
      assert.equal(await page.getByRole('button', { name: /Añadir al carrito/ }).count(), 0);
      if (captureDir && sku === 'BF26-PARA6') {
        mkdirSync(captureDir, { recursive: true });
        await page.waitForTimeout(850);
        await page.screenshot({ path: join(captureDir, 'ficha-para6-movil-completa.png'), fullPage: true });
        await reference.scrollIntoViewIfNeeded();
        await page.screenshot({ path: join(captureDir, 'ficha-para6-movil-referencia.png') });
      }
    }
    await page.evaluate(path => window.mount(path), '/producto/' + fixture.current_harvest.slug);
    await page.getByRole('heading', { name: /Temprano 2026\/27/ }).waitFor();
    assert.equal(await page.locator('[data-campaign-unit-reference], s, del').count(), 0);
    assert.doesNotMatch(await page.locator('body').innerText(), /habitual|%|comparación/);
    await page.evaluate(() => window.mount('/tienda'));
    await page.waitForTimeout(150);
    assert.equal(await page.getByRole('heading', { name: CAMPAIGN_DISCOUNT_HEADLINE }).count(), 0, 'real hidden listing has no campaign headline');
    previewGrid = true; // Local preview projection only, not a catalogue change.
    await page.evaluate(() => window.mount('/tienda?preview=local'));
    await page.getByRole('heading', { name: CAMPAIGN_DISCOUNT_HEADLINE }).waitFor();
    assert.equal(await page.locator('[data-campaign-unit-reference]').count(), 6);
    if (captureDir) {
      await page.waitForTimeout(650);
      await page.screenshot({ path: join(captureDir, 'cuadricula-bf-movil-preview.png'), fullPage: true });
      writeFileSync(join(captureDir, 'capture-proof.json'), JSON.stringify({ local_only: true, viewport: { width: 390, height: 844 }, fixture_source: 'disposable backend Flask HTTP responses', grid: 'local browser projection only; not production visibility', details: 6, unavailable: true, no_customer_submission: true, page_errors: errors, unexpected_requests: unexpected }, null, 2) + '\n');
    }
    assert.deepEqual(errors, []);
    assert.deepEqual(unexpected, []);
  } finally { await browser.close(); }
});
