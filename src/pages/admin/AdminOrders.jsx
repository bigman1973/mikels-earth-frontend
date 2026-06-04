import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { API_URL } from '../../config/api';
import AdminLayout from '../../components/admin/AdminLayout';

export default function AdminOrders() {
  const { authFetch } = useAdminAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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
    try {
      const res = await authFetch(`${API_URL}/api/admin/orders/${orderId}/create-in-holded`, {
        method: 'POST'
      });
      if (res && res.ok) {
        alert('Pedido creado en Holded correctamente');
        loadOrders();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  const createInvoice = async (orderId) => {
    try {
      const res = await authFetch(`${API_URL}/api/admin/orders/${orderId}/invoice`, {
        method: 'POST'
      });
      if (res && res.ok) {
        alert('Factura creada en Holded correctamente');
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Pedidos</h1>
            <p className="text-gray-400 text-sm mt-1">Gestión de pedidos web · Sincronización con Holded</p>
          </div>
          <button
            onClick={loadOrders}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
          >
            ↻ Refrescar
          </button>
        </div>

        {loading ? (
          <div className="text-gray-400">Cargando pedidos...</div>
        ) : orders.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center">
            <p className="text-gray-400">No hay pedidos registrados todavía.</p>
            <p className="text-gray-500 text-sm mt-2">Los pedidos aparecerán aquí cuando los clientes completen compras en la web.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">Pedido #{order.id}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        order.status === 'paid' ? 'bg-green-900/30 text-green-400' :
                        order.status === 'shipped' ? 'bg-blue-900/30 text-blue-400' :
                        order.status === 'delivered' ? 'bg-purple-900/30 text-purple-400' :
                        'bg-gray-700 text-gray-400'
                      }`}>
                        {order.status || 'pendiente'}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">
                      {order.customer_name || order.email} · {order.total ? `${order.total}€` : ''}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {order.created_at ? new Date(order.created_at).toLocaleString('es-ES') : ''}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => createInHolded(order.id)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors"
                    >
                      📤 Crear en Holded
                    </button>
                    <button
                      onClick={() => createInvoice(order.id)}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors"
                    >
                      🧾 Facturar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
