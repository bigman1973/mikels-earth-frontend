import { useState, useEffect, useMemo } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { API_URL } from '../../config/api';
import AdminLayout from '../../components/admin/AdminLayout';

export default function AdminProducts() {
  const { authFetch } = useAdminAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('web_only');
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState(null);
  const [editingPrice, setEditingPrice] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  const [sortBy, setSortBy] = useState('margin_desc');

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

  // Calcular margen para cada producto
  // Precio web incluye IVA, coste y holded_price son sin IVA
  // Para calcular margen real: precio web sin IVA vs coste
  const productsWithMargin = useMemo(() => {
    return products.map(p => {
      const cost = p.cost || 0;
      const webPrice = p.web_price || 0;
      const ivaRate = p.iva_rate || 0.04; // 4% por defecto (AOVE)
      const webPriceNoIva = webPrice > 0 ? webPrice / (1 + ivaRate) : 0;
      let marginPercent = null;
      let marginAbsolute = null;
      if (webPriceNoIva > 0 && cost > 0) {
        marginAbsolute = webPriceNoIva - cost;
        marginPercent = ((webPriceNoIva - cost) / cost) * 100;
      }
      return { ...p, cost, marginPercent, marginAbsolute, webPriceNoIva, ivaRate };
    });
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = productsWithMargin.filter(p => {
      const matchesSearch = !search || 
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(search.toLowerCase());
      
      if (filter === 'price_diff') return matchesSearch && p.synced === false;
      if (filter === 'no_stock') return matchesSearch && (p.stock <= 0);
      if (filter === 'web_only') return matchesSearch && p.web_price;
      if (filter === 'web_no_holded') return matchesSearch && p.source === 'web_only';
      return matchesSearch;
    });

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'margin_desc': return (b.marginPercent || -999) - (a.marginPercent || -999);
        case 'margin_asc': return (a.marginPercent || 999) - (b.marginPercent || 999);
        case 'price_desc': return (b.web_price || 0) - (a.web_price || 0);
        case 'price_asc': return (a.web_price || 0) - (b.web_price || 0);
        case 'cost_desc': return (b.cost || 0) - (a.cost || 0);
        case 'cost_asc': return (a.cost || 0) - (b.cost || 0);
        case 'name_asc': return (a.name || '').localeCompare(b.name || '');
        case 'name_desc': return (b.name || '').localeCompare(a.name || '');
        default: return 0;
      }
    });

    return filtered;
  }, [productsWithMargin, search, filter, sortBy]);

  // Stats de productos en web
  const webStats = useMemo(() => {
    const webProducts = productsWithMargin.filter(p => p.web_price);
    const totalCost = webProducts.reduce((s, p) => s + (p.cost || 0), 0);
    const totalWebPrice = webProducts.reduce((s, p) => s + (p.web_price || 0), 0);
    const avgMargin = webProducts.filter(p => p.marginPercent !== null).length > 0
      ? webProducts.filter(p => p.marginPercent !== null).reduce((s, p) => s + p.marginPercent, 0) / webProducts.filter(p => p.marginPercent !== null).length
      : 0;
    return {
      count: webProducts.length,
      avgMargin,
      totalCost,
      totalWebPrice
    };
  }, [productsWithMargin]);

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Productos</h1>
            <p className="text-gray-500 text-sm mt-1">
              {products.length} en Holded · {webStats.count} en web · Margen medio: {webStats.avgMargin.toFixed(1)}% · <span className="text-gray-600">(Coste y Holded = sin IVA | Web = con IVA)</span>
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
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all appearance-none cursor-pointer min-w-[150px]"
          >
            <option value="margin_desc" className="bg-gray-900">Mayor margen</option>
            <option value="margin_asc" className="bg-gray-900">Menor margen</option>
            <option value="price_desc" className="bg-gray-900">Mayor precio web</option>
            <option value="price_asc" className="bg-gray-900">Menor precio web</option>
            <option value="cost_desc" className="bg-gray-900">Mayor coste</option>
            <option value="cost_asc" className="bg-gray-900">Menor coste</option>
            <option value="name_asc" className="bg-gray-900">A-Z</option>
            <option value="name_desc" className="bg-gray-900">Z-A</option>
          </select>
          <div className="flex gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/5 overflow-x-auto">
            {[
              { key: 'web_only', label: 'En Web' },
              { key: 'all', label: 'Todos' },
              { key: 'web_no_holded', label: 'Solo Web' },
              { key: 'price_diff', label: 'Precio ≠' },
              { key: 'no_stock', label: 'Sin Stock' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
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
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Producto</th>
                      <th className="text-left px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">SKU</th>
                      <th className="text-right px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        <span className="text-red-400">Coste</span>
                        <span className="block text-[9px] text-gray-600 normal-case">sin IVA</span>
                      </th>
                      <th className="text-right px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        <span className="text-gray-400">PVP Holded</span>
                        <span className="block text-[9px] text-gray-600 normal-case">sin IVA</span>
                      </th>
                      <th className="text-right px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        <span className="text-emerald-400">Precio Web</span>
                        <span className="block text-[9px] text-gray-600 normal-case">con IVA</span>
                      </th>
                      <th className="text-right px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        <span className="text-blue-400">Margen</span>
                      </th>
                      <th className="text-right px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Stock</th>
                      <th className="text-right px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredProducts.map((product, i) => (
                      <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-4 py-3.5">
                          <p className="text-sm text-white font-medium truncate max-w-[220px]">{product.name}</p>
                          {product.web_name && product.web_name !== product.name && (
                            <p className="text-[11px] text-gray-500 truncate mt-0.5">Web: {product.web_name}</p>
                          )}
                        </td>
                        <td className="px-3 py-3.5">
                          <span className="text-xs text-gray-500 font-mono">{product.sku || '—'}</span>
                        </td>
                        <td className="px-3 py-3.5 text-right">
                          <span className="text-sm text-red-400/80 font-mono">
                            {product.cost > 0 ? `${product.cost.toFixed(2)}€` : '—'}
                          </span>
                        </td>
                        <td className="px-3 py-3.5 text-right">
                          <span className="text-sm text-gray-300 font-mono">
                            {product.holded_price ? `${product.holded_price.toFixed(2)}€` : '—'}
                          </span>
                        </td>
                        <td className="px-3 py-3.5 text-right">
                          {editingPrice === i ? (
                            <div className="flex items-center justify-end gap-1">
                              <input
                                type="number"
                                step="0.01"
                                value={newPrice}
                                onChange={(e) => setNewPrice(e.target.value)}
                                className="w-20 px-2 py-1.5 bg-white/5 border border-emerald-500/30 rounded-lg text-sm text-white text-right focus:outline-none focus:border-emerald-500/50 font-mono"
                                autoFocus
                                onKeyDown={(e) => { if (e.key === 'Enter') updateWebPrice(product.holded_id); if (e.key === 'Escape') setEditingPrice(null); }}
                              />
                              <button onClick={() => updateWebPrice(product.holded_id)} className="p-1 text-emerald-400 hover:text-emerald-300 transition-colors">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                              </button>
                              <button onClick={() => setEditingPrice(null)} className="p-1 text-gray-500 hover:text-gray-300 transition-colors">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                          ) : (
                            <span className={`text-sm font-medium font-mono ${
                              product.synced === false ? 'text-amber-400' : 
                              product.web_price ? 'text-emerald-400' : 'text-gray-600'
                            }`}>
                              {product.web_price ? `${product.web_price.toFixed(2)}€` : 'No en web'}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3.5 text-right">
                          {product.marginPercent !== null ? (
                            <div className="text-right">
                              <span className={`text-sm font-bold font-mono ${
                                product.marginPercent >= 50 ? 'text-emerald-400' :
                                product.marginPercent >= 30 ? 'text-blue-400' :
                                product.marginPercent >= 15 ? 'text-amber-400' :
                                'text-red-400'
                              }`}>
                                {product.marginPercent.toFixed(1)}%
                              </span>
                              <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                                +{product.marginAbsolute.toFixed(2)}€
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-600">—</span>
                          )}
                        </td>
                        <td className="px-3 py-3.5 text-right">
                          <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                            product.stock <= 0 ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            product.stock < 20 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            product.stock < 50 ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                            'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-3 py-3.5 text-right">
                          <button
                            onClick={() => { setEditingPrice(i); setNewPrice(product.web_price || product.holded_price || ''); }}
                            className="opacity-0 group-hover:opacity-100 text-xs text-emerald-400 hover:text-emerald-300 transition-all font-medium px-2.5 py-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20"
                          >
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {product.marginPercent !== null && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                          product.marginPercent >= 50 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          product.marginPercent >= 30 ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          product.marginPercent >= 15 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {product.marginPercent.toFixed(1)}%
                        </span>
                      )}
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                        product.stock <= 0 ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        product.stock < 20 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {product.stock} uds
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Coste</p>
                      <p className="text-sm text-red-400/80 font-mono">{product.cost > 0 ? `${product.cost.toFixed(2)}€` : '—'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Holded</p>
                      <p className="text-sm text-gray-300 font-mono">{product.holded_price ? `${product.holded_price.toFixed(2)}€` : '—'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Web</p>
                      <p className={`text-sm font-mono ${product.web_price ? 'text-emerald-400' : 'text-gray-500'}`}>
                        {product.web_price ? `${product.web_price.toFixed(2)}€` : 'No'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Margen</p>
                      <p className={`text-sm font-bold font-mono ${
                        product.marginPercent === null ? 'text-gray-600' :
                        product.marginPercent >= 50 ? 'text-emerald-400' :
                        product.marginPercent >= 30 ? 'text-blue-400' :
                        product.marginPercent >= 15 ? 'text-amber-400' :
                        'text-red-400'
                      }`}>
                        {product.marginPercent !== null ? `${product.marginPercent.toFixed(1)}%` : '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end mt-3 pt-3 border-t border-white/5">
                    <button
                      onClick={() => { setEditingPrice(i); setNewPrice(product.web_price || product.holded_price || ''); }}
                      className="text-xs text-emerald-400 font-medium px-3 py-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20"
                    >
                      Editar precio
                    </button>
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
