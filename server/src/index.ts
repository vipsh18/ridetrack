import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import cors from 'cors';
import connectDB from './config/db';
import authRoutes from './routes/auth';
import driverRoutes from './routes/driver';
import tripRoutes from './routes/trip';
import { apiLimiter } from './middleware/rateLimiter';
import { initSocket } from './sockets';

const app = express();
const httpServer = http.createServer(app);

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.use('/api', apiLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    initSocket(httpServer);
  });
});

export { httpServer };