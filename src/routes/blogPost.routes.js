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
import { validate } from '../middleware/validate.middleware.js';
import {
  createBlogPostValidator,
  updateBlogPostValidator,
  blogPostIdParamValidator,
} from '../validators/blogPost.validator.js';

const router = Router();

router.get('/', getBlogPosts);
router.get('/:id', blogPostIdParamValidator, validate, getBlogPostById);

router.use(protect, restrictTo('veterinarian', 'shelter_admin'));
router.post('/',  upload.single('coverImage'), createBlogPostValidator, validate, createBlogPost);
router.patch('/:id', upload.single('coverImage'), updateBlogPostValidator, validate, updateBlogPost);
router.delete('/:id', blogPostIdParamValidator, validate, deleteBlogPost);

export default router;