import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { API_URL } from '../../config/api';
import AdminLayout from '../../components/admin/AdminLayout';

export default function AdminStock() {
  const { authFetch } = useAdminAuth();
  const [stockData, setStockData] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadStock();
  }, []);

  const loadStock = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/api/admin/stock`);
      if (res && res.ok) {
        const data = await res.json();
        setStockData(data.stock || []);
        setWarehouses(data.warehouses || []);
        setLastUpdated(data.last_updated);
      }
    } catch (err) {
      console.error('Error loading stock:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStockLevel = (stock) => {
    if (stock <= 0) return { label: 'Agotado', color: 'red' };
    if (stock < 10) return { label: 'Crítico', color: 'red' };
    if (stock < 25) return { label: 'Bajo', color: 'amber' };
    if (stock < 50) return { label: 'Medio', color: 'yellow' };
    return { label: 'OK', color: 'emerald' };
  };

  const colorMap = {
    red: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', bar: 'bg-red-500' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', bar: 'bg-amber-500' },
    yellow: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20', bar: 'bg-yellow-500' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', bar: 'bg-emerald-500' },
  };

  const filteredProducts = stockData.filter(p => {
    const matchesSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase());
    if (filter === 'critical') return matchesSearch && p.stock <= 10;
    if (filter === 'low') return matchesSearch && p.stock > 10 && p.stock < 50;
    if (filter === 'ok') return matchesSearch && p.stock >= 50;
    return matchesSearch;
  }).sort((a, b) => a.stock - b.stock);

  const stats = {
    total: stockData.length,
    critical: stockData.filter(p => p.stock <= 10).length,
    low: stockData.filter(p => p.stock > 10 && p.stock < 50).length,
    ok: stockData.filter(p => p.stock >= 50).length,
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Stock</h1>
            <p className="text-gray-500 text-sm mt-1">
              Inventario en tiempo real desde Holded
              {lastUpdated && ` · ${new Date(lastUpdated).toLocaleString('es-ES')}`}
            </p>
          </div>
          <button
            onClick={loadStock}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 text-sm rounded-xl border border-white/10 transition-all disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </button>
        </div>

        {/* Warehouses */}
        {warehouses.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-2">
            {warehouses.map(w => (
              <span key={w.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.03] border border-white/5 text-gray-400 text-xs rounded-lg">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {w.name}
              </span>
            ))}
          </div>
        )}

        {/* Stats Cards */}
        {!loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-white/[0.02] rounded-xl border border-white/5 p-4">
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-gray-500 mt-1">Total productos</p>
            </div>
            <div className="bg-red-500/5 rounded-xl border border-red-500/10 p-4 cursor-pointer hover:border-red-500/30 transition-colors" onClick={() => setFilter('critical')}>
              <p className="text-2xl font-bold text-red-400">{stats.critical}</p>
              <p className="text-xs text-red-400/70 mt-1">Crítico (≤10)</p>
            </div>
            <div className="bg-amber-500/5 rounded-xl border border-amber-500/10 p-4 cursor-pointer hover:border-amber-500/30 transition-colors" onClick={() => setFilter('low')}>
              <p className="text-2xl font-bold text-amber-400">{stats.low}</p>
              <p className="text-xs text-amber-400/70 mt-1">Bajo (11-49)</p>
            </div>
            <div className="bg-emerald-500/5 rounded-xl border border-emerald-500/10 p-4 cursor-pointer hover:border-emerald-500/30 transition-colors" onClick={() => setFilter('ok')}>
              <p className="text-2xl font-bold text-emerald-400">{stats.ok}</p>
              <p className="text-xs text-emerald-400/70 mt-1">Correcto (≥50)</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar producto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
            />
          </div>
          <div className="flex gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/5">
            {[
              { key: 'all', label: 'Todos' },
              { key: 'critical', label: 'Crítico' },
              { key: 'low', label: 'Bajo' },
              { key: 'ok', label: 'OK' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === f.key ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stock List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 text-sm">Consultando stock en Holded...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredProducts.map((item, i) => {
              const level = getStockLevel(item.stock);
              const colors = colorMap[level.color];
              const barWidth = Math.min((item.stock / 100) * 100, 100);
              return (
                <div key={i} className="bg-white/[0.02] rounded-xl border border-white/5 p-4 hover:border-white/10 transition-colors">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex-1 min-w-0 mr-4">
                      <p className="text-sm text-white font-medium truncate">{item.name}</p>
                      {item.sku && <p className="text-xs text-gray-500 font-mono mt-0.5">{item.sku}</p>}
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`text-xl font-bold ${colors.text}`}>{item.stock}</span>
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg ${colors.bg} ${colors.text} border ${colors.border}`}>
                        {level.label}
                      </span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ease-out ${colors.bar}`}
                      style={{ width: `${barWidth}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <svg className="w-10 h-10 text-gray-700 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p className="text-gray-500 text-sm">No se encontraron productos</p>
              </div>
            )}
          </div>
        )}

        {/* Footer count */}
        {!loading && (
          <div className="mt-5 flex items-center justify-between">
            <p className="text-xs text-gray-600">
              Mostrando {filteredProducts.length} de {stockData.length} productos
            </p>
            {filter !== 'all' && (
              <button onClick={() => setFilter('all')} className="text-xs text-emerald-400 hover:text-emerald-300 font-medium">
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
