import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import CompanyLegalBlock from '../components/CompanyLegalBlock';

const Terms = () => {
  const { i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');

  return (
    <>
      <Helmet>
        <title>Términos y condiciones de compra | Mikel&apos;s Fruit</title>
      </Helmet>

      <div className="container mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-8 text-4xl font-bold text-primary">Términos y Condiciones</h1>

        <div className="prose prose-lg max-w-none">
          {isEn && (
            <p className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-gray-700">
              These terms are published in Spanish, which is the binding version. If you need assistance in English, please write to{' '}
              <a href="mailto:info@mikels.es">info@mikels.es</a>.
            </p>
          )}

          <p className="mb-6 text-gray-600">Última actualización: 3 de octubre de 2026</p>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-primary">1. Información general</h2>
            <p className="text-gray-700">FARMS PLANET SL, titular de la marca comercial Mikel&apos;s Fruit.</p>
            <CompanyLegalBlock className="mt-4 text-gray-700" />
            <p className="mt-4 text-gray-700">Web: www.mikels.es</p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-primary">2. Objeto</h2>
            <p className="text-gray-700">Estas condiciones generales regulan la venta de productos alimentarios a través de la tienda online www.mikels.es.</p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-primary">3. Productos</h2>
            <p className="text-gray-700">Nuestros productos se elaboran a partir de fruta de temporada, con recetas tradicionales y sin aditivos artificiales. La lista completa de ingredientes de cada producto figura en su ficha y en el envase.</p>
            <p className="mt-4 text-gray-700">El aceite de oliva ecológico cuenta con certificación de agricultura ecológica.</p>
            <p className="mt-4 text-gray-700">Las imágenes y descripciones son orientativas. Nos reservamos el derecho de modificar las características de los productos, informando de ello en la ficha correspondiente.</p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-primary">4. Precios</h2>
            <p className="text-gray-700">Los precios mostrados incluyen IVA y están expresados en euros. Los gastos de envío se calculan y se muestran antes de finalizar la compra.</p>
            <p className="mt-4 text-gray-700">Podemos modificar los precios en cualquier momento; los pedidos ya realizados se respetan al precio acordado en el momento de la compra.</p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-primary">5. Proceso de compra</h2>
            <ol className="list-decimal space-y-2 pl-6 text-gray-700">
              <li>Seleccione los productos y añádalos al carrito.</li>
              <li>Revise su pedido.</li>
              <li>Aplique códigos de descuento, si dispone de ellos.</li>
              <li>Complete sus datos de envío y facturación.</li>
              <li>Seleccione el método de pago.</li>
              <li>Confirme el pedido.</li>
            </ol>
            <p className="mt-4 text-gray-700">Recibirá un correo de confirmación con el detalle de su pedido.</p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-primary">6. Métodos de pago</h2>
            <p className="text-gray-700">Aceptamos tarjetas de crédito y débito, Bizum y transferencia bancaria, a través de la pasarela segura de Stripe. No almacenamos los datos de su tarjeta.</p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-primary">7. Envíos</h2>
            <p className="text-gray-700">Enviamos a España peninsular, Baleares y Portugal. No realizamos envíos a Canarias, Ceuta ni Melilla.</p>

            <h3 className="mt-6 text-xl font-bold text-primary">Gastos de envío</h3>
            <p className="mt-2 text-gray-700">El envío es gratuito en España peninsular, Baleares y Portugal.</p>
            <p className="mt-4 text-gray-700">En los envíos a Baleares, el importe mínimo del pedido es de 59 €.</p>

            <h3 className="mt-6 text-xl font-bold text-primary">Plazo de entrega</h3>
            <p className="mt-2 text-gray-700">Preparamos su pedido en 1-2 días laborables. El transporte tarda entre 24 y 72 horas en España peninsular y Portugal, y puede ser superior en Baleares.</p>
            <p className="mt-4 text-gray-700">Recibirá un correo con el número de seguimiento cuando su pedido salga de nuestro almacén.</p>

            <h3 className="mt-6 text-xl font-bold text-primary">Productos por reserva</h3>
            <p className="mt-2 text-gray-700">Algunos productos de temporada se ofrecen por reserva: se abonan en el momento de la compra y se envían en la fecha indicada en la ficha del producto, que se muestra siempre antes de finalizar la compra.</p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-primary">8. Derecho de desistimiento</h2>
            <p className="text-gray-700">Dispone de <strong>14 días naturales</strong> desde la recepción del pedido para desistir de la compra sin necesidad de justificación, conforme a la normativa de defensa de consumidores y usuarios.</p>
            <p className="mt-4 text-gray-700">Para ejercerlo, escríbanos a <a href="mailto:info@mikels.es">info@mikels.es</a>. Le devolveremos el importe abonado, incluidos los gastos de envío estándar, en un plazo máximo de catorce días desde que nos comunique su decisión.</p>
            <p className="mt-4 text-gray-700"><strong>Única excepción:</strong> por razones de higiene y protección de la salud, no se admite la devolución de productos alimentarios precintados que hayan sido abiertos tras la entrega. Los productos sin abrir y en buen estado se admiten con normalidad.</p>
            <p className="mt-4 text-gray-700">Los costes de la devolución corren a cargo del comprador, salvo que el producto llegue defectuoso o se haya producido un error en el envío, en cuyo caso los asumimos nosotros.</p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-primary">9. Garantías</h2>
            <p className="text-gray-700">Todos nuestros productos cumplen la normativa de seguridad alimentaria.</p>
            <p className="mt-4 text-gray-700">Si recibe un producto defectuoso, roto o en mal estado, le rogamos que nos lo comunique cuanto antes en <a href="mailto:info@mikels.es">info@mikels.es</a>, con una fotografía si es posible: así podemos resolverlo con rapidez. Esto no limita en modo alguno la garantía legal de conformidad que le corresponde.</p>
            <p className="mt-4 text-gray-700">Gestionaremos la sustitución o el reembolso sin coste para usted.</p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-primary">10. Códigos de descuento</h2>
            <p className="text-gray-700">Los códigos son de un solo uso por cliente y no acumulables con otras promociones, salvo indicación expresa. Podemos cancelar códigos obtenidos o utilizados de forma fraudulenta.</p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-primary">11. Propiedad intelectual</h2>
            <p className="text-gray-700">Los contenidos de esta web —textos, imágenes, marcas y logotipos— son propiedad de FARMS PLANET SL y están protegidos por la legislación de propiedad intelectual e industrial. Queda prohibida su reproducción sin autorización expresa.</p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-primary">12. Protección de datos</h2>
            <p className="text-gray-700">El tratamiento de sus datos personales se realiza conforme a nuestra <a href="/politica-privacidad">Política de Privacidad</a>.</p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-primary">13. Responsabilidad</h2>
            <p className="text-gray-700">Respondemos de la correcta entrega de su pedido conforme a la normativa de consumo.</p>
            <p className="mt-4 text-gray-700">No respondemos de los errores en los datos de envío facilitados por el comprador, del uso indebido de los productos ni de las interrupciones técnicas del sitio web ajenas a nuestro control, sin que ello limite los derechos que le reconoce la ley.</p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-primary">14. Modificaciones</h2>
            <p className="text-gray-700">Podemos modificar estas condiciones. Los cambios se aplican a los pedidos realizados a partir de su publicación.</p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-primary">15. Legislación aplicable</h2>
            <p className="text-gray-700">Estas condiciones se rigen por la legislación española. En los contratos con consumidores serán competentes los juzgados y tribunales correspondientes al domicilio del comprador.</p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-primary">16. Contacto</h2>
            <CompanyLegalBlock className="text-gray-700" />
          </section>
        </div>
      </div>
    </>
  );
};

export default Terms;
