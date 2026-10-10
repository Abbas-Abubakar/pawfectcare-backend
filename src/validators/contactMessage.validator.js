import { body } from 'express-validator';
import { mongoIdParam } from './common.validator.js';

export const submitMessageValidator = [
  body('type').isIn(['contact', 'volunteer']).withMessage('Invalid message type.'),
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('email').trim().isEmail().withMessage('A valid email is required.').normalizeEmail(),
  body('phone').optional().trim(),
  body('subject').optional().trim(),
  body('message').trim().notEmpty().withMessage('Message is required.'),
  body('availability').optional().trim(),
];

export const updateStatusValidator = [
  mongoIdParam('id'),
  body('status').isIn(['new', 'reviewed', 'resolved']).withMessage('Invalid status.'),
];