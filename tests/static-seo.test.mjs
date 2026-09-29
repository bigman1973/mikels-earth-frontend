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
const FAMILY = join(ROOT, 'src', 'pages', 'LaFamilia.jsx');
const LAND = join(ROOT, 'src', 'pages', 'NuestraTierra.jsx');
const TREASURES = join(ROOT, 'src', 'pages', 'NuestrasJoyas.jsx');
const RECIPES = join(ROOT, 'src', 'pages', 'Recetario.jsx');
const SPANISH_LOCALE = join(ROOT, 'src', 'i18n', 'locales', 'es.json');
const ENGLISH_LOCALE = join(ROOT, 'src', 'i18n', 'locales', 'en.json');

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

test('keeps only verified sustainability evidence and removes confirmed false claims', async () => {
  const [land, spanish, english] = await Promise.all([
    readFile(LAND, 'utf8'),
    readFile(SPANISH_LOCALE, 'utf8'),
    readFile(ENGLISH_LOCALE, 'utf8'),
  ]);

  assert.match(land, /evidence_organic/);
  assert.match(land, /evidence_eco_garden/);
  assert.match(land, /evidence_pruning/);
  for (const source of [land, spanish, english]) {
    assert.doesNotMatch(source, /producci[oó]n integrada|huella de carbono|energ[ií]a renovable|sin pesticidas|corredores ecol[oó]gicos|fauna auxiliar|t[eé]cnicas ancestrales/i);
  }
});

test('removes unsupported fruit-selection and nutrition claims and uses current oil products in pairings', async () => {
  const [family, treasures, recipes, spanish, english] = await Promise.all([
    readFile(FAMILY, 'utf8'),
    readFile(TREASURES, 'utf8'),
    readFile(RECIPES, 'utf8'),
    readFile(SPANISH_LOCALE, 'utf8'),
    readFile(ENGLISH_LOCALE, 'utf8'),
  ]);

  for (const source of [family, treasures, spanish, english]) {
    assert.doesNotMatch(source, /seleccionamos cada fruta|fruta seleccionada a mano|favourite of chefs|favorito de los chefs/i);
  }
  assert.doesNotMatch(recipes, /sin az[uú]cares añadidos|without added sugars/i);
  assert.match(recipes, /\['temprano', 'ecologico', 'garrafa', 'paraguayo', 'mermeladas'\]/);
  assert.doesNotMatch(recipes, /pairingKeys = \['arbequina', 'picual'/);
});

test('uses the approved family timeline without the unverified 1975 and 2010 entries', async () => {
  const family = await readFile(FAMILY, 'utf8');

  assert.match(family, /year: "Años 1920"/);
  assert.match(family, /year: "Años 60-70"/);
  assert.match(family, /year: "2017"/);
  assert.match(family, /certificación Eco Garden/);
  assert.doesNotMatch(family, /year: "1975"/);
  assert.doesNotMatch(family, /year: "2010"/);
});

test('keeps the family preserve photo and shortened quote on the family page only', async () => {
  const [family, app, spanish, english] = await Promise.all([
    readFile(FAMILY, 'utf8'),
    readFile(APP, 'utf8'),
    readFile(SPANISH_LOCALE, 'utf8'),
    readFile(ENGLISH_LOCALE, 'utf8'),
  ]);

  assert.match(family, /familyConservaCasa/);
  assert.match(family, /family\.home_preserve_quote/);
  assert.match(family, /family\.home_preserve_caption/);
  assert.match(family, /family\.jordi_text/);
  assert.doesNotMatch(family, /family\.jordi_quote/);
  assert.doesNotMatch(app, /familyConservaCasa/);
  const spanishFamily = JSON.parse(spanish).family;
  const englishFamily = JSON.parse(english).family;
  assert.equal(spanishFamily.home_preserve_quote, '«En casa hacemos conserva cada verano, desde siempre.»');
  assert.match(spanishFamily.jordi_text, /^Séptima generación de una familia de agricultores de Alcarràs\. Dirige Farms Planet/);
  assert.doesNotMatch(spanishFamily.jordi_text, /productos industriales y sin alma|Córdoba/i);
  assert.doesNotMatch(englishFamily.jordi_text, /industrial, soulless products|Córdoba/i);
});
