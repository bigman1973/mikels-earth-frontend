import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
// eslint-disable-next-line no-unused-vars -- JSX uses the namespace `<motion.*>`.
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatEuro } from '../../utils/formatMoney';

const CartDrawer = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    getCartTotal,
    getCartCount,
    getItemPrice,
    appliedDiscount,
    applyDiscountCode,
    removeDiscountCode,
  } = useCart();
  const { t } = useTranslation();
  const [codeInput, setCodeInput] = useState('');
  const [codeMessage, setCodeMessage] = useState({ text: '', type: '' });
  const [showDiscount, setShowDiscount] = useState(false);

  const applyCode = () => {
    const result = applyDiscountCode(codeInput);
    setCodeMessage({ text: result.message, type: result.success ? 'success' : 'error' });
    if (result.success) {
      setCodeInput('');
      setShowDiscount(false);
      window.setTimeout(() => setCodeMessage({ text: '', type: '' }), 3000);
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 z-40 bg-black/30"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full flex-col bg-white shadow-2xl md:w-96"
            aria-label={t('cart.title')}
          >
            <div className="flex items-center justify-between border-b border-stone-200 p-6">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-[#1a1a1a]" aria-hidden="true" />
                <h2 className="text-xl font-semibold text-[#1a1a1a]">
                  {t('cart.title')} ({getCartCount()})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="rounded-full p-2 transition-colors hover:bg-stone-100"
                aria-label="Cerrar carrito"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="py-12 text-center">
                  <ShoppingBag className="mx-auto mb-4 h-14 w-14 text-stone-300" aria-hidden="true" />
                  <p className="text-[#1a1a1a]">{t('cart.empty')}</p>
                  <p className="mt-2 text-sm text-stone-600">{t('cart.add_products')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item, index) => {
                    const unitPrice = getItemPrice(item);
                    const itemTotal = unitPrice * item.quantity;
                    return (
                      <motion.div
                        key={`${item.id || item.slug || item.name}-${index}`}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -80 }}
                        className="relative rounded-lg border border-stone-200 bg-white p-4"
                      >
                        <button
                          type="button"
                          onClick={() => removeFromCart(index)}
                          className="absolute right-2 top-2 rounded-full p-1.5 transition-colors hover:bg-stone-100"
                          aria-label="Eliminar producto"
                        >
                          <X className="h-4 w-4 text-stone-500" />
                        </button>
                        <div className="mb-4 flex gap-3">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="h-16 w-16 shrink-0 rounded object-cover" />
                          ) : (
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded bg-stone-100">
                              <ShoppingBag className="h-7 w-7 text-stone-400" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1 pr-6">
                            <h3 className="line-clamp-2 text-sm font-semibold text-[#1a1a1a]">{item.name}</h3>
                            <p className="mt-1 text-sm font-semibold text-price">{formatEuro(unitPrice)}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center rounded-lg border border-stone-200">
                            <button type="button" onClick={() => updateQuantity(index, item.quantity - 1)} className="rounded-l-lg p-2 hover:bg-stone-50" aria-label="Disminuir cantidad">
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="px-3 font-semibold">{item.quantity}</span>
                            <button type="button" onClick={() => updateQuantity(index, item.quantity + 1)} className="rounded-r-lg p-2 hover:bg-stone-50" aria-label="Aumentar cantidad">
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="text-sm font-bold text-price">{formatEuro(itemTotal)}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-stone-200 bg-[#f5efe4] p-6">
                {appliedDiscount && (
                  <div className="mb-3 flex items-center justify-between border-b border-stone-300 pb-3 text-sm text-[#1a1a1a]">
                    <span>{t('checkout.discount_code')} {appliedDiscount.code}</span>
                    <button type="button" onClick={removeDiscountCode} className="underline underline-offset-2">
                      {t('cart.remove')}
                    </button>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-[#1a1a1a]">{t('cart.total')}</span>
                  <span className="text-2xl font-bold text-price">{formatEuro(getCartTotal())}</span>
                </div>

                {!appliedDiscount && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => setShowDiscount((current) => !current)}
                      className="text-sm text-[#1a1a1a] underline underline-offset-4"
                      aria-expanded={showDiscount}
                    >
                      ¿Tienes un código?
                    </button>
                    {showDiscount && (
                      <div className="mt-2 flex gap-2">
                        <input
                          type="text"
                          value={codeInput}
                          onChange={(event) => setCodeInput(event.target.value.toUpperCase())}
                          placeholder="Introduce tu código"
                          className="min-w-0 flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#1a1a1a] focus:ring-2 focus:ring-black/10"
                        />
                        <button type="button" onClick={applyCode} className="rounded-lg border border-[#1a1a1a] px-3 py-2 text-sm font-semibold text-[#1a1a1a]">
                          {t('checkout.apply')}
                        </button>
                      </div>
                    )}
                    {codeMessage.text && <p className="mt-2 text-xs text-[#1a1a1a]">{codeMessage.text}</p>}
                  </div>
                )}

                <Link to="/checkout" onClick={() => setIsCartOpen(false)} className="mt-5 block w-full rounded-lg bg-primary py-4 text-center font-semibold text-white transition-colors hover:bg-primary/90">
                  {t('cart.checkout')}
                </Link>
                <button type="button" onClick={() => setIsCartOpen(false)} className="mt-2 block w-full py-2 text-center text-sm text-[#1a1a1a] underline underline-offset-4">
                  {t('cart.continue_shopping')}
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
