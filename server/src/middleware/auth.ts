import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import Driver from '../models/Driver';

export interface AuthRequest extends Request {
  driver?: any;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    const driver = await Driver.findById(decoded.id).select('-password');

    if (!driver) {
      res.status(401).json({ message: 'Driver not found' });
      return;
    }

    req.driver = driver;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};