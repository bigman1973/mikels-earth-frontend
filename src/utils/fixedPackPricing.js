// Fixed packs are commercial options, not stackable discounts. The API sends
// their active `price`; legacy date-bounded packs retain their reservation and
// regular prices until their catalogue data is migrated.

const toFiniteNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseEnd = (value) => {
  const time = Date.parse(value || '');
  return Number.isFinite(time) ? time : null;
};

export const isFixedPack = (tier) => (
  Boolean(tier?.fixedPack)
  || (Number.isFinite(Number(tier?.actualQuantity || tier?.minQuantity))
    && (tier?.price != null || tier?.reservationPrice != null || tier?.regularPrice != null))
);

export const getFixedPackOptions = (item) => (
  (Array.isArray(item?.tieredDiscountConfig)
    ? item.tieredDiscountConfig
    : Array.isArray(item?.tieredDiscount)
      ? item.tieredDiscount
      : [])
    .filter(isFixedPack)
    .map((tier) => ({
      ...tier,
      actualQuantity: Math.max(1, Math.trunc(toFiniteNumber(tier.actualQuantity ?? tier.minQuantity, 1))),
    }))
    .sort((a, b) => a.actualQuantity - b.actualQuantity)
);

export const getFixedPackForQuantity = (item, quantity) => {
  const normalized = Math.max(1, Math.trunc(toFiniteNumber(quantity, 1)));
  return getFixedPackOptions(item).find((tier) => tier.actualQuantity === normalized) || null;
};

export const getFixedPackPrice = (tier, now = Date.now()) => {
  if (!tier) return null;
  const suppliedActivePrice = toFiniteNumber(tier.price, NaN);
  if (Number.isFinite(suppliedActivePrice)) {
    return suppliedActivePrice;
  }
  const reservationPrice = toFiniteNumber(tier.reservationPrice, NaN);
  const regularPrice = toFiniteNumber(tier.regularPrice, NaN);
  const end = parseEnd(tier.priceEndsAt);
  if (Number.isFinite(reservationPrice) && (end === null || now <= end)) return reservationPrice;
  if (Number.isFinite(regularPrice)) return regularPrice;
  return Number.isFinite(reservationPrice) ? reservationPrice : null;
};

export const getFixedPackUnitPrice = (tier, now = Date.now()) => {
  const price = getFixedPackPrice(tier, now);
  if (price === null) return null;
  return price / tier.actualQuantity;
};

export const resolveScheduledSinglePrice = (product, now = Date.now()) => {
  const single = getFixedPackForQuantity(product, 1);
  return single ? getFixedPackPrice(single, now) : toFiniteNumber(product?.price);
};
