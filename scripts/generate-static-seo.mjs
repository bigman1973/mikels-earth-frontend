/* global process */
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DEFAULT_SOCIAL_IMAGE,
  SITE_ORIGIN,
  STATIC_ROUTE_SEO,
  buildBlogMetadata,
  buildOrganizationStructuredData,
  buildProductMetadata,
  buildProductStructuredData,
  toAbsoluteUrl,
} from '../src/seo/metadata.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const SITEMAP = join(ROOT, 'public', 'sitemap.xml');
const API_URL = process.env.SEO_API_URL || 'https://mikels-earth-backend-production.up.railway.app';
const REQUEST_TIMEOUT_MS = 12_000;
const MAX_RETRIES = 2;

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const jsonForScript = (value) => JSON.stringify(value)
  .replaceAll('<', '\\u003c')
  .replaceAll('>', '\\u003e')
  .replaceAll('&', '\\u0026')
  .replaceAll('\u2028', '\\u2028')
  .replaceAll('\u2029', '\\u2029');

const fetchJson = async (path) => {
  const url = new URL(path, API_URL).toString();
  let lastError;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`${url} responded ${response.status}`);
      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt < MAX_RETRIES) {
        await new Promise((resolveDelay) => setTimeout(resolveDelay, 250 * (attempt + 1)));
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error(`SEO generation failed while reading ${url}: ${lastError?.message || 'unknown error'}`);
};

const parseSitemapPaths = (xml) => [...xml.matchAll(/<loc>https:\/\/www\.mikels\.es([^<]*)<\/loc>/g)]
  .map((match) => match[1] || '/')
  .filter((pathname) => pathname.startsWith('/'));

const routeFiles = (pathname) => {
  if (pathname === '/') return [join(DIST, 'index.html')];

  const relativePath = pathname.replace(/^\//, '');
  return [
    join(DIST, `${relativePath}.html`),
    join(DIST, relativePath, 'index.html'),
  ];
};

const cleanHead = (html) => html
  .replace(/<html\s+lang=(['"])[^'"]*\1/i, '<html lang="es"')
  .replace(/\s*<title>[\s\S]*?<\/title>/gi, '')
  .replace(/\s*<meta\s+name=(['"])description\1[^>]*>/gi, '')
  .replace(/\s*<link\s+rel=(['"])canonical\1[^>]*>/gi, '')
  .replace(/\s*<meta\s+property=(['"])(?:og:[^'"]+)\1[^>]*>/gi, '')
  .replace(/\s*<meta\s+name=(['"])(?:twitter:[^'"]+)\1[^>]*>/gi, '')
  .replace(/\s*<script\s+type=(['"])application\/ld\+json\1[^>]*>[\s\S]*?<\/script>/gi, '');

const buildHead = ({ pathname, title, description, image, type, structuredData = [] }) => {
  const canonical = pathname === '/' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${pathname}`;
  const absoluteImage = toAbsoluteUrl(image || DEFAULT_SOCIAL_IMAGE);
  const escapedTitle = escapeHtml(title);
  const escapedDescription = escapeHtml(description);
  const escapedCanonical = escapeHtml(canonical);
  const escapedImage = escapeHtml(absoluteImage);
  const jsonLd = structuredData.map((item, index) => {
    const schemaId = item['@type'] === 'Product'
      ? 'seo-product-schema'
      : item['@type'] === 'Organization'
        ? 'seo-organization-schema'
        : `seo-schema-${index}`;
    return (
      `\n    <script id="${schemaId}" type="application/ld+json">${jsonForScript(item)}</script>`
    );
  }).join('');

  return `
    <title>${escapedTitle}</title>
    <meta name="description" content="${escapedDescription}" />
    <link rel="canonical" href="${escapedCanonical}" />
    <meta property="og:site_name" content="Mikel's Fruit" />
    <meta property="og:locale" content="es_ES" />
    <meta property="og:type" content="${type}" />
    <meta property="og:title" content="${escapedTitle}" />
    <meta property="og:description" content="${escapedDescription}" />
    <meta property="og:url" content="${escapedCanonical}" />
    <meta property="og:image" content="${escapedImage}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapedTitle}" />
    <meta name="twitter:description" content="${escapedDescription}" />
    <meta name="twitter:image" content="${escapedImage}" />${jsonLd}`;
};

const injectHead = (html, entry) => {
  const cleaned = cleanHead(html);
  const head = buildHead(entry);
  if (!cleaned.includes('</head>')) throw new Error('Vite output has no </head> tag');
  return cleaned.replace('</head>', `${head}\n  </head>`);
};

const resolveLogoUrl = async () => {
  const assets = await readdir(join(DIST, 'assets'));
  const filename = assets.find((name) => /^mikels-fruit-logo-bn-1600-[A-Za-z0-9_-]+\.png$/.test(name));
  if (!filename) throw new Error('Compiled Mikel\'s Fruit logo asset is missing from dist/assets');
  return `${SITE_ORIGIN}/assets/${filename}`;
};

const loadMetadata = async (paths, logoUrl) => {
  const productsPromise = fetchJson('/api/products?lang=es');
  const blogIndexPromise = fetchJson('/api/blog/posts?per_page=100');
  const [productsPayload, blogIndexPayload] = await Promise.all([productsPromise, blogIndexPromise]);

  const products = new Map((productsPayload.products || []).map((product) => [product.slug, product]));
  const blogIndex = new Map((blogIndexPayload.posts || []).map((post) => [post.slug, post]));
  const metadata = new Map();

  for (const pathname of paths) {
    if (STATIC_ROUTE_SEO[pathname]) {
      const structuredData = pathname === '/'
        ? [buildOrganizationStructuredData(logoUrl)]
        : [];
      metadata.set(pathname, {
        pathname,
        ...STATIC_ROUTE_SEO[pathname],
        image: DEFAULT_SOCIAL_IMAGE,
        type: 'website',
        structuredData,
      });
      continue;
    }

    if (pathname.startsWith('/producto/')) {
      const slug = decodeURIComponent(pathname.slice('/producto/'.length));
      const product = products.get(slug);
      if (!product) throw new Error(`Sitemap product ${slug} is missing from /api/products?lang=es`);
      const image = product.image || product.images?.[0] || DEFAULT_SOCIAL_IMAGE;
      metadata.set(pathname, {
        pathname,
        ...buildProductMetadata(product, slug),
        image,
        type: 'product',
        structuredData: [buildProductStructuredData(product, slug)],
      });
      continue;
    }

    if (pathname.startsWith('/blog/')) {
      const slug = decodeURIComponent(pathname.slice('/blog/'.length));
      if (!blogIndex.has(slug)) throw new Error(`Sitemap article ${slug} is missing from /api/blog/posts`);
      const post = await fetchJson(`/api/blog/posts/${encodeURIComponent(slug)}`);
      metadata.set(pathname, {
        pathname,
        ...buildBlogMetadata(post),
        image: post.featured_image || DEFAULT_SOCIAL_IMAGE,
        type: 'article',
      });
      continue;
    }

    throw new Error(`Sitemap path has no metadata policy: ${pathname}`);
  }

  return metadata;
};

const main = async () => {
  const startedAt = performance.now();
  const sitemap = await readFile(SITEMAP, 'utf8');
  const paths = parseSitemapPaths(sitemap);
  if (paths.length !== 24) throw new Error(`Expected 24 indexable routes from sitemap, got ${paths.length}`);

  const baseHtml = await readFile(join(DIST, 'index.html'), 'utf8');
  const logoUrl = await resolveLogoUrl();
  const metadata = await loadMetadata(paths, logoUrl);
  await Promise.all([...metadata.values()].flatMap((entry) => {
    const html = injectHead(baseHtml, entry);
    return routeFiles(entry.pathname).map(async (target) => {
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, html, 'utf8');
    });
  }));

  const elapsedMs = Math.round(performance.now() - startedAt);
  console.log(JSON.stringify({
    generator: 'static-seo-head',
    language: 'es',
    routes: metadata.size,
    elapsed_ms: elapsedMs,
    elapsed_seconds: Number((elapsedMs / 1000).toFixed(3)),
  }));
};

main().catch((error) => {
  console.error(`Static SEO build failed: ${error.message}`);
  process.exitCode = 1;
});
