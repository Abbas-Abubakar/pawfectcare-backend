import Pet from '../models/pet.model.js';
import AppError from '../utils/appError.utils.js';
import asyncErrorHandler from '../utils/asyncErrorHandler.utils.js'
import { uploadBufferToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryUpload.utils.js';
import { getPagination, buildPaginationMeta } from '../utils/pagination.utils.js';

/**
 * @route   POST /api/pets
 * @desc    Create a new pet profile for the logged-in owner
 */
export const createPet = asyncErrorHandler(async (req, res) => {

  const { name, species, breed, gender, dateOfBirth, weight, color, notes } = req.body;

  if (!name || !species) {
    throw new AppError('Pet name and species are required.', 400);
  }

  let photo = { url: '', publicId: '' };
  if (req.file) {
    const uploaded = await uploadBufferToCloudinary(req.file.buffer, 'pawfectcare/pets');
    photo = { url: uploaded.url, publicId: uploaded.publicId };
  }

  const pet = await Pet.create({
    owner: req.user._id,
    name,
    species,
    breed,
    gender,
    dateOfBirth,
    weight,
    color,
    notes,
    photo,
  });

  res.status(201).json({
    success: true,
    message: 'Pet profile created successfully.',
    pet,
  });
});

/**
 * @route   GET /api/pets
 * @desc    Get all pets belonging to the logged-in owner
 */
export const getMyPets = asyncErrorHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const [pets, totalCount] = await Promise.all([
    Pet.find({ owner: req.user._id, isActive: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Pet.countDocuments({ owner: req.user._id, isActive: true }),
  ]);

  res.status(200).json({
    success: true,
    count: pets.length,
    pagination: buildPaginationMeta(page, limit, totalCount),
    pets,
  });
});

/**
 * @route   GET /api/pets/:id
 * @desc    Get a single pet by id (must belong to the logged-in owner,
 *          or the requester is a vet/shelter admin — see note below)
 */
export const getPetById = async (req, res) => {
  try {
    const pet = await Pet.findOne({ _id: req.params.id, isActive: true });

    if (!pet) {
      throw new AppError('Pet not found.', 404);
    }

    // Owners can only view their own pets; vets/admins can view any (needed for
    // appointments/medical records). Adjust this if vets should be scoped to
    // only their assigned pets once appointments exist.
    const isOwner = pet.owner.toString() === req.user._id.toString();
    const isStaff = ['veterinarian', 'shelter_admin'].includes(req.user.role);

    if (!isOwner && !isStaff) {
      throw new AppError('You do not have permission to view this pet.', 403);
    }

    res.status(200).json({
      success: true,
      pet,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/pets/:id
 * @desc    Update a pet profile (owner only), optionally replacing the photo
 */
export const updatePet = async (req, res) => {
  try {
    const pet = await Pet.findOne({ _id: req.params.id, isActive: true });

    if (!pet) {
      throw new AppError('Pet not found.', 404);
    }

    if (pet.owner.toString() !== req.user._id.toString()) {
      throw new AppError('You do not have permission to update this pet.', 403);
    }

    const allowedFields = ['name', 'species', 'breed', 'gender', 'dateOfBirth', 'weight', 'color', 'notes'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        pet[field] = req.body[field];
      }
    });

    if (req.file) {
      // Remove old photo from Cloudinary before uploading the new one
      if (pet.photo?.publicId) {
        await deleteFromCloudinary(pet.photo.publicId);
      }
      const uploaded = await uploadBufferToCloudinary(req.file.buffer, 'pawfectcare/pets');
      pet.photo = { url: uploaded.url, publicId: uploaded.publicId };
    }

    await pet.save();

    res.status(200).json({
      success: true,
      message: 'Pet profile updated successfully.',
      pet,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/pets/:id
 * @desc    Soft-delete a pet profile (owner only)
 */
export const deletePet = async (req, res, next) => {
  try {
    const pet = await Pet.findOne({ _id: req.params.id, isActive: true });

    if (!pet) {
      throw new AppError('Pet not found.', 404);
    }

    if (pet.owner.toString() !== req.user._id.toString()) {
      throw new AppError('You do not have permission to delete this pet.', 403);
    }

    pet.isActive = false;
    await pet.save();

    res.status(200).json({
      success: true,
      message: 'Pet profile deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};