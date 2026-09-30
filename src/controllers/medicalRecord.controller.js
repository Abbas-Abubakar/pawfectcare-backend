import MedicalRecord from '../models/medicalRecord.model.js';
import Appointment from '../models/appointment.model.js';
import Pet from '../models/pet.model.js';
import AppError from '../utils/appError.utils.js';
import asyncErrorHandler from '../utils/asyncErrorHandler.utils.js';
import { uploadBufferToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryUpload.utils.js';

/**
 * @route   POST /api/appointments/:appointmentId/medical-record
 * @desc    Vet creates the medical record for a completed appointment,
 *          with optional file/image attachments (multiple)
 */
export const createMedicalRecord = asyncErrorHandler(async (req, res) => {

  const { appointmentId } = req.params;
  const { diagnosis, prescription, notes } = req.body;

  if (!diagnosis) {
    throw new AppError('Diagnosis is required.', 400);
  }

  const appointment = await Appointment.findOne({ _id: appointmentId, vet: req.user._id });
  if (!appointment) {
    throw new AppError('Appointment not found.', 404);
  }

  if (appointment.status !== 'completed') {
    throw new AppError('Medical records can only be added to completed appointments.', 400);
  }

  const existing = await MedicalRecord.findOne({ appointment: appointmentId });
  if (existing) {
    throw new AppError('A medical record already exists for this appointment. Use update instead.', 409);
  }

  let attachments = [];
  if (req.files && req.files.length > 0) {
    attachments = await Promise.all(
      req.files.map(async (file) => {
        const uploaded = await uploadBufferToCloudinary(file.buffer, 'pawfectcare/medical-records');
        return { url: uploaded.url, publicId: uploaded.publicId, fileType: file.mimetype };
      })
    );
  }

  const record = await MedicalRecord.create({
    appointment: appointmentId,
    pet: appointment.pet,
    vet: req.user._id,
    diagnosis,
    prescription,
    notes,
    attachments,
  });

  res.status(201).json({
    success: true,
    message: 'Medical record created successfully.',
    record,
  });

});

/**
 * @route   GET /api/appointments/:appointmentId/medical-record
 * @desc    View the medical record for an appointment (owner or the assigned vet)
 */
export const getMedicalRecordByAppointment = asyncErrorHandler(async (req, res) => {

  const { appointmentId } = req.params;

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    throw new AppError('Appointment not found.', 404);
  }

  const isOwner = appointment.owner.toString() === req.user._id.toString();
  const isVet = appointment.vet.toString() === req.user._id.toString();

  if (!isOwner && !isVet) {
    throw new AppError('You do not have permission to view this record.', 403);
  }

  const record = await MedicalRecord.findOne({
    appointment: appointmentId,
    isActive: true,
  }).populate('vet', 'name');

  if (!record) {
    throw new AppError('No medical record found for this appointment.', 404);
  }

  res.status(200).json({
    success: true,
    record,
  });

});

/**
 * @route   GET /api/pets/:petId/medical-records
 * @desc    Full medical history for a pet (owner or any vet/shelter admin, matching pet access rules)
 */
export const getPetMedicalHistory = asyncErrorHandler(async (req, res) => {

  const { petId } = req.params;

  const pet = await Pet.findOne({ _id: petId, isActive: true });
  if (!pet) {
    throw new AppError('Pet not found.', 404);
  }

  const isOwner = pet.owner.toString() === req.user._id.toString();
  const isStaff = ['veterinarian', 'shelter_admin'].includes(req.user.role);

  if (!isOwner && !isStaff) {
    throw new AppError('You do not have permission to view this pet.', 403);
  }

  const records = await MedicalRecord.find({ pet: petId, isActive: true })
    .populate('vet', 'name')
    .populate('appointment', 'date reason')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: records.length,
    records,
  });

});

/**
 * @route   PATCH /api/appointments/:appointmentId/medical-record
 * @desc    Vet updates their own medical record (e.g. corrections, adding attachments)
 */
export const updateMedicalRecord = asyncErrorHandler(async (req, res) => {

  const { appointmentId } = req.params;

  const record = await MedicalRecord.findOne({
    appointment: appointmentId,
    isActive: true,
  });

  if (!record) {
    throw new AppError('Medical record not found.', 404);
  }

  if (record.vet.toString() !== req.user._id.toString()) {
    throw new AppError('You do not have permission to update this record.', 403);
  }

  const allowedFields = ['diagnosis', 'prescription', 'notes'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      record[field] = req.body[field];
    }
  });

  if (req.files && req.files.length > 0) {
    const newAttachments = await Promise.all(
      req.files.map(async (file) => {
        const uploaded = await uploadBufferToCloudinary(file.buffer, 'pawfectcare/medical-records');
        return { url: uploaded.url, publicId: uploaded.publicId, fileType: file.mimetype };
      })
    );
    record.attachments.push(...newAttachments); // append, don't replace — preserves visit history
  }

  await record.save();

  res.status(200).json({
    success: true,
    message: 'Medical record updated successfully.',
    record,
  });

});