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
import { validate } from '../middleware/validate.middleware.js';
import {
  bookAppointmentValidator,
  appointmentIdParamValidator,
  rescheduleAppointmentValidator,
  cancelAppointmentValidator,
  rejectAppointmentValidator,
} from '../validators/appointment.validator.js';
import medicalRecordRoutes from './medicalRecord.routes.js';

const router = Router();

router.use(protect);

router.post('/', restrictTo('pet_owner'), bookAppointmentValidator, validate, bookAppointment);
router.get('/my-appointments', restrictTo('pet_owner'), getMyAppointments);
router.get('/:id', appointmentIdParamValidator, validate, getAppointmentById);
router.patch('/:id/reschedule', restrictTo('pet_owner'), rescheduleAppointmentValidator, validate, rescheduleAppointment);
router.patch('/:id/cancel', cancelAppointmentValidator, validate, cancelAppointment);
router.patch('/:id/confirm', restrictTo('veterinarian'), appointmentIdParamValidator, validate, confirmAppointment);
router.patch('/:id/reject', restrictTo('veterinarian'), rejectAppointmentValidator, validate, rejectAppointment);
router.patch('/:id/complete', restrictTo('veterinarian'), appointmentIdParamValidator, validate, completeAppointment);

router.use('/:appointmentId/medical-record', medicalRecordRoutes);

export default router;