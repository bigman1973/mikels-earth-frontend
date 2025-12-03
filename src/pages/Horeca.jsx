import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Phone, Mail, MapPin, MessageSquare, Check, AlertCircle } from 'lucide-react';

const Horeca = () => {
  const [formData, setFormData] = useState({
    establishmentName: '',
    establishmentType: '',
    contactName: '',
    phone: '',
    email: '',
    aceite5L: 0,
    aceiteTemprano: 0,
    street: '',
    city: '',
    postalCode: '',
    province: '',
    comments: '',
    subscribeNewsletter: false,
    acceptPrivacy: false
  });

  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const establishmentTypes = [
    'Restaurante',
    'Hotel',
    'Bar/Cafetería',
    'Catering',
    'Tienda Gourmet',
    'Otro'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación: al menos un producto debe tener cantidad > 0
    if (formData.aceite5L === 0 && formData.aceiteTemprano === 0) {
      setStatus('error');
      setMessage('Por favor, selecciona al menos un producto.');
      return;
    }

    if (!formData.acceptPrivacy) {
      setStatus('error');
      setMessage('Debes aceptar la política de privacidad.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('https://mikels-earth-backend-production.up.railway.app/api/horeca/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('¡Solicitud enviada! Recibirás una propuesta personalizada en tu email en las próximas 24 horas.');
        
        // Resetear formulario
        setFormData({
          establishmentName: '',
          establishmentType: '',
          contactName: '',
          phone: '',
          email: '',
          aceite5L: 0,
          aceiteTemprano: 0,
          street: '',
          city: '',
          postalCode: '',
          province: '',
          comments: '',
          subscribeNewsletter: false,
          acceptPrivacy: false
        });

        // Scroll al mensaje de éxito
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setStatus('error');
        setMessage(data.error || 'Ha ocurrido un error. Por favor, inténtalo de nuevo o contáctanos por WhatsApp.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Error de conexión. Por favor, contáctanos directamente por WhatsApp o email.');
    }
  };

  const whatsappNumber = '436789070062172';
  const whatsappMessage = encodeURIComponent('Hola, estoy interesado en realizar un pedido HORECA para mi establecimiento.');
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div 
        className="relative bg-gradient-to-r from-primary to-green-800 text-white py-20"
        style={{
          backgroundImage: 'linear-gradient(rgba(45, 80, 22, 0.9), rgba(45, 80, 22, 0.9)), url("/images/aceite-5l-cocina.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Building2 className="w-5 h-5" />
              <span className="font-semibold">B2B - Profesionales</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              HORECA - Mikel's Earth
            </h1>
            <p className="text-xl md:text-2xl mb-4 text-green-100">
              Aceite de Calidad Premium para tu Negocio
            </p>
            <p className="text-lg max-w-2xl mx-auto text-green-50">
              Suministro directo del productor para restaurantes, hoteles y establecimientos de hostelería
            </p>
          </motion.div>
        </div>
      </div>

      {/* Mensaje de éxito/error */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto px-4 mt-8"
        >
          <div className={`p-4 rounded-lg flex items-start gap-3 ${
            status === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {status === 'success' ? (
              <Check className="w-6 h-6 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
            )}
            <p>{message}</p>
          </div>
        </motion.div>
      )}

      {/* Productos Disponibles */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-primary mb-12">
          Productos Disponibles para HORECA
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Aceite 5L */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <div className="h-64 bg-gray-200 overflow-hidden">
              <img 
                src="/images/aceite-5l-portada.jpg" 
                alt="Aceite 5L"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <div className="inline-block bg-red-600 text-white text-xs px-3 py-1 rounded-full mb-3">
                Más Vendido
              </div>
              <h3 className="text-2xl font-bold text-primary mb-2">
                Aceite de Oliva Virgen Extra 5L
              </h3>
              <p className="text-gray-600 mb-4">
                Caja de 3 garrafas de 5 litros
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>15 litros en total por caja</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>Variedades Picual, Hojiblanca y Arbequina</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>Prensado en frío, baja acidez</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>Ideal para uso intensivo en cocina</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Aceite Temprano */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <div className="h-64 bg-gray-200 overflow-hidden">
              <img 
                src="/images/aceite-temprano-principal.jpeg" 
                alt="Aceite Temprano"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <div className="inline-block bg-gradient-to-r from-orange-600 to-amber-600 text-white text-xs px-3 py-1 rounded-full mb-3">
                Edición Limitada
              </div>
              <h3 className="text-2xl font-bold text-primary mb-2">
                Aceite Temprano 500ml
              </h3>
              <p className="text-gray-600 mb-4">
                Sin filtrar - Premium
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>Cosecha temprana de aceitunas verdes</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>3x más polifenoles y antioxidantes</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>Verde intenso, ligeramente picante</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>Perfecto para platos premium en crudo</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Formulario de Pedido */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-3xl mx-auto bg-white rounded-lg shadow-xl p-8"
        >
          <h2 className="text-3xl font-bold text-primary mb-2 text-center">
            Solicitar Pedido Profesional
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Rellena el formulario y recibirás una propuesta personalizada por email
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Datos del Establecimiento */}
            <div>
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Datos del Establecimiento
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Establecimiento *
                  </label>
                  <input
                    type="text"
                    name="establishmentName"
                    value={formData.establishmentName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Restaurante El Olivo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Establecimiento *
                  </label>
                  <select
                    name="establishmentType"
                    value={formData.establishmentType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Seleccionar...</option>
                    {establishmentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Datos de Contacto */}
            <div>
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Datos de Contacto
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de Contacto *
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Juan Pérez"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="+34 600 000 000"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="contacto@restaurante.com"
                  />
                </div>
              </div>
            </div>

            {/* Productos */}
            <div>
              <h3 className="text-lg font-semibold text-primary mb-4">
                Productos
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">🫒 Aceite 5L (Caja 3 uds)</p>
                    <p className="text-sm text-gray-600">15 litros en total por caja</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Cantidad:</label>
                    <input
                      type="number"
                      name="aceite5L"
                      value={formData.aceite5L}
                      onChange={handleChange}
                      min="0"
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <span className="text-sm text-gray-600">cajas</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">🍂 Aceite Temprano 500ml</p>
                    <p className="text-sm text-gray-600">Sin filtrar - Edición limitada</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Cantidad:</label>
                    <input
                      type="number"
                      name="aceiteTemprano"
                      value={formData.aceiteTemprano}
                      onChange={handleChange}
                      min="0"
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <span className="text-sm text-gray-600">uds</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dirección de Entrega */}
            <div>
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Dirección de Entrega
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección *
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Calle Principal, 123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Barcelona"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código Postal *
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="08001"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Provincia *
                  </label>
                  <input
                    type="text"
                    name="province"
                    value={formData.province}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Barcelona"
                  />
                </div>
              </div>
            </div>

            {/* Comentarios */}
            <div>
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Comentarios Adicionales (opcional)
              </h3>
              <textarea
                name="comments"
                value={formData.comments}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Horarios de entrega preferidos, necesidades especiales, etc."
              />
            </div>

            {/* Suscripción al Newsletter */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="subscribeNewsletter"
                  checked={formData.subscribeNewsletter}
                  onChange={handleChange}
                  className="mt-1"
                  id="newsletter-checkbox"
                />
                <label htmlFor="newsletter-checkbox" className="text-sm text-gray-700 flex-1">
                  <span className="font-semibold text-primary">✉️ Suscribirme al newsletter</span>
                  <p className="mt-1 text-gray-600">
                    Recibe los mejores consejos, recetas exclusivas y ofertas especiales. 
                    Puedes anular la suscripción en cualquier momento.
                  </p>
                  <p className="mt-2 text-green-700 font-semibold">
                    🎁 ¡Obtén un 10% de descuento en tu primera compra online!
                  </p>
                </label>
              </div>
            </div>

            {/* Política de Privacidad */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                name="acceptPrivacy"
                checked={formData.acceptPrivacy}
                onChange={handleChange}
                required
                className="mt-1"
              />
              <label className="text-sm text-gray-700">
                Acepto la <a href="/politica-privacidad" className="text-primary hover:underline" target="_blank">política de privacidad</a> *
              </label>
            </div>

            {/* Botón Enviar */}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-gradient-to-r from-primary to-green-700 text-white py-4 rounded-lg font-semibold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Enviando...
                </span>
              ) : (
                'Enviar Solicitud de Pedido'
              )}
            </button>
          </form>
        </motion.div>

        {/* Beneficios HORECA */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-primary mb-12">
            ¿Por qué elegir Mikel's Earth HORECA?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <span className="text-3xl">🚚</span>
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">Entrega Directa</h3>
              <p className="text-gray-600">Del campo a tu cocina sin intermediarios</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">Precios Especiales</h3>
              <p className="text-gray-600">Descuentos por volumen para profesionales</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <span className="text-3xl">⭐</span>
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">Calidad Premium</h3>
              <p className="text-gray-600">Aceite de primera prensada en frío</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <span className="text-3xl">📞</span>
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">Atención Personal</h3>
              <p className="text-gray-600">Asesoramiento especializado para tu negocio</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <span className="text-3xl">🌿</span>
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">100% Natural</h3>
              <p className="text-gray-600">Sin aditivos artificiales ni conservantes</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <span className="text-3xl">📦</span>
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">Pedidos Recurrentes</h3>
              <p className="text-gray-600">Facilita tu gestión con entregas programadas</p>
            </motion.div>
          </div>
        </div>

        {/* Información de Contacto */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="mt-20 bg-gradient-to-r from-primary to-green-700 text-white rounded-lg p-8 text-center"
        >
          <h2 className="text-3xl font-bold mb-4">¿Necesitas más información?</h2>
          <p className="text-lg mb-6 text-green-50">
            Nuestro equipo comercial está a tu disposición
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8 text-left max-w-3xl mx-auto">
            <div className="flex items-start gap-3">
              <Mail className="w-6 h-6 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold mb-1">Email</p>
                <a href="mailto:info@mikels.es" className="text-green-100 hover:text-white transition-colors">
                  info@mikels.es
                </a>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Phone className="w-6 h-6 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold mb-1">WhatsApp</p>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="text-green-100 hover:text-white transition-colors">
                  +43 6789 0700 62172
                </a>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <MapPin className="w-6 h-6 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold mb-1">Dirección</p>
                <p className="text-green-100">
                  C/ Cardenal Cisneros, 10<br />
                  Lérida, España
                </p>
              </div>
            </div>
          </div>

          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold transition-all"
          >
            <MessageSquare className="w-5 h-5" />
            Contactar por WhatsApp
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default Horeca;
