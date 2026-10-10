import { Router } from 'express';
import {
  createAvailability,
  getMyAvailability,
  getVetOpenSlots,
  deleteAvailability,
} from '../controllers/vetAvailability.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createAvailabilityValidator,
  availabilityIdParamValidator,
  vetIdParamValidator,
} from '../validators/vetAvailability.validator.js';

const router = Router();

router.use(protect);

router.post('/', restrictTo('veterinarian'), createAvailabilityValidator, validate, createAvailability);
router.get('/my-slots', restrictTo('veterinarian'), getMyAvailability);
router.get('/vet/:vetId', vetIdParamValidator, validate, getVetOpenSlots);
router.delete('/:id', restrictTo('veterinarian'), availabilityIdParamValidator, validate, deleteAvailability);

export default router;