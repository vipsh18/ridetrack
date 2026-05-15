import api from './api'
import type { Trip } from '../types'

export const fetchAllTrips = async (): Promise<Trip[]> => {
  const res = await api.get('/trips')
  return res.data
}

export const createTrip = async (data: {
  passengerName: string
  pickup: { address: string; lat: number; lng: number }
  dropoff: { address: string; lat: number; lng: number }
}): Promise<Trip> => {
  const res = await api.post('/trips', data)
  return res.data
}

export const updateTripStatus = async (
  id: string,
  status: Trip['status']
): Promise<Trip> => {
  const res = await api.patch(`/trips/${id}/status`, { status })
  return res.data
}