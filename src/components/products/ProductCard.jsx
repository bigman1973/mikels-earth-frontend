import { Link } from 'react-router-dom';
import { ShoppingCart, Tag } from 'lucide-react';
// eslint-disable-next-line no-unused-vars -- JSX uses the namespace `<motion.*>`.
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../context/CartContext';
import { formatEuro } from '../../utils/formatMoney';
import { isReservationSale } from '../../utils/reservationSale';
import { getTempranoHarvestIdentity, normalizeTempranoHarvestName } from '../../utils/tempranoHarvestIdentity';
import { getFixedPackOptions, getFixedPackPrice } from '../../utils/fixedPackPricing';
import { getIndependentPackIdentity } from '../../utils/independentPacks';
import { normalizePromotionProtectedProduct } from '../../utils/promotionProtection';

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
  product = normalizePromotionProtectedProduct(normalizeTempranoHarvestName(product));
  const { addToCart, setIsCartOpen } = useCart();
  const { t } = useTranslation();
  const productImage = getOptimizedProductImage(product.image || product.images?.[0]);
  const displayBadge = product.badges?.find((badge) => !badge.detailOnly && (!(product.inPromotion === true || getIndependentPackIdentity(product)) || !/%|descuento|rebaja|ahorr|discount|sale/i.test(`${badge.text} ${badge.textKey || ''}`)));
  const badgeText = displayBadge
    ? (displayBadge.textKey ? t(`badges.${displayBadge.textKey}`, displayBadge.text) : displayBadge.text)
    : null;
  const isReservation = isReservationSale(product);
  const cardBadgeText = isReservation
    ? 'RESERVA · COSECHA 2026/27'
    : product.inPromotion === true ? 'En promoción' : badgeText;
  const isSoldOut = product.soldOut || product.available === false;
  const isPreviousHarvest = getTempranoHarvestIdentity(product)?.sku === 'MIKVET5002526';
  const defaultPack = isPreviousHarvest ? getFixedPackOptions(product)[0] : null;
  const cardQuantity = isPreviousHarvest ? defaultPack?.actualQuantity : 1;
  const cardPrice = defaultPack ? getFixedPackPrice(defaultPack) : product.price;

  const addProduct = () => {
    if (isSoldOut || !cardQuantity) return;
    addToCart(product, cardQuantity);
    setIsCartOpen(true);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group relative overflow-hidden rounded-lg bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg"
    >
      {cardBadgeText && !isSoldOut && (
        <span className={`absolute left-3 top-3 z-10 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
          isReservation ? 'bg-primary text-white' : 'bg-[#f5efe4] text-[#1a1a1a]'
        }`}>
          {cardBadgeText}
        </span>
      )}
      {isSoldOut && (
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
          <h3 className={`min-h-[3.5rem] text-lg font-medium text-[#1a1a1a] ${getTempranoHarvestIdentity(product) || getIndependentPackIdentity(product)?.harvest ? 'whitespace-normal break-words' : 'line-clamp-2'}`}>
            {product.name}
          </h3>
          <p className="mt-2 text-xl font-bold text-price">
            {formatEuro(cardPrice)}
          </p>
          {defaultPack && <p className="mt-1 text-xs text-stone-600">{defaultPack.label}</p>}
        </div>
      </Link>

      <div className="px-5 pb-5">
        {isSoldOut ? (
          <span className="block w-full rounded-lg border border-stone-300 px-4 py-3 text-center text-sm font-semibold text-[#1a1a1a]">
            {product.soldOutMessage || 'Agotado'}
          </span>
        ) : (
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            disabled={!cardQuantity}
            onClick={addProduct}
          >
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            {isReservation ? 'Reservar' : t('product_detail.add_to_cart')}
          </button>
        )}
      </div>
    </motion.article>
  );
};

export default ProductCard;
