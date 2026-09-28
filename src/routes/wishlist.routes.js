import { Router } from 'express';
import { getWishlist, addToWishlist, removeFromWishlist } from '../controllers/wishlist.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect, restrictTo('pet_owner'));

router.get('/', getWishlist);
router.post('/:productId', addToWishlist);
router.delete('/:productId', removeFromWishlist);

export default router;