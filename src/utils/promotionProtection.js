import { getIndependentPackIdentity, normalizeIndependentPackName } from './independentPacks.js';

export const TEMPRANO_SLUG = 'aceite-temprano-sin-filtrar';
export const TEMPRANO_SKU = 'MIKVET500';
export const TEMPRANO_FINAL_PRICE = 19.90;

export const PACK_COMPLETO_SLUG = 'pack-navidad-completo';
export const PACK_COMPLETO_SKU = 'MIKPACKF';

const PROTECTED_SINGLE_SKUS_BY_SLUG = Object.freeze({
  [TEMPRANO_SLUG]: TEMPRANO_SKU,
  'aceite-5l-caja-3': 'MIKVE5LP',
  'paraguayo-almibar': 'MIKPARA450',
});
const PROTECTED_SINGLE_SKUS = new Set(Object.values(PROTECTED_SINGLE_SKUS_BY_SLUG));

export const PROMOTION_COUPON_MESSAGE = 'Este código no se puede aplicar porque el pedido incluye productos en promoción.';
export const isInPromotion = (item = {}) => item?.inPromotion === true;
export const hasInPromotionItem = (cart = []) => Array.isArray(cart) && cart.some(isInPromotion);

const normalizedSku = (sku) => typeof sku === 'string' ? sku.trim().toUpperCase() : '';
const matchesIdentity = (item = {}, slug, sku) => {
  const suppliedSku = normalizedSku(item?.sku);
  // El SKU explícito prevalece sobre slugs antiguos/reutilizados. Los slugs son
  // solo el respaldo para el catálogo local y carritos antiguos sin SKU.
  return suppliedSku ? suppliedSku === sku : item?.slug === slug;
};

export const isTempranoPromotionProtectedItem = (item = {}) => (
  matchesIdentity(item, TEMPRANO_SLUG, TEMPRANO_SKU)
);

// El veto del pedido también cubre Temprano protegido y los packs BF exactos,
// sin convertirlos en un flag promocional ni ampliar la política a otros SKU.
export const hasOrderCouponBlockingItem = (cart = []) => (
  Array.isArray(cart) && cart.some((item) => (
    isInPromotion(item) || isTempranoPromotionProtectedItem(item) || Boolean(getIndependentPackIdentity(item))
  ))
);

const getProtectedCompositionSkus = (item = {}) => {
  const savedComposition = Array.isArray(item?.couponProtectedCompositionSkus)
    ? item.couponProtectedCompositionSkus.map(normalizedSku)
    : [];
  // Pack Completo ya contiene unidades protegidas. El respaldo también cubre
  // líneas persistidas anteriores a la incorporación de la composición.
  return matchesIdentity(item, PACK_COMPLETO_SLUG, PACK_COMPLETO_SKU)
    ? [...new Set([...savedComposition, ...PROTECTED_SINGLE_SKUS])]
    : savedComposition;
};

export const isPackCompletoPromotionProtectedItem = (item = {}) => (
  matchesIdentity(item, PACK_COMPLETO_SLUG, PACK_COMPLETO_SKU)
);

export const isPromotionProtectedItem = (item = {}) => {
  const sku = normalizedSku(item?.sku);
  if (isInPromotion(item) || getIndependentPackIdentity(item)) return true;
  const singleSku = sku || PROTECTED_SINGLE_SKUS_BY_SLUG[item?.slug];
  return PROTECTED_SINGLE_SKUS.has(singleSku)
    || isPackCompletoPromotionProtectedItem(item)
    || matchesIdentity(item, 'pack-temprano-premium', 'MIKPACKTP')
    || getProtectedCompositionSkus(item).some((componentSku) => PROTECTED_SINGLE_SKUS.has(componentSku));
};

export const hasPromotionProtectedItem = (cart = []) => (
  Array.isArray(cart) && cart.some(isPromotionProtectedItem)
);

export const hasCouponEligibleItem = (cart = []) => (
  Array.isArray(cart)
  && cart.some((item) => !isPromotionProtectedItem(item) && Number(item?.quantity) > 0)
);

const PROMOTION_METADATA = new Set([
  'originalPrice',
  'tieredDiscount',
  'tieredDiscountConfig',
  'volumeDiscount',
  'volumeDiscountConfig',
  'subscriptionAvailable',
  'subscriptionDiscount',
  'subscriptionFrequencies',
  'discoveryDiscount',
  'discoveryDiscounts',
]);

const withoutPromotionMetadata = (item) => Object.fromEntries(
  Object.entries(item).filter(([key]) => !PROMOTION_METADATA.has(key)),
);

// Solo Temprano tiene aquí un precio final previamente aprobado. Los demás
// conservan el precio normal suministrado por catálogo/API, sin hardcodearlo.
export const getPromotionProtectedUnitPrice = (item = {}) => {
  if (isTempranoPromotionProtectedItem(item)) return TEMPRANO_FINAL_PRICE;
  // Promoción y pack independiente ya tienen un precio final del servidor.
  if (isInPromotion(item) || getIndependentPackIdentity(item)) return Number(item.price) || 0;
  const fullPrice = item.purchaseType === 'subscription' && item.originalPrice != null
    ? item.originalPrice
    : item.price;
  const price = Number(fullPrice);
  return Number.isFinite(price) ? price : 0;
};

// Sanea catálogo/API/fallback y productos embebidos de add-ons, sin heredar la
// protección del producto padre a un complemento ordinario (p. ej. estuche).
export const normalizePromotionProtectedProduct = (product = {}) => {
  product = normalizeIndependentPackName(product);
  const normalized = isPromotionProtectedItem(product)
    ? { ...withoutPromotionMetadata(product), price: getPromotionProtectedUnitPrice(product) }
    : product;
  if (!Array.isArray(product.addons)) return normalized;
  return {
    ...normalized,
    addons: product.addons.map((addon) => (
      addon?.product
        ? { ...addon, product: normalizePromotionProtectedProduct(addon.product) }
        : addon
    )),
  };
};

// Cualquier cantidad del SKU base sigue siendo venta normal de unidades
// sueltas; no es una autorización para recuperar tiers antiguos ni packs BF.
export const normalizePromotionProtectedCartItem = (item = {}) => {
  item = normalizeIndependentPackName(item);
  if (!isPromotionProtectedItem(item)) return item;
  const price = getPromotionProtectedUnitPrice(item);
  return {
    ...withoutPromotionMetadata(item),
    price,
    ...(!isInPromotion(item) && !getIndependentPackIdentity(item) ? { originalPrice: price } : {}),
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
  if (hasOrderCouponBlockingItem(cart)) return 0;

  return cart.reduce((discountAmount, item) => {
    if (isPromotionProtectedItem(item)) return discountAmount;

    const unitPrice = Number(getItemPrice(item)) || 0;
    const quantity = Math.max(0, Number(item.quantity) || 0);
    return discountAmount + (unitPrice * quantity * (couponPercentForItem(item, appliedDiscount) / 100));
  }, 0);
};
