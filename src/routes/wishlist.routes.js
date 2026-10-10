import { Router } from 'express';
import { getWishlist, addToWishlist, removeFromWishlist } from '../controllers/wishlist.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { productIdParamValidator } from '../validators/wishlist.validator.js';

const router = Router();

router.use(protect, restrictTo('pet_owner'));

router.get('/', getWishlist);
router.post('/:productId', productIdParamValidator, validate, addToWishlist);
router.delete('/:productId', productIdParamValidator, validate, removeFromWishlist);

export default router;