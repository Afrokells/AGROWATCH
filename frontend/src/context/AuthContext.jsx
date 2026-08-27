import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('agrowatch_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  const login = async (phone, password) => {
    const { user, token } = await authAPI.login(phone, password);
    const sessionUser = { ...user, token };
    setUser(sessionUser);
    localStorage.setItem('agrowatch_user', JSON.stringify(sessionUser));
    return sessionUser;
  };

  const register = async (data) => {
    const { user, token } = await authAPI.register(data);
    const sessionUser = { ...user, token };
    setUser(sessionUser);
    localStorage.setItem('agrowatch_user', JSON.stringify(sessionUser));
    return sessionUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('agrowatch_user');
  };

  const updateUser = (updatedFields) => {
    const updatedUser = { ...user, ...updatedFields };
    setUser(updatedUser);
    localStorage.setItem('agrowatch_user', JSON.stringify(updatedUser));
  };

  const isAdmin  = user?.user_role === 'admin' || user?.is_staff || user?.is_superuser;
  const isFarmer = !isAdmin && user?.user_role === 'farmer';
  const isBuyer  = !isAdmin && user?.user_role === 'buyer';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, isFarmer, isBuyer, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
