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
