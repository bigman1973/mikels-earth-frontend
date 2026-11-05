export const TEMPRANO_SLUG = 'aceite-temprano-sin-filtrar';
export const TEMPRANO_SKU = 'MIKVET500';
export const TEMPRANO_FINAL_PRICE = 19.90;

export const PACK_COMPLETO_SLUG = 'pack-navidad-completo';
export const PACK_COMPLETO_SKU = 'MIKPACKF';

export const PROMOTION_COUPON_MESSAGE = 'Este código no se puede aplicar porque el pedido incluye productos en promoción.';
const PROMOTION_COLLABORATOR_CODES = new Set(['IRVIANCESTRAL', 'DR.GEMMAVALLS']);
export const normalizeCouponCode = (code) => typeof code === 'string' ? code.trim().toUpperCase() : '';
// Solo se pasa aquí un cupón validado por el servidor, nunca localStorage.
export const isPromotionAuthorizedCoupon = (coupon) => (
  coupon?.valid_in_promotion === true
  && PROMOTION_COLLABORATOR_CODES.has(normalizeCouponCode(coupon?.code))
);

// Veto de cupones únicamente: no modifica catálogo, precios ni packs/volumen.
const BF26_COUPON_PROTECTED_SKUS = new Set([
  'BF26-TEMP6', 'BF26-TEMP12', 'BF26-ECO6',
  'BF26-PARA3', 'BF26-PARA6', 'BF26-5L3',
]);

const PROTECTED_SINGLE_SKUS_BY_SLUG = Object.freeze({
  [TEMPRANO_SLUG]: TEMPRANO_SKU,
  'aceite-5l-caja-3': 'MIKVE5LP',
  'paraguayo-almibar': 'MIKPARA450',
});
const PROTECTED_SINGLE_SKUS = new Set(Object.values(PROTECTED_SINGLE_SKUS_BY_SLUG));

// Identidades autorizadas de packs independientes, NO altas de catálogo ni rutas.
// Nunca se convierte una cantidad del SKU base en uno de estos packs BF.
const AUTHORIZED_BF_PACK_SKUS = new Set([
  'MIKVE5LPBF3',
  'MIKBIO19BF6',
  'MIKPARA450BF3',
  'MIKPARA450BF6',
]);
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
  if (AUTHORIZED_BF_PACK_SKUS.has(sku)) return false;
  const singleSku = sku || PROTECTED_SINGLE_SKUS_BY_SLUG[item?.slug];
  return PROTECTED_SINGLE_SKUS.has(singleSku)
    || isPackCompletoPromotionProtectedItem(item)
    || getProtectedCompositionSkus(item).some((componentSku) => PROTECTED_SINGLE_SKUS.has(componentSku));
};

// Los flags son señales conservadoras, nunca permisos: false no anula identidad.
// El servidor resuelve la promoción real por persistencia e identidad.
export const isUnconditionallyCouponProtectedItem = (item = {}) => (
  isPromotionProtectedItem(item)
  || normalizedSku(item?.sku) === 'MIKPACKTP'
);

export const hasUnconditionallyCouponProtectedItem = (cart = []) => (
  Array.isArray(cart) && cart.some(isUnconditionallyCouponProtectedItem)
);

export const isCouponProtectedItem = (item = {}, { authorizedCoupon } = {}) => (
  isUnconditionallyCouponProtectedItem(item)
  || (!isPromotionAuthorizedCoupon(authorizedCoupon) && (
    Boolean(item?.inPromotion || item?.in_promotion)
    || BF26_COUPON_PROTECTED_SKUS.has(normalizedSku(item?.sku))
  ))
);

export const hasPromotionProtectedItem = (cart = [], options) => (
  Array.isArray(cart) && cart.some((item) => isCouponProtectedItem(item, options))
);

export const hasCouponEligibleItem = (cart = [], options) => (
  Array.isArray(cart)
  && !hasPromotionProtectedItem(cart, options)
  && cart.some((item) => Number(item?.quantity) > 0)
);

// La promoción global no debe ocultar el formulario ni impedir llegar al API.
export const canValidateCouponForCart = (cart = []) => (
  Array.isArray(cart)
  && !hasUnconditionallyCouponProtectedItem(cart)
  && cart.some((item) => Number(item?.quantity) > 0)
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
  const fullPrice = item.purchaseType === 'subscription' && item.originalPrice != null
    ? item.originalPrice
    : item.price;
  const price = Number(fullPrice);
  return Number.isFinite(price) ? price : 0;
};

// Sanea catálogo/API/fallback y productos embebidos de add-ons, sin heredar la
// protección del producto padre a un complemento ordinario (p. ej. estuche).
export const normalizePromotionProtectedProduct = (product = {}) => {
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
  if (!isPromotionProtectedItem(item)) return item;
  const price = getPromotionProtectedUnitPrice(item);
  return {
    ...withoutPromotionMetadata(item),
    price,
    originalPrice: price,
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
  if (!appliedDiscount || !hasCouponEligibleItem(cart, { authorizedCoupon: appliedDiscount })) return 0;

  return cart.reduce((discountAmount, item) => {
    const unitPrice = Number(getItemPrice(item)) || 0;
    const quantity = Math.max(0, Number(item.quantity) || 0);
    return discountAmount + (unitPrice * quantity * (couponPercentForItem(item, appliedDiscount) / 100));
  }, 0);
};
