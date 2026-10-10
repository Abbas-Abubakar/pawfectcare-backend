import { body } from 'express-validator';
import { mongoIdParam } from './common.validator.js';

const VALID_GENDERS = ['male', 'female', 'unknown'];
const VALID_STATUS = ['available', 'pending', 'adopted'];

export const createListingValidator = [
  body('name').trim().notEmpty().withMessage('Pet name is required.'),
  body('species').trim().notEmpty().withMessage('Species is required.'),
  body('breed').optional().trim(),
  body('age').optional().trim(),
  body('gender').optional().isIn(VALID_GENDERS).withMessage('Invalid gender.'),
  body('description').optional().trim(),
  body('temperament').optional().trim(),
];

export const updateListingValidator = [
  mongoIdParam('id'),
  body('name').optional().trim().notEmpty().withMessage('Pet name cannot be empty.'),
  body('species').optional().trim().notEmpty().withMessage('Species cannot be empty.'),
  body('breed').optional().trim(),
  body('age').optional().trim(),
  body('gender').optional().isIn(VALID_GENDERS).withMessage('Invalid gender.'),
  body('description').optional().trim(),
  body('temperament').optional().trim(),
  body('status').optional().isIn(VALID_STATUS).withMessage('Invalid status.'),
];

export const listingIdParamValidator = [mongoIdParam('id')];

export const removePhotoParamValidator = [mongoIdParam('id'), mongoIdParam('photoId')];