import { Router } from 'express';
import {
  getTodayAppointments,
  getVetAppointments,
  getAssignedPets,
} from '../controllers/vetDashboard.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect, restrictTo('veterinarian'));

router.get('/today', getTodayAppointments);
router.get('/appointments', getVetAppointments);
router.get('/assigned-pets', getAssignedPets);

export default router;