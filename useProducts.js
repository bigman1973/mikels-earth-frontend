import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL || 'https://mikels-earth-backend-production.up.railway.app';
const REQUEST_TIMEOUT_MS = 8000;
const MAX_ATTEMPTS = 2;

/**
 * Carga el catálogo exclusivamente desde la API, que es la fuente de verdad
 * de precios y disponibilidad. Nunca se usa un catálogo local para comprar.
 */
export function useProducts() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.substring(0, 2) || 'es';
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [source, setSource] = useState('api');

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      setLoading(true);
      setError(null);

      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
        try {
          const response = await fetch(`${API_URL}/api/products?lang=${currentLang}`, {
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
            headers: { Accept: 'application/json' }
          });
          if (!response.ok) throw new Error(`API error: ${response.status}`);

          const data = await response.json();
          if (!data.products || data.products.length === 0) {
            throw new Error('La API no devolvió productos');
          }

          if (!cancelled) {
            setProducts(data.products);
            setCategories(data.categories || []);
            setSource('api');
            setError(null);
            setLoading(false);
          }
          return;
        } catch {
          if (attempt === MAX_ATTEMPTS && !cancelled) {
            setProducts([]);
            setCategories([]);
            setSource('error');
            setError('No se ha podido cargar el catálogo actualizado. Inténtalo de nuevo en unos segundos.');
          }
        }
      }

      if (!cancelled) setLoading(false);
    }

    fetchProducts();
    return () => { cancelled = true; };
  }, [currentLang]);

  return { products, categories, loading, error, source };
}
