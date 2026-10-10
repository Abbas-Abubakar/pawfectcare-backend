import { Router } from 'express';
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../controllers/notification.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { notificationIdParamValidator } from '../validators/notification.validator.js';

const router = Router();

router.use(protect);

router.get('/', getMyNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', notificationIdParamValidator, validate, markAsRead);
router.delete('/:id', notificationIdParamValidator, validate, deleteNotification);

export default router;