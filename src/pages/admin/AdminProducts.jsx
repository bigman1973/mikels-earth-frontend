import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { API_URL } from '../../config/api';
import AdminLayout from '../../components/admin/AdminLayout';

export default function AdminProducts() {
  const { authFetch } = useAdminAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState(null);
  const [editingPrice, setEditingPrice] = useState(null);
  const [newPrice, setNewPrice] = useState('');

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
        loadProducts();
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al sincronizar con Holded' });
    } finally {
      setSyncing(false);
    }
  };

  const updateWebPrice = async (productId) => {
    try {
      const res = await authFetch(`${API_URL}/api/admin/products/${productId}/web-price`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: parseFloat(newPrice) })
      });
      if (res && res.ok) {
        setEditingPrice(null);
        setNewPrice('');
        loadProducts();
      }
    } catch (err) {
      alert('Error al actualizar precio');
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = !search || 
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase());
    
    if (filter === 'price_diff') return matchesSearch && p.synced === false;
    if (filter === 'no_stock') return matchesSearch && (p.stock <= 0);
    if (filter === 'web_only') return matchesSearch && p.web_price;
    return matchesSearch;
  });

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Productos</h1>
            <p className="text-gray-500 text-sm mt-1">
              {products.length} productos en Holded · Comparación y sincronización manual
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={syncFromHolded}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-sm rounded-xl border border-emerald-500/20 transition-all disabled:opacity-50 font-medium"
            >
              <svg className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {syncing ? 'Comparando...' : 'Comparar con Holded'}
            </button>
            <button
              onClick={loadProducts}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 text-sm rounded-xl border border-white/10 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refrescar
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-5 p-4 rounded-xl text-sm flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-emerald-500/5 text-emerald-400 border border-emerald-500/20' 
              : 'bg-red-500/5 text-red-400 border border-red-500/20'
          }`}>
            <span className="text-base">{message.type === 'success' ? '✓' : '✗'}</span>
            {message.text}
            <button onClick={() => setMessage(null)} className="ml-auto text-gray-500 hover:text-gray-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}

        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por nombre o SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
            />
          </div>
          <div className="flex gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/5">
            {[
              { key: 'all', label: 'Todos' },
              { key: 'price_diff', label: 'Precio ≠' },
              { key: 'no_stock', label: 'Sin Stock' },
              { key: 'web_only', label: 'En Web' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === f.key 
                    ? 'bg-white/10 text-white' 
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Products Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 text-sm">Cargando productos de Holded...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white/[0.02] rounded-2xl border border-white/5 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Producto</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">SKU</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Precio Holded</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Precio Web</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Stock</th>
                    <th className="text-center px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Estado</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredProducts.map((product, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-5 py-3.5">
                        <p className="text-sm text-white font-medium truncate max-w-[250px]">{product.name}</p>
                        {product.web_name && product.web_name !== product.name && (
                          <p className="text-[11px] text-gray-500 truncate mt-0.5">Web: {product.web_name}</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-gray-500 font-mono">{product.sku || '—'}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="text-sm text-gray-300 font-medium font-mono">
                          {product.holded_price ? `${product.holded_price.toFixed(2)}€` : '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {editingPrice === i ? (
                          <div className="flex items-center justify-end gap-2">
                            <input
                              type="number"
                              step="0.01"
                              value={newPrice}
                              onChange={(e) => setNewPrice(e.target.value)}
                              className="w-24 px-2.5 py-1.5 bg-white/5 border border-emerald-500/30 rounded-lg text-sm text-white text-right focus:outline-none focus:border-emerald-500/50 font-mono"
                              autoFocus
                              onKeyDown={(e) => { if (e.key === 'Enter') updateWebPrice(product.holded_id); if (e.key === 'Escape') setEditingPrice(null); }}
                            />
                            <button onClick={() => updateWebPrice(product.holded_id)} className="p-1 text-emerald-400 hover:text-emerald-300 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </button>
                            <button onClick={() => setEditingPrice(null)} className="p-1 text-gray-500 hover:text-gray-300 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        ) : (
                          <span className={`text-sm font-medium font-mono ${
                            product.synced === false ? 'text-amber-400' : 
                            product.web_price ? 'text-emerald-400' : 'text-gray-500'
                          }`}>
                            {product.web_price ? `${product.web_price.toFixed(2)}€` : 'No en web'}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                          product.stock <= 0 ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          product.stock < 20 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          product.stock < 50 ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                          'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {product.synced === true && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] rounded-lg border border-emerald-500/20 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            Sync
                          </span>
                        )}
                        {product.synced === false && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 text-amber-400 text-[10px] rounded-lg border border-amber-500/20 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                            Diferente
                          </span>
                        )}
                        {product.synced === null && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/5 text-gray-400 text-[10px] rounded-lg border border-white/10 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                            Solo Holded
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => { setEditingPrice(i); setNewPrice(product.web_price || product.holded_price || ''); }}
                          className="opacity-0 group-hover:opacity-100 text-xs text-emerald-400 hover:text-emerald-300 transition-all font-medium px-3 py-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredProducts.length === 0 && (
                <div className="text-center py-16">
                  <svg className="w-10 h-10 text-gray-700 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <p className="text-gray-500 text-sm">No se encontraron productos</p>
                  <p className="text-gray-600 text-xs mt-1">Prueba con otros filtros o términos de búsqueda</p>
                </div>
              )}
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {filteredProducts.map((product, i) => (
                <div key={i} className="bg-white/[0.02] rounded-xl border border-white/5 p-4 hover:border-white/10 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="text-sm text-white font-medium">{product.name}</p>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">{product.sku || '—'}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-lg flex-shrink-0 ${
                      product.stock <= 0 ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      product.stock < 20 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {product.stock} uds
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-5">
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Holded</p>
                        <p className="text-sm text-gray-300 font-medium font-mono">{product.holded_price ? `${product.holded_price.toFixed(2)}€` : '—'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Web</p>
                        <p className={`text-sm font-medium font-mono ${
                          product.synced === false ? 'text-amber-400' : 
                          product.web_price ? 'text-emerald-400' : 'text-gray-500'
                        }`}>
                          {product.web_price ? `${product.web_price.toFixed(2)}€` : 'No'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {product.synced === false && (
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      )}
                      <button
                        onClick={() => { setEditingPrice(i); setNewPrice(product.web_price || product.holded_price || ''); }}
                        className="text-xs text-emerald-400 font-medium px-3 py-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20"
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Results count */}
            <div className="mt-5 flex items-center justify-between">
              <p className="text-xs text-gray-600">
                Mostrando {filteredProducts.length} de {products.length} productos
              </p>
              {filter !== 'all' && (
                <button onClick={() => setFilter('all')} className="text-xs text-emerald-400 hover:text-emerald-300 font-medium">
                  Limpiar filtros
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
