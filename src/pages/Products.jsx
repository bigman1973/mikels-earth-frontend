import { useState } from 'react';
import { products, categories } from '../data/products';
import ProductCard from '../components/products/ProductCard';
import { Filter } from 'lucide-react';

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const filteredProducts = products.filter(product => {
    if (selectedCategory === 'all') return true;
    return product.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'price-asc':
        // Productos sin precio van al final
        if (a.price === null) return 1;
        if (b.price === null) return -1;
        return a.price - b.price;
      case 'price-desc':
        // Productos sin precio van al final
        if (a.price === null) return 1;
        if (b.price === null) return -1;
        return b.price - a.price;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            La Despensa de Mikel
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Bienvenido/a a la tienda online. Cada compra que realizas aquí no solo te acerca a productos 
            artesanales, naturales y de máxima calidad, sino que también contribuye directamente a la 
            Fondation Agonlinhossouyetokandji.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Category filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              <span className="font-semibold text-primary">Categoría:</span>
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
              <span className="font-semibold text-primary">Ordenar:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="name">Nombre</option>
                <option value="price-asc">Precio: Menor a Mayor</option>
                <option value="price-desc">Precio: Mayor a Menor</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Mostrando <span className="font-semibold">{sortedProducts.length}</span> producto{sortedProducts.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Products grid */}
        {sortedProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">
              No se encontraron productos en esta categoría
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
            ¿Buscas algo específico?
          </h2>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            Si no encuentras lo que buscas o tienes alguna pregunta sobre nuestros productos, 
            no dudes en contactarnos. Estaremos encantados de ayudarte.
          </p>
          <a
            href="/contacto"
            className="inline-block bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-md"
          >
            Contáctanos
          </a>
        </div>
      </div>
    </div>
  );
};

export default Products;

