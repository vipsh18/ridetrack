export interface Driver {
  _id: string;
  name: string;
  email: string;
  vehicleNumber: string;
  isActive: boolean;
  currentLocation: {
    lat: number;
    lng: number;
    updatedAt: string;
  };
  createdAt: string;
}

export interface Trip {
  _id: string;
  driver: Driver;
  passengerName: string;
  pickup: { address: string; lat: number; lng: number };
  dropoff: { address: string; lat: number; lng: number };
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  vehicleNumber: string;
  token: string;
}

export interface LocationUpdate {
  driverId: string;
  name: string;
  vehicleNumber: string;
  lat: number;
  lng: number;
  updatedAt: string;
}