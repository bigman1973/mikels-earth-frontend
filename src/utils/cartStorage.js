export const CART_STORAGE_KEY = 'mikels_cart';

export const loadStoredCart = (storage) => {
  try {
    const savedCart = storage?.getItem(CART_STORAGE_KEY);
    if (!savedCart) return [];

    const parsedCart = JSON.parse(savedCart);
    return Array.isArray(parsedCart) ? parsedCart : [];
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
