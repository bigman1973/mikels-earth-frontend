const DetailBlock = ({ title, children }) => (
  <section className="border-t border-stone-200 pt-5">
    <h2 className="mb-2 font-serif text-lg font-semibold text-[#1a1a1a]">{title}</h2>
    <div className="space-y-1 text-sm leading-6 text-stone-700">{children}</div>
  </section>
);

const OrderReceipt = ({ receipt, children }) => {
  if (!receipt) return null;
  const totals = receipt.totals || {};
  const shipping = receipt.shipping || {};
  const billing = receipt.billing || {};
  const confirmation = receipt.confirmation || {};

  return (
    <article className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
      <header className="border-b border-stone-200 bg-[#f5efe4] px-6 py-7 text-center sm:px-10">
        <img
          className="mx-auto h-auto w-36"
          src={receipt.brand?.logo_url || '/logo-mikels-fruit.png'}
          alt={receipt.brand?.name || "Mikel's Fruit"}
        />
      </header>

      <div className="space-y-6 px-6 py-7 sm:px-10">
        <section>
          <h1 className="font-serif text-3xl font-semibold text-[#1a1a1a]">{receipt.heading || 'Pedido confirmado'}</h1>
          <dl className="mt-4 grid grid-cols-1 gap-2 text-sm text-stone-700 sm:grid-cols-2">
            <div><dt className="font-medium text-[#1a1a1a]">Número de pedido</dt><dd>{receipt.order_number}</dd></div>
            <div><dt className="font-medium text-[#1a1a1a]">Fecha y hora</dt><dd>{receipt.paid_at_display}</dd></div>
          </dl>
        </section>

        <DetailBlock title="Productos">
          <div className="divide-y divide-stone-200 border-y border-stone-200">
            {(receipt.lines || []).map((line, index) => (
              <div className="flex items-start justify-between gap-4 py-3" key={`${line.name}-${index}`}>
                <p className="text-[#1a1a1a]">
                  {line.name} <span className="text-stone-600">× {line.quantity}</span>
                </p>
                <p className="shrink-0 font-medium text-[#1a1a1a]">{line.amount_display}</p>
              </div>
            ))}
          </div>
        </DetailBlock>

        <section className="space-y-2 border-t border-stone-200 pt-5 text-sm">
          <div className="flex justify-between text-stone-700"><span>Subtotal</span><span>{totals.subtotal_display}</span></div>
          <div className="flex justify-between text-stone-700"><span>Envío</span><span>{totals.shipping_display || 'GRATIS'}</span></div>
          <div className="flex justify-between text-stone-700"><span>IVA</span><span>{totals.tax_display}</span></div>
          <div className="flex justify-between border-t border-stone-300 pt-3 font-semibold text-[#1a1a1a]"><span>Total</span><span className="text-price">{totals.total_display}</span></div>
        </section>

        <DetailBlock title="Dirección de envío">
          {(shipping.lines || []).map((line) => <p key={line}>{line}</p>)}
          {shipping.phone && <p>Teléfono: {shipping.phone}</p>}
        </DetailBlock>

        {billing.requested && (
          <DetailBlock title="Datos de factura">
            {(billing.lines || []).map((line) => <p key={line}>{line}</p>)}
          </DetailBlock>
        )}

        <DetailBlock title="Confirmación por correo">
          <p>
            {confirmation.sent
              ? `Te hemos enviado la confirmación a ${confirmation.email}.`
              : `Estamos preparando la confirmación para ${confirmation.email}.`}
          </p>
        </DetailBlock>

        <DetailBlock title="Próximos pasos">
          <ol className="list-decimal space-y-1 pl-5">
            {(receipt.next_steps || []).map((step) => <li key={step}>{step}</li>)}
          </ol>
        </DetailBlock>

        {children}
      </div>
    </article>
  );
};

export default OrderReceipt;
