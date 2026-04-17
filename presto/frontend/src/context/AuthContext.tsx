import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface AuthContextType {
  token: string | null;
  userName: string | null;
  login: (token: string, profile?: { name?: string; email?: string }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Keep auth state after page refresh.
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [userName, setUserName] = useState<string | null>(() => localStorage.getItem('userName'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const login = (newToken: string, profile?: { name?: string; email?: string }) => {
    // Save names by email so login can greet returning users.
    const savedNames = JSON.parse(localStorage.getItem('userNamesByEmail') || '{}') as Record<string, string>;
    const savedName = profile?.email ? savedNames[profile.email] : undefined;
    const fallbackName = profile?.email ? profile.email.split('@')[0] : null;
    const nextUserName = profile?.name || savedName || fallbackName;

    setToken(newToken);
    setUserName(nextUserName);

    if (profile?.email && profile?.name) {
      localStorage.setItem('userNamesByEmail', JSON.stringify({
        ...savedNames,
        [profile.email]: profile.name,
      }));
    }
  };

  const logout = () => {
    setToken(null);
    setUserName(null);
  };

  useEffect(() => {
    if (userName) {
      localStorage.setItem('userName', userName);
    } else {
      localStorage.removeItem('userName');
    }
  }, [userName]);

  return (
    <AuthContext.Provider value={{ token, userName, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
