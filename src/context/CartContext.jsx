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
        
        // Apply volume discount if applicable (only for one-time purchases)
        const hasVolumeDiscount = product.volumeDiscount && quantity >= product.volumeDiscount.minQuantity && purchaseType === 'one-time';
        if (hasVolumeDiscount) {
          price = product.price * (1 - product.volumeDiscount.discount / 100);
        }
        
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
          volumeDiscount: hasVolumeDiscount ? product.volumeDiscount.discount : null
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
    // Validar código de descuento
    const normalizedCode = code.trim().toUpperCase();
    
    // Definir códigos estáticos disponibles (solo para compras únicas)
    const staticDiscountCodes = {
      'ME2025': {
        oneTimeDiscount: 10,
        subscriptionDiscount: 0,
        name: 'ME2025'
      },
      'MIKELSFRIENDS': {
        oneTimeDiscount: 10,
        subscriptionDiscount: 0,
        name: 'MIKELSFRIENDS'
      },
      'MIKELSFAMILY': {
        oneTimeDiscount: 20,
        subscriptionDiscount: 0,
        name: 'MIKELSFAMILY'
      },
      'BIENVENIDA10': {
        oneTimeDiscount: 10,
        subscriptionDiscount: 0,
        name: 'BIENVENIDA10'
      }
    };
    
    // Verificar si es un código estático
    if (staticDiscountCodes[normalizedCode]) {
      const discount = staticDiscountCodes[normalizedCode];
      setDiscountCode(normalizedCode);
      setAppliedDiscount({
        code: normalizedCode,
        oneTimeDiscount: discount.oneTimeDiscount,
        subscriptionDiscount: discount.subscriptionDiscount
      });
      return { success: true, message: 'Código aplicado correctamente' };
    }
    
    // Si no es estático, verificar si es un cupón único (formato MIKELS10-XXXXXXXX)
    if (normalizedCode.startsWith('MIKELS10-')) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/coupon/validate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ code: normalizedCode })
        });
        
        const data = await response.json();
        
        if (data.valid) {
          setDiscountCode(normalizedCode);
          setAppliedDiscount({
            code: normalizedCode,
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
        return { success: false, message: 'Error al validar el cupón' };
      }
    }
    
    // Si no es ni estático ni cupón único
    return { success: false, message: 'Código no válido' };
  };

  const removeDiscountCode = () => {
    setDiscountCode('');
    setAppliedDiscount(null);
  };

  const getCartTotal = () => {
    let total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Aplicar descuento adicional si hay código
    if (appliedDiscount) {
      cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
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
      const itemTotal = item.price * item.quantity;
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

