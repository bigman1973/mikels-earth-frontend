import { next } from '@vercel/functions';

const API_URL = globalThis.process?.env?.VITE_API_URL
  || 'https://mikels-earth-backend-production.up.railway.app';

const STATIC_ROUTES = new Set([
  '/',
  '/la-familia',
  '/nuestra-tierra',
  '/el-obrador',
  '/nuestras-joyas',
  '/experiencias',
  '/recetario',
  '/tienda',
  '/checkout',
  '/order-success',
  '/subscription-success',
  '/blog',
  '/contacto',
  '/horeca',
  '/opiniones',
  '/politica-privacidad',
  '/terminos',
  '/admin/login',
  '/admin/dashboard',
  '/admin/productos',
  '/admin/stock',
  '/admin/pedidos',
  '/admin/clientes',
  '/admin/usuarios',
  '/admin/cupones',
  '/admin/blog',
]);

const PERMANENT_REDIRECTS = new Map([
  ['/familia', '/la-familia'],
  ['/productos', '/tienda'],
  [
    '/producto/pack-aceite-ecologico-premium-estuche-regalo',
    '/producto/aceite-oliva-ecologico',
  ],
  [
    '/producto/pack-temprano-premium',
    '/producto/aceite-temprano-sin-filtrar',
  ],
]);

const normalizePathname = (pathname) => {
  if (!pathname || pathname === '/') return '/';
  return pathname.replace(/\/+$/, '') || '/';
};

const resourceExists = async (url) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (response.status === 404) return false;
    if (response.ok) return true;

    // Fallo del servicio: no convertir una página válida en un 404 falso.
    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
};

const renderSpaNotFound = async (request) => {
  const indexUrl = new URL('/index.html', request.url);
  const indexResponse = await fetch(indexUrl, {
    headers: request.headers,
  });

  if (!indexResponse.ok) {
    return next({ status: 404 });
  }

  const headers = new Headers(indexResponse.headers);
  headers.set('Content-Type', 'text/html; charset=utf-8');
  headers.set('Cache-Control', 'no-store');

  return new Response(
    request.method === 'HEAD' ? null : await indexResponse.text(),
    { status: 404, headers },
  );
};

export const config = {
  matcher: '/((?!assets/|fonts/|images/|index\\.html|favicon\\.ico|robots\\.txt|sitemap\\.xml).*)',
};

export default async function middleware(request) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return next();
  }

  const requestUrl = new URL(request.url);
  const pathname = normalizePathname(requestUrl.pathname);
  const redirectTarget = PERMANENT_REDIRECTS.get(pathname);

  if (redirectTarget) {
    return new Response(null, {
      status: 301,
      headers: { Location: new URL(redirectTarget, requestUrl.origin).toString() },
    });
  }

  if (
    STATIC_ROUTES.has(pathname)
    || /^\/admin\/clientes\/[^/]+$/.test(pathname)
    || /^\/recuperar-carrito\/[^/]+$/.test(pathname)
  ) {
    return next();
  }

  const productMatch = pathname.match(/^\/producto\/([^/]+)$/);
  if (productMatch) {
    const exists = await resourceExists(
      `${API_URL}/api/products/${encodeURIComponent(productMatch[1])}`,
    );
    return exists === false ? renderSpaNotFound(request) : next();
  }

  const blogMatch = pathname.match(/^\/blog\/([^/]+)$/);
  if (blogMatch) {
    const exists = await resourceExists(
      `${API_URL}/api/blog/posts/${encodeURIComponent(blogMatch[1])}`,
    );
    return exists === false ? renderSpaNotFound(request) : next();
  }

  return renderSpaNotFound(request);
}
