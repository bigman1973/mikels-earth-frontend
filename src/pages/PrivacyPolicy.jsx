import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

const PrivacyPolicy = () => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';

  return (
    <>
      <Helmet>
        <title>{isEn ? "Privacy Policy - Mikel's Earth" : "Política de Privacidad - Mikel's Earth"}</title>
        <meta name="description" content={isEn ? "Privacy policy of Mikel's Earth. Information about the processing of personal data." : "Política de privacidad de Mikel's Earth. Información sobre el tratamiento de datos personales."} />
      </Helmet>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-primary mb-8">
          {isEn ? 'Privacy Policy' : 'Política de Privacidad'}
        </h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            {isEn ? 'Last updated: ' : 'Última actualización: '}
            {new Date().toLocaleDateString(isEn ? 'en-GB' : 'es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">
              {isEn ? '1. Data Controller' : '1. Responsable del tratamiento'}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              <strong>Mikel's by Farms Planet SL</strong><br />
              CIF: B25943876<br />
              {isEn ? 'Address' : 'Dirección'}: Carrer Cardenal Cisneros, 10, Lérida, {isEn ? 'Spain' : 'España'}<br />
              Email: info@mikels.es<br />
              {isEn ? 'Phone' : 'Teléfono'}: +34 973 23 45 67
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">
              {isEn ? '2. Data We Collect' : '2. Datos que recopilamos'}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {isEn ? 'We collect the following types of personal data:' : 'Recopilamos los siguientes tipos de datos personales:'}
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>{isEn ? 'Identification data:' : 'Datos de identificación:'}</strong> {isEn ? 'Name, surname, email, phone' : 'Nombre, apellidos, email, teléfono'}</li>
              <li><strong>{isEn ? 'Billing data:' : 'Datos de facturación:'}</strong> {isEn ? 'Tax name, tax ID, billing address' : 'Nombre fiscal, NIF/CIF, dirección fiscal'}</li>
              <li><strong>{isEn ? 'Shipping data:' : 'Datos de envío:'}</strong> {isEn ? 'Delivery address, postal code, city' : 'Dirección de entrega, código postal, ciudad'}</li>
              <li><strong>{isEn ? 'Browsing data:' : 'Datos de navegación:'}</strong> {isEn ? 'Cookies, IP address, browser type' : 'Cookies, dirección IP, tipo de navegador'}</li>
              <li><strong>{isEn ? 'Purchase data:' : 'Datos de compra:'}</strong> {isEn ? 'Products purchased, payment methods' : 'Productos adquiridos, métodos de pago'}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">
              {isEn ? '3. Purpose of Processing' : '3. Finalidad del tratamiento'}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {isEn ? 'We use your personal data to:' : 'Utilizamos sus datos personales para:'}
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>{isEn ? 'Manage and process your orders' : 'Gestionar y procesar sus pedidos'}</li>
              <li>{isEn ? 'Send purchase confirmations and shipping updates' : 'Enviar confirmaciones de compra y actualizaciones de envío'}</li>
              <li>{isEn ? 'Issue invoices when requested' : 'Emitir facturas cuando sea solicitado'}</li>
              <li>{isEn ? 'Manage workshop visit requests' : 'Gestionar solicitudes de visita al obrador'}</li>
              <li>{isEn ? 'Respond to enquiries and contact requests' : 'Responder a consultas y solicitudes de contacto'}</li>
              <li>{isEn ? 'Send commercial communications (only with your consent)' : 'Enviar comunicaciones comerciales (solo con su consentimiento)'}</li>
              <li>{isEn ? 'Comply with legal obligations' : 'Cumplir con obligaciones legales'}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">
              {isEn ? '4. Legal Basis' : '4. Base legal'}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {isEn ? 'The processing of your data is based on:' : 'El tratamiento de sus datos se basa en:'}
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>{isEn ? 'Contract performance:' : 'Ejecución de contrato:'}</strong> {isEn ? 'To process and manage your orders' : 'Para procesar y gestionar sus pedidos'}</li>
              <li><strong>{isEn ? 'Consent:' : 'Consentimiento:'}</strong> {isEn ? 'To send commercial communications and newsletter' : 'Para enviar comunicaciones comerciales y newsletter'}</li>
              <li><strong>{isEn ? 'Legal obligation:' : 'Obligación legal:'}</strong> {isEn ? 'To comply with tax and accounting obligations' : 'Para cumplir con obligaciones fiscales y contables'}</li>
              <li><strong>{isEn ? 'Legitimate interest:' : 'Interés legítimo:'}</strong> {isEn ? 'To improve our services and products' : 'Para mejorar nuestros servicios y productos'}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">
              {isEn ? '5. Data Recipients' : '5. Destinatarios de los datos'}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {isEn ? 'Your data may be shared with:' : 'Sus datos pueden ser comunicados a:'}
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>{isEn ? 'Payment service providers:' : 'Proveedores de servicios de pago:'}</strong> Stripe ({isEn ? 'for payment processing' : 'para procesar pagos'})</li>
              <li><strong>{isEn ? 'Email services:' : 'Servicios de email:'}</strong> Brevo ({isEn ? 'for sending communications' : 'para envío de comunicaciones'})</li>
              <li><strong>{isEn ? 'Courier companies:' : 'Empresas de mensajería:'}</strong> {isEn ? 'For order delivery' : 'Para la entrega de pedidos'}</li>
              <li><strong>{isEn ? 'Public authorities:' : 'Autoridades públicas:'}</strong> {isEn ? 'When required by law' : 'Cuando sea requerido por ley'}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">
              {isEn ? '6. Data Retention' : '6. Conservación de datos'}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {isEn 
                ? 'We will retain your personal data for as long as necessary to fulfil the purposes for which they were collected and, in any case, for the legally established periods (minimum 6 years for tax and accounting data).'
                : 'Conservaremos sus datos personales durante el tiempo necesario para cumplir con las finalidades para las que fueron recogidos y, en cualquier caso, durante los plazos legalmente establecidos (mínimo 6 años para datos fiscales y contables).'}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">
              {isEn ? '7. Your Rights' : '7. Sus derechos'}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {isEn ? 'You may exercise the following rights:' : 'Puede ejercer los siguientes derechos:'}
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>{isEn ? 'Access:' : 'Acceso:'}</strong> {isEn ? 'Know what data we hold about you' : 'Conocer qué datos tenemos sobre usted'}</li>
              <li><strong>{isEn ? 'Rectification:' : 'Rectificación:'}</strong> {isEn ? 'Correct inaccurate data' : 'Corregir datos inexactos'}</li>
              <li><strong>{isEn ? 'Erasure:' : 'Supresión:'}</strong> {isEn ? 'Request the deletion of your data' : 'Solicitar la eliminación de sus datos'}</li>
              <li><strong>{isEn ? 'Objection:' : 'Oposición:'}</strong> {isEn ? 'Object to the processing of your data' : 'Oponerse al tratamiento de sus datos'}</li>
              <li><strong>{isEn ? 'Restriction:' : 'Limitación:'}</strong> {isEn ? 'Request restriction of processing' : 'Solicitar la limitación del tratamiento'}</li>
              <li><strong>{isEn ? 'Portability:' : 'Portabilidad:'}</strong> {isEn ? 'Receive your data in a structured format' : 'Recibir sus datos en formato estructurado'}</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              {isEn ? 'To exercise these rights, please contact us at ' : 'Para ejercer estos derechos, puede contactarnos en '}
              <a href="mailto:info@mikels.es" className="text-primary hover:underline">info@mikels.es</a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">
              {isEn ? '8. Cookies' : '8. Cookies'}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {isEn
                ? 'We use cookies and similar technologies to improve your browsing experience. You can manage your cookie preferences through the consent banner that appears when visiting our website.'
                : 'Utilizamos cookies y tecnologías similares para mejorar su experiencia de navegación. Puede gestionar sus preferencias de cookies a través del banner de consentimiento que aparece al visitar nuestra web.'}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">
              {isEn ? '9. Security' : '9. Seguridad'}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {isEn
                ? 'We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, loss, destruction or damage.'
                : 'Implementamos medidas técnicas y organizativas apropiadas para proteger sus datos personales contra el acceso no autorizado, la pérdida, la destrucción o el daño.'}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">
              {isEn ? '10. Changes to This Policy' : '10. Cambios en la política'}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {isEn
                ? 'We reserve the right to modify this privacy policy. Changes will be published on this page with the corresponding update date.'
                : 'Nos reservamos el derecho de modificar esta política de privacidad. Los cambios serán publicados en esta página con la fecha de actualización correspondiente.'}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">
              {isEn ? '11. Contact' : '11. Contacto'}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {isEn
                ? 'For any enquiry about this privacy policy or the processing of your data, please contact us at:'
                : 'Para cualquier consulta sobre esta política de privacidad o el tratamiento de sus datos, puede contactarnos en:'}
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

export default PrivacyPolicy;
