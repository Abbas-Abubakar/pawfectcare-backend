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
router.get('/:id', listingIdParamValidator, validate, getListingById);

router.use(protect, restrictTo('shelter_admin'));
router.post('/', uploadMultiple('photos', 6), createListingValidator, validate, createListing);
router.get('/my-listings', getMyListings);
router.patch('/:id', uploadMultiple('photos', 6), updateListingValidator, validate, updateListing);
router.delete('/:id/photos/:photoId', removePhotoParamValidator, validate, removeListingPhoto);
router.delete('/:id', listingIdParamValidator, validate, deleteListing);

export default router;