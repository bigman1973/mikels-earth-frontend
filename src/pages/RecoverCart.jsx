import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Loader2, AlertCircle } from 'lucide-react';

const RecoverCart = () => {
  const { t } = useTranslation();
  const { token } = useParams();
  const navigate = useNavigate();
  const { addToCart, clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartData, setCartData] = useState(null);

  useEffect(() => {
    const recoverCart = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/abandoned-cart/${token}`);
        const data = await response.json();

        if (data.success && data.cart) {
          setCartData(data.cart);
          
          // Limpiar carrito actual y cargar el recuperado
          clearCart();
          
          // Añadir cada producto al carrito
          for (const item of data.cart.items) {
            addToCart({
              id: item.id,
              name: item.name,
              image: item.image,
              price: item.price,
              slug: item.slug || '',
              // Mantener propiedades necesarias para el checkout
              subscriptionFrequencies: []
            }, item.quantity, 'one-time', null);
          }
          
          // Redirigir al checkout después de un breve delay
          setTimeout(() => {
            navigate('/checkout');
          }, 2000);
        } else {
          setError('No hemos podido recuperar tu carrito. Es posible que haya expirado.');
        }
      } catch (err) {
        console.error('Error recovering cart:', err);
        setError('Ha ocurrido un error al recuperar tu carrito.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      recoverCart();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f4]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#2d5016] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#2d5016]">Recuperando tu carrito...</h2>
          <p className="text-gray-600 mt-2">Un momento, estamos cargando tus productos.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f4]">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Carrito no disponible</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/tienda')}
            className="bg-[#2d5016] text-white px-6 py-3 rounded-lg hover:bg-[#1e3a0f] transition-colors"
          >
            Ir a la tienda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf8f4]">
      <div className="text-center max-w-md mx-auto px-4">
        <ShoppingBag className="w-12 h-12 text-[#2d5016] mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-[#2d5016] mb-2">¡Carrito recuperado!</h2>
        <p className="text-gray-600 mb-2">
          Hemos cargado {cartData?.items?.length || 0} producto(s) en tu carrito.
        </p>
        <p className="text-sm text-gray-500">Redirigiendo al checkout...</p>
      </div>
    </div>
  );
};

export default RecoverCart;
