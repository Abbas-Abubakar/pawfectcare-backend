import { body } from 'express-validator';
import { mongoIdParam } from './common.validator.js';

export const bookAppointmentValidator = [
  body('petId').isMongoId().withMessage('Valid pet is required.'),
  body('availabilityId').isMongoId().withMessage('Valid availability slot is required.'),
  body('reason').trim().notEmpty().withMessage('Reason for visit is required.'),
];

export const appointmentIdParamValidator = [mongoIdParam('id')];

export const rescheduleAppointmentValidator = [
  mongoIdParam('id'),
  body('newAvailabilityId').isMongoId().withMessage('Valid availability slot is required.'),
];

export const cancelAppointmentValidator = [
  mongoIdParam('id'),
  body('cancelReason').optional().trim(),
];

export const rejectAppointmentValidator = [
  mongoIdParam('id'),
  body('cancelReason').optional().trim(),
];