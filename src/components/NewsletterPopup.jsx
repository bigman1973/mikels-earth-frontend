import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Mail, Gift, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NewsletterPopup = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showSuccess, setShowSuccess] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check if popup was already shown today
    const popupData = localStorage.getItem('newsletter_popup_shown');
    
    if (popupData) {
      const { timestamp } = JSON.parse(popupData);
      const now = Date.now();
      const oneDayInMs = 24 * 60 * 60 * 1000; // 24 horas
      
      // Si han pasado menos de 24 horas, no mostrar
      if (now - timestamp < oneDayInMs) {
        return;
      }
    }
    
    // Show popup after 3 seconds
    const timer = setTimeout(() => {
      setIsOpen(true);
      localStorage.setItem('newsletter_popup_shown', JSON.stringify({
        timestamp: Date.now()
      }));
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    if (showSuccess) {
      navigate('/tienda');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setMessage({ text: '', type: '' });
  };

  const handleCopyCoupon = async () => {
    try {
      await navigator.clipboard.writeText(couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = couponCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.firstName.trim()) {
      setMessage({ text: 'Por favor, introduce tu nombre', type: 'error' });
      return;
    }
    if (!formData.lastName.trim()) {
      setMessage({ text: 'Por favor, introduce tus apellidos', type: 'error' });
      return;
    }
    if (!formData.email || !formData.email.includes('@')) {
      setMessage({ text: 'Por favor, introduce un email válido', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone || undefined,
          source: 'popup'
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setShowSuccess(true);
        setCouponCode(data.coupon_code || '');
        setMessage({ 
          text: '¡Suscripción exitosa!', 
          type: 'success' 
        });
      } else {
        setMessage({ 
          text: data.message || 'Error al suscribirse. Inténtalo de nuevo.', 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      setMessage({ 
        text: 'Error de conexión. Por favor, inténtalo más tarde.', 
        type: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Popup */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-3 right-3 z-10 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              {/* Content */}
              <div className="p-6">
                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <Mail className="w-8 h-8 text-primary" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Gift className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-primary text-center mb-2">
                  ¡Obtén un 10% de descuento!
                </h2>
                <p className="text-gray-600 text-center mb-6">
                  Suscríbete a nuestro newsletter y recibe un cupón de bienvenida
                </p>

                {!showSuccess ? (
                  /* Form */
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Nombre *"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                        disabled={isSubmitting}
                      />
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Apellidos *"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="tu@email.com *"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Teléfono (opcional)"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        disabled={isSubmitting}
                      />
                    </div>

                    {message.text && (
                      <div className={`text-sm text-center ${
                        message.type === 'success' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {message.text}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Suscribiendo...' : 'Obtener mi cupón'}
                    </button>

                    <p className="text-xs text-gray-500 text-center">
                      Al suscribirte, aceptas recibir emails de Mikel's Earth
                    </p>
                  </form>
                ) : (
                  /* Success state con cupón */
                  <div className="text-center space-y-4">
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-5">
                      <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Gift className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-green-800 mb-2">
                        ¡Bienvenido/a a Mikel's Earth!
                      </h3>
                      <p className="text-green-700 mb-4">
                        Aquí tienes tu cupón de <strong>10% de descuento</strong>:
                      </p>
                      
                      {/* Cupón con botón de copiar */}
                      {couponCode && (
                        <div className="bg-white border-2 border-dashed border-primary rounded-lg p-3 mb-3">
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-xl font-bold text-primary tracking-wider">
                              {couponCode}
                            </span>
                            <button
                              onClick={handleCopyCoupon}
                              className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                              title="Copiar cupón"
                            >
                              {copied ? (
                                <Check className="w-5 h-5 text-green-600" />
                              ) : (
                                <Copy className="w-5 h-5 text-primary" />
                              )}
                            </button>
                          </div>
                          {copied && (
                            <p className="text-xs text-green-600 mt-1">¡Copiado!</p>
                          )}
                        </div>
                      )}

                      <p className="text-sm text-green-600">
                        También te lo hemos enviado por email
                      </p>
                    </div>

                    <button
                      onClick={handleClose}
                      className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      ¡Empezar a comprar!
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NewsletterPopup;
