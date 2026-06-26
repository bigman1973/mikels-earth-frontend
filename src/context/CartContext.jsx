import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem('mikels_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('mikels_cart', JSON.stringify(cart));
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
        newCart[existingItemIndex].quantity += quantity;
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
      newCart[itemIndex].quantity = newQuantity;
      return newCart;
    });
  };

  const clearCart = () => {
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

