import HealthRecord from '../models/healthRecord.model.js';
import Pet from '../models/pet.model.js';
import AppError from '../utils/appError.utils.js';
import asyncErrorHandler from '../utils/asyncErrorHandler.utils.js';

/**
 * Shared helper: confirms the pet exists and the requester is allowed to
 * access it (owner, or a vet/shelter admin).
 */
const getAuthorizedPet = async (petId, user) => {
  const pet = await Pet.findOne({ _id: petId, isActive: true });

  if (!pet) {
    throw new AppError('Pet not found.', 404);
  }

  const isOwner = pet.owner.toString() === user._id.toString();
  const isStaff = ['veterinarian', 'shelter_admin'].includes(user.role);

  if (!isOwner && !isStaff) {
    throw new AppError('You do not have permission to access this pet.', 403);
  }

  return pet;
};

/**
 * @route   POST /api/pets/:petId/health-records
 * @desc    Add a health record to a pet (owner or vet)
 */
export const createHealthRecord = asyncErrorHandler(async (req, res) => {
  const { petId } = req.params;
  await getAuthorizedPet(petId, req.user);

  const { type, title, description, dateAdministered, nextDueDate, severity } = req.body;

  if (!type || !title) {
    throw new AppError('Record type and title are required.', 400);
  }

  const record = await HealthRecord.create({
    pet: petId,
    addedBy: req.user._id,
    type,
    title,
    description,
    dateAdministered,
    nextDueDate,
    severity,
  });

  res.status(201).json({
    success: true,
    message: 'Health record added successfully.',
    record,
  });
});

/**
 * @route   GET /api/pets/:petId/health-records
 * @desc    Get all health records for a pet, optionally filtered by ?type=
 */
export const getHealthRecords = asyncErrorHandler(async (req, res) => {
  const { petId } = req.params;
  await getAuthorizedPet(petId, req.user);

  const filter = { pet: petId, isActive: true };
  if (req.query.type) {
    filter.type = req.query.type;
  }

  const records = await HealthRecord.find(filter)
    .sort({ dateAdministered: -1, createdAt: -1 })
    .populate('addedBy', 'name role');

  res.status(200).json({
    success: true,
    count: records.length,
    records,
  });
});

/**
 * @route   GET /api/pets/:petId/health-records/:recordId
 */
export const getHealthRecordById = asyncErrorHandler(async (req, res) => {
  const { petId, recordId } = req.params;
  await getAuthorizedPet(petId, req.user);

  const record = await HealthRecord.findOne({
    _id: recordId,
    pet: petId,
    isActive: true,
  }).populate('addedBy', 'name role');

  if (!record) {
    throw new AppError('Health record not found.', 404);
  }

  res.status(200).json({
    success: true,
    record,
  });

});

/**
 * @route   PATCH /api/pets/:petId/health-records/:recordId
 * @desc    Update a health record (owner or vet who can access the pet)
 */
export const updateHealthRecord = asyncErrorHandler(async (req, res) => {
  const { petId, recordId } = req.params;
  await getAuthorizedPet(petId, req.user);

  const record = await HealthRecord.findOne({
    _id: recordId,
    pet: petId,
    isActive: true,
  });

  if (!record) {
    throw new AppError('Health record not found.', 404);
  }

  const allowedFields = ['type', 'title', 'description', 'dateAdministered', 'nextDueDate', 'severity'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      record[field] = req.body[field];
    }
  });

  if (req.body.nextDueDate !== undefined) {
    record.reminderSentAt = undefined; // new due date → allow a fresh reminder
  }

  await record.save();

  res.status(200).json({
    success: true,
    message: 'Health record updated successfully.',
    record,
  });
});

/**
 * @route   DELETE /api/pets/:petId/health-records/:recordId
 * @desc    Soft-delete a health record
 */
export const deleteHealthRecord = asyncErrorHandler(async (req, res) => {
  const { petId, recordId } = req.params;
  await getAuthorizedPet(petId, req.user);

  const record = await HealthRecord.findOne({
    _id: recordId,
    pet: petId,
    isActive: true,
  });

  if (!record) {
    throw new AppError('Health record not found.', 404);
  }

  record.isActive = false;
  await record.save();

  res.status(200).json({
    success: true,
    message: 'Health record deleted successfully.',
  });
});