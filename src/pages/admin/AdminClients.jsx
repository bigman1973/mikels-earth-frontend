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

  const filteredClients = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Clientes</h1>
            <p className="text-gray-400 text-sm mt-1">Contactos de Holded · {clients.length} clientes</p>
          </div>
          <button
            onClick={loadClients}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
          >
            ↻ Refrescar
          </button>
        </div>

        {/* Buscador */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-96 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500"
          />
        </div>

        {loading ? (
          <div className="text-gray-400">Cargando clientes de Holded...</div>
        ) : (
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-3 text-gray-400 font-medium">Nombre</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Email</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Teléfono</th>
                    <th className="text-right p-3 text-gray-400 font-medium">Facturado</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client, i) => (
                    <tr key={i} className="border-b border-gray-700/50 hover:bg-gray-750/50">
                      <td className="p-3 text-white">{client.name}</td>
                      <td className="p-3 text-gray-400">{client.email || '—'}</td>
                      <td className="p-3 text-gray-400">{client.phone || client.mobile || '—'}</td>
                      <td className="p-3 text-right text-green-400 font-mono">
                        {client.total_invoiced ? `${client.total_invoiced.toFixed(2)}€` : '0€'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
