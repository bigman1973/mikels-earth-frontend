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

export const config = {
  matcher: '/((?!assets/|fonts/|images/|favicon\\.ico|robots\\.txt|sitemap\\.xml).*)',
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
    return exists === false ? next({ status: 404 }) : next();
  }

  const blogMatch = pathname.match(/^\/blog\/([^/]+)$/);
  if (blogMatch) {
    const exists = await resourceExists(
      `${API_URL}/api/blog/posts/${encodeURIComponent(blogMatch[1])}`,
    );
    return exists === false ? next({ status: 404 }) : next();
  }

  return next({ status: 404 });
}
