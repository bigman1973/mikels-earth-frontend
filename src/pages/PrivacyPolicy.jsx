import { Helmet } from 'react-helmet-async';

const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Política de Privacidad - Mikel's Earth</title>
        <meta name="description" content="Política de privacidad de Mikel's Earth. Información sobre el tratamiento de datos personales." />
      </Helmet>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-primary mb-8">Política de Privacidad</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">1. Responsable del tratamiento</h2>
            <p className="text-gray-700 leading-relaxed">
              <strong>Mikel's by Farms Planet SL</strong><br />
              CIF: B25943876<br />
              Dirección: Carrer Cardenal Cisneros, 10, Lérida, España<br />
              Email: info@mikels.es<br />
              Teléfono: +34 973 23 45 67
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">2. Datos que recopilamos</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Recopilamos los siguientes tipos de datos personales:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Datos de identificación:</strong> Nombre, apellidos, email, teléfono</li>
              <li><strong>Datos de facturación:</strong> Nombre fiscal, NIF/CIF, dirección fiscal</li>
              <li><strong>Datos de envío:</strong> Dirección de entrega, código postal, ciudad</li>
              <li><strong>Datos de navegación:</strong> Cookies, dirección IP, tipo de navegador</li>
              <li><strong>Datos de compra:</strong> Productos adquiridos, métodos de pago</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">3. Finalidad del tratamiento</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Utilizamos sus datos personales para:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Gestionar y procesar sus pedidos</li>
              <li>Enviar confirmaciones de compra y actualizaciones de envío</li>
              <li>Emitir facturas cuando sea solicitado</li>
              <li>Gestionar solicitudes de visita al obrador</li>
              <li>Responder a consultas y solicitudes de contacto</li>
              <li>Enviar comunicaciones comerciales (solo con su consentimiento)</li>
              <li>Cumplir con obligaciones legales</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">4. Base legal</h2>
            <p className="text-gray-700 leading-relaxed">
              El tratamiento de sus datos se basa en:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Ejecución de contrato:</strong> Para procesar y gestionar sus pedidos</li>
              <li><strong>Consentimiento:</strong> Para enviar comunicaciones comerciales y newsletter</li>
              <li><strong>Obligación legal:</strong> Para cumplir con obligaciones fiscales y contables</li>
              <li><strong>Interés legítimo:</strong> Para mejorar nuestros servicios y productos</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">5. Destinatarios de los datos</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Sus datos pueden ser comunicados a:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Proveedores de servicios de pago:</strong> Stripe (para procesar pagos)</li>
              <li><strong>Servicios de email:</strong> Brevo (para envío de comunicaciones)</li>
              <li><strong>Empresas de mensajería:</strong> Para la entrega de pedidos</li>
              <li><strong>Autoridades públicas:</strong> Cuando sea requerido por ley</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">6. Conservación de datos</h2>
            <p className="text-gray-700 leading-relaxed">
              Conservaremos sus datos personales durante el tiempo necesario para cumplir con las finalidades 
              para las que fueron recogidos y, en cualquier caso, durante los plazos legalmente establecidos 
              (mínimo 6 años para datos fiscales y contables).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">7. Sus derechos</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Puede ejercer los siguientes derechos:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Acceso:</strong> Conocer qué datos tenemos sobre usted</li>
              <li><strong>Rectificación:</strong> Corregir datos inexactos</li>
              <li><strong>Supresión:</strong> Solicitar la eliminación de sus datos</li>
              <li><strong>Oposición:</strong> Oponerse al tratamiento de sus datos</li>
              <li><strong>Limitación:</strong> Solicitar la limitación del tratamiento</li>
              <li><strong>Portabilidad:</strong> Recibir sus datos en formato estructurado</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Para ejercer estos derechos, puede contactarnos en <a href="mailto:info@mikels.es" className="text-primary hover:underline">info@mikels.es</a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">8. Cookies</h2>
            <p className="text-gray-700 leading-relaxed">
              Utilizamos cookies y tecnologías similares para mejorar su experiencia de navegación. 
              Puede gestionar sus preferencias de cookies a través del banner de consentimiento que 
              aparece al visitar nuestra web.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">9. Seguridad</h2>
            <p className="text-gray-700 leading-relaxed">
              Implementamos medidas técnicas y organizativas apropiadas para proteger sus datos personales 
              contra el acceso no autorizado, la pérdida, la destrucción o el daño.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">10. Cambios en la política</h2>
            <p className="text-gray-700 leading-relaxed">
              Nos reservamos el derecho de modificar esta política de privacidad. Los cambios serán 
              publicados en esta página con la fecha de actualización correspondiente.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">11. Contacto</h2>
            <p className="text-gray-700 leading-relaxed">
              Para cualquier consulta sobre esta política de privacidad o el tratamiento de sus datos, 
              puede contactarnos en:
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

export default PrivacyPolicy;

