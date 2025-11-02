import { useState } from 'react';
import { Bell, Check, AlertCircle } from 'lucide-react';
import { API_URL } from '../config/api';

const SoldOutNotification = ({ productName }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch(`${API_URL}/notification/notify-me`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_name: productName,
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', phone: '' });
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Error al enviar la solicitud');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('Error de conexión. Por favor, inténtalo de nuevo.');
      console.error('Error:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (status === 'success') {
    return (
      <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
            <Check className="text-white" size={32} />
          </div>
        </div>
        <h3 className="text-xl font-bold text-green-800 mb-2">
          ¡Solicitud Recibida!
        </h3>
        <p className="text-green-700">
          Te avisaremos por email cuando el producto esté disponible.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border-2 border-amber-500 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <Bell className="text-amber-600" size={24} />
        <div>
          <h3 className="text-lg font-bold text-amber-900">
            Producto en Cosecha
          </h3>
          <p className="text-sm text-amber-700">
            Estará disponible pronto. Te avisamos cuando llegue.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Tu nombre"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono (opcional)
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="+34 600 000 000"
          />
        </div>

        {status === 'error' && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle size={20} />
            <span className="text-sm">{errorMessage}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {status === 'loading' ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Enviando...
            </>
          ) : (
            <>
              <Bell size={20} />
              Avísame cuando esté disponible
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default SoldOutNotification;

