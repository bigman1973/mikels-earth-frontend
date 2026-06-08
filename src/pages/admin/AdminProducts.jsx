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
  const [sortBy, setSortBy] = useState('margin_desc');
  
  // Simulador
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [simPrice, setSimPrice] = useState('');
  const [editShipping, setEditShipping] = useState('');
  const [editPreparation, setEditPreparation] = useState('');
  const [savingCosts, setSavingCosts] = useState(false);
  const [savingPrice, setSavingPrice] = useState(false);

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

  const saveCosts = async (sku) => {
    setSavingCosts(true);
    try {
      const res = await authFetch(`${API_URL}/api/admin/products/${sku}/costs`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipping_cost: parseFloat(editShipping) || 0,
          preparation_cost: parseFloat(editPreparation) || 0
        })
      });
      if (res && res.ok) {
        setMessage({ type: 'success', text: `Costes de ${sku} guardados correctamente` });
        loadProducts();
      } else {
        setMessage({ type: 'error', text: 'Error al guardar costes' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error de conexión al guardar costes' });
    } finally {
      setSavingCosts(false);
    }
  };

  const saveWebPrice = async (sku) => {
    const price = parseFloat(simPrice);
    if (!price || price <= 0) {
      alert('Introduce un precio válido');
      return;
    }
    if (!confirm(`¿Cambiar el precio web de este producto a ${price.toFixed(2)}€? Este cambio se aplicará en la web.`)) return;
    
    setSavingPrice(true);
    try {
      const res = await authFetch(`${API_URL}/api/admin/products/${sku}/web-price`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price })
      });
      if (res && res.ok) {
        setMessage({ type: 'success', text: `Precio web actualizado a ${price.toFixed(2)}€` });
        loadProducts();
      } else {
        setMessage({ type: 'error', text: 'Error al actualizar precio web' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setSavingPrice(false);
    }
  };

  // Calcular márgenes para cada producto
  const productsWithMargin = useMemo(() => {
    return products.map(p => {
      const cost = p.cost || 0;
      const webPrice = p.web_price || 0;
      const ivaRate = p.iva_rate || 0.04;
      const webPriceNoIva = webPrice > 0 ? webPrice / (1 + ivaRate) : 0;
      const shippingCost = p.shipping_cost || 0;
      const preparationCost = p.preparation_cost || 0;
      
      let marginBrutoPercent = null;
      let marginBrutoAbs = null;
      let marginNetoPercent = null;
      let marginNetoAbs = null;
      
      if (webPriceNoIva > 0 && cost > 0) {
        marginBrutoAbs = webPriceNoIva - cost;
        marginBrutoPercent = ((webPriceNoIva - cost) / webPriceNoIva) * 100;
        marginNetoAbs = webPriceNoIva - cost - shippingCost - preparationCost;
        marginNetoPercent = ((webPriceNoIva - cost - shippingCost - preparationCost) / webPriceNoIva) * 100;
      }
      
      return { 
        ...p, cost, webPriceNoIva, ivaRate, shippingCost, preparationCost,
        marginBrutoPercent, marginBrutoAbs, marginNetoPercent, marginNetoAbs
      };
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

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'margin_desc': return (b.marginNetoPercent || -999) - (a.marginNetoPercent || -999);
        case 'margin_asc': return (a.marginNetoPercent || 999) - (b.marginNetoPercent || 999);
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

  // Stats
  const webStats = useMemo(() => {
    const webProducts = productsWithMargin.filter(p => p.web_price);
    const avgBruto = webProducts.filter(p => p.marginBrutoPercent !== null).length > 0
      ? webProducts.filter(p => p.marginBrutoPercent !== null).reduce((s, p) => s + p.marginBrutoPercent, 0) / webProducts.filter(p => p.marginBrutoPercent !== null).length
      : 0;
    const avgNeto = webProducts.filter(p => p.marginNetoPercent !== null).length > 0
      ? webProducts.filter(p => p.marginNetoPercent !== null).reduce((s, p) => s + p.marginNetoPercent, 0) / webProducts.filter(p => p.marginNetoPercent !== null).length
      : 0;
    return { count: webProducts.length, avgBruto, avgNeto };
  }, [productsWithMargin]);

  // Simulador: calcular margen con precio simulado
  const getSimulatedMargins = (product) => {
    const price = parseFloat(simPrice);
    if (!price || price <= 0) return null;
    const baseNoIva = price / (1 + (product.ivaRate || 0.04));
    const cost = product.cost || 0;
    const shipping = parseFloat(editShipping) || product.shippingCost || 0;
    const preparation = parseFloat(editPreparation) || product.preparationCost || 0;
    
    if (cost <= 0) return null;
    
    const brutoAbs = baseNoIva - cost;
    const brutoPercent = (brutoAbs / baseNoIva) * 100;
    const netoAbs = baseNoIva - cost - shipping - preparation;
    const netoPercent = (netoAbs / baseNoIva) * 100;
    
    return { baseNoIva, brutoAbs, brutoPercent, netoAbs, netoPercent };
  };

  const toggleExpand = (product, i) => {
    if (expandedProduct === i) {
      setExpandedProduct(null);
    } else {
      setExpandedProduct(i);
      setSimPrice(product.web_price?.toString() || '');
      setEditShipping(product.shippingCost?.toString() || '0');
      setEditPreparation(product.preparationCost?.toString() || '0');
    }
  };

  const MarginBadge = ({ percent, label }) => {
    if (percent === null || percent === undefined) return <span className="text-xs text-gray-600">—</span>;
    const color = percent >= 40 ? 'text-emerald-400' : percent >= 25 ? 'text-blue-400' : percent >= 10 ? 'text-amber-400' : 'text-red-400';
    return (
      <div className="text-right">
        <span className={`text-sm font-bold font-mono ${color}`}>{percent.toFixed(1)}%</span>
        {label && <p className="text-[9px] text-gray-600 mt-0.5">{label}</p>}
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Productos</h1>
            <p className="text-gray-500 text-sm mt-1">
              {products.length} en Holded · {webStats.count} en web · 
              Margen bruto: <span className="text-blue-400">{webStats.avgBruto.toFixed(1)}%</span> · 
              Margen neto: <span className="text-emerald-400">{webStats.avgNeto.toFixed(1)}%</span>
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
            className="px-3 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all appearance-none cursor-pointer min-w-[160px]"
          >
            <option value="margin_desc" className="bg-gray-900">Mayor margen neto</option>
            <option value="margin_asc" className="bg-gray-900">Menor margen neto</option>
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

        {/* Legend */}
        <div className="mb-4 flex flex-wrap gap-4 text-[10px] text-gray-500 uppercase tracking-wider">
          <span>Coste/Holded = <span className="text-gray-400">sin IVA</span></span>
          <span>Precio Web = <span className="text-emerald-400">con IVA</span></span>
          <span>Margen Bruto = <span className="text-blue-400">Base - Coste</span></span>
          <span>Margen Neto = <span className="text-emerald-400">Base - Coste - Portes - Preparación</span></span>
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
            <div className="bg-white/[0.02] rounded-2xl border border-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Producto</th>
                      <th className="text-right px-2 py-3 text-xs font-semibold text-red-400 uppercase tracking-wider">Coste</th>
                      <th className="text-right px-2 py-3 text-xs font-semibold text-emerald-400 uppercase tracking-wider">Web</th>
                      <th className="text-right px-2 py-3 text-xs font-semibold text-yellow-400 uppercase tracking-wider">Base</th>
                      <th className="text-right px-2 py-3 text-xs font-semibold text-orange-400 uppercase tracking-wider">Portes</th>
                      <th className="text-right px-2 py-3 text-xs font-semibold text-purple-400 uppercase tracking-wider">Prep.</th>
                      <th className="text-right px-2 py-3 text-xs font-semibold text-blue-400 uppercase tracking-wider">M.Bruto</th>
                      <th className="text-right px-2 py-3 text-xs font-semibold text-emerald-400 uppercase tracking-wider">M.Neto</th>
                      <th className="text-right px-2 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Stock</th>
                      <th className="text-center px-2 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Simular</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredProducts.map((product, i) => (
                      <>
                        <tr key={`row-${i}`} className={`hover:bg-white/[0.02] transition-colors cursor-pointer ${expandedProduct === i ? 'bg-white/[0.03]' : ''}`} onClick={() => toggleExpand(product, i)}>
                          <td className="px-4 py-3">
                            <p className="text-sm text-white font-medium truncate max-w-[200px]">{product.name}</p>
                            <p className="text-[10px] text-gray-500 font-mono mt-0.5">{product.sku || '—'}</p>
                          </td>
                          <td className="px-2 py-3 text-right">
                            <span className="text-sm text-red-400/80 font-mono">
                              {product.cost > 0 ? `${product.cost.toFixed(2)}€` : '—'}
                            </span>
                          </td>
                          <td className="px-2 py-3 text-right">
                            <span className="text-sm text-emerald-400 font-mono font-medium">
                              {product.web_price ? `${product.web_price.toFixed(2)}€` : '—'}
                            </span>
                          </td>
                          <td className="px-2 py-3 text-right">
                            <span className="text-sm text-yellow-400/80 font-mono">
                              {product.webPriceNoIva > 0 ? `${product.webPriceNoIva.toFixed(2)}€` : '—'}
                            </span>
                          </td>
                          <td className="px-2 py-3 text-right">
                            <span className={`text-sm font-mono ${product.shippingCost > 0 ? 'text-orange-400' : 'text-gray-600'}`}>
                              {product.shippingCost > 0 ? `${product.shippingCost.toFixed(2)}€` : '0'}
                            </span>
                          </td>
                          <td className="px-2 py-3 text-right">
                            <span className={`text-sm font-mono ${product.preparationCost > 0 ? 'text-purple-400' : 'text-gray-600'}`}>
                              {product.preparationCost > 0 ? `${product.preparationCost.toFixed(2)}€` : '0'}
                            </span>
                          </td>
                          <td className="px-2 py-3 text-right">
                            <MarginBadge percent={product.marginBrutoPercent} />
                          </td>
                          <td className="px-2 py-3 text-right">
                            <MarginBadge percent={product.marginNetoPercent} />
                          </td>
                          <td className="px-2 py-3 text-right">
                            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                              product.stock <= 0 ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                              product.stock < 20 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                              'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}>
                              {product.stock}
                            </span>
                          </td>
                          <td className="px-2 py-3 text-center">
                            <span className={`text-xs px-2 py-1 rounded-lg transition-all ${expandedProduct === i ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-500 hover:text-gray-300'}`}>
                              {expandedProduct === i ? '▲' : '▼'}
                            </span>
                          </td>
                        </tr>
                        
                        {/* Panel de simulación expandido */}
                        {expandedProduct === i && (
                          <tr key={`sim-${i}`}>
                            <td colSpan={10} className="px-4 py-4 bg-white/[0.02] border-t border-white/5">
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                
                                {/* Columna 1: Costes editables */}
                                <div className="space-y-3">
                                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Costes por unidad</h4>
                                  <div>
                                    <label className="text-[10px] text-orange-400 uppercase tracking-wider font-medium">Portes (€/ud)</label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={editShipping}
                                      onChange={(e) => setEditShipping(e.target.value)}
                                      onClick={(e) => e.stopPropagation()}
                                      className="w-full mt-1 px-3 py-2 bg-white/5 border border-orange-500/20 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-orange-500/50"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] text-purple-400 uppercase tracking-wider font-medium">Preparación (€/ud)</label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={editPreparation}
                                      onChange={(e) => setEditPreparation(e.target.value)}
                                      onClick={(e) => e.stopPropagation()}
                                      className="w-full mt-1 px-3 py-2 bg-white/5 border border-purple-500/20 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-purple-500/50"
                                    />
                                  </div>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); saveCosts(product.sku); }}
                                    disabled={savingCosts}
                                    className="w-full mt-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs rounded-lg border border-white/10 transition-all disabled:opacity-50 font-medium"
                                  >
                                    {savingCosts ? 'Guardando...' : 'Guardar costes'}
                                  </button>
                                </div>

                                {/* Columna 2: Simulador de precio */}
                                <div className="space-y-3">
                                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Simular precio web</h4>
                                  <div>
                                    <label className="text-[10px] text-emerald-400 uppercase tracking-wider font-medium">Nuevo precio web (con IVA)</label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={simPrice}
                                      onChange={(e) => setSimPrice(e.target.value)}
                                      onClick={(e) => e.stopPropagation()}
                                      className="w-full mt-1 px-3 py-2 bg-white/5 border border-emerald-500/20 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-emerald-500/50"
                                    />
                                  </div>
                                  {(() => {
                                    const sim = getSimulatedMargins(product);
                                    if (!sim) return <p className="text-xs text-gray-500 mt-2">Introduce un precio para simular</p>;
                                    return (
                                      <div className="mt-3 space-y-2 p-3 bg-white/[0.03] rounded-lg border border-white/5">
                                        <div className="flex justify-between text-xs">
                                          <span className="text-gray-400">Base sin IVA:</span>
                                          <span className="text-yellow-400 font-mono">{sim.baseNoIva.toFixed(2)}€</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                          <span className="text-gray-400">Margen bruto:</span>
                                          <span className={`font-mono font-bold ${sim.brutoPercent >= 25 ? 'text-blue-400' : 'text-red-400'}`}>
                                            {sim.brutoPercent.toFixed(1)}% ({sim.brutoAbs.toFixed(2)}€)
                                          </span>
                                        </div>
                                        <div className="flex justify-between text-xs border-t border-white/5 pt-2">
                                          <span className="text-gray-400">Margen neto:</span>
                                          <span className={`font-mono font-bold ${sim.netoPercent >= 15 ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {sim.netoPercent.toFixed(1)}% ({sim.netoAbs.toFixed(2)}€)
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })()}
                                  <button
                                    onClick={(e) => { e.stopPropagation(); saveWebPrice(product.sku); }}
                                    disabled={savingPrice}
                                    className="w-full mt-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs rounded-lg border border-emerald-500/30 transition-all disabled:opacity-50 font-medium"
                                  >
                                    {savingPrice ? 'Guardando...' : 'Guardar precio en web'}
                                  </button>
                                </div>

                                {/* Columna 3: Resumen actual */}
                                <div className="space-y-3">
                                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Desglose actual</h4>
                                  <div className="space-y-2 p-3 bg-white/[0.03] rounded-lg border border-white/5">
                                    <div className="flex justify-between text-xs">
                                      <span className="text-gray-400">Precio web (IVA inc.):</span>
                                      <span className="text-emerald-400 font-mono">{product.web_price?.toFixed(2) || '—'}€</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                      <span className="text-gray-400">Base sin IVA ({(product.ivaRate * 100).toFixed(0)}%):</span>
                                      <span className="text-yellow-400 font-mono">{product.webPriceNoIva > 0 ? product.webPriceNoIva.toFixed(2) : '—'}€</span>
                                    </div>
                                    <div className="flex justify-between text-xs border-t border-white/5 pt-2">
                                      <span className="text-gray-400">(-) Coste producto:</span>
                                      <span className="text-red-400 font-mono">{product.cost > 0 ? product.cost.toFixed(2) : '—'}€</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                      <span className="text-gray-400">(-) Portes:</span>
                                      <span className="text-orange-400 font-mono">{product.shippingCost.toFixed(2)}€</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                      <span className="text-gray-400">(-) Preparación:</span>
                                      <span className="text-purple-400 font-mono">{product.preparationCost.toFixed(2)}€</span>
                                    </div>
                                    <div className="flex justify-between text-xs border-t border-white/5 pt-2 font-bold">
                                      <span className="text-gray-300">= Margen bruto:</span>
                                      <span className={`font-mono ${product.marginBrutoPercent >= 25 ? 'text-blue-400' : 'text-red-400'}`}>
                                        {product.marginBrutoAbs !== null ? `${product.marginBrutoAbs.toFixed(2)}€ (${product.marginBrutoPercent.toFixed(1)}%)` : '—'}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-xs font-bold">
                                      <span className="text-gray-300">= Margen neto:</span>
                                      <span className={`font-mono ${product.marginNetoPercent >= 15 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {product.marginNetoAbs !== null ? `${product.marginNetoAbs.toFixed(2)}€ (${product.marginNetoPercent.toFixed(1)}%)` : '—'}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-[10px] text-gray-600 mt-2">
                                    PVP Holded (sin IVA): {product.holded_price ? `${product.holded_price.toFixed(2)}€` : '—'}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredProducts.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-gray-500 text-sm">No se encontraron productos</p>
                </div>
              )}
            </div>

            {/* Results count */}
            <div className="mt-5 flex items-center justify-between">
              <p className="text-xs text-gray-600">
                Mostrando {filteredProducts.length} de {products.length} productos · Clic en un producto para abrir el simulador
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
