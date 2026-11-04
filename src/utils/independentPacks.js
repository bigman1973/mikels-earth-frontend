// Identidades aprobadas; NO catálogo, activación, stock ni fallback público.
// quantity = número de packs completos, nunca unidades de sus componentes.
export const INDEPENDENT_PACKS = Object.freeze([
  { sku: 'BF26-TEMP6', slug: 'aceite-temprano-sin-filtrar-cosecha-2025-26-pack-6', name: 'Aceite de Oliva Virgen Extra Temprano sin filtrar · Cosecha 2025/26 · Pack de 6', price: 59.70, units: 6, harvest: '2025/26' },
  { sku: 'BF26-TEMP12', slug: 'aceite-temprano-sin-filtrar-cosecha-2025-26-caja-12', name: 'Aceite de Oliva Virgen Extra Temprano sin filtrar · Cosecha 2025/26 · Caja de 12', price: 119.40, units: 12, harvest: '2025/26' },
  { sku: 'BF26-ECO6', slug: 'black-friday-aceite-ecologico-pack-6', price: 71.40, units: 6 },
  { sku: 'BF26-PARA3', slug: 'black-friday-paraguayo-720g-pack-3', price: 30.90, units: 3 },
  { sku: 'BF26-PARA6', slug: 'black-friday-paraguayo-720g-pack-6', price: 61.70, units: 6 },
  { sku: 'BF26-5L3', slug: 'black-friday-aceite-5l-caja-3', price: 96.75, units: 3 },
].map(Object.freeze));

export const getIndependentPackIdentity = (product = {}) => {
  const sku = typeof product?.sku === 'string' ? product.sku.trim().toUpperCase() : '';
  return INDEPENDENT_PACKS.find((pack) => sku ? pack.sku === sku : pack.slug === product?.slug);
};

export const normalizeIndependentPackName = (product = {}) => {
  const pack = getIndependentPackIdentity(product);
  if (!pack?.harvest || product.name === pack.name) return product;
  // No reutiliza nombre ni foto de la cosecha 2026/27. Las imágenes solo pueden
  // proceder del producto exacto del servidor; no hay fallback de otra cosecha.
  return { ...product, name: pack.name };
};
