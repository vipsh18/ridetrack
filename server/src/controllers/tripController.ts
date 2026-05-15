import { Request, Response } from 'express';
import Trip from '../models/Trip';
import { AuthRequest } from '../middleware/auth';

export const createTrip = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { passengerName, pickup, dropoff } = req.body;

    if (!passengerName || !pickup || !dropoff) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    const trip = await Trip.create({
      driver: req.driver._id,
      passengerName,
      pickup,
      dropoff
    });

    res.status(201).json(trip);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateTripStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'active', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ message: 'Invalid status' });
      return;
    }

    const trip = await Trip.findOne({ _id: id, driver: req.driver._id });
    if (!trip) {
      res.status(404).json({ message: 'Trip not found' });
      return;
    }

    trip.status = status;
    if (status === 'active') trip.startedAt = new Date();
    if (status === 'completed') trip.completedAt = new Date();

    await trip.save();
    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllTrips = async (_req: Request, res: Response): Promise<void> => {
  try {
    const trips = await Trip.find()
      .populate('driver', '-password')
      .sort({ createdAt: -1 });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};