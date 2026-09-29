export const SITE_ORIGIN = 'https://www.mikels.es';
export const DEFAULT_SOCIAL_IMAGE = `${SITE_ORIGIN}/images/hero-olivos-background.jpeg`;

export const STATIC_ROUTE_SEO = {
  '/': {
    title: "Mikel's Fruit | Productos Naturales y Aceite de Oliva Gourmet desde 1819",
    description: 'Conservas de fruta y aceite de oliva virgen extra cultivados por la familia Giró en el Segrià desde 1819. Del campo al tarro, sin aditivos.',
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
    title: "Tienda online de conservas y AOVE | Mikel's Fruit",
    description: 'Conservas de fruta y aceite de oliva virgen extra. Compra online con envío a domicilio.',
  },
  '/blog': {
    title: "Blog: historias, recetas y tradición | Mikel's",
    description: 'Recetas, historias del campo y todo lo que aprendemos cultivando fruta y aceite desde 1819.',
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
    title: "Nectarina en Almíbar Artesanal 720 g | Mikel's Fruit",
    description: 'Nectarina cultivada en Alcarràs y envasada en almíbar suave. Sin conservantes ni colorantes. El verano en un tarro, todo el año.',
  },
  'aceite-oliva-ecologico': {
    title: "AOVE Ecológico 500ml | Medalla de Oro Japón y NY | Mikel's",
    description: 'Aceite de oliva virgen extra ecológico premiado con Medalla de Oro en Japón y Nueva York. Coupage de Picual, Hojiblanca y Arbequina. Botella de 500 ml.',
  },
  'aceite-temprano-sin-filtrar': {
    title: 'AOVE Temprano sin Filtrar 500ml | Cosecha verde',
    description: 'Aceitunas recogidas aún verdes y aceite sin filtrar: verde intenso, ligeramente picante y con toda la pulpa. Botella de 500 ml con estuche.',
  },
  'aceite-5l-caja-3': {
    title: 'Aceite de Oliva Virgen Extra 5L | Garrafa hostelería',
    description: 'Garrafa de 5 litros de AOVE de baja acidez, Picual, Hojiblanca y Arbequina. El formato de los que cocinan cada día: restaurantes, obradores y casas con consumo alto.',
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
    description: 'Nuestro aceite ecológico premiado con Medalla de Oro, presentado en estuche de regalo. Listo para regalar sin envolver nada.',
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

export const buildProductMetadata = (product, slug) => {
  const manual = PRODUCT_SEO[slug];
  if (manual) return manual;

  const name = normalizeText(product?.name) || 'Producto artesanal';
  const format = normalizeText(product?.weight || product?.format);
  const titleBase = `${name}${format && !name.includes(format) ? ` ${format}` : ''} | Mikel's`;
  const descriptionSource = product?.longDescription || product?.description || `${name}, elaborado por Mikel's.`;

  return {
    title: truncate(titleBase, 60),
    description: truncate(descriptionSource, 155),
  };
};

export const buildBlogMetadata = (post) => ({
  title: `${normalizeText(post?.title) || 'Artículo'} | Blog Mikel's Fruit`,
  description: truncate(post?.content || post?.excerpt || post?.title || 'Historias y recetas de Mikel\'s Fruit.', 155),
});
