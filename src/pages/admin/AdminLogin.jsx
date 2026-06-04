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
        <div className="text-white">Cargando...</div>
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
      <div className="w-full max-w-md">
        <div className="bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-700">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Mikel's Earth</h1>
            <p className="text-gray-400 text-sm">Panel de Administración</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-3 bg-red-900/30 border border-red-700 rounded-lg">
              <p className="text-red-300 text-sm">
                {errorMessages[error] || `Error: ${error}`}
              </p>
            </div>
          )}

          {/* Login Button */}
          <button
            onClick={login}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
              <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
              <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
              <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
            </svg>
            Iniciar sesión con Microsoft
          </button>

          {/* Info */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Acceso restringido a dominios corporativos:
            </p>
            <p className="text-xs text-gray-400 mt-1">
              @lfgd.es · @farmsplanet.es · @mikels.es · @internetoperadores.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
