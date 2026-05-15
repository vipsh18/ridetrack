import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Driver from '../models/Driver';
import Trip from '../models/Trip';

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.json(req.driver);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllDrivers = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const drivers = await Driver.find().select('-password');
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateLocation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { lat, lng } = req.body;

    if (lat === undefined || lng === undefined) {
      res.status(400).json({ message: 'lat and lng are required' });
      return;
    }

    const driver = await Driver.findByIdAndUpdate(
      req.driver._id,
      {
        currentLocation: { lat, lng, updatedAt: new Date() },
        isActive: true
      },
      { new: true }
    ).select('-password');

    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getDriverTrips = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const trips = await Trip.find({ driver: req.driver._id }).sort({ createdAt: -1 });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};