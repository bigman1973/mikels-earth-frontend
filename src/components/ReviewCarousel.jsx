import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'https://mikels-earth-backend-production.up.railway.app';

const ReviewCarousel = () => {
  const [reviews, setReviews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    if (reviews.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [reviews.length]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${API_URL}/api/reviews/featured?limit=8`);
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

  const nextReview = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={18}
        className={i < rating ? 'text-secondary fill-secondary' : 'text-gray-300'}
      />
    ));
  };

  if (loading || reviews.length === 0) return null;

  return (
    <section className="py-20 bg-accent/5">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Lo Que Dicen Nuestros Clientes
          </h2>
          <p className="text-xl text-gray-600">
            Más de 200 años de tradición, avalados por quienes nos eligen cada día
          </p>
        </div>

        <div className="max-w-3xl mx-auto relative">
          {/* Navigation arrows */}
          {reviews.length > 1 && (
            <>
              <button
                onClick={prevReview}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
                aria-label="Reseña anterior"
              >
                <ChevronLeft size={24} className="text-primary" />
              </button>
              <button
                onClick={nextReview}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
                aria-label="Reseña siguiente"
              >
                <ChevronRight size={24} className="text-primary" />
              </button>
            </>
          )}

          {/* Review card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-8 md:p-12"
            >
              <div className="flex justify-center mb-6">
                <Quote size={40} className="text-secondary/30" />
              </div>

              <div className="flex justify-center gap-1 mb-4">
                {renderStars(reviews[currentIndex].rating)}
              </div>

              <p className="text-lg md:text-xl text-gray-700 text-center leading-relaxed mb-6 italic">
                "{reviews[currentIndex].comment}"
              </p>

              <div className="text-center">
                <p className="font-bold text-primary text-lg">
                  {reviews[currentIndex].customer_name}
                </p>
                <p className="text-gray-500 text-sm">
                  {reviews[currentIndex].product_name}
                  {reviews[currentIndex].is_verified_purchase && (
                    <span className="ml-2 inline-flex items-center text-green-600">
                      ✓ Compra verificada
                    </span>
                  )}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots indicator */}
          {reviews.length > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-primary w-6'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Ir a reseña ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Link to all reviews */}
        <div className="text-center mt-10">
          <Link
            to="/opiniones"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary/80 transition-colors text-lg"
          >
            Ver todas las opiniones →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ReviewCarousel;
