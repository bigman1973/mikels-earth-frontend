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

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-8">
        {/* Logo con animación */}
        <div className="relative flex items-center justify-center">
          <img 
            src="/logo-mikels-earth.svg" 
            alt="Mikel's Earth" 
            className="w-44 h-44 object-contain animate-pulse"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
          {/* Anillo giratorio alrededor del logo */}
          <div className="absolute inset-0 -m-4 flex items-center justify-center">
            <div className="w-[220px] h-[220px] border-2 border-transparent border-t-green-500 border-r-green-500/30 rounded-full animate-spin"></div>
          </div>
        </div>
        {/* Texto */}
        <div className="text-center">
          <p className="text-gray-400 text-sm animate-pulse">Cargando panel de administración...</p>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  const { user, loading, logout } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:flex-col w-64 bg-gray-800 border-r border-gray-700">
        <div className="p-4 border-b border-gray-700 flex items-center gap-3">
          <img src="/logo-mikels-earth.svg" alt="Mikel's Earth" className="w-8 h-8 object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
          <div>
            <h1 className="text-sm font-bold text-white">Mikel's Earth</h1>
            <p className="text-[10px] text-gray-400">Panel de Administración</p>
          </div>
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
              <p className="text-xs text-gray-400 truncate capitalize">{user.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full text-left text-xs text-gray-400 hover:text-red-400 transition-colors py-1"
          >
            ← Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-gray-800 border-b border-gray-700 p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <img src="/logo-mikels-earth.svg" alt="" className="w-6 h-6 object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
            <h1 className="text-sm font-bold text-white">Admin</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">{user.name?.split(' ')[0]}</span>
            <button onClick={logout} className="text-xs text-red-400 hover:text-red-300">Salir</button>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
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
