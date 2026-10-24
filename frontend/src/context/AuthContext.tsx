import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser } from '../types';
import { authService, LoginResponse } from '../services/authService';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<LoginResponse>;
  register: (username: string, name: string, password: string, role?: string, organization?: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(authService.getCurrentUser());
  const [token, setToken] = useState<string | null>(authService.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = authService.getToken();
      if (storedToken) {
        try {
          const meData = await authService.getMe();
          setUser(meData.user);
          setToken(storedToken);
        } catch {
          // If token expired/invalid, clear session
          authService.logout();
          setUser(null);
          setToken(null);
        }
      } else {
        // Fallback default user for instant preview if no token
        setUser({
          id: 'USR-001',
          username: 'maya',
          name: 'Maya Lin',
          role: 'ROLE_GM',
          organization: 'Logic Legend Esports',
        });
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    const res = await authService.login(username, password);
    setUser(res.user);
    setToken(res.access_token);
    return res;
  };

  const register = async (username: string, name: string, password: string, role?: string, organization?: string) => {
    const res = await authService.register(username, name, password, role, organization);
    setUser(res.user);
    setToken(res.access_token);
    return res;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
  };

  const refreshUser = async () => {
    try {
      const meData = await authService.getMe();
      setUser(meData.user);
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
