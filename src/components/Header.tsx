import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '../lib/store';
import { USER_TYPES } from '../lib/supabase';
import Button from './Button';

const Header = () => {
  const { isAuthenticated, logout, user } = useAuthStore();
  const isDriver = user?.userType === USER_TYPES.DRIVER;

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              EmergencyTrack
            </Link>
          </div>
          <nav className="flex space-x-4">
            <Link href="/" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
              Home
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Dashboard
                </Link>
                <div className="flex items-center">
                  {isDriver && (
                    <span className="mr-2 flex items-center text-emergency text-xs px-2 py-1 bg-emergency-light/30 rounded-full">
                      <span className="mr-1">🚑</span> Driver
                    </span>
                  )}
                  <Button 
                    variant={isDriver ? "emergency" : "outline"} 
                    onClick={() => logout()}
                    className="text-sm"
                  >
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Login
                </Link>
                <Link href="/register" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header; 