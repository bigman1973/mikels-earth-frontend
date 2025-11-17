import { Helmet } from 'react-helmet-async';

const Terms = () => {
  return (
    <>
      <Helmet>
        <title>Términos y Condiciones - Mikel's Earth</title>
        <meta name="description" content="Términos y condiciones de venta de Mikel's Earth. Información sobre compras, envíos y devoluciones." />
      </Helmet>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-primary mb-8">Términos y Condiciones</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">1. Información general</h2>
            <p className="text-gray-700 leading-relaxed">
              <strong>Mikel's by Farms Planet SL</strong><br />
              CIF: B25943876<br />
              Dirección: Carrer Cardenal Cisneros, 10, Lérida, España<br />
              Email: info@mikels.es<br />
              Teléfono: +34 973 23 45 67<br />
              Web: www.mikels.es
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">2. Objeto</h2>
            <p className="text-gray-700 leading-relaxed">
              Las presentes condiciones generales regulan la venta de productos alimentarios artesanales 
              (paraguayo en almíbar, aceites de oliva, etc.) a través de nuestra tienda online www.mikels.es
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">3. Productos</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Todos nuestros productos son:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>100% naturales y artesanales</li>
              <li>Elaborados en nuestro obrador de Lleida</li>
              <li>Veganos y sin aditivos artificiales</li>
              <li>Procedentes de agricultura sostenible</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Las imágenes y descripciones de los productos son orientativas. Nos reservamos el derecho 
              de modificar las características de los productos sin previo aviso.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">4. Precios</h2>
            <p className="text-gray-700 leading-relaxed">
              Los precios mostrados en la web incluyen IVA y están expresados en euros (€). 
              Los gastos de envío se calcularán y mostrarán antes de finalizar la compra.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              Nos reservamos el derecho de modificar los precios en cualquier momento, aunque los 
              pedidos ya realizados se respetarán al precio acordado en el momento de la compra.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">5. Proceso de compra</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Para realizar una compra:
            </p>
            <ol className="list-decimal pl-6 text-gray-700 space-y-2">
              <li>Seleccione los productos y añádalos al carrito</li>
              <li>Revise su pedido en el carrito</li>
              <li>Aplique códigos de descuento si dispone de ellos</li>
              <li>Complete el formulario con sus datos de envío y facturación</li>
              <li>Seleccione el método de pago</li>
              <li>Confirme el pedido</li>
            </ol>
            <p className="text-gray-700 leading-relaxed mt-4">
              Recibirá un email de confirmación con los detalles de su pedido.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">6. Métodos de pago</h2>
            <p className="text-gray-700 leading-relaxed">
              Aceptamos los siguientes métodos de pago a través de nuestra pasarela segura Stripe:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Tarjetas de crédito y débito (Visa, Mastercard, American Express)</li>
              <li>Bizum</li>
              <li>Transferencia bancaria</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Todos los pagos se procesan de forma segura. No almacenamos datos de tarjetas de crédito.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">7. Envíos</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>Zonas de envío:</strong> Realizamos envíos a toda España peninsular y Baleares.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>Plazos de entrega:</strong> 3-5 días laborables desde la confirmación del pedido.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>Gastos de envío:</strong> Se calcularán en función del peso y destino del pedido.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Recibirá un número de seguimiento para rastrear su pedido.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">8. Derecho de desistimiento</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Según la Ley General para la Defensa de los Consumidores y Usuarios, dispone de 14 días 
              naturales desde la recepción del pedido para ejercer su derecho de desistimiento.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>Excepciones:</strong> Por tratarse de productos alimentarios perecederos, solo 
              aceptaremos devoluciones en caso de productos defectuosos o errores en el envío.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Para ejercer el derecho de desistimiento, contacte con nosotros en info@mikels.es
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">9. Garantías</h2>
            <p className="text-gray-700 leading-relaxed">
              Todos nuestros productos cumplen con la normativa vigente en materia de seguridad alimentaria. 
              Si recibe un producto defectuoso o en mal estado, contacte con nosotros en las primeras 
              24 horas desde la recepción para gestionar su sustitución o reembolso.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">10. Códigos de descuento</h2>
            <p className="text-gray-700 leading-relaxed">
              Los códigos de descuento son de un solo uso por cliente y no son acumulables con otras 
              promociones salvo indicación expresa. Nos reservamos el derecho de cancelar códigos 
              fraudulentos o mal utilizados.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">11. Propiedad intelectual</h2>
            <p className="text-gray-700 leading-relaxed">
              Todos los contenidos de esta web (textos, imágenes, marcas, logotipos) son propiedad de 
              Mikel's by Farms Planet SL y están protegidos por las leyes de propiedad intelectual. 
              Queda prohibida su reproducción sin autorización expresa.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">12. Protección de datos</h2>
            <p className="text-gray-700 leading-relaxed">
              El tratamiento de sus datos personales se realiza conforme a nuestra{' '}
              <a href="/politica-privacidad" className="text-primary hover:underline">
                Política de Privacidad
              </a>
              .
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">13. Responsabilidad</h2>
            <p className="text-gray-700 leading-relaxed">
              Mikel's by Farms Planet SL no se hace responsable de:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Retrasos en la entrega causados por la empresa de mensajería</li>
              <li>Errores en los datos de envío proporcionados por el cliente</li>
              <li>Uso indebido de los productos</li>
              <li>Interrupciones técnicas del sitio web</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">14. Modificaciones</h2>
            <p className="text-gray-700 leading-relaxed">
              Nos reservamos el derecho de modificar estos términos y condiciones en cualquier momento. 
              Los cambios serán efectivos desde su publicación en la web.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">15. Legislación aplicable</h2>
            <p className="text-gray-700 leading-relaxed">
              Estas condiciones se rigen por la legislación española. Para cualquier controversia, 
              las partes se someten a los juzgados y tribunales de Lleida, España.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">16. Contacto</h2>
            <p className="text-gray-700 leading-relaxed">
              Para cualquier consulta sobre estos términos y condiciones:
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              Email: <a href="mailto:info@mikels.es" className="text-primary hover:underline">info@mikels.es</a><br />
              Teléfono: +34 973 23 45 67<br />
              Dirección: Carrer Cardenal Cisneros, 10, Lérida, España
            </p>
          </section>
        </div>
      </div>
    </>
  );
};

export default Terms;

