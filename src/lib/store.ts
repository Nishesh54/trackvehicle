import { create } from 'zustand';
import { User, Vehicle, mockVehicles } from './supabase';

// Vehicle types for driver mode
export const VEHICLE_TYPES = {
  AMBULANCE: 'Ambulance',
  FIRE_TRUCK: 'Fire Truck',
  POLICE_CAR: 'Police Car',
};

// Emergency request types
export const REQUEST_TYPES = {
  MEDICAL: 'Medical Emergency',
  FIRE: 'Fire Emergency',
  POLICE: 'Police Emergency',
  OTHER: 'Other Emergency',
};

// Request status types
export const REQUEST_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Interface for emergency requests
export interface EmergencyRequest {
  id: string;
  userId: string;
  userName: string;
  location: { lat: number; lng: number };
  status: typeof REQUEST_STATUS[keyof typeof REQUEST_STATUS];
  type: typeof REQUEST_TYPES[keyof typeof REQUEST_TYPES];
  description: string;
  createdAt: number;
  driverId?: string;
  driverName?: string;
  estimatedArrivalTime?: number;
  messages: Message[];
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number;
  isDriver: boolean;
}

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
  
  // Emergency Request related
  activeRequests: EmergencyRequest[];
  userActiveRequest: EmergencyRequest | null;
  selectedRequest: EmergencyRequest | null;
  newMessage: string;
  
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

  // Emergency Request actions
  createEmergencyRequest: (type: typeof REQUEST_TYPES[keyof typeof REQUEST_TYPES], description: string) => void;
  acceptRequest: (requestId: string) => void;
  rejectRequest: (requestId: string) => void;
  completeRequest: (requestId: string) => void;
  cancelRequest: (requestId: string) => void;
  sendMessage: (requestId: string, content: string) => void;
  setNewMessage: (message: string) => void;
  selectRequest: (requestId: string | null) => void;
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
  
  // Emergency Request related
  activeRequests: [],
  userActiveRequest: null,
  selectedRequest: null,
  newMessage: '',

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
  },

  // Emergency Request actions
  createEmergencyRequest: (type, description) => {
    const { userLocation, userActiveRequest } = get();
    
    // Can't create a new request if there's an active one or no location
    if (userActiveRequest || !userLocation) {
      set({ 
        error: userActiveRequest ? 'You already have an active request' : 'Location not available'
      });
      return;
    }
    
    // Create a new request
    const newRequest: EmergencyRequest = {
      id: `request-${Date.now()}`,
      userId: '1', // In a real app, this would come from auth
      userName: 'Current User', // In a real app, this would come from auth
      location: userLocation,
      status: REQUEST_STATUS.PENDING,
      type,
      description,
      createdAt: Date.now(),
      messages: []
    };
    
    // Add to active requests and set as user's active request
    set(state => ({ 
      activeRequests: [...state.activeRequests, newRequest],
      userActiveRequest: newRequest,
      // Auto-start tracking when creating a request
      isTracking: true 
    }));
    
    // Make sure tracking is on
    get().startTracking();
  },
  
  acceptRequest: (requestId) => {
    const { activeRequests, driverVehicleId, userLocation } = get();
    
    // Must be in driver mode and have location to accept requests
    if (!driverVehicleId || !userLocation) {
      set({ error: 'You must be in driver mode to accept requests' });
      return;
    }
    
    // Find the request
    const request = activeRequests.find(r => r.id === requestId);
    if (!request || request.status !== REQUEST_STATUS.PENDING) {
      set({ error: 'Request not available for acceptance' });
      return;
    }
    
    // Update the request status
    const updatedRequests = activeRequests.map(r => 
      r.id === requestId
        ? { 
            ...r, 
            status: REQUEST_STATUS.ACCEPTED, 
            driverId: driverVehicleId,
            driverName: 'Emergency Driver', // In a real app, use actual driver name
            estimatedArrivalTime: Math.floor(Math.random() * 10) + 2 // 2-12 minutes
          }
        : r
    );
    
    // Update status and respond to the client
    set({ activeRequests: updatedRequests });
    get().setDriverStatus('responding');
    get().respondToClient(request.userId);
    
    // Add a system message about acceptance
    const systemMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: 'system',
      senderName: 'System',
      content: 'Your request has been accepted. Help is on the way!',
      timestamp: Date.now(),
      isDriver: false
    };
    
    // Add the message to the request
    const updatedRequestsWithMessage = updatedRequests.map(r => 
      r.id === requestId
        ? { ...r, messages: [...r.messages, systemMessage] }
        : r
    );
    
    set({ activeRequests: updatedRequestsWithMessage });
  },
  
  rejectRequest: (requestId) => {
    const { activeRequests } = get();
    
    // Find the request
    const request = activeRequests.find(r => r.id === requestId);
    if (!request || request.status !== REQUEST_STATUS.PENDING) {
      set({ error: 'Request not available for rejection' });
      return;
    }
    
    // Update the request status
    const updatedRequests = activeRequests.map(r => 
      r.id === requestId
        ? { ...r, status: REQUEST_STATUS.REJECTED }
        : r
    );
    
    set({ activeRequests: updatedRequests });
    
    // Add a system message about rejection
    const systemMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: 'system',
      senderName: 'System',
      content: 'Your request could not be accepted by this driver. Looking for another driver...',
      timestamp: Date.now(),
      isDriver: false
    };
    
    // Add the message to the request
    const updatedRequestsWithMessage = updatedRequests.map(r => 
      r.id === requestId
        ? { ...r, messages: [...r.messages, systemMessage] }
        : r
    );
    
    set({ activeRequests: updatedRequestsWithMessage });
  },
  
  completeRequest: (requestId) => {
    const { activeRequests, userActiveRequest } = get();
    
    // Find the request
    const request = activeRequests.find(r => r.id === requestId);
    if (!request || request.status !== REQUEST_STATUS.ACCEPTED) {
      set({ error: 'Request cannot be completed' });
      return;
    }
    
    // Update the request status
    const updatedRequests = activeRequests.map(r => 
      r.id === requestId
        ? { ...r, status: REQUEST_STATUS.COMPLETED }
        : r
    );
    
    // Clear user's active request if it was theirs
    const newUserActiveRequest = 
      userActiveRequest && userActiveRequest.id === requestId
        ? null
        : userActiveRequest;
    
    set({ 
      activeRequests: updatedRequests,
      userActiveRequest: newUserActiveRequest
    });
    
    // If driver, update status back to available
    if (get().isDriverMode) {
      get().setDriverStatus('available');
    }
    
    // Add a system message about completion
    const systemMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: 'system',
      senderName: 'System',
      content: 'The emergency service has been completed.',
      timestamp: Date.now(),
      isDriver: false
    };
    
    // Add the message to the request
    const updatedRequestsWithMessage = updatedRequests.map(r => 
      r.id === requestId
        ? { ...r, messages: [...r.messages, systemMessage] }
        : r
    );
    
    set({ 
      activeRequests: updatedRequestsWithMessage,
      selectedRequest: null  // Clear selected request on completion
    });
  },
  
  cancelRequest: (requestId) => {
    const { activeRequests, userActiveRequest } = get();
    
    // Find the request
    const request = activeRequests.find(r => r.id === requestId);
    if (!request || (request.status !== REQUEST_STATUS.PENDING && request.status !== REQUEST_STATUS.ACCEPTED)) {
      set({ error: 'Request cannot be cancelled' });
      return;
    }
    
    // Update the request status
    const updatedRequests = activeRequests.map(r => 
      r.id === requestId
        ? { ...r, status: REQUEST_STATUS.CANCELLED }
        : r
    );
    
    // Clear user's active request if it was theirs
    const newUserActiveRequest = 
      userActiveRequest && userActiveRequest.id === requestId
        ? null
        : userActiveRequest;
    
    set({ 
      activeRequests: updatedRequests,
      userActiveRequest: newUserActiveRequest
    });
    
    // If driver and this was their accepted request, update status back to available
    if (get().isDriverMode && request.driverId === get().driverVehicleId) {
      get().setDriverStatus('available');
    }
    
    // Add a system message about cancellation
    const systemMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: 'system',
      senderName: 'System',
      content: 'The request has been cancelled.',
      timestamp: Date.now(),
      isDriver: false
    };
    
    // Add the message to the request
    const updatedRequestsWithMessage = updatedRequests.map(r => 
      r.id === requestId
        ? { ...r, messages: [...r.messages, systemMessage] }
        : r
    );
    
    set({ 
      activeRequests: updatedRequestsWithMessage,
      selectedRequest: null  // Clear selected request on cancellation
    });
  },
  
  sendMessage: (requestId, content) => {
    if (!content.trim()) return;
    
    const { activeRequests, isDriverMode } = get();
    
    // Find the request
    const request = activeRequests.find(r => r.id === requestId);
    if (!request) {
      set({ error: 'Request not found' });
      return;
    }
    
    // Create a new message
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: isDriverMode ? request.driverId || 'driver' : request.userId,
      senderName: isDriverMode ? 'Driver' : request.userName,
      content,
      timestamp: Date.now(),
      isDriver: isDriverMode
    };
    
    // Add the message to the request
    const updatedRequests = activeRequests.map(r => 
      r.id === requestId
        ? { ...r, messages: [...r.messages, newMessage] }
        : r
    );
    
    set({ 
      activeRequests: updatedRequests,
      newMessage: '' // Clear the message input
    });
  },
  
  setNewMessage: (message) => {
    set({ newMessage: message });
  },
  
  selectRequest: (requestId) => {
    const { activeRequests } = get();
    
    if (!requestId) {
      set({ selectedRequest: null });
      return;
    }
    
    const request = activeRequests.find(r => r.id === requestId);
    set({ selectedRequest: request || null });
  }
}));

// Add some mock emergency requests
setTimeout(() => {
  const mockRequests: EmergencyRequest[] = [
    {
      id: 'request-1',
      userId: 'user-1',
      userName: 'John Doe',
      location: { lat: 51.503, lng: -0.087 },
      status: REQUEST_STATUS.PENDING,
      type: REQUEST_TYPES.MEDICAL,
      description: 'Person with chest pain needs immediate assistance',
      createdAt: Date.now() - 300000, // 5 minutes ago
      messages: [
        {
          id: 'msg-1',
          senderId: 'user-1',
          senderName: 'John Doe',
          content: 'Please hurry, the pain is getting worse',
          timestamp: Date.now() - 280000,
          isDriver: false
        }
      ]
    },
    {
      id: 'request-2',
      userId: 'user-2',
      userName: 'Jane Smith',
      location: { lat: 51.508, lng: -0.095 },
      status: REQUEST_STATUS.PENDING,
      type: REQUEST_TYPES.FIRE,
      description: 'Small kitchen fire in apartment building',
      createdAt: Date.now() - 180000, // 3 minutes ago
      messages: []
    }
  ];
  
  useLocationStore.getState().setVehicles(mockVehicles);
  
  // Add mock emergency requests
  const currentState = useLocationStore.getState();
  useLocationStore.setState({
    ...currentState,
    activeRequests: mockRequests
  });
  
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