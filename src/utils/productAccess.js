import { getIndependentPackIdentity } from './independentPacks.js';

export const isHiddenProduct = (product = {}) => product.visibleInStore === false || product.visible === false;
export const isActiveProduct = (product = {}) => product.active !== false;
export const isListedProduct = (product = {}) => isActiveProduct(product) && !isHiddenProduct(product);
export const isPublicFallbackProduct = (product = {}) => isListedProduct(product) && !getIndependentPackIdentity(product);

// Un 404/403 autoritativo nunca se sustituye por un producto local. Solo los
// productos públicos preexistentes pueden usar fallback ante caída de servicio.
export const loadProductDetail = async ({ slug, language = 'es', apiUrl, fetchImpl = fetch, fallbackProducts = [] }) => {
  try {
    const response = await fetchImpl(`${apiUrl}/api/products/${encodeURIComponent(slug)}?lang=${encodeURIComponent(language)}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (response.status === 404 || response.status === 403) return null;
    if (!response.ok) throw new Error('Product API unavailable');
    const payload = await response.json();
    const product = payload.product || payload;
    return product?.slug === slug && isActiveProduct(product) ? product : null;
  } catch {
    return fallbackProducts.find((product) => product.slug === slug && isPublicFallbackProduct(product)) || null;
  }
};
