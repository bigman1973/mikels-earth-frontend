import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { API_URL } from '../config/api';

const AdminAuthContext = createContext(null);

// Capturar token de la URL inmediatamente (antes del primer render)
function getInitialToken() {
  const params = new URLSearchParams(window.location.search);
  const urlToken = params.get('token');
  if (urlToken) {
    localStorage.setItem('admin_token', urlToken);
    // Limpiar URL inmediatamente
    window.history.replaceState({}, '', window.location.pathname);
    return urlToken;
  }
  return localStorage.getItem('admin_token');
}

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getInitialToken);
  const [loading, setLoading] = useState(!!getInitialToken()); // Solo loading si hay token que verificar
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (token && !fetchedRef.current) {
      fetchedRef.current = true;
      fetchUser();
    } else if (!token) {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        localStorage.removeItem('admin_token');
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error('Error fetching admin user:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    window.location.href = `${API_URL}/api/auth/microsoft/login`;
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setUser(null);
    fetchedRef.current = false;
  };

  const authFetch = async (url, options = {}) => {
    if (!token) return null;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    };
    try {
      const res = await fetch(url, { ...options, headers });
      if (res.status === 401) {
        logout();
        return null;
      }
      return res;
    } catch (err) {
      console.error('authFetch error:', err);
      return null;
    }
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
