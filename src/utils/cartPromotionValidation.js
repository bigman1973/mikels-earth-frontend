import { isActiveProduct } from './productAccess.js';

export const CART_PROMOTION_REVIEW_MESSAGE = 'No se ha podido comprobar el estado de los productos. Vuelve a intentarlo antes de aplicar un código o continuar al pago.';
export const getCartReferenceKey = (cart = []) => JSON.stringify(cart.map(({ id, sku, slug, quantity, purchaseType, selectedVariant }) => [id ?? null, sku || '', slug || '', quantity, purchaseType || '', selectedVariant || '']));
export const getCouponItemReferences = (cart = []) => cart.map(({ id, slug, sku }) => ({ id, slug: slug || '', sku: sku || '' }));

// No utiliza el catálogo de /tienda (que excluye ocultos) ni campos persistidos.
// Ante error/inactivo/referencias contradictorias conserva las líneas del
// carrito, pero bloquea cupón/pago hasta poder confirmar el catálogo real.
export const reviewCartPromotions = async ({ cart, apiUrl, fetchImpl = fetch, signal }) => {
  const products = await Promise.all(cart.map(async (item) => {
    if (!item.slug) throw new Error(CART_PROMOTION_REVIEW_MESSAGE);
    const response = await fetchImpl(`${apiUrl}/api/products/${encodeURIComponent(item.slug)}?lang=es`, {
      signal: signal || AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(CART_PROMOTION_REVIEW_MESSAGE);
    const payload = await response.json();
    const product = payload.product || payload;
    if (!product || product.slug !== item.slug || !isActiveProduct(product)
      || (item.id != null && String(product.id) !== String(item.id))
      || (item.sku && String(product.sku || '').trim().toUpperCase() !== String(item.sku).trim().toUpperCase())) {
      throw new Error(CART_PROMOTION_REVIEW_MESSAGE);
    }
    return { inPromotion: product.inPromotion === true };
  }));
  return products;
};
