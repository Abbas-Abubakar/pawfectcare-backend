import { Router } from 'express';
import { createStory, getStories, getStoryById, deleteStory } from '../controllers/successStory.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { uploadMultiple } from '../middleware/upload.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createStoryValidator, storyIdParamValidator } from '../validators/successStory.validator.js';

const router = Router();

router.get('/', getStories);
router.get('/:id', storyIdParamValidator, validate, getStoryById);

router.use(protect, restrictTo('shelter_admin'));
router.post('/', uploadMultiple('photos', 6), createStoryValidator, validate, createStory);
router.delete('/:id', storyIdParamValidator, validate, deleteStory);

export default router;