import React, { useState, FormEvent } from 'react';
import { useAuthStore } from '../lib/store';
import { USER_TYPES } from '../lib/supabase';
import Button from './Button';

const RegisterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState(USER_TYPES.CLIENT);
  const { register, isLoading, error, setError } = useAuthStore();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!name || !email || !password) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    try {
      await register(name, email, password, userType);
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Registration error:', err);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Create an Account</h2>
      
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 text-sm font-medium mb-1">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>
        
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
        
        <div className="mb-4">
          <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-medium mb-1">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-medium mb-1">
            Register As
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
          
          {userType === USER_TYPES.DRIVER && (
            <div className="mt-2 p-3 bg-blue-50 rounded-md text-sm text-blue-700">
              <p className="flex items-center">
                <span className="mr-2">🚑</span>
                You're registering as an emergency vehicle driver
              </p>
              <p className="mt-1 text-xs">
                After registration, you'll be able to set your vehicle type and respond to emergency requests.
              </p>
            </div>
          )}
        </div>
        
        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
          variant={userType === USER_TYPES.DRIVER ? "emergency" : "primary"}
        >
          Register {userType === USER_TYPES.DRIVER ? "as Driver" : "as Client"}
        </Button>
      </form>
      
      <div className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <a href="/login" className="text-primary-600 hover:text-primary-500">
          Log in
        </a>
      </div>
    </div>
  );
};

export default RegisterForm; 