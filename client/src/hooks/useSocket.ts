import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { LocationUpdate } from '../types';

export const useSocket = (token: string | null) => {
  const socketRef = useRef<Socket | null>(null);
  const [driverLocations, setDriverLocations] = useState<Map<string, LocationUpdate>>(new Map());
  const [offlineDrivers, setOfflineDrivers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!token) return;

    socketRef.current = io(import.meta.env.VITE_API_URL, {
      auth: { token }
    });

    socketRef.current.on('driver:update', (data: LocationUpdate) => {
      setDriverLocations((prev) => {
        const next = new Map(prev);
        next.set(data.driverId, data);
        return next;
      });
      setOfflineDrivers((prev) => {
        const next = new Set(prev);
        next.delete(data.driverId);
        return next;
      });
    });

    socketRef.current.on('driver:offline', ({ driverId }: { driverId: string }) => {
      setOfflineDrivers((prev) => new Set(prev).add(driverId));
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [token]);

  return { driverLocations, offlineDrivers, socket: socketRef.current };
};