import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLocationStore, REQUEST_STATUS, REQUEST_TYPES } from '../lib/store';

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

// Emergency request icons based on type
const requestIcons = {
  [REQUEST_TYPES.MEDICAL]: L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color:#ef4444;padding:10px;border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;color:white;box-shadow:0 2px 5px rgba(0,0,0,0.2);">🚑</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  })
};

// Status-based markers with pulsing effect for pending requests
const getRequestIcon = (type: string, status: string) => {
  const icon = requestIcons[type] || requestIcons[REQUEST_TYPES.OTHER];
  
  // Add a pulsing class for pending requests
  if (status === REQUEST_STATUS.PENDING) {
    // Add a pulsing effect by modifying the icon
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div class="pulsing-request" style="background-color:${type === REQUEST_TYPES.MEDICAL ? '#ef4444' : '#6b7280'};padding:10px;border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;color:white;box-shadow:0 2px 5px rgba(0,0,0,0.2);">${type === REQUEST_TYPES.MEDICAL ? '🚑' : '🚨'}</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  }
  
  return icon;
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
    clientsTracking,
    activeRequests,
    selectRequest
  } = useLocationStore();
  
  // Default center to London if user location not available
  const center: [number, number] = userLocation 
    ? [userLocation.lat, userLocation.lng] 
    : [51.505, -0.09];
  
  // Get driver vehicle if in driver mode
  const driverVehicle = driverVehicleId 
    ? nearbyVehicles.find(v => v.id === driverVehicleId) 
    : null;
  
  // Filter requests to show based on driver/client mode
  // Clients see only their own request, drivers see all pending and their accepted
  const visibleRequests = activeRequests.filter(req => {
    if (isDriverMode) {
      // Drivers see pending requests and their accepted ones
      return req.status === REQUEST_STATUS.PENDING || 
             (req.status === REQUEST_STATUS.ACCEPTED && req.driverId === driverVehicleId);
    } else {
      // Clients see only their own requests
      return req.userId === '1'; // In a real app, would check against authenticated user ID
    }
  });
  
  // Create connection lines between driver and assigned requests
  const requestConnections = [];
  
  if (isDriverMode && driverVehicle) {
    // Find all requests assigned to this driver that are accepted
    const assignedRequests = activeRequests.filter(
      req => req.status === REQUEST_STATUS.ACCEPTED && req.driverId === driverVehicleId
    );
    
    // Create connections
    assignedRequests.forEach(request => {
      requestConnections.push({
        positions: [
          [driverVehicle.location.lat, driverVehicle.location.lng],
          [request.location.lat, request.location.lng]
        ] as [[number, number], [number, number]],
        color: '#ef4444', // Red for emergency
        dashArray: '5, 10',
        weight: 3
      });
    });
  } else if (!isDriverMode && userLocation) {
    // For clients, show connections to the assigned vehicle
    const userActiveRequest = activeRequests.find(
      req => req.userId === '1' && req.status === REQUEST_STATUS.ACCEPTED
    );
    
    if (userActiveRequest && userActiveRequest.driverId) {
      // Find the driver vehicle
      const driverVeh = nearbyVehicles.find(v => v.id === userActiveRequest.driverId);
      
      if (driverVeh) {
        requestConnections.push({
          positions: [
            [userLocation.lat, userLocation.lng],
            [driverVeh.location.lat, driverVeh.location.lng]
          ] as [[number, number], [number, number]],
          color: '#ef4444', // Red for emergency
          dashArray: '5, 10',
          weight: 3
        });
      }
    }
  }
  
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
      
      {/* Emergency Request Markers */}
      {visibleRequests.map(request => (
        <Marker 
          key={request.id}
          position={[request.location.lat, request.location.lng]}
          icon={getRequestIcon(request.type, request.status)}
          eventHandlers={{
            click: () => {
              // Make request details viewable on click
              selectRequest(request.id);
            }
          }}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-bold">{request.type}</p>
              <p className="text-xs">{request.userName}</p>
              <p className="text-xs mt-1">
                Status: 
                <span className={
                  request.status === REQUEST_STATUS.PENDING 
                    ? 'text-yellow-600' 
                    : request.status === REQUEST_STATUS.ACCEPTED
                      ? 'text-green-600' 
                      : 'text-gray-600'
                }>
                  {' '}{request.status}
                </span>
              </p>
              <p className="text-xs mt-1 line-clamp-1">{request.description}</p>
              {request.estimatedArrivalTime && (
                <p className="text-xs mt-1">ETA: {request.estimatedArrivalTime} min</p>
              )}
              <button 
                className="mt-2 text-xs px-2 py-1 bg-primary-600 text-white rounded"
                onClick={() => selectRequest(request.id)}
              >
                {isDriverMode 
                  ? (request.status === REQUEST_STATUS.PENDING ? 'Respond' : 'View Details') 
                  : 'View Details'
                }
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
      
      {/* Draw connection lines between drivers and requests */}
      {requestConnections.map((connection, index) => (
        <Polyline 
          key={`connection-${index}`}
          positions={connection.positions}
          color={connection.color}
          weight={connection.weight || 2}
          dashArray={connection.dashArray}
        />
      ))}
    </MapContainer>
  );
};

export default Map; 