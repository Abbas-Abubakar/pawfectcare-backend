import ContactMessage from '../models/contactMessage.model.js';
import AppError from '../utils/appError.utils.js';
import asyncErrorHandler from '../utils/asyncErrorHandler.utils.js'

/**
 * @route   POST /api/contact
 * @desc    Submit a contact or volunteer message — public, no auth required
 */
export const submitMessage = asyncErrorHandler(async (req, res) => {
    const { type, name, email, phone, subject, message, availability } = req.body;

    if (!type || !name || !email || !message) {
      throw new AppError('Type, name, email, and message are required.', 400);
    }

    if (!['contact', 'volunteer'].includes(type)) {
      throw new AppError('Invalid message type.', 400);
    }

    const entry = await ContactMessage.create({
      type,
      name,
      email,
      phone,
      subject,
      message,
      availability,
    });

    res.status(201).json({
      success: true,
      message: 'Your message has been submitted. We will get back to you soon.',
      id: entry._id,
    });

});

/**
 * @route   GET /api/contact
 * @desc    Shelter admin views submissions — supports ?type=, ?status=
 */
export const getMessages = asyncErrorHandler(async (req, res) => {

    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.status) filter.status = req.query.status;

    const messages = await ContactMessage.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });

});

/**
 * @route   PATCH /api/contact/:id/status
 * @desc    Shelter admin updates a message's review status
 */
export const updateMessageStatus = asyncErrorHandler(async (req, res) => {

    const { status } = req.body;

    if (!['new', 'reviewed', 'resolved'].includes(status)) {
      throw new AppError('Invalid status.', 400);
    }

   const message = await ContactMessage.findById(req.params.id);
    if (!message) {
      throw new AppError('Message not found.', 404);
    }

    message.status = status;
    await message.save();

    res.status(200).json({
      success: true,
      message: 'Status updated.',
      data: message,
    });

});