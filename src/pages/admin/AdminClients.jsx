import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { API_URL } from '../../config/api';
import AdminLayout from '../../components/admin/AdminLayout';

export default function AdminClients() {
  const { authFetch } = useAdminAuth();
  const navigate = useNavigate();
  const [b2bClients, setB2bClients] = useState([]);
  const [webClients, setWebClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('web'); // 'web' o 'b2b'

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/api/admin/clients`);
      if (res && res.ok) {
        const data = await res.json();
        setB2bClients(data.b2b || []);
        setWebClients(data.web || []);
      }
    } catch (err) {
      console.error('Error loading clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => {
    if (!val) return '0,00€';
    return val.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '€';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const currentClients = activeTab === 'web' ? webClients : b2bClients;

  const filteredClients = currentClients.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name?.toLowerCase().includes(q) || 
           c.email?.toLowerCase().includes(q) ||
           c.phone?.includes(q);
  });

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Clientes</h1>
            <p className="text-gray-500 text-sm mt-1">
              {webClients.length} web · {b2bClients.length} B2B/Contado
            </p>
          </div>
          <button
            onClick={loadClients}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 text-sm rounded-xl border border-white/10 transition-all disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('web')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border transition-all ${
              activeTab === 'web'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-white/[0.02] text-gray-400 border-white/5 hover:border-white/10'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            Web ({webClients.length})
          </button>
          <button
            onClick={() => setActiveTab('b2b')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border transition-all ${
              activeTab === 'b2b'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-white/[0.02] text-gray-400 border-white/5 hover:border-white/10'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            B2B / Contado ({b2bClients.length})
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por nombre, email o teléfono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 text-sm">Cargando clientes...</p>
            </div>
          </div>
        ) : activeTab === 'web' ? (
          /* ===== WEB CLIENTS ===== */
          <>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white/[0.02] rounded-2xl border border-white/5 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Cliente</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
                    <th className="text-center px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Pedidos</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Total gastado</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Último pedido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredClients.map((client, i) => (
                    <tr key={i} onClick={() => navigate(`/admin/clientes/${client.id}`)} className="hover:bg-white/[0.02] transition-colors cursor-pointer">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-emerald-400">
                              {client.name ? client.name.charAt(0).toUpperCase() : '?'}
                            </span>
                          </div>
                          <span className="text-sm text-white font-medium truncate max-w-[200px]">{client.name || '—'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-gray-400">{client.email || '—'}</span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-bold">
                          {client.order_count || 0}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="text-sm text-emerald-400 font-bold font-mono">
                          {formatCurrency(client.total_spent)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="text-xs text-gray-500">
                          {formatDate(client.last_order)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredClients.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-gray-500 text-sm">No se encontraron clientes web</p>
                </div>
              )}
            </div>

            {/* Mobile Cards - Web */}
            <div className="md:hidden space-y-3">
              {filteredClients.map((client, i) => (
                <div key={i} onClick={() => navigate(`/admin/clientes/${client.id}`)} className="bg-white/[0.02] rounded-xl border border-white/5 p-4 hover:border-emerald-500/20 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-emerald-400">
                        {client.name ? client.name.charAt(0).toUpperCase() : '?'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{client.name || '—'}</p>
                      <p className="text-xs text-gray-500 truncate">{client.email || '—'}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm text-emerald-400 font-bold font-mono">{formatCurrency(client.total_spent)}</p>
                      <p className="text-[10px] text-gray-500">{client.order_count} pedido{client.order_count !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* ===== B2B / CONTADO CLIENTS ===== */
          <>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white/[0.02] rounded-2xl border border-white/5 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Cliente</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Teléfono</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Facturado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredClients.map((client, i) => (
                    <tr key={i} onClick={() => client.id && navigate(`/admin/clientes/${client.id}`)} className="hover:bg-white/[0.02] transition-colors cursor-pointer">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-amber-400">
                              {client.name ? client.name.charAt(0).toUpperCase() : '?'}
                            </span>
                          </div>
                          <span className="text-sm text-white font-medium truncate max-w-[200px]">{client.name || '—'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-gray-400">{client.email || '—'}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-gray-400 font-mono">{client.phone || '—'}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="text-sm text-amber-400 font-bold font-mono">
                          {formatCurrency(client.total_invoiced)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredClients.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-gray-500 text-sm">No se encontraron clientes B2B</p>
                </div>
              )}
            </div>

            {/* Mobile Cards - B2B */}
            <div className="md:hidden space-y-3">
              {filteredClients.map((client, i) => (
                <div key={i} onClick={() => client.id && navigate(`/admin/clientes/${client.id}`)} className="bg-white/[0.02] rounded-xl border border-white/5 p-4 hover:border-amber-500/20 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-amber-400">
                        {client.name ? client.name.charAt(0).toUpperCase() : '?'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{client.name || '—'}</p>
                      <p className="text-xs text-gray-500 truncate">{client.email || '—'}</p>
                    </div>
                    <span className="text-sm text-amber-400 font-bold font-mono flex-shrink-0">
                      {formatCurrency(client.total_invoiced)}
                    </span>
                  </div>
                  {client.phone && (
                    <p className="text-xs text-gray-500 ml-12 font-mono">{client.phone}</p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="mt-5">
          <p className="text-xs text-gray-600">
            Mostrando {filteredClients.length} de {currentClients.length} clientes {activeTab === 'web' ? 'web' : 'B2B/Contado'}
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
