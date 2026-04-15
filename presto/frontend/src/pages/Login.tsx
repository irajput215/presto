import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useError } from '../context/ErrorContext';
import { apiCall } from '../api/api';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showError, clearErrors } = useError();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await apiCall('/admin/auth/login', 'POST', { email, password });
      clearErrors();
      login(data.token);
      navigate('/dashboard');
    } catch (err: any) {
      showError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#fafafa] text-gray-900 w-full px-4">
      <form onSubmit={handleLogin} className="w-full max-w-xs p-8 bg-white border border-gray-100 rounded-lg shadow-sm flex flex-col gap-4">
        <h2 className="text-lg font-semibold tracking-tight text-center mb-2">Login to Presto</h2>
        <Input 
          label="Email" 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <Input 
          label="Password" 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <Button type="submit" className="w-full">Sign In</Button>
        <div className="flex flex-col gap-2 mt-2 text-center text-sm">
          <button type="button" onClick={() => navigate('/register')} className="text-blue-600 hover:underline">
            Don't have an account? Register
          </button>
          <button type="button" onClick={() => navigate('/')} className="text-gray-500 hover:underline">
            Back to Home
          </button>
        </div>
      </form>
    </div>
  );
};
