import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { API_URL } from '../../config/api';
import AdminLayout from '../../components/admin/AdminLayout';

export default function AdminDashboard() {
  const { authFetch, user } = useAdminAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await authFetch(`${API_URL}/api/admin/dashboard`);
      if (res && res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">
            Bienvenido, {user?.name?.split(' ')[0]}. Último acceso: {user?.last_login ? new Date(user.last_login).toLocaleString('es-ES') : 'Primera vez'}
          </p>
        </div>

        {loading ? (
          <div className="text-gray-400">Cargando datos...</div>
        ) : data ? (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <KPICard title="Pedidos" value={data.total_orders} color="blue" />
              <KPICard title="Productos (Holded)" value={data.total_products_holded} color="green" />
              <KPICard title="Reseñas" value={data.total_reviews} color="yellow" />
              <KPICard title="Alertas Stock" value={data.low_stock_alerts?.length || 0} color="red" />
            </div>

            {/* Alertas de Stock Bajo */}
            {data.low_stock_alerts && data.low_stock_alerts.length > 0 && (
              <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 mb-6">
                <h2 className="text-lg font-semibold text-white mb-4">⚠️ Alertas de Stock Bajo</h2>
                <div className="space-y-2">
                  {data.low_stock_alerts.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 px-3 bg-red-900/20 rounded-lg border border-red-800/30">
                      <div>
                        <span className="text-white text-sm">{item.name}</span>
                        <span className="text-gray-400 text-xs ml-2">({item.sku})</span>
                      </div>
                      <span className={`text-sm font-mono ${item.stock <= 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                        {item.stock} uds
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Info */}
            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
              <h2 className="text-lg font-semibold text-white mb-3">Integración Holded</h2>
              <p className="text-gray-400 text-sm">
                Datos actualizados: {new Date(data.last_updated).toLocaleString('es-ES')}
              </p>
              <div className="mt-3 flex gap-2">
                <span className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded-full">API Conectada</span>
                <span className="px-2 py-1 bg-blue-900/30 text-blue-400 text-xs rounded-full">Sincronización Manual</span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-red-400">Error cargando datos del dashboard</div>
        )}
      </div>
    </AdminLayout>
  );
}

function KPICard({ title, value, color }) {
  const colors = {
    blue: 'bg-blue-900/30 border-blue-700/50 text-blue-400',
    green: 'bg-green-900/30 border-green-700/50 text-green-400',
    yellow: 'bg-yellow-900/30 border-yellow-700/50 text-yellow-400',
    red: 'bg-red-900/30 border-red-700/50 text-red-400',
  };

  return (
    <div className={`rounded-xl p-4 border ${colors[color]}`}>
      <p className="text-xs text-gray-400 mb-1">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
