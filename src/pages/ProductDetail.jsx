import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import { ShoppingCart, ArrowLeft, Check, Repeat, Tag, Package, Leaf } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import SoldOutNotification from '../components/SoldOutNotification';
import ProductReviews from '../components/ProductReviews';

const API_URL = import.meta.env.VITE_API_URL || 'https://mikels-earth-backend-production.up.railway.app';

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
            className={`w-5 h-5 ${star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
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
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { products } = useProducts();
  const { t } = useTranslation();
  
  const product = products.find(p => p.slug === slug);

  // Fetch rating stats para mostrar estrellas debajo del título
  const [reviewStats, setReviewStats] = useState({ average: 0, count: 0 });
  useEffect(() => {
    if (slug) {
      fetch(`${API_URL}/api/reviews/stats?product=${slug}`)
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
  const [purchaseType, setPurchaseType] = useState('one-time');
  const [subscriptionFrequency, setSubscriptionFrequency] = useState(null);
  const [preferredDeliveryDay, setPreferredDeliveryDay] = useState('');
  const [preferredTimeSlot, setPreferredTimeSlot] = useState('');
  const [preferredDayOfMonth, setPreferredDayOfMonth] = useState('');
  const [selectedAddons, setSelectedAddons] = useState({});
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [variantQuantities, setVariantQuantities] = useState({});

  if (!product) {
    return (
      <div className="min-h-screen py-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">{t('product_detail.not_found')}</h1>
          <Link to="/tienda" className="text-primary hover:underline">
            {t('product_detail.back_to_shop')}
          </Link>
        </div>
      </div>
    );
  }

  // Calculate price with tiered or volume discount
  let discountPercent = 0;
  let discountLabel = '';
  
  if (product.tieredDiscount && purchaseType === 'one-time') {
    // Encontrar el descuento escalonado que aplica
    for (const tier of product.tieredDiscount) {
      if (quantity >= tier.minQuantity) {
        discountPercent = tier.discount;
        discountLabel = tier.label;
      }
    }
  } else if (product.volumeDiscount && quantity >= product.volumeDiscount.minQuantity && purchaseType === 'one-time') {
    discountPercent = product.volumeDiscount.discount;
    discountLabel = 'volumen';
  }
  
  const hasDiscount = discountPercent > 0;
  const discountedPrice = hasDiscount 
    ? product.price * (1 - discountPercent / 100)
    : product.price;
  
  // Mantener compatibilidad con código existente
  const hasVolumeDiscount = hasDiscount;
  const volumeDiscountedPrice = discountedPrice;
  
  const selectedFrequency = product.subscriptionFrequencies?.find(f => f.value === subscriptionFrequency);
  
  // Calcular el descuento máximo disponible en suscripción
  const maxSubscriptionDiscount = product.subscriptionFrequencies && product.subscriptionFrequencies.length > 0
    ? Math.max(...product.subscriptionFrequencies.map(f => f.discount))
    : 0;
  
  // Para suscripción, aplicar descuento SOLO según la frecuencia elegida
  const subscriptionPrice = purchaseType === 'subscription' && selectedFrequency
    ? product.price * (1 - selectedFrequency.discount / 100)
    : product.price;
  
  const currentPrice = purchaseType === 'subscription' 
    ? subscriptionPrice
    : volumeDiscountedPrice;

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
          addToCart(productWithVariant, qty, purchaseType, subscriptionFrequency);
        }
      });
    } else {
      // Producto sin variantes o con variante simple
      const productWithVariant = selectedVariant 
        ? { ...product, selectedVariant, variantName: product.variants.find(v => v.id === selectedVariant)?.name }
        : product;
      addToCart(productWithVariant, quantity, purchaseType, subscriptionFrequency);
    }
    
    // Add selected addons to cart
    Object.entries(selectedAddons).forEach(([addonSlug, addonData]) => {
      if (addonData.selected && addonData.quantity > 0) {
        const addonProduct = products.find(p => p.slug === addonSlug);
        if (addonProduct) {
          const addonWithVariant = addonData.variantId
            ? { ...addonProduct, selectedVariant: addonData.variantId }
            : addonProduct;
          addToCart(addonWithVariant, addonData.quantity, 'one-time', null);
        }
      }
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen py-16 bg-gray-50">
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
                      src={product.images[selectedImage]} 
                      alt={product.name}
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
                              ? 'ring-2 ring-primary ring-offset-2 opacity-100' 
                              : 'opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img 
                            src={img} 
                            alt={`${product.name} ${idx + 1}`}
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
                    src={product.image} 
                    alt={product.name}
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
              <p className="text-sm text-primary/60 uppercase tracking-wide mb-2 font-semibold">
                {t(`categories.${product.category.toLowerCase()}`, product.category)}
              </p>

              {/* Product name */}
              <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
                {product.name}
              </h1>

              {/* Star Rating */}
              <StarRating rating={reviewStats.average} count={reviewStats.count} />

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {product.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 text-xs bg-accent/50 text-primary px-3 py-1 rounded-full"
                  >
                    <Leaf className="w-3 h-3" />
                    {t(`tags.${tag.toLowerCase().replace(/\s+/g, '_').replace(/[áàä]/g,'a').replace(/[éèë]/g,'e').replace(/[íìï]/g,'i').replace(/[óòö]/g,'o').replace(/[úùü]/g,'u').replace(/ñ/g,'n')}`, tag)}
                  </span>
                ))}
              </div>

              {/* Badges */}
              {(product.soldOut || (product.badges && product.badges.length > 0)) && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {product.soldOut && (
                    <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg uppercase tracking-wide">
                      🌾 {product.soldOutMessage || 'Sold Out'}
                    </span>
                  )}
                  {product.badges && product.badges.map((badge, index) => (
                    <span
                      key={index}
                      className={`${badge.color} text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg uppercase tracking-wide`}
                    >
                      {badge.textKey ? t(`badges.${badge.textKey}`, badge.text) : badge.text}
                    </span>
                  ))}
                </div>
              )}

              {/* Description */}
              <p className="text-gray-700 leading-relaxed mb-6">
                {product.longDescription}
              </p>

              {/* Weight */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                <Package className="w-4 h-4" />
                <span>{t('product_detail.content')}: {product.weight}</span>
              </div>

              {/* Price */}
              <div className="bg-accent/30 rounded-lg p-6 mb-6">
                <div className="text-4xl font-bold text-primary mb-2">
                  {currentPrice ? currentPrice.toFixed(2) : product.price.toFixed(2)}€
                </div>
                {purchaseType === 'subscription' && selectedFrequency && (
                  <div className="text-sm text-gray-600">
                    {t('product_detail.save_with_subscription', { percent: selectedFrequency.discount, label: selectedFrequency.label.toLowerCase() })}
                  </div>
                )}
                {hasDiscount && (
                  <div className="bg-green-50 border-2 border-green-500 rounded-lg p-3 space-y-1">
                    <div className="text-sm text-green-700 font-bold">
                      ✅ {t('product_detail.discount_applied', { percent: discountPercent, label: discountLabel })}
                    </div>
                    <div className="text-xs text-green-600">
                      {t('product_detail.price_per_unit', { price: currentPrice.toFixed(2), original: product.price.toFixed(2) })}
                    </div>
                    <div className="text-lg font-bold text-green-700">
                      {t('product_detail.total_price', { price: (currentPrice * quantity).toFixed(2) })}
                      <span className="text-sm font-normal text-green-600 ml-2">
                        ({t('product_detail.you_save', { amount: ((product.price - currentPrice) * quantity).toFixed(2) })})
                      </span>
                    </div>
                  </div>
                )}
                {product.tieredDiscount && !hasDiscount && purchaseType === 'one-time' && (
                  <div className="text-sm text-gray-600 space-y-2">
                    <p className="font-semibold text-base">🎁 {t('product_detail.volume_discounts')}</p>
                    {product.tieredDiscount.map((tier, index) => {
                      const isBestValue = tier.minQuantity === 36; // Destacar la opción 3+1
                      const isFreeShipping = tier.freeShipping === true; // Pack Duo con envío gratis
                      const pricePerUnit = product.price * (1 - tier.discount / 100);
                      const actualQuantity = tier.actualQuantity || tier.minQuantity;
                      const totalPrice = pricePerUnit * actualQuantity;
                      const savings = (product.price * actualQuantity) - totalPrice;
                      
                      return (
                        <div 
                          key={index} 
                          className={`p-3 rounded-lg border-2 ${
                            isBestValue 
                              ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-orange-400'
                              : isFreeShipping
                              ? 'bg-gradient-to-r from-green-50 to-blue-50 border-green-400'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold">
                              {actualQuantity} {t('product_detail.units')} ({tier.label})
                            </span>
                            {isBestValue && (
                              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-2 py-1 rounded-full">
                                ⭐ {t('product_detail.best_value')}
                              </span>
                            )}
                            {isFreeShipping && (
                              <span className="bg-gradient-to-r from-green-500 to-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                🚚 {t('product_detail.free_shipping_badge')}
                              </span>
                            )}
                          </div>
                          {tier.description && (
                            <p className="text-xs text-gray-600 mb-1 italic">{tier.description}</p>
                          )}
                          <div className="text-xs space-y-0.5 mb-2">
                            {tier.discount > 0 && <p className="text-green-600 font-semibold">{t('product_detail.discount_percent', { percent: tier.discount })}</p>}
                            <p>{pricePerUnit.toFixed(2)}{t('product_detail.per_unit')}</p>
                            <p className="font-bold text-primary">
                              {t('product_detail.total_price', { price: totalPrice.toFixed(2) })}
                              {savings > 0 && <span className="text-green-600 ml-1">({t('product_detail.you_save', { amount: savings.toFixed(2) })})</span>}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              const quantityToAdd = tier.actualQuantity || tier.minQuantity;
                              addToCart(product, quantityToAdd, 'one-time', null);
                            }}
                            className={`w-full py-2 px-4 rounded-lg font-semibold text-white transition-all ${
                              isBestValue
                                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'
                                : 'bg-primary hover:bg-primary-dark'
                            }`}
                          >
                            {isBestValue ? t('product_detail.want_free_box') : isFreeShipping ? t('product_detail.add_pack_duo') : t('product_detail.add_units_to_cart', { count: tier.actualQuantity || tier.minQuantity })}
                          </button>
                        </div>
                      );
                    })}
                    <div className="border-t-2 border-gray-300 pt-2 mt-3">
                      <p className="text-sm font-semibold mb-2">{t('product_detail.custom_quantity')}</p>
                    </div>
                  </div>
                )}
                {product.volumeDiscount && !hasDiscount && purchaseType === 'one-time' && (
                  <div className="text-sm text-gray-600">
                    {t('product_detail.volume_discount_text', { min: product.volumeDiscount.minQuantity, percent: product.volumeDiscount.discount })}
                  </div>
                )}
                {purchaseType === 'one-time' && product.subscriptionAvailable && product.subscriptionFrequencies && product.subscriptionFrequencies.length > 0 && (
                  <div className="text-sm text-gray-600">
                    {t('product_detail.or_from_subscription', { price: (product.price * (1 - Math.max(...product.subscriptionFrequencies.map(f => f.discount)) / 100)).toFixed(2) })}
                  </div>
                )}
              </div>

              {/* Purchase type selector */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-primary mb-3">
                  {t('product_detail.purchase_type')}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setPurchaseType('one-time');
                      setSubscriptionFrequency(null);
                      // Resetear cantidad a 1 cuando se selecciona compra única
                      if (product.volumeDiscount?.minQuantity && quantity >= product.volumeDiscount.minQuantity) {
                        setQuantity(1);
                      }
                    }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      purchaseType === 'one-time'
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{t('product_detail.single_purchase')}</span>
                      {purchaseType === 'one-time' && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {product.price.toFixed(2)}€
                    </div>
                  </button>

                  {product.subscriptionAvailable && (
                    <button
                      onClick={() => {
                        setPurchaseType('subscription');
                        if (!subscriptionFrequency && product.subscriptionFrequencies.length > 0) {
                          setSubscriptionFrequency(product.subscriptionFrequencies[0].value);
                        }
                        // Ajustar cantidad al mínimo si hay volumeDiscount
                        if (product.volumeDiscount?.minQuantity && quantity < product.volumeDiscount.minQuantity) {
                          setQuantity(product.volumeDiscount.minQuantity);
                        }
                      }}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        purchaseType === 'subscription'
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Repeat className="w-4 h-4" />
                          <span className="font-semibold">{t('product_detail.subscription')}</span>
                        </div>
                        {purchaseType === 'subscription' && (
                          <Check className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div className="text-lg font-bold text-primary">
                        {t('product_detail.subscription_benefit', { percent: maxSubscriptionDiscount })}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {t('product_detail.subscription_price_note')}
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* Subscription frequency selector */}
              {purchaseType === 'subscription' && product.subscriptionAvailable && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-primary mb-3">
                    {t('product_detail.delivery_frequency')}
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {product.subscriptionFrequencies.map((freq) => (
                      <button
                        key={freq.value}
                        onClick={() => setSubscriptionFrequency(freq.value)}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${
                          subscriptionFrequency === freq.value
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{freq.label}</div>
                            <div className="text-sm text-gray-600">
                              {t('product_detail.save_percent', { percent: freq.discount })} · {(product.price * (1 - freq.discount / 100)).toFixed(2)}{t('product_detail.per_unit')}
                            </div>
                          </div>
                          {subscriptionFrequency === freq.value && (
                            <Check className="w-5 h-5 text-primary" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {/* Preferred delivery options */}
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-primary mb-3">
                        {t('product_detail.preferred_day')}
                      </label>
                      <select
                        value={preferredDeliveryDay}
                        onChange={(e) => setPreferredDeliveryDay(e.target.value)}
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-all"
                      >
                        <option value="">{t('product_detail.select_day')}</option>
                        <option value="monday">{t('product_detail.monday')}</option>
                        <option value="tuesday">{t('product_detail.tuesday')}</option>
                        <option value="wednesday">{t('product_detail.wednesday')}</option>
                        <option value="thursday">{t('product_detail.thursday')}</option>
                        <option value="friday">{t('product_detail.friday')}</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-primary mb-3">
                        {t('product_detail.select_time')}
                      </label>
                      <select
                        value={preferredTimeSlot}
                        onChange={(e) => setPreferredTimeSlot(e.target.value)}
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-all"
                      >
                        <option value="">{t('product_detail.select_time')}</option>
                        <option value="morning">{t('product_detail.morning')}</option>
                        <option value="afternoon">{t('product_detail.afternoon')}</option>
                        <option value="evening">{t('product_detail.evening')}</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-primary mb-3">
                        {t('product_detail.select_day')}
                      </label>
                      <select
                        value={preferredDayOfMonth}
                        onChange={(e) => setPreferredDayOfMonth(e.target.value)}
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-all"
                      >
                        <option value="">{t('product_detail.select_day')}</option>
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {/* Subscription terms notice */}
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-primary">{t('product_detail.subscription_terms')}</span> {t('product_detail.subscription_terms_text')}
                    </p>
                  </div>
                </div>
              )}

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
                            ? 'border-primary ring-2 ring-primary ring-offset-2'
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
                          <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
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
              {product.slug !== 'estuche-regalo' && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-primary mb-3">
                  {t('product_detail.quantity')}
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const minQty = (purchaseType === 'subscription' && product.volumeDiscount?.minQuantity) 
                        ? product.volumeDiscount.minQuantity 
                        : 1;
                      setQuantity(Math.max(minQty, quantity - 1));
                    }}
                    className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-xl transition-colors"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const minQty = (purchaseType === 'subscription' && product.volumeDiscount?.minQuantity) 
                        ? product.volumeDiscount.minQuantity 
                        : 1;
                      setQuantity(Math.max(minQty, parseInt(e.target.value) || minQty));
                    }}
                    className="w-20 h-12 text-center border-2 border-gray-200 rounded-lg font-semibold text-lg focus:outline-none focus:border-primary"
                    min={(purchaseType === 'subscription' && product.volumeDiscount?.minQuantity) ? product.volumeDiscount.minQuantity : 1}
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-xl transition-colors"
                  >
                    +
                  </button>
                  {/* Stock oculto temporalmente */}
                  {false && product.stock < 10 && (
                    <span className="text-sm text-orange-600 font-semibold ml-2">
                      {t('product_detail.only_left', { count: product.stock })}
                    </span>
                  )}
                </div>
                {purchaseType === 'subscription' && product.volumeDiscount?.minQuantity && (
                  <p className="text-sm text-primary/70 mt-2">
                    {t('product_detail.min_subscription', { min: product.volumeDiscount.minQuantity })}
                  </p>
                )}
              </div>
              )}

              {/* Addons section */}
              {product.addons && product.addons.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-primary mb-3">{t('product_detail.optional_addons')}</h3>
                  <div className="space-y-3">
                    {product.addons.map((addon, idx) => {
                      const addonProduct = products.find(p => p.slug === addon.productSlug);
                      const isSelected = selectedAddons[addon.productSlug]?.selected || false;
                      const addonQty = selectedAddons[addon.productSlug]?.quantity || 1;
                      
                      return (
                        <div key={idx} className={`p-4 border-2 rounded-lg transition-all ${
                          isSelected ? 'border-primary bg-primary/5' : 'border-gray-200'
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
                              className="w-5 h-5 text-primary focus:ring-primary"
                            />
                            <label htmlFor={`addon-${idx}`} className="flex-1 cursor-pointer">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-sm font-medium text-gray-700">{addon.label}</span>
                                  {addon.variantId && (
                                    <span className="text-xs text-gray-500 block">{t('product_detail.model')}: {addon.variantId.replace('-', ' ')}</span>
                                  )}
                                </div>
                                {addonProduct && (
                                  <span className="text-sm font-bold text-primary">5.00€</span>
                                )}
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
                                  Total: {(5 * addonQty).toFixed(2)}€
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
              {product.soldOut ? (
                <SoldOutNotification productName={product.name} productSlug={product.slug} />
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={handleBuyNow}
                    className="w-full bg-primary text-white py-4 rounded-lg font-semibold text-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    {t('product_detail.buy_now')}
                  </button>
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-white border-2 border-primary text-primary py-4 rounded-lg font-semibold text-lg hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {t('product_detail.add_to_cart')}
                  </button>
                </div>
              )}

              {/* Trust badges - Mensajes de confianza */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{t('product_detail.shipping_time')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>{t('product_detail.returns')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                  <span className="text-green-600 mt-0.5">✓</span>
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
              ? products.filter(p => product.relatedProducts.includes(p.slug))
              : products.filter(p => p.id !== product.id && p.category === product.category).slice(0, 3)
            ).map(relatedProduct => (
                <Link
                  key={relatedProduct.id}
                  to={`/producto/${relatedProduct.slug}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow group"
                >
                  <div className="relative h-48 bg-gray-200 overflow-hidden">
                    {(relatedProduct.image || relatedProduct.images?.[0]) ? (
                      <img 
                        src={relatedProduct.image || relatedProduct.images?.[0]} 
                        alt={relatedProduct.name}
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
                    <p className="text-lg font-bold text-primary">{relatedProduct.price.toFixed(2)}€</p>
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

