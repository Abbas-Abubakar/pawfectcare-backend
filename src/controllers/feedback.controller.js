import Feedback from '../models/feedback.model.js';
import AppError from '../utils/appError.utils.js';
import asyncErrorHandler from '../utils/asyncErrorHandler.utils.js'
import { getPagination, buildPaginationMeta } from '../utils/pagination.utils.js';
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

  const { page, limit, skip } = getPagination(req.query);
  const [feedback, totalCount] = await Promise.all([
    Feedback.find()
      .populate('user', 'name role')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Feedback.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    count: feedback.length,
    pagination: buildPaginationMeta(page, limit, totalCount),
    feedback,
  });

});