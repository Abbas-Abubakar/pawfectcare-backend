import Notification from '../models/notification.model.js';

export const createNotification = async ({ userId, type, title, message, link }) => {
  return Notification.create({ user: userId, type, title, message, link });
};