import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function AdminLogin() {
  const { user, login, loading } = useAdminAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error');

  useEffect(() => {
    if (user) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <img 
              src="/logo-mikels-earth.svg" 
              alt="Mikel's Earth" 
              className="w-24 h-24 object-contain animate-pulse"
            />
            <div className="absolute inset-0 -m-3">
              <div className="w-[120px] h-[120px] border-2 border-transparent border-t-green-500 border-r-green-500/30 rounded-full animate-spin"></div>
            </div>
          </div>
          <div className="text-center">
            <p className="text-white text-sm font-medium">Mikel's Earth</p>
            <p className="text-gray-500 text-xs mt-1 animate-pulse">Verificando sesión...</p>
          </div>
        </div>
      </div>
    );
  }

  const errorMessages = {
    'domain_not_allowed': 'Tu dominio de email no está autorizado para acceder al panel.',
    'user_disabled': 'Tu cuenta ha sido desactivada. Contacta con el administrador.',
    'token_exchange_failed': 'Error al autenticar con Microsoft. Inténtalo de nuevo.',
    'profile_fetch_failed': 'No se pudo obtener tu perfil de Microsoft.',
    'no_code': 'Error en el proceso de autenticación.',
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700">
          {/* Logo */}
          <div className="text-center mb-8">
            <img 
              src="/logo-mikels-earth.svg" 
              alt="Mikel's Earth" 
              className="w-20 h-20 mx-auto mb-4 object-contain"
            />
            <h1 className="text-xl font-bold text-white">Mikel's Earth</h1>
            <p className="text-gray-400 text-sm mt-1">Panel de Administración</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-3 bg-red-900/30 border border-red-700/50 rounded-lg">
              <p className="text-red-300 text-sm text-center">
                {errorMessages[error] || `Error: ${error}`}
              </p>
            </div>
          )}

          {/* Botón Microsoft - Estilo profesional */}
          <button
            onClick={login}
            className="w-full flex items-center justify-center gap-3 bg-[#2F2F2F] hover:bg-[#3C3C3C] active:bg-[#1A1A1A] text-white font-medium py-3.5 px-5 rounded-lg border border-[#4A4A4A] hover:border-[#6A6A6A] transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer select-none group"
          >
            <svg className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
              <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
              <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
              <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
            </svg>
            <span>Iniciar sesión con Microsoft</span>
          </button>

          {/* Separador */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <p className="text-xs text-gray-500 text-center">
              Acceso restringido a dominios corporativos
            </p>
            <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 mt-2">
              <span className="text-xs text-gray-400">@lfgd.es</span>
              <span className="text-xs text-gray-600">·</span>
              <span className="text-xs text-gray-400">@farmsplanet.es</span>
              <span className="text-xs text-gray-600">·</span>
              <span className="text-xs text-gray-400">@mikels.es</span>
              <span className="text-xs text-gray-600">·</span>
              <span className="text-xs text-gray-400">@internetoperadores.com</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-600 mt-4">
          Protegido por Microsoft Entra ID
        </p>
      </div>
    </div>
  );
}
