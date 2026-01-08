import { X, Plus, Minus, ShoppingBag, Repeat } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const CartDrawer = () => {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, getCartTotal, getCartCount, getItemPrice, appliedDiscount, applyDiscountCode, removeDiscountCode, getDiscountAmount } = useCart();
  const [codeInput, setCodeInput] = useState('');
  const [codeMessage, setCodeMessage] = useState({ text: '', type: '' });

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
            className="fixed inset-0 bg-gray-900/50 z-40"
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
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded flex-shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                            <ShoppingBag className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
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
                          {/* Mostrar descuento escalonado o por volumen si aplica */}
                          {(() => {
                            let discountPercent = 0;
                            let discountLabel = '';
                            
                            // Verificar si hay descuento escalonado
                            if (item.tieredDiscountConfig && item.purchaseType === 'one-time') {
                              for (const tier of item.tieredDiscountConfig) {
                                if (item.quantity >= tier.minQuantity) {
                                  discountPercent = tier.discount;
                                  discountLabel = tier.label;
                                }
                              }
                            }
                            // Si no hay tieredDiscount, verificar volumeDiscount
                            else if (item.volumeDiscountConfig && item.quantity >= item.volumeDiscountConfig.minQuantity && item.purchaseType === 'one-time') {
                              discountPercent = item.volumeDiscountConfig.discount;
                              discountLabel = 'volumen';
                            }
                            
                            if (discountPercent > 0) {
                              const isBestValue = item.quantity >= 36 && item.tieredDiscountConfig;
                              const paidQuantity = item.freeQuantity ? (item.quantity - item.freeQuantity) : item.quantity;
                              const totalSavings = (item.price - getItemPrice(item)) * paidQuantity;
                              
                              return (
                                <div className={`${
                                  isBestValue ? 'bg-gradient-to-r from-yellow-50 to-orange-50 p-2 rounded-lg -mx-2' : ''
                                }`}>
                                  {isBestValue && (
                                    <div className="flex items-center gap-1 mb-1">
                                      <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold px-2 py-0.5 rounded-full">
                                        ⭐ MEJOR VALOR
                                      </span>
                                    </div>
                                  )}
                                  <p className="text-xs text-gray-500 line-through">
                                    {item.price.toFixed(2)}€
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-green-600">
                                      {getItemPrice(item).toFixed(2)}€
                                    </p>
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                      -{discountPercent}% {discountLabel}
                                    </span>
                                  </div>
                                  <p className="text-xs text-green-600 font-semibold mt-1">
                                    Ahorras {totalSavings.toFixed(2)}€ en total
                                  </p>
                                  </div>
                                );
                            } else {
                              return (
                                <p className="text-sm font-bold text-primary">
                                  {getItemPrice(item).toFixed(2)}€
                                </p>
                              );
                            }
                          })()}
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
                          <span className="px-3 font-semibold">
                            {item.freeQuantity ? (
                              <span className="flex flex-col items-center">
                                <span>{item.quantity}</span>
                                <span className="text-xs text-green-600">({item.freeQuantity} gratis)</span>
                              </span>
                            ) : (
                              item.quantity
                            )}
                          </span>
                          <button
                            onClick={() => updateQuantity(index, item.quantity + 1)}
                            className="p-2 hover:bg-gray-50 transition-colors rounded-r-lg"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="text-sm font-bold text-primary">
                          {(() => {
                            const paidQuantity = item.freeQuantity ? (item.quantity - item.freeQuantity) : item.quantity;
                            return (getItemPrice(item) * paidQuantity).toFixed(2);
                          })()}€
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
                {/* Código de descuento */}
                <div className="mb-4">
                  {!appliedDiscount ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ¿Tienes un código de descuento?
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={codeInput}
                          onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                          placeholder="Introduce tu código"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                          onClick={() => {
                            const result = applyDiscountCode(codeInput);
                            setCodeMessage({ text: result.message, type: result.success ? 'success' : 'error' });
                            if (result.success) {
                              setCodeInput('');
                              setTimeout(() => setCodeMessage({ text: '', type: '' }), 3000);
                            }
                          }}
                          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                        >
                          Aplicar
                        </button>
                      </div>
                      {codeMessage.text && (
                        <p className={`text-sm mt-2 ${codeMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                          {codeMessage.text}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-800">
                            Código aplicado: {appliedDiscount.code}
                          </p>
                          <p className="text-xs text-green-600">
                            {appliedDiscount.oneTimeDiscount}% de descuento
                          </p>
                        </div>
                        <button
                          onClick={removeDiscountCode}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Subtotal y descuento */}
                {appliedDiscount && (
                  <div className="space-y-2 mb-3 pb-3 border-b border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-900">
                        {(getCartTotal() + getDiscountAmount()).toFixed(2)}€
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-600 font-medium">Descuento {appliedDiscount.code}</span>
                      <span className="text-green-600 font-medium">
                        -{getDiscountAmount().toFixed(2)}€
                      </span>
                    </div>
                  </div>
                )}

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

