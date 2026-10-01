import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';

const CartRoute = () => {
  const { t } = useTranslation();
  const { setIsCartOpen } = useCart();

  useEffect(() => {
    setIsCartOpen(true);
  }, [setIsCartOpen]);

  return (
    <section className="mx-auto flex min-h-[42vh] max-w-2xl items-center px-4 py-16">
      <div className="w-full rounded-2xl bg-white p-8 text-center shadow-sm">
        <h1 className="font-serif text-3xl font-semibold text-primary">{t('cart.title')}</h1>
        <button
          type="button"
          className="mt-6 rounded-lg bg-primary px-5 py-3 font-semibold text-white transition-colors hover:bg-primary/90"
          onClick={() => setIsCartOpen(true)}
        >
          {t('cart.title')}
        </button>
        <Link className="mt-4 block text-sm font-semibold text-primary underline underline-offset-4" to="/tienda">
          {t('cart.continue_shopping')}
        </Link>
      </div>
    </section>
  );
};

export default CartRoute;
