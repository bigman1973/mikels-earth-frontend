import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import { ShoppingCart, ArrowLeft, Check, Repeat, Tag, Package, Leaf } from 'lucide-react';
import { motion } from 'framer-motion';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const product = products.find(p => p.slug === slug);
  const [quantity, setQuantity] = useState(1);
  const [purchaseType, setPurchaseType] = useState('one-time');
  const [subscriptionFrequency, setSubscriptionFrequency] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

  if (!product) {
    return (
      <div className="min-h-screen py-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">Producto no encontrado</h1>
          <Link to="/productos" className="text-primary hover:underline">
            Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  const currentPrice = purchaseType === 'subscription' ? product.priceSubscription : product.price;
  const selectedFrequency = product.subscriptionFrequencies?.find(f => f.value === subscriptionFrequency);

  const handleAddToCart = () => {
    addToCart(product, quantity, purchaseType, subscriptionFrequency);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, purchaseType, subscriptionFrequency);
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link 
            to="/productos" 
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a la tienda
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-lg shadow-lg overflow-hidden sticky top-8">
              {product.images && product.images.length > 0 ? (
                <div className="relative">
                  {/* Imagen principal */}
                  <div className="aspect-square overflow-hidden">
                    <img 
                      src={product.images[selectedImage]} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-all duration-300"
                    />
                  </div>
                  {product.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2 p-4 bg-gray-50">
                      {product.images.slice(0, 4).map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImage(idx)}
                          className={`w-full aspect-square object-cover rounded-lg cursor-pointer transition-all ${
                            selectedImage === idx 
                              ? 'ring-2 ring-primary ring-offset-2 opacity-100' 
                              : 'opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img 
                            src={img} 
                            alt={`${product.name} ${idx + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : product.image ? (
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="text-center p-8">
                    <Tag className="w-24 h-24 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-400">{product.name}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Product info section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white rounded-lg shadow-lg p-8">
              {/* Category */}
              <p className="text-sm text-primary/60 uppercase tracking-wide mb-2 font-semibold">
                {product.category}
              </p>

              {/* Product name */}
              <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                {product.name}
              </h1>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {product.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 text-xs bg-accent/50 text-primary px-3 py-1 rounded-full"
                  >
                    <Leaf className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>

              {/* Description */}
              <p className="text-gray-700 leading-relaxed mb-6">
                {product.longDescription}
              </p>

              {/* Weight */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                <Package className="w-4 h-4" />
                <span>Contenido: {product.weight}</span>
              </div>

              {/* Price */}
              <div className="bg-accent/30 rounded-lg p-6 mb-6">
                <div className="text-4xl font-bold text-primary mb-2">
                  {currentPrice ? currentPrice.toFixed(2) : product.price.toFixed(2)}€
                </div>
                {purchaseType === 'subscription' && selectedFrequency && (
                  <div className="text-sm text-gray-600">
                    Ahorras {selectedFrequency.discount}% con suscripción {selectedFrequency.label.toLowerCase()}
                  </div>
                )}
                {purchaseType === 'one-time' && product.subscriptionAvailable && (
                  <div className="text-sm text-gray-600">
                    o desde {product.priceSubscription.toFixed(2)}€ con suscripción
                  </div>
                )}
              </div>

              {/* Purchase type selector */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-primary mb-3">
                  Tipo de compra
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setPurchaseType('one-time');
                      setSubscriptionFrequency(null);
                    }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      purchaseType === 'one-time'
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Compra única</span>
                      {purchaseType === 'one-time' && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {product.price.toFixed(2)}€
                    </div>
                  </button>

                  {product.subscriptionAvailable && (
                    <button
                      onClick={() => {
                        setPurchaseType('subscription');
                        if (!subscriptionFrequency && product.subscriptionFrequencies.length > 0) {
                          setSubscriptionFrequency(product.subscriptionFrequencies[0].value);
                        }
                      }}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        purchaseType === 'subscription'
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Repeat className="w-4 h-4" />
                          <span className="font-semibold">Suscripción</span>
                        </div>
                        {purchaseType === 'subscription' && (
                          <Check className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div className="text-2xl font-bold text-primary">
                        {product.priceSubscription.toFixed(2)}€
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Ahorra hasta {Math.max(...product.subscriptionFrequencies.map(f => f.discount))}%
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* Subscription frequency selector */}
              {purchaseType === 'subscription' && product.subscriptionAvailable && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-primary mb-3">
                    Frecuencia de entrega
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {product.subscriptionFrequencies.map((freq) => (
                      <button
                        key={freq.value}
                        onClick={() => setSubscriptionFrequency(freq.value)}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${
                          subscriptionFrequency === freq.value
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{freq.label}</div>
                            <div className="text-sm text-gray-600">
                              Ahorra {freq.discount}% · {(product.priceSubscription * (1 - freq.discount / 100)).toFixed(2)}€/unidad
                            </div>
                          </div>
                          {subscriptionFrequency === freq.value && (
                            <Check className="w-5 h-5 text-primary" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity selector */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-primary mb-3">
                  Cantidad
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-xl transition-colors"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 h-12 text-center border-2 border-gray-200 rounded-lg font-semibold text-lg focus:outline-none focus:border-primary"
                    min="1"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-xl transition-colors"
                  >
                    +
                  </button>
                  {product.stock < 10 && (
                    <span className="text-sm text-orange-600 font-semibold ml-2">
                      Solo quedan {product.stock}
                    </span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleBuyNow}
                  className="w-full bg-primary text-white py-4 rounded-lg font-semibold text-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  Comprar Ahora
                </button>
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-white border-2 border-primary text-primary py-4 rounded-lg font-semibold text-lg hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Añadir al Carrito
                </button>
              </div>

              {/* Additional info */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="font-bold text-primary mb-3">Ingredientes</h3>
                <p className="text-sm text-gray-700 mb-4">{product.ingredients}</p>

                {product.nutritionalInfo && (
                  <>
                    <h3 className="font-bold text-primary mb-3">Información Nutricional (por 100g/ml)</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-gray-50 p-2 rounded">
                        <span className="text-gray-600">Calorías:</span>
                        <span className="font-semibold ml-2">{product.nutritionalInfo.calories}</span>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <span className="text-gray-600">Carbohidratos:</span>
                        <span className="font-semibold ml-2">{product.nutritionalInfo.carbs}</span>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <span className="text-gray-600">Proteínas:</span>
                        <span className="font-semibold ml-2">{product.nutritionalInfo.protein}</span>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <span className="text-gray-600">Grasas:</span>
                        <span className="font-semibold ml-2">{product.nutritionalInfo.fat}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Related products section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-primary mb-8 text-center">
            También te puede interesar
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products
              .filter(p => p.id !== product.id && p.category === product.category)
              .slice(0, 3)
              .map(relatedProduct => (
                <Link
                  key={relatedProduct.id}
                  to={`/producto/${relatedProduct.slug}`}
                  className="bg-white rounded-lg shadow-md p-4 hover:shadow-xl transition-shadow"
                >
                  <div className="h-48 bg-gray-200 rounded mb-3" />
                  <h3 className="font-semibold text-primary mb-2">{relatedProduct.name}</h3>
                  <p className="text-lg font-bold text-primary">{relatedProduct.price.toFixed(2)}€</p>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

