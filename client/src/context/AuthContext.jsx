import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  const [authReady, setAuthReady] = useState(false);

  // Re-sync user from token on mount so refresh/navigation does not drop the session.
  useEffect(() => {
    const restore = async () => {
      const token = localStorage.getItem('token');
      const stored = localStorage.getItem('user');
      if (!token) {
        setAuthReady(true);
        return;
      }

      if (stored) {
        try { setUser(JSON.parse(stored)); } catch {}
      }

      try {
        const { data } = await api.get('/users/me');
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setAuthReady(true);
      }
    };

    restore();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (fields) => {
    const { data } = await api.post('/auth/register', fields);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const { data } = await api.get('/users/me');
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, authReady, login, register, logout, refreshUser, isTeacher: user?.role === 'teacher' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
