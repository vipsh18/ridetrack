import api from './api';
import type { AuthResponse } from '../types';

export const registerDriver = async (data: {
  name: string;
  email: string;
  password: string;
  vehicleNumber: string;
}): Promise<AuthResponse> => {
  const res = await api.post('/auth/register', data);
  return res.data;
};

export const loginDriver = async (data: {
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const res = await api.post('/auth/login', data);
  return res.data;
};