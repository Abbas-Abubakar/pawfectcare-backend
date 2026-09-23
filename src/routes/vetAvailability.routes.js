import { Router } from 'express';
import {
  createAvailability,
  getMyAvailability,
  getVetOpenSlots,
  deleteAvailability,
} from '../controllers/vetAvailability.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.post('/', restrictTo('veterinarian'), createAvailability);
router.get('/my-slots', restrictTo('veterinarian'), getMyAvailability);
router.get('/vet/:vetId', getVetOpenSlots); // any authenticated user can view (owners need this to book)
router.delete('/:id', restrictTo('veterinarian'), deleteAvailability);

export default router;