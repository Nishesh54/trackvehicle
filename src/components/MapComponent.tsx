import React, { useEffect, useState } from 'react';
import { useLocationStore } from '../lib/store';
import dynamic from 'next/dynamic';

// Dynamically import Leaflet component with no SSR
// This is necessary because Leaflet requires window object
const MapWithNoSSR = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full w-full bg-gray-100 rounded-lg">
      <p className="text-gray-500">Loading map...</p>
    </div>
  ),
});

const MapComponent = () => {
  const { 
    userLocation, 
    nearbyVehicles, 
    setUserLocation, 
    isTracking, 
    startTracking, 
    stopTracking, 
    error 
  } = useLocationStore();
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    // Get user's location on component mount if not already set
    if (!userLocation && !isTracking) {
      locateUser();
    }
  }, [userLocation, isTracking]);

  const locateUser = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setIsLocating(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLocating(false);
          // Set default location if user denies permission
          setUserLocation({ lat: 51.505, lng: -0.09 }); // Default to London
        }
      );
    } else {
      setIsLocating(false);
      console.error('Geolocation is not supported by this browser.');
      // Set default location
      setUserLocation({ lat: 51.505, lng: -0.09 }); // Default to London
    }
  };

  const toggleTracking = () => {
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  };

  return (
    <div className="h-[500px] w-full bg-gray-100 rounded-lg overflow-hidden relative">
      {isLocating && (
        <div className="absolute top-2 right-2 bg-white py-1 px-3 rounded-full z-10 shadow-md text-sm">
          Locating you...
        </div>
      )}
      
      {isTracking && (
        <div className="absolute top-2 left-2 bg-green-100 text-green-800 py-1 px-3 rounded-full z-10 shadow-md text-sm flex items-center">
          <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
          Live tracking
        </div>
      )}
      
      {error && (
        <div className="absolute top-2 left-2 right-2 bg-red-100 text-red-800 py-1 px-3 rounded-md z-10 shadow-md text-sm">
          {error}
        </div>
      )}
      
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
        <button
          onClick={locateUser}
          className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
          title="Get my location"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        
        <button
          onClick={toggleTracking}
          className={`p-2 rounded-full shadow-md ${
            isTracking 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-primary-600 hover:bg-primary-700 text-white'
          }`}
          title={isTracking ? "Stop real-time tracking" : "Start real-time tracking"}
        >
          {isTracking ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          )}
        </button>
      </div>
      
      <MapWithNoSSR />
      
      <div className="absolute bottom-4 left-4 bg-white p-2 rounded-lg shadow-md z-10">
        <div className="text-xs font-semibold mb-1">Vehicles nearby: {nearbyVehicles.length}</div>
        {userLocation && nearbyVehicles.length > 0 && (
          <div className="text-xs">
            Closest: {nearbyVehicles[0].type} ({Math.round((nearbyVehicles[0].distance || 0) * 10) / 10} km)
          </div>
        )}
      </div>
    </div>
  );
};

export default MapComponent; 