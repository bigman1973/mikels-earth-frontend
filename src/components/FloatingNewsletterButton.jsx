import { useState, useEffect } from 'react';
import { Mail, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingNewsletterButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const toggleVisibility = () => {
      // Mostrar el botón después de hacer scroll 300px
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (status === 'error') {
      setMessage('');
      setStatus('idle');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.firstName.trim()) {
      setStatus('error');
      setMessage('Por favor, introduce tu nombre');
      return;
    }
    if (!formData.lastName.trim()) {
      setStatus('error');
      setMessage('Por favor, introduce tus apellidos');
      return;
    }
    if (!formData.email || !formData.email.includes('@')) {
      setStatus('error');
      setMessage('Por favor, introduce un email válido');
      return;
    }
    
    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('https://api.mikels.es/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone || undefined,
          source: 'floating_button'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('¡Gracias por suscribirte! Revisa tu email para ver tu cupón.');
        setFormData({ firstName: '', lastName: '', email: '', phone: '' });
        
        // Cerrar el modal después de 3 segundos
        setTimeout(() => {
          setIsModalOpen(false);
          setStatus('idle');
          setMessage('');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Ha ocurrido un error. Por favor, inténtalo de nuevo.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Error de conexión. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    <>
      {/* Botón flotante */}
      <AnimatePresence>
        {isVisible && !isModalOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 100 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsModalOpen(true)}
            className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-primary to-green-700 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 group"
            aria-label="Suscribirse al newsletter"
          >
            <div className="flex items-center gap-2">
              <Mail className="w-6 h-6" />
              <span className="hidden md:block font-semibold pr-2">Newsletter</span>
            </div>
            
            {/* Badge de descuento */}
            <span className="absolute -top-2 -left-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg animate-pulse">
              🎁 10% DTO
            </span>
            
            {/* Efecto de pulso */}
            <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Modal de suscripción */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Botón cerrar */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Contenido del modal */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-green-700 rounded-full mb-4">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-primary mb-2">
                  Únete a Nuestra Familia
                </h2>
                
                {/* Destacar beneficio del descuento */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 rounded-lg p-3 mb-3">
                  <p className="text-green-800 font-bold text-lg">
                    🎁 ¡Obtén un 10% de descuento!
                  </p>
                  <p className="text-green-700 text-sm mt-1">
                    Al suscribirte recibirás un cupón único para tu primera compra online
                  </p>
                </div>
                
                <p className="text-gray-600 text-sm">
                  Además: recetas exclusivas, historias de nuestra tierra y ofertas especiales
                </p>
              </div>

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Nombre *"
                    disabled={status === 'loading' || status === 'success'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                  />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Apellidos *"
                    disabled={status === 'loading' || status === 'success'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu@email.com *"
                    required
                    disabled={status === 'loading' || status === 'success'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Teléfono (opcional)"
                    disabled={status === 'loading' || status === 'success'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Mensaje de estado */}
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg text-sm ${
                      status === 'success'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {message}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading' || status === 'success'}
                  className="w-full bg-gradient-to-r from-primary to-green-700 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Suscribiendo...
                    </span>
                  ) : status === 'success' ? (
                    '¡Suscrito! ✓'
                  ) : (
                    'Suscribirme'
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  No spam. Solo contenido de calidad. Cancela cuando quieras.
                </p>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingNewsletterButton;
