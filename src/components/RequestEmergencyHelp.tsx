import React, { useState } from 'react';
import { useLocationStore, REQUEST_TYPES } from '../lib/store';
import Button from './Button';

const RequestEmergencyHelp = () => {
  const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);
  const [emergencyType, setEmergencyType] = useState(REQUEST_TYPES.MEDICAL);
  const [description, setDescription] = useState('');
  const { userLocation, createEmergencyRequest, userActiveRequest, isLoading, error } = useLocationStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createEmergencyRequest(emergencyType, description);
    setIsRequestFormOpen(false);
    setDescription('');
  };

  const renderActiveRequest = () => {
    if (!userActiveRequest) return null;

    const getStatusBadge = () => {
      switch (userActiveRequest.status) {
        case 'pending':
          return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Searching for help</span>;
        case 'accepted':
          return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Help on the way</span>;
        case 'rejected':
          return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Request rejected</span>;
        case 'completed':
          return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Completed</span>;
        case 'cancelled':
          return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">Cancelled</span>;
        default:
          return null;
      }
    };

    const getEmergencyTypeIcon = () => {
      switch (userActiveRequest.type) {
        case REQUEST_TYPES.MEDICAL:
          return '🚑';
        case REQUEST_TYPES.FIRE:
          return '🚒';
        case REQUEST_TYPES.POLICE:
          return '🚓';
        default:
          return '🚨';
      }
    };

    return (
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">{getEmergencyTypeIcon()}</span>
              <h3 className="text-lg font-medium">{userActiveRequest.type}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-2">{userActiveRequest.description}</p>
            <div className="flex items-center mb-3">
              {getStatusBadge()}
              {userActiveRequest.estimatedArrivalTime && (
                <span className="ml-2 text-sm text-gray-600">
                  ETA: {userActiveRequest.estimatedArrivalTime} min
                </span>
              )}
            </div>
          </div>

          {userActiveRequest.status === 'pending' && (
            <Button 
              variant="outline" 
              onClick={() => useLocationStore.getState().cancelRequest(userActiveRequest.id)}
              className="text-sm"
            >
              Cancel
            </Button>
          )}
        </div>

        {userActiveRequest.status === 'accepted' && userActiveRequest.driverName && (
          <div className="border-t border-gray-100 pt-3 mt-2">
            <p className="text-sm font-medium">Your driver: {userActiveRequest.driverName}</p>
            <div className="mt-2 flex justify-end">
              <Button 
                variant="primary" 
                onClick={() => useLocationStore.getState().selectRequest(userActiveRequest.id)}
                className="text-sm"
              >
                Contact
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Don't show the request button if there's already an active request
  if (userActiveRequest) {
    return renderActiveRequest();
  }

  return (
    <div>
      {!isRequestFormOpen ? (
        <button
          onClick={() => setIsRequestFormOpen(true)}
          className="w-full bg-emergency hover:bg-emergency-dark text-white py-4 px-6 rounded-lg font-medium text-lg flex items-center justify-center shadow-md transition-colors"
          disabled={!userLocation}
        >
          <span className="mr-2 text-2xl">🚨</span>
          Request Emergency Help
        </button>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4">Request Emergency Help</h3>
          
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Emergency Type
              </label>
              <select
                value={emergencyType}
                onChange={(e) => setEmergencyType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                {Object.entries(REQUEST_TYPES).map(([key, value]) => (
                  <option key={key} value={value}>{value}</option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={3}
                placeholder="Please describe your emergency..."
                required
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsRequestFormOpen(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button
                variant="emergency"
                type="submit"
                isLoading={isLoading}
              >
                Request Help Now
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default RequestEmergencyHelp; 