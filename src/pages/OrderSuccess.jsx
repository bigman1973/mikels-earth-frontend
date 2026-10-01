import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Package, Mail, MapPin } from 'lucide-react';
// eslint-disable-next-line no-unused-vars -- JSX uses the `motion.*` namespace.
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getSessionStatus } from '../services/stripeService';

const formatEuro = (amount) => new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}).format(Number(amount || 0));

const OrderSuccess = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);

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
        // Stripe redirects the customer independently of the webhook. Wait a
        // short, bounded period for the saved paid order so the confirmation
        // can show the actual number, lines and delivery address.
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary" />
      </div>
    );
  }

  const order = sessionData?.order;
  const shippingAddress = order && [
    order.shipping_address,
    [order.shipping_postal_code, order.shipping_city].filter(Boolean).join(' '),
    order.shipping_country,
  ].filter(Boolean);

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <section className="mx-auto max-w-xl rounded-lg bg-white p-8 text-center shadow-lg md:p-12">
            <h1 className="mb-4 text-3xl font-bold text-primary">Estamos comprobando tu pedido</h1>
            <p className="mb-8 text-gray-700">
              {sessionId
                ? 'El pago puede tardar unos segundos en quedar registrado. Si ya se ha cobrado, recibirás la confirmación por correo cuando terminemos de procesarlo.'
                : 'Para ver los detalles de un pedido necesitamos el enlace de confirmación que recibiste al pagar.'}
            </p>
            <Link to="/contacto" className="inline-block rounded-lg bg-primary px-5 py-3 font-semibold text-white transition-colors hover:bg-primary/90">
              Contactar con Mikel\'s Fruit
            </Link>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 md:p-12 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          </motion.div>

          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            {t('order_success.title', { defaultValue: '¡Pedido Confirmado!' })}
          </h1>
          <p className="text-lg text-gray-700 mb-8">
            {t('order_success.subtitle', { defaultValue: 'Gracias por tu compra. Hemos recibido tu pedido correctamente.' })}
          </p>

          {order?.order_number && (
            <p className="mb-6 text-sm text-gray-600">
              Número de pedido: <span className="font-semibold text-primary">{order.order_number}</span>
            </p>
          )}

          {sessionData?.customer_email && (
            <div className="bg-accent/30 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center gap-2 text-primary mb-2">
                <Mail className="w-5 h-5" />
                <span className="font-semibold">
                  {sessionData.confirmation_sent
                    ? t('order_success.confirmation_sent', { defaultValue: 'Confirmación enviada a:' })
                    : 'Estamos preparando la confirmación para:'}
                </span>
              </div>
              <p className="text-gray-700">{sessionData.customer_email}</p>
            </div>
          )}

          {order && (
            <div className="text-left border border-gray-200 rounded-lg p-5 mb-8 space-y-5">
              <div>
                <h2 className="font-semibold text-primary mb-3">Resumen del pedido</h2>
                <div className="space-y-3">
                  {(order.items || []).map((item, index) => (
                    <div key={`${item.sku || item.name}-${index}`} className="flex justify-between gap-4 text-sm">
                      <span className="text-gray-700">{item.name} <span className="text-gray-500">× {item.quantity}</span></span>
                      <span className="font-medium text-primary whitespace-nowrap">{formatEuro(Number(item.price) * Number(item.quantity || 1))}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatEuro(order.subtotal)}</span></div>
                  <div className="flex justify-between text-gray-600"><span>Envío</span><span>{Number(order.shipping_cost) === 0 ? 'Gratis' : formatEuro(order.shipping_cost)}</span></div>
                  <div className="flex justify-between font-bold text-primary text-base"><span>Total</span><span>{formatEuro(order.total)}</span></div>
                </div>
              </div>
              {shippingAddress?.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-primary mb-2"><MapPin className="w-4 h-4" /><h2 className="font-semibold">Dirección de envío</h2></div>
                  {shippingAddress.map((line) => <p key={line} className="text-sm text-gray-700">{line}</p>)}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <Package className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-primary mb-2">{t('order_success.order_prep', { defaultValue: 'Preparación del Pedido' })}</h3>
              <p className="text-sm text-gray-600">{t('order_success.order_prep_desc', { defaultValue: 'Comenzaremos a preparar tu pedido de inmediato' })}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <Mail className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-primary mb-2">{t('order_success.tracking', { defaultValue: 'Seguimiento' })}</h3>
              <p className="text-sm text-gray-600">{t('order_success.tracking_desc', { defaultValue: 'Te enviaremos actualizaciones por email' })}</p>
            </div>
          </div>

          <div className="space-y-3">
            <Link to="/tienda" className="block w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
              {t('order_success.continue_shopping', { defaultValue: 'Seguir Comprando' })}
            </Link>
            <Link to="/" className="block w-full bg-white border-2 border-primary text-primary py-3 rounded-lg font-semibold hover:bg-primary/5 transition-colors">
              {t('order_success.back_home', { defaultValue: 'Volver al Inicio' })}
            </Link>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600">{t('order_success.question', { defaultValue: '¿Tienes alguna pregunta sobre tu pedido?' })}</p>
            <Link to="/contacto" className="text-primary hover:underline font-semibold">{t('products.contact_us')}</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderSuccess;
