import Appointment from '../models/appointment.model.js';
import VetAvailability from '../models/vetAvailability.model.js';
import Pet from '../models/pet.model.js';
import AppError from '../utils/appError.utils.js';
import asyncErrorHandler from '../utils/asyncErrorHandler.utils.js'
import { createNotification } from '../utils/notify.utils.js';

/**
 * @route   POST /api/appointments
 * @desc    Owner books an appointment against an open availability slot
 */
export const bookAppointment = asyncErrorHandler(async (req, res) => {

  const { petId, availabilityId, reason } = req.body;

  if (!petId || !availabilityId || !reason) {
    throw new AppError('Pet, availability slot, and reason are required.', 400);
  }

  const pet = await Pet.findOne({ _id: petId, owner: req.user._id, isActive: true });
  if (!pet) {
    throw new AppError('Pet not found or does not belong to you.', 404);
  }

  const slot = await VetAvailability.findById(availabilityId);
  if (!slot) {
    throw new AppError('Availability slot not found.', 404);
  }
  if (slot.isBooked) {
    throw new AppError('This slot has already been booked. Please choose another.', 409);
  }

  const appointment = await Appointment.create({
    pet: pet._id,
    owner: req.user._id,
    vet: slot.vet,
    availability: slot._id,
    date: slot.date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    reason,
  });

  slot.isBooked = true;
  await slot.save();

  res.status(201).json({
    success: true,
    message: 'Appointment booked successfully.',
    appointment,
  });

});

/**
 * @route   GET /api/appointments/my-appointments
 * @desc    Owner views their own appointments
 */
export const getMyAppointments = asyncErrorHandler(async (req, res) => {
  const filter = { owner: req.user._id };
  if (req.query.status) filter.status = req.query.status;

  const appointments = await Appointment.find(filter)
    .populate('pet', 'name species photo')
    .populate('vet', 'name email')
    .sort({ date: -1 });

  res.status(200).json({
    success: true,
    count: appointments.length,
    appointments,
  });

});

/**
 * @route   GET /api/appointments/:id
 * @desc    View a single appointment (owner or the assigned vet)
 */
export const getAppointmentById = asyncErrorHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('pet', 'name species photo')
    .populate('owner', 'name email phone')
    .populate('vet', 'name email');

  if (!appointment) {
    throw new AppError('Appointment not found.', 404);
  }

  const isOwner = appointment.owner._id.toString() === req.user._id.toString();
  const isVet = appointment.vet._id.toString() === req.user._id.toString();

  if (!isOwner && !isVet) {
    throw new AppError('You do not have permission to view this appointment.', 403);
  }

  res.status(200).json({
    success: true,
    appointment,
  });

});

/**
 * @route   PATCH /api/appointments/:id/reschedule
 * @desc    Owner reschedules to a different open slot
 */
export const rescheduleAppointment = asyncErrorHandler(async (req, res, next) => {
  const { newAvailabilityId } = req.body;

  if (!newAvailabilityId) {
    throw new AppError('A new availability slot is required.', 400);
  }

  const appointment = await Appointment.findOne({
    _id: req.params.id,
    owner: req.user._id,
  });

  if (!appointment) {
    throw new AppError('Appointment not found.', 404);
  }

  if (['completed', 'cancelled'].includes(appointment.status)) {
    throw new AppError(`Cannot reschedule an appointment that is ${appointment.status}.`, 400);
  }

  const newSlot = await VetAvailability.findById(newAvailabilityId);
  if (!newSlot) {
    throw new AppError('New availability slot not found.', 404);
  }
  if (newSlot.isBooked) {
    throw new AppError('That slot is already booked. Please choose another.', 409);
  }
  if (newSlot.vet.toString() !== appointment.vet.toString()) {
    throw new AppError('New slot must be with the same veterinarian.', 400);
  }

  // Free up the old slot
  const oldSlot = await VetAvailability.findById(appointment.availability);
  if (oldSlot) {
    oldSlot.isBooked = false;
    await oldSlot.save();
  }

  // Book the new slot
  newSlot.isBooked = true;
  await newSlot.save();

  appointment.availability = newSlot._id;
  appointment.date = newSlot.date;
  appointment.startTime = newSlot.startTime;
  appointment.endTime = newSlot.endTime;
  appointment.status = 'pending'; // requires vet re-confirmation after a change
  appointment.reminderSent = false;
  await appointment.save();

  res.status(200).json({
    success: true,
    message: 'Appointment rescheduled successfully.',
    appointment,
  });
});

/**
 * @route   PATCH /api/appointments/:id/cancel
 * @desc    Owner (or vet) cancels an appointment
 */
export const cancelAppointment = asyncErrorHandler(async (req, res, next) => {

  const { cancelReason } = req.body;

  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    throw new AppError('Appointment not found.', 404);
  }

  const isOwner = appointment.owner.toString() === req.user._id.toString();
  const isVet = appointment.vet.toString() === req.user._id.toString();

  if (!isOwner && !isVet) {
    throw new AppError('You do not have permission to cancel this appointment.', 403);
  }

  if (['completed', 'cancelled'].includes(appointment.status)) {
    throw new AppError(`Appointment is already ${appointment.status}.`, 400);
  }

  appointment.status = 'cancelled';
  appointment.cancelledBy = req.user._id;
  appointment.cancelReason = cancelReason || '';
  await appointment.save();

  // Free up the slot so someone else can book it
  const slot = await VetAvailability.findById(appointment.availability);
  if (slot) {
    slot.isBooked = false;
    await slot.save();
  }

  res.status(200).json({
    success: true,
    message: 'Appointment cancelled successfully.',
    appointment,
  });
});

/**
 * @route   PATCH /api/appointments/:id/confirm
 * @desc    Vet confirms a pending appointment
 */
export const confirmAppointment = asyncErrorHandler(async (req, res) => {
  const appointment = await Appointment.findOne({ _id: req.params.id, vet: req.user._id });

  if (!appointment) {
    throw new AppError('Appointment not found.', 404);
  }

  if (appointment.status !== 'pending') {
    throw new AppError(`Cannot confirm an appointment that is ${appointment.status}.`, 400);
  }

  appointment.status = 'confirmed';
  await appointment.save();

  await createNotification({
    userId: appointment.owner,
    type: 'appointment_status',
    title: 'Appointment Confirmed',
    message: `Your appointment on ${appointment.date.toDateString()} at ${appointment.startTime} has been confirmed.`,
    link: `/appointments/${appointment._id}`,
  });

  res.status(200).json({
    success: true,
    message: 'Appointment confirmed.',
    appointment,
  });

});

/**
 * @route   PATCH /api/appointments/:id/reject
 * @desc    Vet rejects a pending appointment (frees the slot, distinct from cancel)
 */
export const rejectAppointment = asyncErrorHandler(async (req, res) => {
  const { cancelReason } = req.body;

  const appointment = await Appointment.findOne({ _id: req.params.id, vet: req.user._id });

  if (!appointment) {
    throw new AppError('Appointment not found.', 404);
  }

  if (appointment.status !== 'pending') {
    throw new AppError(`Cannot reject an appointment that is ${appointment.status}.`, 400);
  }

  appointment.status = 'cancelled';
  appointment.cancelledBy = req.user._id;
  appointment.cancelReason = cancelReason || 'Rejected by veterinarian';
  await appointment.save();

  await createNotification({
    userId: appointment.owner,
    type: 'appointment_status',
    title: 'Appointment Rejected',
    message: `Your appointment request for ${appointment.date.toDateString()} was declined by the veterinarian.`,
    link: `/appointments/${appointment._id}`,
  });

  const slot = await VetAvailability.findById(appointment.availability);
  if (slot) {
    slot.isBooked = false;
    await slot.save();
  }

  res.status(200).json({
    success: true,
    message: 'Appointment rejected.',
    appointment,
  });

});

/**
 * @route   PATCH /api/appointments/:id/complete
 * @desc    Vet marks a confirmed appointment as completed (after the visit)
 */
export const completeAppointment = asyncErrorHandler(async (req, res) => {
  const appointment = await Appointment.findOne({ _id: req.params.id, vet: req.user._id });

  if (!appointment) {
    throw new AppError('Appointment not found.', 404);
  }

  if (appointment.status !== 'confirmed') {
    throw new AppError('Only confirmed appointments can be marked completed.', 400);
  }

  appointment.status = 'completed';
  await appointment.save();

  res.status(200).json({
    success: true,
    message: 'Appointment marked as completed.',
    appointment,
  });

});