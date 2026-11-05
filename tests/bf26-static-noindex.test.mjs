import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { NONINDEX_STATIC_ROUTE_SEO } from '../src/seo/metadata.js';
import middleware from '../middleware.js';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const DIST = process.env.FRONTEND_BUILD_OUTDIR ? resolve(ROOT, process.env.FRONTEND_BUILD_OUTDIR) : join(ROOT, 'dist');
const CASES = [
  ['BF26-TEMP6', 'aceite-temprano-sin-filtrar-cosecha-2025-26-pack-6', '2025/26'],
  ['BF26-TEMP12', 'aceite-temprano-sin-filtrar-cosecha-2025-26-caja-12', '2025/26'],
  ['BF26-ECO6', 'black-friday-aceite-ecologico-pack-6', 'ecológico'],
  ['BF26-PARA3', 'black-friday-paraguayo-720g-pack-3', 'Pack de 3'],
  ['BF26-PARA6', 'black-friday-paraguayo-720g-pack-6', 'Pack de 6'],
  ['BF26-5L3', 'black-friday-aceite-5l-caja-3', 'PET 5 L'],
];

for (const [sku, slug, text] of CASES) {
  test(`${sku}: generated static head and directory fallback are noindex without publishing an offer`, async () => {
    const pathname = `/producto/${slug}`;
    const spec = NONINDEX_STATIC_ROUTE_SEO[pathname];
    assert.equal(spec.robots, 'noindex, nofollow');
    assert.ok(spec.title.includes(text));
    const html = await readFile(join(DIST, `${pathname.slice(1)}.html`), 'utf8');
    const directory = await readFile(join(DIST, pathname.slice(1), 'index.html'), 'utf8');
    assert.equal(html, directory);
    assert.match(html, /<meta name="robots" content="noindex, nofollow"/);
    assert.ok(html.includes(`<link rel="canonical" href="https://www.mikels.es${pathname}"`));
    assert.match(html, /<div id="root"><\/div>/);
    assert.doesNotMatch(html, /"@type"\s*:\s*"Product"|"@type"\s*:\s*"Offer"/);
    assert.doesNotMatch(html, /inventoryLevel|reservationStockTotal|"stock"\s*:/);
  });
}

test('BF26 routes are additional to VIP and remain outside the original sitemap', async () => {
  const sitemap = await readFile(join(ROOT, 'public/sitemap.xml'), 'utf8');
  const builtSitemap = await readFile(join(DIST, 'sitemap.xml'), 'utf8');
  assert.equal(builtSitemap, sitemap);
  assert.equal([...sitemap.matchAll(/<loc>/g)].length, 23);
  for (const [, slug] of CASES) assert.ok(!sitemap.includes(slug));
  for (const pathname of ['/vip', '/vip/gracias']) {
    assert.equal(NONINDEX_STATIC_ROUTE_SEO[pathname].robots, 'noindex, nofollow');
    const html = await readFile(join(DIST, `${pathname.slice(1)}.html`), 'utf8');
    assert.match(html, /<meta name="robots" content="noindex, nofollow"/);
  }
  assert.equal(Object.keys(NONINDEX_STATIC_ROUTE_SEO).length, CASES.length + 2);
});

test('static-route invariants keep infrastructure byte-identical and VIP UI unchanged with only block A tracking', async () => {
  // The cart hash includes the separately authorized rejection-message fix.
  // Keep every original snapshot hash; verify VIP originals before comparing
  // the full unchanged render/form, since block A authorizes tracking logic.
  const hashes = JSON.parse(await readFile(join(ROOT, 'tests/fixtures/bf26-static-invariants.json'), 'utf8'));
  for (const [name, expected] of Object.entries(hashes)) {
    const bytes = await readFile(join(ROOT, name));
    if (['src/pages/VipLanding.jsx', 'src/pages/VipThanks.jsx'].includes(name)) {
      const base = execFileSync('git', ['show', `4b3d9d74252f997824a5bb0b9d244186a1bf5799:${name}`], { cwd: ROOT });
      assert.equal(createHash('sha256').update(base).digest('hex'), expected, `${name} original snapshot`);
      const current = bytes.toString();
      if (name.endsWith('VipLanding.jsx')) {
        assert.equal(current.replace("import { storeVipConversionProof } from '../utils/vipMetaConversion';\n", '').replace('      storeVipConversionProof(signupId, data.conversion, response.status);\n', ''), base.toString());
      } else {
        const render = source => source.slice(source.indexOf('\n  return (\n'));
        assert.equal(render(current), render(base.toString()), `${name} full render`);
        assert.match(current, /watchMetaVipSignupConfirmation\(signupId, API_URL\)/);
        assert.match(current, /mikels:ga4-vip-lead:/);
      }
      continue;
    }
    assert.equal(createHash('sha256').update(bytes).digest('hex'), expected, `${name} is outside this release`);
  }
});

test('static HTML does not bypass the inactive product guard; active hidden products fall through to their file', async () => {
  const original = globalThis.fetch;
  let apiStatus = 200;
  const calls = [];
  globalThis.fetch = async (input) => {
    const url = new URL(String(input));
    calls.push(url.pathname);
    if (url.pathname.startsWith('/api/products/')) return new Response('{}', { status: apiStatus });
    if (url.pathname === '/index.html') return new Response('<!doctype html><div id="root"></div>', { status: 200, headers: { 'Content-Type': 'text/html' } });
    throw new Error('unexpected mocked request');
  };
  try {
    for (const [, slug] of CASES) {
      const req = new Request(`https://www.mikels.es/producto/${slug}`);
      apiStatus = 200;
      let response = await middleware(req);
      assert.equal(response.headers.get('x-middleware-next'), '1');
      apiStatus = 404;
      response = await middleware(req);
      assert.equal(response.status, 404);
      assert.match(await response.text(), /id="root"/);
    }
    assert.ok(calls.length > 0);
  } finally {
    globalThis.fetch = original;
  }
});
