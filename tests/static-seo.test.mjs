import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { GTIN13_BY_SKU, buildBlogMetadata, buildProductStructuredData } from '../src/seo/metadata.js';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const DIST = join(ROOT, 'dist');
const SITEMAP = join(ROOT, 'public', 'sitemap.xml');
const VERCEL_CONFIG = join(ROOT, 'vercel.json');
const MIDDLEWARE = join(ROOT, 'middleware.js');
const APP = join(ROOT, 'src', 'App.jsx');
const HEADER = join(ROOT, 'src', 'components', 'layout', 'Header.jsx');
const HOME = join(ROOT, 'src', 'pages', 'Home.jsx');
const INDEX_HTML = join(ROOT, 'index.html');
const PRODUCT_DETAIL = join(ROOT, 'src', 'pages', 'ProductDetail.jsx');
const PRODUCT_REVIEWS = join(ROOT, 'src', 'components', 'ProductReviews.jsx');
const FAMILY = join(ROOT, 'src', 'pages', 'LaFamilia.jsx');
const LAND = join(ROOT, 'src', 'pages', 'NuestraTierra.jsx');
const TREASURES = join(ROOT, 'src', 'pages', 'NuestrasJoyas.jsx');
const RECIPES = join(ROOT, 'src', 'pages', 'Recetario.jsx');
const REVIEW_CAROUSEL = join(ROOT, 'src', 'components', 'ReviewCarousel.jsx');
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
const jsonLdEntries = (html) => [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
  .map((match) => JSON.parse(match[1]));

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
  const expected = 'Conservas de fruta del Segrià y aceite de oliva virgen extra de nuestros olivos en Córdoba. Paraguayo y nectarina en almíbar, AOVE y packs.';

  assert.match(shop, /<title>Tienda online \| Mikel's Fruit<\/title>/);
  assert.equal(decodeApostrophes(tagContent(shop, /<title>([^<]+)<\/title>/i)), "Tienda online | Mikel's Fruit");
  assert.equal(tagContent(shop, /<meta name="description" content="([^"]+)"/i), expected);
  assert.equal(tagContent(shop, /<meta property="og:description" content="([^"]+)"/i), expected);
  assert.doesNotMatch(shop, /desde 1819|more than 200|over 200/i);
});

test('uses the edited excerpt before article body for blog metadata', () => {
  const metadata = buildBlogMetadata({
    title: 'Artículo actualizado',
    excerpt: 'Descripción editorial aprobada para buscadores y redes.',
    content: 'Texto histórico que no debe sustituir la descripción editorial.',
  });

  assert.equal(metadata.title, "Artículo actualizado | Blog Mikel's Fruit");
  assert.equal(metadata.description, 'Descripción editorial aprobada para buscadores y redes.');
});

test('removes generic heritage claims outside the documented family history', async () => {
  const [home, reviewCarousel] = await Promise.all([
    htmlFor('/'),
    readFile(REVIEW_CAROUSEL, 'utf8'),
  ]);

  assert.doesNotMatch(home, /Productos Naturales y Aceite de Oliva Gourmet desde 1819|Más de 200 Años|Over 200 Years/i);
  assert.doesNotMatch(reviewCarousel, /Más de 200 años de tradición/i);
});

test('publishes Product JSON-LD with validated EANs and no invented rating data', async () => {
  const paraguayo = await htmlFor('/producto/paraguayo-almibar');
  const nectarina = await htmlFor('/producto/nectarina-almibar');
  const ecologico = await htmlFor('/producto/aceite-oliva-ecologico');
  const temprano = await htmlFor('/producto/aceite-temprano-sin-filtrar');
  const garrafa = await htmlFor('/producto/aceite-5l-caja-3');
  const findProduct = (html) => jsonLdEntries(html).find((entry) => entry['@type'] === 'Product');
  const productSchemas = (html) => jsonLdEntries(html).filter((entry) => entry['@type'] === 'Product');
  const paraguayoData = findProduct(paraguayo);
  const nectarinaData = findProduct(nectarina);

  assert.equal(paraguayoData.name, 'Paraguayo en Almíbar 720 g');
  assert.equal(paraguayoData.gtin13, '8437022141008');
  assert.equal(paraguayoData.sku, 'MIKPARA450');
  assert.equal(paraguayoData.mpn, 'MIKPARA450');
  assert.equal(paraguayoData.offers.priceCurrency, 'EUR');
  assert.equal(paraguayoData.offers.price, '17.15');
  assert.equal(paraguayoData.offers.availability, 'https://schema.org/InStock');
  assert.equal(nectarinaData.name, 'Nectarina en Almíbar 720 g');
  assert.equal(nectarinaData.gtin13, '8437022141138');
  assert.equal(nectarinaData.sku, 'MIKNECT450');
  assert.equal(findProduct(ecologico).gtin13, '8437022141107');
  assert.equal(findProduct(temprano).gtin13, '8437022141220');
  assert.equal(findProduct(garrafa).gtin13, '8437022141169');
  assert.doesNotMatch(JSON.stringify(paraguayoData), /aggregateRating|reviewCount|ratingValue/);
  assert.equal(productSchemas(paraguayo).length, 1);
  assert.match(paraguayo, /<script id="seo-product-schema" type="application\/ld\+json">/);
});

test('keeps all confirmed EANs tied to their verified master SKU', () => {
  assert.deepEqual(GTIN13_BY_SKU, {
    MIKPARA450: '8437022141008',
    MIKNECT450: '8437022141138',
    MIKPARJ250: '8437022141152',
    MIKBIO19: '8437022141107',
    MIKVE500: '8437022141176',
    MIKVE1000: '8437022141183',
    MIKVE5LP: '8437022141169',
    MIKVET500: '8437022141220',
  });
});

test('identifies packs with SKU and MPN but never borrows a component EAN', async () => {
  const packCases = [
    { slug: 'mermelada-paraguayo', indexed: true },
    { slug: 'pack-mermelada-aceites', indexed: true },
    { slug: 'pack-fruta-premium', indexed: true },
    { slug: 'pack-navidad-completo', indexed: true },
    // Estas fichas redirigen a la tienda y por eso no se generan en el sitemap.
    { slug: 'pack-temprano-premium', indexed: false },
    { slug: 'pack-aceite-ecologico-premium-estuche-regalo', indexed: false },
  ];

  for (const { slug, indexed } of packCases) {
    const product = indexed
      ? jsonLdEntries(await htmlFor(`/producto/${slug}`)).find((entry) => entry['@type'] === 'Product')
      : buildProductStructuredData({ slug, name: 'Pack', price: 19.9, currency: 'EUR', stock: 1 }, slug);
    assert.ok(product.sku, `${slug} needs its own SKU`);
    assert.equal(product.mpn, product.sku, `${slug} MPN must match its own SKU`);
    assert.equal(product.gtin13, undefined, `${slug} must not inherit a component EAN`);
  }
});

test('loads Klaviyo only after Cookiebot marketing consent', async () => {
  const indexHtml = await readFile(INDEX_HTML, 'utf8');

  assert.doesNotMatch(indexHtml, /<script\s+async\s+src="https:\/\/static\.klaviyo\.com/i);
  assert.match(indexHtml, /<script type="text\/plain" data-cookieconsent="marketing">[\s\S]*static\.klaviyo\.com\/onsite\/js\/klaviyo\.js/i);
  assert.match(indexHtml, /<script type="text\/plain" data-cookieconsent="marketing">[\s\S]*tracker\.metricool\.com/i);
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


test('uses the product_slug review statistic in the product title rating', async () => {
  const productDetail = await readFile(PRODUCT_DETAIL, 'utf8');

  assert.match(productDetail, /\/api\/reviews\/stats\?product_slug=\$\{slug\}/);
  assert.doesNotMatch(productDetail, /\/api\/reviews\/stats\?product=\$\{slug\}/);
});

test('serves all admin client routes through the SPA shell', async () => {
  const middleware = await readFile(MIDDLEWARE, 'utf8');

  assert.match(middleware, /pathname === '\/admin' \|\| pathname\.startsWith\('\/admin\/'\)/);
  assert.match(middleware, /return renderSpaShell\(request\);/);
});

test('shows verified purchases and the approved review publication policy', async () => {
  const [reviews, spanish] = await Promise.all([
    readFile(PRODUCT_REVIEWS, 'utf8'),
    readFile(SPANISH_LOCALE, 'utf8'),
  ]);
  const reviewCopy = JSON.parse(spanish).reviews;

  assert.match(reviews, /review\.is_verified_purchase/);
  assert.match(reviews, /t\('reviews\.verified_purchase'\)/);
  assert.match(reviews, /t\('reviews\.publication_policy'\)/);
  assert.equal(
    reviewCopy.publication_policy,
    'Publicamos todas las opiniones que recibimos, sin filtrar por puntuación. Las marcadas como compra verificada corresponden a pedidos realizados en esta tienda.',
  );
});

test('defines all visible opinions labels and removes the review incentive', async () => {
  const [opinions, spanish, english] = await Promise.all([
    readFile(join(ROOT, 'src', 'pages', 'Opiniones.jsx'), 'utf8'),
    readFile(SPANISH_LOCALE, 'utf8'),
    readFile(ENGLISH_LOCALE, 'utf8'),
  ]);
  const expectedSpanish = {
    page_title: 'Opiniones',
    subtitle: 'Lo que dicen quienes han probado nuestros productos',
    of_5_stars: 'sobre 5',
    customer_reviews: 'opiniones',
    what_means: '¿Qué significa',
    all_products: 'Todos los productos',
    most_recent: 'Más recientes',
    write_review: 'Escribir una opinión',
  };
  const spanishReviews = JSON.parse(spanish).reviews;
  const englishReviews = JSON.parse(english).reviews;
  for (const [key, value] of Object.entries(expectedSpanish)) {
    assert.equal(spanishReviews[key], value, `Spanish reviews.${key} must match approved copy`);
    assert.ok(englishReviews[key], `English reviews.${key} must be defined`);
  }
  assert.match(opinions, /t\('reviews\.page_title'\)/);
  assert.match(opinions, /t\('reviews\.write_review'\)/);
  assert.doesNotMatch(opinions, /coupon_code|submitResult\.coupon|10% de descuento/i);
  for (const locale of [spanish, english]) {
    assert.doesNotMatch(locale, /"share_experience": "[^"\n]*(?:<strong>|10%|discount|descuento)/i);
  }
});
