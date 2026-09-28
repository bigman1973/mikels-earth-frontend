import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import CompanyLegalBlock from '../components/CompanyLegalBlock';

const PrivacyPolicy = () => {
  const { i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');

  return (
    <>
      <Helmet>
        <title>Política de privacidad | Mikel&apos;s Fruit</title>
      </Helmet>

      <div className="container mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-8 text-4xl font-bold text-primary">Política de Privacidad</h1>

        <div className="prose prose-lg max-w-none">
          {isEn && (
            <p className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-gray-700">
              These terms are published in Spanish, which is the binding version. If you need assistance in English, please write to{' '}
              <a href="mailto:info@mikels.es">info@mikels.es</a>.
            </p>
          )}

          <p className="mb-6 text-gray-600">Última actualización: 28 de septiembre de 2026</p>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-primary">1. Responsable del tratamiento</h2>
            <p className="text-gray-700">FARMS PLANET SL, titular de la marca comercial Mikel&apos;s Fruit.</p>
            <CompanyLegalBlock className="mt-4 text-gray-700" />
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-primary">2. Datos que recopilamos</h2>
            <ul className="list-disc space-y-2 pl-6 text-gray-700">
              <li><strong>Datos de identificación:</strong> nombre, apellidos, email, teléfono.</li>
              <li><strong>Datos de facturación:</strong> nombre fiscal, NIF/CIF, dirección fiscal.</li>
              <li><strong>Datos de envío:</strong> dirección de entrega, código postal, población.</li>
              <li><strong>Datos de navegación:</strong> cookies, dirección IP, tipo de navegador.</li>
              <li><strong>Datos de compra:</strong> productos adquiridos y método de pago. No almacenamos los datos completos de su tarjeta; los gestiona directamente nuestro proveedor de pagos.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-primary">3. Finalidad del tratamiento</h2>
            <p className="mb-4 text-gray-700">Utilizamos sus datos personales para:</p>
            <ul className="list-disc space-y-2 pl-6 text-gray-700">
              <li>Gestionar y procesar sus pedidos.</li>
              <li>Enviar confirmaciones de compra y actualizaciones de envío.</li>
              <li>Emitir tickets y facturas.</li>
              <li>Responder a sus consultas y solicitudes de contacto.</li>
              <li>Enviar comunicaciones comerciales, únicamente si nos ha dado su consentimiento.</li>
              <li>Cumplir con nuestras obligaciones legales, fiscales y contables.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-primary">4. Base legal</h2>
            <ul className="list-disc space-y-2 pl-6 text-gray-700">
              <li><strong>Ejecución de contrato:</strong> para procesar y gestionar sus pedidos.</li>
              <li><strong>Consentimiento:</strong> para las comunicaciones comerciales y el boletín, que puede retirar en cualquier momento.</li>
              <li><strong>Obligación legal:</strong> para cumplir con las obligaciones fiscales y contables.</li>
              <li><strong>Interés legítimo:</strong> para garantizar la seguridad de la tienda y mejorar nuestros productos y servicios.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-primary">5. Destinatarios de los datos</h2>
            <p className="mb-4 text-gray-700">Sus datos pueden ser comunicados a los siguientes prestadores de servicios, que los tratan por cuenta nuestra:</p>
            <ul className="list-disc space-y-2 pl-6 text-gray-700">
              <li><strong>Stripe</strong> — procesamiento de pagos.</li>
              <li><strong>Klaviyo</strong> — comunicaciones comerciales y análisis de la tienda.</li>
              <li><strong>Brevo</strong> — correos transaccionales.</li>
              <li><strong>Holded</strong> — facturación y gestión administrativa.</li>
              <li><strong>Cookiebot</strong> — gestión del consentimiento de cookies.</li>
              <li><strong>Metricool</strong> — medición de audiencia, únicamente con su consentimiento.</li>
              <li><strong>Empresas de transporte</strong> — para la entrega de los pedidos.</li>
              <li><strong>Autoridades públicas</strong> — cuando así lo exija la ley.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-primary">6. Transferencias internacionales</h2>
            <p className="text-gray-700">Algunos de estos proveedores están establecidos fuera del Espacio Económico Europeo, principalmente en Estados Unidos. En esos casos, las transferencias se amparan en las cláusulas contractuales tipo aprobadas por la Comisión Europea o en el Marco de Privacidad de Datos UE-EE. UU., según el proveedor.</p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-primary">7. Conservación de datos</h2>
            <p className="text-gray-700">Conservaremos sus datos durante el tiempo necesario para las finalidades descritas y, en todo caso, durante los plazos legalmente exigidos: seis años para la documentación fiscal y contable, conforme al Código de Comercio.</p>
            <p className="mt-4 text-gray-700">Los datos tratados con su consentimiento se conservarán hasta que lo retire.</p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-primary">8. Sus derechos</h2>
            <p className="mb-4 text-gray-700">Puede ejercer en cualquier momento los siguientes derechos:</p>
            <ul className="list-disc space-y-2 pl-6 text-gray-700">
              <li><strong>Acceso:</strong> conocer qué datos tenemos sobre usted.</li>
              <li><strong>Rectificación:</strong> corregir datos inexactos.</li>
              <li><strong>Supresión:</strong> solicitar la eliminación de sus datos.</li>
              <li><strong>Oposición:</strong> oponerse al tratamiento.</li>
              <li><strong>Limitación:</strong> solicitar la limitación del tratamiento.</li>
              <li><strong>Portabilidad:</strong> recibir sus datos en un formato estructurado y de uso común.</li>
              <li><strong>Retirada del consentimiento:</strong> en cualquier momento, sin que ello afecte a la licitud del tratamiento anterior.</li>
            </ul>
            <p className="mt-4 text-gray-700">Para ejercerlos, escríbanos a <a href="mailto:info@mikels.es">info@mikels.es</a> indicando qué derecho desea ejercer.</p>
            <p className="mt-4 text-gray-700">Si considera que no hemos atendido correctamente su solicitud, puede presentar una reclamación ante la <a href="https://www.aepd.es" target="_blank" rel="noreferrer">Agencia Española de Protección de Datos</a>, autoridad de control competente.</p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-primary">9. Cookies</h2>
            <p className="text-gray-700">Utilizamos cookies y tecnologías similares. Puede gestionar sus preferencias a través del panel de consentimiento que aparece al visitar la web, y modificarlas cuando quiera desde ese mismo panel.</p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-primary">10. Seguridad</h2>
            <p className="text-gray-700">Aplicamos medidas técnicas y organizativas apropiadas para proteger sus datos frente al acceso no autorizado, la pérdida, la destrucción o el daño.</p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-primary">11. Cambios en esta política</h2>
            <p className="text-gray-700">Podemos modificar esta política. Los cambios se publicarán en esta página con su fecha de actualización.</p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-primary">12. Contacto</h2>
            <CompanyLegalBlock className="text-gray-700" />
          </section>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
