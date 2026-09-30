import AdoptionListing from '../models/adoptionListing.model.js';
import AppError from '../utils/appError.utils.js';
import asyncErrorHandler from '../utils/asyncErrorHandler.utils.js'
import { uploadBufferToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryUpload.utils.js';

/**
 * @route   POST /api/adoptions
 * @desc    Shelter admin creates a new adoption listing, with multiple photos
 */
export const createListing = asyncErrorHandler(async (req, res) => {

    const { name, species, breed, age, gender, description, temperament } = req.body;

    if (!name || !species) {
      throw new AppError('Name and species are required.', 400);
    }

    let photos = [];
    if (req.files && req.files.length > 0) {
      photos = await Promise.all(
        req.files.map(async (file) => {
          const uploaded = await uploadBufferToCloudinary(file.buffer, 'pawfectcare/adoptions');
          return { url: uploaded.url, publicId: uploaded.publicId };
        })
      );
    }

    const listing = await AdoptionListing.create({
      shelter: req.user._id,
      name,
      species,
      breed,
      age,
      gender,
      description,
      temperament,
      photos,
    });

    res.status(201).json({
      success: true,
      message: 'Adoption listing created successfully.',
      listing,
    });

});

/**
 * @route   GET /api/adoptions
 * @desc    Browse adoption listings — public, supports ?species=, ?status=, ?search=
 */
export const getListings = asyncErrorHandler(async (req, res) => {
  
    const { species, status, search } = req.query;
    const filter = { isActive: true };

    if (species) filter.species = species;
    filter.status = status || 'available'; // default to only showing available pets
    if (search) filter.$text = { $search: search };

    const listings = await AdoptionListing.find(filter)
      .populate('shelter', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: listings.length,
      listings,
    });

});

/**
 * @route   GET /api/adoptions/:id
 */
export const getListingById = asyncErrorHandler(async (req, res) => {
 
    const listing = await AdoptionListing.findOne({
      _id: req.params.id,
      isActive: true,
    }).populate('shelter', 'name email phone');

    if (!listing) {
      throw new AppError('Adoption listing not found.', 404);
    }

    res.status(200).json({
      success: true,
      listing,
    });

});

/**
 * @route   GET /api/adoptions/my-listings
 * @desc    Shelter admin views their own listings (all statuses)
 */
export const getMyListings = asyncErrorHandler(async (req, res) => {

    const filter = { shelter: req.user._id, isActive: true };
    if (req.query.status) filter.status = req.query.status;

    const listings = await AdoptionListing.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: listings.length,
      listings,
    });

});

/**
 * @route   PATCH /api/adoptions/:id
 * @desc    Update a listing (shelter that posted it only)
 */
export const updateListing = asyncErrorHandler(async (req, res) => {

    const listing = await AdoptionListing.findOne({ _id: req.params.id, isActive: true });

    if (!listing) {
      throw new AppError('Adoption listing not found.', 404);
    }

    if (listing.shelter.toString() !== req.user._id.toString()) {
      throw new AppError('You do not have permission to update this listing.', 403);
    }

    const allowedFields = ['name', 'species', 'breed', 'age', 'gender', 'description', 'temperament', 'status'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        listing[field] = req.body[field];
      }
    });

    if (req.files && req.files.length > 0) {
      const newPhotos = await Promise.all(
        req.files.map(async (file) => {
          const uploaded = await uploadBufferToCloudinary(file.buffer, 'pawfectcare/adoptions');
          return { url: uploaded.url, publicId: uploaded.publicId };
        })
      );
      listing.photos.push(...newPhotos); // append new photos rather than replacing
    }

    await listing.save();

    res.status(200).json({
      success: true,
      message: 'Adoption listing updated successfully.',
      listing,
    });

});

/**
 * @route   DELETE /api/adoptions/:id/photos/:photoId
 * @desc    Remove a single photo from a listing
 */
export const removeListingPhoto = asyncErrorHandler(async (req, res) => {

    const { id, photoId } = req.params;

    const listing = await AdoptionListing.findOne({ _id: id, isActive: true });
    if (!listing) {
      throw new AppError('Adoption listing not found.', 404);
    }

    if (listing.shelter.toString() !== req.user._id.toString()) {
      throw new AppError('You do not have permission to modify this listing.', 403);
    }

    const photo = listing.photos.id(photoId);
    if (!photo) {
      throw new AppError('Photo not found.', 404);
    }

    await deleteFromCloudinary(photo.publicId);
    listing.photos.pull(photoId);
    await listing.save();

    res.status(200).json({
      success: true,
      message: 'Photo removed.',
      listing,
    });

});

/**
 * @route   DELETE /api/adoptions/:id
 * @desc    Soft-delete a listing (shelter that posted it only)
 */
export const deleteListing = asyncErrorHandler(async (req, res) => {

    const listing = await AdoptionListing.findOne({ _id: req.params.id, isActive: true });

    if (!listing) {
      throw new AppError('Adoption listing not found.', 404);
    }

    if (listing.shelter.toString() !== req.user._id.toString()) {
      throw new AppError('You do not have permission to delete this listing.', 403);
    }

    listing.isActive = false;
    await listing.save();

    res.status(200).json({
      success: true,
      message: 'Adoption listing deleted successfully.',
    });

});