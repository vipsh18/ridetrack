import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AuthResponse, Driver } from '../types';

interface AuthContextType {
  driver: Driver | null;
  token: string | null;
  login: (data: AuthResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [driver, setDriver] = useState<Driver | null>(() => {
    const stored = localStorage.getItem('driver');
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });

  const login = (data: AuthResponse) => {
    const { token, ...driverData } = data;
    localStorage.setItem('token', token);
    localStorage.setItem('driver', JSON.stringify(driverData));
    setToken(token);
    setDriver(driverData as Driver);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('driver');
    setToken(null);
    setDriver(null);
  };

  return (
    <AuthContext.Provider value={{ driver, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};