import { Link } from 'react-router-dom';

const SatisfactionGuarantee = () => (
  <section className="bg-[#f5efe4] py-12 md:py-20">
    <div className="container mx-auto max-w-3xl px-4">
      <article className="rounded-lg bg-white p-7 shadow-sm md:p-10">
        <h1 className="text-3xl font-medium text-primary md:text-4xl">Garantía de satisfacción</h1>
        <div className="mt-8 space-y-5 text-base leading-7 text-gray-700">
          <p className="text-xl font-semibold text-[#1a1a1a]">Pruébalo. Si no te gusta, te devolvemos el dinero.</p>
          <p>Tienes 30 días desde que lo recibes. Escríbenos a <a className="font-medium text-primary underline underline-offset-4" href="mailto:info@mikels.es">info@mikels.es</a> y te devolvemos el importe íntegro, portes incluidos.</p>
          <p><strong>No hace falta que nos devuelvas la botella.</strong> Sin preguntas.</p>
          <p>Esta garantía comercial es adicional y no afecta a tu derecho legal de desistimiento de 14 días.</p>
          <p>Para conocer las condiciones generales de compra y el derecho de desistimiento, consulta nuestros <Link className="font-medium text-primary underline underline-offset-4" to="/terminos">Términos y condiciones</Link>.</p>
        </div>
      </article>
    </div>
  </section>
);

export default SatisfactionGuarantee;
