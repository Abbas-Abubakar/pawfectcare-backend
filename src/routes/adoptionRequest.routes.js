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
import { validate } from '../middleware/validate.middleware.js';
import {
  createRequestValidator,
  listingIdParamValidator,
  requestIdParamValidator,
  reviewRequestValidator,
} from '../validators/adoptionRequest.validator.js';

const router = Router();

router.use(protect);

router.post('/:listingId/requests', restrictTo('pet_owner'), createRequestValidator, validate, createRequest);
router.get('/my-requests', restrictTo('pet_owner'), getMyRequests);
router.patch('/requests/:id/withdraw', restrictTo('pet_owner'), requestIdParamValidator, validate, withdrawRequest);

router.get('/:listingId/requests', restrictTo('shelter_admin'), listingIdParamValidator, validate, getRequestsForListing);
router.patch('/requests/:id/approve', restrictTo('shelter_admin'), reviewRequestValidator, validate, approveRequest);
router.patch('/requests/:id/reject', restrictTo('shelter_admin'), reviewRequestValidator, validate, rejectRequest);

export default router;