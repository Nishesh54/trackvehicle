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
  const { userLocation, nearbyVehicles, setUserLocation } = useLocationStore();
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    // Get user's location on component mount if not already set
    if (!userLocation) {
      locateUser();
    }
  }, [userLocation]);

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

  return (
    <div className="h-[500px] w-full bg-gray-100 rounded-lg overflow-hidden relative">
      {isLocating && (
        <div className="absolute top-2 right-2 bg-white py-1 px-3 rounded-full z-10 shadow-md text-sm">
          Locating you...
        </div>
      )}
      <button
        onClick={locateUser}
        className="absolute bottom-4 right-4 bg-white p-2 rounded-full z-10 shadow-md hover:bg-gray-100"
        title="Get my location"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
      <MapWithNoSSR />
    </div>
  );
};

export default MapComponent; 