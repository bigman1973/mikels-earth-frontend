// The backend repeats this calculation from WebProduct at checkout.  Keep this
// small browser helper deterministic so the displayed cart amount and the
// server-validated amount use the same persisted tier configuration.

const toFiniteNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const getApplicableVolumeTier = (item, quantity = item?.quantity) => {
  const normalizedQuantity = Math.max(1, Math.trunc(toFiniteNumber(quantity, 1)));
  const tiers = Array.isArray(item?.tieredDiscountConfig)
    ? item.tieredDiscountConfig
    : [];

  let applicable = null;
  for (const tier of tiers) {
    const minQuantity = Math.trunc(toFiniteNumber(tier?.minQuantity));
    const discount = toFiniteNumber(tier?.discount);
    if (minQuantity > 0 && discount >= 0 && normalizedQuantity >= minQuantity) {
      if (!applicable || minQuantity > applicable.minQuantity) {
        applicable = { ...tier, minQuantity, discount };
      }
    }
  }

  if (applicable) return applicable;

  const simpleTier = item?.volumeDiscountConfig;
  if (simpleTier) {
    const minQuantity = Math.trunc(toFiniteNumber(simpleTier.minQuantity));
    const discount = toFiniteNumber(simpleTier.discount);
    if (minQuantity > 0 && discount >= 0 && normalizedQuantity >= minQuantity) {
      return { ...simpleTier, minQuantity, discount };
    }
  }

  return null;
};

export const getVolumeDiscountPercent = (item, quantity = item?.quantity) => (
  getApplicableVolumeTier(item, quantity)?.discount || 0
);

export const getVolumeDiscountedUnitPrice = (item, quantity = item?.quantity) => {
  const basePrice = toFiniteNumber(item?.price);
  const discount = getVolumeDiscountPercent(item, quantity);
  // A percentage over a cent price can need four decimal places per unit.
  // Normalize that decimal representation before it is serialized to the API
  // so 17.15 × 85% is sent as 14.5775, not 14.577499999999999.
  return Number((basePrice * (1 - discount / 100)).toFixed(4));
};

export const getVolumeDiscountedLineTotal = (item, quantity = item?.quantity) => (
  getVolumeDiscountedUnitPrice(item, quantity) * Math.max(1, Math.trunc(toFiniteNumber(quantity, 1)))
);
