import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { type AuthUser, getStoredUser, logoutUser } from '../services/authService';

interface AuthContextValue {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSiteManager: boolean;
  isIndustryViewer: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(() => getStoredUser());

  const setUser = useCallback((u: AuthUser | null) => {
    setUserState(u);
  }, []);

  const logout = useCallback(() => {
    logoutUser();
    setUserState(null);
  }, []);

  const value: AuthContextValue = {
    user,
    setUser,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isSiteManager: user?.role === 'site_manager',
    isIndustryViewer: user?.role === 'industry_viewer',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
