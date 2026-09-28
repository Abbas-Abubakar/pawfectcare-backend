import { Router } from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

router.get('/', getProducts); // public-ish, but still requires login for now (see note below)
router.get('/:id', getProductById);

router.use(protect);
router.post('/', restrictTo('shelter_admin'), upload.single('image'), createProduct);
router.patch('/:id', restrictTo('shelter_admin'), upload.single('image'), updateProduct);
router.delete('/:id', restrictTo('shelter_admin'), deleteProduct);

export default router;