import { Router } from 'express';
import {
  getMe,
  getAllDrivers,
  updateLocation,
  getDriverTrips
} from '../controllers/driverController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/me', protect, getMe);
router.get('/', protect, getAllDrivers);
router.patch('/location', protect, updateLocation);
router.get('/trips', protect, getDriverTrips);

export default router;