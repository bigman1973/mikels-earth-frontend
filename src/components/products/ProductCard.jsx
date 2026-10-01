import { Link } from 'react-router-dom';
import { ShoppingCart, Tag } from 'lucide-react';
// eslint-disable-next-line no-unused-vars -- JSX uses the namespace `<motion.*>`.
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../context/CartContext';
import { formatEuro } from '../../utils/formatMoney';

const getOptimizedProductImage = (url) => {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes('/image/upload/')) {
    return url;
  }

  return url.replace(
    '/image/upload/',
    '/image/upload/f_auto,q_auto:eco,c_fill,w_640,h_640/'
  );
};

const ProductCard = ({ product }) => {
  const { addToCart, setIsCartOpen } = useCart();
  const { t } = useTranslation();
  const productImage = getOptimizedProductImage(product.image || product.images?.[0]);
  const displayBadge = product.badges?.[0];
  const badgeText = displayBadge
    ? (displayBadge.textKey ? t(`badges.${displayBadge.textKey}`, displayBadge.text) : displayBadge.text)
    : null;

  const addProduct = () => {
    addToCart(product, 1);
    setIsCartOpen(true);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group relative overflow-hidden rounded-lg bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg"
    >
      {badgeText && !product.soldOut && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-[#f5efe4] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#1a1a1a]">
          {badgeText}
        </span>
      )}
      {product.soldOut && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-[#1a1a1a] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
          {product.soldOutMessage || 'Agotado'}
        </span>
      )}

      <Link to={`/producto/${product.slug}`} className="block">
        <div className="relative h-64 overflow-hidden bg-stone-100">
          {productImage ? (
            <img
              src={productImage}
              alt={product.name}
              width="640"
              height="640"
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
                event.currentTarget.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            className="absolute inset-0 hidden items-center justify-center bg-stone-100 text-stone-500"
            style={{ display: productImage ? 'none' : 'flex' }}
          >
            <Tag className="h-12 w-12" aria-hidden="true" />
          </div>
        </div>
        <div className="p-5 pb-3">
          <h3 className="line-clamp-2 min-h-[3.5rem] text-lg font-semibold text-[#1a1a1a]">
            {product.name}
          </h3>
          <p className="mt-2 text-xl font-bold text-price">
            {formatEuro(product.price)}
          </p>
        </div>
      </Link>

      <div className="px-5 pb-5">
        {product.soldOut ? (
          <span className="block w-full rounded-lg border border-stone-300 px-4 py-3 text-center text-sm font-semibold text-[#1a1a1a]">
            {product.soldOutMessage || 'Agotado'}
          </span>
        ) : (
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            onClick={addProduct}
          >
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            {t('product_detail.add_to_cart')}
          </button>
        )}
      </div>
    </motion.article>
  );
};

export default ProductCard;
