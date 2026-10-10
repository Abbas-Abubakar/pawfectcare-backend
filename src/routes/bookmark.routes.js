import { Router } from 'express';
import { getBookmarks, addBookmark, removeBookmark } from '../controllers/bookmark.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { postIdParamValidator } from '../validators/bookmark.validator.js';

const router = Router();

router.use(protect);

router.get('/', getBookmarks);
router.post('/:postId', postIdParamValidator, validate, addBookmark);
router.delete('/:postId', postIdParamValidator, validate, removeBookmark);

export default router;