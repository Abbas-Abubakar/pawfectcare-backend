import { Router } from 'express';
import {
  createBlogPost,
  getBlogPosts,
  getBlogPostById,
  updateBlogPost,
  deleteBlogPost,
} from '../controllers/blogPost.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

router.get('/', getBlogPosts); // public browsing, no login required
router.get('/:id', getBlogPostById);

router.use(protect);
router.post('/', restrictTo('veterinarian', 'shelter_admin'), upload.single('coverImage'), createBlogPost);
router.patch('/:id', restrictTo('veterinarian', 'shelter_admin'), upload.single('coverImage'), updateBlogPost);
router.delete('/:id', restrictTo('veterinarian', 'shelter_admin'), deleteBlogPost);

export default router;