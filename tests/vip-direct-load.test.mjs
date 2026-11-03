import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { NONINDEX_STATIC_ROUTE_SEO } from '../src/seo/metadata.js';
import { SPA_SHELL_ROUTES } from '../src/utils/spaRoutes.js';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const DIST = join(ROOT, 'dist');
const SITEMAP = join(ROOT, 'public', 'sitemap.xml');
const MIDDLEWARE = join(ROOT, 'middleware.js');
const SEO_MANAGER = join(ROOT, 'src', 'components', 'SeoManager.jsx');

const readRouteHtml = (pathname) => readFile(join(DIST, pathname.slice(1), 'index.html'), 'utf8');
const tagContent = (html, tag) => html.match(tag)?.[1] || '';

test('VIP routes load directly with a static noindex head and self-referencing canonical', async () => {
  const [sitemap, middleware, seoManager] = await Promise.all([
    readFile(SITEMAP, 'utf8'),
    readFile(MIDDLEWARE, 'utf8'),
    readFile(SEO_MANAGER, 'utf8'),
  ]);

  for (const [pathname, policy] of Object.entries(NONINDEX_STATIC_ROUTE_SEO)) {
    const html = await readRouteHtml(pathname);
    const canonical = tagContent(html, /<link rel="canonical" href="([^"]+)"/i);
    const robots = tagContent(html, /<meta name="robots" content="([^"]+)"/i);

    assert.equal(canonical, `https://www.mikels.es${pathname}`);
    assert.equal(robots, 'noindex, nofollow');
    assert.equal(tagContent(html, /<title>([^<]+)<\/title>/i), policy.title);
    assert.match(middleware, new RegExp(`'${pathname.replace('/', '\\/')}'`));
    assert.equal(SPA_SHELL_ROUTES.has(pathname), false, `${pathname} must be served from its static file`);
    assert.doesNotMatch(sitemap, new RegExp(`<loc>https://www\\.mikels\\.es${pathname}</loc>`));
    assert.match(seoManager, new RegExp(`'${pathname.replace('/', '\\/')}'`));
  }
});

test('VIP direct HTML carries the approved copy before the SPA renders', async () => {
  const landing = await readRouteHtml('/vip');
  const thanks = await readRouteHtml('/vip/gracias');
  const description = tagContent(landing, /<meta name="description" content="([^"]+)"/i);
  assert.equal(description, 'Entras el 26 de noviembre, un día antes que nadie. El Temprano de la cosecha 2025/26 —la botella que ganó la Plata en OLIVE JAPAN 2026, en Tokio— a mitad de precio que la cosecha nueva.');
  assert.equal(tagContent(thanks, /<meta name="description" content="([^"]+)"/i), 'Ya estás dentro. Revisa tu correo.');
  assert.doesNotMatch(description, /código de descuento|\d+(?:[.,]\d+)?\s*%|plazas/i);
});
