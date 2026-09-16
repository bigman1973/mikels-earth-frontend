import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { API_URL } from '../../config/api';
import AdminLayout from '../../components/admin/AdminLayout';

export default function AdminUsers() {
  const { authFetch, user: currentUser } = useAdminAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

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
    setActionLoading(`role-${userId}`);
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
    } finally {
      setActionLoading(null);
    }
  };

  const toggleActive = async (userId) => {
    setActionLoading(`toggle-${userId}`);
    try {
      const res = await authFetch(`${API_URL}/api/auth/users/${userId}/toggle`, {
        method: 'PUT'
      });
      if (res && res.ok) {
        loadUsers();
      }
    } catch (err) {
      console.error('Error toggling user:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const roles = ['admin', 'sales', 'logistics', 'viewer'];
  const roleConfig = {
    admin: { label: 'Administrador', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    sales: { label: 'Ventas', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    logistics: { label: 'Logística', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    viewer: { label: 'Solo lectura', color: 'bg-white/5 text-gray-400 border-white/10' },
  };

  const activeUsers = users.filter(u => u.is_active).length;

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Usuarios</h1>
            <p className="text-gray-500 text-sm mt-1">
              Gestión de accesos · {activeUsers} activos de {users.length} registrados
            </p>
          </div>
          <button
            onClick={loadUsers}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 text-sm rounded-xl border border-white/10 transition-all disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </button>
        </div>

        {/* Info banner */}
        <div className="mb-6 bg-white/[0.02] rounded-xl border border-white/5 p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm text-gray-300">Los usuarios se crean automáticamente al iniciar sesión con Microsoft por primera vez.</p>
            <p className="text-xs text-gray-500 mt-1">Dominios permitidos: lfgd.es, farmsplanet.es, mikels.es, internetoperadores.com</p>
          </div>
        </div>

        {/* Permission check */}
        {currentUser?.role !== 'admin' ? (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5 flex items-center gap-3">
            <svg className="w-5 h-5 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-sm text-amber-300">Solo los administradores pueden gestionar roles y permisos de usuarios.</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 text-sm">Cargando usuarios...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((u) => {
              const role = roleConfig[u.role] || roleConfig.viewer;
              return (
                <div 
                  key={u.id} 
                  className={`bg-white/[0.02] rounded-xl border p-5 transition-all ${
                    u.is_active ? 'border-white/5 hover:border-white/10' : 'border-red-500/10 opacity-50'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* User info */}
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 border ${
                        u.is_active 
                          ? 'bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border-white/10' 
                          : 'bg-red-500/10 border-red-500/20'
                      }`}>
                        <span className={`text-sm font-bold ${u.is_active ? 'text-emerald-400' : 'text-red-400'}`}>
                          {u.name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-white font-medium">{u.name}</p>
                          {u.id === currentUser?.id && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Tú
                            </span>
                          )}
                          {!u.is_active && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20">
                              Inactivo
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{u.email}</p>
                        <p className="text-[11px] text-gray-600 mt-0.5">
                          Último acceso: {u.last_login ? new Date(u.last_login).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Nunca'}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 ml-15 md:ml-0">
                      {/* Role badge (visible on mobile) */}
                      <span className={`md:hidden text-[10px] font-semibold px-2.5 py-1 rounded-lg border ${role.color}`}>
                        {role.label}
                      </span>

                      {/* Role selector */}
                      <div className="relative">
                        <select
                          value={u.role}
                          onChange={(e) => updateRole(u.id, e.target.value)}
                          disabled={u.id === currentUser?.id || actionLoading === `role-${u.id}`}
                          className="appearance-none px-4 py-2 pr-8 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                        >
                          {roles.map(r => (
                            <option key={r} value={r} className="bg-[#1a1a1b] text-white">
                              {roleConfig[r]?.label || r}
                            </option>
                          ))}
                        </select>
                        <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>

                      {/* Toggle active */}
                      {u.id !== currentUser?.id && (
                        <button
                          onClick={() => toggleActive(u.id)}
                          disabled={actionLoading === `toggle-${u.id}`}
                          className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-xl border transition-all disabled:opacity-50 font-medium ${
                            u.is_active
                              ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                          }`}
                        >
                          {u.is_active ? (
                            <>
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                              </svg>
                              Desactivar
                            </>
                          ) : (
                            <>
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Activar
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Roles legend */}
        {currentUser?.role === 'admin' && !loading && (
          <div className="mt-8 bg-white/[0.02] rounded-xl border border-white/5 p-5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Roles disponibles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {roles.map(r => (
                <div key={r} className="flex items-center gap-3">
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border ${roleConfig[r].color}`}>
                    {roleConfig[r].label}
                  </span>
                  <span className="text-xs text-gray-500">
                    {r === 'admin' && 'Acceso completo a todas las funciones'}
                    {r === 'sales' && 'Pedidos, clientes y productos'}
                    {r === 'logistics' && 'Stock, pedidos y envíos'}
                    {r === 'viewer' && 'Solo visualización, sin acciones'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
