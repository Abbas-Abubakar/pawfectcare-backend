import Notification from '../models/notification.model.js';
import AppError from '../utils/appError.utils.js';
import asyncErrorHandler from '../utils/asyncErrorHandler.utils.js';

/**
 * @route   GET /api/notifications
 * @desc    Get the logged-in user's notifications, newest first
 */
export const getMyNotifications = asyncErrorHandler(async (req, res) => {

  const filter = { user: req.user._id };
  if (req.query.unreadOnly === 'true') filter.isRead = false;

  const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(50);
  const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });

  res.status(200).json({
    success: true,
    count: notifications.length,
    unreadCount,
    notifications,
  });

});

/**
 * @route   PATCH /api/notifications/:id/read
 */
export const markAsRead = asyncErrorHandler(async (req, res, next) => {

  const notification = await Notification.findOne({ _id: req.params.id, user: req.user._id });

  if (!notification) {
    throw new AppError('Notification not found.', 404);
  }

  notification.isRead = true;
  await notification.save();

  res.status(200).json({
    success: true,
    notification,
  });

});

/**
 * @route   PATCH /api/notifications/read-all
 */
export const markAllAsRead = asyncErrorHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read.',
  });

});

/**
 * @route   DELETE /api/notifications/:id
 */
export const deleteNotification = asyncErrorHandler(async (req, res) => {

  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!notification) {
    throw new AppError('Notification not found.', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Notification deleted.',
  });

});