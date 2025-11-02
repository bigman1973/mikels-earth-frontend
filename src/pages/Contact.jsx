import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/contact/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        setSubmitted(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: ''
        });
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        console.error('Error enviando mensaje');
        alert('Hubo un error al enviar tu mensaje. Por favor, inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Hubo un error al enviar tu mensaje. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-primary mb-4 text-center">
          Contacto
        </h1>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          ¿Tienes alguna pregunta? Completa el formulario y te responderemos por email en menos de 24 horas
        </p>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Información de contacto */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-semibold text-primary mb-6">
                Mikel's by Farms Planet SL
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Dirección</p>
                    <p className="text-gray-600">
                      Carrer Cardenal Cisneros, 10<br />
                      Lérida, España
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Email</p>
                    <a 
                      href="mailto:info@mikels.es" 
                      className="text-primary hover:underline"
                    >
                      info@mikels.es
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">WhatsApp</p>
                    <a 
                      href="https://wa.me/436789070062172" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      +43 6789 0700 62172
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary text-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-3">Horario de Atención</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Lunes a Viernes:</strong> 9:00 - 18:00</p>
                <p><strong>Sábados:</strong> 10:00 - 14:00</p>
                <p><strong>Domingos:</strong> Cerrado</p>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold text-primary mb-6">
              Envíanos un Mensaje
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo *
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
                  Teléfono
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="+34 XXX XXX XXX"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Mensaje *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  placeholder="Escribe tu mensaje aquí..."
                ></textarea>
              </div>

              {submitted ? (
                <div className="bg-green-50 border border-green-500 rounded-lg p-4 text-center">
                  <p className="text-green-700 font-semibold">
                    ✓ ¡Mensaje enviado! Te responderemos pronto.
                  </p>
                </div>
              ) : (
                <>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                    {loading ? 'Enviando...' : 'Enviar Mensaje'}
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    Te responderemos por email en menos de 24 horas
                  </p>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

