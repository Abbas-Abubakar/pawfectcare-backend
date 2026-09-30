import { Router } from 'express';
import {
  createRequest,
  getMyRequests,
  withdrawRequest,
  getRequestsForListing,
  approveRequest,
  rejectRequest,
} from '../controllers/adoptionRequest.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.post('/:listingId/requests', restrictTo('pet_owner'), createRequest);
router.get('/my-requests', restrictTo('pet_owner'), getMyRequests);
router.patch('/requests/:id/withdraw', restrictTo('pet_owner'), withdrawRequest);

router.get('/:listingId/requests', restrictTo('shelter_admin'), getRequestsForListing);
router.patch('/requests/:id/approve', restrictTo('shelter_admin'), approveRequest);
router.patch('/requests/:id/reject', restrictTo('shelter_admin'), rejectRequest);

export default router;