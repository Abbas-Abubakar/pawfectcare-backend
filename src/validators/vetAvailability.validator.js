import { body } from 'express-validator';
import { mongoIdParam } from './common.validator.js';

const TIME_FORMAT = /^([01]\d|2[0-3]):[0-5]\d$/; 

export const createAvailabilityValidator = [
  body('date').isISO8601().withMessage('A valid date is required.').toDate(),
  body('slots').isArray({ min: 1 }).withMessage('At least one time slot is required.'),
  body('slots.*.startTime').matches(TIME_FORMAT).withMessage('Start time must be in HH:MM format.'),
  body('slots.*.endTime').matches(TIME_FORMAT).withMessage('End time must be in HH:MM format.'),
];

export const availabilityIdParamValidator = [mongoIdParam('id')];

export const vetIdParamValidator = [mongoIdParam('vetId')];