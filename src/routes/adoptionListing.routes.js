import { Router } from 'express';
import {
  createListing,
  getListings,
  getListingById,
  getMyListings,
  updateListing,
  removeListingPhoto,
  deleteListing,
} from '../controllers/adoptionListing.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { uploadMultiple } from '../middleware/upload.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createListingValidator,
  updateListingValidator,
  listingIdParamValidator,
  removePhotoParamValidator,
} from '../validators/adoptionListing.validator.js';

const router = Router();

router.get('/', getListings);

router.post('/', protect, restrictTo('shelter_admin'), uploadMultiple('photos', 6), createListingValidator, validate, createListing);
router.get('/my-listings', protect, restrictTo('shelter_admin'), getMyListings);
router.get('/:id', listingIdParamValidator, validate, getListingById);
router.patch('/:id', protect, restrictTo('shelter_admin'), uploadMultiple('photos', 6), updateListingValidator, validate, updateListing);
router.delete('/:id/photos/:photoId', protect, restrictTo('shelter_admin'), removePhotoParamValidator, validate, removeListingPhoto);
router.delete('/:id', listingIdParamValidator, protect, restrictTo('shelter_admin'), validate, deleteListing);

export default router;