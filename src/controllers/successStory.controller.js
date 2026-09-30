import SuccessStory from '../models/successStory.model.js';
import AdoptionRequest from '../models/adoptionRequest.model.js';
import AppError from '../utils/appError.utils.js';
import { uploadBufferToCloudinary } from '../utils/cloudinaryUpload.utils.js';

/**
 * @route   POST /api/success-stories
 * @desc    Shelter admin creates a success story from a completed adoption
 */
export const createStory = asyncErrorHandler(async (req, res) => {
 
    const { adoptionRequestId, title, story } = req.body;

    if (!adoptionRequestId || !title || !story) {
      throw new AppError('Adoption request, title, and story are required.', 400);
    }

    const adoptionRequest = await AdoptionRequest.findById(adoptionRequestId).populate('listing');
    if (!adoptionRequest) {
      throw new AppError('Adoption request not found.', 404);
    }

    if (adoptionRequest.status !== 'approved') {
      throw new AppError('A success story can only be created for an approved adoption.', 400);
    }

    if (adoptionRequest.listing.shelter.toString() !== req.user._id.toString()) {
      throw new AppError('You do not have permission to post this story.', 403);
    }

    const existing = await SuccessStory.findOne({ adoptionRequest: adoptionRequestId });
    if (existing) {
      throw new AppError('A success story already exists for this adoption.', 409);
    }

    let photos = [];
    if (req.files && req.files.length > 0) {
      photos = await Promise.all(
        req.files.map(async (file) => {
          const uploaded = await uploadBufferToCloudinary(file.buffer, 'pawfectcare/success-stories');
          return { url: uploaded.url, publicId: uploaded.publicId };
        })
      );
    }

    const newStory = await SuccessStory.create({
      shelter: req.user._id,
      adoptionRequest: adoptionRequestId,
      petName: adoptionRequest.listing.name,
      title,
      story,
      photos,
    });

    res.status(201).json({
      success: true,
      message: 'Success story published.',
      story: newStory,
    });

});

/**
 * @route   GET /api/success-stories
 * @desc    Public gallery — supports ?search=
 */
export const getStories = asyncErrorHandler(async (req, res) => {

    const filter = { isActive: true };
    if (req.query.search) filter.$text = { $search: req.query.search };

    const stories = await SuccessStory.find(filter)
      .populate('shelter', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: stories.length,
      stories,
    });
});

/**
 * @route   GET /api/success-stories/:id
 */
export const getStoryById = asyncErrorHandler(async (req, res) => {

    const story = await SuccessStory.findOne({ _id: req.params.id, isActive: true }).populate(
      'shelter',
      'name'
    );

    if (!story) {
      throw new AppError('Success story not found.', 404);
    }

    res.status(200).json({
      success: true,
      story,
    });

});

/**
 * @route   DELETE /api/success-stories/:id
 * @desc    Shelter admin removes their own story
 */
export const deleteStory = asyncErrorHandler(async (req, res) => {
    const story = await SuccessStory.findOne({ _id: req.params.id, isActive: true });

    if (!story) {
      throw new AppError('Success story not found.', 404);
    }

    if (story.shelter.toString() !== req.user._id.toString()) {
      throw new AppError('You do not have permission to delete this story.', 403);
    }

    story.isActive = false;
    await story.save();

    res.status(200).json({
      success: true,
      message: 'Success story removed.',
    });

});