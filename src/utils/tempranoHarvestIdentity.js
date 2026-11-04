// Identidades de artículos independientes; no son variantes ni altas de catálogo.
const TEMPRANO_HARVEST_IDENTITIES = Object.freeze([
  Object.freeze({
    sku: 'MIKVET5002526',
    slug: 'aceite-temprano-sin-filtrar-cosecha-2025-26',
    name: 'Aceite de Oliva Virgen Extra Temprano sin filtrar · Cosecha 2025/26',
  }),
  Object.freeze({
    sku: 'MIKVET500',
    slug: 'aceite-temprano-sin-filtrar',
    name: 'Aceite de oliva virgen extra Temprano 2026/27 sin filtrar',
  }),
]);

export const getTempranoHarvestIdentity = (product = {}) => {
  const sku = typeof product?.sku === 'string' ? product.sku.trim().toUpperCase() : '';
  // Un SKU explícito prevalece. El slug exacto solo rescata datos legacy sin SKU;
  // nunca se infiere la cosecha por nombre, prefijo de SKU o selectedVariant.
  return TEMPRANO_HARVEST_IDENTITIES.find((identity) => (
    sku ? identity.sku === sku : product?.slug === identity.slug
  ));
};

export const normalizeTempranoHarvestName = (product = {}) => {
  const identity = getTempranoHarvestIdentity(product);
  return identity && product.name !== identity.name
    ? { ...product, name: identity.name }
    : product;
};
