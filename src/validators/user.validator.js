import { body } from 'express-validator';

export const updateProfileValidator = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty.'),
  body('phone').optional().trim(),
];

export const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password is required.'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters.')
    .matches(/\d/)
    .withMessage('New password must contain at least one number.'),
];