import AdoptionRequest from '../models/adoptionRequest.model.js';
import AdoptionListing from '../models/adoptionListing.model.js';
import Pet from '../models/pet.model.js';
import AppError from '../utils/appError.utils.js';
import asyncErrorHandler from '../utils/asyncErrorHandler.utils.js';
import { uploadBufferToCloudinary } from '../utils/cloudinaryUpload.utils.js'
import cloudinary from '../config/cloudinary.js'
/**
 * @route   POST /api/adoptions/:listingId/requests
 * @desc    Pet owner applies to adopt a listed pet
 */
export const createRequest = asyncErrorHandler(async (req, res, next) => {

  const { listingId } = req.params;
  const { message } = req.body;

  const listing = await AdoptionListing.findOne({ _id: listingId, isActive: true });
  if (!listing) {
    throw new AppError('Adoption listing not found.', 404);
  }

  if (listing.status !== 'available') {
    throw new AppError('This pet is not currently available for adoption.', 400);
  }

  const existing = await AdoptionRequest.findOne({
    listing: listingId,
    applicant: req.user._id,
    status: 'pending',
  });
  if (existing) {
    throw new AppError('You already have a pending request for this pet.', 409);
  }

  const request = await AdoptionRequest.create({
    listing: listingId,
    applicant: req.user._id,
    message,
  });

  res.status(201).json({
    success: true,
    message: 'Adoption request submitted successfully.',
    request,
  });

});

/**
 * @route   GET /api/adoptions/my-requests
 * @desc    Pet owner views their own submitted requests
 */
export const getMyRequests = asyncErrorHandler(async (req, res) => {

  const filter = { applicant: req.user._id };
  if (req.query.status) filter.status = req.query.status;

  const requests = await AdoptionRequest.find(filter)
    .populate('listing', 'name species breed photos status')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: requests.length,
    requests,
  });

});

/**
 * @route   PATCH /api/adoptions/requests/:id/withdraw
 * @desc    Pet owner withdraws their own pending request
 */
export const withdrawRequest = asyncErrorHandler(async (req, res) => {
  const request = await AdoptionRequest.findOne({
    _id: req.params.id,
    applicant: req.user._id,
  });

  if (!request) {
    throw new AppError('Adoption request not found.', 404);
  }

  if (request.status !== 'pending') {
    throw new AppError(`Cannot withdraw a request that is ${request.status}.`, 400);
  }

  request.status = 'withdrawn';
  await request.save();

  res.status(200).json({
    success: true,
    message: 'Adoption request withdrawn.',
    request,
  });

});

/**
 * @route   GET /api/adoptions/:listingId/requests
 * @desc    Shelter admin views all requests for one of their listings
 */
export const getRequestsForListing = asyncErrorHandler(async (req, res) => {

  const { listingId } = req.params;

  const listing = await AdoptionListing.findOne({ _id: listingId, shelter: req.user._id });
  if (!listing) {
    throw new AppError('Adoption listing not found or does not belong to you.', 404);
  }

  const filter = { listing: listingId };
  if (req.query.status) filter.status = req.query.status;

  const requests = await AdoptionRequest.find(filter)
    .populate('applicant', 'name email phone')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: requests.length,
    requests,
  });
});

/**
 * @route   PATCH /api/adoptions/requests/:id/approve
 * @desc    Shelter approves a request — marks listing adopted, creates a real Pet
 *          for the applicant, and auto-rejects any other pending requests for the same listing
 */
export const approveRequest = asyncErrorHandler(async (req, res) => {

  const { reviewNote } = req.body;

  const request = await AdoptionRequest.findById(req.params.id).populate('listing');
  if (!request) {
    throw new AppError('Adoption request not found.', 404);
  }

  if (request.listing.shelter.toString() !== req.user._id.toString()) {
    throw new AppError('You do not have permission to review this request.', 403);
  }

  if (request.status !== 'pending') {
    throw new AppError(`Cannot approve a request that is ${request.status}.`, 400);
  }

  const listing = request.listing;

  let petPhoto;
  if (listing.photos?.[0]) {
    // Re-upload by URL so the pet has its own independent Cloudinary asset
    const result = await cloudinary.uploader.upload(listing.photos[0].url, {
      folder: 'pawfectcare/pets',
    });
    petPhoto = { url: result.secure_url, publicId: result.public_id };
  }

  // Create a real Pet record for the new owner, seeded from the listing's info
  const pet = await Pet.create({
    owner: request.applicant,
    name: listing.name,
    species: listing.species,
    breed: listing.breed,
    gender: listing.gender,
    photo: petPhoto,
    notes: `Adopted from shelter listing "${listing.name}".`,
  });


  request.status = 'approved';
  request.reviewedBy = req.user._id;
  request.reviewNote = reviewNote;
  request.resultingPet = pet._id;
  await request.save();

  listing.status = 'adopted';
  await listing.save();

  // Auto-reject any other still-pending requests for the same listing
  await AdoptionRequest.updateMany(
    { listing: listing._id, status: 'pending', _id: { $ne: request._id } },
    {
      status: 'rejected',
      reviewedBy: req.user._id,
      reviewNote: 'This pet has been adopted by another applicant.',
    }
  );

  res.status(200).json({
    success: true,
    message: 'Adoption request approved. Pet has been adopted.',
    request,
    pet,
  });

});

/**
 * @route   PATCH /api/adoptions/requests/:id/reject
 * @desc    Shelter rejects a request
 */
export const rejectRequest = asyncErrorHandler(async (req, res) => {

  const { reviewNote } = req.body;

  const request = await AdoptionRequest.findById(req.params.id).populate('listing');
  if (!request) {
    throw new AppError('Adoption request not found.', 404);
  }

  if (request.listing.shelter.toString() !== req.user._id.toString()) {
    throw new AppError('You do not have permission to review this request.', 403);
  }

  if (request.status !== 'pending') {
    throw new AppError(`Cannot reject a request that is ${request.status}.`, 400);
  }

  request.status = 'rejected';
  request.reviewedBy = req.user._id;
  request.reviewNote = reviewNote;
  await request.save();

  res.status(200).json({
    success: true,
    message: 'Adoption request rejected.',
    request,
  });

});