import { Router } from 'express';
import {
  bookAppointment,
  getMyAppointments,
  getAppointmentById,
  rescheduleAppointment,
  cancelAppointment,
  confirmAppointment,
  rejectAppointment,
  completeAppointment,
} from '../controllers/appointment.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import medicalRecordRoutes from './medicalRecord.routes.js';

const router = Router();

router.use(protect);

router.use('/:appointmentId/medical-record', medicalRecordRoutes);

router.post('/', restrictTo('pet_owner'), bookAppointment);
router.get('/my-appointments', restrictTo('pet_owner'), getMyAppointments);
router.get('/:id', getAppointmentById);
router.patch('/:id/reschedule', restrictTo('pet_owner'), rescheduleAppointment);
router.patch('/:id/cancel', cancelAppointment);
router.patch('/:id/confirm', restrictTo('veterinarian'), confirmAppointment);
router.patch('/:id/reject', restrictTo('veterinarian'), rejectAppointment);
router.patch('/:id/complete', restrictTo('veterinarian'), completeAppointment);

export default router;