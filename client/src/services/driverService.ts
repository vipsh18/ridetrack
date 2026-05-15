import api from './api';
import type { Driver } from '../types';

export const fetchAllDrivers = async (): Promise<Driver[]> => {
  const res = await api.get('/drivers');
  return res.data;
};

export const fetchMe = async (): Promise<Driver> => {
  const res = await api.get('/drivers/me');
  return res.data;
};

export const patchLocation = async (lat: number, lng: number): Promise<Driver> => {
  const res = await api.patch('/drivers/location', { lat, lng });
  return res.data;
};