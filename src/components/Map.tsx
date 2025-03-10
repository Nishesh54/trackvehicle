import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLocationStore } from '../lib/store';

// Fix for default Leaflet marker icon issue in Next.js
// Normally would be handled by proper asset configuration
const defaultIcon = L.icon({
  iconUrl: '/marker-icon.png',
  iconRetinaUrl: '/marker-icon-2x.png',
  shadowUrl: '/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = defaultIcon;

// Custom icons for different vehicle types
const vehicleIcons = {
  'Ambulance': L.icon({
    iconUrl: '/ambulance-icon.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  }),
  'Fire Truck': L.icon({
    iconUrl: '/firetruck-icon.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  }),
  'Police Car': L.icon({
    iconUrl: '/police-icon.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  }),
  // Add driver icon variants with different colors or styles
  'Driver-Ambulance': L.icon({
    iconUrl: '/ambulance-icon.png', // Would use a custom driver icon in production
    iconSize: [40, 40], // Slightly larger to distinguish
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
    className: 'driver-vehicle-icon' // For custom styling
  }),
  'Driver-Fire Truck': L.icon({
    iconUrl: '/firetruck-icon.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
    className: 'driver-vehicle-icon'
  }),
  'Driver-Police Car': L.icon({
    iconUrl: '/police-icon.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
    className: 'driver-vehicle-icon'
  })
};

// Fallback to default if icon not available
const getVehicleIcon = (type: string, isDriverVehicle: boolean = false) => {
  if (isDriverVehicle) {
    return vehicleIcons[`Driver-${type}` as keyof typeof vehicleIcons] || 
           vehicleIcons[type as keyof typeof vehicleIcons] || 
           defaultIcon;
  }
  return vehicleIcons[type as keyof typeof vehicleIcons] || defaultIcon;
};

// Component to dynamically update map view when location changes
const ChangeView = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  
  return null;
};

const Map = () => {
  const { 
    userLocation, 
    nearbyVehicles, 
    isDriverMode, 
    driverVehicleId,
    clientsTracking 
  } = useLocationStore();
  
  // Default center to London if user location not available
  const center: [number, number] = userLocation 
    ? [userLocation.lat, userLocation.lng] 
    : [51.505, -0.09];
  
  // Get driver vehicle if in driver mode
  const driverVehicle = driverVehicleId 
    ? nearbyVehicles.find(v => v.id === driverVehicleId) 
    : null;
  
  // Create connection lines between driver and assigned clients
  const driverConnections = driverVehicle && isDriverMode && driverVehicle.status === 'responding'
    ? nearbyVehicles
        .filter(vehicle => vehicle.id !== driverVehicleId) // Filter out driver's own vehicle
        .map(vehicle => {
          // In a real app, we would check if this client is assigned to this driver
          return {
            positions: [
              [driverVehicle.location.lat, driverVehicle.location.lng],
              [vehicle.location.lat, vehicle.location.lng]
            ] as [[number, number], [number, number]],
            color: driverVehicle.status === 'responding' ? '#ef4444' : '#94a3b8'
          };
        })
    : [];
  
  return (
    <MapContainer center={center} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
      <ChangeView center={center} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* User location marker (rendered differently in client vs driver mode) */}
      {userLocation && (
        <Marker 
          position={[userLocation.lat, userLocation.lng]}
          icon={
            isDriverMode && driverVehicle 
              ? getVehicleIcon(driverVehicle.type, true) 
              : L.divIcon({
                  className: 'user-marker',
                  html: `<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>`,
                  iconSize: [20, 20],
                  iconAnchor: [10, 10]
                })
          }
        >
          <Popup>
            {isDriverMode 
              ? `Your Vehicle (${driverVehicle?.type || 'Driver'})` 
              : 'Your Location'
            }
          </Popup>
        </Marker>
      )}
      
      {/* Emergency vehicle markers - filtered to not show driver's own vehicle twice */}
      {nearbyVehicles
        .filter(vehicle => !(isDriverMode && vehicle.id === driverVehicleId))
        .map(vehicle => (
          <Marker 
            key={vehicle.id}
            position={[vehicle.location.lat, vehicle.location.lng]}
            icon={getVehicleIcon(vehicle.type, vehicle.isDriverVehicle)}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-bold">
                  {vehicle.type} ({vehicle.callSign}) 
                  {vehicle.isDriverVehicle && ' - Driver'}
                </p>
                <p className="text-xs mt-1">
                  Status: 
                  <span className={
                    vehicle.status === 'available' 
                      ? 'text-green-600' 
                      : vehicle.status === 'responding' 
                        ? 'text-yellow-600' 
                        : 'text-gray-600'
                  }>
                    {' '}{vehicle.status}
                  </span>
                </p>
                {vehicle.distance && <p className="text-xs mt-1">Distance: {vehicle.distance.toFixed(1)} km</p>}
                <p className="text-xs mt-1">ETA: {vehicle.estimatedArrivalTime} min</p>
              </div>
            </Popup>
          </Marker>
        ))
      }
      
      {/* Draw connection lines between driver and clients */}
      {driverConnections.map((connection, index) => (
        <Polyline 
          key={`connection-${index}`}
          positions={connection.positions}
          color={connection.color}
          weight={2}
          dashArray="5, 10"
        />
      ))}
    </MapContainer>
  );
};

export default Map; 