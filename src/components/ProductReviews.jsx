import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, MessageSquare } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.mikels.es';

const StarRating = ({ rating }) => {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
};

const ProductReviews = ({ productSlug, productName }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/reviews?product_slug=${productSlug}&limit=5`
        );
        if (response.ok) {
          const data = await response.json();
          setReviews(data.reviews);
        }

        // Obtener stats del producto
        const statsResponse = await fetch(
          `${API_URL}/api/reviews/stats?product_slug=${productSlug}`
        );
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    if (productSlug) {
      fetchReviews();
    }
  }, [productSlug]);

  if (loading) {
    return null;
  }

  if (!stats || stats.total_reviews === 0) {
    return (
      <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
        <h3 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
          <MessageSquare className="w-6 h-6" />
          Opiniones de clientes
        </h3>
        <p className="text-gray-500 mb-4">
          Aún no hay opiniones para este producto. ¡Sé el primero en dejar la tuya!
        </p>
        <Link
          to="/opiniones"
          className="inline-flex items-center gap-2 text-sm font-medium text-white px-4 py-2 rounded-lg transition-colors"
          style={{ backgroundColor: 'var(--mikels-red)' }}
        >
          Dejar mi opinión
        </Link>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
      {/* Header con stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h3 className="text-2xl font-bold text-primary flex items-center gap-2">
          <MessageSquare className="w-6 h-6" />
          Opiniones de clientes
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <StarRating rating={Math.round(stats.average_rating)} />
            <span className="text-lg font-bold text-primary ml-1">
              {stats.average_rating}
            </span>
          </div>
          <span className="text-sm text-gray-500">
            ({stats.total_reviews} {stats.total_reviews === 1 ? 'opinión' : 'opiniones'})
          </span>
        </div>
      </div>

      {/* Lista de reseñas */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="border-b border-gray-100 pb-4 last:border-0 last:pb-0"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-primary text-sm">
                  {review.customer_name}
                </span>
                {review.is_verified_purchase && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    Compra verificada
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-400">
                {formatDate(review.created_at)}
              </span>
            </div>
            <StarRating rating={review.rating} />
            <p className="text-gray-600 text-sm mt-2 leading-relaxed">
              {review.comment}
            </p>
          </div>
        ))}
      </div>

      {/* Footer con link */}
      <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Link
          to="/opiniones"
          className="text-sm font-medium hover:underline"
          style={{ color: 'var(--mikels-red)' }}
        >
          Ver todas las opiniones →
        </Link>
        <Link
          to="/opiniones"
          className="inline-flex items-center gap-2 text-sm font-medium text-white px-4 py-2 rounded-lg transition-colors"
          style={{ backgroundColor: 'var(--mikels-red)' }}
        >
          Dejar mi opinión
        </Link>
      </div>
    </div>
  );
};

export default ProductReviews;
