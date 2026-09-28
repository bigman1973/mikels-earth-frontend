import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { SITE_ORIGIN, STATIC_ROUTE_SEO as ROUTE_SEO } from '../seo/metadata';

const CANONICAL_STATIC_ROUTES = new Set([
  '/',
  '/la-familia',
  '/nuestra-tierra',
  '/como-se-hace',
  '/nuestras-joyas',
  '/recetario',
  '/tienda',
  '/checkout',
  '/pedido-confirmado',
  '/suscripcion-exitosa',
  '/cancelar-suscripcion',
  '/contacto',
  '/horeca',
  '/opiniones',
  '/blog',
  '/politica-privacidad',
  '/terminos',
]);

const CANONICAL_DYNAMIC_ROUTES = [
  /^\/recuperar-carrito\/[^/]+$/,
];

const normalizePathname = (pathname) => {
  if (!pathname || pathname === '/') return '/';
  return pathname.replace(/\/+$/, '') || '/';
};

const SeoManager = () => {
  const { pathname } = useLocation();
  const normalizedPathname = normalizePathname(pathname);
  const routeSeo = ROUTE_SEO[normalizedPathname];
  const supportsCanonical = CANONICAL_STATIC_ROUTES.has(normalizedPathname)
    || CANONICAL_DYNAMIC_ROUTES.some((pattern) => pattern.test(normalizedPathname));
  const canonical = normalizedPathname === '/'
    ? `${SITE_ORIGIN}/`
    : `${SITE_ORIGIN}${normalizedPathname}`;

  return (
    <Helmet key={normalizedPathname}>
      {supportsCanonical ? <link rel="canonical" href={canonical} /> : null}
      {routeSeo?.title ? <title>{routeSeo.title}</title> : null}
      {routeSeo?.description ? (
        <meta name="description" content={routeSeo.description} />
      ) : null}
    </Helmet>
  );
};

export default SeoManager;
