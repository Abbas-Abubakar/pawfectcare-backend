import VetAvailability from '../models/vetAvailability.model.js';
import AppError from '../utils/appError.utils.js';
import asyncErrorHandler from '../utils/asyncErrorHandler.utils.js';

/**
 * @route   POST /api/availability
 * @desc    Vet creates one or more availability slots for a given date
 */
export const createAvailability = asyncErrorHandler(async (req, res, next) => {

    const { date, slots } = req.body; // slots: [{ startTime, endTime }, ...]

    if (!date || !Array.isArray(slots) || slots.length === 0) {
      throw new AppError('Date and at least one time slot are required.', 400);
    }

    const docs = slots.map((slot) => ({
      vet: req.user._id,
      date,
      startTime: slot.startTime,
      endTime: slot.endTime,
    }));

    const created = await VetAvailability.insertMany(docs);

    res.status(201).json({
      success: true,
      message: 'Availability slots created successfully.',
      slots: created,
    });
});

/**
 * @route   GET /api/availability/my-slots
 * @desc    Vet views their own slots (booked + unbooked), optionally filtered by date range
 */
export const getMyAvailability = asyncErrorHandler(async (req, res, next) => {
    const filter = { vet: req.user._id };

    if (req.query.from || req.query.to) {
      filter.date = {};
      if (req.query.from) filter.date.$gte = new Date(req.query.from);
      if (req.query.to) filter.date.$lte = new Date(req.query.to);
    }

    const slots = await VetAvailability.find(filter).sort({ date: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      count: slots.length,
      slots,
    });

});

/**
 * @route   GET /api/availability/vet/:vetId
 * @desc    Pet owners view a specific vet's OPEN (unbooked) slots — for booking
 */
export const getVetOpenSlots = asyncErrorHandler(async (req, res, next) => {

    const { vetId } = req.params;
    const filter = { vet: vetId, isBooked: false };

    if (req.query.from || req.query.to) {
      filter.date = {};
      if (req.query.from) filter.date.$gte = new Date(req.query.from);
      if (req.query.to) filter.date.$lte = new Date(req.query.to);
    } else {
      // default: only show today and future slots
      filter.date = { $gte: new Date(new Date().setHours(0, 0, 0, 0)) };
    }

    const slots = await VetAvailability.find(filter).sort({ date: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      count: slots.length,
      slots,
    });

});

/**
 * @route   DELETE /api/availability/:id
 * @desc    Vet removes an unbooked slot
 */
export const deleteAvailability = asyncErrorHandler(async (req, res, next) => {
  const slot = await VetAvailability.findOne({ _id: req.params.id, vet: req.user._id });

    if (!slot) {
      throw new AppError('Availability slot not found.', 404);
    }

    if (slot.isBooked) {
      throw new AppError('Cannot delete a slot that is already booked.', 400);
    }

    await slot.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Availability slot removed.',
    });

});