import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useError } from '../context/ErrorContext';
import { apiCall } from '../api/api';

export const MainLayout: React.FC = () => {
  const { token, logout } = useAuth();
  const { showError } = useError();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Load preference on mount
    if (document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const handleLogout = async () => {
    try {
      if (token) {
        await apiCall('/admin/auth/logout', 'POST', {}, token);
      }
    } catch (err: any) {
      showError(err.message);
    } finally {
      logout();
      navigate('/');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 w-full transition-colors duration-200">
      <header className="bg-white dark:bg-gray-800 shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-10 w-full transition-colors duration-200">
        <h1 
          className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 cursor-pointer"
          onClick={() => navigate('/dashboard')}
        >
          Presto
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleDarkMode}
            className="p-2 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? '🌙' : '☀️'}
          </button>
          <Button variant="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>
      <main className="flex-1 w-full max-w-7xl mx-auto p-6 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};
