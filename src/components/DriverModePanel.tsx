import React, { useState } from 'react';
import { useLocationStore, VEHICLE_TYPES } from '../lib/store';

const DriverModePanel = () => {
  const { 
    isDriverMode, 
    toggleDriverMode, 
    driverVehicleType, 
    setDriverVehicleType,
    driverStatus,
    setDriverStatus,
    isTracking,
    startTracking,
    clientsTracking,
    respondToClient,
    userLocation
  } = useLocationStore();

  const [showingTypeSelector, setShowingTypeSelector] = useState(false);

  // Handle entering/exiting driver mode
  const handleToggleDriverMode = () => {
    toggleDriverMode(!isDriverMode);
    
    // If entering driver mode, start tracking if not already
    if (!isDriverMode && !isTracking) {
      startTracking();
    }
  };

  // Change vehicle type
  const handleVehicleTypeChange = (type: string) => {
    setDriverVehicleType(type);
    setShowingTypeSelector(false);
  };

  // Change status
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDriverStatus(e.target.value as 'available' | 'responding' | 'unavailable');
  };

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Driver Mode</h2>
        <label className="inline-flex items-center cursor-pointer">
          <span className="mr-3 text-sm font-medium text-gray-900">
            {isDriverMode ? 'On Duty' : 'Off Duty'}
          </span>
          <div className="relative">
            <input 
              type="checkbox" 
              checked={isDriverMode}
              onChange={handleToggleDriverMode}
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </div>
        </label>
      </div>

      {isDriverMode && (
        <div className="space-y-4">
          {/* Vehicle Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle Type
            </label>
            <div className="relative">
              <button
                type="button"
                className="flex items-center justify-between w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => setShowingTypeSelector(!showingTypeSelector)}
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-2">
                    {driverVehicleType === VEHICLE_TYPES.AMBULANCE && '🚑'}
                    {driverVehicleType === VEHICLE_TYPES.FIRE_TRUCK && '🚒'}
                    {driverVehicleType === VEHICLE_TYPES.POLICE_CAR && '🚓'}
                  </span>
                  {driverVehicleType}
                </div>
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {showingTypeSelector && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md">
                  <ul className="py-1">
                    <li 
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                      onClick={() => handleVehicleTypeChange(VEHICLE_TYPES.AMBULANCE)}
                    >
                      <span className="text-2xl mr-2">🚑</span>
                      {VEHICLE_TYPES.AMBULANCE}
                    </li>
                    <li 
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                      onClick={() => handleVehicleTypeChange(VEHICLE_TYPES.FIRE_TRUCK)}
                    >
                      <span className="text-2xl mr-2">🚒</span>
                      {VEHICLE_TYPES.FIRE_TRUCK}
                    </li>
                    <li 
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                      onClick={() => handleVehicleTypeChange(VEHICLE_TYPES.POLICE_CAR)}
                    >
                      <span className="text-2xl mr-2">🚓</span>
                      {VEHICLE_TYPES.POLICE_CAR}
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          {/* Status Selector */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              value={driverStatus}
              onChange={handleStatusChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="available">Available</option>
              <option value="responding">Responding</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
          
          {/* Current Location */}
          {userLocation && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">Your Current Location</h3>
              <div className="bg-gray-50 rounded p-2 text-sm font-mono">
                {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
              </div>
            </div>
          )}
          
          {/* Client Requests */}
          {clientsTracking.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">Client Requests</h3>
              <div className="max-h-40 overflow-y-auto">
                {clientsTracking.map(client => (
                  <div key={client.id} className="border border-gray-200 rounded-md p-2 mb-2 last:mb-0">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Client #{client.id.substring(0, 4)}</span>
                      <button
                        onClick={() => respondToClient(client.id)}
                        disabled={driverStatus === 'responding' || driverStatus === 'unavailable'}
                        className="text-xs px-2 py-1 rounded bg-emergency text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Respond
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {client.location.lat.toFixed(6)}, {client.location.lng.toFixed(6)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Info Panel */}
          <div className="flex items-center p-2 rounded-md bg-blue-50 text-blue-700 text-sm">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>
              {driverStatus === 'available'
                ? 'You are available for emergency calls'
                : driverStatus === 'responding'
                ? 'You are currently responding to an emergency'
                : 'You are marked as unavailable for calls'
              }
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverModePanel; 