import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Star, CheckCircle, Send, Info } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://mikels-earth-backend-production.up.railway.app';

// Productos disponibles para reseñar
const PRODUCTS = [
  { slug: 'aceite-temprano-500ml', name: 'Aceite de Oliva Virgen Extra Temprano 500ml' },
  { slug: 'aceite-5l', name: 'Aceite de Oliva Virgen Extra 5L' },
  { slug: 'paraguayo-almibar', name: 'Paraguayo en Almíbar' },
  { slug: 'nectarina-almibar', name: 'Nectarina en Almíbar' },
  { slug: 'mermelada-paraguayo', name: 'Mermelada de Paraguayo Artesanal' },
  { slug: 'pack-degustacion', name: 'Pack Degustación Premium' },
  { slug: 'pack-temprano', name: 'Pack Temprano Premium' },
  { slug: 'pack-fruta', name: 'Pack Fruta Premium' },
  { slug: 'pack-completo', name: 'Pack Completo Mikel\'s Earth' },
  { slug: 'estuche-regalo', name: 'Estuche de Regalo Premium' },
];

const Opiniones = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  
  // Formulario
  const [showForm, setShowForm] = useState(false);

  // Auto-abrir formulario si viene con #nueva-resena
  useEffect(() => {
    if (window.location.hash === '#nueva-resena') {
      setShowForm(true);
      setTimeout(() => {
        document.getElementById('nueva-resena')?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, []);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    product_slug: '',
    product_name: '',
    rating: 0,
    title: '',
    comment: '',
    order_number: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [filter, sort]);

  const fetchReviews = async () => {
    try {
      let url = `${API_URL}/api/reviews?sort=${sort}&limit=50`;
      if (filter !== 'all') {
        url += `&product_slug=${filter}`;
      }
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/reviews/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleProductChange = (slug) => {
    const product = PRODUCTS.find(p => p.slug === slug);
    setFormData(prev => ({
      ...prev,
      product_slug: slug,
      product_name: product ? product.name : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.rating === 0) {
      setSubmitResult({ success: false, message: 'Por favor, selecciona una puntuación' });
      return;
    }
    
    if (!formData.product_slug) {
      setSubmitResult({ success: false, message: 'Por favor, selecciona un producto' });
      return;
    }

    setSubmitting(true);
    setSubmitResult(null);

    try {
      const response = await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitResult({
          success: true,
          message: data.message,
          coupon: data.coupon_code
        });
        setFormData({
          customer_name: '',
          customer_email: '',
          product_slug: '',
          product_name: '',
          rating: 0,
          title: '',
          comment: '',
          order_number: ''
        });
        // Refresh reviews
        setTimeout(() => {
          fetchReviews();
          fetchStats();
        }, 1000);
      } else {
        setSubmitResult({ success: false, message: data.error || 'Error al enviar la reseña' });
      }
    } catch (error) {
      setSubmitResult({ success: false, message: 'Error de conexión. Inténtalo de nuevo.' });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating, size = 16) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={size}
        className={i < rating ? 'text-secondary fill-secondary' : 'text-gray-300'}
      />
    ));
  };

  const renderInteractiveStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => setFormData(prev => ({ ...prev, rating: i + 1 }))}
        onMouseEnter={() => setHoverRating(i + 1)}
        onMouseLeave={() => setHoverRating(0)}
        className="p-1 transition-transform hover:scale-110"
      >
        <Star
          size={32}
          className={
            i < (hoverRating || formData.rating)
              ? 'text-secondary fill-secondary'
              : 'text-gray-300'
          }
        />
      </button>
    ));
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white min-h-screen">
      <Helmet>
        <title>Opiniones de Clientes | Mikel's Earth</title>
        <meta name="description" content="Lee las opiniones de nuestros clientes sobre los productos artesanales de Mikel's Earth. Aceite de oliva, conservas y más desde 1819." />
      </Helmet>

      {/* Hero */}
      <section className="bg-primary py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Opiniones de Nuestros Clientes
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              La mejor recomendación es la de quienes ya nos han probado
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      {stats && stats.total_reviews > 0 && (
        <section className="py-10 border-b">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-primary">{stats.average_rating}</div>
                <div className="flex justify-center gap-1 mt-2">
                  {renderStars(Math.round(stats.average_rating), 20)}
                </div>
                <p className="text-gray-500 mt-1">de 5 estrellas</p>
              </div>
              <div className="text-center md:border-l md:pl-8">
                <div className="text-3xl font-bold text-primary">{stats.total_reviews}</div>
                <p className="text-gray-500">opiniones de clientes</p>
              </div>
              <div className="hidden md:block md:border-l md:pl-8">
                {[5, 4, 3, 2, 1].map(star => (
                  <div key={star} className="flex items-center gap-2 text-sm">
                    <span className="w-3">{star}</span>
                    <Star size={12} className="text-secondary fill-secondary" />
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-secondary rounded-full"
                        style={{
                          width: `${stats.total_reviews > 0 ? (stats.rating_distribution[star] / stats.total_reviews) * 100 : 0}%`
                        }}
                      />
                    </div>
                    <span className="text-gray-500 w-6">{stats.rating_distribution[star]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Nota de transparencia sobre Compra Verificada */}
      <section className="py-6 border-b bg-green-50/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <details className="group">
              <summary className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-gray-800 transition-colors">
                <Info size={16} className="text-green-600" />
                <span>¿Qué significa <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full font-medium"><CheckCircle size={10} /> Compra verificada</span>?</span>
              </summary>
              <div className="mt-3 pl-6 text-sm text-gray-600 leading-relaxed space-y-2">
                <p>
                  El distintivo <strong className="text-green-700">“Compra verificada”</strong> indica que hemos podido confirmar que la persona que deja la opinión ha realizado una compra real en nuestra tienda. 
                  Nuestro sistema cruza automáticamente el email del autor de la reseña con nuestros registros de pedidos completados.
                </p>
                <p>
                  Las opiniones que no llevan este distintivo son igualmente válidas y reales — simplemente no hemos podido vincularlas automáticamente a un pedido 
                  (por ejemplo, si el cliente usó un email diferente al de su compra, o si dejó la opinión desde el formulario público).
                </p>
                <p className="text-xs text-gray-500 italic">
                  Todas las opiniones publicadas son revisadas por nuestro equipo antes de aparecer en la web. No editamos ni censuramos opiniones negativas.
                </p>
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* Filters + CTA */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap gap-3">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="all">Todos los productos</option>
                {PRODUCTS.map(p => (
                  <option key={p.slug} value={p.slug}>{p.name}</option>
                ))}
              </select>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="newest">Más recientes</option>
                <option value="highest">Mejor puntuación</option>
                <option value="lowest">Menor puntuación</option>
              </select>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-secondary text-white px-6 py-3 rounded-lg font-semibold hover:bg-secondary/90 transition-colors inline-flex items-center gap-2"
            >
              <Send size={18} />
              Dejar mi opinión
            </button>
          </div>
        </div>
      </section>

      {/* Review Form */}
      <div id="nueva-resena"></div>
      <AnimatePresence>
        {showForm && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="container mx-auto px-4 py-10">
              <div className="max-w-2xl mx-auto bg-accent/5 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-primary mb-2">Comparte tu experiencia</h3>
                <p className="text-gray-600 mb-6">
                  Tu opinión nos ayuda a mejorar y ayuda a otros a descubrir nuestros productos.
                  <span className="block mt-1 text-secondary font-semibold">
                    ¡Recibirás un cupón del 10% de descuento como agradecimiento!
                  </span>
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                      <input
                        type="text"
                        required
                        value={formData.customer_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        placeholder="Tu nombre"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        required
                        value={formData.customer_email}
                        onChange={(e) => setFormData(prev => ({ ...prev, customer_email: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        placeholder="tu@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Producto *</label>
                    <select
                      required
                      value={formData.product_slug}
                      onChange={(e) => handleProductChange(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="">Selecciona un producto</option>
                      {PRODUCTS.map(p => (
                        <option key={p.slug} value={p.slug}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Puntuación *</label>
                    <div className="flex gap-1">
                      {renderInteractiveStars()}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título (opcional)</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="Resume tu experiencia en una frase"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tu opinión *</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.comment}
                      onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                      placeholder="Cuéntanos qué te ha parecido el producto... (mínimo 10 caracteres)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nº de pedido (opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.order_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, order_number: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="MKE-XXXX (para verificar tu compra)"
                    />
                  </div>

                  {submitResult && (
                    <div className={`p-4 rounded-lg ${submitResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                      <p className="font-medium">{submitResult.message}</p>
                      {submitResult.coupon && (
                        <p className="mt-2">
                          Tu código de descuento: <span className="font-bold text-lg">{submitResult.coupon}</span>
                        </p>
                      )}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Enviando...' : 'Enviar mi opinión'}
                  </button>
                </form>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
                <p className="text-gray-500 mt-4">Cargando opiniones...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Aún no hay opiniones para este filtro.</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 text-secondary font-semibold hover:text-secondary/80"
                >
                  ¡Sé el primero en opinar!
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review, index) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-primary">{review.customer_name}</span>
                          {review.is_verified_purchase && (
                            <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                              <CheckCircle size={12} />
                              Compra verificada
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{review.product_name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-sm text-gray-400">
                          {formatDate(review.created_at)}
                        </span>
                      </div>
                    </div>
                    
                    {review.title && (
                      <h4 className="font-semibold text-gray-800 mt-3">{review.title}</h4>
                    )}
                    <p className="text-gray-700 mt-2 leading-relaxed">{review.comment}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA to leave review */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-primary mb-4">
            ¿Has probado nuestros productos?
          </h2>
          <p className="text-lg text-gray-600 mb-6 max-w-xl mx-auto">
            Comparte tu experiencia y recibe un <span className="font-bold text-secondary">10% de descuento</span> en tu próxima compra como agradecimiento.
          </p>
          <button
            onClick={() => { setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="bg-secondary text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-secondary/90 transition-colors inline-flex items-center gap-2"
          >
            <Star size={20} />
            Dejar mi opinión
          </button>
        </div>
      </section>
    </div>
  );
};

export default Opiniones;
