import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const DEMO_CREDENTIALS = {
  student: { email: 'student1@campusbite.local', password: 'pnXhNtsiH1bk', portal: 'student' },
  canteen: { email: 'owner1@campusbite.local', password: 'pnXhNtsiH1bk', portal: 'canteen' },
  admin: { email: 'admin@campusbite.local', password: 'AdminPassword123!', portal: 'admin' }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('cb_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      const storedToken = localStorage.getItem('cb_token');
      if (storedToken) {
        try {
          const userData = await api.getMe();
          setUser(userData);
        } catch (err) {
          console.warn('Session expired or invalid token:', err);
          localStorage.removeItem('cb_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    }
    initAuth();
  }, []);

  const login = async (credentials) => {
    const data = await api.login(credentials);
    localStorage.setItem('cb_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      if (token) await api.logout();
    } catch (e) {
      // Ignore error on logout
    }
    localStorage.removeItem('cb_token');
    setToken(null);
    setUser(null);
  };

  const switchDemoRole = async (role) => {
    const creds = DEMO_CREDENTIALS[role];
    if (!creds) return;
    return await login(creds);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, switchDemoRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
