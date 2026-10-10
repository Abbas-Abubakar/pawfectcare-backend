import { Router } from 'express';
import { submitFeedback, getAllFeedback } from '../controllers/feedback.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { submitFeedbackValidator } from '../validators/feedback.validator.js';

const router = Router();

router.use(protect);

router.post('/', submitFeedbackValidator, validate, submitFeedback);
router.get('/', restrictTo('shelter_admin', 'veterinarian'), getAllFeedback);

export default router;