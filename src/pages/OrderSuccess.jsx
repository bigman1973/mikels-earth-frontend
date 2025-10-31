import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Package, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { getSessionStatus } from '../services/stripeService';

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      // Fetch session status from backend
      getSessionStatus(sessionId)
        .then(data => {
          setSessionData(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching session:', err);
          setLoading(false);
        });
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
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
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          </motion.div>

          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            ¡Pedido Confirmado!
          </h1>

          <p className="text-lg text-gray-700 mb-8">
            Gracias por tu compra. Hemos recibido tu pedido correctamente.
          </p>

          {sessionData?.customer_email && (
            <div className="bg-accent/30 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center gap-2 text-primary mb-2">
                <Mail className="w-5 h-5" />
                <span className="font-semibold">Confirmación enviada a:</span>
              </div>
              <p className="text-gray-700">{sessionData.customer_email}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <Package className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-primary mb-2">
                Preparación del Pedido
              </h3>
              <p className="text-sm text-gray-600">
                Comenzaremos a preparar tu pedido de inmediato
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <Mail className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-primary mb-2">
                Seguimiento
              </h3>
              <p className="text-sm text-gray-600">
                Te enviaremos actualizaciones por email
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              to="/productos"
              className="block w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Seguir Comprando
            </Link>
            <Link
              to="/"
              className="block w-full bg-white border-2 border-primary text-primary py-3 rounded-lg font-semibold hover:bg-primary/5 transition-colors"
            >
              Volver al Inicio
            </Link>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              ¿Tienes alguna pregunta sobre tu pedido?
            </p>
            <Link to="/contacto" className="text-primary hover:underline font-semibold">
              Contáctanos
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderSuccess;

