'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useLocationStore } from '../../lib/store';
import { USER_TYPES } from '../../lib/supabase';
import Header from '../../components/Header';
import MapComponent from '../../components/MapComponent';
import VehicleList from '../../components/VehicleList';
import DriverModePanel from '../../components/DriverModePanel';
import RequestEmergencyHelp from '../../components/RequestEmergencyHelp';
import DriverRequestList from '../../components/DriverRequestList';
import MessageCenter from '../../components/MessageCenter';

export default function DashboardPage() {
  const { isAuthenticated, user } = useAuthStore();
  const { isTracking, userLocation, isDriverMode, selectedRequest, startTracking } = useLocationStore();
  const router = useRouter();
  
  // On mount, check if user is authenticated and request location
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    // Request GPS location on page load
    if (navigator.geolocation) {
      startTracking();
    }
  }, [isAuthenticated, router, startTracking]);

  // Determine if the user is a driver
  const isDriver = user?.userType === USER_TYPES.DRIVER;

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          {isDriver 
            ? 'Emergency Driver Dashboard' 
            : 'Emergency Assistance Dashboard'}
        </h1>
        
        {/* Location sharing notice for non-drivers and not when showing message center */}
        {user && !isDriver && !selectedRequest && (
          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-medium">Welcome, {user.name}</p>
                <p className="text-gray-500">
                  {isTracking 
                    ? "Your location is being shared in real-time with emergency services" 
                    : "Enable real-time tracking to share your location with emergency services"}
                </p>
              </div>
              
              {userLocation && (
                <div className="text-sm text-gray-600">
                  <div>Current coordinates:</div>
                  <div className="font-mono">
                    {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                  </div>
                  <div className={`text-xs mt-1 ${isTracking ? 'text-green-600' : 'text-gray-500'}`}>
                    {isTracking 
                      ? "Real-time updates active" 
                      : "Single location update"
                    }
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Map */}
          <div className="lg:col-span-2">
            {/* Map Component */}
            <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
              <div className="p-4 border-b">
                <h2 className="text-lg font-medium">Location Map</h2>
                <p className="text-sm text-gray-500">
                  {isDriver 
                    ? "View client requests and your position" 
                    : "View nearby emergency vehicles"
                  }
                </p>
              </div>
              <MapComponent />
            </div>
            
            {/* Chat/Messaging or Request Help */}
            {selectedRequest ? (
              <MessageCenter />
            ) : (
              !isDriver && <RequestEmergencyHelp />
            )}
            
            {/* Driver Mode Panel - only show for drivers */}
            {!selectedRequest && isDriver && (
              <div className="mt-6 hidden lg:block">
                <DriverModePanel />
              </div>
            )}
          </div>
          
          {/* Right Column - Vehicles List or Driver Requests */}
          <div className="lg:col-span-1">
            {/* Driver Mode Panel for Mobile View - only show for drivers */}
            {!selectedRequest && isDriver && (
              <div className="mb-6 lg:hidden">
                <DriverModePanel />
              </div>
            )}
            
            {/* Driver Request List or Vehicle List */}
            {isDriver ? (
              !selectedRequest && <DriverRequestList />
            ) : (
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-medium">Nearby Vehicles</h2>
                    <p className="text-sm text-gray-500">Sorted by distance</p>
                  </div>
                  {isTracking && (
                    <div className="flex items-center text-xs text-green-600">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse"></div>
                      Live updates
                    </div>
                  )}
                </div>
                <VehicleList />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 