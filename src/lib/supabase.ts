import { createClient } from '@supabase/supabase-js';

// These would normally be environment variables
const supabaseUrl = 'https://your-project-url.supabase.co';
const supabaseKey = 'your-anon-key';

// Create a single supabase client for the entire app
export const supabase = createClient(supabaseUrl, supabaseKey);

// Types of users
export const USER_TYPES = {
  CLIENT: 'client',
  DRIVER: 'driver',
};

// Types
export interface Vehicle {
  id: string;
  type: string;
  callSign: string;
  location: {
    lat: number;
    lng: number;
  };
  status: 'available' | 'responding' | 'unavailable';
  estimatedArrivalTime: number; // in minutes
  distance?: number; // Optional distance from user
  isDriverVehicle?: boolean; // Flag for vehicles controlled by drivers
}

export interface DriverInfo {
  licenseNumber: string;
  vehicleType: string;
  vehicleCallSign: string;
  vehicleId?: string;
  yearsOfExperience: number;
  specialization?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  location: {
    lat: number;
    lng: number;
  } | null;
  userType: typeof USER_TYPES[keyof typeof USER_TYPES]; // Client or Driver
  isDriver?: boolean; // Flag to identify driver accounts (deprecated - use userType)
  phoneNumber?: string;
  driverInfo?: DriverInfo; // Only present for drivers
}

// Mock data for emergency vehicles
export const mockVehicles: Vehicle[] = [
  {
    id: '1',
    type: 'Ambulance',
    callSign: 'AMB-101',
    location: { lat: 51.505, lng: -0.09 },
    status: 'available',
    estimatedArrivalTime: 5, // minutes
  },
  {
    id: '2',
    type: 'Fire Truck',
    callSign: 'FT-202',
    location: { lat: 51.51, lng: -0.1 },
    status: 'responding',
    estimatedArrivalTime: 8,
  },
  {
    id: '3',
    type: 'Police Car',
    callSign: 'PC-303',
    location: { lat: 51.5, lng: -0.08 },
    status: 'available',
    estimatedArrivalTime: 3,
  },
  {
    id: '4',
    type: 'Ambulance',
    callSign: 'AMB-104',
    location: { lat: 51.498, lng: -0.095 },
    status: 'available',
    estimatedArrivalTime: 6,
  },
  {
    id: '5',
    type: 'Fire Truck',
    callSign: 'FT-205',
    location: { lat: 51.515, lng: -0.105 },
    status: 'responding',
    estimatedArrivalTime: 10,
  },
];

// Mock users for both client and driver types
export const mockUsers = {
  client: {
    id: '1',
    name: 'John Doe',
    email: 'client@example.com',
    location: null,
    userType: USER_TYPES.CLIENT,
    phoneNumber: '+1234567890'
  },
  driver: {
    id: '2',
    name: 'Jane Smith',
    email: 'driver@example.com',
    location: null,
    userType: USER_TYPES.DRIVER,
    phoneNumber: '+0987654321',
    driverInfo: {
      licenseNumber: 'DL-12345',
      vehicleType: 'Ambulance',
      vehicleCallSign: 'AMB-501',
      yearsOfExperience: 5,
      specialization: 'Medical Emergency'
    }
  }
};

// Mock authentication
export const mockAuth = {
  currentUser: null as User | null,

  // Login with user type selection
  login: (email: string, password: string, userType: string): Promise<User> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Choose the correct mock user based on user type
        const user = userType === USER_TYPES.DRIVER 
          ? mockUsers.driver 
          : mockUsers.client;
        
        mockAuth.currentUser = user;
        resolve(user);
      }, 500);
    });
  },

  register: (name: string, email: string, password: string, userType: string): Promise<User> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = {
          id: Math.random().toString(36).substring(2, 9),
          name,
          email,
          location: null,
          userType: userType === USER_TYPES.DRIVER ? USER_TYPES.DRIVER : USER_TYPES.CLIENT,
        };
        mockAuth.currentUser = user;
        resolve(user);
      }, 500);
    });
  },

  logout: (): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        mockAuth.currentUser = null;
        resolve();
      }, 500);
    });
  },
}; 