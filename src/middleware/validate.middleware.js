import { validationResult } from 'express-validator';
import AppError from '../utils/appError.utils.js';

/**
 * Runs after express-validator rule chains. If any validation failed,
 * collects all error messages into one AppError response instead of
 * letting each route handle validation differently.
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const messages = errors.array().map((err) => err.msg);
    return next(new AppError(messages.join(' '), 400));
  }

  next();
};