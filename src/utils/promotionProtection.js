export const TEMPRANO_SLUG = 'aceite-temprano-sin-filtrar';
export const TEMPRANO_SKU = 'MIKVET500';
export const TEMPRANO_FINAL_PRICE = 19.90;

export const PACK_COMPLETO_SLUG = 'pack-navidad-completo';
export const PACK_COMPLETO_SKU = 'MIKPACKF';

// El Pack Completo contiene la botella Temprano MIKVET500. Se conserva aquí para
// que las líneas persistidas de versiones anteriores también se protejan aunque
// no hubieran guardado todavía su composición en el carrito.
const PACK_COMPLETO_COMPONENT_SKUS = Object.freeze([TEMPRANO_SKU]);

const matchesIdentity = (item = {}, slug, sku) => (
  item?.slug === slug || item?.sku === sku
);

export const isTempranoPromotionProtectedItem = (item = {}) => (
  matchesIdentity(item, TEMPRANO_SLUG, TEMPRANO_SKU)
);

const getProtectedCompositionSkus = (item = {}) => {
  const savedComposition = Array.isArray(item.couponProtectedCompositionSkus)
    ? item.couponProtectedCompositionSkus
    : [];

  return matchesIdentity(item, PACK_COMPLETO_SLUG, PACK_COMPLETO_SKU)
    ? [...new Set([...savedComposition, ...PACK_COMPLETO_COMPONENT_SKUS])]
    : savedComposition;
};

export const isPackCompletoPromotionProtectedItem = (item = {}) => (
  matchesIdentity(item, PACK_COMPLETO_SLUG, PACK_COMPLETO_SKU)
  && getProtectedCompositionSkus(item).includes(TEMPRANO_SKU)
);

export const isPromotionProtectedItem = (item = {}) => (
  isTempranoPromotionProtectedItem(item)
  || isPackCompletoPromotionProtectedItem(item)
);

export const hasPromotionProtectedItem = (cart = []) => (
  Array.isArray(cart) && cart.some(isPromotionProtectedItem)
);

// Normaliza cualquier línea antigua persistida: Temprano se vende únicamente
// como botella a 19,90 €, sin descuentos de suscripción, volumen ni packs.
export const normalizePromotionProtectedCartItem = (item = {}) => {
  if (!isTempranoPromotionProtectedItem(item)) return item;

  const {
    tieredDiscount,
    tieredDiscountConfig,
    volumeDiscount,
    volumeDiscountConfig,
    subscriptionDiscount,
    subscriptionFrequencies,
    discoveryDiscount,
    discoveryDiscounts,
    ...normalizedItem
  } = item;

  return {
    ...normalizedItem,
    price: TEMPRANO_FINAL_PRICE,
    originalPrice: TEMPRANO_FINAL_PRICE,
    purchaseType: 'one-time',
    subscriptionFrequency: null,
    selectedPackQuantity: null,
  };
};

const couponPercentForItem = (item, appliedDiscount) => (
  item.purchaseType === 'subscription'
    ? Number(appliedDiscount?.subscriptionDiscount) || 0
    : Number(appliedDiscount?.oneTimeDiscount) || 0
);

export const getCouponDiscountAmount = (cart = [], appliedDiscount, getItemPrice) => {
  if (!appliedDiscount || !Array.isArray(cart)) return 0;

  return cart.reduce((discountAmount, item) => {
    if (isPromotionProtectedItem(item)) return discountAmount;

    const unitPrice = Number(getItemPrice(item)) || 0;
    const quantity = Math.max(0, Number(item.quantity) || 0);
    return discountAmount + (unitPrice * quantity * (couponPercentForItem(item, appliedDiscount) / 100));
  }, 0);
};
