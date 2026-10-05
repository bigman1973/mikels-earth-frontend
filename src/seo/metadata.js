export const SITE_ORIGIN = 'https://www.mikels.es';
export const DEFAULT_SOCIAL_IMAGE = `${SITE_ORIGIN}/images/hero-olivos-background.jpeg`;

export const STATIC_ROUTE_SEO = {
  '/': {
    title: "Mikel's Fruit | Conservas de fruta y aceite de oliva",
    description: 'Conservas de fruta del Segrià y aceite de oliva virgen extra de nuestros olivos en Córdoba. Del campo al tarro, sin aditivos.',
  },
  '/la-familia': {
    title: "La familia Giró: siete generaciones desde 1819 | Mikel's",
    description: 'Siete generaciones cultivando en Alcarràs desde 1819. La historia de la familia que está detrás de cada tarro y cada botella de Mikel\'s.',
  },
  '/nuestra-tierra': {
    title: "Nuestra tierra: Alcarràs y los olivares de Córdoba | Mikel's",
    description: 'Fruta de Alcarràs y olivos de Córdoba y Lleida. De dónde sale exactamente lo que ponemos en el tarro, finca por finca.',
  },
  '/como-se-hace': {
    title: "Cómo se hace el paraguayo en almíbar | Mikel's Fruit",
    description: 'Paraguayo pelado a mano, agua, azúcar y zumo de limón. Así se hace la conserva de fruta de Mikel’s Fruit.',
  },
  '/nuestras-joyas': {
    title: "Nuestras joyas: productos de edición limitada | Mikel's",
    description: 'Producciones cortas y ediciones limitadas: lo que solo sale algunos años y en pocas unidades.',
  },
  '/recetario': {
    title: "Recetario de fruta y aceite de oliva | Mikel's Fruit",
    description: 'Recetas mediterráneas con aceite de oliva virgen extra y conservas de fruta, explicadas paso a paso.',
  },
  '/tienda': {
    title: "Tienda online | Mikel's Fruit",
    description: 'Conservas de fruta del Segrià y aceite de oliva virgen extra de nuestros olivos en Córdoba. Paraguayo y nectarina en almíbar, AOVE y packs.',
  },
  '/blog': {
    title: "Blog: historias, recetas y tradición | Mikel's",
    description: 'Recetas, historias del Segrià y de nuestros olivos en Córdoba.',
  },
  '/contacto': {
    title: "Contacto | Mikel's",
    description: 'Habla con nosotros: pedidos, distribución y hostelería. Respondemos en 24 horas laborables.',
  },
  '/opiniones': {
    title: "Opiniones de clientes | Mikel's Fruit",
    description: "Lo que dicen quienes ya lo han probado. Opiniones verificadas de clientes de Mikel's.",
  },
  '/politica-privacidad': {
    title: "Política de privacidad | Mikel's Fruit",
    description: 'Cómo tratamos tus datos personales en mikels.es: qué recogemos, para qué y cómo ejercer tus derechos.',
  },
  '/terminos': {
    title: "Términos y condiciones de compra | Mikel's Fruit",
    description: "Condiciones de compra, envíos, devoluciones y garantías de la tienda online de Mikel's.",
  },
};

const PRODUCT_SEO = {
  'paraguayo-almibar': {
    title: "Paraguayo en Almíbar 720g, del Segrià | Mikel's",
    description: 'Paraguayo pelado a mano, pieza a pieza, en almíbar de agua, azúcar y zumo de limón. Sin conservantes ni colorantes. Tarro de 720 g.',
  },
  'nectarina-almibar': {
    title: "Nectarina en Almíbar 720 g, de Alcarràs | Mikel's Fruit",
    description: 'Nectarina cultivada en Alcarràs, en almíbar de agua y azúcar. Sin conservantes ni colorantes. Tarro de 720 g.',
  },
  'aceite-oliva-ecologico': {
    title: "AOVE Ecológico 500ml | Oro OLIVE JAPAN 2025 | Mikel's",
    description: 'Aceite de oliva virgen extra ecológico. Seis medallas en cinco años seguidos: oro en NYIOOC 2022 y 2024, y en OLIVE JAPAN 2025. Botella de 500 ml.',
  },
  'aceite-temprano-sin-filtrar': {
    title: "AOVE Temprano sin Filtrar 500ml | Plata OLIVE JAPAN 2026 | Mikel's",
    description: 'Medalla de Plata en OLIVE JAPAN 2026, el concurso internacional de aceite de oliva de Tokio, en su primera participación.',
  },
  'aceite-5l-caja-3': {
    title: "AOVE 5 L para hostelería y granel | Mikel's Fruit",
    description: 'Garrafa de 5 L de aceite de oliva virgen extra para hostelería, restauración y cocinas de alto consumo. Picual, hojiblanca y arbequina.',
  },
  'pack-mermelada-aceites': {
    title: 'Pack Degustación Premium | Mermelada y 4 aceites',
    description: 'Mermelada de paraguayo artesanal y cuatro botellas de aceite de oliva virgen extra para catar. El regalo pequeño que sorprende.',
  },
  'pack-temprano-premium': {
    title: 'Pack Temprano Premium | Aceite sin filtrar y estuche',
    description: 'Aceite de oliva temprano sin filtrar en estuche premium. El regalo para quien distingue un aceite bueno de uno muy bueno.',
  },
  'pack-fruta-premium': {
    title: 'Pack Fruta Premium | Paraguayo, nectarina y mermelada',
    description: 'Paraguayo en almíbar, nectarina en almíbar y mermelada de paraguayo. Toda nuestra fruta de Alcarràs en un solo pack.',
  },
  'pack-navidad-completo': {
    title: "Pack Completo Mikel's | Aceites, conservas y estuche",
    description: 'Siete productos: garrafa de 5 L, aceite temprano, dos conservas, mermelada y cuatro aceites de cata, en estuche kraft. Envío gratuito.',
  },
  'pack-aceite-ecologico-premium-estuche-regalo': {
    title: 'Pack Aceite Ecológico Premium | Estuche de regalo',
    description: 'Aceite de oliva virgen extra ecológico presentado en estuche de regalo. Listo para regalar sin envolver nada.',
  },
  'mermelada-paraguayo': {
    title: "Mermelada de Paraguayo Artesanal · Pack de 3 · 60 % fruta | Mikel's Fruit",
    description: 'Tres tarros de mermelada de paraguayo con un 60 % de fruta. Solo paraguayo, agua, azúcar y limón. Sin conservantes ni colorantes.',
  },
};

export const normalizeText = (value = '') => String(value)
  .replace(/<[^>]*>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

export const truncate = (value = '', maxLength) => {
  const text = normalizeText(value);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
};

export const toAbsoluteUrl = (url) => {
  if (!url) return DEFAULT_SOCIAL_IMAGE;
  if (/^https?:\/\//i.test(url)) return url;
  return new URL(url, SITE_ORIGIN).toString();
};

// Fuente: maestro de artículos validado por Jordi (29/09/2026).
// Solo se emite gtin13 cuando el artículo vendido en la web coincide con este SKU.
export const GTIN13_BY_SKU = Object.freeze({
  MIKPARA450: '8437022141008',
  MIKNECT450: '8437022141138',
  MIKPARJ250: '8437022141152',
  MIKBIO19: '8437022141107',
  MIKVE500: '8437022141176',
  MIKVE1000: '8437022141183',
  MIKVE5LP: '8437022141169',
  MIKVET500: '8437022141220',
});

// La API pública no expone SKU. Este mapa corresponde solo a las fichas de venta
// actuales; los packs no tienen GTIN y conservan SKU/MPN para identificarse.
const PRODUCT_SKU_BY_SLUG = Object.freeze({
  'paraguayo-almibar': 'MIKPARA450',
  'nectarina-almibar': 'MIKNECT450',
  'aceite-oliva-ecologico': 'MIKBIO19',
  'aceite-temprano-sin-filtrar': 'MIKVET500',
  'aceite-5l-caja-3': 'MIKVE5LP',
  'mermelada-paraguayo': 'MIKPACKMER3',
  'pack-mermelada-aceites': 'MIKPACKYPO',
  'pack-fruta-premium': 'MIKPACKFR',
  'pack-navidad-completo': 'MIKPACKF',
  'pack-temprano-premium': 'MIKVET500R',
  'pack-aceite-ecologico-premium-estuche-regalo': 'MIKBIO19R',
});

const EDITORIAL_PRODUCT_CONTENT = {
  'paraguayo-almibar': {
    name: 'Paraguayo en Almíbar',
    description: 'Paraguayo cultivado en el Segrià, pelado a mano, pieza a pieza. Sin conservantes, sin colorantes.',
    longDescription: 'Paraguayo en almíbar cultivado en el Segrià. Se pela a mano, pieza a pieza, para que la fruta llegue al tarro con su forma, textura y sabor. Sin conservantes, sin colorantes.',
    ingredients: 'Paraguayo pelado, agua, azúcar, zumo de limón',
  },
  'mermelada-paraguayo': {
    description: 'Tres tarros de mermelada de paraguayo con un 60 % de fruta. Solo paraguayo, agua, azúcar y limón. Sin conservantes ni colorantes.',
    longDescription: 'Paraguayo, agua, azúcar y zumo de limón natural. 60 % de fruta. Solo cuatro ingredientes. Sin conservantes ni colorantes. Pack de tres tarros de 250 g, en estuche de cartón.',
  },
  'aceite-temprano-sin-filtrar': {
    longDescription: 'Aceite de oliva virgen extra de primera cosecha, sin filtrar. De perfil verde, fresco y ligeramente picante, prensado en frío e ideal para ensaladas, tostadas y carpaccios.',
  },
  'pack-temprano-premium': {
    longDescription: 'Un estuche de regalo con una botella de 500 ml de aceite de oliva virgen extra de primera cosecha, sin filtrar, y su estuche premium. De perfil verde, fresco y ligeramente picante; prensado en frío e ideal para ensaladas, tostadas y carpaccios.',
  },
  'pack-fruta-premium': {
    longDescription: 'Paraguayo, nectarina y mermelada de paraguayo. 60 % de fruta en la mermelada; solo cuatro ingredientes: paraguayo, agua, azúcar y zumo de limón natural. Sin conservantes ni colorantes.',
  },
};

const currentBrand = (value = '') => String(value)
  .replaceAll("Mikel's Earth", "Mikel's Fruit")
  .replaceAll('Mikels Earth', "Mikel's Fruit");

const formattedWeight = (weight = '') => String(weight).replace(/(\d)(g|ml|l)$/i, '$1 $2');

export const getProductSeoContent = (product = {}, slug = product?.slug) => {
  const editorial = EDITORIAL_PRODUCT_CONTENT[slug] || {};
  return {
    name: currentBrand(editorial.name || product.name || 'Producto artesanal'),
    description: currentBrand(editorial.description || product.description || ''),
    longDescription: currentBrand(editorial.longDescription || product.longDescription || product.description || ''),
    ingredients: editorial.ingredients || product.ingredients || '',
    weight: formattedWeight(product.weight || product.format || ''),
  };
};

export const buildProductMetadata = (product, slug) => {
  const manual = PRODUCT_SEO[slug];
  if (manual) return manual;

  const content = getProductSeoContent(product, slug);
  const titleBase = `${content.name}${content.weight && !content.name.includes(content.weight) ? ` ${content.weight}` : ''} | Mikel's`;

  return {
    title: truncate(titleBase, 60),
    description: truncate(content.longDescription || `${content.name}, elaborado por Mikel's.`, 155),
  };
};

export const buildProductStructuredData = (product, slug = product?.slug) => {
  const content = getProductSeoContent(product, slug);
  const canonical = `${SITE_ORIGIN}/producto/${encodeURIComponent(slug)}`;
  const sku = product.sku || PRODUCT_SKU_BY_SLUG[slug];
  const gtin13 = sku ? GTIN13_BY_SKU[sku] : undefined;
  const name = content.weight && !content.name.includes(content.weight)
    ? `${content.name} ${content.weight}`
    : content.name;
  const imageList = (product.images?.length ? product.images : [product.image])
    .filter(Boolean)
    .map(toAbsoluteUrl);
  const stock = Number(product.stock);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    image: imageList.length ? imageList : [toAbsoluteUrl(DEFAULT_SOCIAL_IMAGE)],
    description: normalizeText(content.longDescription || content.description),
    ...(gtin13 ? { gtin13 } : {}),
    ...(sku ? { sku, mpn: sku } : {}),
    brand: { '@type': 'Brand', name: "Mikel's Fruit" },
    offers: {
      '@type': 'Offer',
      url: canonical,
      priceCurrency: product.currency || 'EUR',
      price: Number(product.price).toFixed(2),
      availability: product.soldOut || !Number.isFinite(stock) || stock <= 0
        ? 'https://schema.org/OutOfStock'
        : 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };
};

export const buildOrganizationStructuredData = (logoUrl) => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'FARMS PLANET SL',
  alternateName: "Mikel's Fruit",
  url: SITE_ORIGIN,
  logo: logoUrl,
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'C/ Cardenal Cisneros 10',
    postalCode: '25003',
    addressLocality: 'Lleida',
    addressCountry: 'ES',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'info@mikels.es',
    telephone: '+34 621 144 701',
    contactType: 'customer service',
    availableLanguage: ['Spanish', 'English'],
  },
});

export const buildBlogMetadata = (post) => {
  const articleTitle = normalizeText(post?.title) || 'Artículo';

  return {
    title: /Mikel's Fruit/i.test(articleTitle)
      ? articleTitle
      : `${articleTitle} | Blog Mikel's Fruit`,
    // The editor's excerpt is the deliberate meta description. The body is a
    // fallback for historical posts that do not have an excerpt.
    description: truncate(post?.excerpt || post?.content || post?.title || 'Historias y recetas de Mikel\'s Fruit.', 155),
  };
};
