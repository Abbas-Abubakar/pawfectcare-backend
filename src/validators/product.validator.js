import { body } from 'express-validator';
import { mongoIdParam } from './common.validator.js';

const VALID_CATEGORIES = ['food', 'toys', 'grooming', 'accessories', 'health', 'other'];

export const createProductValidator = [
  body('name').trim().notEmpty().withMessage('Product name is required.'),
  body('category').isIn(VALID_CATEGORIES).withMessage('Invalid category.'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number.'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer.'),
  body('description').optional().trim(),
];

export const updateProductValidator = [
  mongoIdParam('id'),
  body('name').optional().trim().notEmpty().withMessage('Product name cannot be empty.'),
  body('category').optional().isIn(VALID_CATEGORIES).withMessage('Invalid category.'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number.'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer.'),
  body('description').optional().trim(),
];

export const productIdParamValidator = [mongoIdParam('id')];