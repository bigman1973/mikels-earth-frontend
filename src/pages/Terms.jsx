import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

const Terms = () => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';

  return (
    <>
      <Helmet>
        <title>{isEn ? "Terms & Conditions - Mikel's Earth" : "Términos y Condiciones - Mikel's Earth"}</title>
        <meta name="description" content={isEn ? "Terms and conditions of sale at Mikel's Earth. Information about purchases, shipping and returns." : "Términos y condiciones de venta de Mikel's Earth. Información sobre compras, envíos y devoluciones."} />
      </Helmet>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-primary mb-8">
          {isEn ? 'Terms & Conditions' : 'Términos y Condiciones'}
        </h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            {isEn ? 'Last updated: ' : 'Última actualización: '}
            {new Date().toLocaleDateString(isEn ? 'en-GB' : 'es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">
              {isEn ? '1. General Information' : '1. Información general'}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              <strong>Mikel's by Farms Planet SL</strong><br />
              CIF: B25943876<br />
              {isEn ? 'Address' : 'Dirección'}: Carrer Cardenal Cisneros, 10, Lérida, {isEn ? 'Spain' : 'España'}<br />
              Email: info@mikels.es<br />
              {isEn ? 'Phone' : 'Teléfono'}: +34 973 23 45 67<br />
              Web: www.mikels.es
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">
              {isEn ? '2. Purpose' : '2. Objeto'}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {isEn
                ? 'These general conditions govern the sale of artisanal food products (flat peach in syrup, olive oils, etc.) through our online shop www.mikels.es'
                : 'Las presentes condiciones generales regulan la venta de productos alimentarios artesanales (paraguayo en almíbar, aceites de oliva, etc.) a través de nuestra tienda online www.mikels.es'}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">
              {isEn ? '3. Products' : '3. Productos'}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {isEn ? 'All our products are:' : 'Todos nuestros productos son:'}
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>{isEn ? '100% natural and artisanal' : '100% naturales y artesanales'}</li>
              <li>{isEn ? 'Made in our workshop in Lleida' : 'Elaborados en nuestro obrador de Lleida'}</li>
              <li>{isEn ? 'Vegan and free from artificial additives' : 'Veganos y sin aditivos artificiales'}</li>
              <li>{isEn ? 'From sustainable agriculture' : 'Procedentes de agricultura sostenible'}</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              {isEn
                ? 'Product images and descriptions are indicative. We reserve the right to modify product characteristics without prior notice.'
                : 'Las imágenes y descripciones de los productos son orientativas. Nos reservamos el derecho de modificar las características de los productos sin previo aviso.'}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">
              {isEn ? '4. Prices' : '4. Precios'}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {isEn
                ? 'Prices shown on the website include VAT and are expressed in euros (€). Shipping costs will be calculated and displayed before completing the purchase.'
                : 'Los precios mostrados en la web incluyen IVA y están expresados en euros (€). Los gastos de envío se calcularán y mostrarán antes de finalizar la compra.'}
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              {isEn
                ? 'We reserve the right to modify prices at any time, although orders already placed will be honoured at the price agreed at the time of purchase.'
                : 'Nos reservamos el derecho de modificar los precios en cualquier momento, aunque los pedidos ya realizados se respetarán al precio acordado en el momento de la compra.'}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">
              {isEn ? '5. Purchase Process' : '5. Proceso de compra'}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {isEn ? 'To make a purchase:' : 'Para realizar una compra:'}
            </p>
            <ol className="list-decimal pl-6 text-gray-700 space-y-2">
              <li>{isEn ? 'Select products and add them to your cart' : 'Seleccione los productos y añádalos al carrito'}</li>
              <li>{isEn ? 'Review your order in the cart' : 'Revise su pedido en el carrito'}</li>
              <li>{isEn ? 'Apply discount codes if you have any' : 'Aplique códigos de descuento si dispone de ellos'}</li>
              <li>{isEn ? 'Complete the form with your shipping and billing details' : 'Complete el formulario con sus datos de envío y facturación'}</li>
              <li>{isEn ? 'Select the payment method' : 'Seleccione el método de pago'}</li>
              <li>{isEn ? 'Confirm the order' : 'Confirme el pedido'}</li>
            </ol>
            <p className="text-gray-700 leading-relaxed mt-4">
              {isEn ? 'You will receive a confirmation email with the details of your order.' : 'Recibirá un email de confirmación con los detalles de su pedido.'}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">
              {isEn ? '6. Payment Methods' : '6. Métodos de pago'}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {isEn ? 'We accept the following payment methods through our secure Stripe gateway:' : 'Aceptamos los siguientes métodos de pago a través de nuestra pasarela segura Stripe:'}
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>{isEn ? 'Credit and debit cards (Visa, Mastercard, American Express)' : 'Tarjetas de crédito y débito (Visa, Mastercard, American Express)'}</li>
              <li>Bizum</li>
              <li>{isEn ? 'Bank transfer' : 'Transferencia bancaria'}</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              {isEn ? 'All payments are processed securely. We do not store credit card data.' : 'Todos los pagos se procesan de forma segura. No almacenamos datos de tarjetas de crédito.'}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">
              {isEn ? '7. Shipping' : '7. Envíos'}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>{isEn ? 'Shipping zones:' : 'Zonas de envío:'}</strong> {isEn ? 'We ship to mainland Spain, the Balearic Islands, and selected European countries.' : 'Realizamos envíos a toda España peninsular y Baleares.'}
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>{isEn ? 'Delivery times:' : 'Plazos de entrega:'}</strong> {isEn ? '3-5 working days from order confirmation.' : '3-5 días laborables desde la confirmación del pedido.'}
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>{isEn ? 'Shipping costs:' : 'Gastos de envío:'}</strong> {isEn ? 'Calculated based on weight and destination.' : 'Se calcularán en función del peso y destino del pedido.'}
            </p>
            <p className="text-gray-700 leading-relaxed">
              {isEn ? 'You will receive a tracking number to follow your order.' : 'Recibirá un número de seguimiento para rastrear su pedido.'}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">
              {isEn ? '8. Right of Withdrawal' : '8. Derecho de desistimiento'}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {isEn
                ? 'Under the General Consumer Protection Act, you have 14 calendar days from receipt of the order to exercise your right of withdrawal.'
                : 'Según la Ley General para la Defensa de los Consumidores y Usuarios, dispone de 14 días naturales desde la recepción del pedido para ejercer su derecho de desistimiento.'}
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>{isEn ? 'Exceptions:' : 'Excepciones:'}</strong> {isEn
                ? 'As these are perishable food products, we only accept returns in case of defective products or shipping errors.'
                : 'Por tratarse de productos alimentarios perecederos, solo aceptaremos devoluciones en caso de productos defectuosos o errores en el envío.'}
            </p>
            <p className="text-gray-700 leading-relaxed">
              {isEn ? 'To exercise the right of withdrawal, contact us at info@mikels.es' : 'Para ejercer el derecho de desistimiento, contacte con nosotros en info@mikels.es'}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">
              {isEn ? '9. Guarantees' : '9. Garantías'}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {isEn
                ? 'All our products comply with current food safety regulations. If you receive a defective or damaged product, contact us within the first 24 hours of receipt to arrange replacement or refund.'
                : 'Todos nuestros productos cumplen con la normativa vigente en materia de seguridad alimentaria. Si recibe un producto defectuoso o en mal estado, contacte con nosotros en las primeras 24 horas desde la recepción para gestionar su sustitución o reembolso.'}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">
              {isEn ? '10. Discount Codes' : '10. Códigos de descuento'}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {isEn
                ? 'Discount codes are single-use per customer and cannot be combined with other promotions unless expressly stated. We reserve the right to cancel fraudulent or misused codes.'
                : 'Los códigos de descuento son de un solo uso por cliente y no son acumulables con otras promociones salvo indicación expresa. Nos reservamos el derecho de cancelar códigos fraudulentos o mal utilizados.'}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">
              {isEn ? '11. Intellectual Property' : '11. Propiedad intelectual'}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {isEn
                ? "All content on this website (texts, images, trademarks, logos) is the property of Mikel's by Farms Planet SL and is protected by intellectual property laws. Reproduction without express authorisation is prohibited."
                : 'Todos los contenidos de esta web (textos, imágenes, marcas, logotipos) son propiedad de Mikel\'s by Farms Planet SL y están protegidos por las leyes de propiedad intelectual. Queda prohibida su reproducción sin autorización expresa.'}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">
              {isEn ? '12. Data Protection' : '12. Protección de datos'}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {isEn ? 'The processing of your personal data is carried out in accordance with our ' : 'El tratamiento de sus datos personales se realiza conforme a nuestra '}
              <a href="/politica-privacidad" className="text-primary hover:underline">
                {isEn ? 'Privacy Policy' : 'Política de Privacidad'}
              </a>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">
              {isEn ? '13. Liability' : '13. Responsabilidad'}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {isEn ? "Mikel's by Farms Planet SL is not liable for:" : 'Mikel\'s by Farms Planet SL no se hace responsable de:'}
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>{isEn ? 'Delivery delays caused by the courier company' : 'Retrasos en la entrega causados por la empresa de mensajería'}</li>
              <li>{isEn ? 'Errors in shipping details provided by the customer' : 'Errores en los datos de envío proporcionados por el cliente'}</li>
              <li>{isEn ? 'Improper use of products' : 'Uso indebido de los productos'}</li>
              <li>{isEn ? 'Technical interruptions of the website' : 'Interrupciones técnicas del sitio web'}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">
              {isEn ? '14. Modifications' : '14. Modificaciones'}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {isEn
                ? 'We reserve the right to modify these terms and conditions at any time. Changes will be effective from their publication on the website.'
                : 'Nos reservamos el derecho de modificar estos términos y condiciones en cualquier momento. Los cambios serán efectivos desde su publicación en la web.'}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">
              {isEn ? '15. Applicable Law' : '15. Legislación aplicable'}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {isEn
                ? 'These conditions are governed by Spanish law. For any dispute, the parties submit to the courts of Lleida, Spain.'
                : 'Estas condiciones se rigen por la legislación española. Para cualquier controversia, las partes se someten a los juzgados y tribunales de Lleida, España.'}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">
              {isEn ? '16. Contact' : '16. Contacto'}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {isEn ? 'For any enquiry about these terms and conditions:' : 'Para cualquier consulta sobre estos términos y condiciones:'}
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              Email: <a href="mailto:info@mikels.es" className="text-primary hover:underline">info@mikels.es</a><br />
              {isEn ? 'Phone' : 'Teléfono'}: +34 973 23 45 67<br />
              {isEn ? 'Address' : 'Dirección'}: Carrer Cardenal Cisneros, 10, Lérida, {isEn ? 'Spain' : 'España'}
            </p>
          </section>
        </div>
      </div>
    </>
  );
};

export default Terms;
