import { Router } from 'express';
import { submitFeedback, getAllFeedback } from '../controllers/feedback.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.post('/', submitFeedback);
router.get('/', restrictTo('shelter_admin', 'veterinarian'), getAllFeedback);

export default router;