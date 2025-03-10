import { create } from 'zustand';
import { User, Vehicle, mockVehicles } from './supabase';

interface LocationState {
  userLocation: { lat: number; lng: number } | null;
  vehicles: Vehicle[];
  nearbyVehicles: Vehicle[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUserLocation: (location: { lat: number; lng: number } | null) => void;
  setVehicles: (vehicles: Vehicle[]) => void;
  updateNearbyVehicles: () => void;
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  userLocation: null,
  vehicles: [],
  nearbyVehicles: [],
  isLoading: false,
  error: null,

  setUserLocation: (location) => {
    set({ userLocation: location });
    get().updateNearbyVehicles();
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
}));

// Initialize with mock data
setTimeout(() => {
  useLocationStore.getState().setVehicles(mockVehicles);
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
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
  
  setError: (error) => set({ error }),
})); 