import { createClient } from '@supabase/supabase-js';

// These would normally be environment variables
const supabaseUrl = 'https://your-project-url.supabase.co';
const supabaseKey = 'your-anon-key';

// Create a single supabase client for the entire app
export const supabase = createClient(supabaseUrl, supabaseKey);

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
}

export interface User {
  id: string;
  name: string;
  email: string;
  location: {
    lat: number;
    lng: number;
  } | null;
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

// Mock authentication
export const mockAuth = {
  currentUser: null as User | null,
  login: (email: string, password: string): Promise<User> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = {
          id: '1',
          name: 'Test User',
          email,
          location: null,
        };
        mockAuth.currentUser = user;
        resolve(user);
      }, 500);
    });
  },
  register: (name: string, email: string, password: string): Promise<User> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = {
          id: '1',
          name,
          email,
          location: null,
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