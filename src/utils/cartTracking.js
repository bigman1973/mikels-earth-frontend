import { getVolumeDiscountedUnitPrice } from './volumePricing.js';

// Meta and GA4 receive the effective unit amount, never a catalogue base price
// that is superseded by a published fixed pack or quantity tier.
export const getCartEventUnitPrice = (product, quantity) => (
  getVolumeDiscountedUnitPrice(product, quantity)
);
