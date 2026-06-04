import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { API_URL } from '../../config/api';
import AdminLayout from '../../components/admin/AdminLayout';

export default function AdminUsers() {
  const { authFetch, user: currentUser } = useAdminAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/api/auth/users`);
      if (res && res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (userId, newRole) => {
    try {
      const res = await authFetch(`${API_URL}/api/auth/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole })
      });
      if (res && res.ok) {
        loadUsers();
      }
    } catch (err) {
      console.error('Error updating role:', err);
    }
  };

  const toggleActive = async (userId) => {
    try {
      const res = await authFetch(`${API_URL}/api/auth/users/${userId}/toggle`, {
        method: 'PUT'
      });
      if (res && res.ok) {
        loadUsers();
      }
    } catch (err) {
      console.error('Error toggling user:', err);
    }
  };

  const roles = ['admin', 'sales', 'logistics', 'viewer'];
  const roleLabels = {
    admin: 'Administrador',
    sales: 'Ventas',
    logistics: 'Logística',
    viewer: 'Solo lectura'
  };
  const roleColors = {
    admin: 'bg-purple-900/30 text-purple-400',
    sales: 'bg-blue-900/30 text-blue-400',
    logistics: 'bg-yellow-900/30 text-yellow-400',
    viewer: 'bg-gray-700 text-gray-400'
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Gestión de Usuarios</h1>
          <p className="text-gray-400 text-sm mt-1">
            Los usuarios se crean automáticamente al iniciar sesión con Microsoft por primera vez.
          </p>
        </div>

        {currentUser?.role !== 'admin' ? (
          <div className="bg-yellow-900/20 border border-yellow-700 rounded-xl p-4">
            <p className="text-yellow-300 text-sm">Solo los administradores pueden gestionar usuarios.</p>
          </div>
        ) : loading ? (
          <div className="text-gray-400">Cargando usuarios...</div>
        ) : (
          <div className="space-y-3">
            {users.map((u) => (
              <div key={u.id} className={`bg-gray-800 rounded-xl p-4 border ${u.is_active ? 'border-gray-700' : 'border-red-800/50 opacity-60'}`}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
                      {u.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {u.name}
                        {u.id === currentUser?.id && <span className="text-xs text-green-400 ml-2">(tú)</span>}
                      </p>
                      <p className="text-gray-400 text-sm">{u.email}</p>
                      <p className="text-gray-500 text-xs">
                        Último acceso: {u.last_login ? new Date(u.last_login).toLocaleString('es-ES') : 'Nunca'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={u.role}
                      onChange={(e) => updateRole(u.id, e.target.value)}
                      disabled={u.id === currentUser?.id}
                      className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-green-500"
                    >
                      {roles.map(r => (
                        <option key={r} value={r}>{roleLabels[r]}</option>
                      ))}
                    </select>

                    {u.id !== currentUser?.id && (
                      <button
                        onClick={() => toggleActive(u.id)}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                          u.is_active
                            ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                            : 'bg-green-900/30 text-green-400 hover:bg-green-900/50'
                        }`}
                      >
                        {u.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                    )}
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
