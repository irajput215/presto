import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useError } from '../context/ErrorContext';
import { apiCall } from '../api/api';

export const MainLayout: React.FC = () => {
  const { token, logout } = useAuth();
  const { showError } = useError();
  const navigate = useNavigate();

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
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 w-full">
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-10 w-full">
        <h1 
          className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 cursor-pointer"
          onClick={() => navigate('/dashboard')}
        >
          Presto
        </h1>
        <Button variant="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </header>
      <main className="flex-1 w-full max-w-7xl mx-auto p-6 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};
