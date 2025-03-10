import { create } from 'zustand';
import { User, Vehicle, mockVehicles } from './supabase';

// Vehicle types for driver mode
export const VEHICLE_TYPES = {
  AMBULANCE: 'Ambulance',
  FIRE_TRUCK: 'Fire Truck',
  POLICE_CAR: 'Police Car',
};

interface LocationState {
  userLocation: { lat: number; lng: number } | null;
  vehicles: Vehicle[];
  nearbyVehicles: Vehicle[];
  isLoading: boolean;
  error: string | null;
  isTracking: boolean;
  watchId: number | null;
  isDriverMode: boolean;
  driverVehicleType: string;
  driverVehicleId: string | null;
  driverStatus: 'available' | 'responding' | 'unavailable';
  clientsTracking: { id: string; location: { lat: number; lng: number } }[];
  
  // Actions
  setUserLocation: (location: { lat: number; lng: number } | null) => void;
  setVehicles: (vehicles: Vehicle[]) => void;
  updateNearbyVehicles: () => void;
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  startTracking: () => void;
  stopTracking: () => void;
  toggleDriverMode: (isDriver: boolean) => void;
  setDriverVehicleType: (type: string) => void;
  setDriverStatus: (status: 'available' | 'responding' | 'unavailable') => void;
  respondToClient: (clientId: string) => void;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  userLocation: null,
  vehicles: [],
  nearbyVehicles: [],
  isLoading: false,
  error: null,
  isTracking: false,
  watchId: null,
  isDriverMode: false,
  driverVehicleType: VEHICLE_TYPES.AMBULANCE,
  driverVehicleId: null,
  driverStatus: 'available',
  clientsTracking: [],

  setUserLocation: (location) => {
    set({ userLocation: location });
    get().updateNearbyVehicles();
    
    // If in driver mode, update vehicle location
    const { isDriverMode, driverVehicleId } = get();
    if (isDriverMode && driverVehicleId && location) {
      const vehicles = get().vehicles.map(vehicle => 
        vehicle.id === driverVehicleId 
          ? { ...vehicle, location } 
          : vehicle
      );
      set({ vehicles });
    }
  },
  
  setVehicles: (vehicles) => {
    set({ vehicles });
    get().updateNearbyVehicles();
  },
  
  updateNearbyVehicles: () => {
    const { userLocation, vehicles } = get();
    
    if (!userLocation) {
      set({ nearbyVehicles: vehicles });
      return;
    }
    
    // Calculate distance and sort by proximity
    const vehiclesWithDistance = vehicles.map(vehicle => {
      const distance = calculateDistance(
        userLocation.lat, 
        userLocation.lng, 
        vehicle.location.lat, 
        vehicle.location.lng
      );
      
      return {
        ...vehicle,
        distance,
      };
    });
    
    // Sort by distance
    const sorted = [...vehiclesWithDistance].sort((a, b) => 
      (a.distance || Infinity) - (b.distance || Infinity)
    );
    
    set({ nearbyVehicles: sorted });
  },
  
  setError: (error) => set({ error }),
  setLoading: (isLoading) => set({ isLoading }),

  startTracking: () => {
    const { watchId } = get();
    
    // If already tracking, don't start a new watch
    if (watchId !== null) return;
    
    set({ isLoading: true, error: null });
    
    if (!navigator.geolocation) {
      set({ 
        error: 'Geolocation is not supported by your browser',
        isLoading: false 
      });
      return;
    }
    
    try {
      // Start watching position
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location = { lat: latitude, lng: longitude };
          
          // Update user location and vehicle location if in driver mode
          get().setUserLocation(location);
          
          set({ 
            isLoading: false,
            isTracking: true,
            error: null
          });
        },
        (error) => {
          console.error('Error tracking location:', error);
          set({ 
            error: `Location tracking error: ${error.message}`,
            isLoading: false,
            isTracking: false 
          });
        },
        { 
          enableHighAccuracy: true, 
          maximumAge: 0,
          timeout: 5000
        }
      );
      
      set({ watchId: id });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to start location tracking',
        isLoading: false,
        isTracking: false
      });
    }
  },
  
  stopTracking: () => {
    const { watchId } = get();
    
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      set({ watchId: null, isTracking: false });
    }
  },
  
  toggleDriverMode: (isDriver) => {
    // If entering driver mode, create a new vehicle or use existing one
    if (isDriver) {
      const { userLocation, driverVehicleType, driverVehicleId, vehicles } = get();
      
      // If already has a vehicle, just update driver mode
      if (driverVehicleId) {
        set({ isDriverMode: true });
        return;
      }
      
      // Create a new vehicle for this driver
      if (userLocation) {
        const newVehicle: Vehicle = {
          id: `driver-${Date.now()}`,
          type: driverVehicleType,
          callSign: `${driverVehicleType.substring(0, 3)}-${Math.floor(Math.random() * 900) + 100}`,
          location: userLocation,
          status: 'available',
          estimatedArrivalTime: 0,
          isDriverVehicle: true,
        };
        
        set({ 
          vehicles: [...vehicles, newVehicle],
          driverVehicleId: newVehicle.id,
          isDriverMode: true
        });
        
        // Start tracking automatically when entering driver mode
        get().startTracking();
      } else {
        // If no location yet, get it first
        set({ 
          error: 'Please allow location access to enter driver mode',
          isDriverMode: false
        });
      }
    } else {
      // If exiting driver mode, remove vehicle
      const { vehicles, driverVehicleId } = get();
      
      if (driverVehicleId) {
        const updatedVehicles = vehicles.filter(v => v.id !== driverVehicleId);
        set({ 
          vehicles: updatedVehicles,
          isDriverMode: false,
          driverVehicleId: null
        });
      } else {
        set({ isDriverMode: false });
      }
    }
  },
  
  setDriverVehicleType: (type) => {
    set({ driverVehicleType: type });
    
    // Update existing driver vehicle if already created
    const { driverVehicleId, vehicles } = get();
    if (driverVehicleId) {
      const updatedVehicles = vehicles.map(vehicle => 
        vehicle.id === driverVehicleId
          ? { ...vehicle, type }
          : vehicle
      );
      set({ vehicles: updatedVehicles });
    }
  },
  
  setDriverStatus: (status) => {
    set({ driverStatus: status });
    
    // Update vehicle status
    const { driverVehicleId, vehicles } = get();
    if (driverVehicleId) {
      const updatedVehicles = vehicles.map(vehicle => 
        vehicle.id === driverVehicleId
          ? { ...vehicle, status }
          : vehicle
      );
      set({ vehicles: updatedVehicles });
    }
  },
  
  respondToClient: (clientId) => {
    const { driverVehicleId, vehicles } = get();
    
    // Set status to responding
    set({ driverStatus: 'responding' });
    
    // Update vehicle status
    if (driverVehicleId) {
      const updatedVehicles = vehicles.map(vehicle => 
        vehicle.id === driverVehicleId
          ? { ...vehicle, status: 'responding' as const }
          : vehicle
      );
      set({ vehicles: updatedVehicles });
      
      // Simulate journey to client
      // In a real app, this would use real routing and ETA calculation
      const simulateJourney = () => {
        // Find the client by ID in a real app
        // Here we just update the ETA
        const updatedDriverVehicle = updatedVehicles.find(v => v.id === driverVehicleId);
        if (updatedDriverVehicle) {
          const etaMinutes = Math.floor(Math.random() * 10) + 2; // 2-12 minutes
          const newVehicles = vehicles.map(vehicle => 
            vehicle.id === driverVehicleId
              ? { ...vehicle, estimatedArrivalTime: etaMinutes }
              : vehicle
          );
          set({ vehicles: newVehicles });
        }
      };
      
      simulateJourney();
    }
  }
}));

// Initialize with mock data
setTimeout(() => {
  useLocationStore.getState().setVehicles(mockVehicles);
  
  // Simulate vehicle movement at regular intervals
  setInterval(() => {
    const { vehicles, isDriverMode, driverVehicleId } = useLocationStore.getState();
    
    // Move vehicles slightly in random directions
    const updatedVehicles = vehicles.map(vehicle => {
      // Skip driver's vehicle - it's updated based on real GPS
      if (isDriverMode && vehicle.id === driverVehicleId) {
        return vehicle;
      }
      
      const latChange = (Math.random() - 0.5) * 0.002; // Small random change
      const lngChange = (Math.random() - 0.5) * 0.002;
      
      return {
        ...vehicle,
        location: {
          lat: vehicle.location.lat + latChange,
          lng: vehicle.location.lng + lngChange
        }
      };
    });
    
    useLocationStore.getState().setVehicles(updatedVehicles);
  }, 5000); // Update every 5 seconds
}, 100);

// Helper function to calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Auth store
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      // This would be a real Supabase auth call in production
      const user = await new Promise<User>((resolve) => {
        setTimeout(() => {
          resolve({
            id: '1',
            name: 'Test User',
            email,
            location: null,
          });
        }, 500);
      });
      
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to login', isLoading: false });
    }
  },
  
  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      // This would be a real Supabase auth call in production
      const user = await new Promise<User>((resolve) => {
        setTimeout(() => {
          resolve({
            id: '1',
            name,
            email,
            location: null,
          });
        }, 500);
      });
      
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to register', isLoading: false });
    }
  },
  
  logout: async () => {
    set({ isLoading: true });
    // This would be a real Supabase auth call in production
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 500);
    });
    // Stop location tracking when logging out
    useLocationStore.getState().stopTracking();
    // Exit driver mode if active
    if (useLocationStore.getState().isDriverMode) {
      useLocationStore.getState().toggleDriverMode(false);
    }
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
  
  setError: (error) => set({ error }),
})) 