export function calculateMargins({
  priceWithVat,
  cost,
  vatRate,
  shippingCost = 0,
  preparationCost = 0,
}) {
  // A missing or mixed master-tax profile is not a 4% product.  Returning null
  // makes the panel show an explicit fiscal-review state instead of a false
  // commercial margin.
  if (!Number.isFinite(vatRate) || vatRate < 0) return null;

  const price = Number(priceWithVat) || 0;
  const productCost = Number(cost) || 0;
  const shipping = Number(shippingCost) || 0;
  const preparation = Number(preparationCost) || 0;
  const baseWithoutVat = price > 0 ? price / (1 + vatRate) : 0;

  if (baseWithoutVat <= 0 || productCost <= 0) return null;

  const grossAmount = baseWithoutVat - productCost;
  const netAmount = grossAmount - shipping - preparation;

  return {
    baseWithoutVat,
    grossAmount,
    grossPercent: (grossAmount / baseWithoutVat) * 100,
    netAmount,
    netPercent: (netAmount / baseWithoutVat) * 100,
  };
}
