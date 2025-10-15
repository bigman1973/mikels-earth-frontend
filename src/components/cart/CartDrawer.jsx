import { X, Plus, Minus, ShoppingBag, Repeat } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const CartDrawer = () => {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, getCartTotal, getCartCount } = useCart();

  const getPurchaseTypeLabel = (item) => {
    if (item.purchaseType === 'subscription') {
      const freqLabel = item.subscriptionFrequency === 'weekly' ? 'Semanal' :
                       item.subscriptionFrequency === 'biweekly' ? 'Quincenal' :
                       item.subscriptionFrequency === 'monthly' ? 'Mensual' :
                       item.subscriptionFrequency === 'bimonthly' ? 'Bimensual' : '';
      return `Suscripción ${freqLabel}`;
    }
    return 'Compra única';
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold text-primary">
                  Tu Carrito ({getCartCount()})
                </h2>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Cerrar carrito"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-2">Tu carrito está vacío</p>
                  <p className="text-sm text-gray-400">
                    Añade productos para comenzar tu compra
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="bg-gray-50 rounded-lg p-4 relative"
                    >
                      {/* Remove button */}
                      <button
                        onClick={() => removeFromCart(index)}
                        className="absolute top-2 right-2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                        aria-label="Eliminar producto"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>

                      {/* Product info */}
                      <div className="flex gap-3 mb-3">
                        <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-primary mb-1 line-clamp-2">
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                            {item.purchaseType === 'subscription' && (
                              <Repeat className="w-3 h-3" />
                            )}
                            <span>{getPurchaseTypeLabel(item)}</span>
                          </div>
                          <p className="text-sm font-bold text-primary">
                            {item.price.toFixed(2)}€
                          </p>
                        </div>
                      </div>

                      {/* Quantity controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200">
                          <button
                            onClick={() => updateQuantity(index, item.quantity - 1)}
                            className="p-2 hover:bg-gray-50 transition-colors rounded-l-lg"
                            aria-label="Disminuir cantidad"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-3 font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(index, item.quantity + 1)}
                            className="p-2 hover:bg-gray-50 transition-colors rounded-r-lg"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="text-sm font-bold text-primary">
                          {(item.price * item.quantity).toFixed(2)}€
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-primary">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    {getCartTotal().toFixed(2)}€
                  </span>
                </div>
                <Link
                  to="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="block w-full bg-primary text-white text-center py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-md"
                >
                  Proceder al Pago
                </Link>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="block w-full mt-2 text-primary text-center py-2 text-sm hover:underline"
                >
                  Continuar comprando
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;

