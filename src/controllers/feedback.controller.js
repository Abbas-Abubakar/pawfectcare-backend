import Feedback from '../models/feedback.model.js';
import AppError from '../utils/appError.utils.js';
import asyncErrorHandler from '../utils/asyncErrorHandler.utils.js'
/**
 * @route   POST /api/feedback
 */
export const submitFeedback = asyncErrorHandler(async (req, res) => {

  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    throw new AppError('A rating between 1 and 5 is required.', 400);
  }

  const feedback = await Feedback.create({ user: req.user._id, rating, comment });

  res.status(201).json({
    success: true,
    message: 'Thank you for your feedback!',
    feedback,
  });

});

/**
 * @route   GET /api/feedback
 * @desc    Admin-facing view of all feedback (any staff role for now)
 */
export const getAllFeedback = asyncErrorHandler(async (req, res) => {

  const feedback = await Feedback.find().populate('user', 'name role').sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: feedback.length,
    feedback,
  });

});