import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();
const CART_STORAGE_KEY = 'mikels_cart';
const CART_SCHEMA_VERSION = 2;

const loadStoredCart = () => {
  if (typeof window === 'undefined') return [];
  const savedCart = localStorage.getItem(CART_STORAGE_KEY);
  if (!savedCart) return [];

  try {
    const parsed = JSON.parse(savedCart);
    if (Array.isArray(parsed)) return parsed; // Compatibilidad con carritos antiguos.
    if (parsed?.schemaVersion === CART_SCHEMA_VERSION && Array.isArray(parsed.items)) {
      return parsed.items;
    }
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
  }
  return [];
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(loadStoredCart);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [serverQuote, setServerQuote] = useState(null);

  // Persistir un esquema versionado. Los precios guardados son solo una vista local;
  // el backend los ignora y vuelve a calcular antes de crear Stripe.
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({
      schemaVersion: CART_SCHEMA_VERSION,
      savedAt: new Date().toISOString(),
      items: cart,
    }));
  }, [cart]);

  const addToCart = (product, quantity = 1, purchaseType = 'one-time', subscriptionFrequency = null) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(
        item => 
          item.id === product.id && 
          item.purchaseType === purchaseType &&
          item.subscriptionFrequency === subscriptionFrequency
      );

      if (existingItemIndex > -1) {
        // Si el producto ya existe con las mismas opciones, incrementar cantidad
        const newCart = [...prevCart];
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: newCart[existingItemIndex].quantity + quantity,
          serverUnitPrice: undefined,
          serverQuoteQuantity: undefined,
          catalogVersion: undefined,
        };
        return newCart;
      } else {
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
          sku: product.sku || null,
          name: product.name,
          slug: product.slug,
          image: product.image,
          price: price,
          originalPrice: product.price,
          quantity: quantity,
          purchaseType: purchaseType,
          subscriptionFrequency: subscriptionFrequency,
          weight: product.weight,
          volumeDiscountConfig: product.volumeDiscount || null,
          tieredDiscountConfig: product.tieredDiscount || null
        }];
      }
    });
    setServerQuote(null);
    setIsCartOpen(true);
  };

  const removeFromCart = (itemIndex) => {
    setServerQuote(null);
    setCart(prevCart => prevCart.filter((_, index) => index !== itemIndex));
  };

  const updateQuantity = (itemIndex, newQuantity) => {
    setServerQuote(null);
    if (newQuantity <= 0) {
      removeFromCart(itemIndex);
      return;
    }
    
    setCart(prevCart => {
      const newCart = [...prevCart];
      newCart[itemIndex] = {
        ...newCart[itemIndex],
        quantity: newQuantity,
        serverUnitPrice: undefined,
        serverQuoteQuantity: undefined,
        catalogVersion: undefined,
      };
      return newCart;
    });
  };

  const clearCart = () => {
    setServerQuote(null);
    setCart([]);
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
        setServerQuote(null);
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
    setServerQuote(null);
    setDiscountCode('');
    setAppliedDiscount(null);
  };

  // Calcular precio de un item con descuento por volumen si aplica
  const getItemPrice = (item) => {
    if (item.serverQuoteQuantity === item.quantity && Number.isFinite(item.serverUnitPrice)) {
      return item.serverUnitPrice;
    }

    let price = item.price;
    
    // Aplicar descuento escalonado (tieredDiscount) si existe
    if (item.tieredDiscountConfig && item.purchaseType === 'one-time') {
      // Encontrar el descuento más alto que aplique
      let applicableDiscount = 0;
      for (const tier of item.tieredDiscountConfig) {
        if (item.quantity >= tier.minQuantity) {
          applicableDiscount = tier.discount;
        }
      }
      if (applicableDiscount > 0) {
        price = item.price * (1 - applicableDiscount / 100);
      }
    }
    // Si no hay tieredDiscount, aplicar volumeDiscount simple
    else if (item.volumeDiscountConfig && 
        item.quantity >= item.volumeDiscountConfig.minQuantity && 
        item.purchaseType === 'one-time') {
      price = item.price * (1 - item.volumeDiscountConfig.discount / 100);
    }
    
    return price;
  };
  
  const getCartTotal = () => {
    if (serverQuote) return serverQuote.total / 100;

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
    if (serverQuote) return serverQuote.discount_amount / 100;
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

  // Aplicar una cotización vigente devuelta por el backend antes de crear Stripe.
  const applyServerQuote = (quote) => {
    const quotedItems = quote?.items || [];
    setServerQuote(quote);
    setCart((previousCart) => previousCart.map((item) => {
      const current = quotedItems.find((quoted) =>
        String(quoted.product_id) === String(item.id) ||
        (item.slug && quoted.slug === item.slug)
      );
      if (!current) return item;

      return {
        ...item,
        id: current.product_id,
        sku: current.sku || item.sku || null,
        slug: current.slug,
        name: current.name,
        image: current.image || item.image,
        weight: current.weight || item.weight,
        price: current.base_unit_amount / 100,
        originalPrice: current.base_unit_amount / 100,
        volumeDiscountConfig: current.volume_discount || null,
        tieredDiscountConfig: current.tiered_discount || null,
        serverUnitPrice: current.unit_amount / 100,
        serverQuoteQuantity: current.quantity,
        catalogVersion: quote.catalog_version || null,
      };
    }));
  };

  // Compatibilidad temporal con respuestas PRICE_MISMATCH de backends antiguos.
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
    getCartTotal,
    getCartCount,
    getItemPrice,
    updateItemPrices,
    applyServerQuote,
    serverQuote,
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

