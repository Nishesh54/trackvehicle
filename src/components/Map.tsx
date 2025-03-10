import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
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
  })
};

// Fallback to default if icon not available
const getVehicleIcon = (type: string) => {
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
  const { userLocation, nearbyVehicles } = useLocationStore();
  
  // Default center to London if user location not available
  const center: [number, number] = userLocation 
    ? [userLocation.lat, userLocation.lng] 
    : [51.505, -0.09];
  
  return (
    <MapContainer center={center} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
      <ChangeView center={center} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* User location marker */}
      {userLocation && (
        <Marker 
          position={[userLocation.lat, userLocation.lng]}
          icon={L.divIcon({
            className: 'user-marker',
            html: `<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          })}
        >
          <Popup>
            Your Location
          </Popup>
        </Marker>
      )}
      
      {/* Emergency vehicle markers */}
      {nearbyVehicles.map(vehicle => (
        <Marker 
          key={vehicle.id}
          position={[vehicle.location.lat, vehicle.location.lng]}
          icon={getVehicleIcon(vehicle.type)}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-bold">{vehicle.type} ({vehicle.callSign})</p>
              <p className="text-xs mt-1">Status: <span className={vehicle.status === 'available' ? 'text-green-600' : 'text-yellow-600'}>{vehicle.status}</span></p>
              {vehicle.distance && <p className="text-xs mt-1">Distance: {vehicle.distance.toFixed(1)} km</p>}
              <p className="text-xs mt-1">ETA: {vehicle.estimatedArrivalTime} min</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map; 