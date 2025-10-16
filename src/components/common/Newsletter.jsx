import { useState } from 'react';
import { Mail, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Newsletter = ({ variant = 'default' }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Aquí se conectará con Brevo/backend
    console.log('Newsletter subscription:', email);
    
    // Simular envío
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setEmail('');
      
      // Reset después de 5 segundos
      setTimeout(() => setSubmitted(false), 5000);
    }, 1000);
  };

  if (variant === 'footer') {
    return (
      <div className="bg-primary/5 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-3">
          <Mail className="text-secondary" size={24} />
          <h3 className="text-lg font-bold text-primary">Newsletter</h3>
        </div>
        <p className="text-sm text-gray-700 mb-4">
          Recibe nuestras novedades, recetas exclusivas y ofertas especiales
        </p>
        
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-green-50 border border-green-500 rounded-lg p-3 text-center"
            >
              <p className="text-green-700 font-semibold text-sm">
                ✓ ¡Gracias por suscribirte!
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="flex gap-2"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-secondary focus:outline-none text-sm"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-secondary text-primary px-4 py-2 rounded-lg font-bold hover:bg-secondary/90 transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                <Send size={16} />
                {loading ? '...' : 'OK'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Variant 'inline' para usar en páginas
  return (
    <div className="bg-gradient-to-r from-primary to-accent p-8 md:p-12 rounded-2xl shadow-2xl">
      <div className="max-w-2xl mx-auto text-center">
        <Mail className="text-secondary mx-auto mb-4" size={48} />
        <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Únete a Nuestra Familia
        </h3>
        <p className="text-lg text-white/90 mb-6">
          Recibe recetas exclusivas, historias de nuestra tierra y ofertas especiales 
          directamente en tu bandeja de entrada
        </p>
        
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg p-6"
            >
              <div className="text-5xl mb-3">✓</div>
              <p className="text-2xl font-bold text-green-700 mb-2">
                ¡Bienvenido a la familia!
              </p>
              <p className="text-gray-600">
                Revisa tu email para confirmar tu suscripción
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
                className="flex-1 px-4 py-3 border-2 border-white/30 bg-white/10 text-white placeholder-white/60 rounded-lg focus:border-secondary focus:outline-none backdrop-blur-sm"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-secondary text-primary px-6 py-3 rounded-lg font-bold hover:bg-secondary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Send size={20} />
                {loading ? 'Enviando...' : 'Suscribirme'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
        
        {!submitted && (
          <p className="text-white/70 text-sm mt-4">
            No spam. Solo contenido de calidad. Cancela cuando quieras.
          </p>
        )}
      </div>
    </div>
  );
};

export default Newsletter;

