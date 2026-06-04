import { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '../config/api';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('admin_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Capturar token de la URL si viene del callback de Microsoft
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      localStorage.setItem('admin_token', urlToken);
      setToken(urlToken);
      // Limpiar la URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        // Token inválido o expirado
        logout();
      }
    } catch (err) {
      console.error('Error fetching admin user:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    // Redirigir al endpoint de login de Microsoft
    window.location.href = `${API_URL}/api/auth/microsoft/login`;
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setUser(null);
  };

  const authFetch = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    };
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      logout();
      return null;
    }
    return res;
  };

  return (
    <AdminAuthContext.Provider value={{ user, token, loading, login, logout, authFetch }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}
