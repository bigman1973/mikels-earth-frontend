import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const DIST = join(ROOT, 'dist');
const SITEMAP = join(ROOT, 'public', 'sitemap.xml');

const pathsFromSitemap = async () => {
  const xml = await readFile(SITEMAP, 'utf8');
  return [...xml.matchAll(/<loc>https:\/\/www\.mikels\.es([^<]*)<\/loc>/g)]
    .map((match) => match[1] || '/');
};

const htmlFor = (pathname) => readFile(
  pathname === '/' ? join(DIST, 'index.html') : join(DIST, `${pathname.slice(1)}.html`),
  'utf8'
);

const tagContent = (html, tag) => html.match(tag)?.[1] || '';
const decodeApostrophes = (value) => value.replaceAll('&#39;', "'");

test('generates one Spanish static head for every sitemap route', async () => {
  const paths = await pathsFromSitemap();
  assert.equal(paths.length, 24);

  for (const pathname of paths) {
    const html = await htmlFor(pathname);
    const title = tagContent(html, /<title>([^<]+)<\/title>/i);
    const description = tagContent(html, /<meta name="description" content="([^"]+)"/i);
    const canonical = tagContent(html, /<link rel="canonical" href="([^"]+)"/i);

    assert.ok(title, `${pathname} needs a title`);
    assert.ok(description, `${pathname} needs a description`);
    assert.equal(canonical, pathname === '/' ? 'https://www.mikels.es/' : `https://www.mikels.es${pathname}`);
    assert.match(html, /<html lang="es">/i, `${pathname} must be Spanish by default`);
    assert.match(html, /<meta property="og:title" content="[^"]+"/i, `${pathname} needs OG title`);
    assert.match(html, /<meta property="og:description" content="[^"]+"/i, `${pathname} needs OG description`);
    assert.match(html, /<meta property="og:image" content="https?:\/\/[^\"]+"/i, `${pathname} needs OG image`);
  }
});

test('writes page-specific legal titles into the static HTML', async () => {
  const privacy = await htmlFor('/politica-privacidad');
  const terms = await htmlFor('/terminos');
  assert.equal(
    decodeApostrophes(tagContent(privacy, /<title>([^<]+)<\/title>/i)),
    "Política de privacidad | Mikel's Fruit"
  );
  assert.equal(
    decodeApostrophes(tagContent(terms, /<title>([^<]+)<\/title>/i)),
    "Términos y condiciones de compra | Mikel's Fruit"
  );
});
