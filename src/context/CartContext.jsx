import { createContext, useContext, useState, useEffect } from 'react';
import { CART_STORAGE_KEY, clearStoredCart, loadStoredCart } from '../utils/cartStorage';
import { getVolumeDiscountedUnitPrice } from '../utils/volumePricing';

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
    typeof window === 'undefined' ? [] : loadStoredCart(window.localStorage)
  ));
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);

  // El estado se inicializa desde almacenamiento antes del primer render, así
  // que esta escritura nunca reemplaza un carrito existente por [] al recargar.
  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1, purchaseType = 'one-time', subscriptionFrequency = null) => {
    setCart(prevCart => {
      const sellableStock = Math.max(0, Number(product.stock) || 0);
      const requestedQuantity = Math.max(1, Number(quantity) || 1);
      const existingItemIndex = prevCart.findIndex(
        item => 
          item.id === product.id && 
          item.purchaseType === purchaseType &&
          item.subscriptionFrequency === subscriptionFrequency &&
          (item.selectedVariant || null) === (product.selectedVariant || null)
      );

      if (existingItemIndex > -1) {
        // Si el producto ya existe con las mismas opciones, incrementar cantidad
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity = Math.min(
          sellableStock,
          newCart[existingItemIndex].quantity + requestedQuantity,
        );
        return newCart;
      } else {
        if (sellableStock < 1) return prevCart;
        // Si es nuevo, añadirlo al carrito
        let price = product.price;
        
        // Apply subscription discount based on frequency
        if (purchaseType === 'subscription' && subscriptionFrequency) {
          const frequency = product.subscriptionFrequencies?.find(f => f.value === subscriptionFrequency);
          if (frequency) {
            price = product.price * (1 - frequency.discount / 100);
          }
        }
        
        // NO aplicar descuento por volumen al precio guardado
        // Se calculará dinámicamente en getItemPrice()
        
        return [...prevCart, {
          id: product.id,
          name: product.name,
          slug: product.slug,
          image: product.image,
          price: price,
          originalPrice: product.price,
          quantity: Math.min(sellableStock, requestedQuantity),
          stock: sellableStock,
          purchaseType: purchaseType,
          subscriptionFrequency: subscriptionFrequency,
          selectedVariant: product.selectedVariant || null,
          variantName: product.variantName || null,
          weight: product.weight,
          reservationOnly: product.reservationOnly === true,
          reservationMessage: product.reservationMessage || '',
          volumeDiscountConfig: product.volumeDiscount || null,
          tieredDiscountConfig: product.tieredDiscount || null
        }];
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
      const limit = Math.max(0, Number(newCart[itemIndex].stock) || 0);
      newCart[itemIndex].quantity = Math.min(limit, newQuantity);
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
    
    if (!normalizedCode) {
      return { success: false, message: 'Introduce un código de descuento' };
    }
    
    try {
      // Validar TODOS los cupones contra el backend (manuales, newsletter, post-compra, etc.)
      const apiUrl = import.meta.env.VITE_API_URL || 'https://mikels-earth-backend-production.up.railway.app';
      const response = await fetch(`${apiUrl}/api/coupon/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: normalizedCode })
      });
      
      const data = await response.json();
      
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
    if (item.purchaseType !== 'one-time') return item.price;
    return getVolumeDiscountedUnitPrice(item, item.quantity);
  };
  
  const getCartTotal = () => {
    let total = cart.reduce((sum, item) => sum + (getItemPrice(item) * item.quantity), 0);
    
    // Aplicar descuento adicional si hay código
    if (appliedDiscount) {
      cart.forEach(item => {
        const itemTotal = getItemPrice(item) * item.quantity;
        const discount = item.purchaseType === 'subscription' 
          ? appliedDiscount.subscriptionDiscount 
          : appliedDiscount.oneTimeDiscount;
        total -= itemTotal * (discount / 100);
      });
    }
    
    return total;
  };
  
  const getDiscountAmount = () => {
    if (!appliedDiscount) return 0;
    
    let discountAmount = 0;
    cart.forEach(item => {
      const itemTotal = getItemPrice(item) * item.quantity;
      const discount = item.purchaseType === 'subscription' 
        ? appliedDiscount.subscriptionDiscount 
        : appliedDiscount.oneTimeDiscount;
      discountAmount += itemTotal * (discount / 100);
    });
    
    return discountAmount;
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
          newCart[itemIndex] = { ...newCart[itemIndex], price: update.current_price };
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
    getDiscountAmount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
