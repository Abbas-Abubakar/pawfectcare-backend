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
import { validate } from '../middleware/validate.middleware.js';
import {
  createProductValidator,
  updateProductValidator,
  productIdParamValidator,
} from '../validators/product.validator.js';

const router = Router();

router.get('/', getProducts);
router.get('/:id', productIdParamValidator, validate, getProductById);

router.use(protect);
router.post('/', restrictTo('shelter_admin'), upload.single('image'), createProductValidator, validate, createProduct);
router.patch('/:id', restrictTo('shelter_admin'), upload.single('image'), updateProductValidator, validate, updateProduct);
router.delete('/:id', restrictTo('shelter_admin'), productIdParamValidator, validate, deleteProduct);

export default router;