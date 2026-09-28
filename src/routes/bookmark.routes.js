import { Router } from 'express';
import { getBookmarks, addBookmark, removeBookmark } from '../controllers/bookmark.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.get('/', getBookmarks);
router.post('/:postId', addBookmark);
router.delete('/:postId', removeBookmark);

export default router;