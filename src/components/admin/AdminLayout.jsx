import { Link, useLocation, Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

const NAV_ITEMS = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/admin/productos', label: 'Productos', icon: '🫒' },
  { path: '/admin/stock', label: 'Stock', icon: '📦' },
  { path: '/admin/pedidos', label: 'Pedidos', icon: '🛒' },
  { path: '/admin/clientes', label: 'Clientes', icon: '👥' },
  { path: '/admin/usuarios', label: 'Usuarios', icon: '⚙️' },
];

export default function AdminLayout({ children }) {
  const { user, loading, logout } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:flex-col w-64 bg-gray-800 border-r border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-lg font-bold text-white">Mikel's Earth</h1>
          <p className="text-xs text-gray-400 mt-1">Panel de Administración</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                location.pathname === item.path
                  ? 'bg-green-600/20 text-green-400 font-medium'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-sm font-bold">
              {user.name?.charAt(0) || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full text-left text-xs text-gray-400 hover:text-red-400 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-gray-800 border-b border-gray-700 p-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-sm font-bold text-white">Mikel's Admin</h1>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{user.name?.split(' ')[0]}</span>
            <button onClick={logout} className="text-xs text-red-400">Salir</button>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto pb-1">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
                location.pathname === item.path
                  ? 'bg-green-600/20 text-green-400 font-medium'
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
