import { Link } from 'react-router-dom';
import { ShoppingCart, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

const ProductCard = ({ product }) => {
  const hasSubscription = product.subscriptionAvailable;
  const savingsPercent = hasSubscription 
    ? Math.round(((product.price - product.priceSubscription) / product.price) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
    >
      <Link to={`/producto/${product.slug}`} className="block">
        {/* Image container */}
        <div className="relative h-64 bg-gray-200 overflow-hidden">
          {/* Placeholder para imagen */}
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="text-center">
              <Tag className="w-16 h-16 mx-auto mb-2 opacity-30" />
              <p className="text-sm">{product.name}</p>
            </div>
          </div>
          
          {/* Badge de suscripción disponible */}
          {hasSubscription && (
            <div className="absolute top-3 right-3 bg-secondary text-primary px-3 py-1 rounded-full text-xs font-semibold shadow-md">
              Ahorra {savingsPercent}%
            </div>
          )}

          {/* Overlay en hover */}
          <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-all duration-300" />
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Category */}
          <p className="text-xs text-primary/60 uppercase tracking-wide mb-2 font-semibold">
            {product.category}
          </p>

          {/* Product name */}
          <h3 className="text-lg font-bold text-primary mb-2 group-hover:text-primary/80 transition-colors line-clamp-2">
            {product.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {product.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-4">
            {product.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-accent/50 text-primary px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Price and CTA */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-primary">
                {product.price.toFixed(2)}€
              </div>
              {hasSubscription && (
                <div className="text-xs text-gray-500">
                  o desde {product.priceSubscription.toFixed(2)}€/mes
                </div>
              )}
            </div>
            
            <button
              className="bg-primary text-white p-3 rounded-full hover:bg-primary/90 transition-all duration-300 transform hover:scale-110 shadow-md"
              onClick={(e) => {
                e.preventDefault();
                // TODO: Añadir al carrito directamente
              }}
              aria-label="Añadir al carrito"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          </div>

          {/* Stock indicator */}
          {product.stock < 10 && (
            <div className="mt-3 text-xs text-orange-600 font-semibold">
              ¡Solo quedan {product.stock} unidades!
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;

