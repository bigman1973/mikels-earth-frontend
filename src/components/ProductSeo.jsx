import { Helmet } from 'react-helmet-async';

const PRODUCT_SEO = {
  'paraguayo-almibar': {
    title: "Paraguayo en Almíbar 720g, de Alcarràs | Mikel's",
    description: 'Melocotón plano de nuestros campos de Alcarràs, pelado y preparado a mano. Sin aditivos artificiales, vegano y sin gluten. Tarro de 720 g.',
  },
  'nectarina-almibar': {
    title: "Nectarina en Almíbar 720g, fruta de Alcarràs | Mikel's",
    description: 'Nectarina cultivada en Alcarràs y preparada a mano en nuestro obrador el mismo día que se recoge. Sin aditivos, vegana y sin gluten. Tarro de 720 g.',
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
    description: 'Garrafa de 5 litros de AOVE de baja acidez, Picual y Hojiblanca. El formato de los que cocinan cada día: restaurantes, obradores y casas con consumo alto.',
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
    title: "Mermelada de Paraguayo Artesanal · 3 tarros de 250 g",
    description: 'Cuatro ingredientes: paraguayo, agua, azúcar y zumo de limón. 60% de fruta, el triple que la industria. Pack de tres tarros de 250 g.',
  },
};

const normalizeText = (value = '') => value
  .replace(/<[^>]*>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const truncate = (value, maxLength) => {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trimEnd()}…`;
};

const buildFallbackSeo = (product) => {
  const name = normalizeText(product?.name) || 'Producto artesanal';
  const format = normalizeText(product?.weight || product?.format);
  const titleBase = `${name}${format && !name.includes(format) ? ` ${format}` : ''} | Mikel's`;
  const descriptionSource = normalizeText(
    product?.longDescription || product?.description || `${name}, elaborado por Mikel's.`
  );

  return {
    title: truncate(titleBase, 60),
    description: truncate(descriptionSource, 155),
  };
};

const ProductSeo = ({ product, slug }) => {
  if (!product) {
    return (
      <Helmet>
        <title>Producto no disponible | Mikel's</title>
        <meta
          name="description"
          content="El producto solicitado no está disponible en este momento. Consulta la tienda de Mikel's para ver los productos actuales."
        />
        <meta name="robots" content="noindex" />
      </Helmet>
    );
  }

  const seo = PRODUCT_SEO[slug] || buildFallbackSeo(product);
  const canonical = `https://www.mikels.es/producto/${encodeURIComponent(slug)}`;

  return (
    <Helmet>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <link rel="canonical" href={canonical} />
    </Helmet>
  );
};

export default ProductSeo;
