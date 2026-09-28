import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { products as localProducts, categories as localCategories } from '../data/products';

const API_URL = import.meta.env.VITE_API_URL || 'https://mikels-earth-backend-production.up.railway.app';

const replaceLegacyBrand = (value) => (
  typeof value === 'string'
    ? value.replaceAll("Mikel's Earth", "Mikel's Fruit").replaceAll('Mikels Earth', "Mikel's Fruit")
    : value
);

const applyEditorialOverrides = (product) => {
  const normalizedProduct = {
    ...product,
    name: replaceLegacyBrand(product.name),
    description: replaceLegacyBrand(product.description),
    longDescription: replaceLegacyBrand(product.longDescription),
  };

  if (product.slug !== 'aceite-5l-caja-3') return normalizedProduct;

  return {
    ...normalizedProduct,
    description: 'Garrafa de 5 litros de aceite de oliva virgen extra de baja acidez. Variedades Picual, Hojiblanca y Arbequina, de nuestros olivares de Córdoba y Lleida. Prensado en frío.',
    longDescription: 'Garrafa de 5 litros de aceite de oliva virgen extra de baja acidez. Variedades Picual, Hojiblanca y Arbequina, de nuestros olivares de Córdoba y Lleida. Prensado en frío. **8,60 €/litro.** El aceite del día a día: para el sofrito, para la plancha y para aliñar.',
    claims: (normalizedProduct.claims || []).filter(
      (claim) => claim !== 'Solo 6.60€/litro' && claim !== 'Compra 3+ y ahorra 9%',
    ),
  };
};

const editorialProducts = localProducts.map(applyEditorialOverrides);

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
  
  const [products, setProducts] = useState(editorialProducts);
  const [categories, setCategories] = useState(localCategories);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState('local'); // 'api' o 'local'

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      try {
        const response = await fetch(`${API_URL}/api/products?lang=${currentLang}`, {
          signal: AbortSignal.timeout(5000) // Timeout de 5s para no bloquear la web
        });
        
        if (!response.ok) throw new Error('API error');
        
        const data = await response.json();
        
        if (!cancelled && data.products && data.products.length > 0) {
          setProducts(data.products.map(applyEditorialOverrides));
          setCategories(data.categories || localCategories);
          setSource('api');
        }
      } catch (err) {
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
  const product = localProducts.find(p => p.slug === slug);
  return product ? applyEditorialOverrides(product) : null;
}
