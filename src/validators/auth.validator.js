import { body } from 'express-validator';

export const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('email').trim().isEmail().withMessage('A valid email is required.').normalizeEmail(),
  body('phone').optional().trim().isMobilePhone('any').withMessage('A valid phone number is required.'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters.')
    .matches(/\d/)
    .withMessage('Password must contain at least one number.'),
  body('role')
    .isIn(['pet_owner', 'veterinarian', 'shelter_admin'])
    .withMessage('Role must be pet_owner, veterinarian, or shelter_admin.'),
];

export const loginValidator = [
  body('email').trim().isEmail().withMessage('A valid email is required.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
];

export const verifyOtpValidator = [
  body('email').trim().isEmail().withMessage('A valid email is required.').normalizeEmail(),
  body('otp')
    .trim()
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits.')
    .isNumeric()
    .withMessage('OTP must contain only numbers.'),
];

export const resendOtpValidator = [
  body('email').trim().isEmail().withMessage('A valid email is required.').normalizeEmail(),
];

export const forgotPasswordValidator = [
  body('email').trim().isEmail().withMessage('A valid email is required.').normalizeEmail(),
];


export const resetPasswordValidator = [
  body('token').trim().notEmpty().withMessage('Reset token is required.'),
  body('email').trim().isEmail().withMessage('A valid email is required.').normalizeEmail(),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters.')
    .matches(/\d/)
    .withMessage('Password must contain at least one number.'),
];