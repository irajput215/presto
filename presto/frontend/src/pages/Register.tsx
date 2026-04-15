import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useError } from '../context/ErrorContext';
import { apiCall } from '../api/api';

export const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showError, clearErrors } = useError();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showError("Passwords do not match");
      return;
    }
    
    try {
      const data = await apiCall('/admin/auth/register', 'POST', { email, password, name });
      clearErrors();
      login(data.token);
      navigate('/dashboard');
    } catch (err: any) {
      showError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#fafafa] text-gray-900 w-full px-4">
      <form onSubmit={handleRegister} className="w-full max-w-xs p-8 bg-white border border-gray-100 rounded-lg shadow-sm flex flex-col gap-4">
        <h2 className="text-lg font-semibold tracking-tight text-center mb-2">Create Account</h2>
        <Input 
          label="Name" 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        />
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
        <Input 
          label="Confirm Password" 
          type="password" 
          value={confirmPassword} 
          onChange={(e) => setConfirmPassword(e.target.value)} 
          required 
        />
        <Button type="submit" className="w-full mt-2">Sign Up</Button>
        <div className="flex flex-col gap-2 mt-2 text-center text-sm">
          <button type="button" onClick={() => navigate('/login')} className="text-blue-600 hover:underline">
            Already have an account? Login
          </button>
          <button type="button" onClick={() => navigate('/')} className="text-gray-500 hover:underline">
            Back to Home
          </button>
        </div>
      </form>
    </div>
  );
};
