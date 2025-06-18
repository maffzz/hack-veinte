import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: { email: string; passwd: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(authService.getToken());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);

  const login = async (credentials: { email: string; passwd: string }) => {
    const response = await authService.login(credentials);
    if (response.result?.token) {
      setToken(response.result.token);
      setIsAuthenticated(true);
    }
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 