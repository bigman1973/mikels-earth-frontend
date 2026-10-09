import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars -- JSX uses the `motion.*` namespace.
import { motion } from 'framer-motion';
import { getSessionStatus } from '../services/stripeService';
import OrderReceipt from '../components/orders/OrderReceipt';
import { useCart } from '../context/CartContext';
import { trackMetaPurchase } from '../utils/metaPixel';

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { clearPaidOrderCart } = useCart();
  const clearedSessionRef = useRef(null);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    let attempts = 0;
    let retryTimer;
    const loadSession = async () => {
      try {
        const data = await getSessionStatus(sessionId);
        if (cancelled) return;
        setSessionData(data);
        attempts += 1;
        // Stripe redirects independently from the webhook. Wait only for the
        // saved paid-order snapshot; never construct a receipt client-side.
        if (data.payment_status === 'paid' && data.order_pending && attempts < 12) {
          retryTimer = window.setTimeout(loadSession, 1000);
          return;
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      }
      if (!cancelled) setLoading(false);
    };

    loadSession();
    return () => {
      cancelled = true;
      if (retryTimer) window.clearTimeout(retryTimer);
    };
  }, [sessionId]);

  const receipt = sessionData?.order?.receipt;
  useEffect(() => {
    // Stripe's redirect is not a payment confirmation. Clear only after the
    // API returns the persisted Receipt for a paid order; on a page reload the
    // same check removes any stale stored cart before it can be repurchased.
    if (!sessionId || !receipt || clearedSessionRef.current === sessionId) return;
    clearPaidOrderCart();
    clearedSessionRef.current = sessionId;
  }, [receipt, sessionId, clearPaidOrderCart]);

  useEffect(() => {
    if (!receipt?.order_number) return undefined;

    const trackPurchase = () => trackMetaPurchase(receipt);
    trackPurchase();
    window.addEventListener('CookiebotOnConsentReady', trackPurchase);
    window.addEventListener('CookiebotOnAccept', trackPurchase);
    return () => {
      window.removeEventListener('CookiebotOnConsentReady', trackPurchase);
      window.removeEventListener('CookiebotOnAccept', trackPurchase);
    };
  }, [receipt]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5efe4]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7f1d2d]" aria-label="Cargando pedido" />
      </div>
    );
  }

  if (!receipt) {
    return (
      <main className="min-h-screen bg-[#f5efe4] py-16">
        <div className="container mx-auto px-4">
          <section className="mx-auto max-w-xl rounded-xl border border-stone-200 bg-white p-8 text-center shadow-sm md:p-12">
            <h1 className="font-serif text-3xl font-semibold text-[#1a1a1a]">Estamos comprobando tu pedido</h1>
            <p className="mt-4 text-stone-700">
              {sessionId
                ? 'El pago puede tardar unos segundos en quedar registrado. Si ya se ha cobrado, recibirás la confirmación por correo cuando terminemos de procesarlo.'
                : 'Para ver los detalles de un pedido necesitamos el enlace de confirmación que recibiste al pagar.'}
            </p>
            <Link to="/contacto" className="mt-8 inline-block rounded-lg bg-[#7f1d2d] px-5 py-3 font-semibold text-white transition-colors hover:bg-[#651725]">
              Contactar con Mikel&apos;s Fruit
            </Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5efe4] py-10 md:py-16">
      <div className="container mx-auto max-w-3xl px-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <OrderReceipt receipt={receipt}>
            <div className="border-t border-stone-200 pt-6 text-center">
              <Link to="/tienda" className="inline-block rounded-lg bg-[#7f1d2d] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#651725]">
                Seguir comprando
              </Link>
            </div>
          </OrderReceipt>
        </motion.div>
      </div>
    </main>
  );
};

export default OrderSuccess;
