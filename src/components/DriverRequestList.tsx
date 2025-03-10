import React from 'react';
import { useLocationStore, REQUEST_TYPES, REQUEST_STATUS } from '../lib/store';
import Button from './Button';

const DriverRequestList = () => {
  const { activeRequests, driverStatus, userLocation, selectedRequest, selectRequest } = useLocationStore();
  
  // Filter requests that are pending and not selected
  const pendingRequests = activeRequests.filter(
    req => req.status === REQUEST_STATUS.PENDING
  );
  
  // Get the driver's assigned request if any
  const assignedRequests = activeRequests.filter(
    req => req.status === REQUEST_STATUS.ACCEPTED && req.driverId === useLocationStore.getState().driverVehicleId
  );

  const calculateDistanceFromDriver = (lat: number, lng: number) => {
    if (!userLocation) return 'Unknown';
    
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat - userLocation.lat);
    const dLon = deg2rad(lng - userLocation.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(userLocation.lat)) * Math.cos(deg2rad(lat)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    
    return distance.toFixed(1) + ' km';
  };
  
  function deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  const getEmergencyTypeIcon = (type: string) => {
    switch (type) {
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

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  if (selectedRequest) {
    return null; // Don't show the list when a request is selected for detailed view
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium">Emergency Requests</h2>
        <p className="text-sm text-gray-500">
          {driverStatus === 'available' 
            ? 'Requests waiting for assistance'
            : driverStatus === 'responding'
              ? 'You are currently responding'
              : 'You are currently unavailable'
          }
        </p>
      </div>
      
      <div className="divide-y">
        {/* Assigned Requests */}
        {assignedRequests.length > 0 && (
          <div className="p-4 bg-green-50">
            <h3 className="font-medium text-green-800 mb-2">Current Assignment</h3>
            {assignedRequests.map(request => (
              <div key={request.id} className="bg-white rounded-lg shadow-sm p-3 mb-2 last:mb-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <span className="text-2xl mr-2">{getEmergencyTypeIcon(request.type)}</span>
                    <div>
                      <p className="font-medium">{request.userName}</p>
                      <p className="text-xs text-gray-500">{request.type}</p>
                      <div className="flex mt-1 items-center">
                        <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">Responding</span>
                        <span className="text-xs ml-2">
                          {calculateDistanceFromDriver(request.location.lat, request.location.lng)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="primary" 
                    onClick={() => selectRequest(request.id)}
                    className="text-xs px-2 py-1"
                  >
                    View
                  </Button>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  <p className="line-clamp-2">{request.description}</p>
                  <p className="mt-1 text-right">{formatTime(request.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Pending Requests - only show if driver is available */}
        {driverStatus === 'available' && (
          <div className="max-h-[400px] overflow-y-auto">
            {pendingRequests.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No pending requests at the moment
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {pendingRequests.map(request => (
                  <div key={request.id} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <span className="text-2xl mr-2">{getEmergencyTypeIcon(request.type)}</span>
                        <div>
                          <p className="font-medium">{request.userName}</p>
                          <p className="text-xs text-gray-500">{request.type}</p>
                          <div className="flex mt-1 items-center">
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">Waiting</span>
                            <span className="text-xs ml-2">
                              {calculateDistanceFromDriver(request.location.lat, request.location.lng)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button 
                          variant="outline" 
                          onClick={() => selectRequest(request.id)}
                          className="text-xs px-2 py-1"
                        >
                          Details
                        </Button>
                        <Button 
                          variant="primary" 
                          onClick={() => useLocationStore.getState().acceptRequest(request.id)}
                          className="text-xs px-2 py-1"
                        >
                          Accept
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-600">
                      <p className="line-clamp-2">{request.description}</p>
                      <p className="mt-1 text-right">{formatTime(request.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* If driver is unavailable or responding to someone else */}
        {driverStatus !== 'available' && assignedRequests.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            You are currently {driverStatus}. 
            {driverStatus === 'responding' && ' Complete your current assignment to accept new requests.'}
            {driverStatus === 'unavailable' && ' Change your status to "Available" to see pending requests.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverRequestList; 