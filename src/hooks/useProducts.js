import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { products as localProducts, categories as localCategories } from '../data/products';

const API_URL = import.meta.env.VITE_API_URL || 'https://mikels-earth-backend-production.up.railway.app';

const replaceLegacyBrand = (value) => (
  typeof value === 'string'
    ? value.replaceAll("Mikel's Earth", "Mikel's Fruit").replaceAll('Mikels Earth', "Mikel's Fruit")
    : value
);

const applyEditorialOverrides = (product, language = 'es') => {
  const normalizedProduct = {
    ...product,
    name: replaceLegacyBrand(product.name),
    description: replaceLegacyBrand(product.description),
    longDescription: replaceLegacyBrand(product.longDescription),
  };

  if (product.slug === 'paraguayo-almibar') {
    const isEnglish = language === 'en';

    return {
      ...normalizedProduct,
      description: isEnglish
        ? 'Flat peach grown in Segrià, hand-peeled piece by piece. No preservatives or colourings.'
        : 'Paraguayo cultivado en el Segrià, pelado a mano, pieza a pieza. Sin conservantes, sin colorantes.',
      longDescription: isEnglish
        ? 'Flat peach in syrup grown in Segrià. It is hand-peeled, piece by piece, so the fruit reaches the jar with its shape, texture and flavour. No preservatives or colourings.'
        : 'Paraguayo en almíbar cultivado en el Segrià. Se pela a mano, pieza a pieza, para que la fruta llegue al tarro con su forma, textura y sabor. Sin conservantes, sin colorantes.',
      ingredients: isEnglish
        ? 'Hand-peeled flat peach, water, sugar, lemon juice'
        : 'Paraguayo pelado, agua, azúcar, zumo de limón',
      badges: (normalizedProduct.badges || []).map((badge) => (
        badge?.text === '🌍 ÚNICO EN EL MUNDO'
          ? { ...badge, text: 'Pelado a mano, pieza a pieza', textKey: 'peeled_by_hand' }
          : badge
      )),
    };
  }

  if (product.slug === 'mermelada-paraguayo') {
    const isEnglish = language === 'en';

    return {
      ...normalizedProduct,
      description: isEnglish
        ? 'Three jars of flat peach jam with 60% fruit. Only flat peach, water, sugar and lemon. No preservatives or colourings.'
        : 'Tres tarros de mermelada de paraguayo con un 60 % de fruta. Solo paraguayo, agua, azúcar y limón. Sin conservantes ni colorantes.',
      longDescription: isEnglish
        ? 'Flat peach, water, sugar and natural lemon juice.\n\n60% fruit. Only four ingredients. No preservatives or colourings.\n\nPack of three 250 g jars in a cardboard case.'
        : 'Paraguayo, agua, azúcar y zumo de limón natural.\n\n60 % de fruta. Solo cuatro ingredientes. Sin conservantes ni colorantes.\n\nPack de tres tarros de 250 g, en estuche de cartón.',
    };
  }

  if (product.slug === 'pack-fruta-premium') {
    return {
      ...normalizedProduct,
      longDescription: normalizedProduct.longDescription
        ?.replace(
          '60% de fruta (3 veces más que la industria). Solo 4 ingredientes: paraguayo, agua, azúcar y zumo de limón natural. Sin conservantes, sin colorantes, sin espesantes.',
          '60 % de fruta. Solo cuatro ingredientes: paraguayo, agua, azúcar y zumo de limón natural. Sin conservantes ni colorantes.'
        )
        ?.replace(
          '60% fruit (3 times more than the industry). Only 4 ingredients: flat peach, water, sugar and natural lemon juice. No preservatives, colourings or thickeners.',
          '60% fruit. Only four ingredients: flat peach, water, sugar and natural lemon juice. No preservatives or colourings.'
        ),
    };
  }

  if (product.slug === 'aceite-temprano-sin-filtrar') {
    const isEnglish = language === 'en';

    return {
      ...normalizedProduct,
      longDescription: isEnglish
        ? 'First-harvest, unfiltered extra virgin olive oil. Green, fresh and slightly peppery, cold-pressed and ideal for salads, toast and carpaccios.'
        : 'Aceite de oliva virgen extra de primera cosecha, sin filtrar. De perfil verde, fresco y ligeramente picante, prensado en frío e ideal para ensaladas, tostadas y carpaccios.',
      tieredDiscount: (normalizedProduct.tieredDiscount || []).map((tier) => {
        const sanitizedTier = { ...tier };
        delete sanitizedTier.description;
        return sanitizedTier;
      }),
    };
  }

  if (product.slug === 'pack-temprano-premium') {
    const isEnglish = language === 'en';

    return {
      ...normalizedProduct,
      longDescription: isEnglish
        ? '**Early-harvest oil, without filters**\n\nA premium gift set with a 500 ml bottle of first-harvest, unfiltered extra virgin olive oil and its premium case.\n\n**Oil profile:**\n- Green, fresh and slightly peppery\n- Cold-pressed\n- Ideal for salads, toast and carpaccios\n\nA limited seasonal edition for those who enjoy authentic olive oil.'
        : '**Aceite temprano, sin filtros**\n\nUn estuche de regalo con una botella de 500 ml de aceite de oliva virgen extra de primera cosecha, sin filtrar, y su estuche premium.\n\n**Perfil del aceite:**\n- Verde, fresco y ligeramente picante\n- Prensado en frío\n- Ideal para ensaladas, tostadas y carpaccios\n\nUna edición limitada de temporada para quienes disfrutan de un aceite auténtico.',
      claims: (normalizedProduct.claims || []).filter((claim) => !/antioxid|polifenol/i.test(claim)),
    };
  }

  if (product.slug === 'aceite-oliva-ecologico') {
    return {
      ...normalizedProduct,
      tags: (normalizedProduct.tags || []).filter((tag) => !/polifenol|antioxid/i.test(tag)),
    };
  }

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
    localProducts.map((product) => applyEditorialOverrides(product, currentLang))
  ));
  const [categories, setCategories] = useState(localCategories);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState('local'); // 'api' o 'local'

  useEffect(() => {
    let cancelled = false;

    setProducts(localProducts.map((product) => applyEditorialOverrides(product, currentLang)));
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
        
        if (!cancelled && data.products && data.products.length > 0) {
          setProducts(data.products.map((product) => applyEditorialOverrides(product, currentLang)));
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
  const product = localProducts.find(p => p.slug === slug);
  return product ? applyEditorialOverrides(product) : null;
}
