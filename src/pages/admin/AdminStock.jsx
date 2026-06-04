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

  const statusColors = {
    agotado: 'bg-red-900/30 text-red-400 border-red-700/50',
    bajo: 'bg-yellow-900/30 text-yellow-400 border-yellow-700/50',
    normal: 'bg-blue-900/30 text-blue-400 border-blue-700/50',
    alto: 'bg-green-900/30 text-green-400 border-green-700/50',
  };

  const statusLabels = {
    agotado: 'Agotado',
    bajo: 'Bajo',
    normal: 'Normal',
    alto: 'Alto',
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Control de Stock</h1>
            <p className="text-gray-400 text-sm mt-1">
              Datos en tiempo real desde Holded
              {lastUpdated && ` · Actualizado: ${new Date(lastUpdated).toLocaleString('es-ES')}`}
            </p>
          </div>
          <button
            onClick={loadStock}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
          >
            ↻ Actualizar
          </button>
        </div>

        {/* Almacenes */}
        {warehouses.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {warehouses.map(w => (
              <span key={w.id} className="px-3 py-1 bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded-full">
                📍 {w.name}
              </span>
            ))}
          </div>
        )}

        {/* Resumen rápido */}
        {!loading && stockData.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <MiniCard label="Total productos" value={stockData.length} />
            <MiniCard label="Agotados" value={stockData.filter(s => s.status === 'agotado').length} color="red" />
            <MiniCard label="Stock bajo" value={stockData.filter(s => s.status === 'bajo').length} color="yellow" />
            <MiniCard label="OK" value={stockData.filter(s => s.status === 'normal' || s.status === 'alto').length} color="green" />
          </div>
        )}

        {/* Lista de stock */}
        {loading ? (
          <div className="text-gray-400">Consultando stock en Holded...</div>
        ) : (
          <div className="space-y-2">
            {stockData.sort((a, b) => a.stock - b.stock).map((item, i) => (
              <div key={i} className={`flex items-center justify-between p-4 rounded-xl border ${statusColors[item.status]}`}>
                <div>
                  <span className="text-white font-medium">{item.name}</span>
                  <span className="text-gray-400 text-xs ml-2">({item.sku})</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-lg font-bold">{item.stock}</span>
                  <span className={`px-2 py-0.5 text-xs rounded-full border ${statusColors[item.status]}`}>
                    {statusLabels[item.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function MiniCard({ label, value, color = 'gray' }) {
  const colors = {
    gray: 'text-white',
    red: 'text-red-400',
    yellow: 'text-yellow-400',
    green: 'text-green-400',
  };
  return (
    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`text-xl font-bold ${colors[color]}`}>{value}</p>
    </div>
  );
}
