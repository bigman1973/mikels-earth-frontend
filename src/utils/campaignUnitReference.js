import { getIndependentPackIdentity } from './independentPacks.js';

export const CAMPAIGN_DISCOUNT_HEADLINE = 'HASTA EL 50 % DE DESCUENTO';

// Display-only metadata from the official backend; never used by cart/checkout.
// A slug alone, stale originalPrice or generic promotion flag cannot opt in.
export const getCampaignUnitReference = (product = {}) => {
  const pack = getIndependentPackIdentity(product);
  const data = product.pricingData;
  if (!pack || String(product.sku || '').trim() !== pack.sku
    || !data || data.campaign !== 'BF26' || data.basis !== 'unit') return null;
  const unitPrice = Number(data.unitPrice);
  const usualUnitPrice = Number(data.usualUnitPrice);
  const discountPercent = data.discountPercent;
  if (!Number.isFinite(unitPrice) || unitPrice <= 0
    || !Number.isFinite(usualUnitPrice) || usualUnitPrice <= unitPrice
    || !Number.isInteger(discountPercent) || discountPercent <= 0 || discountPercent > 50
    || !['botella', 'tarro', 'garrafa'].includes(data.unitLabel)) return null;
  return { unitPrice, usualUnitPrice, discountPercent, unitLabel: data.unitLabel };
};
