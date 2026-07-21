import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/products/ProductCard';
import { Filter } from 'lucide-react';

const Products = () => {
  const { t } = useTranslation();
  const { products, categories } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  const filteredProducts = products.filter(product => {
    if (selectedCategory === 'all') return true;
    return product.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'default':
        return 0;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'price-asc':
        if (a.price === null) return 1;
        if (b.price === null) return -1;
        return a.price - b.price;
      case 'price-desc':
        if (a.price === null) return 1;
        if (b.price === null) return -1;
        return b.price - a.price;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen py-16 bg-gray-50">
      <Helmet>
        <title>{t('products.seo_title')}</title>
        <meta name="description" content={t('products.seo_description')} />
      </Helmet>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            {t('products.page_title')}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('products.page_subtitle')}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Category filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              <span className="font-semibold text-primary">{t('products.filter_by')}:</span>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.slug)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === category.slug
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-primary">{t('products.sort_by')}:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="default">{t('products.sort_featured')}</option>
                <option value="name">{t('products.sort_name')}</option>
                <option value="price-asc">{t('products.sort_price_asc')}</option>
                <option value="price-desc">{t('products.sort_price_desc')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {sortedProducts.length} {sortedProducts.length !== 1 ? t('products.products_count_plural', { count: sortedProducts.length }) : t('products.products_count', { count: sortedProducts.length })}
          </p>
        </div>

        {/* Products grid */}
        {sortedProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">
              {t('products.no_products')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Info section */}
        <div className="mt-16 bg-accent/30 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-primary mb-4">
            {t('products.looking_for_something', { defaultValue: '¿Buscas algo específico?' })}
          </h2>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            {t('products.contact_text', { defaultValue: 'Si no encuentras lo que buscas o tienes alguna pregunta sobre nuestros productos, no dudes en contactarnos. Estaremos encantados de ayudarte.' })}
          </p>
          <a
            href="/contacto"
            className="inline-block bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-md"
          >
            {t('products.contact_us', { defaultValue: 'Contáctanos' })}
          </a>
        </div>
      </div>
    </div>
  );
};
export default Products;
