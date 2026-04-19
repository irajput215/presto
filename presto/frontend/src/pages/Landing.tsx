import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#fafafa] text-gray-900 w-full px-4">
      <div className="max-w-sm w-full p-8 bg-white border border-gray-100 rounded-lg shadow-sm text-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">
          Presto 🪄
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          The lean, lightweight presentation app.
        </p>
        <div className="flex flex-col gap-3">
          <Button onClick={() => navigate('/login')} className="w-full">
            Login
          </Button>
          <Button onClick={() => navigate('/register')} variant="secondary" className="w-full">
            Create an account
          </Button>
        </div>
      </div>
    </div>
  );
};