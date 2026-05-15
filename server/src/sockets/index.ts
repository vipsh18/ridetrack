import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyToken } from '../utils/jwt';
import Driver from '../models/Driver';

export const initSocket = (httpServer: HttpServer): Server => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ['GET', 'POST']
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) throw new Error('No token');
      const decoded = verifyToken(token);
      const driver = await Driver.findById(decoded.id).select('-password');
      if (!driver) throw new Error('Driver not found');
      (socket as any).driver = driver;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const driver = (socket as any).driver;
    console.log(`Driver connected: ${driver.name} (${socket.id})`);

    socket.join(`driver:${driver._id}`);

    socket.on('driver:location', async (data: { lat: number; lng: number }) => {
      try {
        await Driver.findByIdAndUpdate(driver._id, {
          currentLocation: { lat: data.lat, lng: data.lng, updatedAt: new Date() },
          isActive: true
        });

        io.emit('driver:update', {
          driverId: driver._id,
          name: driver.name,
          vehicleNumber: driver.vehicleNumber,
          lat: data.lat,
          lng: data.lng,
          updatedAt: new Date()
        });
      } catch (error) {
        console.error('Location update error:', error);
      }
    });

    socket.on('disconnect', async () => {
      console.log(`Driver disconnected: ${driver.name}`);
      await Driver.findByIdAndUpdate(driver._id, { isActive: false });
      io.emit('driver:offline', { driverId: driver._id });
    });
  });

  return io;
};