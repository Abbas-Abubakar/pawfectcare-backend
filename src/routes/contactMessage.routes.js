import { Router } from 'express';
import { submitMessage, getMessages, updateMessageStatus } from '../controllers/contactMessage.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { submitMessageValidator, updateStatusValidator } from '../validators/contactMessage.validator.js';

const router = Router();

router.post('/', submitMessageValidator, validate, submitMessage);

router.use(protect, restrictTo('shelter_admin'));
router.get('/', getMessages);
router.patch('/:id/status', updateStatusValidator, validate, updateMessageStatus);

export default router;