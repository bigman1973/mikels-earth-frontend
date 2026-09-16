import { Helmet } from 'react-helmet-async';

const NotFoundSeo = ({ product = false }) => {
  const title = product
    ? "Producto no disponible | Mikel's"
    : "Página no disponible | Mikel's";
  const description = product
    ? "El producto solicitado no está disponible en este momento. Consulta la tienda de Mikel's para ver los productos actuales."
    : "La página solicitada no está disponible. Consulta la web de Mikel's para encontrar el contenido que buscas.";

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="noindex" />
    </Helmet>
  );
};

export default NotFoundSeo;
