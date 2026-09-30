import { Router } from 'express';
import {
  submitMessage,
  getMessages,
  updateMessageStatus,
} from '../controllers/contactMessage.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/', submitMessage); // public

router.use(protect, restrictTo('shelter_admin'));
router.get('/', getMessages);
router.patch('/:id/status', updateMessageStatus);

export default router;