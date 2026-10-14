import { getVolumeDiscountedLineTotal } from './volumePricing.js';

const normalizeQuantity = (quantity) => Math.max(1, Math.trunc(Number(quantity) || 1));
const money = (value) => Number(Number(value || 0).toFixed(2));

// Commerce platforms receive an exact line value, not a catalogue base price.
// Dividing a fixed pack (49,90 € / 3) needs more than two decimals per item.
export const getCartEventPricing = (product, quantity) => {
  const normalizedQuantity = normalizeQuantity(quantity);
  const value = money(getVolumeDiscountedLineTotal(product, normalizedQuantity));

  return {
    quantity: normalizedQuantity,
    value,
    unitPrice: Number((value / normalizedQuantity).toFixed(6)),
  };
};

export const getCartEventUnitPrice = (product, quantity) => (
  getCartEventPricing(product, quantity).unitPrice
);
