import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { products as localProducts, categories as localCategories } from '../data/products';
import { applyEditorialOverrides } from '../utils/productEditorialOverrides';
import { isListedProduct, isPublicFallbackProduct, loadProductDetail } from '../utils/productAccess';
import { sortCatalogueProducts } from '../utils/cataloguePosition';

const API_URL = import.meta.env.VITE_API_URL || 'https://mikels-earth-backend-production.up.railway.app';

/**
 * Hook para cargar productos desde la API con fallback a products.js local.
 * Garantiza que la web SIEMPRE funciona, incluso si la API está caída.
 * 
 * - Si la API responde: usa datos de la DB (actualizables desde el panel admin)
 * - Si la API falla: usa products.js local como fallback (datos estáticos)
 * - Envía el idioma actual para recibir traducciones si están disponibles
 */
export function useProducts() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.substring(0, 2) || 'es';
  
  const [products, setProducts] = useState(() => (
    sortCatalogueProducts(localProducts.filter(isPublicFallbackProduct).map((product) => applyEditorialOverrides(product, currentLang)))
  ));
  const [categories, setCategories] = useState(localCategories);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState('local'); // 'api' o 'local'

  useEffect(() => {
    let cancelled = false;

    setProducts(sortCatalogueProducts(localProducts.filter(isPublicFallbackProduct).map((product) => applyEditorialOverrides(product, currentLang))));
    setCategories(localCategories);
    setSource('local');
    setLoading(true);

    async function fetchProducts() {
      try {
        const response = await fetch(`${API_URL}/api/products?lang=${currentLang}`, {
          signal: AbortSignal.timeout(5000) // Timeout de 5s para no bloquear la web
        });
        
        if (!response.ok) throw new Error('API error');
        
        const data = await response.json();
        
        if (!cancelled && Array.isArray(data.products)) {
          setProducts(sortCatalogueProducts(data.products.filter(isListedProduct).map((product) => applyEditorialOverrides(product, currentLang))));
          setCategories(data.categories || localCategories);
          setSource('api');
        }
      } catch {
        // Silencioso: usar datos locales como fallback
        console.log('Products: usando datos locales (fallback)');
        if (!cancelled) {
          setSource('local');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => { cancelled = true; };
  }, [currentLang]);

  return { products, categories, loading, source };
}

/**
 * Función síncrona para obtener un producto por slug.
 * Usa los datos locales como base inmediata (para SSR/primera renderización).
 */
export function getProductBySlug(slug) {
  const product = localProducts.find(p => p.slug === slug && isPublicFallbackProduct(p));
  return product ? applyEditorialOverrides(product) : null;
}

// El listado no contiene productos ocultos. El endpoint directo sí puede
// resolverlos, pero únicamente cuando el servidor confirma que están activos.
export function useProduct(slug) {
  const { i18n } = useTranslation();
  const language = i18n.language?.substring(0, 2) || 'es';
  const [state, setState] = useState({ slug: null, language: null, product: null, loading: true });
  useEffect(() => {
    let cancelled = false;
    setState({ slug, language, product: null, loading: true });
    loadProductDetail({ slug, language, apiUrl: API_URL, fallbackProducts: localProducts })
      .then((product) => {
        if (!cancelled) setState({ slug, language, product: product ? applyEditorialOverrides(product, language) : null, loading: false });
      });
    return () => { cancelled = true; };
  }, [slug, language]);
  return state.slug === slug && state.language === language ? state : { product: null, loading: true };
}
