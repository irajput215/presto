// External react hooks
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

/** Global authentication state management */
interface AuthContextType {
  token: string | null;
  userName: string | null;
  login: (token: string, profile?: { name?: string; email?: string }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication provider that syncs token and user profiles 
 * to localStorage for persistence across page refreshes.
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Sync state with localStorage on mount
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [userName, setUserName] = useState<string | null>(() => localStorage.getItem('userName'));

  /** Persist token changes to browser storage */
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  /** 
   * Orchestrates login: saves token and tries to resolve user display name
   * from email or previous session records.
   */
  const login = (newToken: string, profile?: { name?: string; email?: string }) => {
    const savedNames = JSON.parse(localStorage.getItem('userNamesByEmail') || '{}') as Record<string, string>;
    const savedName = profile?.email ? savedNames[profile.email] : undefined;
    const fallbackName = profile?.email ? profile.email.split('@')[0] : null;
    const nextUserName = profile?.name || savedName || fallbackName;

    setToken(newToken);
    setUserName(nextUserName);

    // Cache Name-Email mapping to restore name even if backend doesn't return it next time
    if (profile?.email && profile?.name) {
      localStorage.setItem('userNamesByEmail', JSON.stringify({
        ...savedNames,
        [profile.email]: profile.name,
      }));
    }
  };

  /** Wipes session data from memory and storage */
  const logout = () => {
    setToken(null);
    setUserName(null);
  };

  /** Persist userName changes to browser storage */
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

// Hook for easy access to auth state
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};