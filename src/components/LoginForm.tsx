import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../lib/store';
import { USER_TYPES } from '../lib/supabase';
import Button from './Button';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState(USER_TYPES.CLIENT);
  const { login, isLoading, error, setError } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      await login(email, password, userType);
      router.push('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
      
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-1">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-medium mb-1">
            Login As
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="userType"
                value={USER_TYPES.CLIENT}
                checked={userType === USER_TYPES.CLIENT}
                onChange={() => setUserType(USER_TYPES.CLIENT)}
                className="mr-2"
              />
              <span>Client</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="userType"
                value={USER_TYPES.DRIVER}
                checked={userType === USER_TYPES.DRIVER}
                onChange={() => setUserType(USER_TYPES.DRIVER)}
                className="mr-2"
              />
              <span>Driver</span>
            </label>
          </div>
        </div>
        
        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
        >
          Log In
        </Button>
      </form>
      
      <div className="mt-4 text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <a href="/register" className="text-primary-600 hover:text-primary-500">
          Sign up
        </a>
      </div>
    </div>
  );
};

export default LoginForm; 