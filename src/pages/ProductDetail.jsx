import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import { ShoppingCart, ArrowLeft, Check, Repeat, Tag, Package, Leaf } from 'lucide-react';
import { motion } from 'framer-motion';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const product = products.find(p => p.slug === slug);
  
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
          <h1 className="text-2xl font-bold text-primary mb-4">Producto no encontrado</h1>
          <Link to="/productos" className="text-primary hover:underline">
            Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  // Calculate price with volume discount
  const hasVolumeDiscount = product.volumeDiscount && quantity >= product.volumeDiscount.minQuantity && purchaseType === 'one-time';
  const volumeDiscountedPrice = hasVolumeDiscount 
    ? product.price * (1 - product.volumeDiscount.discount / 100)
    : product.price;
  
  const currentPrice = purchaseType === 'subscription' 
    ? product.priceSubscription 
    : volumeDiscountedPrice;
  
  const selectedFrequency = product.subscriptionFrequencies?.find(f => f.value === subscriptionFrequency);

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
            to="/productos" 
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a la tienda
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
                {product.category}
              </p>

              {/* Product name */}
              <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                {product.name}
              </h1>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {product.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 text-xs bg-accent/50 text-primary px-3 py-1 rounded-full"
                  >
                    <Leaf className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>

              {/* Badges */}
              {product.badges && product.badges.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {product.badges.map((badge, index) => (
                    <span
                      key={index}
                      className={`${badge.color} text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg uppercase tracking-wide`}
                    >
                      {badge.text}
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
                <span>Contenido: {product.weight}</span>
              </div>

              {/* Price */}
              <div className="bg-accent/30 rounded-lg p-6 mb-6">
                <div className="text-4xl font-bold text-primary mb-2">
                  {currentPrice ? currentPrice.toFixed(2) : product.price.toFixed(2)}€
                </div>
                {purchaseType === 'subscription' && selectedFrequency && (
                  <div className="text-sm text-gray-600">
                    Ahorras {selectedFrequency.discount}% con suscripción {selectedFrequency.label.toLowerCase()}
                  </div>
                )}
                {hasVolumeDiscount && (
                  <div className="text-sm text-green-600 font-semibold">
                    ¡Descuento por volumen aplicado! Ahorras {product.volumeDiscount.discount}% ({quantity} unidades)
                  </div>
                )}
                {product.volumeDiscount && !hasVolumeDiscount && purchaseType === 'one-time' && (
                  <div className="text-sm text-gray-600">
                    Compra {product.volumeDiscount.minQuantity} o más unidades y ahorra {product.volumeDiscount.discount}%
                  </div>
                )}
                {purchaseType === 'one-time' && product.subscriptionAvailable && (
                  <div className="text-sm text-gray-600">
                    o desde {product.priceSubscription.toFixed(2)}€ con suscripción
                  </div>
                )}
              </div>

              {/* Purchase type selector */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-primary mb-3">
                  Tipo de compra
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
                      <span className="font-semibold">Compra única</span>
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
                          <span className="font-semibold">Suscripción</span>
                        </div>
                        {purchaseType === 'subscription' && (
                          <Check className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div className="text-2xl font-bold text-primary">
                        {product.priceSubscription.toFixed(2)}€
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Ahorra hasta {Math.max(...product.subscriptionFrequencies.map(f => f.discount))}%
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* Subscription frequency selector */}
              {purchaseType === 'subscription' && product.subscriptionAvailable && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-primary mb-3">
                    Frecuencia de entrega
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
                              Ahorra {freq.discount}% · {(product.priceSubscription * (1 - freq.discount / 100)).toFixed(2)}€/unidad
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
                        Día de la semana preferible
                      </label>
                      <select
                        value={preferredDeliveryDay}
                        onChange={(e) => setPreferredDeliveryDay(e.target.value)}
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-all"
                      >
                        <option value="">Selecciona un día</option>
                        <option value="monday">Lunes</option>
                        <option value="tuesday">Martes</option>
                        <option value="wednesday">Miércoles</option>
                        <option value="thursday">Jueves</option>
                        <option value="friday">Viernes</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-primary mb-3">
                        Franja horaria preferible
                      </label>
                      <select
                        value={preferredTimeSlot}
                        onChange={(e) => setPreferredTimeSlot(e.target.value)}
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-all"
                      >
                        <option value="">Selecciona una franja</option>
                        <option value="morning">Mañana (9:00 - 14:00)</option>
                        <option value="afternoon">Tarde (14:00 - 18:00)</option>
                        <option value="evening">Noche (18:00 - 21:00)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-primary mb-3">
                        Día del mes preferible
                      </label>
                      <select
                        value={preferredDayOfMonth}
                        onChange={(e) => setPreferredDayOfMonth(e.target.value)}
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-all"
                      >
                        <option value="">Selecciona un día</option>
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {/* Subscription terms notice */}
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-primary">Condiciones de suscripción:</span> Esta suscripción tiene una duración de 12 meses. Los precios se revisan anualmente. Al finalizar el periodo, podrás cancelar o renovar tu suscripción.
                    </p>
                  </div>
                </div>
              )}

              {/* Variant selector with individual quantities */}
              {product.variants && product.variants.length > 0 && product.slug === 'estuche-regalo' ? (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-primary mb-3">
                    Selecciona los diseños y cantidades (máximo 12 estuches de cada tipo)
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
                      Total: {Object.values(variantQuantities).reduce((sum, q) => sum + q, 0)} estuches seleccionados
                    </p>
                  </div>
                </div>
              ) : product.variants && product.variants.length > 0 ? (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-primary mb-3">
                    Selecciona el diseño
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
                  Cantidad
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
                      Solo quedan {product.stock}
                    </span>
                  )}
                </div>
                {purchaseType === 'subscription' && product.volumeDiscount?.minQuantity && (
                  <p className="text-sm text-primary/70 mt-2">
                    Mínimo {product.volumeDiscount.minQuantity} unidades para suscripción
                  </p>
                )}
              </div>
              )}

              {/* Addons section */}
              {product.addons && product.addons.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-primary mb-3">Complementos opcionales</h3>
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
                                    <span className="text-xs text-gray-500 block">Modelo: {addon.variantId.replace('-', ' ')}</span>
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
                                Cantidad de estuches
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

              {/* Action buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleBuyNow}
                  className="w-full bg-primary text-white py-4 rounded-lg font-semibold text-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  Comprar Ahora
                </button>
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-white border-2 border-primary text-primary py-4 rounded-lg font-semibold text-lg hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Añadir al Carrito
                </button>
              </div>

              {/* Additional info */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="font-bold text-primary mb-3">{product.category === 'Packs' ? 'Material' : 'Ingredientes'}</h3>
                <p className="text-sm text-gray-700 mb-4">{product.ingredients}</p>

                {product.nutritionalInfo && (
                  <>
                    {product.nutritionalInfo.perfilSabor ? (
                      <>
                        <h3 className="font-bold text-primary mb-3">Perfil de Sabor</h3>
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-700 font-medium">Frutado:</span>
                            <span className="font-semibold text-primary">{product.nutritionalInfo.perfilSabor.frutado}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-700 font-medium">Amargo:</span>
                            <span className="font-semibold text-primary">{product.nutritionalInfo.perfilSabor.amargo}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-700 font-medium">Picante:</span>
                            <span className="font-semibold text-primary">{product.nutritionalInfo.perfilSabor.picante}</span>
                          </div>
                        </div>
                        {product.nutritionalInfo.notasCata && (
                          <div className="mb-4">
                            <h3 className="font-bold text-primary mb-3 mt-6">Notas de Cata</h3>
                            <p className="text-sm text-gray-700 italic">{product.nutritionalInfo.notasCata}</p>
                          </div>
                        )}
                        {product.nutritionalInfo.idealPara && (
                          <>
                            <h3 className="font-bold text-primary mb-3 mt-6">Ideal Para</h3>
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
                        <h3 className="font-bold text-primary mb-3">Información Nutricional (por 100g/ml)</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="bg-gray-50 p-2 rounded">
                            <span className="text-gray-600">Calorías:</span>
                            <span className="font-semibold ml-2">{product.nutritionalInfo.calories}</span>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <span className="text-gray-600">Carbohidratos:</span>
                            <span className="font-semibold ml-2">{product.nutritionalInfo.carbs}</span>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <span className="text-gray-600">Proteínas:</span>
                            <span className="font-semibold ml-2">{product.nutritionalInfo.protein}</span>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <span className="text-gray-600">Grasas:</span>
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

        {/* Related products section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-primary mb-8 text-center">
            También te puede interesar
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products
              .filter(p => p.id !== product.id && p.category === product.category)
              .slice(0, 3)
              .map(relatedProduct => (
                <Link
                  key={relatedProduct.id}
                  to={`/producto/${relatedProduct.slug}`}
                  className="bg-white rounded-lg shadow-md p-4 hover:shadow-xl transition-shadow"
                >
                  <div className="h-48 bg-gray-200 rounded mb-3" />
                  <h3 className="font-semibold text-primary mb-2">{relatedProduct.name}</h3>
                  <p className="text-lg font-bold text-primary">{relatedProduct.price.toFixed(2)}€</p>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

