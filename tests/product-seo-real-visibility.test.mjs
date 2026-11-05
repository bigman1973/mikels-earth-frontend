import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import React from 'react';
import { renderToString } from 'react-dom/server';
import helmetModule from 'react-helmet-async';
import { transformWithEsbuild } from 'vite';
import * as metadata from '../src/seo/metadata.js';
import * as access from '../src/utils/productAccess.js';

const { Helmet, HelmetProvider } = helmetModule;
// Byte-for-byte copy of Flask test_client responses produced by the real
// WebProduct.to_frontend_dict serializer with isolated SQLite data. In
// particular, visibleInStore is never added or overwritten by this test.
const fixture = JSON.parse(await readFile(new URL('./fixtures/real-product-visibility-fixtures.json', import.meta.url), 'utf8'));
const path = 'src/components/ProductSeo.jsx';
const code = (await transformWithEsbuild(await readFile(new URL(`../${path}`, import.meta.url), 'utf8'), path, {
  loader: 'jsx', format: 'cjs', jsx: 'transform',
})).code;
const module = { exports: {} };
runInNewContext(code, {
  module, exports: module.exports, React,
  require: (name) => {
    const modules = { 'react-helmet-async': { Helmet }, '../seo/metadata': metadata, '../utils/productAccess': access };
    assert.ok(name in modules, `Unexpected ProductSeo import: ${name}`);
    return modules[name];
  },
});
const ProductSeo = module.exports.default;
function renderHead(product, slug) {
  const context = {};
  renderToString(React.createElement(HelmetProvider, { context }, React.createElement(ProductSeo, { product, slug })));
  assert.ok(context.helmet, 'The real Helmet SSR renderer must emit metadata');
  return {
    title: context.helmet.title.toString(),
    meta: context.helmet.meta.toString(),
    link: context.helmet.link.toString(),
  };
}
const apiResponse = (body, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json' },
});

test('real serializer fixture has explicit boolean visibility without frontend synthesis', () => {
  assert.match(fixture.provenance.generator, /WebProduct\.to_frontend_dict/);
  assert.match(fixture.provenance.serializer_sha256, /^[a-f0-9]{64}$/);
  assert.equal(fixture.provenance.no_live_activation, true);
  assert.equal(fixture.provenance.no_production_stock_or_customer_data, true);
  assert.equal(fixture.hidden.visibleInStore, false);
  assert.equal(fixture.listed.visibleInStore, true);
  assert.equal(fixture.hidden.available, true);
  assert.equal(fixture.listed.available, true);
  const { visibleInStore: hiddenVisibility, ...hidden } = fixture.hidden;
  const { visibleInStore: listedVisibility, ...listed } = fixture.listed;
  assert.deepEqual(hidden, listed, 'Real API snapshots differ only by backend visibility');
});

test('ProductSeo renders noindex for the real active-hidden API payload while detail remains reachable', async () => {
  const product = await access.loadProductDetail({
    slug: fixture.hidden.slug, apiUrl: 'https://offline.invalid',
    fetchImpl: async () => apiResponse(fixture.hidden),
  });
  assert.deepEqual(product, fixture.hidden);
  assert.equal(access.isListedProduct(product), false);
  assert.equal(access.isPublicFallbackProduct(product), false);
  const head = renderHead(product, product.slug);
  assert.match(head.meta, /name="robots"[^>]*content="noindex, nofollow"/);
  assert.doesNotMatch(head.meta, /content="index, follow"/);
  assert.match(head.title, /2025\/26/);
  assert.ok(head.link.includes(`href="https://www.mikels.es/producto/${encodeURIComponent(product.slug)}"`));
});

test('ProductSeo renders index for the real active-listed API payload', async () => {
  const product = await access.loadProductDetail({
    slug: fixture.listed.slug, apiUrl: 'https://offline.invalid',
    fetchImpl: async () => apiResponse(fixture.listed),
  });
  assert.deepEqual(product, fixture.listed);
  assert.equal(access.isListedProduct(product), true);
  const head = renderHead(product, product.slug);
  assert.match(head.meta, /name="robots"[^>]*content="index, follow"/);
  assert.doesNotMatch(head.meta, /noindex/);
});

test('real inactive API 404 never falls back and ProductSeo renders missing-product noindex', async () => {
  assert.equal(fixture.inactive.http, 404);
  // Prove that a fallback which would qualify on network failure still cannot
  // replace an authoritative 404. This is local stale cache, not an API fixture.
  const stalePublicProduct = { slug: 'stale-public-product', sku: 'STALE-PUBLIC', name: 'Stale cache', price: 20 };
  assert.equal(access.isPublicFallbackProduct(stalePublicProduct), true);
  for (const [slug, fallbackProducts] of [
    [fixture.hidden.slug, [fixture.listed]],
    [stalePublicProduct.slug, [stalePublicProduct]],
  ]) {
    let requests = 0;
    const product = await access.loadProductDetail({
      slug, apiUrl: 'https://offline.invalid', fallbackProducts,
      fetchImpl: async () => { requests++; return apiResponse(fixture.inactive.body, fixture.inactive.http); },
    });
    assert.equal(requests, 1);
    assert.equal(product, null);
    const head = renderHead(product, slug);
    assert.match(head.title, /Producto no disponible/);
    assert.match(head.meta, /name="robots"[^>]*content="noindex"/);
    assert.doesNotMatch(head.meta, /content="index, follow"|og:type/);
    assert.equal(head.link, '', '404 must not emit an indexable product canonical');
  }
});
