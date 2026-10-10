import { body } from 'express-validator';
import { mongoIdParam } from './common.validator.js';

const VALID_CATEGORIES = ['nutrition', 'health', 'training', 'grooming', 'adoption', 'general'];

export const createBlogPostValidator = [
  body('title').trim().notEmpty().withMessage('Title is required.'),
  body('content').trim().notEmpty().withMessage('Content is required.'),
  body('category').isIn(VALID_CATEGORIES).withMessage('Invalid category.'),
  body('excerpt').optional().trim().isLength({ max: 300 }).withMessage('Excerpt must be under 300 characters.'),
];

export const updateBlogPostValidator = [
  mongoIdParam('id'),
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty.'),
  body('content').optional().trim().notEmpty().withMessage('Content cannot be empty.'),
  body('category').optional().isIn(VALID_CATEGORIES).withMessage('Invalid category.'),
  body('excerpt').optional().trim().isLength({ max: 300 }).withMessage('Excerpt must be under 300 characters.'),
];

export const blogPostIdParamValidator = [mongoIdParam('id')];