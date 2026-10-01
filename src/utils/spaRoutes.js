// Public routes rendered by React that are intentionally excluded from the
// indexable static SEO route set. They need the SPA shell on direct loads.
export const SPA_SHELL_ROUTES = new Set([
  '/carrito',
  '/checkout',
  '/pedido-confirmado',
  '/suscripcion-exitosa',
  '/horeca',
]);

export const shouldRenderSpaShell = (pathname) => SPA_SHELL_ROUTES.has(pathname);
