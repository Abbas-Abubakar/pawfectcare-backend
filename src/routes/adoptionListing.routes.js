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
router.get('/:id', getListingById);

router.use(protect, restrictTo('shelter_admin'));
router.post('/', uploadMultiple('photos', 6), createListing);
router.get('/my-listings', getMyListings);
router.patch('/:id', uploadMultiple('photos', 6), updateListing);
router.delete('/:id/photos/:photoId', removeListingPhoto);
router.delete('/:id', deleteListing);

export default router;