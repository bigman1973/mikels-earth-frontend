import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { API_URL } from '../../config/api';
import AdminLayout from '../../components/admin/AdminLayout';

export default function AdminClients() {
  const { authFetch } = useAdminAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/api/admin/clients`);
      if (res && res.ok) {
        const data = await res.json();
        setClients(data.clients || []);
      }
    } catch (err) {
      console.error('Error loading clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(c => {
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
              {clients.length} contactos sincronizados con Holded
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

        {/* Clients */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 text-sm">Cargando clientes de Holded...</p>
            </div>
          </div>
        ) : (
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
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
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
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-gray-400 font-mono">{client.phone || client.mobile || '—'}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="text-sm text-emerald-400 font-bold font-mono">
                          {client.total_invoiced ? `${client.total_invoiced.toFixed(2)}€` : '0€'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredClients.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-gray-500 text-sm">No se encontraron clientes</p>
                </div>
              )}
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {filteredClients.map((client, i) => (
                <div key={i} className="bg-white/[0.02] rounded-xl border border-white/5 p-4 hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-emerald-400">
                        {client.name ? client.name.charAt(0).toUpperCase() : '?'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{client.name || '—'}</p>
                      <p className="text-xs text-gray-500 truncate">{client.email || '—'}</p>
                    </div>
                    <span className="text-sm text-emerald-400 font-bold font-mono flex-shrink-0">
                      {client.total_invoiced ? `${client.total_invoiced.toFixed(2)}€` : '0€'}
                    </span>
                  </div>
                  {(client.phone || client.mobile) && (
                    <p className="text-xs text-gray-500 ml-12 font-mono">{client.phone || client.mobile}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-5">
              <p className="text-xs text-gray-600">
                Mostrando {filteredClients.length} de {clients.length} contactos
              </p>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
