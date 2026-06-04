import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { API_URL } from '../../config/api';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';

export default function AdminDashboard() {
  const { authFetch, user } = useAdminAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch(`${API_URL}/api/admin/dashboard`);
      if (res && res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        setError('No se pudieron cargar los datos. Reintenta en unos segundos.');
      }
    } catch (err) {
      setError('Error de conexión con el servidor.');
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">
              Bienvenido, {user?.name?.split(' ')[0]}. Último acceso: {user?.last_login ? formatDate(user.last_login) : 'Primera vez'}
            </p>
          </div>
          <button
            onClick={loadDashboard}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg border border-gray-700 transition-colors disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </button>
        </div>

        {/* Loading */}
        {loading && !data && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400 text-sm">Cargando datos del dashboard...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && !data && (
          <div className="bg-red-900/20 border border-red-800/40 rounded-xl p-6 text-center">
            <p className="text-red-400 text-sm mb-3">{error}</p>
            <button
              onClick={loadDashboard}
              className="px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-300 text-sm rounded-lg border border-red-800/50 transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Dashboard Content */}
        {data && (
          <>
            {/* KPIs Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <KPICard
                title="Pedidos"
                value={data.total_orders}
                icon="🛒"
                color="blue"
                link="/admin/pedidos"
              />
              <KPICard
                title="Productos Holded"
                value={data.total_products_holded}
                icon="🫒"
                color="green"
                link="/admin/productos"
              />
              <KPICard
                title="Reseñas"
                value={data.total_reviews}
                icon="⭐"
                color="yellow"
              />
              <KPICard
                title="Avisos Producto"
                value={data.total_notifications || 0}
                icon="🔔"
                color="purple"
                subtitle="pendientes"
              />
              <KPICard
                title="Carritos Abandonados"
                value={data.total_abandoned_carts || 0}
                icon="🛑"
                color="red"
                subtitle="sin recuperar"
              />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Alertas de Stock */}
              <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-700/50 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                    <span className="text-amber-400">⚠️</span> Alertas de Stock Bajo
                  </h2>
                  <Link to="/admin/stock" className="text-xs text-green-400 hover:text-green-300 transition-colors">
                    Ver todo →
                  </Link>
                </div>
                <div className="p-4">
                  {data.low_stock_alerts && data.low_stock_alerts.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {data.low_stock_alerts.map((item, i) => (
                        <div key={i} className="flex items-center justify-between py-2.5 px-3 bg-gray-900/50 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.sku}</p>
                          </div>
                          <span className={`text-sm font-mono font-medium px-2 py-0.5 rounded ${
                            item.stock <= 0 ? 'bg-red-900/30 text-red-400' : 
                            item.stock < 20 ? 'bg-amber-900/30 text-amber-400' : 
                            'bg-yellow-900/30 text-yellow-400'
                          }`}>
                            {item.stock} uds
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-sm">Sin alertas de stock</p>
                      <p className="text-gray-600 text-xs mt-1">Todos los productos tienen stock suficiente</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Últimos Pedidos */}
              <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-700/50 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                    <span>📋</span> Últimos Pedidos
                  </h2>
                  <Link to="/admin/pedidos" className="text-xs text-green-400 hover:text-green-300 transition-colors">
                    Ver todo →
                  </Link>
                </div>
                <div className="p-4">
                  {data.recent_orders && data.recent_orders.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {data.recent_orders.map((order, i) => (
                        <div key={i} className="flex items-center justify-between py-2.5 px-3 bg-gray-900/50 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{order.email}</p>
                            <p className="text-xs text-gray-500">{formatDate(order.date)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-green-400">{order.total ? `${order.total.toFixed(2)}€` : '—'}</p>
                            <p className={`text-xs capitalize ${
                              order.status === 'completed' ? 'text-green-500' :
                              order.status === 'pending' ? 'text-yellow-500' :
                              'text-gray-500'
                            }`}>{order.status || 'nuevo'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-sm">Sin pedidos recientes</p>
                      <p className="text-gray-600 text-xs mt-1">Los pedidos aparecerán aquí cuando se realicen</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Estado del Sistema */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-700/50">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span>🔗</span> Estado de Integraciones
                </h2>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <StatusCard
                    name="Holded API"
                    status={data.holded_status === 'connected' ? 'online' : 'error'}
                    detail={`${data.total_products_holded} productos sincronizados`}
                  />
                  <StatusCard
                    name="Stripe Payments"
                    status="online"
                    detail="Pagos activos"
                  />
                  <StatusCard
                    name="Klaviyo Email"
                    status="online"
                    detail="Flows activos"
                  />
                </div>
                <div className="mt-4 pt-4 border-t border-gray-700/50 flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    Última actualización: {formatDate(data.last_updated)}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Rol:</span>
                    <span className="text-xs font-medium text-green-400 capitalize bg-green-900/20 px-2 py-0.5 rounded-full">
                      {user?.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

function KPICard({ title, value, icon, color, link, subtitle }) {
  const colors = {
    blue: 'from-blue-600/10 to-blue-900/5 border-blue-700/30',
    green: 'from-green-600/10 to-green-900/5 border-green-700/30',
    yellow: 'from-yellow-600/10 to-yellow-900/5 border-yellow-700/30',
    red: 'from-red-600/10 to-red-900/5 border-red-700/30',
    purple: 'from-purple-600/10 to-purple-900/5 border-purple-700/30',
  };

  const textColors = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    yellow: 'text-yellow-400',
    red: 'text-red-400',
    purple: 'text-purple-400',
  };

  const Card = ({ children }) => {
    if (link) {
      return (
        <Link to={link} className={`block bg-gradient-to-br ${colors[color]} rounded-xl p-4 border hover:border-opacity-60 transition-all hover:scale-[1.02]`}>
          {children}
        </Link>
      );
    }
    return (
      <div className={`bg-gradient-to-br ${colors[color]} rounded-xl p-4 border`}>
        {children}
      </div>
    );
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg">{icon}</span>
        {link && <span className="text-xs text-gray-500">→</span>}
      </div>
      <p className={`text-2xl font-bold ${textColors[color]}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-1">{title}</p>
      {subtitle && <p className="text-[10px] text-gray-500">{subtitle}</p>}
    </Card>
  );
}

function StatusCard({ name, status, detail }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg">
      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
        status === 'online' ? 'bg-green-400 shadow-sm shadow-green-400/50' :
        status === 'error' ? 'bg-red-400 shadow-sm shadow-red-400/50' :
        'bg-gray-500'
      }`}></div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white">{name}</p>
        <p className="text-xs text-gray-500 truncate">{detail}</p>
      </div>
    </div>
  );
}
