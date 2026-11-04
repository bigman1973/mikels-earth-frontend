export const CART_STORAGE_KEY = 'mikels_cart';

// El almacenamiento del navegador no acredita promociones ni sus badges.
// CartProvider vuelve a resolver cada referencia contra el catálogo antes de
// permitir cupón/pago; nunca recupera inPromotion=true/false desde localStorage.
export const withoutStoredPromotionFields = (item) => Object.fromEntries(
  Object.entries(item).filter(([key]) => ![
    'inPromotion', 'in_promotion', 'badges', 'promotionValidated',
    'promotionSource', 'promotionValidationPending',
  ].includes(key)),
);

export const loadStoredCart = (storage) => {
  try {
    const savedCart = storage?.getItem(CART_STORAGE_KEY);
    if (!savedCart) return [];

    const parsedCart = JSON.parse(savedCart);
    return Array.isArray(parsedCart)
      ? parsedCart.filter((item) => item && typeof item === 'object' && !Array.isArray(item)).map(withoutStoredPromotionFields)
      : [];
  } catch {
    return [];
  }
};

// Clearing storage synchronously is important on the Stripe success route:
// the customer can reload before React has completed its next effect.
export const clearStoredCart = (storage) => {
  try {
    storage?.removeItem(CART_STORAGE_KEY);
  } catch {
    // Cart state still clears in memory if a browser blocks localStorage.
  }
};
