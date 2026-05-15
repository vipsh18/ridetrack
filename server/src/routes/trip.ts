import { Router } from 'express';
import { createTrip, updateTripStatus, getAllTrips } from '../controllers/tripController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/', protect, getAllTrips);
router.post('/', protect, createTrip);
router.patch('/:id/status', protect, updateTripStatus);

export default router;