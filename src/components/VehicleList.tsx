import React from 'react';
import { useLocationStore } from '../lib/store';
import { Vehicle } from '../lib/supabase';

interface VehicleCardProps {
  vehicle: Vehicle;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'responding':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getVehicleTypeIcon = (type: string) => {
    switch (type) {
      case 'Ambulance':
        return '🚑';
      case 'Fire Truck':
        return '🚒';
      case 'Police Car':
        return '🚓';
      default:
        return '🚗';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-2xl mr-2">{getVehicleTypeIcon(vehicle.type)}</span>
          <div>
            <h3 className="font-medium">{vehicle.type}</h3>
            <p className="text-xs text-gray-500">{vehicle.callSign}</p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
          {vehicle.status}
        </div>
      </div>
      
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-600">
        <div>
          <p className="text-xs text-gray-500">ETA</p>
          <p className="font-medium">{vehicle.estimatedArrivalTime} min</p>
        </div>
        {vehicle.distance !== undefined && (
          <div>
            <p className="text-xs text-gray-500">Distance</p>
            <p className="font-medium">{vehicle.distance.toFixed(2)} km</p>
          </div>
        )}
      </div>
    </div>
  );
};

const VehicleList = () => {
  const { nearbyVehicles, isLoading, error } = useLocationStore();

  if (isLoading) {
    return <div className="p-4 text-center text-gray-500">Loading vehicles...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (nearbyVehicles.length === 0) {
    return <div className="p-4 text-center text-gray-500">No vehicles found nearby.</div>;
  }

  return (
    <div className="overflow-y-auto max-h-[600px] p-2">
      <h2 className="text-lg font-semibold mb-3">Nearby Emergency Vehicles</h2>
      {nearbyVehicles.map((vehicle) => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} />
      ))}
    </div>
  );
};

export default VehicleList; 