import { motion } from 'framer-motion';
import { Calendar, Users, Heart, Mail, Bell } from 'lucide-react';
import { useState } from 'react';

const Experiencias = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    interes: 'visita'
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/experience/workshop-visit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        console.error('Error enviando solicitud');
        alert('Hubo un error al enviar tu solicitud. Por favor, inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Hubo un error al enviar tu solicitud. Por favor, inténtalo de nuevo.');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="bg-white">
      {/* Hero - Próximamente */}
      <section className="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-accent overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNHYyYzAgMi0yIDQtMiA0cy0yLTItMi00di0yem0wLTMwYzAtMiAyLTQgMi00czIgMiAyIDR2MmMwIDItMiA0LTIgNHMtMi0yLTItNHYtMnpNMiAzNGMwLTIgMi00IDItNHMyIDIgMiA0djJjMCAyLTIgNC0yIDRzLTItMi0yLTR2LTJ6bTAtMzBjMC0yIDItNCAyLTRzMiAyIDIgNHYyYzAgMi0yIDQtMiA0cy0yLTItMi00di0yeiIvPjwvZz48L2c+PC9zdmc+')] animate-pulse"></div>
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block mb-6">
              <span className="bg-secondary text-primary px-6 py-2 rounded-full font-bold text-lg">
                Muy Pronto
              </span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 leading-tight">
              Experiencias<br />
              <span className="font-script text-secondary">Mikel's Earth</span>
            </h1>
            
            <p className="text-2xl md:text-3xl text-white/90 mb-6 max-w-3xl mx-auto leading-relaxed">
              Estamos preparando algo muy especial para ti
            </p>
            
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Visitas al obrador, catas de aceite, experiencias en el campo... 
              Pronto podrás vivir la tradición de Mikel's Earth en primera persona.
            </p>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Lo que estamos preparando */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-primary mb-6">
              ¿Qué Estamos Preparando?
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed">
              Queremos que vivas la experiencia completa de Mikel's Earth. 
              Que toques la tierra, que huelas el aceite recién prensado, 
              que pruebes nuestras joyas directamente del obrador.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: <Users className="text-secondary" size={48} />,
                title: "Visitas al Obrador",
                description: "Descubre c\u00f3mo puedes hacer tu propio producto artesanal."
              },
              {
                icon: <Heart className="text-secondary" size={48} />,
                title: "Catas de Aceite",
                description: "Aprende a distinguir los matices de un aceite de oliva virgen extra premium. De la mano de expertos."
              },
              {
                icon: <Calendar className="text-secondary" size={48} />,
                title: "Experiencias en el Campo",
                description: "Vive la cosecha del paraguayo o la recogida de la aceituna. Conecta con la tierra como lo hacemos nosotros."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gradient-to-b from-accent/20 to-white p-8 rounded-xl shadow-lg text-center"
              >
                <div className="flex justify-center mb-6">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold text-primary mb-4">
                  {item.title}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Formulario de Pre-registro */}
      <section className="py-20 bg-gradient-to-b from-white to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-white p-10 rounded-2xl shadow-2xl"
            >
              <div className="text-center mb-8">
                <Bell className="text-secondary mx-auto mb-4" size={56} />
                <h2 className="text-4xl font-bold text-primary mb-4">
                  Sé el Primero en Saberlo
                </h2>
                <p className="text-lg text-gray-700">
                  Déjanos tu email y te avisaremos cuando las experiencias estén disponibles. 
                  Además, tendrás acceso prioritario a las primeras plazas.
                </p>
              </div>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 border-2 border-green-500 rounded-lg p-8 text-center"
                >
                  <div className="text-6xl mb-4">✓</div>
                  <h3 className="text-2xl font-bold text-green-700 mb-2">
                    ¡Gracias por tu interés!
                  </h3>
                  <p className="text-green-600">
                    Te avisaremos en cuanto las experiencias estén disponibles.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-secondary focus:outline-none transition-colors"
                      placeholder="Tu nombre"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-secondary focus:outline-none transition-colors"
                      placeholder="tu@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Teléfono (opcional)
                    </label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-secondary focus:outline-none transition-colors"
                      placeholder="+34 600 000 000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      ¿Qué te interesa más? *
                    </label>
                    <select
                      name="interes"
                      value={formData.interes}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-secondary focus:outline-none transition-colors"
                    >
                      <option value="visita">Visita al obrador</option>
                      <option value="cata">Cata de aceite</option>
                      <option value="campo">Experiencia en el campo</option>
                      <option value="todo">Todo me interesa</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-secondary text-primary px-8 py-4 rounded-lg font-bold text-lg hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Mail size={24} />
                    Avísame Cuando Esté Disponible
                  </button>

                  <p className="text-sm text-gray-500 text-center">
                    * Campos obligatorios. Tus datos están seguros con nosotros.
                  </p>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Galería de adelanto */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-4xl font-bold text-primary mb-4">
              Un Adelanto de lo que Vivirás
            </h2>
            <p className="text-lg text-gray-700">
              Estas son algunas de las experiencias que podrás disfrutar muy pronto
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              { img: '/images/family/jordi-ninos-campo.jpg', title: 'En el campo de paraguayos' },
              { img: '/images/family/familia-campo-paraguayos.jpg', title: 'Visitas familiares' },
              { img: '/images/family/visita-internacional.jpg', title: 'Catas exclusivas' },
              { img: '/images/products/aceite-temprano-campo.jpg', title: 'Aceite recién prensado' },
              { img: '/images/family/nina-campo.jpg', title: 'Experiencias para toda la familia' },
              { img: '/images/products/pack-productos.jpg', title: 'Degustación de productos' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow group"
              >
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex items-end p-6">
                  <p className="text-white font-bold text-lg">{item.title}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Experiencias;

