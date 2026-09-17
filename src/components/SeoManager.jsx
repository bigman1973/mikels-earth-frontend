import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SITE_ORIGIN = 'https://www.mikels.es';

const CANONICAL_STATIC_ROUTES = new Set([
  '/',
  '/la-familia',
  '/nuestra-tierra',
  '/el-obrador',
  '/nuestras-joyas',
  '/experiencias',
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
  /^\/blog\/[^/]+$/,
  /^\/recuperar-carrito\/[^/]+$/,
];

const ROUTE_SEO = {
  '/': {
    title: "Mikel's Fruit | Productos Naturales y Aceite de Oliva Gourmet desde 1819",
    description: "Conservas de fruta y aceite de oliva virgen extra cultivados por la familia Giró en Alcarràs desde 1819. Del campo al tarro, sin aditivos.",
  },
  '/la-familia': {
    title: "La familia Giró: siete generaciones desde 1819 | Mikel's",
    description: "Siete generaciones cultivando en Alcarràs desde 1819. La historia de la familia que está detrás de cada tarro y cada botella de Mikel's.",
  },
  '/nuestra-tierra': {
    title: "Nuestra tierra: Alcarràs y los olivares de Córdoba | Mikel's",
    description: 'Fruta de Alcarràs y olivos de Córdoba y Lleida. De dónde sale exactamente lo que ponemos en el tarro, finca por finca.',
  },
  '/el-obrador': {
    title: "El obrador: cómo hacemos las conservas a mano | Mikel's",
    description: 'Conservas preparadas a mano, en pequeñas partidas y sin aditivos. Así trabajamos la fruta el mismo día que se recoge.',
  },
  '/nuestras-joyas': {
    title: "Nuestras joyas: productos de edición limitada | Mikel's",
    description: 'Producciones cortas y ediciones limitadas: lo que solo sale algunos años y en pocas unidades.',
  },
  '/recetario': {
    description: 'Recetas mediterráneas con aceite de oliva virgen extra y conservas de fruta, explicadas paso a paso.',
  },
  '/tienda': {
    description: 'Conservas de fruta y aceite de oliva virgen extra de nuestros campos. Envío desde el obrador, sin intermediarios.',
  },
  '/blog': {
    title: "Blog: historias, recetas y tradición | Mikel's",
    description: 'Recetas, historias del campo y todo lo que aprendemos cultivando fruta y aceite desde 1819.',
  },
  '/contacto': {
    title: "Contacto | Mikel's",
    description: 'Habla con nosotros: pedidos, distribución, hostelería y visitas. Respondemos en 24 horas laborables.',
  },
  '/opiniones': {
    description: "Lo que dicen quienes ya lo han probado. Opiniones verificadas de clientes de Mikel's.",
  },
  '/politica-privacidad': {
    description: 'Cómo tratamos tus datos personales en mikels.es: qué recogemos, para qué y cómo ejercer tus derechos.',
  },
  '/terminos': {
    description: "Condiciones de compra, envíos, devoluciones y garantías de la tienda online de Mikel's.",
  },
};

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
    <Helmet>
      {supportsCanonical ? <link rel="canonical" href={canonical} /> : null}
      {routeSeo?.title ? <title>{routeSeo.title}</title> : null}
      {routeSeo?.description ? (
        <meta name="description" content={routeSeo.description} />
      ) : null}
    </Helmet>
  );
};

export default SeoManager;
