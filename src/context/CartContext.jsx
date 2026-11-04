import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { CART_STORAGE_KEY, clearStoredCart, loadStoredCart, withoutStoredPromotionFields } from '../utils/cartStorage';
import { getVolumeDiscountedUnitPrice } from '../utils/volumePricing';
import { getFixedPackForQuantity } from '../utils/fixedPackPricing';
import { getCartEventPricing } from '../utils/cartTracking';
import { trackMetaAddToCart } from '../utils/metaPixel';
import { trackGA4AddToCart } from '../utils/googleAnalytics';
import { isReservationSale, normalizeReservationSaleProduct } from '../utils/reservationSale';
import { getTempranoHarvestIdentity, normalizeTempranoHarvestName } from '../utils/tempranoHarvestIdentity';
import {
  getCouponDiscountAmount,
  hasOrderCouponBlockingItem,
  PROMOTION_COUPON_MESSAGE,
  hasCouponEligibleItem,
  isPromotionProtectedItem,
  normalizePromotionProtectedCartItem,
} from '../utils/promotionProtection';
import { CART_PROMOTION_REVIEW_MESSAGE, getCartReferenceKey, getCouponItemReferences, reviewCartPromotions } from '../utils/cartPromotionValidation';

const API_URL = import.meta.env.VITE_API_URL || 'https://mikels-earth-backend-production.up.railway.app';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => (
    typeof window === 'undefined'
      ? []
      : loadStoredCart(window.localStorage)
        .map(normalizeReservationSaleProduct)
        .map(normalizePromotionProtectedCartItem)
        .map(normalizeTempranoHarvestName)
        .map((item) => ({ ...item, promotionValidationPending: true }))
  ));
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [savedDiscount, setAppliedDiscount] = useState(null);
  const [promotionReviewError, setPromotionReviewError] = useState('');
  const [reviewAttempt, setReviewAttempt] = useState(0);
  const cartRef = useRef(cart);
  cartRef.current = cart;
  const referenceKey = getCartReferenceKey(cart);
  const promotionReviewPending = cart.some((item) => item.promotionValidationPending);
  const promotionReviewReady = !promotionReviewPending;
  // La invalidación es también síncrona en el valor expuesto: ningún render
  // puede enviar un cupón antiguo con una línea promocionada a checkout.
  const appliedDiscount = hasOrderCouponBlockingItem(cart) || !promotionReviewReady ? null : savedDiscount;
  const couponMessage = hasOrderCouponBlockingItem(cart) ? PROMOTION_COUPON_MESSAGE : '';

  useEffect(() => {
    if (!hasOrderCouponBlockingItem(cart)) return;
    setAppliedDiscount(null);
    setDiscountCode('');
  }, [cart]);

  useEffect(() => {
    if (!cartRef.current.some((item) => item.promotionValidationPending)) return undefined;
    const controller = new AbortController();
    const snapshot = cartRef.current;
    setPromotionReviewError('');
    reviewCartPromotions({ cart: snapshot, apiUrl: API_URL, signal: AbortSignal.any([controller.signal, AbortSignal.timeout(5000)]) })
      .then((flags) => {
        if (controller.signal.aborted || getCartReferenceKey(cartRef.current) !== referenceKey) return;
        setCart((current) => current.map((item, index) => normalizePromotionProtectedCartItem({ ...item, ...flags[index], promotionValidationPending: false })));
      })
      .catch(() => { if (!controller.signal.aborted) setPromotionReviewError(CART_PROMOTION_REVIEW_MESSAGE); });
    return () => controller.abort();
  }, [referenceKey, reviewAttempt]);

  const retryPromotionReview = () => setReviewAttempt((attempt) => attempt + 1);

  // El estado se inicializa desde almacenamiento antes del primer render, así
  // que esta escritura nunca reemplaza un carrito existente por [] al recargar.
  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart.map(withoutStoredPromotionFields)));
  }, [cart]);

  const addToCart = (product, quantity = 1, purchaseType = 'one-time', subscriptionFrequency = null) => {
    const isAvailable = product.available !== false && !product.soldOut;
    const requestedQuantity = Math.max(1, Number(quantity) || 1);
    const cartProduct = normalizeTempranoHarvestName(normalizePromotionProtectedCartItem(normalizeReservationSaleProduct(product)));
    const harvestIdentity = getTempranoHarvestIdentity(cartProduct);
    const effectivePurchaseType = isPromotionProtectedItem(cartProduct) ? 'one-time' : purchaseType;
    const effectiveSubscriptionFrequency = effectivePurchaseType === 'subscription'
      ? subscriptionFrequency
      : null;
    const effectiveSelectedPackQuantity = cartProduct.selectedPackQuantity || null;
    const isClosedPackSelection = !isPromotionProtectedItem(cartProduct)
      && Boolean(getFixedPackForQuantity(cartProduct, requestedQuantity));
    const eventQuantity = isAvailable ? requestedQuantity : 0;
    if (eventQuantity > 0) {
      // This is the only point at which an item joins the persisted cart. It
      // precedes the optional journey to /checkout, so it captures abandonments.
      const eventPricing = getCartEventPricing(product, eventQuantity);
      trackMetaAddToCart(
        product,
        eventPricing.quantity,
        eventPricing.unitPrice,
        eventPricing.value,
      );
      trackGA4AddToCart(
        product,
        eventPricing.quantity,
        eventPricing.unitPrice,
        eventPricing.value,
      );
    }

    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(
        item => 
          item.id === product.id && 
          (!harvestIdentity || getTempranoHarvestIdentity(item)?.sku === harvestIdentity.sku) &&
          item.purchaseType === effectivePurchaseType &&
          item.subscriptionFrequency === effectiveSubscriptionFrequency &&
          (item.selectedPackQuantity || null) === effectiveSelectedPackQuantity &&
          (item.selectedVariant || null) === (cartProduct.selectedVariant || null) &&
          !isClosedPackSelection
      );

      if (existingItemIndex > -1) {
        // Si el producto ya existe con las mismas opciones, incrementar cantidad
        const newCart = [...prevCart];
        newCart[existingItemIndex] = normalizePromotionProtectedCartItem({
          ...newCart[existingItemIndex],
          inPromotion: cartProduct.inPromotion === true,
          promotionValidationPending: cartProduct.promotionValidationPending === true,
          quantity: newCart[existingItemIndex].quantity + requestedQuantity,
        });
        return newCart;
      } else {
        if (!isAvailable) return prevCart;
        // Si es nuevo, añadirlo al carrito
        let price = cartProduct.price;
        
        // Apply subscription discount based on frequency
        if (effectivePurchaseType === 'subscription' && effectiveSubscriptionFrequency) {
          const frequency = cartProduct.subscriptionFrequencies?.find(f => f.value === effectiveSubscriptionFrequency);
          if (frequency) {
            price = cartProduct.price * (1 - frequency.discount / 100);
          }
        }
        
        // NO aplicar descuento por volumen al precio guardado
        // Se calculará dinámicamente en getItemPrice()
        
        return [...prevCart, normalizePromotionProtectedCartItem({
          id: cartProduct.id,
          name: cartProduct.name,
          slug: cartProduct.slug,
          image: cartProduct.image,
          inPromotion: cartProduct.inPromotion === true,
          promotionValidationPending: cartProduct.promotionValidationPending === true,
          sku: product.sku || '',
          price: price,
          originalPrice: cartProduct.price,
          quantity: requestedQuantity,
          purchaseType: effectivePurchaseType,
          subscriptionFrequency: effectiveSubscriptionFrequency,
          selectedVariant: cartProduct.selectedVariant || null,
          selectedPackQuantity: cartProduct.selectedPackQuantity || null,
          variantName: cartProduct.variantName || null,
          weight: cartProduct.weight,
          couponProtectedCompositionSkus: cartProduct.couponProtectedCompositionSkus || null,
          reservationOnly: isReservationSale(cartProduct),
          reservationMessage: cartProduct.reservationMessage || '',
          volumeDiscountConfig: cartProduct.volumeDiscount || null,
          tieredDiscountConfig: cartProduct.tieredDiscount || cartProduct.tieredDiscountConfig || null
        })];
      }
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (itemIndex) => {
    setCart(prevCart => prevCart.filter((_, index) => index !== itemIndex));
  };

  const updateQuantity = (itemIndex, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemIndex);
      return;
    }
    
    setCart(prevCart => {
      const newCart = [...prevCart];
      // Los packs cerrados se seleccionan de nuevo desde su ficha; no se
      // convierten en una cantidad intermedia sin precio publicado.
      if (getFixedPackForQuantity(newCart[itemIndex], newCart[itemIndex].quantity)) {
        return newCart;
      }
      newCart[itemIndex].quantity = Math.max(1, Number(newQuantity) || 1);
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  // This is deliberately separate from a normal cart edit. It is called only
  // after the success route has received a saved paid Receipt from the API.
  const clearPaidOrderCart = () => {
    if (typeof window !== 'undefined') clearStoredCart(window.localStorage);
    setCart([]);
    setDiscountCode('');
    setAppliedDiscount(null);
    setIsCartOpen(false);
  };

  const applyDiscountCode = async (code) => {
    // Validar código de descuento contra el backend (todos los cupones centralizados)
    const normalizedCode = code.trim();
    if (hasOrderCouponBlockingItem(cartRef.current)) {
      setAppliedDiscount(null);
      setDiscountCode('');
      return { success: false, message: PROMOTION_COUPON_MESSAGE };
    }
    if (!promotionReviewReady) return { success: false, message: promotionReviewError || CART_PROMOTION_REVIEW_MESSAGE };
    if (!normalizedCode) {
      return { success: false, message: 'Introduce un código de descuento' };
    }
    if (!hasCouponEligibleItem(cart)) {
      return { success: false, message: 'Estos productos no participan en promociones ni cupones.' };
    }
    
    try {
      // Validar TODOS los cupones contra el backend (manuales, newsletter, post-compra, etc.)
      const snapshot = cartRef.current;
      const flags = await reviewCartPromotions({ cart: snapshot, apiUrl: API_URL });
      if (getCartReferenceKey(cartRef.current) !== getCartReferenceKey(snapshot)) return { success: false, message: 'El carrito ha cambiado. Vuelve a aplicar el código.' };
      const reviewedCart = snapshot.map((item, index) => normalizePromotionProtectedCartItem({ ...item, ...flags[index] }));
      setCart(reviewedCart);
      if (hasOrderCouponBlockingItem(reviewedCart)) {
        setAppliedDiscount(null);
        setDiscountCode('');
        return { success: false, message: PROMOTION_COUPON_MESSAGE };
      }
      const response = await fetch(`${API_URL}/api/coupon/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: normalizedCode, items: getCouponItemReferences(reviewedCart) })
      });
      
      const data = await response.json();
      if (hasOrderCouponBlockingItem(cartRef.current)) return { success: false, message: PROMOTION_COUPON_MESSAGE };
      if (getCartReferenceKey(cartRef.current) !== getCartReferenceKey(snapshot)) return { success: false, message: 'El carrito ha cambiado. Vuelve a aplicar el código.' };
      
      if (data.valid) {
        setDiscountCode(data.coupon.code);
        setAppliedDiscount({
          code: data.coupon.code,
          oneTimeDiscount: data.coupon.discount_percentage,
          subscriptionDiscount: 0,
          email: data.coupon.email
        });
        return { success: true, message: 'Cupón aplicado correctamente' };
      } else {
        return { success: false, message: data.message || 'Cupón no válido' };
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      return { success: false, message: 'Error al validar el cupón. Inténtalo de nuevo.' };
    }
  };

  const removeDiscountCode = () => {
    setDiscountCode('');
    setAppliedDiscount(null);
  };

  // Calcular precio de un item con descuento por volumen si aplica
  const getItemPrice = (item) => {
    item = normalizePromotionProtectedCartItem(item);
    if (item.purchaseType !== 'one-time') return item.price;
    return getVolumeDiscountedUnitPrice(item, item.quantity);
  };
  
  const getCartTotal = () => {
    let total = cart.reduce((sum, item) => sum + (getItemPrice(item) * item.quantity), 0);
    
    // La vigencia, uso único y vinculación personal se confirman de nuevo en
    // el servidor antes de crear el pago. El carrito refleja ese descuento
    // sobre los packs cerrados y el resto del catálogo.
    if (appliedDiscount) {
      total -= getCouponDiscountAmount(cart, appliedDiscount, getItemPrice);
    }
    
    return total;
  };
  
  const getDiscountAmount = () => {
    return getCouponDiscountAmount(cart, appliedDiscount, getItemPrice);
  };

  // Actualizar precios de items en el carrito (usado por validación PRICE_MISMATCH en checkout)
  const updateItemPrices = (priceUpdates) => {
    setCart(prevCart => {
      const newCart = [...prevCart];
      priceUpdates.forEach(update => {
        const itemIndex = newCart.findIndex(item => 
          item.name === update.product || 
          (item.slug && item.slug === update.slug)
        );
        if (itemIndex > -1) {
          newCart[itemIndex] = normalizePromotionProtectedCartItem({
            ...newCart[itemIndex],
            price: update.current_price,
            ...(isPromotionProtectedItem(newCart[itemIndex]) ? { originalPrice: update.current_price } : {}),
          });
        }
      });
      return newCart;
    });
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const toggleCart = () => {
    setIsCartOpen(prev => !prev);
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    clearPaidOrderCart,
    getCartTotal,
    getCartCount,
    getItemPrice,
    updateItemPrices,
    isCartOpen,
    toggleCart,
    setIsCartOpen,
    discountCode,
    appliedDiscount,
    applyDiscountCode,
    removeDiscountCode,
    couponMessage,
    promotionReviewReady,
    promotionReviewError,
    retryPromotionReview,
    getDiscountAmount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
