import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import { ShoppingCart, ArrowLeft, Check, Tag, Package } from 'lucide-react';
// eslint-disable-next-line no-unused-vars -- JSX usa el namespace `<motion.*>`
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import SoldOutNotification from '../components/SoldOutNotification';
import ProductReviews from '../components/ProductReviews';

const REDIRECTED_PRODUCT_SLUGS = new Set([
  'pack-temprano-premium',
  'pack-aceite-ecologico-premium-estuche-regalo',
]);
import ProductSeo from '../components/ProductSeo';
import { formatEuro } from '../utils/formatMoney';
import { getApplicableVolumeTier, getVolumeDiscountedLineTotal, getVolumeDiscountedUnitPrice } from '../utils/volumePricing';

const API_URL = import.meta.env.VITE_API_URL || 'https://mikels-earth-backend-production.up.railway.app';

const getOptimizedProductImage = (url, width = 1200) => {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes('/image/upload/')) {
    return url;
  }

  return url.replace(
    '/image/upload/',
    `/image/upload/f_auto,q_auto:eco,c_limit,w_${width}/`
  );
};

// i18n hook will be used inside the component

// Componente de estrellas inline
const StarRating = ({ rating, count }) => {
  const { t } = useTranslation();
  if (!rating || count === 0) return null;
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${star <= Math.round(rating) ? 'text-[#1a1a1a]' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-sm text-gray-600 font-medium">{rating.toFixed(1)}</span>
      <span className="text-sm text-gray-400">({count === 1 ? t('product_detail.review_count_one', { count }) : t('product_detail.reviews_count', { count })})</span>
    </div>
  );
};

const ProductDetail = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { products, loading } = useProducts();
  const { t } = useTranslation();
  
  const product = products.find(p => p.slug === slug && p.visibleInStore !== false);

  // Fetch rating stats para mostrar estrellas debajo del título
  const [reviewStats, setReviewStats] = useState({ average: 0, count: 0 });
  useEffect(() => {
    if (slug) {
      fetch(`${API_URL}/api/reviews/stats?product_slug=${slug}`)
        .then(res => res.json())
        .then(data => {
          if (data.average_rating !== undefined) {
            setReviewStats({ average: data.average_rating, count: data.total_reviews || 0 });
          }
        })
        .catch(() => {});
    }
  }, [slug]);
  
  // Cantidad inicial siempre es 1
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState({});
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [variantQuantities, setVariantQuantities] = useState({});

  if (!product) {
    return (
      <div className="min-h-screen py-16 flex items-center justify-center">
        {!loading && <ProductSeo key={`missing-${slug}`} product={null} slug={slug} />}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">{t('product_detail.not_found')}</h1>
          <Link to="/tienda" className="text-primary hover:underline">
            {t('product_detail.back_to_shop')}
          </Link>
        </div>
      </div>
    );
  }

  const volumePricingItem = {
    price: product.price,
    volumeDiscountConfig: product.volumeDiscount,
    tieredDiscountConfig: product.tieredDiscount,
  };
  const applicableTier = getApplicableVolumeTier(volumePricingItem, quantity);
  const currentPrice = getVolumeDiscountedUnitPrice(volumePricingItem, quantity);
  const currentLineTotal = getVolumeDiscountedLineTotal(volumePricingItem, quantity);
  const originalLineTotal = Number(product.price) * quantity;
  const hasDiscount = currentLineTotal < originalLineTotal - 0.001;
  const discountPercent = applicableTier?.discount || 0;
  const discountLabel = applicableTier?.label || '';
  const isReservation = product.reservationOnly === true;
  const availableStock = Math.max(0, Number(product.stock) || 0);

  // El backend solo adjunta complementos activos y vendibles. Esta segunda
  // comprobación defensiva evita mostrar una fila incompleta ante cualquier
  // respuesta parcial o precio inválido.
  const resolvedAddons = (product.addons || []).filter((addon) => {
    const addonPrice = Number(addon?.product?.price);
    return addon?.product && Number.isFinite(addonPrice) && addonPrice > 0 && !addon.product.soldOut;
  });

  const handleAddToCart = () => {
    // Si el producto tiene variantes con cantidades individuales
    if (product.variants && Object.keys(variantQuantities).length > 0) {
      Object.entries(variantQuantities).forEach(([variantId, qty]) => {
        if (qty > 0) {
          const variant = product.variants.find(v => v.id === variantId);
          const productWithVariant = {
            ...product,
            selectedVariant: variantId,
            variantName: variant?.name
          };
          addToCart(productWithVariant, qty, 'one-time', null);
        }
      });
    } else {
      // Producto sin variantes o con variante simple
      const productWithVariant = selectedVariant 
        ? { ...product, selectedVariant, variantName: product.variants.find(v => v.id === selectedVariant)?.name }
        : product;
      addToCart(productWithVariant, quantity, 'one-time', null);
    }
    
    // Add selected addons to cart
    Object.entries(selectedAddons).forEach(([addonSlug, addonData]) => {
      if (addonData.selected && addonData.quantity > 0) {
        const resolvedAddon = resolvedAddons.find(addon => addon.productSlug === addonSlug);
        const addonProduct = resolvedAddon?.product;
        if (addonProduct && Number(addonProduct.price) > 0) {
          const variant = addonProduct.variants?.find(item => item.id === addonData.variantId);
          const addonWithVariant = addonData.variantId
            ? {
                ...addonProduct,
                selectedVariant: addonData.variantId,
                variantName: variant?.name
              }
            : addonProduct;
          addToCart(addonWithVariant, addonData.quantity, 'one-time', null);
        }
      }
    });
  };

  return (
    <div className="min-h-screen py-16 bg-gray-50">
      {!loading && <ProductSeo key={`valid-${slug}`} product={product} slug={slug} />}
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link 
            to="/tienda" 
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('product_detail.back_to_shop')}
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-lg shadow-lg overflow-hidden sticky top-8">
              {product.images && product.images.length > 0 ? (
                <div className="relative">
                  {/* Imagen principal */}
                  <div className="aspect-square overflow-hidden">
                    <img 
                      src={getOptimizedProductImage(product.images[selectedImage], 1200)}
                      alt={product.name}
                      width="1200"
                      height="1200"
                      fetchPriority="high"
                      decoding="async"
                      className="w-full h-full object-cover transition-all duration-300"
                    />
                  </div>
                  {product.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2 p-4 bg-gray-50">
                      {product.images.slice(0, 4).map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImage(idx)}
                          className={`w-full aspect-square object-cover rounded-lg cursor-pointer transition-all ${
                            selectedImage === idx 
                              ? 'ring-2 ring-[#1a1a1a] ring-offset-2 opacity-100'
                              : 'opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img 
                            src={getOptimizedProductImage(img, 240)}
                            alt={`${product.name} ${idx + 1}`}
                            width="240"
                            height="240"
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : product.image ? (
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={getOptimizedProductImage(product.image, 1200)}
                    alt={product.name}
                    width="1200"
                    height="1200"
                    fetchPriority="high"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="text-center p-8">
                    <Tag className="w-24 h-24 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-400">{product.name}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Product info section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white rounded-lg shadow-lg p-8">
              {/* Category */}
              <p className="text-sm text-[#1a1a1a]/60 uppercase tracking-wide mb-2 font-semibold">
                {t(`categories.${product.category.toLowerCase()}`, product.category)}
              </p>

              {/* Product name */}
              <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
                {product.name}
              </h1>

              {isReservation && (
                <div className="mb-5 rounded-lg border border-stone-300 bg-[#f5efe4] px-4 py-3 text-sm leading-6 text-[#1a1a1a]">
                  <p>{product.reservationMessage || 'La cosecha 2026/27 se sirve por reserva. Se embotella a finales de octubre y te llega en cuanto salga.'}</p>
                  <p className="mt-2 font-semibold">Quedan {availableStock} de {product.reservationStockTotal || 1080}</p>
                </div>
              )}

              {/* Star Rating */}
              <StarRating rating={reviewStats.average} count={reviewStats.count} />

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {product.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="rounded-full border border-stone-300 bg-[#f5efe4] px-3 py-1 text-xs text-[#1a1a1a]"
                  >
                    {t(`tags.${tag.toLowerCase().replace(/\s+/g, '_').replace(/[áàä]/g,'a').replace(/[éèë]/g,'e').replace(/[íìï]/g,'i').replace(/[óòö]/g,'o').replace(/[úùü]/g,'u').replace(/ñ/g,'n')}`, tag)}
                  </span>
                ))}
              </div>

              {/* Badges */}
              {(product.soldOut || (product.badges && product.badges.length > 0)) && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {product.soldOut && (
                    <span className="rounded-full bg-[#1a1a1a] px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white">
                      {product.soldOutMessage || 'Agotado'}
                    </span>
                  )}
                  {product.badges?.slice(0, 1).map((badge, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-[#f5efe4] px-4 py-2 text-sm font-semibold tracking-wide text-[#1a1a1a]"
                    >
                      {badge.textKey ? t(`badges.${badge.textKey}`, badge.text) : badge.text}
                    </span>
                  ))}
                </div>
              )}

              {/* Description */}
              <div className="text-gray-700 leading-relaxed mb-6 space-y-4">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="leading-relaxed">{children}</p>,
                    strong: ({ children }) => <strong className="font-semibold text-primary">{children}</strong>,
                    ul: ({ children }) => <ul className="list-disc pl-6 space-y-2">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-6 space-y-2">{children}</ol>,
                    li: ({ children }) => <li className="pl-1">{children}</li>,
                  }}
                >
                  {product.longDescription || product.description || ''}
                </ReactMarkdown>
              </div>

              {/* Weight */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                <Package className="w-4 h-4" />
                <span>{t('product_detail.content')}: {product.weight}</span>
              </div>

              {/* Price */}
              <div className="mb-6 rounded-lg bg-[#f5efe4] p-6">
                <div className="mb-2 text-4xl font-bold text-price">
                  {formatEuro(currentPrice || product.price)}
                </div>
                {hasDiscount && (
                  <div className="space-y-1 rounded-lg border border-stone-300 bg-white p-3 text-[#1a1a1a]">
                    <div className="text-sm font-semibold">
                      {t('product_detail.discount_applied', { percent: discountPercent, label: discountLabel })}
                    </div>
                    <div className="text-xs">
                      {t('product_detail.price_per_unit', { price: formatEuro(currentPrice), original: formatEuro(product.price) })}
                    </div>
                    <div className="text-lg font-semibold">
                      {t('product_detail.total_price', { price: formatEuro(currentLineTotal) })}
                      <span className="ml-2 text-sm font-normal">
                        ({t('product_detail.you_save', { amount: formatEuro(originalLineTotal - currentLineTotal) })})
                      </span>
                    </div>
                  </div>
                )}
                {product.tieredDiscount && !hasDiscount && (
                  <div className="space-y-2 text-sm text-[#1a1a1a]">
                    <p className="text-base font-semibold">{t('product_detail.volume_discounts')}</p>
                    {product.tieredDiscount.map((tier, index) => {
                      const isReservationBox = Number(tier.bundleQuantity) === 12 && Number(tier.paidQuantity) === 11;
                      const isBestValue = tier.minQuantity === 36; // Destacar la opción 3+1
                      const isFreeShipping = tier.freeShipping === true; // Pack Duo con envío gratis
                      const actualQuantity = tier.actualQuantity || tier.minQuantity;
                      const tierPricingItem = { ...volumePricingItem, tieredDiscountConfig: [tier] };
                      const pricePerUnit = getVolumeDiscountedUnitPrice(tierPricingItem, actualQuantity);
                      const totalPrice = getVolumeDiscountedLineTotal(tierPricingItem, actualQuantity);
                      const savings = (product.price * actualQuantity) - totalPrice;
                      
                      return (
                        <div 
                          key={index} 
                          className="rounded-lg border border-stone-300 bg-white p-3"
                        >
                          <div className="mb-1 flex items-center justify-between">
                            <span className="font-semibold">
                              {actualQuantity} {t('product_detail.units')} ({tier.label})
                            </span>
                          </div>
                          {tier.description && (
                            <p className="text-xs text-gray-600 mb-1 italic">{tier.description}</p>
                          )}
                          <div className="text-xs space-y-0.5 mb-2">
                            {isReservationBox && <p className="font-semibold">Caja de 12: pagas 11 y recibes 12</p>}
                            {tier.discount > 0 && <p className="font-semibold">{t('product_detail.discount_percent', { percent: tier.discount })}</p>}
                            <p>{formatEuro(pricePerUnit)} / {t('product_detail.units')}</p>
                            <p className="font-bold text-price">
                              {t('product_detail.total_price', { price: formatEuro(totalPrice) })}
                              {savings > 0 && <span className="ml-1 text-[#1a1a1a]">({t('product_detail.you_save', { amount: formatEuro(savings) })})</span>}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              const quantityToAdd = tier.actualQuantity || tier.minQuantity;
                              addToCart(product, quantityToAdd, 'one-time', null);
                            }}
                            className="w-full rounded-lg bg-primary px-4 py-2 font-semibold text-white transition-colors hover:bg-primary/90"
                          >
                            {isReservationBox ? 'Reservar una caja de 12' : isBestValue ? t('product_detail.want_free_box') : isFreeShipping ? t('product_detail.add_pack_duo') : t('product_detail.add_units_to_cart', { count: tier.actualQuantity || tier.minQuantity })}
                          </button>
                        </div>
                      );
                    })}
                    <div className="border-t-2 border-gray-300 pt-2 mt-3">
                      <p className="text-sm font-semibold mb-2">{t('product_detail.custom_quantity')}</p>
                    </div>
                  </div>
                )}
                {product.slug !== 'aceite-5l-caja-3' && product.volumeDiscount && !hasDiscount && (
                  <div className="text-sm text-gray-600">
                    {t('product_detail.volume_discount_text', { min: product.volumeDiscount.minQuantity, percent: product.volumeDiscount.discount })}
                  </div>
                )}
              </div>

              {/* Variant selector with individual quantities */}
              {product.variants && product.variants.length > 0 && product.slug === 'estuche-regalo' ? (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-primary mb-3">
                    {t('product_detail.select_designs')}
                  </label>
                  <div className="space-y-4">
                    {product.variants.map((variant) => {
                      const variantQty = variantQuantities[variant.id] || 0;
                      const canIncrease = variantQty < 12;
                      
                      return (
                        <div key={variant.id} className="border-2 border-gray-200 rounded-lg p-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={variant.image}
                              alt={variant.name}
                              className="w-20 h-20 object-contain"
                            />
                            <div className="flex-1">
                              <p className="font-semibold text-primary">{variant.name}</p>
                              <p className="text-xs text-gray-600">{variant.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  const newQty = Math.max(0, variantQty - 1);
                                  setVariantQuantities(prev => ({
                                    ...prev,
                                    [variant.id]: newQty
                                  }));
                                }}
                                disabled={variantQty === 0}
                                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold text-xl transition-colors"
                              >
                                −
                              </button>
                              <span className="w-12 text-center font-bold text-lg">{variantQty}</span>
                              <button
                                onClick={() => {
                                  setVariantQuantities(prev => ({
                                    ...prev,
                                    [variant.id]: Math.min(12, variantQty + 1)
                                  }));
                                }}
                                disabled={!canIncrease}
                                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold text-xl transition-colors"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                    <p className="text-sm font-semibold text-center">
                      {t('product_detail.total_cases_selected', { count: Object.values(variantQuantities).reduce((sum, q) => sum + q, 0) })}
                    </p>
                  </div>
                </div>
              ) : product.variants && product.variants.length > 0 ? (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-primary mb-3">
                    {t('product_detail.select_design')}
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {product.variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant.id)}
                        className={`relative border-2 rounded-lg p-2 transition-all ${
                          selectedVariant === variant.id
                            ? 'border-primary ring-2 ring-[#1a1a1a] ring-offset-2'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={variant.image}
                          alt={variant.name}
                          className="w-full h-32 object-contain mb-2"
                        />
                        <p className="text-xs font-semibold text-center">{variant.name}</p>
                        {selectedVariant === variant.id && (
                          <div className="absolute top-2 right-2 bg-[#1a1a1a] text-white rounded-full p-1">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  {selectedVariant && (
                    <p className="text-sm text-gray-600 mt-2">
                      {product.variants.find(v => v.id === selectedVariant)?.description}
                    </p>
                  )}
                </div>
              ) : null}

              {/* Quantity selector */}
              {product.slug !== 'estuche-regalo' && availableStock > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-primary mb-3">
                  {t('product_detail.quantity')}
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setQuantity(Math.max(1, quantity - 1));
                    }}
                    className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-xl transition-colors"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      setQuantity(Math.min(availableStock, Math.max(1, parseInt(e.target.value) || 1)));
                    }}
                    className="w-20 h-12 text-center border-2 border-gray-200 rounded-lg font-semibold text-lg focus:outline-none focus:border-primary"
                    min={1}
                    max={availableStock}
                  />
                  <button
                    onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                    disabled={quantity >= availableStock}
                    className="w-12 h-12 bg-gray-100 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 rounded-lg font-bold text-xl transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
              )}

              {/* Addons section */}
              {resolvedAddons.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-primary mb-3">{t('product_detail.optional_addons')}</h3>
                  <div className="space-y-3">
                    {resolvedAddons.map((addon, idx) => {
                      const addonProduct = addon.product;
                      const isSelected = selectedAddons[addon.productSlug]?.selected || false;
                      const addonQty = selectedAddons[addon.productSlug]?.quantity || 1;
                      
                      return (
                        <div key={idx} className={`p-4 border-2 rounded-lg transition-all ${
                          isSelected ? 'border-[#1a1a1a] bg-[#f5efe4]' : 'border-gray-200'
                        }`}>
                          <div className="flex items-center gap-3 mb-3">
                            <input
                              type="checkbox"
                              id={`addon-${idx}`}
                              checked={isSelected}
                              onChange={(e) => {
                                setSelectedAddons(prev => ({
                                  ...prev,
                                  [addon.productSlug]: {
                                    selected: e.target.checked,
                                    quantity: addonQty,
                                    variantId: addon.variantId
                                  }
                                }));
                              }}
                              className="h-5 w-5 text-[#1a1a1a] focus:ring-[#1a1a1a]"
                            />
                            <label htmlFor={`addon-${idx}`} className="flex-1 cursor-pointer">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-sm font-medium text-gray-700">{addon.label}</span>
                                  {addon.variantId && (
                                    <span className="text-xs text-gray-500 block">{t('product_detail.model')}: {addon.variantId.replace('-', ' ')}</span>
                                  )}
                                </div>
                                <span className="text-sm font-bold text-price">
                                  +{formatEuro(Number(addonProduct.price))}
                                </span>
                              </div>
                            </label>
                          </div>
                          
                          {isSelected && (
                            <div className="ml-8">
                              <label className="block text-xs font-semibold text-gray-600 mb-2">
                                {t('product_detail.quantity')}
                              </label>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    const newQty = Math.max(1, addonQty - 1);
                                    setSelectedAddons(prev => ({
                                      ...prev,
                                      [addon.productSlug]: {
                                        ...prev[addon.productSlug],
                                        quantity: newQty
                                      }
                                    }));
                                  }}
                                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded font-bold transition-colors"
                                >
                                  −
                                </button>
                                <input
                                  type="number"
                                  value={addonQty}
                                  onChange={(e) => {
                                    const newQty = Math.max(1, parseInt(e.target.value) || 1);
                                    setSelectedAddons(prev => ({
                                      ...prev,
                                      [addon.productSlug]: {
                                        ...prev[addon.productSlug],
                                        quantity: newQty
                                      }
                                    }));
                                  }}
                                  className="w-16 text-center border-2 border-gray-200 rounded py-1 font-semibold"
                                />
                                <button
                                  onClick={() => {
                                    const newQty = addonQty + 1;
                                    setSelectedAddons(prev => ({
                                      ...prev,
                                      [addon.productSlug]: {
                                        ...prev[addon.productSlug],
                                        quantity: newQty
                                      }
                                    }));
                                  }}
                                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded font-bold transition-colors"
                                >
                                  +
                                </button>
                                <span className="text-xs text-gray-600 ml-2">
                                  Total: {formatEuro(Number(addonProduct.price) * addonQty)}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action buttons or Sold Out Notification */}
              {product.soldOut || availableStock < 1 ? (
                <SoldOutNotification productName={product.name} productSlug={product.slug} />
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-4 text-lg font-semibold text-white transition-colors hover:bg-primary/90"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {isReservation ? 'Reservar' : t('product_detail.add_to_cart')}
                </button>
              )}

              {/* Trust badges - Mensajes de confianza */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="h-5 w-5 flex-shrink-0 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{isReservation ? 'Envío al embotellar, a finales de octubre' : t('product_detail.shipping_time')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="h-5 w-5 flex-shrink-0 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>{t('product_detail.returns')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="h-5 w-5 flex-shrink-0 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>{t('product_detail.secure_payment')}</span>
                </div>
              </div>

              {/* Additional info */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="font-bold text-primary mb-3">{product.category === 'Packs' ? t('product_detail.material') : t('product_detail.ingredients')}</h3>
                <p className="text-sm text-gray-700 mb-4">{product.ingredients}</p>

                {product.nutritionalInfo && (
                  <>
                    {product.nutritionalInfo.perfilSabor ? (
                      <>
                        <h3 className="font-bold text-primary mb-3">{t('product_detail.flavor_profile')}</h3>
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-700 font-medium">{t('product_detail.fruity')}</span>
                            <span className="font-semibold text-primary">{product.nutritionalInfo.perfilSabor.frutado}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-700 font-medium">{t('product_detail.bitter')}</span>
                            <span className="font-semibold text-primary">{product.nutritionalInfo.perfilSabor.amargo}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-700 font-medium">{t('product_detail.spicy')}</span>
                            <span className="font-semibold text-primary">{product.nutritionalInfo.perfilSabor.picante}</span>
                          </div>
                        </div>
                        {product.nutritionalInfo.notasCata && (
                          <div className="mb-4">
                            <h3 className="font-bold text-primary mb-3 mt-6">{t('product_detail.tasting_notes')}</h3>
                            <p className="text-sm text-gray-700 italic">{product.nutritionalInfo.notasCata}</p>
                          </div>
                        )}
                        {product.nutritionalInfo.idealPara && (
                          <>
                            <h3 className="font-bold text-primary mb-3 mt-6">{t('product_detail.ideal_for')}</h3>
                            <ul className="space-y-2">
                              {product.nutritionalInfo.idealPara.map((uso, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                  <span className="mt-0.5 text-[#1a1a1a]">✓</span>
                                  <span>{uso}</span>
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <h3 className="font-bold text-primary mb-3">{t('product_detail.nutrition_info')}</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="bg-gray-50 p-2 rounded">
                            <span className="text-gray-600">{t('product_detail.calories')}</span>
                            <span className="font-semibold ml-2">{product.nutritionalInfo.calories}</span>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <span className="text-gray-600">{t('product_detail.carbs')}</span>
                            <span className="font-semibold ml-2">{product.nutritionalInfo.carbs}</span>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <span className="text-gray-600">{t('product_detail.protein')}</span>
                            <span className="font-semibold ml-2">{product.nutritionalInfo.protein}</span>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <span className="text-gray-600">{t('product_detail.fats')}</span>
                            <span className="font-semibold ml-2">{product.nutritionalInfo.fat}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Product Reviews section */}
        <ProductReviews productSlug={slug} productName={product.name} />

        {/* Related products section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-primary mb-8 text-center">
            {t('product_detail.related_products')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(product.relatedProducts
              ? products.filter(p => product.relatedProducts.includes(p.slug) && p.visibleInStore !== false && !REDIRECTED_PRODUCT_SLUGS.has(p.slug))
              : products.filter(p => p.id !== product.id && p.category === product.category && p.visibleInStore !== false && !REDIRECTED_PRODUCT_SLUGS.has(p.slug)).slice(0, 3)
            ).map(relatedProduct => (
                <Link
                  key={relatedProduct.id}
                  to={`/producto/${relatedProduct.slug}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow group"
                >
                  <div className="relative h-48 bg-gray-200 overflow-hidden">
                    {(relatedProduct.image || relatedProduct.images?.[0]) ? (
                      <img 
                        src={getOptimizedProductImage(relatedProduct.image || relatedProduct.images?.[0], 480)}
                        alt={relatedProduct.name}
                        width="480"
                        height="480"
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200"
                      style={{ display: (relatedProduct.image || relatedProduct.images?.[0]) ? 'none' : 'flex' }}
                    >
                      <div className="text-center text-sm">
                        {relatedProduct.name}
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-primary mb-2 line-clamp-2">{relatedProduct.name}</h3>
                    <p className="text-lg font-bold text-price">{formatEuro(relatedProduct.price)}</p>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
