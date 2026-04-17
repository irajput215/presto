import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface AppError {
  id: string;
  message: string;
}

interface ErrorContextType {
  errors: AppError[];
  showError: (message: string) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [errors, setErrors] = useState<AppError[]>([]);

  const showError = useCallback((message: string) => {
    const newId = uuidv4();
    // Show the latest error and remove it after a short delay.
    setErrors([{ id: newId, message }]);
    
    setTimeout(() => {
      setErrors((prev) => prev.filter((err) => err.id !== newId));
    }, 5000);
  }, []);

  const removeError = useCallback((id: string) => {
    setErrors((prev) => prev.filter((err) => err.id !== id));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return (
    <ErrorContext.Provider value={{ errors, showError, removeError, clearErrors }}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};
