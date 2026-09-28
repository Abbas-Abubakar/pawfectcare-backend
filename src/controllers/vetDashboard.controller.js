import Appointment from '../models/appointment.model.js';
import Pet from '../models/pet.model.js'
import asyncErrorHandler from '../utils/asyncErrorHandler.utils.js';
/**
 * @route   GET /api/vet/dashboard/today
 * @desc    Vet's appointments for today
 */
export const getTodayAppointments = asyncErrorHandler(async (req, res) => {

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const appointments = await Appointment.find({
    vet: req.user._id,
    date: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['pending', 'confirmed'] },
  })
    .populate('pet', 'name species breed photo')
    .populate('owner', 'name phone email')
    .sort({ startTime: 1 });

  res.status(200).json({
    success: true,
    count: appointments.length,
    appointments,
  });

});

/**
 * @route   GET /api/vet/dashboard/appointments
 * @desc    All of the vet's appointments, filterable by ?status= and date range
 */
export const getVetAppointments = asyncErrorHandler(async (req, res) => {

  const filter = { vet: req.user._id };

  if (req.query.status) filter.status = req.query.status;
  if (req.query.from || req.query.to) {
    filter.date = {};
    if (req.query.from) filter.date.$gte = new Date(req.query.from);
    if (req.query.to) filter.date.$lte = new Date(req.query.to);
  }

  const appointments = await Appointment.find(filter)
    .populate('pet', 'name species breed photo')
    .populate('owner', 'name phone email')
    .sort({ date: -1, startTime: 1 });

  res.status(200).json({
    success: true,
    count: appointments.length,
    appointments,
  });

});

/**
 * @route   GET /api/vet/dashboard/assigned-pets
 * @desc    Distinct list of pets this vet has ever had an appointment with
 */
export const getAssignedPets = asyncErrorHandler(async (req, res) => {

  // Find distinct pet IDs from this vet's appointment history, then fetch full pet docs
  const petIds = await Appointment.distinct('pet', { vet: req.user._id });

  const pets = await Pet.find({ _id: { $in: petIds }, isActive: true }).populate(
    'owner',
    'name email phone'
  );

  res.status(200).json({
    success: true,
    count: pets.length,
    pets,
  });

});