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

const router = Router();

router.get('/', getListings); // public browsing


router.post('/', protect, restrictTo('shelter_admin'), uploadMultiple('photos', 6), createListing);
router.get('/my-listings',protect, restrictTo('shelter_admin'),  getMyListings);

router.get('/:id', getListingById);
router.patch('/:id', protect, restrictTo('shelter_admin'), uploadMultiple('photos', 6), updateListing);
router.delete('/:id/photos/:photoId', protect, restrictTo('shelter_admin'), removeListingPhoto);
router.delete('/:id', protect, restrictTo('shelter_admin'), deleteListing);

export default router;