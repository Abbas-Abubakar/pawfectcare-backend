import { Router } from 'express';
import {
  bookAppointment,
  getMyAppointments,
  getAppointmentById,
  rescheduleAppointment,
  cancelAppointment,
} from '../controllers/appointment.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.post('/', restrictTo('pet_owner'), bookAppointment);
router.get('/my-appointments', restrictTo('pet_owner'), getMyAppointments);
router.get('/:id', getAppointmentById); // owner or assigned vet
router.patch('/:id/reschedule', restrictTo('pet_owner'), rescheduleAppointment);
router.patch('/:id/cancel', cancelAppointment); // owner or vet

export default router;