import { body } from 'express-validator';
import { mongoIdParam } from './common.validator.js';

const VALID_TYPES = ['vaccination', 'deworming', 'allergy', 'checkup', 'other'];
const VALID_SEVERITY = ['mild', 'moderate', 'severe'];

export const petIdParamValidator = [mongoIdParam('petId')];

export const recordIdParamValidator = [mongoIdParam('petId'), mongoIdParam('recordId')];

export const createHealthRecordValidator = [
  mongoIdParam('petId'),
  body('type').isIn(VALID_TYPES).withMessage('Invalid record type.'),
  body('title').trim().notEmpty().withMessage('Title is required.'),
  body('description').optional().trim(),
  body('dateAdministered').optional().isISO8601().withMessage('Invalid date.').toDate(),
  body('nextDueDate').optional().isISO8601().withMessage('Invalid date.').toDate(),
  body('severity').optional().isIn(VALID_SEVERITY).withMessage('Invalid severity.'),
];

export const updateHealthRecordValidator = [
  mongoIdParam('petId'),
  mongoIdParam('recordId'),
  body('type').optional().isIn(VALID_TYPES).withMessage('Invalid record type.'),
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty.'),
  body('description').optional().trim(),
  body('dateAdministered').optional().isISO8601().withMessage('Invalid date.').toDate(),
  body('nextDueDate').optional().isISO8601().withMessage('Invalid date.').toDate(),
  body('severity').optional().isIn(VALID_SEVERITY).withMessage('Invalid severity.'),
];