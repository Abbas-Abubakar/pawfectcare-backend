import { Router } from 'express';
import {
  createStory,
  getStories,
  getStoryById,
  deleteStory,
} from '../controllers/successStory.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { uploadMultiple } from '../middleware/upload.middleware.js';

const router = Router();

router.get('/', getStories); // public
router.get('/:id', getStoryById);

router.use(protect, restrictTo('shelter_admin'));
router.post('/', uploadMultiple('photos', 6), createStory);
router.delete('/:id', deleteStory);

export default router;