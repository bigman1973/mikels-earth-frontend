import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const DIST = join(ROOT, 'dist');
const SITEMAP = join(ROOT, 'public', 'sitemap.xml');
const VERCEL_CONFIG = join(ROOT, 'vercel.json');

const pathsFromSitemap = async () => {
  const xml = await readFile(SITEMAP, 'utf8');
  return [...xml.matchAll(/<loc>https:\/\/www\.mikels\.es([^<]*)<\/loc>/g)]
    .map((match) => match[1] || '/');
};

const htmlFor = (pathname) => readFile(
  pathname === '/' ? join(DIST, 'index.html') : join(DIST, `${pathname.slice(1)}.html`),
  'utf8'
);

const directoryHtmlFor = (pathname) => readFile(
  join(DIST, pathname.slice(1), 'index.html'),
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

test('generates a directory index fallback for every non-root sitemap route', async () => {
  const paths = await pathsFromSitemap();

  for (const pathname of paths.filter((path) => path !== '/')) {
    const html = await directoryHtmlFor(pathname);
    const canonical = tagContent(html, /<link rel="canonical" href="([^"]+)"/i);

    assert.equal(canonical, `https://www.mikels.es${pathname}`);
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

test('replaces the retired workshop page with Cómo se hace', async () => {
  const sitemap = await readFile(SITEMAP, 'utf8');
  const config = JSON.parse(await readFile(VERCEL_CONFIG, 'utf8'));
  const howItsMade = await htmlFor('/como-se-hace');
  const redirect = config.redirects?.find(({ source }) => source === '/el-obrador');

  assert.match(sitemap, /https:\/\/www\.mikels\.es\/como-se-hace/);
  assert.doesNotMatch(sitemap, /https:\/\/www\.mikels\.es\/el-obrador/);
  assert.equal(
    decodeApostrophes(tagContent(howItsMade, /<title>([^<]+)<\/title>/i)),
    "Cómo se hace el paraguayo en almíbar | Mikel's Fruit"
  );
  assert.equal(tagContent(howItsMade, /<link rel="canonical" href="([^"]+)"/i), 'https://www.mikels.es/como-se-hace');
  assert.deepEqual(redirect, {
    source: '/el-obrador',
    destination: '/como-se-hace',
    permanent: true,
  });
});

test('writes the approved jam description into static and social metadata', async () => {
  const jam = await htmlFor('/producto/mermelada-paraguayo');
  const expected = 'Tres tarros de mermelada de paraguayo con un 60 % de fruta. Solo paraguayo, agua, azúcar y limón. Sin conservantes ni colorantes.';

  assert.equal(tagContent(jam, /<meta name="description" content="([^"]+)"/i), expected);
  assert.equal(tagContent(jam, /<meta property="og:description" content="([^"]+)"/i), expected);
  assert.equal(tagContent(jam, /<meta name="twitter:description" content="([^"]+)"/i), expected);
});

test('uses Segrià in the homepage description', async () => {
  const home = await htmlFor('/');
  const description = tagContent(home, /<meta name="description" content="([^"]+)"/i);

  assert.match(description, /Segrià/);
  assert.doesNotMatch(description, /Alcarràs/);
});
