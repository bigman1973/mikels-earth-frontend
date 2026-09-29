import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const DIST = join(ROOT, 'dist');
const SITEMAP = join(ROOT, 'public', 'sitemap.xml');
const VERCEL_CONFIG = join(ROOT, 'vercel.json');
const MIDDLEWARE = join(ROOT, 'middleware.js');
const APP = join(ROOT, 'src', 'App.jsx');
const HEADER = join(ROOT, 'src', 'components', 'layout', 'Header.jsx');
const HOME = join(ROOT, 'src', 'pages', 'Home.jsx');

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
const jsonLdEntries = (html) => [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
  .map((match) => JSON.parse(match[1]));
const bodyWithoutHead = (html) => html.replace(/<head[\s\S]*?<\/head>/i, '');

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

test('includes a current lastmod date for every sitemap URL', async () => {
  const sitemap = await readFile(SITEMAP, 'utf8');
  const entries = [...sitemap.matchAll(/<url><loc>[^<]+<\/loc><lastmod>([^<]+)<\/lastmod><\/url>/g)];

  assert.equal(entries.length, 24);
  for (const [, lastmod] of entries) {
    assert.match(lastmod, /^2026-09-29$/);
  }
});

test('writes meaningful static body content for every indexable route', async () => {
  const paths = await pathsFromSitemap();

  for (const pathname of paths) {
    const html = await htmlFor(pathname);
    const body = bodyWithoutHead(html);
    assert.match(body, /id="seo-static-content"/, `${pathname} needs static semantic body content`);
    assert.match(body, /<div id="root"><main id="seo-static-content">/, `${pathname} must serve content before JavaScript hydrates`);
    assert.match(body, /<h1>[^<]+<\/h1>/, `${pathname} needs a static H1`);
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
  const middleware = await readFile(MIDDLEWARE, 'utf8');
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
  assert.match(middleware, /['"]\/como-se-hace['"]/);
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

test('uses the approved Tienda title and description', async () => {
  const shop = await htmlFor('/tienda');
  assert.match(shop, /<title>Tienda online \| Mikel's Fruit<\/title>/);
  assert.equal(decodeApostrophes(tagContent(shop, /<title>([^<]+)<\/title>/i)), "Tienda online | Mikel's Fruit");
  assert.equal(
    tagContent(shop, /<meta name="description" content="([^"]+)"/i),
    'Conservas de fruta y aceite de oliva virgen extra de la familia Giró, en Alcarràs desde 1819. Paraguayo y nectarina en almíbar, AOVE y packs.'
  );
});

test('publishes Product JSON-LD without invented rating data', async () => {
  const paraguayo = await htmlFor('/producto/paraguayo-almibar');
  const nectarina = await htmlFor('/producto/nectarina-almibar');
  const findProduct = (html) => jsonLdEntries(html).find((entry) => entry['@type'] === 'Product');
  const productSchemas = (html) => jsonLdEntries(html).filter((entry) => entry['@type'] === 'Product');
  const paraguayoData = findProduct(paraguayo);
  const nectarinaData = findProduct(nectarina);

  assert.equal(paraguayoData.name, 'Paraguayo en Almíbar 720 g');
  assert.equal(paraguayoData.gtin13, '8437022141008');
  assert.equal(paraguayoData.offers.priceCurrency, 'EUR');
  assert.equal(paraguayoData.offers.price, '17.15');
  assert.equal(paraguayoData.offers.availability, 'https://schema.org/InStock');
  assert.equal(nectarinaData.name, 'Nectarina en Almíbar 720 g');
  assert.equal(nectarinaData.gtin13, '8437022141138');
  assert.doesNotMatch(JSON.stringify(paraguayoData), /aggregateRating|reviewCount|ratingValue/);
  assert.equal(productSchemas(paraguayo).length, 1);
  assert.match(paraguayo, /<script id="seo-product-schema" type="application\/ld\+json">/);
});

test('publishes Organization JSON-LD on the homepage with verified corporate data', async () => {
  const home = await htmlFor('/');
  const organization = jsonLdEntries(home).find((entry) => entry['@type'] === 'Organization');

  assert.equal(organization.name, 'FARMS PLANET SL');
  assert.equal(organization.alternateName, "Mikel's Fruit");
  assert.equal(organization.address.streetAddress, 'C/ Cardenal Cisneros 10');
  assert.equal(organization.address.postalCode, '25003');
  assert.equal(organization.address.addressLocality, 'Lleida');
  assert.equal(organization.address.addressCountry, 'ES');
  assert.equal(organization.contactPoint.email, 'info@mikels.es');
  assert.equal(organization.contactPoint.telephone, '+34 621 144 701');
  assert.match(organization.logo, /^https:\/\/www\.mikels\.es\/assets\/mikels-fruit-logo-bn-1600-/);
});

test('removes the non-existent experiences destination from public navigation and routes', async () => {
  const [app, header, home, middleware] = await Promise.all([
    readFile(APP, 'utf8'),
    readFile(HEADER, 'utf8'),
    readFile(HOME, 'utf8'),
    readFile(MIDDLEWARE, 'utf8'),
  ]);

  for (const source of [app, header, home, middleware]) {
    assert.doesNotMatch(source, /\/experiencias/);
  }
  assert.match(home, /pillar_ingredients_title/);
  assert.match(home, /link: "\/tienda"/);
});
