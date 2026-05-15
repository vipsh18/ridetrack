import { io } from 'socket.io-client';

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMDU4MGRjMzY5ZmFjOTRhZmMwNjM2MiIsImlhdCI6MTc3ODc0NzM4MiwiZXhwIjoxNzc5MzUyMTgyfQ.-qLNVLwCHNjGfYc66j1JRhOaFIUyJMSa2n6ywhHaoQQ';

const socket = io('http://localhost:3000', {
  auth: { token: TOKEN }
});

let lat = 28.6139;
let lng = 77.209;

socket.on('connect', () => {
  console.log('Simulator connected:', socket.id);

  setInterval(() => {
    lat += (Math.random() - 0.5) * 0.01;
    lng += (Math.random() - 0.5) * 0.01;

    socket.emit('driver:location', { lat, lng });
    console.log(`Emitted location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
  }, 2000);
});

socket.on('connect_error', (err: any) => {
  console.error('Connection error:', err.message);
});