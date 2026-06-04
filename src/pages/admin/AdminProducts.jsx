import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { API_URL } from '../../config/api';
import AdminLayout from '../../components/admin/AdminLayout';

export default function AdminProducts() {
  const { authFetch } = useAdminAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/api/admin/products`);
      if (res && res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const syncFromHolded = async () => {
    setSyncing(true);
    setMessage(null);
    try {
      const res = await authFetch(`${API_URL}/api/admin/products/sync-from-holded`, {
        method: 'POST'
      });
      if (res && res.ok) {
        const data = await res.json();
        setMessage({
          type: 'success',
          text: `Comparación completada: ${data.total_different} diferencias encontradas de ${data.total_compared} productos comparados.`
        });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al sincronizar con Holded' });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Productos y Precios</h1>
            <p className="text-gray-400 text-sm mt-1">Comparación Holded vs Web · Sincronización manual</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={syncFromHolded}
              disabled={syncing}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white text-sm rounded-lg transition-colors"
            >
              {syncing ? 'Comparando...' : '🔄 Comparar con Holded'}
            </button>
            <button
              onClick={loadProducts}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
            >
              ↻ Refrescar
            </button>
          </div>
        </div>

        {/* Mensaje */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            message.type === 'success' ? 'bg-green-900/30 text-green-300 border border-green-700' : 'bg-red-900/30 text-red-300 border border-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Tabla de productos */}
        {loading ? (
          <div className="text-gray-400">Cargando productos de Holded...</div>
        ) : (
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-750 border-b border-gray-700">
                    <th className="text-left p-3 text-gray-400 font-medium">Producto</th>
                    <th className="text-left p-3 text-gray-400 font-medium">SKU</th>
                    <th className="text-right p-3 text-gray-400 font-medium">Precio Holded</th>
                    <th className="text-right p-3 text-gray-400 font-medium">Precio Web</th>
                    <th className="text-right p-3 text-gray-400 font-medium">Stock</th>
                    <th className="text-center p-3 text-gray-400 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, i) => (
                    <tr key={i} className="border-b border-gray-700/50 hover:bg-gray-750/50">
                      <td className="p-3">
                        <span className="text-white">{product.name}</span>
                        {product.web_name && product.web_name !== product.name && (
                          <span className="block text-xs text-gray-500">Web: {product.web_name}</span>
                        )}
                      </td>
                      <td className="p-3 text-gray-400 font-mono text-xs">{product.sku || '—'}</td>
                      <td className="p-3 text-right text-white font-mono">
                        {product.holded_price ? `${product.holded_price.toFixed(2)}€` : '—'}
                      </td>
                      <td className="p-3 text-right font-mono">
                        {product.web_price ? (
                          <span className={product.synced === false ? 'text-yellow-400' : 'text-green-400'}>
                            {product.web_price.toFixed(2)}€
                          </span>
                        ) : (
                          <span className="text-gray-500">No en web</span>
                        )}
                      </td>
                      <td className="p-3 text-right font-mono">
                        <span className={`${
                          product.stock <= 0 ? 'text-red-400' :
                          product.stock < 50 ? 'text-yellow-400' : 'text-green-400'
                        }`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {product.synced === true && (
                          <span className="px-2 py-0.5 bg-green-900/30 text-green-400 text-xs rounded-full">Sync</span>
                        )}
                        {product.synced === false && (
                          <span className="px-2 py-0.5 bg-yellow-900/30 text-yellow-400 text-xs rounded-full">Diferente</span>
                        )}
                        {product.synced === null && (
                          <span className="px-2 py-0.5 bg-gray-700 text-gray-400 text-xs rounded-full">Solo Holded</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
