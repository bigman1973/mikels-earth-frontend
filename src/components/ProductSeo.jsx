import { Helmet } from 'react-helmet-async';
import { buildProductMetadata } from '../seo/metadata';

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

  const seo = buildProductMetadata(product, slug);
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
