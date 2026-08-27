import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL || 'https://mikels-earth-backend-production.up.railway.app';
const MAX_ATTEMPTS = 2;
const REQUEST_TIMEOUT_MS = 10000;

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

/**
 * Carga el catálogo vigente desde la API.
 *
 * Los precios locales nunca se usan como fallback comercial. Si la API no puede
 * confirmar el catálogo, la tienda muestra un error y mantiene la compra bloqueada.
 */
export function useProducts() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.substring(0, 2) || 'es';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [catalogVersion, setCatalogVersion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestVersion, setRequestVersion] = useState(0);

  const retry = useCallback(() => {
    setRequestVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      setLoading(true);
      setError(null);

      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
        try {
          const response = await fetch(`${API_URL}/api/products?lang=${currentLang}`, {
            cache: 'no-store',
            headers: { Accept: 'application/json' },
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
          });

          if (!response.ok) {
            throw new Error(`Catalog API returned ${response.status}`);
          }

          const data = await response.json();
          if (!Array.isArray(data.products)) {
            throw new Error('Catalog API returned an invalid response');
          }

          if (!cancelled) {
            setProducts(data.products);
            setCategories(Array.isArray(data.categories) ? data.categories : []);
            setCatalogVersion(data.catalog_version || null);
            setLoading(false);
          }
          return;
        } catch (requestError) {
          if (attempt < MAX_ATTEMPTS) {
            await wait(500);
            continue;
          }

          if (!cancelled) {
            console.error('Unable to load current product catalog:', requestError);
            setProducts([]);
            setCategories([]);
            setCatalogVersion(null);
            setError('No hemos podido confirmar los productos y precios actuales. Inténtalo de nuevo.');
            setLoading(false);
          }
        }
      }
    }

    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, [currentLang, requestVersion]);

  return {
    products,
    categories,
    catalogVersion,
    loading,
    error,
    retry,
    source: 'api',
  };
}
