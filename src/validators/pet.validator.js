import { body } from 'express-validator';
import { mongoIdParam } from './common.validator.js';

const VALID_GENDERS = ['male', 'female', 'unknown'];

export const createPetValidator = [
  body('name').trim().notEmpty().withMessage('Pet name is required.'),
  body('species').trim().notEmpty().withMessage('Species is required.'),
  body('breed').optional().trim(),
  body('gender').optional().isIn(VALID_GENDERS).withMessage('Invalid gender value.'),
  body('dateOfBirth').optional().isISO8601().withMessage('Date of birth must be a valid date.').toDate(),
  body('weight').optional().isFloat({ min: 0 }).withMessage('Weight must be a positive number.'),
  body('color').optional().trim(),
  body('notes').optional().trim(),
];

export const updatePetValidator = [
  body('name').optional().trim().notEmpty().withMessage('Pet name cannot be empty.'),
  body('species').optional().trim().notEmpty().withMessage('Species cannot be empty.'),
  body('breed').optional().trim(),
  body('gender').optional().isIn(VALID_GENDERS).withMessage('Invalid gender value.'),
  body('dateOfBirth').optional().isISO8601().withMessage('Date of birth must be a valid date.').toDate(),
  body('weight').optional().isFloat({ min: 0 }).withMessage('Weight must be a positive number.'),
  body('color').optional().trim(),
  body('notes').optional().trim(),
];

// For routes where the pet id is the `:id` param (e.g. GET/PATCH/DELETE /pets/:id)
export const petIdParamValidator = [mongoIdParam('id')];

// For nested routes where the pet id is `:petId` (e.g. /pets/:petId/medical-records)
export const petIdForNestedValidator = [mongoIdParam('petId')];