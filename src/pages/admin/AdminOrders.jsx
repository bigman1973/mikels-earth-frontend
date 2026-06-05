import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { API_URL } from '../../config/api';
import AdminLayout from '../../components/admin/AdminLayout';

export default function AdminOrders() {
  const { authFetch } = useAdminAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/api/admin/orders`);
      if (res && res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const createInHolded = async (orderId) => {
    setActionLoading(`holded-${orderId}`);
    try {
      const res = await authFetch(`${API_URL}/api/admin/orders/${orderId}/create-in-holded`, { method: 'POST' });
      if (res && res.ok) {
        loadOrders();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (err) {
      alert('Error de conexión');
    } finally {
      setActionLoading(null);
    }
  };

  const createInvoice = async (orderId) => {
    setActionLoading(`invoice-${orderId}`);
    try {
      const res = await authFetch(`${API_URL}/api/admin/orders/${orderId}/invoice`, { method: 'POST' });
      if (res && res.ok) {
        loadOrders();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (err) {
      alert('Error de conexión');
    } finally {
      setActionLoading(null);
    }
  };

  const statusConfig = {
    pending: { label: 'Pendiente', color: 'amber' },
    paid: { label: 'Pagado', color: 'blue' },
    shipped: { label: 'Enviado', color: 'purple' },
    delivered: { label: 'Entregado', color: 'emerald' },
    cancelled: { label: 'Cancelado', color: 'red' },
  };

  const colorMap = {
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = !search || 
      o.customer_email?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.id?.toString().includes(search);
    if (filter === 'all') return matchesSearch;
    return matchesSearch && o.status === filter;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending' || o.status === 'paid').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    revenue: orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + (o.total || 0), 0),
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Pedidos</h1>
            <p className="text-gray-500 text-sm mt-1">
              Gestión de pedidos · Sincronización con Holded
            </p>
          </div>
          <button
            onClick={loadOrders}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 text-sm rounded-xl border border-white/10 transition-all disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white/[0.02] rounded-xl border border-white/5 p-4">
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-xs text-gray-500 mt-1">Total pedidos</p>
          </div>
          <div className="bg-amber-500/5 rounded-xl border border-amber-500/10 p-4">
            <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
            <p className="text-xs text-amber-400/70 mt-1">Por gestionar</p>
          </div>
          <div className="bg-purple-500/5 rounded-xl border border-purple-500/10 p-4">
            <p className="text-2xl font-bold text-purple-400">{stats.shipped}</p>
            <p className="text-xs text-purple-400/70 mt-1">En tránsito</p>
          </div>
          <div className="bg-emerald-500/5 rounded-xl border border-emerald-500/10 p-4">
            <p className="text-2xl font-bold text-emerald-400">{stats.revenue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€</p>
            <p className="text-xs text-emerald-400/70 mt-1">Facturación</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por email, nombre o ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
            />
          </div>
          <div className="flex gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/5 overflow-x-auto">
            {[
              { key: 'all', label: 'Todos' },
              { key: 'pending', label: 'Pendiente' },
              { key: 'paid', label: 'Pagado' },
              { key: 'shipped', label: 'Enviado' },
              { key: 'delivered', label: 'Entregado' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  filter === f.key ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 text-sm">Cargando pedidos...</p>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-white/[0.02] rounded-2xl border border-white/5">
            <svg className="w-12 h-12 text-gray-700 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-500 text-sm">No se encontraron pedidos</p>
            <p className="text-gray-600 text-xs mt-1">Los pedidos aparecerán aquí cuando se realicen compras</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order, index) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              const orderNum = orders.length - orders.indexOf(order);
              return (
                <div key={order.id} className="bg-white/[0.02] rounded-xl border border-white/5 p-5 hover:border-white/10 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Order info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className="text-sm text-white font-bold font-mono">#{orderNum}</span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold rounded-lg border ${colorMap[status.color]}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {status.label}
                        </span>
                        {order.holded_id && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] rounded-md border border-emerald-500/20 font-medium">
                            Holded ✓
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="text-sm text-gray-300">{order.customer_name || 'Cliente'}</span>
                        <span className="text-xs text-gray-500">{order.customer_email}</span>
                        <span className="text-xs text-gray-600">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                    </div>

                    {/* Amount + Actions */}
                    <div className="flex items-center gap-4">
                      <span className="text-lg text-white font-bold font-mono">
                        {order.total ? order.total.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '€' : '—'}
                      </span>
                      <div className="flex gap-2">
                        {!order.holded_id && (
                          <button
                            onClick={() => createInHolded(order.id)}
                            disabled={actionLoading === `holded-${order.id}`}
                            className="flex items-center gap-1.5 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs rounded-lg border border-blue-500/20 transition-all disabled:opacity-50 font-medium"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            {actionLoading === `holded-${order.id}` ? 'Creando...' : 'Holded'}
                          </button>
                        )}
                        <button
                          onClick={() => createInvoice(order.id)}
                          disabled={actionLoading === `invoice-${order.id}`}
                          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs rounded-lg border border-emerald-500/20 transition-all disabled:opacity-50 font-medium"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {actionLoading === `invoice-${order.id}` ? 'Facturando...' : 'Facturar'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        {!loading && filteredOrders.length > 0 && (
          <div className="mt-5 flex items-center justify-between">
            <p className="text-xs text-gray-600">
              Mostrando {filteredOrders.length} de {orders.length} pedidos
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
