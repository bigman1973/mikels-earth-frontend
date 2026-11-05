import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { CART_STORAGE_KEY, clearStoredCart, loadStoredCart } from '../utils/cartStorage';
import { getVolumeDiscountedUnitPrice } from '../utils/volumePricing';
import { getFixedPackForQuantity } from '../utils/fixedPackPricing';
import { getCartEventPricing } from '../utils/cartTracking';
import { trackMetaAddToCart } from '../utils/metaPixel';
import { trackGA4AddToCart } from '../utils/googleAnalytics';
import { isReservationSale, normalizeReservationSaleProduct } from '../utils/reservationSale';
import { getTempranoHarvestIdentity, normalizeTempranoHarvestName } from '../utils/tempranoHarvestIdentity';
import {
  getCouponDiscountAmount,
  hasCouponEligibleItem,
  hasPromotionProtectedItem,
  isPromotionProtectedItem,
  normalizePromotionProtectedCartItem,
  PROMOTION_COUPON_MESSAGE,
} from '../utils/promotionProtection';

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
  ));
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [couponError, setCouponError] = useState('');
  const cartRef = useRef(cart);
  const couponRequestRef = useRef(0);
  cartRef.current = cart;
  const hasProtectedPromotionLine = hasPromotionProtectedItem(cart);

  // Anular el código entero; el valor expuesto y el cálculo se bloquean ya en
  // este render, incluso antes del efecto y antes de entrar en checkout.
  useEffect(() => {
    if (hasProtectedPromotionLine) {
      couponRequestRef.current += 1;
      setDiscountCode('');
      setAppliedDiscount(null);
    }
  }, [cart, hasProtectedPromotionLine]);

  // El estado se inicializa desde almacenamiento antes del primer render, así
  // que esta escritura nunca reemplaza un carrito existente por [] al recargar.
  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
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
        const existingItem = newCart[existingItemIndex];
        newCart[existingItemIndex] = {
          ...existingItem,
          quantity: existingItem.quantity + requestedQuantity,
          ...(cartProduct.inPromotion !== undefined ? { inPromotion: existingItem.inPromotion || cartProduct.inPromotion } : {}),
          ...(cartProduct.in_promotion !== undefined ? { in_promotion: existingItem.in_promotion || cartProduct.in_promotion } : {}),
        };
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
          ...(cartProduct.inPromotion !== undefined ? { inPromotion: cartProduct.inPromotion } : {}),
          ...(cartProduct.in_promotion !== undefined ? { in_promotion: cartProduct.in_promotion } : {}),
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
    setCouponError('');
    couponRequestRef.current += 1;
    setIsCartOpen(false);
  };

  const applyDiscountCode = async (code) => {
    // Validar código de descuento contra el backend (todos los cupones centralizados)
    const normalizedCode = code.trim();
    if (!normalizedCode) {
      return { success: false, message: 'Introduce un código de descuento' };
    }
    const requestId = ++couponRequestRef.current;
    if (hasPromotionProtectedItem(cartRef.current)) {
      setDiscountCode('');
      setAppliedDiscount(null);
      setCouponError(PROMOTION_COUPON_MESSAGE);
      return { success: false, message: PROMOTION_COUPON_MESSAGE };
    }
    if (!hasCouponEligibleItem(cart)) {
      return { success: false, message: 'Estos productos no participan en promociones ni cupones.' };
    }
    
    try {
      // Validar TODOS los cupones contra el backend (manuales, newsletter, post-compra, etc.)
      const apiUrl = import.meta.env.VITE_API_URL || 'https://mikels-earth-backend-production.up.railway.app';
      const response = await fetch(`${apiUrl}/api/coupon/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        // Identidad solamente: la persistencia del servidor decide promoción,
        // vigencia y vinculación, nunca flags/precios/cantidades del cliente.
        body: JSON.stringify({
          code: normalizedCode,
          items: cart.map(({ id, slug, sku }) => ({ id, slug, sku })),
        })
      });
      
      const data = await response.json();

      if (hasPromotionProtectedItem(cartRef.current)) {
        return { success: false, message: PROMOTION_COUPON_MESSAGE };
      }
      if (requestId !== couponRequestRef.current || cartRef.current !== cart) {
        return { success: false, message: 'El carrito ha cambiado. Vuelve a aplicar el código.' };
      }
      if (data.error === 'PROMOTION_NOT_AVAILABLE' || data.message === PROMOTION_COUPON_MESSAGE) {
        setDiscountCode('');
        setAppliedDiscount(null);
        setCouponError(data.message || PROMOTION_COUPON_MESSAGE);
        return { success: false, message: data.message || PROMOTION_COUPON_MESSAGE };
      }
      
      if (response.ok && data.valid) {
        setCouponError('');
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
    setCouponError('');
    couponRequestRef.current += 1;
  };

  // Calcular precio de un item con descuento por volumen si aplica
  const getItemPrice = (item) => {
    item = normalizePromotionProtectedCartItem(item);
    if (item.purchaseType !== 'one-time') return item.price;
    return getVolumeDiscountedUnitPrice(item, item.quantity);
  };
  
  const getCartTotal = () => {
    let total = cart.reduce((sum, item) => sum + (getItemPrice(item) * item.quantity), 0);
    
    // El servidor confirma vigencia y vinculación; nunca se calcula una
    // fracción del cupón si el pedido contiene una línea en promoción.
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
    discountCode: hasProtectedPromotionLine ? '' : discountCode,
    appliedDiscount: hasProtectedPromotionLine ? null : appliedDiscount,
    couponError: hasProtectedPromotionLine ? PROMOTION_COUPON_MESSAGE : couponError,
    applyDiscountCode,
    removeDiscountCode,
    getDiscountAmount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
