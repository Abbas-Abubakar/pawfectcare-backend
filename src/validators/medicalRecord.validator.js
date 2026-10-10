import { body } from 'express-validator';
import { mongoIdParam } from './common.validator.js';

export const appointmentIdParamValidator = [mongoIdParam('appointmentId')];

export const createMedicalRecordValidator = [
  mongoIdParam('appointmentId'),
  body('diagnosis').trim().notEmpty().withMessage('Diagnosis is required.'),
  body('prescription').optional().trim(),
  body('notes').optional().trim(),
];

export const updateMedicalRecordValidator = [
  mongoIdParam('appointmentId'),
  body('diagnosis').optional().trim().notEmpty().withMessage('Diagnosis cannot be empty.'),
  body('prescription').optional().trim(),
  body('notes').optional().trim(),
];